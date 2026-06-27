// StockNavbar.js
import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FaSignOutAlt } from "react-icons/fa";
import { AuthContext } from "../Components/Pages/Login/Context";
import Swal from "sweetalert2";
import logo from "./jiya_logo.png"; // Adjust the path if needed
import "./Navbar.css"; // Reusing the same CSS for consistency

function StockNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [stockManagementDropdownOpen, setStockManagementDropdownOpen] = useState(false);
  const [stockInwardDropdownOpen, setStockInwardDropdownOpen] = useState(false);
  const [stockOutwardDropdownOpen, setStockOutwardDropdownOpen] = useState(false);
  const { userName } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const openDropdown = (type) => {
    if (type === "stockManagement") setStockManagementDropdownOpen(true);
    if (type === "stockInward") setStockInwardDropdownOpen(true);
    if (type === "stockOutward") setStockOutwardDropdownOpen(true);
  };

  const closeDropdown = (type) => {
    if (type === "stockManagement") setStockManagementDropdownOpen(false);
    if (type === "stockInward") setStockInwardDropdownOpen(false);
    if (type === "stockOutward") setStockOutwardDropdownOpen(false);
  };

  const handleItemClick = () => {
    setStockManagementDropdownOpen(false);
    setStockInwardDropdownOpen(false);
    setStockOutwardDropdownOpen(false);
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

        {/* Stock Management Dropdown - Updated with nested structure */}
        <div
          className="navbar-dropdown"
          onMouseEnter={() => openDropdown("stockManagement")}
          onMouseLeave={() => closeDropdown("stockManagement")}
        >
          <span className="navbar-dropdown-title">
            STOCK MANAGEMENT{" "}
            <FontAwesomeIcon
              icon={stockManagementDropdownOpen ? faChevronUp : faChevronDown}
              className="dropdown-arrow-icon"
            />
          </span>
          {stockManagementDropdownOpen && (
            <div className="navbar-dropdown-content">
              <Link
                to="/warehouse-stock-respective-items"
                onClick={handleItemClick}
                className={isActive("/warehouse-stock-respective-items")}
              >
                Stock
              </Link>
              
              {/* Stock Inward Sub-dropdown */}
              <div
                className="navbar-sub-dropdown"
                onMouseEnter={() => openDropdown("stockInward")}
                onMouseLeave={() => closeDropdown("stockInward")}
              >
                <span className="navbar-sub-dropdown-title">
                  Stock Inward{" "}
                  <FontAwesomeIcon
                    icon={stockInwardDropdownOpen ? faChevronUp : faChevronDown}
                    className="dropdown-arrow-icon"
                  />
                </span>
                {stockInwardDropdownOpen && (
                  <div className="navbar-sub-dropdown-content">
                    <Link
                      to="/stock-inward"
                      onClick={handleItemClick}
                      className={isActive("/stock-inward")}
                    >
                      Inward from Main Admin
                    </Link>
                    <Link
                      to="/receive-from-salesman"
                      onClick={handleItemClick}
                      className={isActive("/receive-from-salesman")}
                    >
                      Inward from Salesman (Receive)
                    </Link>
                  </div>
                )}
              </div>

              {/* Stock Outward Sub-dropdown */}
              <div
                className="navbar-sub-dropdown"
                onMouseEnter={() => openDropdown("stockOutward")}
                onMouseLeave={() => closeDropdown("stockOutward")}
              >
                <span className="navbar-sub-dropdown-title">
                  Stock Outward{" "}
                  <FontAwesomeIcon
                    icon={stockOutwardDropdownOpen ? faChevronUp : faChevronDown}
                    className="dropdown-arrow-icon"
                  />
                </span>
                {stockOutwardDropdownOpen && (
                  <div className="navbar-sub-dropdown-content">
                    <Link
                      to="/return-to-main-stock"
                      onClick={handleItemClick}
                      className={isActive("/return-to-main-stock")}
                    >
                      Outward to Main Admin
                    </Link>
                    <Link
                      to="/assign-to-salesman"
                      onClick={handleItemClick}
                      className={isActive("/assign-to-salesman")}
                    >
                      Outward to Salesman (Assign)
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Removed separate ASSIGN and RECEIVE links since they're now nested */}
        {/* Visit Logs Salesman Schedule Link */}
        {/* <div>
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
        </div> */}
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