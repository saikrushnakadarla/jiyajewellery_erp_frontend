import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../Login/Context";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import './Dashboard.css';
// FIX: Everything (visit-logs-warehouse-schedule, account-details, stockpoints,
// stock-transfer, etc.) lives on the ERP backend (port 5001) = `baseURL`.
// Do NOT import baseURL2 (port 5000) here — those routes don't exist on that server,
// which is why "Today's Warehouse Visits" and notifications were always empty.
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

  // FIX: This is the piece that was missing — the actual stock_point_id
  // for the currently logged-in warehouse, resolved by matching the
  // stock_point_name against the logged-in userName. Without this,
  // "visit.warehouse_id" was never compared against anything, so either
  // every warehouse's visits showed up, or (combined with the wrong base
  // URL) nothing showed up at all.
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

  // Fetch Today's Warehouse Visits — now correctly scoped to THIS warehouse
  const fetchTodayVisits = async (stockPointId) => {
    try {
      setVisitsLoading(true);

      if (!stockPointId) {
        console.warn('⚠️ No stock point id resolved yet, skipping visits fetch');
        setTodayVisits([]);
        return;
      }

      // FIX: baseURL (5001), not baseURL2 (5000)
      const response = await fetch(`${baseURL}/api/visit-logs-warehouse-schedule`);
      if (!response.ok) {
        throw new Error('Failed to fetch schedule visits');
      }
      const scheduleData = await response.json();

      // FIX: baseURL (5001), not baseURL2 (5000)
      const accountResponse = await fetch(`${baseURL}/get/account-details`);
      if (!accountResponse.ok) {
        throw new Error('Failed to fetch account details');
      }
      const accountData = await accountResponse.json();

      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      // FIX: actually filter by THIS warehouse's stock point id, not just "truthy"
      const todayVisitsFiltered = scheduleData.filter(visit => {
        if (!visit.warehouse_id || visit.warehouse_id !== stockPointId) return false;
        if (visit.status !== 'scheduled') return false;
        if (!visit.scheduled_date) return false;

        const visitDate = new Date(visit.scheduled_date);
        return visitDate >= todayStart && visitDate <= todayEnd;
      });

      // Group visits by customer
      const groupedVisits = {};
      todayVisitsFiltered.forEach(visit => {
        const customer = accountData.find(acc =>
          acc.customer_id === visit.customer_id ||
          acc.account_id === visit.customer_account_id
        );

        const customerKey = visit.customer_account_id || visit.customer_id;
        if (!groupedVisits[customerKey]) {
          groupedVisits[customerKey] = {
            customer_account_id: visit.customer_account_id,
            customer_id: visit.customer_id,
            customer_name: customer?.account_name || visit.customer_name || 'Unknown Customer',
            customer_phone: customer?.phone || visit.customer_phone || 'N/A',
            customer_mobile: customer?.mobile || visit.customer_mobile || 'N/A',
            customer_email: customer?.email || visit.customer_email || 'N/A',
            address1: customer?.address1 || 'N/A',
            city: customer?.city || 'N/A',
            state: customer?.state || 'N/A',
            account_name: customer?.account_name || visit.customer_name || 'Unknown Customer',
            visits: []
          };
        }
        groupedVisits[customerKey].visits.push({
          id: visit.id,
          warehouse_name: visit.warehouse_name,
          barcode: visit.barcode,
          scheduled_date: visit.scheduled_date,
          status: visit.status,
          salesman_name: visit.salesman_name
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
      // Resolve this warehouse's stock_point_id FIRST, then fetch visits
      const stockPointId = await resolveCurrentStockPointId();
      await fetchTodayVisits(stockPointId);
    };

    init();
    fetchStockInward();
    fetchStockOutward();
    fetchAssignedToSalesman();
    fetchReceivedFromSalesman();

    // Optional: refresh visits every 60s so newly scheduled visits show up
    // without a manual page reload
    const visitsInterval = setInterval(async () => {
      const stockPointId = currentStockPointId || (await resolveCurrentStockPointId());
      fetchTodayVisits(stockPointId);
    }, 60000);

    return () => clearInterval(visitsInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1e293b' }}>
                <span style={{ marginRight: '8px' }}>📅</span> Today's Warehouse Visits
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                {formatDate(new Date().toISOString())}
              </p>
            </div>
            <Badge bg="primary" style={{ fontSize: '14px', padding: '8px 16px' }}>
              {todayVisits.length} Customer{todayVisits.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {visitsLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" size="sm" />
              <span className="ms-2">Loading visits...</span>
            </div>
          ) : todayVisits.length > 0 ? (
            <Row className="g-4">
              {todayVisits.map((customer, index) => (
                <Col key={index} lg={4} md={6} sm={12}>
                  <Card className="today-visit-card" style={{
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    height: '100%',
                    overflow: 'hidden',
                    backgroundColor: '#fff'
                  }}
                  >
                    <Card.Body style={{ padding: '0' }}>
                      <div style={{
                        padding: '16px 20px 12px 20px',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#fff',
                          flexShrink: 0
                        }}>
                          {customer.account_name?.charAt(0) || 'C'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h6 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                            {customer.account_name || 'Unknown Customer'}
                          </h6>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            <span>🆔</span> {customer.customer_id || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '12px 20px' }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '6px 16px',
                          fontSize: '13px'
                        }}>
                          <div>
                            <span style={{ color: '#94a3b8' }}>📞</span>
                            <span style={{ marginLeft: '4px', color: '#334155' }}>{customer.customer_phone || 'N/A'}</span>
                          </div>
                          <div>
                            <span style={{ color: '#94a3b8' }}>📱</span>
                            <span style={{ marginLeft: '4px', color: '#334155' }}>{customer.customer_mobile || 'N/A'}</span>
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <span style={{ color: '#94a3b8' }}>✉️</span>
                            <span style={{ marginLeft: '4px', color: '#334155' }}>{customer.customer_email || 'N/A'}</span>
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <span style={{ color: '#94a3b8' }}>📍</span>
                            <span style={{ marginLeft: '4px', color: '#334155' }}>
                              {customer.address1 && customer.address1 !== 'N/A' ? customer.address1 : ''}
                              {customer.city && customer.city !== 'N/A' ? `, ${customer.city}` : ''}
                              {customer.state && customer.state !== 'N/A' ? `, ${customer.state}` : ''}
                              {(!customer.address1 || customer.address1 === 'N/A') && 'No address available'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '12px 20px',
                        borderTop: '1px solid #f1f5f9',
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                            📋 {customer.visits.length} Visit{customer.visits.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        {customer.visits.map((visit, vIndex) => (
                          <div key={vIndex} style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr auto',
                            gap: '4px 12px',
                            padding: '6px 0',
                            borderBottom: vIndex < customer.visits.length - 1 ? '1px solid #e2e8f0' : 'none',
                            fontSize: '12px'
                          }}>
                            <span style={{ color: '#94a3b8' }}>📦</span>
                            <span style={{ color: '#3b82f6', fontWeight: 600, fontFamily: 'monospace' }}>
                              {visit.barcode || 'N/A'}
                            </span>
                            <span style={{ color: '#64748b' }}>{formatTime(visit.scheduled_date)}</span>
                            {visit.salesman_name && (
                              <>
                                <span style={{ color: '#94a3b8' }}>👤</span>
                                <span style={{ color: '#334155' }}>{visit.salesman_name}</span>
                                <span></span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      <div style={{
                        padding: '10px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: '#94a3b8'
                      }}>
                        <span>
                          <span style={{ marginRight: '4px' }}>🕐</span>
                          {customer.visits.length} Visit{customer.visits.length > 1 ? 's' : ''}
                        </span>
                        <Badge bg="primary" style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '12px' }}>
                          Warehouse Visit
                        </Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card style={{
              border: '1px dashed #cbd5e1',
              borderRadius: '16px',
              backgroundColor: '#f8fafc',
              padding: '40px 20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏪</div>
              <h5 style={{ color: '#475569', marginBottom: '8px' }}>No Visits Scheduled Today</h5>
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
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .sp-dashboard-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .sp-dashboard-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: transform 0.2s, box-shadow 0.2s;
          min-height: 100px;
        }

        .sp-dashboard-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }

        .sp-card-left h2 {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .sp-card-left h5 {
          font-size: 14px;
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
          font-size: 36px;
          opacity: 0.7;
        }

        .sp-card-blue { border-left: 4px solid #3b82f6; }
        .sp-card-green { border-left: 4px solid #22c55e; }
        .sp-card-yellow { border-left: 4px solid #fbbf24; }
        .sp-card-red { border-left: 4px solid #ef4444; }

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
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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