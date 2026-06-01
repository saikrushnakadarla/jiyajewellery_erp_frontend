import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../Login/Context";
import './Dashboard.css';
import Sales from './Sales';
import Purchases from './Purchases';
import Customers from './Customers';
import Suppliers from './Suppliers';

function StockPointDashboard() {
  const { userName, userId, userType, authToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedMobile, setSelectedMobile] = useState(null);

  console.log('StockPointDashboard - User Data:', { userName, userId, userType });

  return (
    <div className="main-container" style={{ backgroundColor: '#b7721834' }}>
      <div className="dashboard-header">
        <h2 style={{ marginTop: "25px", marginLeft: "15px" }}>
          Welcome, {userName || 'Stock Point User'}
        </h2>
        <p style={{ marginLeft: "15px", color: "#666" }}>
          Stock Point Dashboard - Limited Access
        </p>
      </div>
      
      <div className="dashboard-container">
        {/* Static Dashboard Cards for Stock Points */}
        <div className="row-cards">
          <div className="metric-card">
            <div style={{ padding: '15px', textAlign: 'center' }}>
              <h3>Stock Overview</h3>
              <p>View and manage inventory</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/stock-overview')}
                style={{ background: '#b77318', border: 'none' }}
              >
                Go to Stock
              </button>
            </div>
          </div>

          <div className="metric-card">
            <div style={{ padding: '15px', textAlign: 'center' }}>
              <h3>Products</h3>
              <p>Manage products and categories</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/products')}
                style={{ background: '#b77318', border: 'none' }}
              >
                View Products
              </button>
            </div>
          </div>

          <div className="metric-card">
            <div style={{ padding: '15px', textAlign: 'center' }}>
              <h3>Stock Movement</h3>
              <p>Track stock in/out</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/stock-movement')}
                style={{ background: '#b77318', border: 'none' }}
              >
                View Movements
              </button>
            </div>
          </div>

          <div className="metric-card">
            <div style={{ padding: '15px', textAlign: 'center' }}>
              <h3>Reports</h3>
              <p>Generate stock reports</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/stock-reports')}
                style={{ background: '#b77318', border: 'none' }}
              >
                View Reports
              </button>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="row-cards" style={{ marginTop: '15px' }}>
          <div className="metric-card">
            <Customers selectedCustomerMobile={selectedMobile} />
          </div>
          
          <div className="metric-card">
            <Suppliers selectedCustomerMobile={selectedMobile} />
          </div>
          
          <div className="metric-card">
            <Sales selectedCustomerMobile={selectedMobile} />
          </div>
          
          <div className="metric-card">
            <Purchases selectedCustomerMobile={selectedMobile} />
          </div>
        </div>

        {/* Stock Information Cards */}
        <div className="row-cards" style={{ marginTop: '15px', marginBottom: '15px' }}>
          <div className="metric-card" style={{ padding: '20px' }}>
            <h3 style={{ color: '#b77318', marginBottom: '15px' }}>Low Stock Alert</h3>
            <p>No low stock items at the moment</p>
          </div>
          
          <div className="metric-card" style={{ padding: '20px' }}>
            <h3 style={{ color: '#b77318', marginBottom: '15px' }}>Recent Transactions</h3>
            <p>No recent transactions to display</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockPointDashboard;