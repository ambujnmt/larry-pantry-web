import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import AdminSidebar from "./AdminSidebar"
import { adminLogout, STORAGE_URL } from "../../utils/adminApi"
import Swal from "sweetalert2"

const AdminHeader = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState({ name: "Admin", profile_img: "" })

  // localStorage se admin info lo — INITIAL LOAD
  useEffect(() => {
    const stored = localStorage.getItem("admin_user")
    if (stored) setAdmin(JSON.parse(stored))
  }, []) // ← Sirf ek baar — page load par

  // adminUserUpdated event
  useEffect(() => {
    const handleUpdate = () => {
      const stored = localStorage.getItem("admin_user")
      if (stored) setAdmin(JSON.parse(stored))
    }
    window.addEventListener("adminUserUpdated", handleUpdate)
    return () => window.removeEventListener("adminUserUpdated", handleUpdate)
  }, [])

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0e606c",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    })
    if (!result.isConfirmed) return
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    navigate("/admin/login")
    try { await adminLogout() } catch (err) {}
  }

  return (
    <header className="app-header fixed-top">
      <div className="app-header-inner">
        <div className="container-fluid py-2">
          <div className="app-header-content">
            <div className="row justify-content-between align-items-center">

              {/* Mobile Menu Button */}
              <div className="col-auto">
                <button
                  id="sidepanel-toggler"
                  className="sidepanel-toggler d-inline-block d-xl-none border-0 bg-transparent"
                  onClick={() => setSidebarOpen(prev => !prev)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                    <path stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="2" d="M4 7h22M4 15h22M4 23h22" />
                  </svg>
                </button>
              </div>

              {/* Right Menu */}
              <div className="app-utilities col-auto">

                {/* User Dropdown */}
                <div className="dropdown app-user-dropdown">
                  <a href="#" className="dropdown-toggle d-flex align-items-center gap-2 text-decoration-none" data-bs-toggle="dropdown">

                    {/* Photo */}
                    <img
                      src={
                        admin.profile_img
                          ? (admin.profile_img.startsWith("http")
                              ? admin.profile_img
                              : STORAGE_URL + admin.profile_img)
                          : "/admin-assets/images/user.png"
                      }
                      alt={admin.name}
                      onError={e => { e.target.src = "/admin-assets/images/user.png" }}
                      style={{ width:38, height:38, borderRadius:"50%", objectFit:"cover", border:"2px solid rgba(255,255,255,0.3)" }}
                    />

                    {/* Name — sirf desktop par dikhega */}
                    <span className="d-none d-md-block text-white fw-semibold" style={{fontSize:14}}>
                      {admin.name}
                    </span>

                  </a>

                  <ul className="dropdown-menu dropdown-menu-end">

                    {/* Header — photo + name + email */}
                    <li className="px-3 py-2 border-bottom">
                      <div className="d-flex align-items-center gap-2">
                        <div>
                          <div className="fw-semibold" style={{fontSize:14, color:'#111'}}>{admin.name}</div>
                          <div style={{fontSize:12, color:'#888'}}>{admin.email}</div>
                        </div>
                      </div>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/admin/account">
                        <i className="fa fa-user me-2" />Account
                      </Link>
                    </li>

                    <li><hr className="dropdown-divider" /></li>

                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="fa fa-sign-out me-2" />Logout
                      </button>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </header>
  )
}

export default AdminHeader
