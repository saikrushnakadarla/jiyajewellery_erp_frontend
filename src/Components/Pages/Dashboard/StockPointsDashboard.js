import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../Login/Context";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import './Dashboard.css';
import baseURL from "../../../Url/NodeBaseURL";

function StockPointDashboard() {
  const { userName, userId, userType, authToken } = useContext(AuthContext);
  const navigate = useNavigate();

  // State for API data
  const [stockInwardCount, setStockInwardCount] = useState(0);
  const [stockOutwardCount, setStockOutwardCount] = useState(0);
  const [assignedToSalesmanCount, setAssignedToSalesmanCount] = useState(0);
  const [receivedFromSalesmanCount, setReceivedFromSalesmanCount] = useState(0);

  // State for table data
  const [assignedData, setAssignedData] = useState([]);
  const [receivedData, setReceivedData] = useState([]);
  const [openingTagsData, setOpeningTagsData] = useState([]);

  const [loading, setLoading] = useState({
    inward: true,
    outward: true,
    assigned: true,
    received: true,
    visits: true
  });

  // State for Today's Warehouse Visits
  const [todayVisits, setTodayVisits] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(true);
  const [currentStockPointId, setCurrentStockPointId] = useState(null);

  // Get userName from localStorage
  const getCurrentStockPoint = () => {
    const storedUserName = localStorage.getItem('userName');
    return storedUserName || userName || '';
  };

  // Resolve the stock_point_id that belongs to this logged-in warehouse
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
          console.log(`✅ Resolved current stock point: ${match.stock_point_name} (ID: ${match.stock_point_id})`);
          setCurrentStockPointId(match.stock_point_id);
          return match.stock_point_id;
        } else {
          console.warn(`⚠️ Could not find a stock point matching "${currentStockPoint}"`);
        }
      }
    } catch (error) {
      console.error('❌ Error resolving current stock point id:', error);
    }
    return null;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date for scheduled/reschedule display
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Fetch Today's Warehouse Visits
  const fetchTodayVisits = async (stockPointId) => {
    try {
      setVisitsLoading(true);

      if (!stockPointId) {
        console.warn('⚠️ No stock point id resolved yet, skipping visits fetch');
        setTodayVisits([]);
        return;
      }

      // Fetch visit logs
      const response = await fetch(`${baseURL}/api/visit-logs-warehouse-schedule`);
      if (!response.ok) {
        throw new Error('Failed to fetch schedule visits');
      }
      const scheduleData = await response.json();

      // Fetch account details
      const accountResponse = await fetch(`${baseURL}/get/account-details`);
      if (!accountResponse.ok) {
        throw new Error('Failed to fetch account details');
      }
      const accountData = await accountResponse.json();

      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      // Filter visits for today and this warehouse
      const todayVisitsFiltered = scheduleData.filter(visit => {
        if (!visit.warehouse_id || visit.warehouse_id !== stockPointId) return false;
        if (visit.status !== 'scheduled') return false;
        if (!visit.scheduled_date) return false;

        const visitDate = new Date(visit.scheduled_date);
        return visitDate >= todayStart && visitDate <= todayEnd;
      });

      // Group visits by customer and merge with account details
      const groupedVisits = {};
      todayVisitsFiltered.forEach(visit => {
        // Find matching account by customer_id
        const customerAccount = accountData.find(acc => 
          acc.customer_id === visit.customer_id
        );

        const customerKey = visit.customer_account_id || visit.customer_id;
        
        if (!groupedVisits[customerKey]) {
          groupedVisits[customerKey] = {
            customer_account_id: visit.customer_account_id,
            customer_id: visit.customer_id,
            customer_name: customerAccount?.account_name || visit.customer_name || 'Unknown Customer',
            customer_status: visit.customer_status || 'Scheduled',
            reschedule_date: visit.reschedule_date || null,
            reschedule_notes: visit.reschedule_notes || null,
            // Address details from account data
            address1: customerAccount?.address1 || null,
            address2: customerAccount?.address2 || null,
            city: customerAccount?.city || null,
            district: customerAccount?.district || null,
            pincode: customerAccount?.pincode || null,
            state: customerAccount?.state || null,
            visits: []
          };
        }
        
        groupedVisits[customerKey].visits.push({
          id: visit.id,
          warehouse_name: visit.warehouse_name,
          barcode: visit.barcode,
          scheduled_date: visit.scheduled_date,
          status: visit.status,
          salesman_name: visit.salesman_name,
          salesman_photo: visit.salesman_photo || null,
          customer_status: visit.customer_status || 'Scheduled',
          reschedule_date: visit.reschedule_date || null
        });
      });

      setTodayVisits(Object.values(groupedVisits));
      console.log(`✅ Found ${Object.values(groupedVisits).length} customer(s) with visits today for this warehouse`);
    } catch (error) {
      console.error('Error fetching today visits:', error);
      setTodayVisits([]);
    } finally {
      setVisitsLoading(false);
    }
  };

  // Fetch Stock Inward count
  const fetchStockInward = async () => {
    try {
      const currentStockPoint = getCurrentStockPoint();
      const response = await fetch(`${baseURL}/api/stock-transfer/get-stock-transfers`);
      const data = await response.json();

      if (Array.isArray(data)) {
        const filteredData = data.filter(item =>
          item.to_stock_point_name === currentStockPoint &&
          item.status === "completed"
        );

        const totalItems = filteredData.reduce((sum, item) => {
          return sum + (parseFloat(item.total_items) || 0);
        }, 0);

        setStockInwardCount(totalItems);
        setOpeningTagsData(filteredData);
      } else {
        setStockInwardCount(0);
        setOpeningTagsData([]);
      }
    } catch (error) {
      console.error('Error fetching stock inward data:', error);
      setStockInwardCount(0);
      setOpeningTagsData([]);
    } finally {
      setLoading(prev => ({ ...prev, inward: false }));
    }
  };

  // Fetch Stock Outward count
  const fetchStockOutward = async () => {
    try {
      const response = await fetch(`${baseURL}/get/opening-tags-entry`);
      const data = await response.json();

      if (data.result) {
        const filteredData = data.result.filter(item =>
          item.Status === "Selected" && item.Stock_Point === "MAIN STOCK ROOM"
        );
        setStockOutwardCount(filteredData.length);
      }
    } catch (error) {
      console.error('Error fetching stock outward data:', error);
      setStockOutwardCount(0);
    } finally {
      setLoading(prev => ({ ...prev, outward: false }));
    }
  };

  // Fetch Assigned to Salesman data
  const fetchAssignedToSalesman = async () => {
    try {
      const response = await fetch(`${baseURL}/api/assigned-salesman/get-assigned-transfers`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setAssignedToSalesmanCount(data.length);
        setAssignedData(data);
      }
    } catch (error) {
      console.error('Error fetching assigned to salesman data:', error);
      setAssignedToSalesmanCount(0);
      setAssignedData([]);
    } finally {
      setLoading(prev => ({ ...prev, assigned: false }));
    }
  };

  // Fetch Received from Salesman data
  const fetchReceivedFromSalesman = async () => {
    try {
      const response = await fetch(`${baseURL}/api/received-salesman/get-received-transfers`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setReceivedFromSalesmanCount(data.length);
        setReceivedData(data);
      }
    } catch (error) {
      console.error('Error fetching received from salesman data:', error);
      setReceivedFromSalesmanCount(0);
      setReceivedData([]);
    } finally {
      setLoading(prev => ({ ...prev, received: false }));
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    const init = async () => {
      const stockPointId = await resolveCurrentStockPointId();
      await fetchTodayVisits(stockPointId);
    };

    init();
    fetchStockInward();
    fetchStockOutward();
    fetchAssignedToSalesman();
    fetchReceivedFromSalesman();

    const visitsInterval = setInterval(async () => {
      const stockPointId = currentStockPointId || (await resolveCurrentStockPointId());
      fetchTodayVisits(stockPointId);
    }, 60000);

    return () => clearInterval(visitsInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prepare data for pie chart
  const getStockStatusData = () => {
    if (!openingTagsData.length) return [];

    const statusCount = {};
    openingTagsData.forEach(item => {
      const status = item.Status || 'Pending';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    return Object.keys(statusCount).map(key => ({
      name: key,
      value: statusCount[key]
    }));
  };

  // Prepare data for donut chart
  const getStockOverviewData = () => {
    return [
      { name: 'Stock Inward', value: stockInwardCount, color: '#14b8d4' },
      { name: 'Stock Outward', value: stockOutwardCount, color: '#34d399' },
      { name: 'Assigned', value: assignedToSalesmanCount, color: '#fbbf24' },
      { name: 'Received', value: receivedFromSalesmanCount, color: '#fb7185' }
    ];
  };

  // Prepare data for line chart
  const getMonthlyTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    return months.map((month) => ({
      month: month,
      inward: Math.floor(stockInwardCount * (0.3 + Math.random() * 0.5)) || 5,
      outward: Math.floor(stockOutwardCount * (0.2 + Math.random() * 0.5)) || 3,
      assigned: Math.floor(assignedToSalesmanCount * (0.2 + Math.random() * 0.5)) || 4,
      received: Math.floor(receivedFromSalesmanCount * (0.2 + Math.random() * 0.5)) || 2
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const handleStockInwardClick = () => {
    navigate("/stock-inward");
  };

  const handleStockOutwardClick = () => {
    navigate("/return-to-main-stock");
  };

  const handleAssignedToSalesmanClick = () => {
    navigate("/assign-to-salesman");
  };

  const handleReceivedFromSalesmanClick = () => {
    navigate("/receive-from-salesman");
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'scheduled':
        return 'primary';
      case 'available':
        return 'success';
      case 'not available':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Get unique salesman details for a customer
  const getSalesmanDetails = (visits) => {
    const salesmanMap = {};
    visits.forEach(v => {
      if (v.salesman_name && !salesmanMap[v.salesman_name]) {
        salesmanMap[v.salesman_name] = {
          name: v.salesman_name,
          photo: v.salesman_photo || null
        };
      }
    });
    return Object.values(salesmanMap);
  };

  return (
    <div className="main-container" style={{ backgroundColor: '#b7721834', minHeight: '100vh' }}>
      <div className="dashboard-header">
        <h2 style={{ marginTop: "65px", marginLeft: "15px" }}>
          Welcome, {userName || getCurrentStockPoint() || 'Stock Point User'}
        </h2>
        <p style={{ marginLeft: "15px", color: "#666" }}>
          Stock Management Dashboard
        </p>
      </div>

      <div className="dashboard-container" style={{ padding: '20px' }}>

        {/* TODAY'S WAREHOUSE VISITS SECTION */}
        <div className="today-visits-section" style={{ marginBottom: '30px' }}>
          <div className="section-header" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1e293b' }}>
                <span style={{ marginRight: '8px' }}>📅</span> Today's Warehouse Visits
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                {formatDate(new Date().toISOString())}
              </p>
            </div>
            <Badge bg="primary" style={{ fontSize: '14px', padding: '8px 20px', borderRadius: '20px' }}>
              {todayVisits.length} Customer{todayVisits.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {visitsLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" size="sm" />
              <span className="ms-2" style={{ color: '#64748b' }}>Loading visits...</span>
            </div>
          ) : todayVisits.length > 0 ? (
            <Row className="g-4">
              {todayVisits.map((customer, index) => {
                const salesmanDetails = getSalesmanDetails(customer.visits);
                return (
                  <Col key={index} lg={12} md={6} sm={12}>
                    <Card className="today-visit-card" style={{
                      border: 'none',
                      borderRadius: '20px',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                      height: '100%',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.3s ease'
                    }}>
                      <Card.Body style={{ padding: '0' }}>
                        {/* Header with Customer Name, ID and Status */}
                        <div style={{
                          padding: '18px 24px',
                          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                          borderBottom: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px',
                              fontWeight: '600',
                              color: '#fff',
                              flexShrink: 0,
                              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                            }}>
                              {customer.customer_name?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <h6 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                                {customer.customer_name || 'Unknown Customer'}
                              </h6>
                              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                <span style={{ fontWeight: 500, color: '#475569' }}>ID:</span> {customer.customer_id || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <Badge 
                            bg={getStatusBadgeColor(customer.customer_status)} 
                            style={{ 
                              fontSize: '12px', 
                              padding: '6px 16px', 
                              borderRadius: '20px',
                              fontWeight: 500,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          >
                            {customer.customer_status || 'Scheduled'}
                          </Badge>
                        </div>

                        {/* Address Section with Icons */}
                        <div style={{ 
                          padding: '16px 24px', 
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: '#ffffff'
                        }}>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr',
                            gap: '6px'
                          }}>
                            {customer.address1 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#64748b', fontSize: '16px', width: '20px' }}>🏠</span>
                                <span style={{ fontSize: '13px', color: '#334155' }}>
                                  <strong>Address 1:</strong> {customer.address1}
                                </span>
                              </div>
                            )}
                            {customer.address2 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#64748b', fontSize: '16px', width: '20px' }}>📍</span>
                                <span style={{ fontSize: '13px', color: '#334155' }}>
                                  <strong>Address 2:</strong> {customer.address2}
                                </span>
                              </div>
                            )}
                            {customer.city && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#64748b', fontSize: '16px', width: '20px' }}>🏙️</span>
                                <span style={{ fontSize: '13px', color: '#334155' }}>
                                  <strong>City:</strong> {customer.city}
                                </span>
                              </div>
                            )}
                            {customer.district && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#64748b', fontSize: '16px', width: '20px' }}>🗺️</span>
                                <span style={{ fontSize: '13px', color: '#334155' }}>
                                  <strong>District:</strong> {customer.district}
                                </span>
                              </div>
                            )}
                            {customer.state && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#64748b', fontSize: '16px', width: '20px' }}>🏛️</span>
                                <span style={{ fontSize: '13px', color: '#334155' }}>
                                  <strong>State:</strong> {customer.state}
                                </span>
                              </div>
                            )}
                            {customer.pincode && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#64748b', fontSize: '16px', width: '20px' }}>📮</span>
                                <span style={{ fontSize: '13px', color: '#334155' }}>
                                  <strong>Pincode:</strong> {customer.pincode}
                                </span>
                              </div>
                            )}
                            {!customer.address1 && !customer.city && !customer.state && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#94a3b8', fontSize: '16px', width: '20px' }}>📍</span>
                                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                  No address available
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Details Section */}
                        <div style={{
                          backgroundColor: '#f8fafc',
                          padding: '14px 24px',
                          borderBottom: '1px solid #f1f5f9'
                        }}>
                          {customer.customer_status?.toLowerCase() === 'scheduled' && customer.visits.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <span style={{ color: '#3b82f6', fontSize: '18px' }}>📋</span>
                              <span style={{ fontSize: '13px', color: '#334155' }}>
                                <strong style={{ color: '#1e293b' }}>Scheduled:</strong> {formatDateTime(customer.visits[0]?.scheduled_date)}
                              </span>
                            </div>
                          )}
                          
                          {customer.customer_status?.toLowerCase() === 'not available' && customer.reschedule_date && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <span style={{ color: '#ef4444', fontSize: '18px' }}>🔄</span>
                              <span style={{ fontSize: '13px', color: '#334155' }}>
                                <strong style={{ color: '#1e293b' }}>Rescheduled:</strong> {formatDateTime(customer.reschedule_date)}
                              </span>
                              {customer.reschedule_notes && (
                                <span style={{ 
                                  fontSize: '12px', 
                                  color: '#64748b',
                                  backgroundColor: '#f1f5f9',
                                  padding: '2px 12px',
                                  borderRadius: '12px',
                                  marginLeft: '4px'
                                }}>
                                  📝 {customer.reschedule_notes}
                                </span>
                              )}
                            </div>
                          )}

                          {customer.customer_status?.toLowerCase() === 'available' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ color: '#22c55e', fontSize: '18px' }}>✅</span>
                              <span style={{ fontSize: '13px', color: '#334155' }}>
                                <strong style={{ color: '#1e293b' }}>Status:</strong> Available - Visit completed
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Salesman Details with Photos */}
                        <div style={{
                          padding: '14px 24px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '12px',
                          backgroundColor: '#ffffff',
                          borderBottom: '1px solid #f1f5f9'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '16px' }}>📦</span>
                              <strong>{customer.visits.length}</strong> Visit{customer.visits.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <Badge 
                            bg="primary" 
                            style={{ 
                              fontSize: '10px', 
                              padding: '4px 14px', 
                              borderRadius: '20px',
                              fontWeight: 500,
                              opacity: 0.8
                            }}
                          >
                            🏪 Warehouse Visit
                          </Badge>
                        </div>

                        {/* Salesman Photos Section */}
                        {salesmanDetails.length > 0 && (
                          <div style={{
                            padding: '12px 24px',
                            backgroundColor: '#fafbfc',
                            borderTop: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#475569' }}>
                              👤 Salesman:
                            </span>
                            {salesmanDetails.map((salesman, idx) => (
                              <div key={idx} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                backgroundColor: '#ffffff',
                                padding: '4px 12px 4px 4px',
                                borderRadius: '50px',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                border: '1px solid #e2e8f0'
                              }}>
                                {salesman.photo ? (
                                  <img 
                                    src={`${baseURL}${salesman.photo}`} 
                                    alt={salesman.name}
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      border: '2px solid #e2e8f0'
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.parentElement.innerHTML = `
                                        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#6366f1);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:600;flex-shrink:0;">
                                          ${salesman.name.charAt(0)}
                                        </div>
                                      `;
                                    }}
                                  />
                                ) : (
                                  <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    flexShrink: 0
                                  }}>
                                    {salesman.name.charAt(0)}
                                  </div>
                                )}
                                <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                                  {salesman.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <Card style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '20px',
              backgroundColor: '#f8fafc',
              padding: '60px 20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏪</div>
              <h5 style={{ color: '#475569', marginBottom: '8px', fontWeight: 600 }}>No Visits Scheduled Today</h5>
              <p style={{ color: '#94a3b8', margin: 0 }}>
                You have no customer visits scheduled for today. Enjoy your day! 🎉
              </p>
            </Card>
          )}
        </div>

        {/* Summary Cards */}
        <div className="sp-dashboard-cards">
          <div className="sp-dashboard-card sp-card-blue" onClick={handleStockInwardClick} style={{ cursor: 'pointer' }}>
            <div className="sp-card-left">
              <h2>{loading.inward ? "..." : stockInwardCount}</h2>
              <h5>Stock Inward</h5>
              <p>Total Items Received</p>
            </div>
            <div className="sp-card-icon">📦</div>
          </div>

          <div className="sp-dashboard-card sp-card-green" onClick={handleStockOutwardClick} style={{ cursor: 'pointer' }}>
            <div className="sp-card-left">
              <h2>{loading.outward ? "..." : stockOutwardCount}</h2>
              <h5>Stock Outward</h5>
              <p>Selected Items</p>
            </div>
            <div className="sp-card-icon">📤</div>
          </div>

          <div className="sp-dashboard-card sp-card-yellow" onClick={handleAssignedToSalesmanClick} style={{ cursor: 'pointer' }}>
            <div className="sp-card-left">
              <h2>{loading.assigned ? "..." : assignedToSalesmanCount}</h2>
              <h5>Assigned</h5>
              <p>Items With Salesmen</p>
            </div>
            <div className="sp-card-icon">👨‍💼</div>
          </div>

          <div className="sp-dashboard-card sp-card-red" onClick={handleReceivedFromSalesmanClick} style={{ cursor: 'pointer' }}>
            <div className="sp-card-left">
              <h2>{loading.received ? "..." : receivedFromSalesmanCount}</h2>
              <h5>Received</h5>
              <p>Returned Items</p>
            </div>
            <div className="sp-card-icon">📥</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-container">
          <div className="charts-row">
            <div className="chart-card">
              <h3 className="chart-title">📊 Stock Status Distribution</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getStockStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getStockStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">🥧 Stock Overview</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getStockOverviewData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getStockOverviewData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-card-full">
              <h3 className="chart-title">📈 Monthly Stock Movement Trend</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={getMonthlyTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="inward" stroke="#14b8d4" name="Stock Inward" strokeWidth={2} />
                    <Line type="monotone" dataKey="outward" stroke="#34d399" name="Stock Outward" strokeWidth={2} />
                    <Line type="monotone" dataKey="assigned" stroke="#fbbf24" name="Assigned" strokeWidth={2} />
                    <Line type="monotone" dataKey="received" stroke="#fb7185" name="Received" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .today-visit-card {
          transition: all 0.3s ease;
        }

        .today-visit-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        }

        .sp-dashboard-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .sp-dashboard-card {
          background: white;
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
          min-height: 100px;
        }

        .sp-dashboard-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 24px rgba(0,0,0,0.10);
        }

        .sp-card-left h2 {
          font-size: 32px;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .sp-card-left h5 {
          font-size: 15px;
          font-weight: 600;
          margin: 4px 0 2px 0;
          color: #475569;
        }

        .sp-card-left p {
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
        }

        .sp-card-icon {
          font-size: 40px;
          opacity: 0.8;
        }

        .sp-card-blue { border-left: 5px solid #3b82f6; }
        .sp-card-green { border-left: 5px solid #22c55e; }
        .sp-card-yellow { border-left: 5px solid #fbbf24; }
        .sp-card-red { border-left: 5px solid #ef4444; }

        .charts-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .charts-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .chart-card, .chart-card-full {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        .chart-card-full {
          grid-column: 1 / -1;
        }

        .chart-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 16px;
        }

        .chart-wrapper {
          height: 300px;
        }

        .chart-card-full .chart-wrapper {
          height: 350px;
        }

        @media (max-width: 768px) {
          .charts-row {
            grid-template-columns: 1fr;
          }

          .sp-dashboard-cards {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .sp-dashboard-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default StockPointDashboard;