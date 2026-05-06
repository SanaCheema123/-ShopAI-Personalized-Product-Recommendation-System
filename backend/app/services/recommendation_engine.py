"""
AIVONEX Hybrid Recommendation Engine
=====================================
Combines:
  1. Collaborative Filtering  (Matrix Factorization - ALS-like)
  2. Content-Based Filtering  (TF-IDF + Cosine Similarity on tags/features)
  3. Popularity Baseline       (for cold-start users)
  4. Hybrid Weighted Blend     (CF * 0.6 + CBF * 0.4)
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from typing import List, Dict, Tuple
from app.models.models import Product, Interaction, User
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class ContentBasedFilter:
    """Builds a TF-IDF product similarity matrix from tags, category, brand."""

    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.similarity_matrix = None
        self.product_ids = []
        self.product_index = {}

    def build(self, products: List[Product]):
        if not products:
            return
        self.product_ids = [p.id for p in products]
        self.product_index = {pid: idx for idx, pid in enumerate(self.product_ids)}

        corpus = []
        for p in products:
            tags = " ".join(p.tags or [])
            brand = p.brand or ""
            desc = (p.description or "")[:200]
            text = f"{p.name} {brand} {tags} {desc}"
            corpus.append(text.lower())

        tfidf_matrix = self.vectorizer.fit_transform(corpus)
        self.similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
        logger.info(f"CBF: built {len(products)}x{len(products)} similarity matrix")

    def get_similar(self, product_id: int, n: int = 10) -> List[Tuple[int, float]]:
        if product_id not in self.product_index or self.similarity_matrix is None:
            return []
        idx = self.product_index[product_id]
        scores = list(enumerate(self.similarity_matrix[idx]))
        scores = sorted(scores, key=lambda x: x[1], reverse=True)
        results = []
        for i, score in scores[1:n+1]:  # skip self
            results.append((self.product_ids[i], float(score)))
        return results

    def get_user_profile_recommendations(self, interacted_product_ids: List[int], n: int = 10) -> List[Tuple[int, float]]:
        """Average the similarity vectors of products the user interacted with."""
        if self.similarity_matrix is None or not interacted_product_ids:
            return []

        valid_indices = [self.product_index[pid] for pid in interacted_product_ids if pid in self.product_index]
        if not valid_indices:
            return []

        profile_vector = np.mean(self.similarity_matrix[valid_indices], axis=0)
        scores = list(enumerate(profile_vector))
        scores = sorted(scores, key=lambda x: x[1], reverse=True)

        results = []
        for i, score in scores:
            pid = self.product_ids[i]
            if pid not in interacted_product_ids:
                results.append((pid, float(score)))
            if len(results) >= n:
                break
        return results


class CollaborativeFilter:
    """
    Lightweight Matrix Factorization using SGD.
    Learns user and item latent factor matrices from implicit feedback.
    """

    def __init__(self, n_factors: int = 20, lr: float = 0.01, reg: float = 0.01, epochs: int = 50):
        self.n_factors = n_factors
        self.lr = lr
        self.reg = reg
        self.epochs = epochs
        self.user_factors = {}
        self.item_factors = {}
        self.user_index = {}
        self.item_index = {}
        self.global_mean = 0.0
        self.is_trained = False

    def _build_matrix(self, interactions: List[Dict]) -> Tuple[np.ndarray, List, List]:
        users = list({i["user_id"] for i in interactions})
        items = list({i["product_id"] for i in interactions})
        self.user_index = {u: i for i, u in enumerate(users)}
        self.item_index = {it: i for i, it in enumerate(items)}

        matrix = np.zeros((len(users), len(items)))
        for inter in interactions:
            u = self.user_index[inter["user_id"]]
            it = self.item_index[inter["product_id"]]
            matrix[u][it] = inter["implicit_score"]

        return matrix, users, items

    def fit(self, interactions: List[Dict]):
        if len(interactions) < 10:
            logger.warning("CF: insufficient data, skipping training")
            return

        matrix, users, items = self._build_matrix(interactions)
        n_users, n_items = matrix.shape
        self.global_mean = matrix[matrix > 0].mean() if matrix[matrix > 0].size > 0 else 2.5

        # Initialize random latent factors
        np.random.seed(42)
        U = np.random.normal(0, 0.1, (n_users, self.n_factors))
        V = np.random.normal(0, 0.1, (n_items, self.n_factors))

        # SGD training
        mask = matrix > 0
        for epoch in range(self.epochs):
            for u_idx in range(n_users):
                for i_idx in range(n_items):
                    if mask[u_idx, i_idx]:
                        pred = self.global_mean + U[u_idx] @ V[i_idx]
                        error = matrix[u_idx, i_idx] - pred
                        U[u_idx] += self.lr * (error * V[i_idx] - self.reg * U[u_idx])
                        V[i_idx] += self.lr * (error * U[u_idx] - self.reg * V[i_idx])

        # Store as dicts
        for uid, idx in self.user_index.items():
            self.user_factors[uid] = U[idx]
        for iid, idx in self.item_index.items():
            self.item_factors[iid] = V[idx]

        self.is_trained = True
        logger.info(f"CF: trained on {n_users} users, {n_items} items")

    def predict(self, user_id: int, product_ids: List[int]) -> List[Tuple[int, float]]:
        if not self.is_trained or user_id not in self.user_factors:
            return []
        u_vec = self.user_factors[user_id]
        results = []
        for pid in product_ids:
            if pid in self.item_factors:
                score = float(self.global_mean + u_vec @ self.item_factors[pid])
                results.append((pid, max(0.0, score)))
        return sorted(results, key=lambda x: x[1], reverse=True)


class HybridRecommender:
    """
    Blends Content-Based and Collaborative Filtering recommendations.
    Falls back to popularity for new/cold-start users.
    """

    def __init__(self):
        self.cbf = ContentBasedFilter()
        self.cf = CollaborativeFilter(
            n_factors=settings.MATRIX_FACTORS,
            lr=settings.LEARNING_RATE,
            reg=settings.REGULARIZATION,
            epochs=settings.EPOCHS,
        )
        self._initialized = False

    def initialize(self, db: Session):
        """Load all products and interactions, train models."""
        products = db.query(Product).filter(Product.is_active == True).all()
        interactions = db.query(Interaction).all()
        interaction_dicts = [
            {"user_id": i.user_id, "product_id": i.product_id, "implicit_score": i.implicit_score}
            for i in interactions
        ]
        self.cbf.build(products)
        self.cf.fit(interaction_dicts)
        self._initialized = True
        logger.info("✅ HybridRecommender initialized")

    def recommend(
        self,
        db: Session,
        user_id: int,
        n: int = 10,
        category_filter: str = None,
        exclude_ids: List[int] = None,
    ) -> List[Dict]:
        exclude_ids = set(exclude_ids or [])

        # Get user's interaction history
        user_interactions = db.query(Interaction).filter(Interaction.user_id == user_id).all()
        interacted_ids = {i.product_id for i in user_interactions}
        all_product_ids = [p.id for p in db.query(Product.id).filter(Product.is_active == True).all()]
        candidate_ids = [pid for pid in all_product_ids if pid not in interacted_ids and pid not in exclude_ids]

        cf_weight  = settings.COLLABORATIVE_WEIGHT
        cbf_weight = settings.CONTENT_WEIGHT

        scores: Dict[int, float] = {}

        if len(user_interactions) >= settings.MIN_INTERACTIONS_FOR_CF and self.cf.is_trained:
            # Collaborative filtering scores
            cf_scores = self.cf.predict(user_id, candidate_ids)
            max_cf = max([s for _, s in cf_scores], default=1.0) or 1.0
            for pid, score in cf_scores:
                scores[pid] = scores.get(pid, 0) + cf_weight * (score / max_cf)

        if interacted_ids:
            # Content-based scores
            cbf_scores = self.cbf.get_user_profile_recommendations(list(interacted_ids), n=len(candidate_ids))
            max_cbf = max([s for _, s in cbf_scores], default=1.0) or 1.0
            for pid, score in cbf_scores:
                if pid in candidate_ids or pid not in exclude_ids:
                    scores[pid] = scores.get(pid, 0) + cbf_weight * (score / max_cbf)

        # If no scores (cold-start), fall back to popularity
        if not scores:
            popular = (
                db.query(Product)
                .filter(Product.is_active == True, ~Product.id.in_(exclude_ids))
                .order_by(Product.review_count.desc(), Product.rating.desc())
                .limit(n)
                .all()
            )
            scores = {p.id: p.rating for p in popular}

        # Apply category filter
        if category_filter:
            from app.models.models import Category
            cat = db.query(Category).filter(Category.slug == category_filter).first()
            if cat:
                cat_product_ids = {p.id for p in db.query(Product.id).filter(Product.category_id == cat.id).all()}
                scores = {k: v for k, v in scores.items() if k in cat_product_ids}

        # Get top-n product objects
        top_ids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)[:n]
        products = db.query(Product).filter(Product.id.in_(top_ids)).all()
        product_map = {p.id: p for p in products}

        result = []
        for pid in top_ids:
            if pid in product_map:
                p = product_map[pid]
                result.append({
                    "product": p,
                    "score": round(scores[pid], 4),
                    "reason": self._get_reason(user_interactions, pid),
                })
        return result

    def get_similar_products(self, product_id: int, n: int = 8) -> List[Tuple[int, float]]:
        return self.cbf.get_similar(product_id, n)

    def _get_reason(self, interactions, product_id: int) -> str:
        reasons = ["Recommended for you", "Based on your browsing", "You might like this",
                   "Trending in your interests", "Customers also bought", "Top pick for you"]
        return reasons[product_id % len(reasons)]


# Singleton instance
recommender = HybridRecommender()
