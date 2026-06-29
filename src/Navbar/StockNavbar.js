// StockNavbar.js
import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FaSignOutAlt } from "react-icons/fa";
import { AuthContext } from "../Components/Pages/Login/Context";
import Swal from "sweetalert2";
import logo from "./jiya_logo.png";
import "./StockNavbar.css"; // New unique CSS file

function StockNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [stockManagementDropdownOpen, setStockManagementDropdownOpen] =
    useState(false);
  // New state for sub-dropdowns
  const [inwardSubDropdownOpen, setInwardSubDropdownOpen] = useState(false);
  const [outwardSubDropdownOpen, setOutwardSubDropdownOpen] = useState(false);

  const { userName } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const openDropdown = (type) => {
    if (type === "stockManagement") {
      setStockManagementDropdownOpen(true);
    }
  };

  const closeDropdown = (type) => {
    if (type === "stockManagement") {
      setStockManagementDropdownOpen(false);
    }
  };

  // Handle sub-dropdown toggles for mobile
  const toggleInwardSubDropdown = () => {
    setInwardSubDropdownOpen(!inwardSubDropdownOpen);
  };

  const toggleOutwardSubDropdown = () => {
    setOutwardSubDropdownOpen(!outwardSubDropdownOpen);
  };

  const handleItemClick = () => {
    setStockManagementDropdownOpen(false);
    setInwardSubDropdownOpen(false);
    setOutwardSubDropdownOpen(false);
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
    return location.pathname === path ? "stock-navbar-active" : "";
  };

  // Helper to check if any sub-link is active
  const isSubActive = (paths) => {
    return paths.includes(location.pathname) ? "stock-navbar-active" : "";
  };

  return (
    <header className="stock-navbar-header">
      <div className="stock-navbar-brand">
        <img
          src={logo}
          alt="Logo"
          className="stock-navbar-logo-img"
          style={{ width: "110px", height: "60px" }}
        />
      </div>

      <div
        className={`stock-navbar-hamburger ${
          isOpen ? "stock-navbar-hamburger-open" : ""
        }`}
        onClick={toggleMenu}
      >
        <div className="stock-navbar-bar"></div>
        <div className="stock-navbar-bar"></div>
        <div className="stock-navbar-bar"></div>
      </div>

      <nav className={`stock-navbar-links ${isOpen ? "stock-navbar-links-open" : ""}`}>
        {/* Dashboard Link */}
        <div>
          <Link
            to="/stock-dashboard"
            onClick={handleItemClick}
            className={isActive("/stock-dashboard")}
            style={{
              color: location.pathname === "/stock-dashboard" ? "#a36e29" : "black",
              backgroundColor: "transparent",
              textDecoration: "none",
            }}
          >
            DASHBOARD
          </Link>
        </div>

        {/* Stock Management Dropdown - Main */}
        <div
          className="stock-navbar-dropdown"
          onMouseEnter={() => openDropdown("stockManagement")}
          onMouseLeave={() => closeDropdown("stockManagement")}
        >
          <span className="stock-navbar-dropdown-title">
            STOCK MANAGEMENT{" "}
            <FontAwesomeIcon
              icon={stockManagementDropdownOpen ? faChevronUp : faChevronDown}
              className="stock-dropdown-arrow-icon"
            />
          </span>
          {stockManagementDropdownOpen && (
            <div className="stock-navbar-dropdown-content">
              {/* Stock Link - Direct */}
              <Link
                to="/warehouse-stock-respective-items"
                onClick={handleItemClick}
                className={isActive("/warehouse-stock-respective-items")}
              >
                Stock
              </Link>

              {/* Stock Inward Sub-Dropdown */}
              <div
                className="stock-navbar-sub-dropdown"
                onMouseEnter={() => setInwardSubDropdownOpen(true)}
                onMouseLeave={() => setInwardSubDropdownOpen(false)}
              >
                <div
                  className="stock-navbar-sub-dropdown-title"
                  onClick={toggleInwardSubDropdown}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.7rem 1.5rem",
                    color: isSubActive(["/stock-inward", "/receive-from-salesman"])
                      ? "#a36e29"
                      : "#333",
                    fontWeight: isSubActive(["/stock-inward", "/receive-from-salesman"])
                      ? "bold"
                      : "normal",
                  }}
                >
                  Stock Inward
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="stock-sub-arrow-icon"
                  />
                </div>
                <div
                  className={`stock-navbar-sub-dropdown-content ${
                    inwardSubDropdownOpen ? "show-mobile" : ""
                  }`}
                  style={{
                    display:
                      inwardSubDropdownOpen && window.innerWidth <= 768
                        ? "block"
                        : "",
                  }}
                >
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
              </div>

              {/* Stock Outward Sub-Dropdown */}
              <div
                className="stock-navbar-sub-dropdown"
                onMouseEnter={() => setOutwardSubDropdownOpen(true)}
                onMouseLeave={() => setOutwardSubDropdownOpen(false)}
              >
                <div
                  className="stock-navbar-sub-dropdown-title"
                  onClick={toggleOutwardSubDropdown}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.7rem 1.5rem",
                    color: isSubActive(["/return-to-main-stock", "/assign-to-salesman"])
                      ? "#a36e29"
                      : "#333",
                    fontWeight: isSubActive(["/return-to-main-stock", "/assign-to-salesman"])
                      ? "bold"
                      : "normal",
                  }}
                >
                  Stock Outward
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="stock-sub-arrow-icon"
                  />
                </div>
                <div
                  className={`stock-navbar-sub-dropdown-content ${
                    outwardSubDropdownOpen ? "show-mobile" : ""
                  }`}
                  style={{
                    display:
                      outwardSubDropdownOpen && window.innerWidth <= 768
                        ? "block"
                        : "",
                  }}
                >
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

      <div className="stock-username">{userName}</div>
      <div className="stock-navbar-logout">
        <button className="stock-logout-button" onClick={handleLogout}>
          <FaSignOutAlt size={18} /> Logout
        </button>
      </div>
    </header>
  );
}

export default StockNavbar;