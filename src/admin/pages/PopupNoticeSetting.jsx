import { useState, useEffect } from "react"
import { getPopupNotice, updatePopupNotice } from "../../utils/adminApi"
import AdminPageHeader from "../components/AdminPageHeader"

function PopupNoticeSetting() {
  const [title, setTitle]           = useState("")
  const [message, setMessage]       = useState("")
  const [buttonText, setButtonText] = useState("Okay, Got it")
  const [status, setStatus]         = useState(1)
  const [image, setImage]           = useState(null)    // new file to upload
  const [imageUrl, setImageUrl]     = useState(null)    // existing image from server
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState("")
  const [success, setSuccess]       = useState("")
  const [removeImage, setRemoveImage] = useState(false)

  useEffect(() => {
    setLoading(true); setError("")
    getPopupNotice()
      .then(res => {
        setTitle(res.data?.title || "")
        setMessage(res.data?.message || "")
        setButtonText(res.data?.button_text || "Okay, Got it")
        setStatus(res.data?.status ?? 1)
        setImageUrl(res.data?.image_url || null)
      })
      .catch(err => setError(err.message || "Failed to load popup notice."))
      .finally(() => setLoading(false))
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) setImage(file)
  }

  const handleRemoveImage = () => {
	  setImage(null)
	  setImageUrl(null)
	  setRemoveImage(true)
	}

  const handleSave = async (e) => {
	  e.preventDefault()
	  setSaving(true); setError("")
	  try {
	    const fd = new FormData()
	    fd.append("title", title)
	    fd.append("message", message)
	    fd.append("button_text", buttonText)
	    fd.append("status", status)
	    if (image) fd.append("image", image)
	    if (removeImage) fd.append("remove_image", 1)   // add

	    await updatePopupNotice(fd)
	    setSuccess("Popup notice updated successfully!")
	    setTimeout(() => setSuccess(""), 3000)
	    setImage(null)
	    setRemoveImage(false)   // reset
	  } catch (err) {
	    setError(err.message || "Something went wrong.")
	  } finally {
	    setSaving(false)
	  }
	}

  return (
    <>
      <AdminPageHeader icon="fa-bell" title="Popup Notice" subtitle="Message shown to website visitors & customers" />

      {success && <div className="alert alert-success d-flex gap-2 py-2"><i className="fa fa-check-circle" /><small>{success}</small></div>}
      {error && <div className="alert alert-danger d-flex gap-2 py-2"><i className="fa fa-exclamation-circle" /><small>{error}</small></div>}

      {loading ? (
        <div className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Loading...</div>
      ) : (
        <div className="app-card shadow-sm">
          <div className="app-card-body p-3 p-md-4">
            <form onSubmit={handleSave}>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small text-secondary">Title</label>
                  <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Welcome to Restaurant Pantry LA!" />
                </div>

                {/*<div className="col-md-6 mb-3">
                  <label className="form-label small text-secondary">Button Text</label>
                  <input type="text" className="form-control" value={buttonText} onChange={e => setButtonText(e.target.value)} placeholder="Okay, Got it" />
                </div>*/}
              </div>

              <div className="mb-3">
                <label className="form-label small text-secondary">Message</label>
                <textarea className="form-control" rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Popup message text..." />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small text-secondary">Image (optional)</label>

                  {imageUrl && !image && (
									  <div className="mb-2 d-flex align-items-center gap-2">
									    <img src={imageUrl} alt="" style={{ maxHeight: 140, borderRadius: 8, border: "1px solid #e2e8f0" }} />
									    <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleRemoveImage}>
									      <i className="fa fa-trash me-1" />Remove Image
									    </button>
									  </div>
									)}

									{image && (
									  <div className="mb-2 d-flex align-items-center gap-2">
									    <img src={URL.createObjectURL(image)} alt="" style={{ maxHeight: 140, borderRadius: 8, border: "1px solid #e2e8f0" }} />
									    <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleRemoveImage}>
									      <i className="fa fa-trash me-1" />Remove Image
									    </button>
									  </div>
									)}

									<input type="file" accept="image/*" className="form-control" onChange={handleImageChange} />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label small text-secondary d-block">Show Popup?</label>
                  <div className="form-check form-switch mt-2">
                    <input className="form-check-input" type="checkbox" role="switch" checked={status == 1}
                      onChange={e => setStatus(e.target.checked ? 1 : 0)} style={{ width: 42, height: 22 }} />
                    <label className="form-check-label ms-2">{status == 1 ? "Enabled — visible to users" : "Disabled — hidden from users"}</label>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn text-white" style={{ background: '#0e606c' }} disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="fa fa-save me-2" />Save Changes</>}
              </button>

            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default PopupNoticeSetting