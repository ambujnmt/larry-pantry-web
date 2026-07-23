import { useState, useEffect } from "react"
import DataTable from "datatables.net-react"
import DT from "datatables.net-bs5"
import Swal from "sweetalert2"
import { getFaqs, createFaq, updateFaq, updateFaqStatus, deleteFaq, dtOptions } from "../../utils/adminApi"
import AdminPageHeader from "../components/AdminPageHeader"

DataTable.use(DT)

const EMPTY_FORM = { question: "", answer: "", sort_order: 0 }

function Faqs() {
  const [faqs, setFaqs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null) // null = adding new
  const [form, setForm]       = useState(EMPTY_FORM)
  const [saving, setSaving]   = useState(false)

  const loadFaqs = () => {
    setLoading(true)
    getFaqs()
      .then(res => setFaqs(res.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(loadFaqs, [])

  const openAddForm = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEditForm = (faq) => {
    setEditingId(faq.id)
    setForm({ question: faq.question, answer: faq.answer, sort_order: faq.sort_order })
    setShowForm(true)
    setTimeout(() => {
      document.getElementById("faqForm")?.scrollIntoView({
        behavior: "smooth"
      })
    }, 100)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.question.trim() || !form.answer.trim()) return

    setSaving(true)
    try {
      if (editingId) {
        await updateFaq(editingId, form)
      } else {
        await createFaq(form)
      }
      setShowForm(false)
      loadFaqs()
    } catch (err) {
      Swal.fire("Error", err.message || "Something went wrong.", "error")
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = (faq) => {
    const newStatus = faq.status === 1 ? 0 : 1
    setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, status: newStatus } : f))
    updateFaqStatus(faq.id, newStatus).catch(() => loadFaqs())
  }

  const handleDelete = async (faq) => {
    const result = await Swal.fire({
      title: "Delete this FAQ?",
      text: faq.question,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, delete it",
    })
    if (!result.isConfirmed) return

    try {
      await deleteFaq(faq.id)
      setFaqs(prev => prev.filter(f => f.id !== faq.id))
    } catch (err) {
      Swal.fire("Error", err.message || "Could not delete.", "error")
    }
  }

  const truncateText = (text, words = 20) => {
    if (!text) return ""

    const arr = text.split(/\s+/)

    return arr.length > words
      ? arr.slice(0, words).join(" ") + "...."
      : text
  }

  return (
    <>
      <AdminPageHeader
        icon="fa-circle-question"
        title="FAQs"
        subtitle="Manage the questions shown on the website's Q&A page"
        right={<button className="btn text-white" style={{ background: '#0e606c' }} onClick={openAddForm}>
          <i className="fa fa-plus me-2" />Add FAQ
        </button>}
      />

      {error && <div className="alert alert-danger d-flex gap-2 py-2"><i className="fa fa-exclamation-circle" /><small>{error}</small></div>}

      {showForm && (
        <div id="faqForm" className="app-card shadow-sm mb-3">
          <div className="app-card-body p-3 p-md-4">
            <h6 className="fw-bold mb-3">{editingId ? "Edit FAQ" : "Add New FAQ"}</h6>
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label small text-secondary">Question</label>
                <input type="text" className="form-control" value={form.question}
                  onChange={e => setForm({ ...form, question: e.target.value })} required />
              </div>
              <div className="mb-3">
                <label className="form-label small text-secondary">Answer</label>
                <textarea className="form-control" rows={4} value={form.answer}
                  onChange={e => setForm({ ...form, answer: e.target.value })} required />
              </div>
              {/*<div className="mb-3" style={{ maxWidth: 160 }}>
                <label className="form-label small text-secondary">Sort Order</label>
                <input type="number" className="form-control" value={form.sort_order}
                  onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              </div>*/}
              <div className="d-flex gap-2">
                <button type="submit" className="btn text-white" style={{ background: '#0e606c' }} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="app-card shadow-sm">
        <div className="app-card-body p-3 table-responsive">
          {loading ? (
            <div className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Loading...</div>
          ) : faqs.length === 0 ? (
            <div className="text-center text-muted py-5">No FAQs added yet.</div>
          ) : (
            <DataTable className="table table-striped table-bordered table-hover"
                options={{
                    ...dtOptions,
                    columnDefs: [
                        { orderable: false, targets: [3,4] }
                    ]
                }}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Status</th>
                  <th nowrap>Action</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((faq, index) => (
                  <tr key={faq.id}>
                    <td className="align-middle">{index + 1}</td>

                    <td className="align-middle">
                      {truncateText(faq.question)}
                    </td>

                    <td className="align-middle">
                      {truncateText(faq.answer)}
                    </td>

                    <td className="align-middle">
                      <button
                        className={`btn btn-sm ${
                          faq.status === 1
                            ? "btn-success"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => toggleStatus(faq)}
                      >
                        {faq.status === 1 ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="align-middle text-nowrap">
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => openEditForm(faq)}
                      >
                        <i className="fa fa-pen" />
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(faq)}
                      >
                        <i className="fa fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </div>
      </div>
    </>
  )
}

export default Faqs
