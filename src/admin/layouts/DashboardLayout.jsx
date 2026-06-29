import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AdminHeader from "../components/AdminHeader"
import AdminSidebar from "../components/AdminSidebar"
import AdminFooter from "../components/AdminFooter"

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (!token) navigate("/admin/login")
  }, [navigate])

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

  return (
    <div className="app">
      <style>{`
        html, body, #root { height: 100%; overflow-x: hidden; }

        .app { min-height: 100vh; display: flex; flex-direction: column; }
        .app-wrapper { flex: 1; }
        
        @media (max-width: 1199px) {
          .app-sidepanel {
            transform: translateX(-100%); transition: all 0.3s ease; z-index: 1025;
          }
          .app-sidepanel.sidepanel-visible {
            transform: translateX(0); z-index: 1025;
          }
        }
        .app-header { background: #0e606c; z-index: 1030; }
        .app-sidepanel .app-nav-main {background: #0e606c;}
        .app-nav .nav-item {background: #0e606c; color: #ffffff;}
        .app-nav .nav-link {color: #ffffff;}
        .app-nav .nav-link:hover {color: #0f3825; background: #edfdf6 !important;}
        .app-sidepanel .sidepanel-inner {background-color: #0e606c;}
        .app-nav .submenu-link {color: #ffffff;}
        .app-nav .submenu-link:hover {color: #0f3825; background: #edfdf6 !important;}
        .app-logo {padding: 2px; display: flex;}

        .sidepanel-drop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35);
        }

        /* SweetAlert2 — admin portal CSS ke upar */
        .swal2-container { z-index: 99999 !important; }
        .swal2-backdrop-show { z-index: 99998 !important; }

        .table.dataTable thead th {
            background-color: var(--bs-secondary) !important;
            color: white !important;
        }

        .dt-length label,
        .dataTables_length label {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            white-space: nowrap !important;
            margin-bottom: 0 !important;
        }
        .dt-length select,
        .dt-length select.form-select,
        .dataTables_length select,
        .dataTables_length select.form-select {
            width: auto !important;
            display: inline-block !important;
            flex-shrink: 0 !important;
        }
      `}</style>

      <AdminHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="app-wrapper">
        <div className="app-content pt-2">
          <div className="container-fluid">
            {children}
          </div>
        </div>
      </div>

      <AdminFooter />
    </div>
  )
}

export default DashboardLayout
