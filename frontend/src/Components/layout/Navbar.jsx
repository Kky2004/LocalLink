import  { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import {
  Search,
  Menu,
  X,
  User,
  LogOut,
  MessageCircle,
  LayoutDashboard,
  Briefcase,
  Calendar,
} from "lucide-react";

export default function Navbar()  {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to={
                user?.userType?.toUpperCase() === "PROVIDER"
                  ? "/dashboard"
                  : "/"
              }
              className="flex-shrink-0 flex items-center"
            >
              <div className="w-8 h-8 bg-[#0f0f0f] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="ml-2 text-xl font-bold text-[#171717]">
                LocalLink
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-black px-3 py-2 rounded-md text-md font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/search"
                  className="text-gray-700 hover:text-black px-3 py-2 rounded-md text-md font-medium"
                >
                  Find Services
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-black px-3 py-2 rounded-md text-md font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-black text-white hover:bg-gray-400 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {user.userType?.toUpperCase() === "CONSUMER" && (
                  <>
                    <Link
                      to="/search"
                      className="text-gray-700 hover:text-black px-3 py-2 rounded-md text-md font-medium flex items-center"
                    >
                      <Search className="h-4 w-4 mr-1" />
                      Find Services
                    </Link>
                    <Link
                      to="/my-bookings"
                      className="text-gray-700 hover:text-black px-3 py-2 rounded-md text-md font-medium flex items-center"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      My Bookings
                    </Link>
                  </>
                )}

                {user.userType?.toUpperCase() === "PROVIDER" && (
                  <>
                    <Link
                      to="/my-services"
                      className="text-gray-700 hover:text-black px-3 py-2 rounded-md text-md font-medium flex items-center"
                    >
                      <Briefcase className="h-4 w-4 mr-1" />
                      My Services
                    </Link>
                    <Link
                      to="/orders"
                      className="text-gray-700 hover:text-black px-3 py-2 rounded-md text-md font-medium flex items-center"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Orders
                    </Link>
                  </>
                )}

                {/* <Link
                  to="/messages"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Messages
                </Link> */}

                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-black px-3 py-2 rounded-md text-md font-medium flex items-center"
                >
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center text-gray-700 hover:text-black px-3 py-2 rounded-md text-md font-medium"
                  >
                    <User className="h-4 w-4 mr-1" />
                    {user.name || user.email.split("@")[0]}
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-black hover:text-white"
                      >
                        Profile Settings
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-black hover:text-white"
                      >
                        <LogOut className="inline h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {!user ? (
              <>
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2">
                  Home
                </Link>
                <Link to="/search" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2">
                  Find Services
                </Link>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2">
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {user.userType?.toUpperCase() === "CONSUMER" && (
                  <>
                    <Link to="/search" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2">
                      Find Services
                    </Link>
                    <Link to="/my-bookings" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2">
                      My Bookings
                    </Link>
                  </>
                )}

                {user.userType?.toUpperCase() === "PROVIDER" && (
                  <>
                    <Link to="/my-services" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2">
                      My Services
                    </Link>
                    <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2">
                      Orders
                    </Link>
                  </>
                )}

                {/* <Link to="/messages" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2">
                  Messages
                </Link> */}
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2">
                  Dashboard
                </Link>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2">
                  Profile
                </Link>

                <button onClick={handleLogout} className="block w-full text-left px-3 py-2">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};


