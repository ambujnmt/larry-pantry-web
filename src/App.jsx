/*---- App.jsx ----*/
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./customer/components/Header";
import Footer from "./customer/components/Footer";
import Home from "./customer/pages/Home";
import Contact from "./customer/pages/Contact";
import About from "./customer/pages/About";
import Qa from "./customer/pages/Qa";
import Categories from "./customer/pages/Categories";
import ProductDetails from "./customer/pages/ProductDetails"
import SearchResults from "./customer/pages/SearchResults";
import TermsConditions from "./customer/pages/TermsConditions";
import PrivacyPolicy from "./customer/pages/PrivacyPolicy";
import SpecialOffers from "./customer/pages/SpecialOffers"
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
import ContactSetting from "./admin/pages/ContactSetting"
import SocialMedia    from "./admin/pages/SocialMedia"
import LogoSetting    from "./admin/pages/LogoSetting"
import Sliders from "./admin/pages/Sliders"
import Messages from "./admin/pages/Messages"
import Newsletter from "./admin/pages/Newsletter"
import BottomBanners from "./admin/pages/BottomBanners"
import PageEditor from "./admin/pages/PageEditor"
import Faqs from "./admin/pages/Faqs"
import Testimonials from "./admin/pages/Testimonials"
import PopupNoticeSetting from "./admin/pages/PopupNoticeSetting"
/*------------------------*/

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Customer Routes - Header Footer ke saath */}
        <Route path="/" element={<><Header /><Home /><Footer /></>} />
        <Route path="/contact" element={<><Header /><Contact /><Footer /></>} />
        <Route path="/about" element={<><Header /><About /><Footer /></>} />
        <Route path="/terms-conditions" element={<><Header /><TermsConditions /><Footer /></>} />
        <Route path="/privacy-policy" element={<><Header /><PrivacyPolicy /><Footer /></>} />
        <Route path="/qa" element={<><Header /><Qa /><Footer /></>} />
        <Route path="/categories" element={<><Header /><Categories /><Footer /></>} />
        <Route path="/categories/:categorySlug" element={<><Header /><Categories /><Footer /></>} />
        <Route path="/product/:slug" element={<><Header /><ProductDetails /><Footer /></>} />
        <Route path="/search" element={<><Header /><SearchResults  /><Footer /></>} />
        <Route path="/special-offers" element={<><Header /><SpecialOffers   /><Footer /></>} />

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

        <Route path="/admin/settings/contact"      element={<DashboardLayout><ContactSetting /></DashboardLayout>} />
        <Route path="/admin/settings/social-media" element={<DashboardLayout><SocialMedia /></DashboardLayout>} />
        <Route path="/admin/settings/logo"         element={<DashboardLayout><LogoSetting /></DashboardLayout>} />
        <Route path="/admin/sliders" element={<DashboardLayout><Sliders /></DashboardLayout>} />
        <Route path="/admin/messages" element={<DashboardLayout><Messages /></DashboardLayout>}/>
        <Route path="/admin/newsletter" element={<DashboardLayout><Newsletter /></DashboardLayout>}/>
        <Route path="/admin/settings/bottom-banners" element={<DashboardLayout><BottomBanners /></DashboardLayout>} />
        <Route path="/admin/pages/:slug" element={<DashboardLayout><PageEditor /></DashboardLayout>} />
        <Route path="/admin/faqs" element={<DashboardLayout><Faqs /></DashboardLayout>} />
        <Route path="/admin/testimonials" element={<DashboardLayout><Testimonials /></DashboardLayout>} />
        <Route path="/admin/settings/popup-notice" element={<DashboardLayout><PopupNoticeSetting /></DashboardLayout>} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
