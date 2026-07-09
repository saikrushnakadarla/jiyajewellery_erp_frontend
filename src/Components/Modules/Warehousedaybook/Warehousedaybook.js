// DayBook.jsx
import React, { useState, useEffect } from 'react';
import './Warehousedaybook.css';
import baseURL from '../../../Url/NodeBaseURL';

const DayBook = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseURL}/get/opening-tags-entry`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result.result || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and search data
  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.PCode_BarCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sub_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.design_master?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Stock_Point?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || item.Status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch(status) {
      case 'Available':
        return 'status-available';
      case 'Assigned':
        return 'status-assigned';
      default:
        return 'status-default';
    }
  };

  if (loading) {
    return (
      <div className="daybook-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="daybook-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="daybook-container">
      <div className="daybook-header">
        <h1 className="daybook-title">📒 Day Book</h1>
        {/* <p className="daybook-subtitle" style={{marginTop:"20px"}}>Opening Tags Entry Details</p> */}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by Barcode, Category, Design, Stock Point..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-dropdown">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-section">
        <div className="stat-card">
          <span className="stat-label">Total Entries</span>
          <span className="stat-value">{data.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Filtered Entries</span>
          <span className="stat-value">{filteredData.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Available</span>
          <span className="stat-value">{data.filter(item => item.Status === 'Available').length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Assigned</span>
          <span className="stat-value">{data.filter(item => item.Status === 'Assigned').length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {currentItems.length === 0 ? (
          <div className="no-data">
            <p>No entries found matching your criteria</p>
          </div>
        ) : (
          <>
            <table className="daybook-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Barcode</th>
                  <th>Category</th>
                  <th>Sub Category</th>
                  <th>Design</th>
                  <th>Metal</th>
                  <th>Purity</th>
                  <th>Gross Wt</th>
                  <th>Net Wt</th>
                  <th>Rate</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Stock Point</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={item.opentag_id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td className="barcode-cell">{item.PCode_BarCode}</td>
                    <td>{item.category}</td>
                    <td>{item.sub_category}</td>
                    <td>{item.design_master || 'N/A'}</td>
                    <td>{item.metal_type}</td>
                    <td>{item.Purity}%</td>
                    <td>{parseFloat(item.Gross_Weight).toFixed(2)}</td>
                    <td>{parseFloat(item.TotalWeight_AW).toFixed(2)}</td>
                    <td>₹{parseFloat(item.rate).toFixed(2)}</td>
                    <td>₹{parseFloat(item.total_price).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(item.Status)}`}>
                        {item.Status || 'N/A'}
                      </span>
                    </td>
                    <td>{item.Stock_Point}</td>
                    <td className="date-cell">{formatDate(item.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  Previous
                </button>
                
                <div className="page-numbers">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="page-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DayBook;