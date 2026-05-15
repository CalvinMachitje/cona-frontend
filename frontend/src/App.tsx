// frontend/src/App.tsx
import { Routes, Route } from "react-router-dom";

// Layouts
import AppLayout from "@/layout/AppLayout";
import AdminLayout from "@/layout/AdminLayout";

// Route Protection
import ProtectedRoute from "@/components/ProtectedRoutes";

// Member Pages
import MemberDashboard from "@/pages/customer/dashboard";
import MenuPage from "@/pages/customer/customer_Menu";
import MyBookings from "@/pages/customer/myBookings";
import ActiveOrders from "@/pages/customer/activeOrders";
import MemberLayout from "./layout/MemberLayout";
import BookTable from "./pages/customer/bookTable";
import Rewards from "./pages/customer/rewards";
import Promotions from "./pages/customer/promotions";

// Public Pages
import Home from "@/pages/public/Home";
import About from "@/pages/public/About";
import Menu from "@/pages/public/Menu";
import Gallery from "@/pages/public/PublicGallery";
import Booking from "@/pages/public/Bookings";
import Contact from "@/pages/public/Contact";
import Register from "@/pages/public/Register";
import Login from "@/pages/public/Login";

// Admin Pages
import Dashboard from "@/pages/admin/dashboard";
import Users from "@/pages/admin/users";
import Settings from "@/pages/admin/settings";
import Bookings from "@/pages/admin/bookings";
import Payments from "@/pages/admin/payments";
import AdminLogin from "@/pages/admin/login";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<MemberLayout />}>
        <Route path="/member" element={<MemberDashboard />} />
        <Route path="/member/dashboard" element={<MemberDashboard />} />
        <Route path="/member/menu" element={<MenuPage />} />
        <Route path="/member/book-table" element={<BookTable />} />
        <Route path="/member/my-bookings" element={<MyBookings />} />
        <Route path="/member/active-orders" element={<ActiveOrders />} />
        <Route path="/member/rewards" element={<Rewards />} />
        <Route path="/member/promotions" element={<Promotions />} />
      </Route>

      {/* Admin Login (public) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="menu" element={<Menu />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="customers" element={<Users />} />
          <Route path="payments" element={<Payments />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
