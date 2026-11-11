// StockNavbar.js
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FaSignOutAlt } from "react-icons/fa";
import { FiBell } from 'react-icons/fi';
import Swal from "sweetalert2";
import logo from "./jiya_logo.png";
import "./StockNavbar.css";
import { Badge, Dropdown, Modal, Button } from "react-bootstrap";
import baseURL from "../Url/NodeBaseURL";
import WarehouseNotificationModal, { parseNotificationMessage, splitCustomer } from "./WarehouseNotificationModel";

function StockNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [stockManagementDropdownOpen, setStockManagementDropdownOpen] = useState(false);
  const [inwardSubDropdownOpen, setInwardSubDropdownOpen] = useState(false);
  const [outwardSubDropdownOpen, setOutwardSubDropdownOpen] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  // NEW: Today's visits (current warehouse only) + visit details modal
  const [todayVisits, setTodayVisits] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  // NEW: notification details modal
  const [selectedNotification, setSelectedNotification] = useState(null);

  // ==========================================================
  // NO AuthContext — this module reads userId / userName
  // directly from localStorage (set at warehouse login time).
  // ==========================================================
  const [displayName, setDisplayName] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  // Ref to store the RESOLVED stock_point_id used for notifications
  const currentStockPointIdRef = useRef(null);
  // Ref to store interval ID
  const intervalRef = useRef(null);

  // Read the raw auth values straight from localStorage
  const getStoredAuth = () => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    return { userId, userName };
  };

  // Get current stock point display name
  const getCurrentStockPoint = () => {
    const { userName } = getStoredAuth();
    return userName || '';
  };

  // ==========================================================
  // Resolve the ACTUAL stock_point_id for this logged-in warehouse.
  //
  // Priority 1: Match localStorage `userId` directly against
  //             stock_points.stock_point_id (fast + exact, no
  //             string/case issues).
  // Priority 2: Fallback to matching localStorage `userName`
  //             against stock_points.stock_point_name (in case
  //             userId doesn't correspond 1:1 with stock_point_id
  //             for some accounts).
  // ==========================================================
  const resolveCurrentStockPointId = async () => {
    try {
      const { userId: storedUserId, userName: storedUserName } = getStoredAuth();

      const response = await fetch(`${baseURL}/api/stockpoints`);
      const data = await response.json();

      if (!Array.isArray(data)) {
        console.warn('⚠️ /api/stockpoints did not return an array');
        return null;
      }

      // Priority 1: match by userId === stock_point_id
      if (storedUserId) {
        const idMatch = data.find(
          sp => String(sp.stock_point_id) === String(storedUserId)
        );
        if (idMatch) {
          console.log(`✅ Resolved stock point by userId (${storedUserId}): ${idMatch.stock_point_name} (ID: ${idMatch.stock_point_id})`);
          return idMatch.stock_point_id;
        }
      }

      // Priority 2: match by userName === stock_point_name
      if (storedUserName) {
        const nameMatch = data.find(
          sp => sp.stock_point_name?.trim().toLowerCase() === storedUserName.trim().toLowerCase()
        );
        if (nameMatch) {
          console.log(`✅ Resolved stock point by userName ("${storedUserName}"): ${nameMatch.stock_point_name} (ID: ${nameMatch.stock_point_id})`);
          return nameMatch.stock_point_id;
        }
      }

      console.warn(`⚠️ Could not resolve stock point for userId="${storedUserId}", userName="${storedUserName}". Available stock points:`, data.map(sp => ({ id: sp.stock_point_id, name: sp.stock_point_name })));
      return null;
    } catch (error) {
      console.error('❌ Error resolving current stock point id for notifications:', error);
      return null;
    }
  };

  // Fetch notifications for warehouse
  const fetchWarehouseNotifications = async (stockPointId) => {
    try {
      if (!stockPointId) {
        console.warn('⚠️ Skipping notification fetch — no stockPointId resolved yet');
        return;
      }

      const response = await fetch(`${baseURL}/api/visit-logs-warehouse-schedule/notifications/${stockPointId}?userType=warehouse&limit=50`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const notifs = data.notifications || [];
          setNotifications(notifs);
          const unread = notifs.filter(n => !n.is_read).length;
          setUnreadCount(unread);
          console.log(`🔄 Notifications fetched for stockPointId ${stockPointId}: ${notifs.length}, unread: ${unread}`);
        }
      } else {
        console.warn(`⚠️ Notification fetch responded with status ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching warehouse notifications:', error);
    }
  };

  // ==========================================================
  // NEW: helpers for Today's Visits + Visit Details modal
  // ==========================================================
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return (
      d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    );
  };

  const formatTimeOnly = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      : '';

  // unique salesman names for a customer's visits
  const getSalesmanNames = (c) => {
    const names = [...new Set((c?.visits || []).map(v => v.salesman_name).filter(Boolean))];
    return names.length ? names.join(', ') : 'Not Assigned';
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'primary';
      case 'available': return 'success';
      case 'not available': return 'danger';
      default: return 'secondary';
    }
  };

  // Today's scheduled visits, filtered by the CURRENT warehouse only
  const fetchTodayVisits = async (stockPointId) => {
    try {
      if (!stockPointId) {
        setTodayVisits([]);
        return;
      }

      const scheduleRes = await fetch(`${baseURL}/api/visit-logs-warehouse-schedule`);
      if (!scheduleRes.ok) throw new Error('Failed to fetch schedule visits');
      const scheduleData = await scheduleRes.json();

      // Account details only used to get a nicer customer name; not fatal if it fails
      let accountData = [];
      try {
        const accountRes = await fetch(`${baseURL}/get/account-details`);
        if (accountRes.ok) accountData = await accountRes.json();
      } catch (e) {
        console.warn('⚠️ Could not load account details for navbar visits:', e);
      }

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      const todays = (Array.isArray(scheduleData) ? scheduleData : []).filter(v => {
        // same warehouse only (Number() avoids string/number mismatch)
        if (!v.warehouse_id || Number(v.warehouse_id) !== Number(stockPointId)) return false;
        if (v.status !== 'scheduled' || !v.scheduled_date) return false;
        const d = new Date(v.scheduled_date);
        return d >= todayStart && d <= todayEnd;
      });

      const grouped = {};
      todays.forEach(v => {
        const acc = (Array.isArray(accountData) ? accountData : []).find(a => a.customer_id === v.customer_id);
        // one entry per customer + salesman + scheduled time, so each salesman is listed separately
        const key = `${v.customer_account_id || v.customer_id}|${v.salesman_id || 'none'}|${new Date(v.scheduled_date).getTime()}`;

        if (!grouped[key]) {
          grouped[key] = {
            customer_account_id: v.customer_account_id,
            customer_id: v.customer_id,
            customer_name: acc?.account_name || v.customer_name || 'Unknown Customer',
            visits: []
          };
        }

        grouped[key].visits.push({
          id: v.id,
          barcode: v.barcode,
          product_name: v.product_name || null,
          category: v.category || null,
          scheduled_date: v.scheduled_date,
          status: v.status,
          salesman_id: v.salesman_id,
          salesman_name: v.salesman_name,
          salesman_photo: v.salesman_photo || null,
          customer_status: v.customer_status || 'Scheduled',
          reschedule_date: v.reschedule_date || null
        });
      });

      // earliest first
      const list = Object.values(grouped).sort(
        (a, b) => new Date(a.visits[0].scheduled_date) - new Date(b.visits[0].scheduled_date)
      );
      setTodayVisits(list);
    } catch (error) {
      console.error('❌ Error fetching today visits (navbar):', error);
      setTodayVisits([]);
    }
  };

  // Refresh notifications function that can be called externally
  const refreshNotifications = async () => {
    let stockPointId = currentStockPointIdRef.current;
    if (!stockPointId) {
      // Try resolving again in case it wasn't ready the first time
      stockPointId = await resolveCurrentStockPointId();
      currentStockPointIdRef.current = stockPointId;
    }
    if (stockPointId) {
      console.log('🔄 Manually refreshing notifications...');
      await fetchWarehouseNotifications(stockPointId);
      await fetchTodayVisits(stockPointId); // NEW
    }
  };

  // Expose refresh function to window for other components to call
  useEffect(() => {
    window.refreshWarehouseNotifications = refreshNotifications;
    return () => {
      delete window.refreshWarehouseNotifications;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set the display name from localStorage on mount
  useEffect(() => {
    setDisplayName(getCurrentStockPoint());
  }, []);

  // Resolve stock point id once, then fetch + poll notifications (and today's visits)
  useEffect(() => {
    const init = async () => {
      const stockPointId = await resolveCurrentStockPointId();
      currentStockPointIdRef.current = stockPointId;
      await fetchWarehouseNotifications(stockPointId);
      await fetchTodayVisits(stockPointId); // NEW

      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        fetchWarehouseNotifications(currentStockPointIdRef.current);
        fetchTodayVisits(currentStockPointIdRef.current); // NEW
      }, 30000);
    };

    init();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${baseURL}/api/visit-logs-warehouse-schedule/notifications/${notificationId}/read`, {
        method: 'PUT'
      });

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const stockPointId = currentStockPointIdRef.current;
    if (!stockPointId) return;

    try {
      await fetch(`${baseURL}/api/visit-logs-warehouse-schedule/notifications/mark-all-read/${stockPointId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType: 'warehouse' })
      });

      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      setUnreadCount(0);

      Swal.fire({
        icon: 'success',
        title: 'All notifications marked as read',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get notification icon
  const getNotificationIcon = (notification) => {
    const msg = notification.message || '';
    const type = notification.type || '';
    if (msg.includes('scheduled') || type === 'schedule') return '📅';
    if (msg.includes('warehouse') || type === 'warehouse_schedule') return '📦';
    if (msg.includes('assigned') || msg.includes('Assigned')) return '👤';
    if (msg.includes('Completed')) return '✅';
    if (msg.includes('Cancelled')) return '❌';
    if (msg.includes('Updated')) return '🔄';
    return '🔔';
  };

  // NEW: open notification details + mark as read (badge count drops immediately)
  const openNotification = (n) => {
    setSelectedNotification(n);
    setNotificationDropdownOpen(false);
    if (!n.is_read) markAsRead(n.id);
  };

  // NEW: short, readable preview lines for the dropdown card
  const getNotificationPreview = (n) => {
    const { intro, fields, items } = parseNotificationMessage(n.message);
    const get = (label) => fields.find(f => f.label.toLowerCase() === label)?.value;
    const parts = [];
    const customer = get('customer');
    const date = get('date');
    const time = get('time');
    const sales = get('salesperson') || get('salesman');
    if (sales) parts.push(`🧑‍💼 ${sales === 'Not assigned yet' ? 'Not assigned' : sales}`);
    if (customer) {
      const code = splitCustomer(customer).id;
      if (code) parts.push(`🆔 ${code}`);
    }
    if (date) parts.push(`📅 ${date}${time ? ' · ' + time : ''}`);
    if (items.length) parts.push(`📦 ${items.length} product${items.length > 1 ? 's' : ''}`);
    if (!parts.length) return { line1: intro[0] || (fields[0] ? `${fields[0].label}: ${fields[0].value}` : ''), rest: [] };
    return { line1: intro[0] || '', rest: parts };
  };

  const getNotificationColor = (n) => {
    const t = (n.title || '').toLowerCase();
    if (t.includes('cancel')) return { bg: '#fee2e2', fg: '#dc2626' };
    if (t.includes('complete') || t.includes('available')) return { bg: '#dcfce7', fg: '#16a34a' };
    if (t.includes('update') || t.includes('reschedule') || t.includes('not available')) return { bg: '#fef3c7', fg: '#d97706' };
    return { bg: '#fdebd0', fg: '#a36e29' };
  };

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
        // Clean up localStorage on logout
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        navigate("/");
      }
    });
  };

  const isActive = (path) => {
    return location.pathname === path ? "stock-navbar-active" : "";
  };

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
                      color: isSubActive(["/return-to-main-stock-old-items", "/add-return-to-main-stock-old-items", "/outward-old-barcodes", "/return-to-main-stock", "/assign-to-salesman"])
                        ? "#a36e29"
                        : "#333",
                      fontWeight: isSubActive(["/return-to-main-stock-old-items", "/add-return-to-main-stock-old-items", "/outward-old-barcodes", "/return-to-main-stock", "/assign-to-salesman"])
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
                    {/* Outward to Main Admin (Old Barcodes) */}
                    <Link
                      to="/return-to-main-stock-old-items"
                      onClick={handleItemClick}
                      className={isActive("/return-to-main-stock-old-items")}
                    >
                      Outward to Main Admin (Non Selection)
                    </Link>
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

        {/* Day Book Link */}
        <div>
          <Link
            to="/day-book"
            onClick={handleItemClick}
            className={isActive("/day-book")}
            style={{
              color: location.pathname === "/day-book" ? "#a36e29" : "black",
              backgroundColor: "transparent",
              textDecoration: "none",
            }}
          >
            DAY BOOK
          </Link>
        </div>

        {/* Page heading */}
        <div>
          {location.pathname === "/warehouse-stock-respective-items" && (
            <h1 className="stock-path-heading">STOCK</h1>
          )}
          {location.pathname === "/stock-inward" && (
            <h1 className="stock-path-heading">INWARD FROM MAIN ADMIN</h1>
          )}
          {location.pathname === "/receive-from-salesman" && (
            <h1 className="stock-path-heading">INWARD FROM SALESMAN</h1>
          )}
          {location.pathname === "/add-receive-from-salesman" && (
            <h1 className="stock-path-heading">ADD INWARD FROM SALESMAN</h1>
          )}
          {location.pathname === "/return-to-main-stock-old-items" && (
            <h1 className="stock-path-heading">OUTWARD TO MAIN ADMIN (OLD)</h1>
          )}
            {location.pathname === "/add-return-to-main-stock-old-items" && (
            <h1 className="stock-path-heading">ADD OUTWARD TO MAIN ADMIN (OLD)</h1>
          )}
          {location.pathname === "/return-to-main-stock" && (
            <h1 className="stock-path-heading">OUTWARD TO MAIN ADMIN</h1>
          )}
          {location.pathname === "/add-return-to-main-stock" && (
            <h1 className="stock-path-heading">ADD OUTWARD TO MAIN ADMIN</h1>
          )}
          {location.pathname === "/assign-to-salesman" && (
            <h1 className="stock-path-heading">OUTWARD TO SALESMAN</h1>
          )}
          {location.pathname === "/add-assign-salesmantransfer" && (
            <h1 className="stock-path-heading">ADD OUTWARD TO SALESMAN</h1>
          )}
        </div>
      </nav>

      {/* Notification Bell with Dropdown */}
      <div className="stock-navbar-notification" style={{ position: 'relative', marginRight: '10px' }}>
        <Dropdown
          show={notificationDropdownOpen}
          onToggle={setNotificationDropdownOpen}
          align="end"
        >
          <Dropdown.Toggle as="div" style={{ cursor: 'pointer', padding: '4px' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <FiBell size={22} color="#333" />
              {unreadCount > 0 && (
                <Badge
                  pill
                  bg="danger"
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-12px',
                    fontSize: '10px',
                    padding: '2px 6px',
                    animation: 'pulse 2s infinite',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    minWidth: '18px'
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
              {unreadCount === 0 && todayVisits.length > 0 && (
                <Badge
                  pill
                  bg="warning"
                  text="dark"
                  title={`${todayVisits.length} visit${todayVisits.length > 1 ? 's' : ''} today`}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-12px',
                    fontSize: '10px',
                    padding: '2px 6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    minWidth: '18px'
                  }}
                >
                  {todayVisits.length}
                </Badge>
              )}
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu
            style={{
              width: '380px',
              maxHeight: '500px',
              overflowY: 'auto',
              padding: '0',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              border: '1px solid #e5e7eb',
              position: 'absolute',
              right: 0,
              top: '100%',
              zIndex: 9999
            }}
          >
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #fff7ed 0%, #fdebd0 100%)',
              borderRadius: '12px 12px 0 0',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiBell size={18} color="#a36e29" />
                <strong style={{ fontSize: '15px' }}>Notifications</strong>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    fontSize: '12px',
                    textDecoration: 'none',
                    color: '#a36e29',
                    fontWeight: 500,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* ========== NEW: TODAY'S VISITS (current warehouse only) ========== */}
            <div style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fffbeb' }}>
              <div style={{
                padding: '10px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '13px',
                fontWeight: 600,
                color: '#92400e'
              }}>
                <span>📅 Today's Visits</span>
                <Badge bg="warning" text="dark" pill style={{ fontSize: '12px', minWidth: '24px', padding: '5px 8px' }}>{todayVisits.length}</Badge>
              </div>

              {todayVisits.length === 0 ? (
                <div style={{ padding: '4px 18px 12px', fontSize: '12px', color: '#9ca3af' }}>
                  No visits scheduled today
                </div>
              ) : (
                todayVisits.map((c, idx) => (
                  <div
                    key={`${c.customer_account_id}-${idx}`}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setNotificationDropdownOpen(false);
                    }}
                    style={{
                      padding: '10px 18px',
                      cursor: 'pointer',
                      borderTop: '1px solid #fef3c7',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef3c7')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                        {getSalesmanNames(c)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        🆔 {c.customer_id} · 🕐 {formatTimeOnly(c.visits[0]?.scheduled_date)} · <strong>📦 {c.visits.length} product{c.visits.length > 1 ? 's' : ''}</strong>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#a36e29', whiteSpace: 'nowrap' }}>View ›</span>
                  </div>
                ))
              )}
            </div>
            {/* ========== END TODAY'S VISITS ========== */}

            <div className="stock-notification-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{
                  padding: '50px 20px',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <div style={{ marginBottom: '14px' }}>
                    <FiBell size={40} style={{ opacity: 0.3 }} />
                  </div>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: '#374151' }}>No notifications</p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>
                    You'll be notified about new customer visits and updates here
                  </p>
                </div>
              ) : (
                notifications.map(notification => {
                  const color = getNotificationColor(notification);
                  const preview = getNotificationPreview(notification);
                  return (
                    <div
                      key={notification.id}
                      onClick={() => openNotification(notification)}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: notification.is_read ? '#ffffff' : '#fff8ec',
                        borderBottom: '1px solid #f1f5f9',
                        borderLeft: notification.is_read ? '4px solid transparent' : '4px solid #a36e29',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = notification.is_read ? '#ffffff' : '#fff8ec'; }}
                    >
                      <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '50%',
                          backgroundColor: color.bg, color: color.fg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '18px', flexShrink: 0
                        }}>
                          {getNotificationIcon(notification)}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontSize: '13px',
                              fontWeight: notification.is_read ? 500 : 700,
                              color: '#111827',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                              {notification.title}
                            </span>
                            {!notification.is_read && (
                              <span style={{
                                width: '8px', height: '8px', backgroundColor: '#a36e29',
                                borderRadius: '50%', flexShrink: 0
                              }}></span>
                            )}
                          </div>

                          {preview.line1 && (
                            <div style={{
                              fontSize: '12px', color: '#6b7280', marginTop: '2px',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                              {preview.line1}
                            </div>
                          )}

                          {preview.rest.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', marginTop: '4px' }}>
                              {preview.rest.map((r, i) => (
                                <span key={i} style={{ fontSize: '11px', color: '#475569' }}>{r}</span>
                              ))}
                            </div>
                          )}

                          <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            marginTop: '6px', fontSize: '10px', color: '#9ca3af'
                          }}>
                            <span>🕐 {formatRelativeTime(notification.created_at)}</span>
                            <span style={{ color: '#a36e29', fontWeight: 500 }}>View details ›</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className="stock-username">{displayName}</div>
      <div className="stock-navbar-logout">
        <button className="stock-logout-button" onClick={handleLogout}>
          <FaSignOutAlt size={18} /> Logout
        </button>
      </div>

      {/* ============ NEW: NOTIFICATION DETAILS MODAL ============ */}
      <WarehouseNotificationModal
        show={!!selectedNotification}
        onHide={() => setSelectedNotification(null)}
        notification={selectedNotification}
        warehouseName={displayName}
      />

      {/* ============ NEW: VISIT DETAILS MODAL (vertical layout) ============ */}
      <Modal
        show={!!selectedCustomer}
        onHide={() => setSelectedCustomer(null)}
        centered
        scrollable
        contentClassName="border-0"
      >
        <Modal.Header closeButton closeVariant="white" style={{ backgroundColor: '#a36e29', color: '#fff' }}>
          <Modal.Title style={{ fontSize: '18px', color: '#fff' }}>
            📅 Visit Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#f8fafc' }}>
          {selectedCustomer && (() => {
            const first = selectedCustomer.visits[0] || {};
            const photo = (selectedCustomer.visits.find(v => v.salesman_photo) || {}).salesman_photo;
            const multiSales = new Set(selectedCustomer.visits.map(v => v.salesman_name || '')).size > 1;
            const labelStyle = { fontSize: '12px', color: '#64748b', marginBottom: '2px' };
            const valueStyle = { fontSize: '14px', color: '#1e293b', fontWeight: 500 };
            return (
              <>
                {/* Summary card */}
                <div style={{
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
                  padding: '16px', marginBottom: '16px', display: 'flex', gap: '14px', alignItems: 'center'
                }}>
                  {photo ? (
                    <img
                      src={photo.startsWith('http') ? photo : `${baseURL}${photo}`}
                      alt=""
                      style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #a36e29' }}
                    />
                  ) : (
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%', background: '#fdebd0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26
                    }}>🧑‍💼</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={labelStyle}>Salesperson</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>
                      {getSalesmanNames(selectedCustomer)}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      🆔 {selectedCustomer.customer_id} · 🕐 {formatDateTime(first.scheduled_date)}
                    </div>
                  </div>
                  <Badge bg="warning" text="dark" pill>
                    {selectedCustomer.visits.length} item{selectedCustomer.visits.length > 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Products — one card per item, stacked vertically */}
                {selectedCustomer.visits.map((v, i) => (
                  <div key={v.id} style={{
                    background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #a36e29',
                    borderRadius: '10px', padding: '14px 16px', marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
                        #{i + 1} &nbsp;<Badge bg="dark">{v.barcode}</Badge>
                      </span>
                      <Badge bg={getStatusBadgeColor(v.customer_status)}>{v.customer_status}</Badge>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                      <div>
                        <div style={labelStyle}>Product</div>
                        <div style={valueStyle}>{v.product_name || '—'}</div>
                      </div>
                      <div>
                        <div style={labelStyle}>Category</div>
                        <div style={valueStyle}>{v.category || '—'}</div>
                      </div>
                      {multiSales && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={labelStyle}>Salesperson</div>
                          <div style={valueStyle}>
                            {v.salesman_id ? (v.salesman_name || `ID: ${v.salesman_id}`) : <Badge bg="secondary">Not Assigned</Badge>}
                          </div>
                        </div>
                      )}
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={labelStyle}>Scheduled Date &amp; Time</div>
                        <div style={valueStyle}>
                          {v.reschedule_date ? (
                            <>
                              <span className="text-decoration-line-through text-muted">{formatDateTime(v.scheduled_date)}</span><br />
                              <span style={{ color: '#d97706' }}>Rescheduled: {formatDateTime(v.reschedule_date)}</span>
                            </>
                          ) : formatDateTime(v.scheduled_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            );
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedCustomer(null)}>Close</Button>
        </Modal.Footer>
      </Modal>
      {/* ============ END VISIT DETAILS MODAL ============ */}

      {/* Add pulse animation style */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .stock-notification-list::-webkit-scrollbar {
          width: 4px;
        }

        .stock-notification-list::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .stock-notification-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }

        .stock-notification-list::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .dropdown-menu {
          transform: translateY(8px) !important;
        }
      `}</style>
    </header>
  );
}

export default StockNavbar;