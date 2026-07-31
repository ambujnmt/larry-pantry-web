import { useState, useEffect } from "react"
import { getActivePopup } from "../../utils/websiteApi"

function WelcomePopupModal({ mode = "website" }) {
  const [popup, setPopup] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
	  const fetchPopup = async () => {
	    try {
	      const res = await getActivePopup()
	      const data = res?.data || null
	      if (!data) return
	      setPopup(data)

	      if (mode === "customer") {
	        setShow(true)
	      } else {
	        const seenKey = `popup_seen_${data.updated_at}`
	        const alreadySeen = sessionStorage.getItem(seenKey)   // 👈 localStorage → sessionStorage
	        if (!alreadySeen) setShow(true)
	      }
	    } catch (err) {
	      console.error("Popup fetch error:", err)
	    }
	  }
	  fetchPopup()
	}, [mode])

	const handleClose = () => {
	  if (popup && mode === "website") {
	    sessionStorage.setItem(`popup_seen_${popup.updated_at}`, "1")   // 👈 localStorage → sessionStorage
	  }
	  setShow(false)
	}

  if (!show || !popup) return null

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.55)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content text-center p-4" style={{ borderRadius: 14 }}>
          {popup.image_url && (
            <img src={popup.image_url} alt={popup.title} style={{ maxHeight: 140, objectFit: 'cover', borderRadius: 10, margin: '0 auto 16px' }} />
          )}
          <h5 className="fw-semibold mb-2">{popup.title}</h5>
          <p className="text-black mb-4" style={{ whiteSpace: 'pre-line' }}>{popup.message}</p>
          <button className="btn text-white" style={{ background: '#0e606c', height: 46, borderRadius: 10 }} onClick={handleClose}>
            {popup.button_text || "Okay, Got it"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default WelcomePopupModal