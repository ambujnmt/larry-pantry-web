import { useState, useEffect, useRef, useCallback } from "react"
import { getProfile, updateProfile, changeCustomerPassword } from "../../utils/customerApi"
import CustomerPageHeader from "../components/CustomerPageHeader"

const NOMINATIM = "https://nominatim.openstreetmap.org/search"

const css = `
  .cp-input-wrap { position: relative; }
  .cp-input-wrap .cp-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: #94a3b8; font-size: 13px; pointer-events: none; z-index: 2;
  }
  .cp-input-wrap input {
    padding-left: 36px !important;
    border: 1.5px solid #e2e8f0 !important;
    border-radius: 10px !important;
    background: #f8fafc !important;
    font-size: 13.5px;
    height: 42px;
    transition: border-color .15s, background .15s;
  }
  .cp-input-wrap input:focus {
    border-color: #0e606c !important;
    background: #fff !important;
    box-shadow: 0 0 0 3px rgba(14,96,108,.08) !important;
  }
  .cp-section-title {
    font-size: 11px; font-weight: 700; letter-spacing: .08em;
    text-transform: uppercase; color: #94a3b8; margin-bottom: 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .cp-section-title::after {
    content: ''; flex: 1; height: 1px; background: #f1f5f9;
  }
  .cp-avatar {
    width: 68px; height: 68px; border-radius: 50%;
    background: linear-gradient(135deg, #0e606c, #16a888);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; font-weight: 700; color: #fff;
    flex-shrink: 0; letter-spacing: 1px;
  }
  .cp-password-toggle {
    border-color: #e2e8f0 !important;
    border-top-right-radius: 10px !important;
    border-bottom-right-radius: 10px !important;
    background: #f8fafc !important;
  }
  .cp-tabs {
    display: flex; gap: 4px; background: #f1f5f9; padding: 4px;
    border-radius: 12px; width: fit-content; margin-bottom: 20px;
  }
  .cp-tab {
    border: none; background: transparent; padding: 9px 22px;
    border-radius: 9px; font-size: 13.5px; font-weight: 600;
    color: #64748b; cursor: pointer; transition: all .15s;
    display: flex; align-items: center; gap: 7px;
  }
  .cp-tab.active {
    background: #0e606c; color: #fff;
    box-shadow: 0 2px 6px rgba(14,96,108,.25);
  }
  .cp-tab:not(.active):hover {
    background: rgba(14,96,108,.06); color: #0e606c;
  }
`

function CustomerProfile() {
  const [activeTab, setActiveTab] = useState("profile") // "profile" | "password"

  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState("")
  const [error,   setError]   = useState("")

  const [firstName, setFirstName] = useState("")
  const [lastName,  setLastName]  = useState("")
  const [email,      setEmail]      = useState("")
  const [mobile,     setMobile]     = useState("")

  const [addressInput,  setAddressInput]  = useState("")
  const [suggestions,   setSuggestions]   = useState([])
  const [suggesting,    setSuggesting]    = useState(false)
  const [lat,           setLat]           = useState("")
  const [lng,           setLng]           = useState("")
  const [addressLocked, setAddressLocked] = useState(false)

  const debounceRef = useRef(null)
  const wrapperRef  = useRef(null)

  /*---- change password ----*/
  const [oldPass, setOldPass] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")

  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [passLoading, setPassLoading] = useState(false)
  const [passSuccess, setPassSuccess] = useState("")
  const [passError, setPassError] = useState("")
  /*------------------------*/

  const [organizationType, setOrganizationType] = useState("")
  const [storeAddress, setStoreAddress]         = useState("")

  const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]
  const defaultHours = DAYS.reduce((acc, d) => ({ ...acc, [d]: { open: "", close: "", closed: false } }), {})
  const [workingHours, setWorkingHours] = useState(defaultHours)

  const updateHour = (day, field, value) => {
    setWorkingHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  const fillForm = (u) => {
    setFirstName(u.first_name || "")
    setLastName(u.last_name   || "")
    setEmail(u.email          || "")
    setMobile(u.mobile        || "")
    setOrganizationType(u.organization_type || "")
    setStoreAddress(u.store_address || "")
    if (u.working_hours) setWorkingHours({ ...defaultHours, ...u.working_hours })
    if (u.address)   { setAddressInput(u.address); setAddressLocked(true) }
    if (u.latitude)  setLat(String(u.latitude))
    if (u.longitude) setLng(String(u.longitude))
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem("customer_user")
      if (stored) fillForm(JSON.parse(stored))
    } catch (_) {}

    getProfile()
      .then(res => { const p = res?.data ?? res; fillForm(p); localStorage.setItem("customer_user", JSON.stringify(p)) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setSuggestions([])
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const searchAddress = useCallback((query) => {
    if (!query || query.length < 3) { setSuggestions([]); return }
    setSuggesting(true)
    fetch(`${NOMINATIM}?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`)
      .then(r => r.json())
      .then(data => setSuggestions(data || []))
      .catch(() => setSuggestions([]))
      .finally(() => setSuggesting(false))
  }, [])

  const handleAddressChange = (e) => {
    const val = e.target.value
    setAddressInput(val)
    setAddressLocked(false)
    setLat(""); setLng("")
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchAddress(val), 350)
  }

  const pickSuggestion = (item) => {
    setAddressInput(item.display_name)
    setLat(item.lat)
    setLng(item.lon)
    setAddressLocked(true)
    setSuggestions([])
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSuccess(""); setError("")
    /*if (addressInput && !addressLocked) {
      setError("Please select an address from the suggestions.")
      return
    }*/
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append("first_name", firstName)
      fd.append("last_name",  lastName)
      fd.append("email",      email)
      fd.append("mobile",     mobile)
      fd.append("organization_type", organizationType)
      fd.append("store_address", storeAddress)
      fd.append("working_hours", JSON.stringify(workingHours))
      if (addressInput) fd.append("address",   addressInput)
      if (lat)          fd.append("latitude",  lat)
      if (lng)          fd.append("longitude", lng)

      const res    = await updateProfile(fd)
      const updated = res?.data ?? res
      const merged  = { first_name: firstName, last_name: lastName, email, mobile, organization_type: organizationType, store_address: storeAddress, working_hours: workingHours, address: addressInput, latitude: lat, longitude: lng, ...updated }
      localStorage.setItem("customer_user", JSON.stringify(merged))
      setSuccess("Profile updated successfully!")
    } catch (err) {
      setError(err.message || "Update failed.")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPassSuccess("")
    setPassError("")

    if (newPass !== confirmPass) {
      setPassError("New password and confirm password do not match.")
      return
    }

    if (newPass.length < 6) {
      setPassError("Password must be at least 6 characters.")
      return
    }

    setPassLoading(true)

    try {
      await changeCustomerPassword(oldPass, newPass)
      setPassSuccess("Password changed successfully.")
      setOldPass("")
      setNewPass("")
      setConfirmPass("")
    } catch (err) {
      setPassError(err.message || "Failed to change password.")
    } finally {
      setPassLoading(false)
    }
  }

  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U"

  return (
    <>
      <style>{css}</style>
      <CustomerPageHeader
        icon="fa-circle-user"
        title="My Profile"
        subtitle="Manage your account details"
      />

      {loading ? (
        <div className="app-card shadow-sm" style={{ borderRadius: 14 }}>
          <div className="app-card-body p-5 text-center">
            <span className="spinner-border spinner-border-sm me-2" style={{ color: "#0e606c" }} />
            <span style={{ color: "#64748b", fontSize: 14 }}>Loading profile...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Avatar + Name banner */}
          <div className="app-card shadow-sm mb-3" style={{ borderRadius: 14, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #0e606c 0%, #0a8a78 100%)", padding: "8px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div className="cp-avatar">{initials}</div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, lineHeight: 1.3 }}>
                    {[firstName, lastName].filter(Boolean).join(" ") || "Your Name"}
                  </div>
                  <div style={{ color: "rgba(255,255,255,.65)", fontSize: 13, marginTop: 3 }}>
                    {email || "your@email.com"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="cp-tabs">
            <button className={`cp-tab ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
              <i className="fa-solid fa-id-card" /> Profile Settings
            </button>
            <button className={`cp-tab ${activeTab === "password" ? "active" : ""}`} onClick={() => setActiveTab("password")}>
              <i className="fa-solid fa-lock" /> Change Password
            </button>
          </div>

          {/* ═══════════ TAB: PROFILE SETTINGS ═══════════ */}
          {activeTab === "profile" && (
            <form onSubmit={handleSave}>

              {/* Personal Info Card */}
              <div className="app-card shadow-sm mb-3" style={{ borderRadius: 14 }}>
                <div className="app-card-body p-4">

                  {success && (
                    <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3">
                      <i className="fa fa-check-circle" /><small>{success}</small>
                    </div>
                  )}
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                      <i className="fa fa-exclamation-circle" /><small>{error}</small>
                    </div>
                  )}

                  <div className="cp-section-title">
                    <i className="fa-solid fa-user" style={{ color: "#0e606c" }} />
                    Personal Information
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold" style={{ fontSize: 12.5, color: "#374151" }}>First Name</label>
                      <div className="cp-input-wrap">
                        <i className="fa-solid fa-user cp-icon" />
                        <input type="text" className="form-control" placeholder="First name"
                          value={firstName} onChange={e => setFirstName(e.target.value)} />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold" style={{ fontSize: 12.5, color: "#374151" }}>Last Name</label>
                      <div className="cp-input-wrap">
                        <i className="fa-solid fa-user cp-icon" />
                        <input type="text" className="form-control" placeholder="Last name"
                          value={lastName} onChange={e => setLastName(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold" style={{ fontSize: 12.5, color: "#374151" }}>Email Address</label>
                      <div className="cp-input-wrap">
                        <i className="fa-solid fa-envelope cp-icon" />
                        <input type="email" className="form-control" placeholder="your@email.com"
                          value={email} onChange={e => setEmail(e.target.value)} />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold" style={{ fontSize: 12.5, color: "#374151" }}>Phone Number</label>
                      <div className="cp-input-wrap">
                        <i className="fa-solid fa-phone cp-icon" />
                        <input type="tel" className="form-control" placeholder="+91 00000 00000"
                          value={mobile} onChange={e => setMobile(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className="app-card shadow-sm mb-3" style={{ borderRadius: 14 }}>
                <div className="app-card-body p-4">
                  <div className="cp-section-title">
                    <i className="fa-solid fa-location-dot" style={{ color: "#0e606c" }} />
                    Delivery Address
                  </div>

                  <div ref={wrapperRef} style={{ position: "relative" }}>
                    <label className="form-label fw-semibold d-flex align-items-center gap-2" style={{ fontSize: 12.5, color: "#374151" }}>
                      Address
                      {addressLocked && lat && (
                        <span style={{
                          fontSize: 11, color: "#16a34a", background: "#dcfce7",
                          borderRadius: 20, padding: "2px 9px", fontWeight: 600,
                        }}>
                          <i className="fa-solid fa-circle-check me-1" />Location set
                        </span>
                      )}
                    </label>

                    <div style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                        color: "#94a3b8", fontSize: 13, pointerEvents: "none", zIndex: 2,
                      }}>
                        <i className="fa-solid fa-map-pin" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        value={addressInput}
                        onChange={handleAddressChange}
                        placeholder="Type to search your address..."
                        autoComplete="off"
                        style={{
                          paddingLeft: 36, paddingRight: 38,
                          border: "1.5px solid #e2e8f0", borderRadius: 10,
                          background: "#f8fafc", fontSize: 13.5, height: 42,
                        }}
                      />
                      <span style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        color: suggesting ? "#0e606c" : (addressLocked ? "#16a34a" : "#94a3b8"),
                        fontSize: 13, pointerEvents: "none",
                      }}>
                        {suggesting
                          ? <span className="spinner-border spinner-border-sm" style={{ width: 13, height: 13, borderWidth: 2 }} />
                          : <i className={`fa-solid ${addressLocked ? "fa-circle-check" : "fa-magnifying-glass"}`} />
                      }
                      </span>
                    </div>

                    {suggestions.length > 0 && (
                      <div style={{
                        position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 999,
                        background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10,
                        boxShadow: "0 10px 28px rgba(0,0,0,.1)", overflow: "hidden",
                      }}>
                        {suggestions.map((item, i) => (
                          <div key={i} onMouseDown={() => pickSuggestion(item)}
                            style={{
                              padding: "10px 14px", cursor: "pointer", fontSize: 13,
                              borderBottom: i < suggestions.length - 1 ? "1px solid #f1f5f9" : "none",
                              display: "flex", alignItems: "flex-start", gap: 10, background: "#fff",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f0fdfa"}
                            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                          >
                            <i className="fa-solid fa-location-dot" style={{ color: "#0e606c", marginTop: 3, flexShrink: 0 }} />
                            <div>
                              <div style={{ fontWeight: 600, color: "#1e293b", lineHeight: 1.4, fontSize: 13 }}>
                                {item.address?.road || item.address?.suburb || item.display_name.split(",")[0]}
                              </div>
                              <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
                                {item.display_name}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div style={{ padding: "5px 12px", background: "#f8fafc", fontSize: 10.5, color: "#94a3b8", textAlign: "right" }}>
                          Powered by OpenStreetMap
                        </div>
                      </div>
                    )}

                    {/*{lat && lng && (
                      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          background: "#f0fdf4", border: "1px solid #bbf7d0",
                          borderRadius: 20, padding: "3px 12px", fontSize: 11.5, color: "#15803d", fontWeight: 500,
                        }}>
                          <i className="fa-solid fa-up-down" style={{ fontSize: 10 }} />
                          Lat: {parseFloat(lat).toFixed(6)}
                        </span>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          background: "#f0fdf4", border: "1px solid #bbf7d0",
                          borderRadius: 20, padding: "3px 12px", fontSize: 11.5, color: "#15803d", fontWeight: 500,
                        }}>
                          <i className="fa-solid fa-left-right" style={{ fontSize: 10 }} />
                          Lng: {parseFloat(lng).toFixed(6)}
                        </span>
                      </div>
                    )}*/}
                  </div>
                </div>
              </div>

              {/* Business Info Card */}
              <div className="app-card shadow-sm mb-3" style={{ borderRadius: 14 }}>
                <div className="app-card-body p-4">
                  <div className="cp-section-title">
                    <i className="fa-solid fa-building" style={{ color: "#0e606c" }} />
                    Business Information
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold" style={{ fontSize: 12.5, color: "#374151" }}>Organization Type</label>
                      <select className="form-select" style={{ fontSize: 13.5, height: 42, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc" }}
                        value={organizationType} onChange={e => setOrganizationType(e.target.value)}>
                        <option value="">Select type</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Caterer">Caterer</option>
                        <option value="School">School</option>
                        <option value="Assisted Living">Assisted Living</option>
                        <option value="Family/Personal">Family / Personal</option>
                      </select>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold" style={{ fontSize: 12.5, color: "#374151" }}>Store Address</label>
                      <div className="cp-input-wrap">
                        <i className="fa-solid fa-store cp-icon" />
                        <input type="text" className="form-control" placeholder="Store address"
                          value={storeAddress} onChange={e => setStoreAddress(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <label className="form-label fw-semibold d-block mb-2" style={{ fontSize: 12.5, color: "#374151" }}>Working Hours</label>
                  {DAYS.map(day => (
                    <div key={day} className="d-flex align-items-center gap-2 mb-2">
                      <div style={{ width: 90, fontSize: 12.5, textTransform: 'capitalize', color: "#374151" }}>{day}</div>
                      <div className="form-check mb-0">
                        <input type="checkbox" className="form-check-input" checked={!workingHours[day]?.closed}
                          onChange={e => updateHour(day, 'closed', !e.target.checked)} />
                      </div>
                      <input type="time" className="form-control form-control-sm" style={{ width: 110 }}
                        value={workingHours[day]?.open || ""} disabled={workingHours[day]?.closed}
                        onChange={e => updateHour(day, 'open', e.target.value)} />
                      <span className="text-muted small">to</span>
                      <input type="time" className="form-control form-control-sm" style={{ width: 110 }}
                        value={workingHours[day]?.close || ""} disabled={workingHours[day]?.closed}
                        onChange={e => updateHour(day, 'close', e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="d-flex justify-content-end mb-4">
                <button type="submit" className="btn text-white fw-semibold px-4"
                  style={{ background: "#0e606c", borderRadius: 10, fontSize: 14, height: 42 }}
                  disabled={saving}>
                  {saving
                    ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                    : <><i className="fa-solid fa-floppy-disk me-2" />Save Profile</>
                  }
                </button>
              </div>
            </form>
          )}

          {/* ═══════════ TAB: CHANGE PASSWORD ═══════════ */}
          {activeTab === "password" && (
            <div className="row">
              <div className="col-md-6">
                <div className="app-card shadow-sm" style={{ borderRadius: 14 }}>
                  <div className="app-card-body p-4">
                    {passSuccess && (
                      <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3">
                        <i className="fa fa-check-circle" /><small>{passSuccess}</small>
                      </div>
                    )}
                    {passError && (
                      <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                        <i className="fa fa-exclamation-circle" /><small>{passError}</small>
                      </div>
                    )}

                    <div className="cp-section-title">
                      <i className="fa-solid fa-lock" style={{ color: "#0e606c" }} />
                      Update Your Password
                    </div>

                    <form onSubmit={handlePasswordSubmit}>
                      <div className="mb-3">
                        <label className="form-label fw-semibold" style={{ fontSize: 12.5, color: "#374151" }}>Current Password</label>
                        <div className="input-group cp-input-wrap">
                          <i className="fa-solid fa-lock cp-icon" />
                          <input
                            type={showOld ? "text" : "password"}
                            className="form-control"
                            value={oldPass}
                            onChange={(e) => setOldPass(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary cp-password-toggle"
                            onClick={() => setShowOld(!showOld)}
                          >
                            <i className={`fa ${showOld ? "fa-eye-slash" : "fa-eye"}`}></i>
                          </button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold" style={{ fontSize: 12.5, color: "#374151" }}>New Password</label>
                        <div className="input-group cp-input-wrap">
                          <i className="fa-solid fa-key cp-icon" />
                          <input
                            type={showNew ? "text" : "password"}
                            className="form-control"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary cp-password-toggle"
                            onClick={() => setShowNew(!showNew)}
                          >
                            <i className={`fa ${showNew ? "fa-eye-slash" : "fa-eye"}`}></i>
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="form-label fw-semibold" style={{ fontSize: 12.5, color: "#374151" }}>Confirm Password</label>
                        <div className="input-group cp-input-wrap">
                          <i className="fa-solid fa-shield cp-icon" />
                          <input
                            type={showConfirm ? "text" : "password"}
                            className="form-control"
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary cp-password-toggle"
                            onClick={() => setShowConfirm(!showConfirm)}
                          >
                            <i className={`fa ${showConfirm ? "fa-eye-slash" : "fa-eye"}`}></i>
                          </button>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end">
                        <button
                          type="submit"
                          className="btn text-white fw-semibold px-4"
                          style={{
                            background: "#0e606c",
                            borderRadius: 10,
                            height: 42,
                            fontSize: 14,
                          }}
                          disabled={passLoading}
                        >
                          {passLoading ? <><span className="spinner-border spinner-border-sm me-2" />Updating...</> : "Change Password"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default CustomerProfile