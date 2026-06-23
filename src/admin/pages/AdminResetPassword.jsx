import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { adminResetPassword } from "../../utils/adminApi"

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');
  .al-root { min-height:100vh; font-family:'DM Sans',sans-serif; }
  .al-left  { background:#0b5560; position:relative; overflow:hidden; }
  .al-grid  { position:absolute; inset:0; opacity:.07;
    background-image: linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),
                      linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px);
    background-size:40px 40px; }
  .al-c1 { position:absolute; width:280px; height:280px; border-radius:50%; background:rgba(255,255,255,.04); top:-60px; left:-80px; }
  .al-c2 { position:absolute; width:320px; height:320px; border-radius:50%; background:rgba(255,255,255,.04); bottom:80px; right:-100px; }
  .al-fade { position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,.38),transparent 55%); }
  .al-heading { font-family:'Playfair Display',Georgia,serif; color:#fff; font-size:30px; line-height:1.25; }
  .al-eyebrow { font-size:24px; font-weight:600; color:#0e8a78; letter-spacing:.1em; text-transform:uppercase; }
  .al-input { height:46px; border:1.5px solid #e2e8f0 !important; border-radius:10px !important; background:#f8fafc; padding-left:42px !important; font-family:'DM Sans',sans-serif; }
  .al-input:focus { border-color:#0e606c !important; background:#fff !important; box-shadow:none !important; }
  .al-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#a0aec0; z-index:5; pointer-events:none; }
  .al-toggle { position:absolute; right:12px; top:50%; transform:translateY(-50%); z-index:5; background:none; border:none; color:#a0aec0; cursor:pointer; }
  .al-btn { height:48px; background:#0e606c; border:none; border-radius:10px; font-size:14.5px; font-weight:600; font-family:'DM Sans',sans-serif; letter-spacing:.025em; transition:background .15s; }
  .al-btn:hover { background:#0a4f59; }
  .al-btn:disabled { background:#a0c4c8; }
  .al-link { color:#0e8a78; font-weight:500; font-size:13px; text-decoration:none; background:none; border:none; padding:0; cursor:pointer; font-family:'DM Sans',sans-serif; }
  .al-link:hover { text-decoration:underline; }
`

function AdminResetPassword() {
  const [password, setPassword]         = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPass, setShowPass]         = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState("")
  const [success, setSuccess]           = useState(false)
  const [tokenValid, setTokenValid]     = useState(true)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // URL se token aur email lo
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  useEffect(() => {
    // Token ya email nahi hai to invalid
    if (!token || !email) {
      setTokenValid(false)
    }
  }, [token, email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Password match check
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)
    try {
      await adminResetPassword(email, token, password, confirmPassword)
      setSuccess(true)
      // 3 second baad login par redirect
      setTimeout(() => navigate("/admin/login"), 3000)
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally { setLoading(false) }
  }

  return (
    <>
      <style>{css}</style>
      <div className="row g-0 al-root">

        {/* ── Left Panel ── */}
        <div className="col-lg-5 d-none d-lg-flex flex-column p-5 al-left">
          <div className="al-grid" />
          <div className="al-c1" /><div className="al-c2" />
          <div className="al-fade" />

          <div className="d-flex align-items-center gap-3 p-4" style={{zIndex:2, margin:'auto'}}>
            <img src="/admin-assets/images/logo.png" alt="logo" style={{width:280, objectFit:'contain'}} />
          </div>

          <div style={{zIndex:2}}>
            <h2 className="al-heading mb-3">Manage your pantry with ease</h2>
            <p className="mb-4" style={{color:'rgba(255,255,255,.58)', fontSize:14}}>
              Complete control over orders, products, and customers — all in one place.
            </p>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="col-12 col-lg-7 d-flex flex-column justify-content-center px-4 px-md-5 py-5 position-relative" style={{background:'#0b5560'}}>
          <div className="al-grid" />
          <div className="al-c1" /><div className="al-c2" />
          <div className="al-fade" />

          <div style={{width:'100%', margin:'0 auto', padding:20, background:'#ffffff', position:'relative', zIndex:2}}>
            <div style={{maxWidth:420, width:'100%', margin:'0 auto'}}>

              <p className="al-eyebrow mb-2">Admin Portal</p>
              <h1 className="fw-semibold mb-1" style={{fontSize:28, color:'#111'}}>Set New Password</h1>
              <p className="text-secondary mb-4" style={{fontSize:14}}>
                Enter your new password below.
              </p>

              {/* Invalid Token */}
              {!tokenValid && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-3 mb-4">
                  <i className="fa fa-times-circle fa-lg" />
                  <div>
                    <div className="fw-semibold" style={{fontSize:14}}>Invalid or expired link!</div>
                    <small>Please request a new password reset link.</small>
                  </div>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="alert alert-success d-flex align-items-center gap-2 py-3 mb-4">
                  <i className="fa fa-check-circle fa-lg" />
                  <div>
                    <div className="fw-semibold" style={{fontSize:14}}>Password reset successfully!</div>
                    <small>Redirecting to login page...</small>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                  <i className="fa fa-exclamation-circle" /><small>{error}</small>
                </div>
              )}

              {/* Form — token valid ho aur success nahi hua to dikhao */}
              {tokenValid && !success && (
                <form onSubmit={handleSubmit} noValidate>

                  {/* New Password */}
                  <div className="mb-3">
                    <label className="form-label small text-secondary" htmlFor="al-pass">New Password</label>
                    <div className="position-relative">
                      <span className="al-icon"><i className="fa fa-lock" /></span>
                      <input
                        id="al-pass"
                        type={showPass ? "text" : "password"}
                        className="form-control al-input"
                        placeholder="Enter new password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{paddingRight:40}}
                        required
                      />
                      <button type="button" className="al-toggle" onClick={() => setShowPass(v => !v)}
                        aria-label={showPass ? "Hide password" : "Show password"}>
                        <i className={`fa ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label className="form-label small text-secondary" htmlFor="al-confirm">Confirm Password</label>
                    <div className="position-relative">
                      <span className="al-icon"><i className="fa fa-lock" /></span>
                      <input
                        id="al-confirm"
                        type={showConfirm ? "text" : "password"}
                        className="form-control al-input"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        style={{paddingRight:40}}
                        required
                      />
                      <button type="button" className="al-toggle" onClick={() => setShowConfirm(v => !v)}
                        aria-label={showConfirm ? "Hide password" : "Show password"}>
                        <i className={`fa ${showConfirm ? "fa-eye-slash" : "fa-eye"}`} />
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn text-white w-100 al-btn" disabled={loading}>
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2" />Resetting...</>
                      : <><i className="fa fa-check me-2" />Reset Password</>
                    }
                  </button>

                </form>
              )}

              <div className="text-center mt-4">
                <button type="button" className="al-link" onClick={() => navigate("/admin/login")}>
                  <i className="fa fa-arrow-left me-1" />Back to Login
                </button>
              </div>

              <p className="text-center mt-4 mb-0" style={{fontSize:12.5, color:'#a0aec0'}}>
                © 2026 Restaurant Pantry LA
              </p>

            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default AdminResetPassword
