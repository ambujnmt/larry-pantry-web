import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import CustomerSidebar from "./CustomerSidebar"
import { customerLogout, getProfile, STORAGE_URL } from "../../utils/customerApi"
import Swal from "sweetalert2"

const CustomerDashboardHeader = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState({ first_name: "", last_name: "", profile_img: "" })

  // Fresh profile from API on mount
  useEffect(() => {
    const stored = localStorage.getItem("customer_user")
    if (stored) setUser(JSON.parse(stored))

    getProfile()
      .then(res => {
        const profile = res?.data ?? res
        setUser(profile)
        localStorage.setItem("customer_user", JSON.stringify(profile))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleUpdate = () => {
      const stored = localStorage.getItem("customer_user")
      if (stored) setUser(JSON.parse(stored))
    }
    window.addEventListener("customerUserUpdated", handleUpdate)
    return () => window.removeEventListener("customerUserUpdated", handleUpdate)
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
    localStorage.removeItem("customer_token")
    localStorage.removeItem("customer_user")
    try { await customerLogout() } catch (err) {}
    window.location.href = "/customer/login"
  }

  return (
    <header className="app-header fixed-top">
      <div className="app-header-inner">
        <div className="container-fluid py-2">
          <div className="app-header-content">
            <div className="row justify-content-between align-items-center">

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

              <div className="app-utilities col-auto">
                <div className="dropdown app-user-dropdown">
                  <a href="#" className="dropdown-toggle d-flex align-items-center gap-2 text-decoration-none" data-bs-toggle="dropdown">
                    <img
                      src={
                        user.profile_img
                          ? (user.profile_img.startsWith("http") ? user.profile_img : STORAGE_URL + user.profile_img)
                          : "/assets/img/user-placeholder.png"
                      }
                      alt={user.first_name}
                      onError={e => { e.target.src = "/admin-assets/images/user.png" }}
                      style={{ width:38, height:38, borderRadius:"50%", objectFit:"cover", border:"2px solid rgba(255,255,255,0.3)" }}
                    />
                    <span className="d-none d-md-block text-white fw-semibold" style={{fontSize:14}}>
                      {[user.first_name, user.last_name].filter(Boolean).join(" ") || "Customer"}
                    </span>
                  </a>

                  <ul className="dropdown-menu dropdown-menu-end">
                    <li className="px-3 py-2 border-bottom">
                      <div className="fw-semibold" style={{fontSize:14, color:'#111'}}>
                        {[user.first_name, user.last_name].filter(Boolean).join(" ") || "Customer"}
                      </div>
                      <div style={{fontSize:12, color:'#888'}}>{user.email}</div>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/customer/profile">
                        <i className="fa fa-user me-2" />My Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/customer/orders">
                        <i className="fa fa-bag-shopping me-2" />My Orders
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
      <CustomerSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </header>
  )
}

export default CustomerDashboardHeader
