import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { customerLogin, customerRegister, customerVerifyOtp, customerResendOtp, customerForgotPassword, customerResetPassword } from "../../utils/customerApi"

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
  .otp-box { width:52px; height:58px; text-align:center; font-size:22px; font-weight:600;
    border:1.5px solid #e2e8f0; border-radius:10px; background:#f8fafc;
    font-family:'DM Sans',sans-serif; color:#0b5560; transition:border-color .15s, background .15s; }
  .otp-box:focus { border-color:#0e606c !important; background:#fff !important; outline:none; box-shadow:none; }
  .step-dot { width:8px; height:8px; border-radius:50%; background:#e2e8f0; transition:background .2s; }
  .step-dot.active { background:#0e606c; }
  .step-dot.done { background:#0e8a78; }
`

function CustomerLogin() {
  const [tab, setTab]               = useState("login")
  const [showPass, setShowPass]     = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState("")

  // Login
  const [email, setEmail]           = useState("")
  const [password, setPassword]     = useState("")

  // Register
  const [confirmPassword, setConfirmPassword] = useState("")
  const [first_name, setFirstName]            = useState("")
  const [last_name, setLastName]              = useState("")
  const [mobile, setMobile]                   = useState("")

  // Register OTP
  const [otpDigits, setOtpDigits]           = useState(["","","","","",""])
  const [otpEmail, setOtpEmail]             = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpRefs = useRef([])

  // Reset Password
  const [resetStep, setResetStep]               = useState(1)
  const [resetEmail, setResetEmail]             = useState("")
  const [resetOtpDigits, setResetOtpDigits]     = useState(["","","","","",""])
  const [resetResendCooldown, setResetResendCooldown] = useState(0)
  const [newPassword, setNewPassword]           = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const resetOtpRefs = useRef([])
  const [success, setSuccess] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("customer_token")
    if (token) navigate("/customer/dashboard")
  }, [navigate])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  useEffect(() => {
    if (resetResendCooldown <= 0) return
    const t = setTimeout(() => setResetResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resetResendCooldown])

  const switchTab = (t) => {
    setTab(t); setError(""); setSuccess("")
    setResetStep(1); setResetEmail("")
    setResetOtpDigits(["","","","","",""])
    setNewPassword(""); setConfirmNewPassword("")
  }

  const saveAuth = (data) => {
    const token = data?.data?.token ?? data?.token ?? data?.access_token ?? ""
    const user  = data?.data?.user  ?? data?.data?.customer ?? data?.user ?? {}
    localStorage.setItem("customer_token", token)
    localStorage.setItem("customer_user", JSON.stringify(user))
  }

  // Generic OTP box handlers
  // Generic OTP box handlers
  const makeOtpHandlers = (digits, setDigits, refs) => ({
    onChange: (index, value) => {
      const cleanValue = value.replace(/\D/g, "")
      if (!cleanValue) return

      const updated = [...digits]
      const lastChar = cleanValue.slice(-1)
      updated[index] = lastChar
      setDigits(updated)

      if (index < 5) {
        setTimeout(() => {
          refs.current[index + 1]?.focus()
          refs.current[index + 1]?.select() 
        }, 10)
      }
    },
    onKeyDown: (index, e) => {
      const updated = [...digits]

      if (e.key === "Backspace") {
        e.preventDefault() 
        
        if (digits[index]) {
          updated[index] = ""
          setDigits(updated)
        } else if (index > 0) {
          updated[index - 1] = ""
          setDigits(updated)
          refs.current[index - 1]?.focus()
        }
      }
    },
    onPaste: (e) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
      if (!pasted) return
      
      const updated = [...digits]
      pasted.split("").forEach((ch, i) => {
        if (i < 6) updated[i] = ch
      })
      setDigits(updated)
      const focusIndex = Math.min(pasted.length, 5)
      refs.current[focusIndex]?.focus()
    },
  })

  const regOtp   = makeOtpHandlers(otpDigits, setOtpDigits, otpRefs)
  const resetOtp = makeOtpHandlers(resetOtpDigits, setResetOtpDigits, resetOtpRefs)

  // ── LOGIN ──
  const handleLogin = async (e) => {
    e.preventDefault(); setError(""); setLoading(true)
    try {
      const data = await customerLogin(email, password)
      saveAuth(data); navigate("/customer/dashboard")
    } catch (err) { setError(err.message || "Invalid credentials.") }
    finally { setLoading(false) }
  }

  // ── REGISTER ──
  const handleRegister = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) { setError("Passwords do not match."); return }
    setError(""); setLoading(true)
    try {
      await customerRegister({ first_name, last_name, email, password, password_confirmation: confirmPassword, mobile })
      setOtpEmail(email); setOtpDigits(["","","","","",""]); setResendCooldown(60); setTab("otp")
    } catch (err) { setError(err.message || "Registration failed.") }
    finally { setLoading(false) }
  }

  // ── REGISTER OTP VERIFY ──
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const otp = otpDigits.join("")
    if (otp.length < 6) { setError("Please enter the complete 6-digit code."); return }
    setError(""); setLoading(true)
    try {
      const data = await customerVerifyOtp({ email: otpEmail, otp })
      saveAuth(data); navigate("/customer/dashboard")
    } catch (err) {
      setError(err.message || "Invalid or expired OTP.")
      setOtpDigits(["","","","","",""]); otpRefs.current[0]?.focus()
    } finally { setLoading(false) }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    setError(""); setLoading(true)
    try {
      await customerResendOtp({ email: otpEmail })
      setResendCooldown(60); setOtpDigits(["","","","","",""]); otpRefs.current[0]?.focus()
    } catch (err) { setError(err.message || "Could not resend OTP.") }
    finally { setLoading(false) }
  }

  // ══════════════════════════════════
  // RESET PASSWORD — 3 STEPS
  // ══════════════════════════════════

  // Step 1: Email → OTP bhejo
  const handleResetSendOtp = async (e) => {
    e.preventDefault(); setError(""); setLoading(true)
    try {
      await customerForgotPassword(resetEmail)
      setResetOtpDigits(["","","","","",""]); setResetResendCooldown(60); setResetStep(2)
    } catch (err) { setError(err.message || "Email not found.") }
    finally { setLoading(false) }
  }

  // Step 2: OTP verify
  const handleResetVerifyOtp = async (e) => {
    e.preventDefault()
    const otp = resetOtpDigits.join("")
    if (otp.length < 6) { setError("Please enter the complete 6-digit code."); return }
    setError(""); setLoading(true)
    try {
      await customerVerifyOtp({ email: resetEmail, otp })
      setResetStep(3)
    } catch (err) {
      setError(err.message || "Invalid or expired OTP.")
      setResetOtpDigits(["","","","","",""]); resetOtpRefs.current[0]?.focus()
    } finally { setLoading(false) }
  }

  const handleResetResendOtp = async () => {
    if (resetResendCooldown > 0) return
    setError(""); setLoading(true)
    try {
      await customerForgotPassword(resetEmail)
      setResetResendCooldown(60); setResetOtpDigits(["","","","","",""]); resetOtpRefs.current[0]?.focus()
    } catch (err) { setError(err.message || "Could not resend OTP.") }
    finally { setLoading(false) }
  }

  // Step 3: Naya password
  const handleResetNewPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmNewPassword) { setError("Passwords do not match."); return }
    setError(""); setLoading(true)
    try {
      const otp = resetOtpDigits.join("")
      // backend: POST /create-new-password  { email, otp, password }
      await customerResetPassword(resetEmail, null, newPassword, confirmNewPassword, otp)
      setSuccess("Password updated successfully. Please login with your new password.")
      setTimeout(() => {
        switchTab("login")
      }, 4000)

    } catch (err) { setError(err.message || "Could not update password.") }
    finally { setLoading(false) }
  }

  // OTP boxes UI
  const OtpBoxes = ({ digits, handlers, refs }) => (
    <div className="d-flex justify-content-between gap-2 mb-4" onPaste={handlers.onPaste}>
      {digits.map((digit, i) => (
        <input key={i} ref={el => refs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1} className="otp-box"
          value={digit} onChange={e => handlers.onChange(i, e.target.value)}
          onKeyDown={e => handlers.onKeyDown(i, e)} autoFocus={i === 0} />
      ))}
    </div>
  )

  return (
    <>
      <style>{css}</style>
      <div className="row g-0 cl-root">

        {/* Left Panel */}
        <div className="col-lg-5 d-none d-lg-flex flex-column p-5 cl-left">
          <div className="cl-grid" /><div className="cl-c1" /><div className="cl-c2" /><div className="cl-fade" />
          <div className="d-flex align-items-center gap-3 p-4" style={{zIndex:2, margin:'auto'}}>
            <img src="/assets/img/logo.png" alt="logo" style={{width:240, objectFit:'contain'}} />
          </div>
          <div style={{zIndex:2}}>
            <h2 className="cl-heading mb-3">Your pantry, your way</h2>
            <p className="mb-4" style={{color:'rgba(255,255,255,.58)', fontSize:14}}>
              Browse fresh products, place orders, and track deliveries — all from one place.
            </p>
            <Link to="/" className="btn btn-outline-light btn-sm rounded-pill px-3">
              <i className="fa fa-home me-1" /> Go to Home
            </Link>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-12 col-lg-7 d-flex flex-column justify-content-center px-4 px-md-5 py-5 position-relative" style={{background:'#0b5560'}}>
          <div className="cl-grid" /><div className="cl-c1" /><div className="cl-c2" /><div className="cl-fade" />

          <div style={{width:'100%', margin:'0 auto', padding:20, background:'#ffffff', position:'relative', zIndex:2}}>
            <div style={{maxWidth:440, width:'100%', margin:'0 auto'}}>

              <p className="cl-eyebrow mb-3">Customer Portal</p>

              {tab !== "reset" && tab !== "otp" && (
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

              {success && (
                <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3">
                  <i className="fa fa-check-circle" />
                  <small>{success}</small>
                </div>
              )}

              {/* ════ LOGIN ════ */}
              {tab === "login" && (
                <>
                  <p className="text-secondary mb-4" style={{fontSize:14}}>Sign in to your account to continue</p>
                  <form onSubmit={handleLogin} noValidate>
                    <div className="mb-3">
                      <label className="form-label small text-secondary">Email Address</label>
                      <div className="position-relative">
                        <span className="cl-icon"><i className="fa fa-envelope" /></span>
                        <input type="email" className="form-control cl-input" placeholder="Enter your email ID"
                          value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small text-secondary">Password</label>
                      <div className="position-relative">
                        <span className="cl-icon"><i className="fa fa-lock" /></span>
                        <input type={showPass ? "text" : "password"} className="form-control cl-input"
                          placeholder="Enter your password" value={password}
                          onChange={e => setPassword(e.target.value)} style={{paddingRight:40}} required />
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
                      <button type="button" className="cl-link" onClick={() => switchTab("reset")}>Forgot password?</button>
                    </div>
                    <button type="submit" className="btn text-white w-100 cl-btn" disabled={loading}>
                      {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</> : <><i className="fa fa-sign-in me-2" />Sign In</>}
                    </button>
                  </form>
                </>
              )}

              {/* ════ REGISTER ════ */}
              {tab === "register" && (
                <>
                  <p className="text-secondary mb-4" style={{fontSize:14}}>Create your account — it's free!</p>
                  <form onSubmit={handleRegister} noValidate>
                    <div className="mb-3">
                      <label className="form-label small text-secondary">First Name</label>
                      <div className="position-relative">
                        <span className="cl-icon"><i className="fa fa-user" /></span>
                        <input type="text" className="form-control cl-input" placeholder="Enter first name" value={first_name} onChange={e => setFirstName(e.target.value)} required />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small text-secondary">Last Name</label>
                      <div className="position-relative">
                        <span className="cl-icon"><i className="fa fa-user" /></span>
                        <input type="text" className="form-control cl-input" placeholder="Enter last name" value={last_name} onChange={e => setLastName(e.target.value)} />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small text-secondary">Email Address</label>
                      <div className="position-relative">
                        <span className="cl-icon"><i className="fa fa-envelope" /></span>
                        <input type="email" className="form-control cl-input" placeholder="Enter your email ID" value={email} onChange={e => setEmail(e.target.value)} required />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small text-secondary">Phone Number</label>
                      <div className="position-relative">
                        <span className="cl-icon"><i className="fa fa-phone" /></span>
                        <input type="tel" className="form-control cl-input" placeholder="Enter your phone no." value={mobile} onChange={e => setMobile(e.target.value)} />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small text-secondary">Password</label>
                      <div className="position-relative">
                        <span className="cl-icon"><i className="fa fa-lock" /></span>
                        <input type={showPass ? "text" : "password"} className="form-control cl-input" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} style={{paddingRight:40}} required />
                        <button type="button" className="cl-toggle" onClick={() => setShowPass(v => !v)}>
                          <i className={`fa ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                        </button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="form-label small text-secondary">Confirm Password</label>
                      <div className="position-relative">
                        <span className="cl-icon"><i className="fa fa-lock" /></span>
                        <input type={showPass ? "text" : "password"} className="form-control cl-input" placeholder="Re-enter your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{paddingRight:40}} required />
                      </div>
                    </div>
                    <button type="submit" className="btn text-white w-100 cl-btn" disabled={loading}>
                      {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating account...</> : <><i className="fa fa-user-plus me-2" />Create Account</>}
                    </button>
                  </form>
                </>
              )}

              {/* ════ REGISTER OTP ════ */}
              {tab === "otp" && (
                <>
                  <button type="button" className="cl-link d-flex align-items-center gap-1 mb-3" onClick={() => switchTab("register")}>
                    <i className="fa fa-arrow-left" /> Back to Register
                  </button>
                  <div className="d-flex justify-content-center mb-3">
                    <div style={{width:64,height:64,borderRadius:'50%',background:'#e1f5ee',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <i className="fa fa-envelope" style={{fontSize:26,color:'#0b5560'}} />
                    </div>
                  </div>
                  <h2 className="fw-semibold text-center mb-1" style={{fontSize:22,color:'#111'}}>Verify your email</h2>
                  <p className="text-center text-secondary mb-4" style={{fontSize:13.5}}>
                    We've sent a 6-digit code to<br /><strong style={{color:'#0b5560'}}>{otpEmail}</strong>
                  </p>
                  <form onSubmit={handleVerifyOtp} noValidate>
                    <OtpBoxes digits={otpDigits} handlers={regOtp} refs={otpRefs} />
                    <button type="submit" className="btn text-white w-100 cl-btn mb-3" disabled={loading}>
                      {loading ? <><span className="spinner-border spinner-border-sm me-2" />Verifying...</> : <><i className="fa fa-check-circle me-2" />Verify & Continue</>}
                    </button>
                  </form>
                  <div className="text-center" style={{fontSize:13}}>
                    <span className="text-secondary">Didn't receive the code? </span>
                    {resendCooldown > 0
                      ? <span style={{color:'#a0aec0'}}>Resend in {resendCooldown}s</span>
                      : <button type="button" className="cl-link" onClick={handleResendOtp} disabled={loading}>Resend OTP</button>}
                  </div>
                </>
              )}

              {/* ════════════════════════════════
                  RESET PASSWORD — 3 STEPS
              ════════════════════════════════ */}
              {tab === "reset" && (
                <>
                  {/* Back + step dots */}
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <button type="button" className="cl-link d-flex align-items-center gap-1" onClick={() => {
                      setError("")
                      if (resetStep === 1) switchTab("login")
                      else setResetStep(s => s - 1)
                    }}>
                      <i className="fa fa-arrow-left" />
                      {resetStep === 1 ? "Back to Login" : "Back"}
                    </button>
                    <div className="ms-auto d-flex gap-2 align-items-center">
                      {[1,2,3].map(s => (
                        <div key={s} className={`step-dot ${s < resetStep ? "done" : s === resetStep ? "active" : ""}`} />
                      ))}
                    </div>
                  </div>

                  {/* Step 1 — Email */}
                  {resetStep === 1 && (
                    <>
                      <div className="d-flex justify-content-center mb-3">
                        <div style={{width:56,height:56,borderRadius:'50%',background:'#e1f5ee',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <i className="fa fa-lock" style={{fontSize:22,color:'#0b5560'}} />
                        </div>
                      </div>
                      <h2 className="fw-semibold text-center mb-1" style={{fontSize:22,color:'#111'}}>Forgot Password?</h2>
                      <p className="text-center text-secondary mb-4" style={{fontSize:13.5}}>
                        Enter your registered email — we'll send a verification code.
                      </p>
                      <form onSubmit={handleResetSendOtp} noValidate>
                        <div className="mb-4">
                          <label className="form-label small text-secondary">Email Address</label>
                          <div className="position-relative">
                            <span className="cl-icon"><i className="fa fa-envelope" /></span>
                            <input type="email" className="form-control cl-input" placeholder="Enter your email ID"
                              value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
                          </div>
                        </div>
                        <button type="submit" className="btn text-white w-100 cl-btn" disabled={loading}>
                          {loading ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</> : <><i className="fa fa-paper-plane me-2" />Send OTP</>}
                        </button>
                      </form>
                    </>
                  )}

                  {/* Step 2 — OTP */}
                  {resetStep === 2 && (
                    <>
                      <div className="d-flex justify-content-center mb-3">
                        <div style={{width:56,height:56,borderRadius:'50%',background:'#e1f5ee',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <i className="fa fa-shield" style={{fontSize:22,color:'#0b5560'}} />
                        </div>
                      </div>
                      <h2 className="fw-semibold text-center mb-1" style={{fontSize:22,color:'#111'}}>Enter OTP</h2>
                      <p className="text-center text-secondary mb-4" style={{fontSize:13.5}}>
                        6-digit code sent to<br /><strong style={{color:'#0b5560'}}>{resetEmail}</strong>
                      </p>
                      <form onSubmit={handleResetVerifyOtp} noValidate>
                        <OtpBoxes digits={resetOtpDigits} handlers={resetOtp} refs={resetOtpRefs} />
                        <button type="submit" className="btn text-white w-100 cl-btn mb-3" disabled={loading}>
                          {loading ? <><span className="spinner-border spinner-border-sm me-2" />Verifying...</> : <><i className="fa fa-check-circle me-2" />Verify OTP</>}
                        </button>
                      </form>
                      <div className="text-center" style={{fontSize:13}}>
                        <span className="text-secondary">Didn't receive the code? </span>
                        {resetResendCooldown > 0
                          ? <span style={{color:'#a0aec0'}}>Resend in {resetResendCooldown}s</span>
                          : <button type="button" className="cl-link" onClick={handleResetResendOtp} disabled={loading}>Resend OTP</button>}
                      </div>
                    </>
                  )}

                  {/* Step 3 — New Password */}
                  {resetStep === 3 && (
                    <>
                      <div className="d-flex justify-content-center mb-3">
                        <div style={{width:56,height:56,borderRadius:'50%',background:'#e1f5ee',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <i className="fa fa-key" style={{fontSize:22,color:'#0b5560'}} />
                        </div>
                      </div>
                      <h2 className="fw-semibold text-center mb-1" style={{fontSize:22,color:'#111'}}>Set New Password</h2>
                      <p className="text-center text-secondary mb-4" style={{fontSize:13.5}}>
                        Choose a strong password for your account.
                      </p>
                      <form onSubmit={handleResetNewPassword} noValidate>
                        <div className="mb-3">
                          <label className="form-label small text-secondary">New Password</label>
                          <div className="position-relative">
                            <span className="cl-icon"><i className="fa fa-lock" /></span>
                            <input type={showNewPass ? "text" : "password"} className="form-control cl-input"
                              placeholder="Enter new password" value={newPassword}
                              onChange={e => setNewPassword(e.target.value)} style={{paddingRight:40}} required />
                            <button type="button" className="cl-toggle" onClick={() => setShowNewPass(v => !v)}>
                              <i className={`fa ${showNewPass ? "fa-eye-slash" : "fa-eye"}`} />
                            </button>
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="form-label small text-secondary">Confirm New Password</label>
                          <div className="position-relative">
                            <span className="cl-icon"><i className="fa fa-lock" /></span>
                            <input type={showNewPass ? "text" : "password"} className="form-control cl-input"
                              placeholder="Re-enter new password" value={confirmNewPassword}
                              onChange={e => setConfirmNewPassword(e.target.value)} style={{paddingRight:40}} required />
                          </div>
                        </div>
                        <button type="submit" className="btn text-white w-100 cl-btn" disabled={loading}>
                          {loading ? <><span className="spinner-border spinner-border-sm me-2" />Updating...</> : <><i className="fa fa-check me-2" />Update Password</>}
                        </button>
                      </form>
                    </>
                  )}
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
