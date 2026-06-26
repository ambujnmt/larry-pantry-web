import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./customer/components/Header";
import Footer from "./customer/components/Footer";
import Home from "./customer/pages/Home";
import Contact from "./customer/pages/Contact";
import About from "./customer/pages/About";
import Categories from "./customer/pages/Categories";
/*----- Customer Portal ------*/
import CustomerLogin            from "./customer/pages/CustomerLogin";
import CustomerDashboardLayout  from "./customer/layouts/CustomerDashboardLayout";
import CustomerDashboard        from "./customer/pages/CustomerDashboard";
import CustomerOrders           from "./customer/pages/CustomerOrders";
import CustomerWishlist         from "./customer/pages/CustomerWishlist";
import CustomerProfile          from "./customer/pages/CustomerProfile";
import CustomerAssignedProducts  from "./customer/pages/CustomerAssignedProducts";
/*----- Admin Panel ------*/
import AdminLogin from "./admin/pages/AdminLogin";
import AuthLayout from "./admin/layouts/AuthLayout";
import DashboardLayout from "./admin/layouts/DashboardLayout";
import Dashboard from "./admin/pages/Dashboard";
import Orders from "./admin/pages/Orders";
import Account from "./admin/pages/Account";
import AdminResetPassword from "./admin/pages/AdminResetPassword"
import AdminCategories from "./admin/pages/Categories"
import AdminProducts from "./admin/pages/Products"
import Users      from "./admin/pages/Users"
import UserDetail from "./admin/pages/UserDetail"
import AdminSizes from "./admin/pages/Sizes"
import AdminBrands from "./admin/pages/Brands"
import AdminUnits from "./admin/pages/Units"
/*------------------------*/

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Customer Routes - Header Footer ke saath */}
        <Route path="/" element={<><Header /><Home /><Footer /></>} />
        <Route path="/contact" element={<><Header /><Contact /><Footer /></>} />
        <Route path="/about" element={<><Header /><About /><Footer /></>} />
        <Route path="/categories" element={<><Header /><Categories /><Footer /></>} />

        {/* Customer Portal Routes */}
        <Route path="/customer"     element={<CustomerLogin />} />
        <Route path="/customer/login"     element={<CustomerLogin />} />
        <Route path="/customer/dashboard" element={<CustomerDashboardLayout><CustomerDashboard /></CustomerDashboardLayout>} />
        <Route path="/customer/orders"    element={<CustomerDashboardLayout><CustomerOrders /></CustomerDashboardLayout>} />
        <Route path="/customer/wishlist"  element={<CustomerDashboardLayout><CustomerWishlist /></CustomerDashboardLayout>} />
        <Route path="/customer/profile"   element={<CustomerDashboardLayout><CustomerProfile /></CustomerDashboardLayout>} />
        <Route path="/customer/assigned-products" element={<CustomerDashboardLayout><CustomerAssignedProducts /></CustomerDashboardLayout>} />

        {/* Admin Routes - Header Footer NAHI */}
        <Route path="/admin"       element={<AuthLayout><AdminLogin /></AuthLayout>} />
        <Route path="/admin/login" element={<AuthLayout><AdminLogin /></AuthLayout>} />
        <Route path="/admin/reset-password" element={<AuthLayout><AdminResetPassword /></AuthLayout>} />
        {/* ADMIN DASHBOARD PAGES */}
        <Route path="/admin/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>}/>

        <Route path="/admin/orders" element={<DashboardLayout><Orders /></DashboardLayout>}/>

        <Route path="/admin/account" element={<DashboardLayout><Account /></DashboardLayout>}/>
        <Route path="/admin/categories" element={<DashboardLayout><AdminCategories /></DashboardLayout>} />
        <Route path="/admin/products" element={<DashboardLayout><AdminProducts /></DashboardLayout>} />

        <Route path="/admin/users"     element={<DashboardLayout><Users /></DashboardLayout>} />
        <Route path="/admin/users/:id" element={<DashboardLayout><UserDetail /></DashboardLayout>} />

        <Route path="/admin/sizes" element={<DashboardLayout><AdminSizes /></DashboardLayout>} />
        <Route path="/admin/brands" element={<DashboardLayout><AdminBrands /></DashboardLayout>} />
        <Route path="/admin/units" element={<DashboardLayout><AdminUnits /></DashboardLayout>} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
