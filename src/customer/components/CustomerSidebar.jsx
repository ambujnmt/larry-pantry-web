import { Link, useLocation, useNavigate } from "react-router-dom";
import { customerLogout } from "../../utils/customerApi";
import Swal from "sweetalert2";

const NAV = [
  {
    section: "MAIN MENU",
    items: [
      { to: "/customer/dashboard",          icon: "fa-gauge",       label: "Dashboard" },
      { to: "/customer/assigned-products",  icon: "fa-box",         label: "My Products" },
      { to: "/customer/orders",             icon: "fa-bag-shopping", label: "My Orders" },
    ],
  },
  {
    section: "ACCOUNT",
    items: [
      { to: "/customer/profile",   icon: "fa-circle-user",  label: "My Profile" },
      { to: "/",                   icon: "fa-store",         label: "Back to Store", reload: true },
    ],
  },
]

const CustomerSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

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
    });
    if (!result.isConfirmed) return;
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    try { await customerLogout(); } catch (_) {}
    window.location.href = "/customer/login";
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        .cust-nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 16px; border-radius: 10px; margin: 2px 10px;
          text-decoration: none; font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,0.75); transition: all .15s; cursor: pointer;
          border: none; background: transparent; width: calc(100% - 20px); text-align: left;
        }
        .cust-nav-link:hover {
          background: rgba(255,255,255,0.12) !important;
          color: #fff !important;
        }
        .cust-nav-link.active-link {
          background: rgba(255,255,255,0.18) !important;
          color: #fff !important;
          font-weight: 600;
          box-shadow: inset 3px 0 0 #fff;
        }
        .cust-nav-icon {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.12); font-size: 14px;
          transition: background .15s;
        }
        .cust-nav-link.active-link .cust-nav-icon {
          background: rgba(255,255,255,0.25);
        }
        .cust-nav-link:hover .cust-nav-icon {
          background: rgba(255,255,255,0.2);
        }
        .cust-nav-scroll::-webkit-scrollbar { display: none; }
        .cust-nav-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .cust-nav-section {
          font-size: 10px; font-weight: 700; letter-spacing: .1em;
          color: rgba(255,255,255,0.35); padding: 14px 20px 4px;
          text-transform: uppercase;
        }
        .cust-nav-divider {
          height: 1px; background: rgba(255,255,255,0.1); margin: 8px 16px;
        }
        .cust-logout-link {
          color: rgba(255,160,160,0.85) !important;
        }
        .cust-logout-link:hover {
          background: rgba(220,53,69,0.2) !important;
          color: #ff8a8a !important;
        }
        .cust-logout-link .cust-nav-icon {
          background: rgba(220,53,69,0.2);
        }
        .cust-logout-link:hover .cust-nav-icon {
          background: rgba(220,53,69,0.3);
        }
      `}</style>

      <div id="app-sidepanel" className={`app-sidepanel ${sidebarOpen ? "sidepanel-visible" : ""}`}>
        {sidebarOpen && (
          <div className="sidepanel-drop" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="sidepanel-inner d-flex flex-column">
          {/* Close (mobile) */}
          <a href="#" className="sidepanel-close d-xl-none"
            onClick={e => { e.preventDefault(); setSidebarOpen(false); }}>
            &times;
          </a>

          {/* Logo */}
          <div className="app-branding" style={{ padding: '16px 16px 8px' }}>
            <Link to="/customer/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/admin-assets/images/logo.png" alt="logo"
                style={{ maxHeight: 44, objectFit: 'contain' }} />
            </Link>
          </div>

          <div className="cust-nav-divider" style={{ marginTop: 8 }} />

          {/* Nav sections */}
          <nav className="flex-grow-1 cust-nav-scroll" style={{ overflowY: 'auto', paddingBottom: 8 }}>
            {NAV.map(({ section, items }) => (
              <div key={section}>
                <div className="cust-nav-section">{section}</div>
                {items.map(({ to, icon, label, reload }) => (
                  reload
                    ? <a key={to} href={to}
                        className={`cust-nav-link ${isActive(to) ? 'active-link' : ''}`}>
                        <span className="cust-nav-icon">
                          <i className={`fa-solid ${icon}`} />
                        </span>
                        <span>{label}</span>
                      </a>
                    : <Link key={to} to={to}
                        className={`cust-nav-link ${isActive(to) ? 'active-link' : ''}`}
                        onClick={() => setSidebarOpen(false)}>
                        <span className="cust-nav-icon">
                          <i className={`fa-solid ${icon}`} />
                        </span>
                        <span>{label}</span>
                      </Link>
                ))}
              </div>
            ))}

            <div className="cust-nav-divider" />

            {/* Logout */}
            <button className="cust-nav-link cust-logout-link" onClick={handleLogout}>
              <span className="cust-nav-icon">
                <i className="fa-solid fa-right-from-bracket" />
              </span>
              <span>Logout</span>
            </button>
          </nav>

        </div>
      </div>
    </>
  );
};

export default CustomerSidebar;
