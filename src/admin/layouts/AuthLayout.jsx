import { useEffect } from "react"

function AuthLayout({ children }) {
  useEffect(() => {
    // Frontend CSS off, Admin CSS + FA on
    document.querySelectorAll('link[rel="stylesheet"]:not(#admin-portal-css):not(#admin-fa-css)').forEach(l => l.disabled = true)
    document.getElementById('admin-portal-css').disabled = false
    document.getElementById('admin-fa-css').disabled = false

    return () => {
      // Wapas frontend par — admin CSS + FA off
      document.querySelectorAll('link[rel="stylesheet"]').forEach(l => l.disabled = false)
      document.getElementById('admin-portal-css').disabled = true
      document.getElementById('admin-fa-css').disabled = true
    }
  }, [])

  return <div className="app app-login p-0">{children}</div>
}

export default AuthLayout