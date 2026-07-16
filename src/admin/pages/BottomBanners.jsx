import { useState, useEffect, useRef } from "react"
import { getBottomBannerSettings, updateBottomBannerSettings } from "../../utils/adminApi"
import AdminPageHeader from "../../admin/components/AdminPageHeader"

function BannerSlot({ label, keyName, currentUrl, onSave, saving }) {
  const [image, setImage]     = useState(null)
  const [preview, setPreview] = useState("")
  const fileRef = useRef()

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleUpload = () => {
    if (!image) return
    onSave(keyName, image)
    setImage(null)
    setPreview("")
  }

  return (
    <div className="app-card shadow-sm mb-4">
      <div className="app-card-body p-3">
        <h6 className="mb-3">{label}</h6>

        <div className="mb-3">
          <img
            src={preview || currentUrl || "/admin-assets/images/placeholder.png"}
            alt={label}
            onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
            style={{ maxHeight: 220, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
        </div>

        <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current.click()}>
          <i className="fa fa-upload me-2" />{currentUrl ? "Replace Image" : "Upload Image"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleChange} />

        {image && (
          <button
            type="button"
            className="btn btn-sm text-white ms-2"
            style={{ background: '#0e606c' }}
            onClick={handleUpload}
            disabled={saving}
          >
            {saving ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="fa fa-save me-2" />}
            Save
          </button>
        )}
      </div>
    </div>
  )
}

function BottomBanners() {
  const [banners, setBanners] = useState({ bottom_banner_1_url: "", bottom_banner_2_url: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => { loadBanners() }, [])

  const loadBanners = async () => {
    setLoading(true)
    try {
      const res = await getBottomBannerSettings()
      setBanners(res.data || {})
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleSave = async (keyName, file) => {
    setSaving(true); setError("")
    try {
      const fd = new FormData()
      fd.append(keyName, file)
      const res = await updateBottomBannerSettings(fd)
      setBanners(res.data || {})
      setSuccess("Banner updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message || "Something went wrong.")
    } finally { setSaving(false) }
  }

  return (
    <>
      <AdminPageHeader
        icon="fa-image"
        title="Bottom Banners"
        subtitle="Manage the two bottom banner images shown on the website"
      />

      {success && <div className="alert alert-success d-flex gap-2 py-2"><i className="fa fa-check-circle" /><small>{success}</small></div>}
      {error && <div className="alert alert-danger d-flex gap-2 py-2"><i className="fa fa-exclamation-circle" /><small>{error}</small></div>}

      {loading ? (
        <div className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Loading...</div>
      ) : (
        <div className="row">
          <div className="col-md-6">
            <BannerSlot
              label="Bottom Banner 1"
              keyName="bottom_banner_1"
              currentUrl={banners.bottom_banner_1_url}
              onSave={handleSave}
              saving={saving}
            />
          </div>
          <div className="col-md-6">
            <BannerSlot
              label="Bottom Banner 2"
              keyName="bottom_banner_2"
              currentUrl={banners.bottom_banner_2_url}
              onSave={handleSave}
              saving={saving}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default BottomBanners