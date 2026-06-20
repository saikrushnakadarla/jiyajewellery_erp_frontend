// StockNavbar.js
import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { AuthContext } from "../Components/Pages/Login/Context";
import Swal from "sweetalert2";
import logo from "./jiya_logo.png"; // Adjust the path if needed
import "./Navbar.css"; // Reusing the same CSS for consistency

function StockNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { userName } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log out!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/");
      }
    });
  };

  // Helper to check if a link is active
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <header className="navbar-header">
      <div className="navbar-brand">
        <img
          src={logo}
          alt="Logo"
          className=""
          style={{ width: "110px", height: "60px" }}
        />
      </div>

      <div
        className={`navbar-hamburger ${isOpen ? "open" : ""}`}
        onClick={toggleMenu}
      >
        <div className="navbar-bar"></div>
        <div className="navbar-bar"></div>
        <div className="navbar-bar"></div>
      </div>

      <nav className={`navbar-links ${isOpen ? "open" : ""}`}>
        {/* Dashboard Link */}
        <div>
          <Link
            to="/stock-dashboard"
            onClick={handleItemClick}
            style={{
              color: location.pathname === "/stock-dashboard" ? "#a36e29" : "black",
              backgroundColor: "transparent",
              textDecoration: "none",
            }}
          >
            DASHBOARD
          </Link>
        </div>


        {/* Stock Inward Link - NEW (Added after Dashboard) */}

        <div>
          <Link
            to="/stock-inward"
            onClick={handleItemClick}
            style={{
              color: location.pathname === "/stock-inward" ? "#a36e29" : "black",
              backgroundColor: "transparent",
              textDecoration: "none",
            }}
          >
            STOCK INWARD
          </Link>
        </div> 


          {/* <div>
          <Link
            to="/selections"
            onClick={handleItemClick}
            style={{
              color: location.pathname === "/selections" ? "#a36e29" : "black",
              backgroundColor: "transparent",
              textDecoration: "none",
            }}
          >
            SELECTIONS
          </Link>
        </div> */}

        {/* Assign to Salesman Link */}
        <div>
          <Link
            to="/assign-to-salesman" // Replace with your actual route
            onClick={handleItemClick}
            style={{
              color: location.pathname === "/assign-to-salesman" ? "#a36e29" : "black",
              backgroundColor: "transparent",
              textDecoration: "none",
            }}
          >
            ASSIGN 
          </Link>
        </div>

        {/* Receive from Salesman Link */}
        <div>
          <Link
            to="/receive-from-salesman" // Replace with your actual route
            onClick={handleItemClick}
            style={{
              color: location.pathname === "/receive-from-salesman" ? "#a36e29" : "black",
              backgroundColor: "transparent",
              textDecoration: "none",
            }}
          >
            RECEIVE 
          </Link>
        </div>

         {/* Return to Main Stock Link - NEW */}
        <div>
          <Link
            to="/return-to-main-stock" // Replace with your actual route
            onClick={handleItemClick}
            style={{
              color: location.pathname === "/return-to-main-stock" ? "#a36e29" : "black",
              backgroundColor: "transparent",
              textDecoration: "none",
            }}
          >
            STOCK OUTWARD
          </Link>
        </div>
        
         {/* NEW: Visit Logs Salesman Schedule Link */}
        <div>
          <Link
            to="/visit-logs-salesman-schedule"
            onClick={handleItemClick}
            style={{
              color: location.pathname === "/visit-logs-salesman-schedule" ? "#a36e29" : "black",
              backgroundColor: "transparent",
              textDecoration: "none",
            }}
          >
            VISIT LOGS SALESMAN
          </Link>
        </div>

      </nav>

      <div className="username">{userName}</div>
      <div className="navbar-logout">
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt size={18} /> Logout
        </button>
      </div>
    </header>
  );
}

export default StockNavbar;