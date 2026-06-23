import { useState, useEffect, useRef } from "react"
import { getAdminProfile, updateAdminProfile, changeAdminPassword, STORAGE_URL } from "../../utils/adminApi"
import AdminPageHeader from "../../admin/components/AdminPageHeader"

function Account() {
  // Profile states
  const [profile, setProfile]   = useState({ name: "", email: "", mobile: "", profile_img: "" })
  const [preview, setPreview]   = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [profLoading, setProfLoading] = useState(false)
  const [profSuccess, setProfSuccess] = useState("")
  const [profError, setProfError]     = useState("")

  // Password states
  const [oldPass, setOldPass]     = useState("")
  const [newPass, setNewPass]     = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [showOld, setShowOld]     = useState(false)
  const [showNew, setShowNew]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [passSuccess, setPassSuccess] = useState("")
  const [passError, setPassError]     = useState("")

  const fileRef = useRef()

  // Profile load
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminProfile()
        setProfile(data.data)
        setPreview(
          data.data.profile_img
            ? (data.data.profile_img.startsWith("http")
                ? data.data.profile_img
                : STORAGE_URL + data.data.profile_img)
            : null
        )
      } catch (err) { console.error(err) }
    }
    load()
  }, [])

  // Photo select
  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPreview(URL.createObjectURL(file))
  }

  // Profile submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfError(""); setProfSuccess(""); setProfLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", profile.name)
      formData.append("email", profile.email)
      formData.append("mobile", profile.mobile)
      if (photoFile) formData.append("profile_img", photoFile)

      const data = await updateAdminProfile(formData)
      setProfile(data.data)

      if (!photoFile) {
        setPreview(
          data.data.profile_img
            ? (data.data.profile_img.startsWith("http")
                ? data.data.profile_img
                : STORAGE_URL + data.data.profile_img)
            : null
        )
      }

      setPhotoFile(null)
      setProfSuccess("Profile updated successfully!")
      localStorage.setItem("admin_user", JSON.stringify(data.data))
      window.dispatchEvent(new CustomEvent("adminUserUpdated"))

    } catch (err) {
      setProfError(err.message || "Update failed.")
    } finally { setProfLoading(false) }
  }

  // Password submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPassError(""); setPassSuccess("")

    if (newPass !== confirmPass) {
      setPassError("New passwords do not match.")
      return
    }
    if (newPass.length < 6) {
      setPassError("Password must be at least 6 characters.")
      return
    }

    setPassLoading(true)
    try {
      await changeAdminPassword(oldPass, newPass)
      setPassSuccess("Password changed successfully!")
      setOldPass(""); setNewPass(""); setConfirmPass("")
    } catch (err) {
      setPassError(err.message || "Failed to change password.")
    } finally { setPassLoading(false) }
  }

  return (
    <>
      <AdminPageHeader
        icon="fa-user-gear"
        title="My Account"
        subtitle="Manage your profile and password"
      />
      <div className="row gy-4">

        {/* Profile Card */}
        <div className="col-12 col-lg-6">
          <div className="app-card app-card-account shadow-sm">
            <div className="app-card-header p-3 border-bottom">
              <h4 className="app-card-title">Profile</h4>
            </div>
            <div className="app-card-body p-4">

              {profSuccess && (
                <div className="alert alert-success py-2 d-flex align-items-center gap-2">
                  <i className="fa fa-check-circle" /><small>{profSuccess}</small>
                </div>
              )}
              {profError && (
                <div className="alert alert-danger py-2 d-flex align-items-center gap-2">
                  <i className="fa fa-exclamation-circle" /><small>{profError}</small>
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>

                {/* Photo */}
                <div className="text-center mb-4">
                  <div style={{position:'relative', display:'inline-block'}}>
                    <img
                      src={preview || "/admin-assets/images/user.png"}
                      alt="Profile"
                      style={{width:90, height:90, borderRadius:'50%', objectFit:'cover', border:'3px solid #e2e8f0'}}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current.click()}
                      style={{
                        position:'absolute', bottom:0, right:0,
                        width:28, height:28, borderRadius:'50%',
                        background:'#0e606c', border:'2px solid #fff',
                        color:'#fff', cursor:'pointer', fontSize:12,
                        display:'flex', alignItems:'center', justifyContent:'center'
                      }}
                    >
                      <i className="fa fa-camera" />
                    </button>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{display:'none'}}
                    onChange={handlePhotoChange}
                  />
                  <div className="mt-2" style={{fontSize:12, color:'#a0aec0'}}>Click camera to change photo</div>
                </div>

                {/* Name */}
                <div className="mb-3">
                  <label className="form-label small text-secondary">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter name"
                    value={profile.name || ""}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                  />
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label small text-secondary">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter email"
                    value={profile.email || ""}
                    onChange={e => setProfile({...profile, email: e.target.value})}
                  />
                </div>

                {/* Mobile */}
                <div className="mb-4">
                  <label className="form-label small text-secondary">Mobile</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter mobile"
                    value={profile.mobile || ""}
                    onChange={e => setProfile({...profile, mobile: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  className="btn w-100 text-white"
                  style={{background:'#0e606c', borderRadius:8, height:44, fontWeight:600}}
                  disabled={profLoading}
                >
                  {profLoading
                    ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                    : <><i className="fa fa-save me-2" />Save Profile</>
                  }
                </button>

              </form>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="col-12 col-lg-6">
          <div className="app-card app-card-account shadow-sm">
            <div className="app-card-header p-3 border-bottom">
              <h4 className="app-card-title">Change Password</h4>
            </div>
            <div className="app-card-body p-4">

              {passSuccess && (
                <div className="alert alert-success py-2 d-flex align-items-center gap-2">
                  <i className="fa fa-check-circle" /><small>{passSuccess}</small>
                </div>
              )}
              {passError && (
                <div className="alert alert-danger py-2 d-flex align-items-center gap-2">
                  <i className="fa fa-exclamation-circle" /><small>{passError}</small>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>

                {/* Current Password */}
                <div className="mb-3">
                  <label className="form-label small text-secondary">Current Password</label>
                  <div className="input-group">
                    <input
                      type={showOld ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter current password"
                      value={oldPass}
                      onChange={e => setOldPass(e.target.value)}
                      required
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowOld(v => !v)}>
                      <i className={`fa ${showOld ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="mb-3">
                  <label className="form-label small text-secondary">New Password</label>
                  <div className="input-group">
                    <input
                      type={showNew ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter new password"
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      required
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowNew(v => !v)}>
                      <i className={`fa ${showNew ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className="form-label small text-secondary">Confirm New Password</label>
                  <div className="input-group">
                    <input
                      type={showConfirm ? "text" : "password"}
                      className="form-control"
                      placeholder="Re-enter new password"
                      value={confirmPass}
                      onChange={e => setConfirmPass(e.target.value)}
                      required
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowConfirm(v => !v)}>
                      <i className={`fa ${showConfirm ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn w-100 text-white"
                  style={{background:'#0e606c', borderRadius:8, height:44, fontWeight:600}}
                  disabled={passLoading}
                >
                  {passLoading
                    ? <><span className="spinner-border spinner-border-sm me-2" />Updating...</>
                    : <><i className="fa fa-lock me-2" />Change Password</>
                  }
                </button>

              </form>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default Account
