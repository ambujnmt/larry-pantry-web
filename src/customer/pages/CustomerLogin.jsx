import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { customerLogin, customerRegister, customerForgotPassword } from "../../utils/customerApi"

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');
  .cl-root { min-height:100vh; font-family:'DM Sans',sans-serif; }
  .cl-left  { background:#0b5560; position:relative; overflow:hidden; }
  .cl-grid  { position:absolute; inset:0; opacity:.07;
    background-image: linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),
                      linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px);
    background-size:40px 40px; }
  .cl-c1 { position:absolute; width:280px; height:280px; border-radius:50%; background:rgba(255,255,255,.04); top:-60px; left:-80px; }
  .cl-c2 { position:absolute; width:320px; height:320px; border-radius:50%; background:rgba(255,255,255,.04); bottom:80px; right:-100px; }
  .cl-fade { position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,.38),transparent 55%); }
  .cl-heading { font-family:'Playfair Display',Georgia,serif; color:#fff; font-size:30px; line-height:1.25; }
  .cl-eyebrow { font-size:22px; font-weight:600; color:#0e8a78; letter-spacing:.05em; text-transform:uppercase; }
  .cl-input { height:46px; border:1.5px solid #e2e8f0 !important; border-radius:10px !important; background:#f8fafc; padding-left:42px !important; font-family:'DM Sans',sans-serif; }
  .cl-input:focus { border-color:#0e606c !important; background:#fff !important; box-shadow:none !important; }
  .cl-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#a0aec0; z-index:5; pointer-events:none; }
  .cl-toggle { position:absolute; right:12px; top:50%; transform:translateY(-50%); z-index:5; background:none; border:none; color:#a0aec0; cursor:pointer; }
  .cl-btn { height:48px; background:#0e606c; border:none; border-radius:10px; font-size:14.5px; font-weight:600; font-family:'DM Sans',sans-serif; letter-spacing:.025em; transition:background .15s; }
  .cl-btn:hover { background:#0a4f59; }
  .cl-btn:disabled { background:#a0c4c8; }
  .cl-link { color:#0e8a78; font-weight:500; font-size:13px; text-decoration:none; background:none; border:none; padding:0; cursor:pointer; font-family:'DM Sans',sans-serif; }
  .cl-link:hover { text-decoration:underline; }
  .cl-tab { cursor:pointer; padding:8px 20px; border-radius:8px; font-weight:600; font-size:14px; transition:all .15s; border:none; background:transparent; }
  .cl-tab.active { background:#0e606c; color:#fff; }
  .cl-tab:not(.active) { color:#64748b; }
`

function CustomerLogin() {
  const [tab, setTab]           = useState("login")   // "login" | "register" | "reset"
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [sent, setSent]         = useState(false)

  const [email, setEmail]                   = useState("")
  const [password, setPassword]             = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName]                     = useState("")
  const [phone, setPhone]                   = useState("")
  const [resetEmail, setResetEmail]         = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("customer_token")
    if (token) navigate("/customer/dashboard")
  }, [navigate])

  const switchTab = (t) => { setTab(t); setError(""); setSent(false) }

  // API response se token + user nikalo — different response structures handle karta hai
  const saveAuth = (data) => {
    const token = data?.data?.token ?? data?.token ?? data?.access_token ?? ""
    const user  = data?.data?.user  ?? data?.data?.customer ?? data?.user ?? {}
    localStorage.setItem("customer_token", token)
    localStorage.setItem("customer_user", JSON.stringify(user))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(""); setLoading(true)
    try {
      const data = await customerLogin(email, password)
      saveAuth(data)
      navigate("/customer/dashboard")
    } catch (err) {
      setError(err.message || "Invalid credentials.")
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setError(""); setLoading(true)
    try {
      const data = await customerRegister({
        name,
        email,
        password,
        password_confirmation: confirmPassword,
        phone,
      })
      saveAuth(data)
      navigate("/customer/dashboard")
    } catch (err) {
      setError(err.message || "Registration failed.")
    } finally { setLoading(false) }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError(""); setLoading(true)
    try {
      await customerForgotPassword(resetEmail)
      setSent(true)
    } catch (err) {
      setError(err.message || "Something went wrong.")
    } finally { setLoading(false) }
  }

  return (
    <>
      <style>{css}</style>
      <div className="row g-0 cl-root">

        {/* ── Left Panel ── */}
        <div className="col-lg-5 d-none d-lg-flex flex-column p-5 cl-left">
          <div className="cl-grid" />
          <div className="cl-c1" /><div className="cl-c2" />
          <div className="cl-fade" />

          <div className="d-flex align-items-center gap-3 p-4" style={{zIndex:2, margin:'auto'}}>
            <img src="/assets/img/logo.png" alt="logo" style={{width:240, objectFit:'contain'}} />
          </div>

          <div style={{zIndex:2}}>
            <h2 className="cl-heading mb-3">Your pantry, your way</h2>
            <p className="mb-4" style={{color:'rgba(255,255,255,.58)', fontSize:14}}>
              Browse fresh products, place orders, and track deliveries — all from one place.
            </p>
            <div className="d-flex gap-3">
              <Link to="/" className="btn btn-outline-light btn-sm rounded-pill px-3">
                <i className="fa fa-home me-1" /> Go to Home
              </Link>
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="col-12 col-lg-7 d-flex flex-column justify-content-center px-4 px-md-5 py-5 position-relative" style={{background:'#0b5560'}}>
          <div className="cl-grid" />
          <div className="cl-c1" /><div className="cl-c2" />
          <div className="cl-fade" />

          <div style={{width:'100%', margin:'0 auto', padding:20, background:'#ffffff', position:'relative', zIndex:2}}>
            <div style={{maxWidth:440, width:'100%', margin:'0 auto'}}>

              <p className="cl-eyebrow mb-3">Customer Portal</p>

              {/* ── TABS (Login / Register) ── */}
              {tab !== "reset" && (
                <div className="d-flex gap-2 mb-4 p-1 rounded-3" style={{background:'#f1f5f9', width:'fit-content'}}>
                  <button className={`cl-tab ${tab === "login" ? "active" : ""}`} onClick={() => switchTab("login")}>Sign In</button>
                  <button className={`cl-tab ${tab === "register" ? "active" : ""}`} onClick={() => switchTab("register")}>Register</button>
                </div>
              )}

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                  <i className="fa fa-exclamation-circle" /><small>{error}</small>
                </div>
              )}

              {/* ── LOGIN FORM ── */}
              {tab === "login" && (
                <>
                  <p className="text-secondary mb-4" style={{fontSize:14}}>Sign in to your account to continue</p>
                  <form onSubmit={handleLogin} noValidate>
                    <div className="mb-3">
                      <label className="form-label small text-secondary" htmlFor="cl-email">Email Address</label>
                      <div className="position-relative">
                        <span className="cl-icon"><i className="fa fa-envelope" /></span>
                        <input id="cl-email" type="email" className="form-control cl-input"
                          placeholder="you@example.com" value={email}
                          onChange={e => setEmail(e.target.value)} autoComplete="email" required />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small text-secondary" htmlFor="cl-pass">Password</label>
                      <div className="position-relative">
                        <span className="cl-icon"><i className="fa fa-lock" /></span>
                        <input id="cl-pass" type={showPass ? "text" : "password"} className="form-control cl-input"
                          placeholder="Enter your password" value={password}
                          onChange={e => setPassword(e.target.value)}
                          style={{paddingRight:40}} required />
                        <button type="button" className="cl-toggle" onClick={() => setShowPass(v => !v)}>
                          <i className={`fa ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                        </button>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="form-check mb-0">
                        <input className="form-check-input" type="checkbox" id="cl-remember" />
                        <label className="form-check-label small" htmlFor="cl-remember">Remember me</label>
                      </div>
                      <button type="button" className="cl-link" onClick={() => switchTab("reset")}>
                        Forgot password?
                      </button>
                    </div>

                    <button type="submit" className="btn text-white w-100 cl-btn" disabled={loading}>
                      {loading
                        ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</>
                        : <><i className="fa fa-sign-in me-2" />Sign In</>
                      }
                    </button>
                  </form>
                </>
              )}

              {/* ── REGISTER FORM ── */}
              {tab === "register" && (
                <>
                  <p className="text-secondary mb-4" style={{fontSize:14}}>Create your account — it's free!</p>
                  <form onSubmit={handleRegister} noValidate>
                    <div className="mb-3">
                      <label className="form-label small text-secondary" htmlFor="cl-name">Full Name</label>
                      <div className="position-relative">
                        <span className="cl-icon"><i className="fa fa-user" /></span>
                        <input id="cl-name" type="text" className="form-control cl-input"
                          placeholder="John Doe" value={name}
                          onChange={e => setName(e.target.value)} required />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small text-secondary" htmlFor="cl-reg-email">Email Address</label>
                      <div className="position-relative">
                        <span className="cl-icon"><i className="fa fa-envelope" /></span>
                        <input id="cl-reg-email" type="email" className="form-control cl-input"
                          placeholder="you@example.com" value={email}
                          onChange={e => setEmail(e.target.value)} autoComplete="email" required />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small text-secondary" htmlFor="cl-phone">Phone Number</label>
                      <div className="position-relative">
                        <span className="cl-icon"><i className="fa fa-phone" /></span>
                        <input id="cl-phone" type="tel" className="form-control cl-input"
                          placeholder="+1 (555) 000-0000" value={phone}
                          onChange={e => setPhone(e.target.value)} />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small text-secondary" htmlFor="cl-reg-pass">Password</label>
                      <div className="position-relative">
                        <span className="cl-icon"><i className="fa fa-lock" /></span>
                        <input id="cl-reg-pass" type={showPass ? "text" : "password"} className="form-control cl-input"
                          placeholder="Create a password" value={password}
                          onChange={e => setPassword(e.target.value)}
                          style={{paddingRight:40}} required />
                        <button type="button" className="cl-toggle" onClick={() => setShowPass(v => !v)}>
                          <i className={`fa ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label small text-secondary" htmlFor="cl-reg-confirm">Confirm Password</label>
                      <div className="position-relative">
                        <span className="cl-icon"><i className="fa fa-lock" /></span>
                        <input id="cl-reg-confirm" type={showPass ? "text" : "password"} className="form-control cl-input"
                          placeholder="Re-enter your password" value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          style={{paddingRight:40}} required />
                      </div>
                    </div>

                    <button type="submit" className="btn text-white w-100 cl-btn" disabled={loading}>
                      {loading
                        ? <><span className="spinner-border spinner-border-sm me-2" />Creating account...</>
                        : <><i className="fa fa-user-plus me-2" />Create Account</>
                      }
                    </button>
                  </form>
                </>
              )}

              {/* ── FORGOT PASSWORD FORM ── */}
              {tab === "reset" && (
                <>
                  <h1 className="fw-semibold mb-1" style={{fontSize:26, color:'#111'}}>Reset Password</h1>
                  <p className="text-secondary mb-4" style={{fontSize:14}}>
                    Enter your email — we'll send you a reset link.
                  </p>

                  {sent ? (
                    <div className="alert alert-success d-flex align-items-center gap-2 py-3 mb-4">
                      <i className="fa fa-check-circle fa-lg" />
                      <div>
                        <div className="fw-semibold" style={{fontSize:14}}>Email sent!</div>
                        <small>Check your inbox for the reset link.</small>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleReset} noValidate>
                      <div className="mb-4">
                        <label className="form-label small text-secondary" htmlFor="cl-reset-email">Email Address</label>
                        <div className="position-relative">
                          <span className="cl-icon"><i className="fa fa-envelope" /></span>
                          <input id="cl-reset-email" type="email" className="form-control cl-input"
                            placeholder="you@example.com" value={resetEmail}
                            onChange={e => setResetEmail(e.target.value)} required />
                        </div>
                      </div>
                      <button type="submit" className="btn text-white w-100 cl-btn mb-3" disabled={loading}>
                        {loading
                          ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</>
                          : <><i className="fa fa-paper-plane me-2" />Send Reset Link</>
                        }
                      </button>
                    </form>
                  )}

                  <div className="text-center">
                    <button type="button" className="cl-link" onClick={() => switchTab("login")}>
                      <i className="fa fa-arrow-left me-1" />Back to Login
                    </button>
                  </div>
                </>
              )}

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

export default CustomerLogin
