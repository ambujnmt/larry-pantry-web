import { useState, useEffect } from "react"
import AdminPageHeader from "../../admin/components/AdminPageHeader"
import { getSocialSettings, updateSocialSettings } from "../../utils/adminApi"

const SOCIALS = [
  { key: 'facebook',  label: 'Facebook',  icon: 'fa-facebook',  color: '#1877f2', placeholder: 'https://facebook.com/yourpage' },
  { key: 'instagram', label: 'Instagram', icon: 'fa-instagram', color: '#e1306c', placeholder: 'https://instagram.com/yourpage' },
  { key: 'twitter',   label: 'Twitter/X', icon: 'fa-x-twitter', color: '#000',    placeholder: 'https://x.com/yourpage' },
  { key: 'youtube',   label: 'YouTube',   icon: 'fa-youtube',   color: '#ff0000', placeholder: 'https://youtube.com/yourchannel' },
  { key: 'linkedin',  label: 'LinkedIn',  icon: 'fa-linkedin',  color: '#0a66c2', placeholder: 'https://linkedin.com/company/yourpage' },
]

function SocialMedia() {
  const [form, setForm]       = useState({ facebook: "", instagram: "", twitter: "", youtube: "", linkedin: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError]     = useState("")

  useEffect(() => {
    getSocialSettings()
      .then(res => setForm(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError(""); setSuccess("")
    try {
      await updateSocialSettings(form)
      setSuccess("Social media settings updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <>
      <AdminPageHeader icon="fa-share-nodes" title="Social Media" subtitle="Manage social media links" />

      {success && <div className="alert alert-success d-flex gap-2 py-2"><i className="fa fa-check-circle" /><small>{success}</small></div>}
      {error   && <div className="alert alert-danger d-flex gap-2 py-2"><i className="fa fa-exclamation-circle" /><small>{error}</small></div>}

      <div className="app-card shadow-sm">
        <div className="app-card-body p-4">
          {loading ? (
            <div className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Loading...</div>
          ) : (
            <form onSubmit={handleSave}>
              <div className="row">
                {SOCIALS.map(({ key, label, icon, color, placeholder }) => (
                  <div className="col-md-6 mb-3" key={key}>
                    <label className="form-label small text-secondary">{label}</label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ background: color, border: 'none' }}>
                        <i className={`fa-brands ${icon} text-white`} />
                      </span>
                      <input type="url" className="form-control" placeholder={placeholder}
                        value={form[key] ?? ""}
                        onChange={e => setForm({ ...form, [key]: e.target.value })} />
                    </div>
                  </div>
                ))}

                <div className="col-12 mt-2">
                  <button type="submit" className="btn text-white px-4" style={{ background: '#0e606c' }} disabled={saving}>
                    {saving
                      ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                      : <><i className="fa fa-save me-2" />Save Changes</>}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

export default SocialMedia