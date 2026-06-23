import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FaSignOutAlt } from "react-icons/fa";
// import logo from './sadashri.png';
import logo from "./jiya_logo.png";
import "./Navbar.css";
import { AuthContext } from "../Components/Pages/Login/Context";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from 'uuid';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mastersDropdownOpen, setMastersDropdownOpen] = useState(false);
  const [transactionsDropdownOpen, setTransactionsDropdownOpen] =
    useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [utilityDropdownOpen, setUtilityDropdownOpen] = useState(false);
  const { authToken, userId, userName } = useContext(AuthContext);
  // console.log(userId, userName)
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname !== "/purchase") {
      localStorage.removeItem("tableData");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/orders") {
      localStorage.removeItem("orderDetails");
      localStorage.removeItem("paymentDetails");
      localStorage.removeItem("oldTableData");
      localStorage.removeItem("schemeTableData");
      localStorage.removeItem(`discount`);
    }
  }, [location.pathname]);

  const getTabId = () => {
    // First try to get from URL
    const urlParams = new URLSearchParams(window.location.search);
    let tabId = urlParams.get("tabId");

    // If not in URL, try sessionStorage
    if (!tabId) {
      tabId = sessionStorage.getItem("tabId");
    }

    // If still not found, generate new ID
    if (!tabId) {
      tabId = uuidv4();
      sessionStorage.setItem("tabId", tabId);

      // Update URL without page reload
      const newUrl = `${window.location.pathname}?tabId=${tabId}`;
      window.history.replaceState({}, "", newUrl);
    }

    return tabId;
  };

  const tabId = getTabId();

  // useEffect(() => {
  //   const currentPathWithQuery = `${location.pathname}${location.search}`;
  //   const expectedPath = `/sales?tabId=${tabId}`;

  //   if (currentPathWithQuery !== expectedPath) {
  //     // Remove specific known keys
  //     localStorage.removeItem('oldSalesData');
  //     localStorage.removeItem('schemeSalesData');
  //     localStorage.removeItem(`repairDetails_${tabId}`);
  //     localStorage.removeItem(`paymentDetails_${tabId}`);
  //     localStorage.removeItem(`oldTableData_${tabId}`);
  //     localStorage.removeItem('schemeTableData');
  //     localStorage.removeItem(`discount_${tabId}`);

  //     // Dynamically remove all keys that start with specific prefixes
  //     Object.keys(localStorage).forEach((key) => {
  //       if (
  //         // key.startsWith('saleFormData_') ||
  //         key.startsWith('repairDetails_') ||
  //         key.startsWith('paymentDetails_') ||
  //         key.startsWith('oldTableData_') ||
  //         key.startsWith('discount_')
  //       ) {
  //         localStorage.removeItem(key);
  //       }
  //     });
  //   }
  // }, [location.pathname, location.search, tabId]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // const toggleDropdown = (dropdownType) => {
  //   switch (dropdownType) {
  //     case 'masters':
  //       setMastersDropdownOpen(!mastersDropdownOpen);
  //       break;
  //     case 'transactions':
  //       setTransactionsDropdownOpen(!transactionsDropdownOpen);
  //       break;
  //     case 'reports':
  //       setReportsDropdownOpen(!reportsDropdownOpen);
  //       break;
  //     case 'utility':
  //       setUtilityDropdownOpen(!utilityDropdownOpen);
  //       break;
  //     default:
  //       break;
  //   }
  // };

  const openDropdown = (type) => {
    if (type === "masters") setMastersDropdownOpen(true);
    if (type === "transactions") setTransactionsDropdownOpen(true);
    if (type === "reports") setReportsDropdownOpen(true);
    if (type === "utility") setUtilityDropdownOpen(true);
  };

  const closeDropdown = (type) => {
    if (type === "masters") setMastersDropdownOpen(false);
    if (type === "transactions") setTransactionsDropdownOpen(false);
    if (type === "reports") setReportsDropdownOpen(false);
    if (type === "utility") setUtilityDropdownOpen(false);
  };

  const handleItemClick = () => {
    // Close all dropdowns and collapse the hamburger menu
    setMastersDropdownOpen(false);
    setTransactionsDropdownOpen(false);
    setReportsDropdownOpen(false);
    setUtilityDropdownOpen(false);
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
        // Navigate to the home page or perform logout logic
        navigate("/");
      }
    });
  };

  // Function to check if the link is active based on the current location
  const isActive = (path) => {
    return location.pathname === path ? "active" : ""; // Return 'active' if the path matches the current location
  };
  const userRole = localStorage.getItem("userRole"); // 'admin' or other roles
  console.log("userRole=", userRole);

  return (
    <header className="navbar-header">
      <div className="navbar-brand">
        {/* <img src={logo} alt="Logo" className="" style={{ width: "200px" }} /> */}
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
        <div>
          <span>
            <Link
              to="/dashboard"
              onClick={handleItemClick}
              style={{
                color:
                  window.location.pathname === "/dashboard"
                    ? "#a36e29"
                    : "black",
                backgroundColor: "transparent",
                textDecoration: "none",
              }}
            >
              DASHBOARD
            </Link>
          </span>
        </div>
        <div
          className="navbar-dropdown"
          onMouseEnter={() => openDropdown("masters")}
          onMouseLeave={() => closeDropdown("masters")}
        >
          <span className="navbar-dropdown-title">
            MASTERS{" "}
            <FontAwesomeIcon
              icon={mastersDropdownOpen ? faChevronUp : faChevronDown}
              className="dropdown-arrow-icon"
            />
          </span>
          {mastersDropdownOpen && (
            <div className="navbar-dropdown-content">
              {userRole === "admin" && (
                <Link
                  to="/usertable"
                  onClick={handleItemClick}
                  className={isActive("/usertable")}
                >
                  User Master
                </Link>
              )}
              <Link
                to="/customerstable"
                onClick={handleItemClick}
                className={
                  isActive("/customerstable") || isActive("/customermaster")
                }
              >
                Customer Master
              </Link>
              <Link
                to="/suppliertable"
                onClick={handleItemClick}
                className={
                  isActive("/suppliertable") || isActive("/suppliermaster")
                }
              >
                Supplier Master
              </Link>
              <Link
                to="/itemmastertable"
                onClick={handleItemClick}
                className={
                  isActive("/itemmastertable") || isActive("/itemmaster")
                }
              >
                Category Master
              </Link>
              <Link
                to="/subcategorytable"
                onClick={handleItemClick}
                className={
                  isActive("/subcategorytable") || isActive("/subcategory")
                }
              >
                Sub Category Master
              </Link>
              <Link
                to="/purity"
                onClick={handleItemClick}
                className={isActive("/purity")}
              >
                Purity
              </Link>

              <Link
                to="/qrcodeprinting"
                onClick={handleItemClick}
                className={isActive("/qrcodeprinting")}
              >
                QR Code Printing
              </Link>

              <Link
                to="/metaltype"
                onClick={handleItemClick}
                className={isActive("/metaltype")}
              >
                Metal Type
              </Link>

              <Link
                to="/stockpoints"
                onClick={handleItemClick}
                className={isActive("/stockpoints")}
              >
                Stock Points
              </Link>

              <Link
                to="/designmaster"
                onClick={handleItemClick}
                className={isActive("/designmaster")}
              >
                Design Master
              </Link>
              <Link
                to="/accountstable"
                onClick={handleItemClick}
                className={isActive("/accountstable") || isActive("/accounts")}
              >
                Accounts
              </Link>
              <Link
                to="/workerstable"
                onClick={handleItemClick}
                className={
                  isActive("/workerstable") || isActive("/workermaster")
                }
              >
                Worker Master
              </Link>
              <Link
                to="/festofferstable"
                onClick={handleItemClick}
                className={
                  isActive("/festofferstable") || isActive("/festoffers")
                }
              >
                Festival Offers
              </Link>
              <Link
                to="/rates"
                onClick={handleItemClick}
                className={isActive("/rates")}
              >
                Rates
              </Link>
              <Link
                to="/company_info"
                onClick={handleItemClick}
                className={isActive("/company_info")}
              >
                Company Info
              </Link>
              <Link
                  to="/visit-logs-warehouse-schedule"
                  onClick={handleItemClick}
                  className={isActive("/visit-logs-warehouse-schedule")}
                >
                  Visit Logs Warehouse
                </Link>
            </div>
          )}
        </div>

        {/* Transactions Dropdown */}
        <div
          className="navbar-dropdown"
          onMouseEnter={() => openDropdown("transactions")}
          onMouseLeave={() => closeDropdown("transactions")}
        >
          <span className="navbar-dropdown-title">
            TRANSACTIONS{" "}
            <FontAwesomeIcon
              icon={transactionsDropdownOpen ? faChevronUp : faChevronDown}
              className="dropdown-arrow-icon"
            />
          </span>
          {transactionsDropdownOpen && (
            <div className="navbar-dropdown-content">
              <Link
                to="/salestable"
                onClick={handleItemClick}
                className={isActive("/salestable") || isActive("/sales")}
              >
                Sales
              </Link>
              <Link
                to="/salesreturn"
                onClick={handleItemClick}
                className={isActive("/salesreturn")}
              >
                Sales Return
              </Link>
              <Link
                to="/estimatetable"
                onClick={handleItemClick}
                className={isActive("/estimatetable") || isActive("/estimates")}
              >
                Estimate
              </Link>
              <Link
                to="/stockEntryTable"
                onClick={handleItemClick}
                className={isActive("/stockEntryTable")}
              >
                Stock
              </Link>
                <Link
                to="/stock-transfer"
                onClick={handleItemClick}
                className={isActive("/stocktransfer")}
              >
                Stock Transfer
              </Link>

              <Link
                to="/received-stock"
                onClick={handleItemClick}
                className={isActive("/received-stock")}
              >
                Received Stock
              </Link>
                {/* New Warehouse Stock Items field added below Stock Transfer */}
              <Link
                to="/warehouse-stock-items"
                onClick={handleItemClick}
                className={isActive("/warehouse-stock-items")}
              >
                Warehouse Stock Items
              </Link>
              <Link
                to="/paymentstable"
                onClick={handleItemClick}
                className={isActive("/paymentstable") || isActive("/payments")}
              >
                Payments
              </Link>
              <Link
                to="/receiptstable"
                onClick={handleItemClick}
                className={isActive("/receiptstable") || isActive("/receipts")}
              >
                Receipts
              </Link>
              <Link
                to="/purchasetable"
                onClick={handleItemClick}
                className={isActive("/purchasetable") || isActive("/purchase")}
              >
                Purchase
              </Link>
              <Link
                to="/repairstable"
                onClick={handleItemClick}
                className={isActive("/repairstable") || isActive("/repairs")}
              >
                Repairs
              </Link>
              <Link
                to="/orderstable"
                onClick={handleItemClick}
                className={isActive("/orderstable") || isActive("/orders")}
              >
                Orders
              </Link>
              <Link
                to="/urdpurchasetable"
                onClick={handleItemClick}
                className={
                  isActive("/urdpurchasetable") || isActive("/urd_purchase")
                }
              >
                URD Purchase
              </Link>
              <Link
                to="/ledger"
                onClick={handleItemClick}
                className={
                  isActive("/ledger") || isActive("/ledger")
                }
              >
                Ledger
              </Link>
            </div>
          )}
        </div>

        {/* Reports Dropdown */}
        <div
          className="navbar-dropdown"
          onMouseEnter={() => openDropdown("reports")}
          onMouseLeave={() => closeDropdown("reports")}
        >
          <span className="navbar-dropdown-title">
            REPORTS{" "}
            <FontAwesomeIcon
              icon={reportsDropdownOpen ? faChevronUp : faChevronDown}
              className="dropdown-arrow-icon"
            />
          </span>
          {reportsDropdownOpen && (
            <div className="navbar-dropdown-content">
              <Link
                to="/stockReport"
                onClick={handleItemClick}
                className={isActive("/stockReport")}
              >
                Stock Report
              </Link>
              <Link
                to="/salesReport"
                onClick={handleItemClick}
                className={isActive("/salesReport")}
              >
                Sales Report
              </Link>
              <Link
                to="/salesBalanceReport"
                onClick={handleItemClick}
                className={isActive("/salesBalanceReport")}
              >
                Sales Balance Report
              </Link>
              <Link
                to="/estimateReport"
                onClick={handleItemClick}
                className={isActive("/estimateReport")}
              >
                Estimate Report
              </Link>
              <Link
                to="/purchaseReport"
                onClick={handleItemClick}
                className={isActive("/purchaseReport")}
              >
                Purchase Report
              </Link>
              <Link
                to="/purchaseBalanceReport"
                onClick={handleItemClick}
                className={isActive("/purchaseBalanceReport")}
              >
                Purchase Balance Report
              </Link>
              <Link
                to="/repairsReport"
                onClick={handleItemClick}
                className={isActive("/repairsReport")}
              >
                Repairs Report
              </Link>
              <Link
                to="/urdPurchaseReport"
                onClick={handleItemClick}
                className={isActive("/urdPurchaseReport")}
              >
                URDPurchase Report
              </Link>
              <Link
                to="/ratesdata"
                onClick={handleItemClick}
                className={isActive("/ratesdata")}
              >
                Rates Report
              </Link>
              {/* <Link to="/barcodeprinting" onClick={handleItemClick} className={isActive('/barcodeprinting')}>Barcode Printing Report</Link> */}

              <Link
                to="/itemsales"
                onClick={handleItemClick}
                className={isActive("/itemsales")}
              >
                Item Sale Report
              </Link>
            </div>
          )}
        </div>

        {/* Utility/Settings Dropdown */}
        {/* <div
          className="navbar-dropdown"
          onMouseEnter={() => toggleDropdown('utility')}
          onMouseLeave={() => toggleDropdown('utility')}
        >
          <span className="navbar-dropdown-title">
            UTILITY/SETTINGS{' '}
            <FontAwesomeIcon
              icon={utilityDropdownOpen ? faChevronUp : faChevronDown}
              className="dropdown-arrow-icon"
            />
          </span>
          {utilityDropdownOpen && (
            <div className="navbar-dropdown-content">
              <Link to="/invoice" onClick={handleItemClick} className={isActive('/invoice')}>Invoice</Link>
            </div>
          )}
        </div> */}

        <div>
          <span>
            {(location.pathname === "/sales" ||
              location.pathname === "/salestable") && (
                <h1 className="path-heading">SALES</h1>
              )}
            {(location.pathname === "/purchase" ||
              location.pathname === "/purchasetable") && (
                <h1 className="path-heading">PURCHASE</h1>
              )}
            {(location.pathname === "/subcategory" ||
              location.pathname === "/subcategorytable") && (
                <h1 className="path-heading">SUB CATEGORY</h1>
              )}
            {(location.pathname === "/festoffers" ||
              location.pathname === "/festofferstable") && (
                <h1 className="path-heading">FESTIVAL OFFERS</h1>
              )}
            {location.pathname === "/salesreturn" && (
              <h1 className="path-heading">SALES RETURN</h1>
            )}
            {(location.pathname === "/estimates" ||
              location.pathname === "/estimatetable") && (
                <h1 className="path-heading">ESTIMATE</h1>
              )}
            {(location.pathname === "/payments" ||
              location.pathname === "/paymentstable") && (
                <h1 className="path-heading">PAYMENTS</h1>
              )}
            {(location.pathname === "/receipts" ||
              location.pathname === "/receiptstable") && (
                <h1 className="path-heading">RECEIPTS</h1>
              )}
            {(location.pathname === "/repairs" ||
              location.pathname === "/repairstable") && (
                <h1 className="path-heading">REPAIRS</h1>
              )}
            {(location.pathname === "/urd_purchase" ||
              location.pathname === "/urdpurchasetable") && (
                <h1 className="path-heading">URD PURCHASE</h1>
              )}
            {(location.pathname === "/orders" ||
              location.pathname === "/orderstable") && (
                <h1 className="path-heading">ORDERS</h1>
              )}
            {(location.pathname === "/customermaster" ||
              location.pathname === "/customerstable") && (
                <h1 className="path-heading">CUSTOMERS</h1>
              )}
            {(location.pathname === "/suppliermaster" ||
              location.pathname === "/suppliertable") && (
                <h1 className="path-heading">SUPPLIERS</h1>
              )}
            {(location.pathname === "/itemmaster" ||
              location.pathname === "/itemmastertable") && (
                <h1 className="path-heading">CATEGORY</h1>
              )}
            {location.pathname === "/purity" && (
              <h1 className="path-heading">PURITY</h1>
            )}
             {location.pathname === "/qrcodeprinting" && (
              <h1 className="path-heading">QR CODE PRINTING</h1>
            )}
            {location.pathname === "/metaltype" && (
              <h1 className="path-heading">METAL TYPE</h1>
            )}
            {location.pathname === "/designmaster" && (
              <h1 className="path-heading">DESIGN MASTER</h1>
            )}
            {(location.pathname === "/accounts" ||
              location.pathname === "/accountstable") && (
                <h1 className="path-heading">ACCOUNTS</h1>
              )}
            {(location.pathname === "/workermaster" ||
              location.pathname === "/workerstable") && (
                <h1 className="path-heading">WORKERS</h1>
              )}
            {location.pathname === "/rates" && (
              <h1 className="path-heading">RATES</h1>
            )}
            {location.pathname === "/company_info" && (
              <h1 className="path-heading">COMPANY INFO</h1>
            )}
            {location.pathname === "/stockEntryTable" && (
              <h1 className="path-heading">STOCK</h1>
            )}
            {(location.pathname === "/usertable" ||
              location.pathname === "/usermaster") && (
                <h1 className="path-heading">USER</h1>
              )}
          </span>
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

export default Navbar;
