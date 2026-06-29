import { useState, useEffect } from "react"
import AdminPageHeader from "../../admin/components/AdminPageHeader"
import { getContactSettings, updateContactSettings } from "../../utils/adminApi"

function ContactSetting() {
  const [form, setForm]       = useState({ phone: "", phone_2: "", email: "", email_2: "", address: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError]     = useState("")

  useEffect(() => {
    getContactSettings()
      .then(res => setForm(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError(""); setSuccess("")
    try {
      await updateContactSettings(form)
      setSuccess("Contact settings updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message)
    } finally { setSaving(false) }
  }

  const f = (key) => ({
    value: form[key] ?? "",
    onChange: e => setForm({ ...form, [key]: e.target.value })
  })

  return (
    <>
      <AdminPageHeader icon="fa-phone" title="Contact Setting" subtitle="Manage contact information" />

      {success && <div className="alert alert-success d-flex gap-2 py-2"><i className="fa fa-check-circle" /><small>{success}</small></div>}
      {error   && <div className="alert alert-danger d-flex gap-2 py-2"><i className="fa fa-exclamation-circle" /><small>{error}</small></div>}

      <div className="app-card shadow-sm">
        <div className="app-card-body p-4">
          {loading ? (
            <div className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Loading...</div>
          ) : (
            <form onSubmit={handleSave}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small text-secondary">Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="fa fa-phone" /></span>
                    <input type="text" className="form-control" placeholder="Enter phone number" {...f('phone')} />
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label small text-secondary">Other Phone Number (Optional)</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="fa fa-phone" /></span>
                    <input type="text" className="form-control" placeholder="Enter phone number" {...f('phone_2')} />
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label small text-secondary">Email ID</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="fa fa-envelope" /></span>
                    <input type="email" className="form-control" placeholder="contact@example.com" {...f('email')} />
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label small text-secondary">Other Email ID (Optional)</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="fa fa-envelope" /></span>
                    <input type="email" className="form-control" placeholder="contact@example.com" {...f('email_2')} />
                  </div>
                </div>

                <div className="col-12 mb-4">
                  <label className="form-label small text-secondary">Address</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="fa fa-location-dot" /></span>
                    <textarea className="form-control" rows={4} placeholder="Enter full address" {...f('address')} />
                  </div>
                </div>

                <div className="col-12">
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

export default ContactSetting