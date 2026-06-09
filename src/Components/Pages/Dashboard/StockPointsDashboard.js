import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../Login/Context";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import './Dashboard.css';

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
    received: true
  });

  // Get userName from localStorage
  const getCurrentStockPoint = () => {
    const storedUserName = localStorage.getItem('userName');
    return storedUserName || userName || '';
  };

  // Fetch Stock Inward count (filter by Stock_Point === current login user)
  const fetchStockInward = async () => {
    try {
      const currentStockPoint = getCurrentStockPoint();
      const response = await fetch('http://localhost:5001/get/opening-tags-entry');
      const data = await response.json();
      
      if (data.result) {
        // Filter where Stock_Point matches current login user
        const filteredData = data.result.filter(item => item.Stock_Point === currentStockPoint);
        setStockInwardCount(filteredData.length);
        setOpeningTagsData(filteredData);
      }
    } catch (error) {
      console.error('Error fetching stock inward data:', error);
      setStockInwardCount(0);
    } finally {
      setLoading(prev => ({ ...prev, inward: false }));
    }
  };

  // Fetch Stock Outward count (Status === "Selected" AND Stock_Point === "MAIN STOCK ROOM")
  const fetchStockOutward = async () => {
    try {
      const response = await fetch('http://localhost:5001/get/opening-tags-entry');
      const data = await response.json();
      
      if (data.result) {
        // Filter where Status is "Selected" and Stock_Point is "MAIN STOCK ROOM"
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

  // Fetch Assigned to Salesman data and count
  const fetchAssignedToSalesman = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/assigned-salesman/get-assigned-transfers');
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

  // Fetch Received from Salesman data and count
  const fetchReceivedFromSalesman = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/received-salesman/get-received-transfers');
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
    fetchStockInward();
    fetchStockOutward();
    fetchAssignedToSalesman();
    fetchReceivedFromSalesman();
  }, []);

  // Prepare data for pie chart - Stock Distribution by Status
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

  // Prepare data for bar chart - Stock by Category/Type
  const getStockByCategoryData = () => {
    if (!openingTagsData.length) return [];
    
    const categoryCount = {};
    openingTagsData.forEach(item => {
      const category = item.Category || item.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    return Object.keys(categoryCount).map(key => ({
      name: key.length > 10 ? key.substring(0, 10) + '...' : key,
      fullName: key,
      count: categoryCount[key]
    }));
  };

  // Prepare data for line chart - Monthly trend (using dummy data based on actual counts)
  const getMonthlyTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const totalStock = stockInwardCount + stockOutwardCount + assignedToSalesmanCount + receivedFromSalesmanCount;
    const baseValue = totalStock > 0 ? Math.max(5, Math.floor(totalStock / 6)) : 10;
    
    return months.map((month, index) => ({
      month: month,
      inward: Math.floor(stockInwardCount * (0.3 + Math.random() * 0.5)) || 5,
      outward: Math.floor(stockOutwardCount * (0.2 + Math.random() * 0.5)) || 3,
      assigned: Math.floor(assignedToSalesmanCount * (0.2 + Math.random() * 0.5)) || 4,
      received: Math.floor(receivedFromSalesmanCount * (0.2 + Math.random() * 0.5)) || 2
    }));
  };

  // Prepare data for donut chart - Stock Overview
  const getStockOverviewData = () => {
    return [
      { name: 'Stock Inward', value: stockInwardCount, color: '#14b8d4' },
      { name: 'Stock Outward', value: stockOutwardCount, color: '#34d399' },
      { name: 'Assigned', value: assignedToSalesmanCount, color: '#fbbf24' },
      { name: 'Received', value: receivedFromSalesmanCount, color: '#fb7185' }
    ];
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  // Card click handlers
  const handleStockInwardClick = () => {
    console.log('Stock Inward clicked - Count:', stockInwardCount);
  };

  const handleStockOutwardClick = () => {
    navigate("/receive-from-salesman");
  };

  const handleAssignedToSalesmanClick = () => {
    navigate("/assign-to-salesman");
  };

  const handleReceivedFromSalesmanClick = () => {
    navigate("/return-to-main-stock");
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
        
        {/* Summary Cards */}
        <div className="sp-dashboard-cards">
          <div
            className="sp-dashboard-card sp-card-blue"
            onClick={handleStockInwardClick}
            style={{ cursor: 'pointer' }}
          >
            <div className="sp-card-left">
              <h2>{loading.inward ? "..." : stockInwardCount}</h2>
              <h5>Stock Inward</h5>
              <p>Available Stock Items</p>
            </div>
            <div className="sp-card-icon">
              📦
            </div>
          </div>

          <div
            className="sp-dashboard-card sp-card-green"
            onClick={handleStockOutwardClick}
            style={{ cursor: 'pointer' }}
          >
            <div className="sp-card-left">
              <h2>{loading.outward ? "..." : stockOutwardCount}</h2>
              <h5>Stock Outward</h5>
              <p>Selected Items</p>
            </div>
            <div className="sp-card-icon">
              📤
            </div>
          </div>

          <div
            className="sp-dashboard-card sp-card-yellow"
            onClick={handleAssignedToSalesmanClick}
            style={{ cursor: 'pointer' }}
          >
            <div className="sp-card-left">
              <h2>{loading.assigned ? "..." : assignedToSalesmanCount}</h2>
              <h5>Assigned</h5>
              <p>Items With Salesmen</p>
            </div>
            <div className="sp-card-icon">
              👨‍💼
            </div>
          </div>

          <div
            className="sp-dashboard-card sp-card-red"
            onClick={handleReceivedFromSalesmanClick}
            style={{ cursor: 'pointer' }}
          >
            <div className="sp-card-left">
              <h2>{loading.received ? "..." : receivedFromSalesmanCount}</h2>
              <h5>Received</h5>
              <p>Returned Items</p>
            </div>
            <div className="sp-card-icon">
              📥
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-container">
          {/* Row 1: Pie Chart and Donut Chart */}
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

          {/* Row 2: Bar Chart */}
          {/* <div className="charts-row">
            <div className="chart-card-full">
              <h3 className="chart-title">📊 Stock by Category</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={getStockByCategoryData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name, props) => [`${value} items`, props.payload.fullName || 'Category']}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Items Count">
                      {getStockByCategoryData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div> */}

          {/* Row 3: Line Chart for Monthly Trend */}
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
    </div>
  );
}

export default StockPointDashboard;