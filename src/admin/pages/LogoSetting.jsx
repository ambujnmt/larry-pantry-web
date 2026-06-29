import { useState, useEffect, useRef } from "react"
import AdminPageHeader from "../../admin/components/AdminPageHeader"
import { getLogoSettings, updateLogoSettings } from "../../utils/adminApi"

function LogoSetting() {
  const [logoUrl, setLogoUrl] = useState("")
  const [preview, setPreview] = useState("")
  const [file, setFile]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError]     = useState("")
  const fileRef = useRef()

  useEffect(() => {
    getLogoSettings()
      .then(res => setLogoUrl(res.data.logo_url || ""))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!file) { setError("Please select a logo image."); return }
    setSaving(true); setError(""); setSuccess("")
    try {
      const fd = new FormData()
      fd.append("logo", file)
      const res = await updateLogoSettings(fd)
      setLogoUrl(res.data.logo_url)
      setPreview("")
      setFile(null)
      setSuccess("Logo updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <>
      <AdminPageHeader icon="fa-image" title="Logo Setting" subtitle="Update your site logo" />

      {success && <div className="alert alert-success d-flex gap-2 py-2"><i className="fa fa-check-circle" /><small>{success}</small></div>}
      {error   && <div className="alert alert-danger d-flex gap-2 py-2"><i className="fa fa-exclamation-circle" /><small>{error}</small></div>}

      <div className="app-card shadow-sm">
        <div className="app-card-body p-4">
          {loading ? (
            <div className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Loading...</div>
          ) : (
            <form onSubmit={handleSave}>

              {/* Current Logo */}
              <div className="mb-4">
                <label className="form-label small text-secondary d-block">Current Logo</label>
                <div className="border rounded p-3 d-inline-block" style={{ background: '#f8fafc' }}>
                  {logoUrl
                    ? <img src={logoUrl} alt="Current Logo"
                        style={{ maxHeight: 80, maxWidth: 260, objectFit: 'contain' }}
                        onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }} />
                    : <span className="text-muted small">No logo uploaded</span>}
                </div>
              </div>

              {/* New Logo Upload */}
              <div className="mb-4">
                <label className="form-label small text-secondary d-block">Upload New Logo</label>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => fileRef.current.click()}>
                  <i className="fa fa-upload me-2" />Choose Image
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                <small className="text-muted ms-2">PNG, JPG, SVG, WebP — max 2MB</small>

                {/* Preview */}
                {preview && (
                  <div className="mt-3">
                    <small className="text-secondary d-block mb-1">Preview:</small>
                    <div className="border rounded p-3 d-inline-block" style={{ background: '#1a1a2e' }}>
                      <img src={preview} alt="Preview"
                        style={{ maxHeight: 80, maxWidth: 260, objectFit: 'contain' }} />
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="btn text-white px-4" style={{ background: '#0e606c' }} disabled={saving || !file}>
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-2" />Uploading...</>
                  : <><i className="fa fa-save me-2" />Save Logo</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

export default LogoSetting