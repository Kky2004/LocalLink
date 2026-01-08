import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import './App.css'
import Home from './Pages/Home'
import Login from "./Pages/auth/Login";
import Search from "./Pages/Search";
import ProviderProfile from "./Pages/ProviderProfile";
import ProtectedRoute from "./Components/ProtectedRoute";
import Register from "./Pages/auth/Register";
import Dashboard from "./Pages/Dashboard";
import Navbar from "./Components/layout/Navbar"
import Messages from "./Pages/Messages";
import Profile from "./Pages/Profile";
import Booking from "./Pages/Booking";
import MyBooking from "./Pages/MyBookings";
import Orders from "./Pages/Orders";
import MyServices from "./Pages/MyServices";
import BookingDetail from "./Pages/BookingDetail";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./Components/layout/Footer";
import Notfound from "./Components/Notfound";



function App() {

  useEffect(() => {
    console.log("FULL ENV OBJECT 👉", import.meta.env);
    console.log("API BASE URL 👉", import.meta.env.VITE_API_BASE_URL);
  }, []);

  return (
    <>
    <div className="min-h-screen bg-gray-50">
        <Navbar/>
        <main>
    <Routes>
      {/* public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/provider/:id" element={<ProviderProfile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* protected routes-require login */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard/>
        </ProtectedRoute>
      }/>

      <Route path="/messages" element={
        <ProtectedRoute>
          <Messages/>
        </ProtectedRoute>
      }/>

      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile/>
        </ProtectedRoute>
      }/>

      <Route path="/booking/:providerId" element={
        <ProtectedRoute allowedRoles={['CONSUMER', 'consumer']}>
          <Booking/>
        </ProtectedRoute>
      }/>

      <Route path="/my-bookings" element={
        <ProtectedRoute allowedRoles={['CONSUMER', 'consumer']}>
          <MyBooking/>
        </ProtectedRoute>
      }/>

       <Route path="/my-bookingdetails/:bookingId" element={
        <ProtectedRoute allowedRoles={['CONSUMER', 'consumer']}>
          <BookingDetail/>
        </ProtectedRoute>
      }/>

      {/* Provider Only Routes */}
      <Route path="/orders" element={
        <ProtectedRoute allowedRoles={['PROVIDER', 'provider']}>
          <Orders />
        </ProtectedRoute>
      } />
      <Route path="/my-services" element={
        <ProtectedRoute allowedRoles={['PROVIDER', 'provider']}>
          <MyServices />
        </ProtectedRoute>
      }/>

       <Route path="*" element={<Notfound/>} />

    </Routes>
     </main>
     <Footer/>

       {/*  MUST BE HERE */}
        <ToastContainer 
          position="top-center"
          autoClose={3000}
          theme="colored"
        />

      </div>
    </>
  )
}

export default App
