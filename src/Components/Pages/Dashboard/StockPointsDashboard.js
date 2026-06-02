import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../Login/Context";
import './Dashboard.css';

function StockPointDashboard() {
  const { userName, userId, userType, authToken } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State for dummy data
  const [stockData, setStockData] = useState([]);
  const [assignedData, setAssignedData] = useState([]);
  const [receivedData, setReceivedData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Dummy Data for Stock
  useEffect(() => {
    // Stock Inventory Data
    const dummyStock = [
      { id: 1, product: 'Gold Ring', category: 'Jewelry', quantity: 150, value: 750000, minStock: 50 },
      { id: 2, product: 'Silver Chain', category: 'Jewelry', quantity: 200, value: 400000, minStock: 80 },
      { id: 3, product: 'Diamond Necklace', category: 'Premium', quantity: 25, value: 1250000, minStock: 10 },
      { id: 4, product: 'Platinum Earrings', category: 'Premium', quantity: 40, value: 800000, minStock: 15 },
      { id: 5, product: 'Gold Coin', category: 'Investment', quantity: 500, value: 2500000, minStock: 100 },
      { id: 6, product: 'Silver Utensils', category: 'Home', quantity: 300, value: 600000, minStock: 150 },
      { id: 7, product: 'Diamond Ring', category: 'Premium', quantity: 15, value: 900000, minStock: 5 },
      { id: 8, product: 'Gold Earrings', category: 'Jewelry', quantity: 120, value: 480000, minStock: 40 }
    ];
    setStockData(dummyStock);

    // Assigned to Salesman Data
    const dummyAssigned = [
      { id: 1, salesman: 'Rahul Sharma', product: 'Gold Ring', quantity: 10, assignedDate: '2024-06-01', status: 'Pending', value: 50000 },
      { id: 2, salesman: 'Priya Patel', product: 'Silver Chain', quantity: 15, assignedDate: '2024-06-02', status: 'In Progress', value: 30000 },
      { id: 3, salesman: 'Amit Kumar', product: 'Diamond Necklace', quantity: 2, assignedDate: '2024-06-03', status: 'Pending', value: 100000 },
      { id: 4, salesman: 'Sneha Reddy', product: 'Gold Coin', quantity: 25, assignedDate: '2024-06-01', status: 'Completed', value: 125000 },
      { id: 5, salesman: 'Vikram Singh', product: 'Platinum Earrings', quantity: 5, assignedDate: '2024-06-04', status: 'In Progress', value: 100000 },
      { id: 6, salesman: 'Neha Gupta', product: 'Gold Earrings', quantity: 8, assignedDate: '2024-06-05', status: 'Pending', value: 32000 },
      { id: 7, salesman: 'Rajesh Kumar', product: 'Diamond Ring', quantity: 1, assignedDate: '2024-06-03', status: 'Completed', value: 60000 }
    ];
    setAssignedData(dummyAssigned);

    // Received from Salesman Data
    const dummyReceived = [
      { id: 1, salesman: 'Rahul Sharma', product: 'Gold Ring', quantity: 8, receivedDate: '2024-06-05', status: 'Completed', value: 40000, condition: 'Good' },
      { id: 2, salesman: 'Priya Patel', product: 'Silver Chain', quantity: 12, receivedDate: '2024-06-06', status: 'Completed', value: 24000, condition: 'Excellent' },
      { id: 3, salesman: 'Sneha Reddy', product: 'Gold Coin', quantity: 20, receivedDate: '2024-06-05', status: 'Completed', value: 100000, condition: 'Good' },
      { id: 4, salesman: 'Amit Kumar', product: 'Diamond Necklace', quantity: 1, receivedDate: '2024-06-07', status: 'Pending', value: 50000, condition: 'Pending' },
      { id: 5, salesman: 'Rajesh Kumar', product: 'Diamond Ring', quantity: 1, receivedDate: '2024-06-08', status: 'Completed', value: 60000, condition: 'Excellent' }
    ];
    setReceivedData(dummyReceived);
  }, []);

  // Calculate category-wise stock for simple chart
  const categoryWiseStock = stockData.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {});

  const totalStockValue = stockData.reduce((sum, item) => sum + item.value, 0);
  const totalAssignedValue = assignedData.reduce((sum, item) => sum + item.value, 0);
  const totalReceivedValue = receivedData.reduce((sum, item) => sum + item.value, 0);
  const pendingAssigned = assignedData.filter(item => item.status !== 'Completed').length;
  const pendingReceived = receivedData.filter(item => item.status === 'Pending').length;
  
  const totalQuantity = stockData.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate max quantity for chart scaling
  const maxCategoryQuantity = Math.max(...Object.values(categoryWiseStock));

  const filteredStockData = selectedCategory === 'all' 
    ? stockData 
    : stockData.filter(item => item.category === selectedCategory);

  return (
    <div className="main-container" style={{ backgroundColor: '#b7721834', minHeight: '100vh' }}>
      <div className="dashboard-header">
        <h2 style={{ marginTop: "65px", marginLeft: "15px" }}>
          Welcome, {userName || 'Stock Point User'}
        </h2>
        <p style={{ marginLeft: "15px", color: "#666" }}>
          Stock Management Dashboard
        </p>
      </div>
      
      <div className="dashboard-container" style={{ padding: '20px' }}>
        
        {/* Summary Cards */}
        <div className="row-cards">
          <div className="metric-card" style={{ background: 'linear-gradient(135deg, #b77318 0%, #e8963e 100%)', color: 'white' }}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h3>📦 Total Stock Value</h3>
              <h2 style={{ fontSize: '32px', margin: '10px 0' }}>₹{totalStockValue.toLocaleString()}</h2>
              <p>Total Items: {totalQuantity}</p>
            </div>
          </div>

          <div className="metric-card" style={{ background: 'linear-gradient(135deg, #d4842e 0%, #f4a460 100%)', color: 'white' }}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h3>👨‍💼 Assigned to Salesman</h3>
              <h2 style={{ fontSize: '32px', margin: '10px 0' }}>₹{totalAssignedValue.toLocaleString()}</h2>
              <p>Pending: {pendingAssigned} orders</p>
            </div>
          </div>

          <div className="metric-card" style={{ background: 'linear-gradient(135deg, #c47a2a 0%, #e8963e 100%)', color: 'white' }}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h3>📥 Received from Salesman</h3>
              <h2 style={{ fontSize: '32px', margin: '10px 0' }}>₹{totalReceivedValue.toLocaleString()}</h2>
              <p>Pending: {pendingReceived} receipts</p>
            </div>
          </div>
        </div>

        {/* Simple Bar Chart - Category Distribution */}
        <div className="row-cards" style={{ marginTop: '20px' }}>
          <div className="metric-card" style={{ padding: '20px', width: '100%' }}>
            <h3 style={{ color: '#b77318', marginBottom: '20px' }}>Stock Distribution by Category</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '300px', padding: '20px' }}>
              {Object.entries(categoryWiseStock).map(([category, quantity]) => (
                <div key={category} style={{ textAlign: 'center', width: '100px' }}>
                  <div style={{
                    height: `${(quantity / maxCategoryQuantity) * 250}px`,
                    width: '60px',
                    backgroundColor: '#b77318',
                    margin: '0 auto',
                    borderRadius: '5px 5px 0 0',
                    transition: 'height 0.5s ease'
                  }}>
                    <div style={{
                      position: 'relative',
                      top: '-25px',
                      fontWeight: 'bold',
                      color: '#b77318'
                    }}>
                      {quantity}
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', fontWeight: 'bold' }}>{category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stock Section */}
        <div className="row-cards" style={{ marginTop: '20px' }}>
          <div className="metric-card" style={{ padding: '20px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
              <h3 style={{ color: '#b77318', margin: 0 }}>📊 Stock Inventory</h3>
              <select 
                className="form-select" 
                style={{ width: '200px', borderColor: '#b77318', padding: '5px', borderRadius: '5px' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Premium">Premium</option>
                <option value="Investment">Investment</option>
                <option value="Home">Home</option>
              </select>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#b77318', color: 'white' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Quantity</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Value (₹)</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStockData.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '12px' }}>{item.product}</td>
                      <td style={{ padding: '12px' }}>{item.category}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.value.toLocaleString()}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ 
                          backgroundColor: item.quantity < item.minStock ? '#dc3545' : '#28a745',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          display: 'inline-block'
                        }}>
                          {item.quantity < item.minStock ? '⚠️ Low Stock' : '✓ In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Assigned to Salesman Section */}
        <div className="row-cards" style={{ marginTop: '20px' }}>
          <div className="metric-card" style={{ padding: '20px', width: '100%' }}>
            <h3 style={{ color: '#b77318', marginBottom: '20px' }}>👨‍💼 Assigned to Salesman</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e8963e', color: 'white' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Salesman</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Quantity</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Value (₹)</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Assigned Date</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedData.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '12px' }}>{item.salesman}</td>
                      <td style={{ padding: '12px' }}>{item.product}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.value.toLocaleString()}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{item.assignedDate}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          backgroundColor: item.status === 'Completed' ? '#28a745' : 
                                         item.status === 'In Progress' ? '#ffc107' : '#dc3545',
                          color: item.status === 'In Progress' ? '#000' : 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          display: 'inline-block'
                        }}>
                          {item.status === 'Completed' ? '✓' : item.status === 'In Progress' ? '⟳' : '⏳'} {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Received from Salesman Section */}
        <div className="row-cards" style={{ marginTop: '20px', marginBottom: '20px' }}>
          <div className="metric-card" style={{ padding: '20px', width: '100%' }}>
            <h3 style={{ color: '#b77318', marginBottom: '20px' }}>📥 Received from Salesman</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#28a745', color: 'white' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Salesman</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Quantity</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Value (₹)</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Received Date</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Condition</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {receivedData.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '12px' }}>{item.salesman}</td>
                      <td style={{ padding: '12px' }}>{item.product}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.value.toLocaleString()}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{item.receivedDate}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          backgroundColor: item.condition === 'Excellent' ? '#28a745' :
                                         item.condition === 'Good' ? '#17a2b8' : '#ffc107',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          display: 'inline-block'
                        }}>
                          {item.condition}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          backgroundColor: item.status === 'Completed' ? '#28a745' : '#ffc107',
                          color: item.status === 'Pending' ? '#000' : 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          display: 'inline-block'
                        }}>
                          {item.status === 'Completed' ? '✓ Completed' : '⏳ Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Simple Stats Cards */}
        <div className="row-cards" style={{ marginTop: '20px' }}>
          <div className="metric-card" style={{ padding: '20px', textAlign: 'center' }}>
            <h3 style={{ color: '#b77318' }}>📊 Total Products</h3>
            <h2 style={{ fontSize: '36px', color: '#b77318' }}>{stockData.length}</h2>
            <p>Different Products in Stock</p>
          </div>
          
          <div className="metric-card" style={{ padding: '20px', textAlign: 'center' }}>
            <h3 style={{ color: '#b77318' }}>🔄 Active Assignments</h3>
            <h2 style={{ fontSize: '36px', color: '#b77318' }}>{assignedData.filter(i => i.status !== 'Completed').length}</h2>
            <p>Products Currently with Salesmen</p>
          </div>
          
          <div className="metric-card" style={{ padding: '20px', textAlign: 'center' }}>
            <h3 style={{ color: '#b77318' }}>✅ Completed This Month</h3>
            <h2 style={{ fontSize: '36px', color: '#b77318' }}>{receivedData.length}</h2>
            <p>Products Received Back</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default StockPointDashboard;