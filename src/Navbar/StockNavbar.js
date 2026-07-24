// StockNavbar.js
import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FaSignOutAlt } from "react-icons/fa";
import { FiBell } from 'react-icons/fi';
import { AuthContext } from "../Components/Pages/Login/Context";
import Swal from "sweetalert2";
import logo from "./jiya_logo.png";
import "./StockNavbar.css";
import { Badge, Dropdown } from "react-bootstrap";
// FIX: Only ONE base URL needed here — the ERP backend (port 5001).
// /api/visit-logs-warehouse-schedule/* and /api/stockpoints both live there.
// The previous code imported baseURL2 (port 5000) for the notifications call,
// which is a different server that doesn't have this route — so the fetch
// silently failed and the bell always showed 0 notifications.
import baseURL from "../Url/NodeBaseURL";

function StockNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [stockManagementDropdownOpen, setStockManagementDropdownOpen] =
    useState(false);
  const [inwardSubDropdownOpen, setInwardSubDropdownOpen] = useState(false);
  const [outwardSubDropdownOpen, setOutwardSubDropdownOpen] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  const { userName, userId } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Get current stock point name the same way the Dashboard does
  const getCurrentStockPoint = () => {
    const storedUserName = localStorage.getItem('userName');
    return storedUserName || userName || '';
  };

  // FIX: Resolve the ACTUAL stock_point_id for this warehouse by matching
  // stock_point_name against the logged-in user's name. The notifications
  // table stores this same stock_point_id as `user_id` (user_type='warehouse')
  // — the old code guessed at user.warehouse_id / user.stock_point_id / user.id
  // from localStorage, which don't reliably exist for a warehouse login.
  const resolveCurrentStockPointId = async () => {
    try {
      const currentStockPoint = getCurrentStockPoint();
      const response = await fetch(`${baseURL}/api/stockpoints`);
      const data = await response.json();

      if (Array.isArray(data)) {
        const match = data.find(
          sp => sp.stock_point_name?.trim().toLowerCase() === currentStockPoint.trim().toLowerCase()
        );
        if (match) {
          return match.stock_point_id;
        }
      }
    } catch (error) {
      console.error('Error resolving current stock point id for notifications:', error);
    }
    return null;
  };

  // Fetch notifications for warehouse
  const fetchWarehouseNotifications = async (stockPointId) => {
    try {
      if (!stockPointId) return;

      // FIX: baseURL (5001), not baseURL2 (5000)
      const response = await fetch(`${baseURL}/api/visit-logs-warehouse-schedule/notifications/${stockPointId}?userType=warehouse&limit=50`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const notifs = data.notifications || [];
          setNotifications(notifs);
          const unread = notifs.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        }
      }
    } catch (error) {
      console.error('Error fetching warehouse notifications:', error);
    }
  };

  // Resolve stock point id once, then fetch + poll notifications using it
  useEffect(() => {
    let stockPointId = null;
    let interval;

    const init = async () => {
      stockPointId = await resolveCurrentStockPointId();
      await fetchWarehouseNotifications(stockPointId);

      interval = setInterval(() => {
        fetchWarehouseNotifications(stockPointId);
      }, 30000);
    };

    init();

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      // FIX: baseURL (5001), not baseURL2 (5000)
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
    const stockPointId = await resolveCurrentStockPointId();
    if (!stockPointId) return;

    try {
      // FIX: baseURL (5001), not baseURL2 (5000)
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
              backgroundColor: '#f9fafb',
              borderRadius: '12px 12px 0 0',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiBell size={18} color="#3b82f6" />
                <strong style={{ fontSize: '15px' }}>Notifications</strong>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    fontSize: '12px',
                    textDecoration: 'none',
                    color: '#3b82f6',
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
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                    style={{
                      padding: '14px 18px',
                      backgroundColor: notification.is_read ? 'white' : '#eff6ff',
                      borderBottom: '1px solid #f3f4f6',
                      borderLeft: notification.is_read ? '4px solid transparent' : '4px solid #3b82f6',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = notification.is_read ? 'white' : '#eff6ff';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                      <div style={{
                        fontSize: '20px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {getNotificationIcon(notification)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: notification.is_read ? '500' : '600',
                          marginBottom: '4px',
                          fontSize: '13px',
                          color: '#111827',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start'
                        }}>
                          <span>{notification.title}</span>
                          {!notification.is_read && (
                            <span style={{
                              width: '6px',
                              height: '6px',
                              backgroundColor: '#3b82f6',
                              borderRadius: '50%',
                              flexShrink: 0,
                              marginTop: '4px'
                            }}></span>
                          )}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px',
                          lineHeight: '1.4'
                        }}>
                          {notification.message}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          color: '#9ca3af',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>🕐</span>
                          {formatRelativeTime(notification.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className="stock-username">{userName}</div>
      <div className="stock-navbar-logout">
        <button className="stock-logout-button" onClick={handleLogout}>
          <FaSignOutAlt size={18} /> Logout
        </button>
      </div>

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