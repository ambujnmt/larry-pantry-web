function CustomerPageHeader({ icon, title, subtitle, right }) {
  return (
    <div className="app-card shadow-sm mb-4" style={{
      borderRadius: 14, border: 'none', overflow: 'hidden',
      background: 'linear-gradient(135deg, #0e606c 0%, #0a4f59 100%)',
    }}>
      <div className="app-card-body px-4 py-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div className="d-flex align-items-center gap-3">
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className={`fa-solid ${icon} text-white`} style={{ fontSize: 20 }} />
          </div>
          <div>
            <h1 className="mb-0 text-white fw-bold" style={{ fontSize: 20, lineHeight: 1.2 }}>
              {title}
            </h1>
            {subtitle && (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
        {right && <div>{right}</div>}
      </div>
    </div>
  )
}

export default CustomerPageHeader
