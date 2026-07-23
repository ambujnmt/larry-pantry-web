import { useState, useEffect, useMemo, lazy, Suspense } from "react"
import { useParams } from "react-router-dom"
import { getPage, updatePage } from "../../utils/adminApi"
import AdminPageHeader from "../components/AdminPageHeader"

const JoditEditor = lazy(() => import("jodit-react"))

// slug -> nice label for the header, extend this if you add more pages
const PAGE_LABELS = {
  "about-us": "About Us",
  "terms-conditions": "Terms & Conditions",
  "privacy-policy": "Privacy Policy",
}

function PageEditor() {
  const { slug } = useParams()
  const [title, setTitle]     = useState("")
  const [content, setContent] = useState("")
  const [image, setImage]     = useState(null)      // new file to upload
  const [imageUrl, setImageUrl] = useState(null)     // existing image from server
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState("")
  const [success, setSuccess] = useState("")

  const joditConfig = useMemo(() => ({ height: 350, zIndex: 10100 }), [])

  useEffect(() => {
    setLoading(true); setError("")
    getPage(slug)
      .then(res => {
        setTitle(res.data?.title || "")
        setContent(res.data?.content || "")
        setImageUrl(res.data?.image_url || null)
      })
      .catch(err => setError(err.message || "Failed to load page."))
      .finally(() => setLoading(false))
  }, [slug])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) setImage(file)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    // if (!title.trim()) { setError("Title is required."); return }

    setSaving(true); setError("")
    try {
      const fd = new FormData()
      fd.append("title", title)
      fd.append("content", content)
      if (image) fd.append("image", image)

      const res = await updatePage(slug, fd)
      setSuccess("Page updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
      setImage(null)
    } catch (err) {
      setError(err.message || "Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AdminPageHeader icon="fa-file-lines" title={PAGE_LABELS[slug] || slug} subtitle="Edit this page's content" />

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
                  <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} />
                </div>

                {slug === "about-us" && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label small text-secondary">Banner Image (optional)</label>

                    {imageUrl && !image && <div className="mb-2"><img src={imageUrl} alt="" style={{ maxHeight: 140, borderRadius: 8, border: "1px solid #e2e8f0" }} /></div>}

                    {image && <div className="mb-2"><img src={URL.createObjectURL(image)} alt="" style={{ maxHeight: 140, borderRadius: 8, border: "1px solid #e2e8f0" }} /></div>}

                    <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} />
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label small text-secondary">Content</label>
                <Suspense fallback={<div className="border rounded p-2 text-muted small" style={{ minHeight: 100 }}>Loading editor...</div>}>
                  <JoditEditor config={joditConfig} value={content} onBlur={val => setContent(val)} />
                </Suspense>
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

export default PageEditor
