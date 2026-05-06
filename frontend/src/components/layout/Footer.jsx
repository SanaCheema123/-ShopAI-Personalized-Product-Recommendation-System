import { Sparkles } from 'lucide-react'
export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '22px', height: '22px', background: 'linear-gradient(135deg,#00d084,#00a866)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={13} color="white" />
          </div>
          <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 700, color: 'white', fontSize: '15px' }}>ShopAI</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>by AIVONEX SMC-PVT LTD</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {['About Us','Privacy Policy','Terms & Conditions','Contact Us'].map(l => (
            <span key={l} style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>© 2024 ShopAI. All rights reserved.</p>
      </div>
    </footer>
  )
}
