// src/Components/Pages/ReceivedStock/ReceivedStock.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChevronRight, FaChevronDown, FaImage, FaEye, FaBoxOpen, FaCheck, FaBarcode } from 'react-icons/fa';
import { Button, Row, Col, Modal, Table, Badge, Spinner, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../Url/NodeBaseURL';
import Swal from 'sweetalert2';

const ReceivedStock = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [returnData, setReturnData] = useState([]);
  const [stockPoints, setStockPoints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const [expandedReturns, setExpandedReturns] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedItemName, setSelectedItemName] = useState('');

  const [returnDetailsMap, setReturnDetailsMap] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  
  // For stock point grouping
  const [expandedStockPoints, setExpandedStockPoints] = useState({});
  
  // For Received Status functionality (from original code)
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');

  // ===== Packet Barcode dropdown state (NEW) =====
  const [loadingPackets, setLoadingPackets] = useState({}); // { [stockPoint]: boolean }
  const [showPacketProductsModal, setShowPacketProductsModal] = useState(false);
  const [selectedPacketBarcode, setSelectedPacketBarcode] = useState('');
  const [selectedPacketProducts, setSelectedPacketProducts] = useState([]);
  // =================================================

  const userName = localStorage.getItem('userName');

  // Function to get stock point name based on from_user_id
  const getStockPointName = (fromUserId) => {
    if (!stockPoints || stockPoints.length === 0) return 'N/A';
    
    // Find stock point where user_id matches fromUserId
    const stockPoint = stockPoints.find(sp => sp.user_id === fromUserId);
    
    if (stockPoint) {
      return stockPoint.stock_point_name;
    }
    
    // If no match found, check if it's MAIN STOCK ROOM (user_id is null)
    const mainStock = stockPoints.find(sp => sp.user_id === null && sp.default_status === 'applied');
    return mainStock ? mainStock.stock_point_name : 'N/A';
  };

  const handleImageClick = (imagePath, itemName) => {
    if (imagePath) {
      const imageUrl = imagePath.startsWith('http') ? imagePath : `${baseURL}${imagePath}`;
      setSelectedImage(imageUrl);
      setSelectedItemName(itemName || 'Product Image');
      setShowImageModal(true);
    }
  };

  const renderImageThumbnail = (imagePath, itemName, size = '40px') => {
    if (!imagePath) {
      return (
        <div style={{
          width: size, height: size, backgroundColor: '#f0f0f0',
          borderRadius: '4px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#999', fontSize: '12px'
        }}>
          <FaImage />
        </div>
      );
    }

    const imageUrl = imagePath.startsWith('http') ? imagePath : `${baseURL}${imagePath}`;

    return (
      <div
        style={{
          width: size, height: size, borderRadius: '4px', overflow: 'hidden',
          cursor: 'pointer', border: '1px solid #ddd', position: 'relative', flexShrink: 0
        }}
        onClick={() => handleImageClick(imagePath, itemName)}
      >
        <img
          src={imageUrl}
          alt={itemName || 'Product'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `
              <div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#f0f0f0;color:#999;font-size:12px;">
                <span>N/A</span>
              </div>`;
          }}
        />
      </div>
    );
  };

  // Fetch return transfers
  const fetchReturnTransfers = async () => {
    try {
      setLoading(true);
      
      // Fetch stock points first and wait for completion
      const stockPointsResponse = await axios.get(`${baseURL}/api/stockpoints`);
      console.log("Stock Points Response: ", stockPointsResponse.data);
      const stockPointsData = stockPointsResponse.data;
      setStockPoints(stockPointsData);
      
      // Now fetch return transfers
      const response = await axios.get(`${baseURL}/api/return-to-main-stock/get-return-transfers`);
      console.log("Return Transfers Response: ", response.data);
      
      // Enrich data with proper stock point names using the mapping function
      // Use the stockPointsData directly instead of relying on state
      const enrichedData = response.data.map(returnItem => {
        // Find stock point where user_id matches fromUserId
        const stockPoint = stockPointsData.find(sp => sp.user_id === returnItem.from_user_id);
        let stockPointName = 'N/A';
        
        if (stockPoint) {
          stockPointName = stockPoint.stock_point_name;
        } else {
          // If no match found, check if it's MAIN STOCK ROOM (user_id is null)
          const mainStock = stockPointsData.find(sp => sp.user_id === null && sp.default_status === 'applied');
          stockPointName = mainStock ? mainStock.stock_point_name : 'N/A';
        }
        
        return {
          ...returnItem,
          from_stock_point_name: stockPointName
        };
      });
      
      console.log("Enriched Return Data: ", enrichedData);
      setReturnData(enrichedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching return transfers:', error);
      Swal.fire('Error', 'Failed to fetch return transfers. Please try again.', 'error');
      setLoading(false);
    }
  };

  // Fetch return details for a specific return_id
  const fetchReturnDetails = async (returnId) => {
    if (returnDetailsMap[returnId]) return returnDetailsMap[returnId];
    
    try {
      setLoadingDetails(prev => ({ ...prev, [returnId]: true }));
      const response = await axios.get(`${baseURL}/api/return-to-main-stock/get-return-transfer/${returnId}`);
      console.log(`Return Details for ${returnId}:`, response.data);
      
      setReturnDetailsMap(prev => ({
        ...prev,
        [returnId]: response.data
      }));
      return response.data;
    } catch (error) {
      console.error(`Error fetching return details for ${returnId}:`, error);
      Swal.fire('Error', 'Failed to fetch return details', 'error');
      return null;
    } finally {
      setLoadingDetails(prev => ({ ...prev, [returnId]: false }));
    }
  };

  // Group returns by from_stock_point_name (now using the enriched data)
  const groupedByStockPoint = useMemo(() => {
    const grouped = {};
    returnData.forEach(returnItem => {
      const stockPoint = returnItem.from_stock_point_name || 'Unassigned';
      if (!grouped[stockPoint]) grouped[stockPoint] = [];
      grouped[stockPoint].push(returnItem);
    });
    return grouped;
  }, [returnData]);

  // Get totals for a stock point group
  const getStockPointTotals = (returns) => {
    return returns.reduce((acc, returnItem) => {
      acc.totalReturns += 1;
      acc.totalItems += parseInt(returnItem.total_items || 0);
      acc.totalQty += parseFloat(returnItem.total_quantity || 0);
      acc.totalGrossWt += parseFloat(returnItem.total_gross_weight || 0);
      acc.totalNetWt += parseFloat(returnItem.total_net_weight || 0);
      return acc;
    }, { totalReturns: 0, totalItems: 0, totalQty: 0, totalGrossWt: 0, totalNetWt: 0 });
  };

  // Helper to read the packet barcode off an item, regardless of which field name the API used
  const getItemPacketBarcode = (item) => {
    return (
      item?.Packet_BarCode ||
      item?.packet_barcode ||
      item?.PacketBarCode ||
      item?.packet_no ||
      item?.PacketNo ||
      null
    );
  };

  // ===== Packet Barcode helpers (NEW) =====

  // Collect unique packet barcodes -> list of products, for ALL returns under a stock point.
  // Relies on returnDetailsMap already being populated for those returns.
  const getPacketGroupsForStockPoint = (returns) => {
    const packetMap = {}; // { packetBarcode: [items...] }
    returns.forEach((returnItem) => {
      const details = returnDetailsMap[returnItem.return_id];
      const items = details?.return_items || [];
      items.forEach((item) => {
        const packetCode = getItemPacketBarcode(item) || 'No Packet';
        if (!packetMap[packetCode]) packetMap[packetCode] = [];
        packetMap[packetCode].push({ ...item, return_number: returnItem.return_number });
      });
    });
    return packetMap; // object keyed by packet barcode
  };

  // Ensure details for every return under a stock point are loaded (used right before opening the dropdown)
  const ensureStockPointDetailsLoaded = async (stockPoint, returns) => {
    const missing = returns.filter(r => !returnDetailsMap[r.return_id]);
    if (missing.length === 0) return;

    setLoadingPackets(prev => ({ ...prev, [stockPoint]: true }));
    try {
      await Promise.all(missing.map(r => fetchReturnDetails(r.return_id)));
    } finally {
      setLoadingPackets(prev => ({ ...prev, [stockPoint]: false }));
    }
  };

  const handlePacketBarcodeSelect = (packetCode, returns) => {
    const packetMap = getPacketGroupsForStockPoint(returns);
    setSelectedPacketBarcode(packetCode);
    setSelectedPacketProducts(packetMap[packetCode] || []);
    setShowPacketProductsModal(true);
  };

  const handleClosePacketProductsModal = () => {
    setShowPacketProductsModal(false);
    setSelectedPacketBarcode('');
    setSelectedPacketProducts([]);
  };

  // ==========================================

  const toggleStockPoint = (stockPoint) => {
    setExpandedStockPoints(prev => ({ ...prev, [stockPoint]: !prev[stockPoint] }));
  };

  const toggleReturnExpand = (returnId) => {
    const isExpanded = !expandedReturns[returnId];
    setExpandedReturns(prev => ({ ...prev, [returnId]: isExpanded }));
    
    if (isExpanded) {
      fetchReturnDetails(returnId);
    }
  };

  const handleViewItems = (returnData, items) => {
    setSelectedReturn(returnData);
    setSelectedItems(items);
    setShowModal(true);
  };

  const handleCloseModal = () => { 
    setShowModal(false); 
    setSelectedReturn(null); 
    setSelectedItems([]); 
  };
  
  const handleCloseImageModal = () => { 
    setShowImageModal(false); 
    setSelectedImage(null); 
    setSelectedItemName(''); 
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': { color: '#ffc107', text: 'Pending' },
      'in_transit': { color: '#17a2b8', text: 'In Transit' },
      'completed': { color: '#28a745', text: 'Completed' },
      'cancelled': { color: '#dc3545', text: 'Cancelled' }
    };
    const statusInfo = statusColors[status] || { color: '#6c757d', text: status };
    return (
      <span style={{
        backgroundColor: statusInfo.color,
        color: 'white',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: 'bold',
        display: 'inline-block',
        minWidth: '60px',
        textAlign: 'center'
      }}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${date.getFullYear()}`;
  };

  // Function to update Received Status (from original code)
  const updateReceivedStatus = async (item, newStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [item.item_id]: true }));

      const payload = {
        barcodes: [item.PCode_BarCode],
        received_status: newStatus
      };

      const response = await axios.put(`${baseURL}/update-received-status`, payload);

      if (response.status === 200) {
        // Update the item in the return details map
        const updatedMap = { ...returnDetailsMap };
        Object.keys(updatedMap).forEach(returnId => {
          const details = updatedMap[returnId];
          if (details && details.return_items) {
            details.return_items = details.return_items.map(returnItem => {
              if (returnItem.item_id === item.item_id) {
                return { ...returnItem, Received_Status: newStatus };
              }
              return returnItem;
            });
            updatedMap[returnId] = details;
          }
        });
        setReturnDetailsMap(updatedMap);

        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Received Status changed to "${newStatus}" successfully!`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error updating received status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.error || 'Failed to update received status. Please try again.'
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [item.item_id]: false }));
    }
  };

  useEffect(() => {
    fetchReturnTransfers();
  }, []);

  if (loading) {
    return (
      <div className="main-container">
        <div className="sales-table-container">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>
          </div>
        </div>
      </div>
    );
  }

  if (returnData.length === 0) {
    return (
      <div className="main-container">
        <div className="sales-table-container">
          <div className="text-center py-5">
            <h4>No return transfers found</h4>
            <p className="text-muted">No return transfers available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="sales-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <div>
              <h3>Received Stock Items</h3>
              <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                Total Returns: {returnData.length} | 
                <Badge bg="info" className="ms-2">Stock Points: {Object.keys(groupedByStockPoint).length}</Badge>
              </p>
            </div>
            <div>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" size="sm">
                  Filter: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setStatusFilter('all')}>All</Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter('pending')}>
                    <span className="status-dot pending-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffc107', marginRight: '8px' }}></span>
                    Pending
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter('received')}>
                    <span className="status-dot received-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#28a745', marginRight: '8px' }}></span>
                    Received
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>
        </Row>

        <div className="hierarchical-view">
          <style>{`
            .hierarchical-view .table { margin-bottom: 0; font-size: 13px; }
            .hierarchical-view .table thead th { 
              background-color: #a36e29; 
              color: white; 
              padding: 8px 10px; 
              font-weight: 600; 
              text-align: center; 
              vertical-align: middle; 
              white-space: nowrap; 
            }
            .hierarchical-view .table tbody td { padding: 6px 8px; vertical-align: middle; text-align: center; }
            .stock-point-row { background-color: #f8f9fa !important; font-weight: 600; }
            .stock-point-row td { padding: 8px 10px !important; }
            .stock-point-row:hover { background-color: #e9ecef !important; }
            .return-header-row { background-color: #e9ecef !important; }
            .return-header-row td { padding: 6px 10px !important; }
            .return-header-row:hover { background-color: #dee2e6 !important; }
            .item-row td { padding: 5px 8px !important; }
            .item-row:hover { background-color: #f1f3f5 !important; }
            .expand-btn { background: none; border: none; cursor: pointer; padding: 2px 6px; color: #a36e29; font-size: 14px; }
            .expand-btn:hover { color: #6b4c1c; }
            .location-icon { font-size: 16px; margin-right: 6px; }
            .stock-icon { color: #a36e29; }
            .item-details-cell { text-align: left !important; }
            .item-details-cell .item-code { font-weight: 600; color: #a36e29; font-size: 12px; }
            .item-details-cell .item-design { font-size: 10px; color: #666; margin-top: 1px; }
            .item-details-cell .item-packet { font-size: 10px; color: #2e7d32; margin-top: 1px; display: flex; align-items: center; gap: 4px; }
            .badge-stock-count { font-size: 11px; padding: 3px 8px; }
            .ps-3 { padding-left: 2rem !important; }
            .ps-4 { padding-left: 3rem !important; }
            .view-btn { 
              background-color: #a36e29; 
              color: white; 
              border: none; 
              padding: 4px 12px; 
              border-radius: 4px; 
              font-size: 11px; 
              cursor: pointer; 
              transition: background-color 0.2s; 
            }
            .view-btn:hover { background-color: #6b4c1c; }
            .return-number { font-weight: 700; color: #a36e29; font-size: 13px; }
            .return-from { font-weight: 500; color: #495057; }

            /* Packet Barcode dropdown (NEW) */
            .packet-barcode-toggle {
              background-color: #e8f5e9 !important;
              color: #2e7d32 !important;
              border: 1px solid #a5d6a7 !important;
              font-size: 11px !important;
              font-weight: 600 !important;
              padding: 3px 10px !important;
              border-radius: 12px !important;
              display: inline-flex;
              align-items: center;
              gap: 6px;
            }
            .packet-barcode-toggle:hover,
            .packet-barcode-toggle:focus {
              background-color: #d4edda !important;
              color: #1b5e20 !important;
              border-color: #81c784 !important;
              box-shadow: none !important;
            }
            .packet-barcode-toggle::after { display: none !important; }
            .packet-barcode-menu {
              min-width: 180px;
              max-height: 260px;
              overflow-y: auto;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              border: 1px solid #e0e0e0;
              padding: 6px 0;
            }
            .packet-barcode-menu .dropdown-item {
              font-size: 12px;
              padding: 7px 14px;
              display: flex;
              align-items: center;
              gap: 8px;
              color: #2e7d32;
              font-weight: 500;
            }
            .packet-barcode-menu .dropdown-item:hover {
              background-color: #e8f5e9;
            }
            
            /* Received Status Badge Styles */
            .received-status-badge { 
              padding: 4px 12px; 
              border-radius: 12px; 
              font-size: 11px; 
              font-weight: 600; 
              display: inline-block; 
              min-width: 70px; 
              text-align: center; 
              cursor: pointer;
              transition: all 0.2s ease;
              border: 1px solid transparent;
            }
            .received-status-badge.pending {
              background-color: #fff3cd;
              color: #856404;
              border-color: #ffc107;
            }
            .received-status-badge.pending:hover {
              background-color: #ffe69c;
              border-color: #d39e00;
            }
            .received-status-badge.received {
              background-color: #d4edda;
              color: #155724;
              border-color: #28a745;
            }
            .received-status-badge.received:hover {
              background-color: #c3e6cb;
              border-color: #1e7e34;
            }
            .received-status-badge .dropdown-arrow {
              margin-left: 4px;
              font-size: 8px;
            }
            
            .status-dropdown-menu {
              min-width: 140px;
              padding: 6px 0;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              border: 1px solid #e0e0e0;
              background: white;
            }
            .status-dropdown-menu .dropdown-item {
              padding: 8px 16px;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.15s ease;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .status-dropdown-menu .dropdown-item:hover {
              background-color: #f8f9fa;
            }
            .status-dropdown-menu .dropdown-item:active {
              background-color: #e9ecef;
            }
            .status-dropdown-menu .dropdown-item.pending-option {
              color: #856404;
            }
            .status-dropdown-menu .dropdown-item.pending-option:hover {
              background-color: #fff3cd;
            }
            .status-dropdown-menu .dropdown-item.received-option {
              color: #155724;
            }
            .status-dropdown-menu .dropdown-item.received-option:hover {
              background-color: #d4edda;
            }
            .status-dropdown-menu .dropdown-item .check-icon {
              color: #28a745;
              font-size: 12px;
              margin-left: auto;
            }
            .status-dropdown-menu .dropdown-divider {
              margin: 4px 0;
              border-color: #e9ecef;
            }
            .status-dropdown-menu .dropdown-item .status-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              display: inline-block;
            }
            .status-dropdown-menu .dropdown-item .status-dot.pending-dot {
              background-color: #ffc107;
            }
            .status-dropdown-menu .dropdown-item .status-dot.received-dot {
              background-color: #28a745;
            }
          `}</style>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th style={{ width: '30px' }}></th>
                  <th style={{ minWidth: '200px', textAlign: 'left' }}>Stock Point / Return Details</th>
                  <th style={{ width: '60px' }}>Image</th>
                  <th style={{ width: '100px' }}>PCode</th>
                  <th style={{ width: '80px' }}>Qty</th>
                  <th style={{ width: '90px' }}>Gross Wt</th>
                  <th style={{ width: '90px' }}>Stone Wt</th>
                  <th style={{ width: '90px' }}>Net Wt</th>
                  <th style={{ width: '100px' }}>Rate</th>
                  <th style={{ width: '110px' }}>Total Price</th>
                  <th style={{ width: '80px' }}>Status</th>
                  <th style={{ width: '140px' }}>Received Status</th>
                  <th style={{ width: '80px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedByStockPoint)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([stockPoint, returns]) => {
                    const totals = getStockPointTotals(returns);
                    const isStockPointExpanded = expandedStockPoints[stockPoint];
                    const isLoadingPackets = loadingPackets[stockPoint];
                    const packetMapForStockPoint = getPacketGroupsForStockPoint(returns);
                    const packetCodes = Object.keys(packetMapForStockPoint);

                    return (
                      <React.Fragment key={stockPoint}>
                        {/* Stock Point Header Row */}
                        <tr className="stock-point-row">
                          <td>
                            <button className="expand-btn" onClick={() => toggleStockPoint(stockPoint)}>
                              {isStockPointExpanded ? <FaChevronDown /> : <FaChevronRight />}
                            </button>
                          </td>
                          <td colSpan="12" style={{ textAlign: 'left' }}>
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <FaBoxOpen className="location-icon stock-icon" />
                                <strong>{stockPoint}</strong>

                                {/* ===== Packet Barcode Dropdown (NEW) ===== */}
                                <Dropdown
                                  className="ms-2"
                                  onClick={(e) => e.stopPropagation()}
                                  onToggle={(nextOpen) => {
                                    if (nextOpen) ensureStockPointDetailsLoaded(stockPoint, returns);
                                  }}
                                >
                                  <Dropdown.Toggle as="span" className="packet-barcode-toggle" role="button">
                                    <FaBarcode size={11} />
                                    {isLoadingPackets ? (
                                      <Spinner animation="border" size="sm" style={{ width: '10px', height: '10px' }} />
                                    ) : packetCodes.length === 1 ? (
                                      packetCodes[0]
                                    ) : packetCodes.length > 1 ? (
                                      `${packetCodes.length} Packets`
                                    ) : (
                                      'Packet Barcode'
                                    )}
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu className="packet-barcode-menu">
                                    {isLoadingPackets ? (
                                      <div className="text-center py-2">
                                        <Spinner animation="border" size="sm" variant="secondary" />
                                      </div>
                                    ) : packetCodes.length > 0 ? (
                                      packetCodes.map((packetCode) => (
                                        <Dropdown.Item
                                          key={packetCode}
                                          onClick={() => handlePacketBarcodeSelect(packetCode, returns)}
                                        >
                                          <FaBarcode size={10} />
                                          {packetCode}
                                          <Badge bg="success" className="ms-auto" style={{ fontSize: '9px' }}>
                                            {packetMapForStockPoint[packetCode].length}
                                          </Badge>
                                        </Dropdown.Item>
                                      ))
                                    ) : (
                                      <div className="text-center text-muted py-2" style={{ fontSize: '11px' }}>
                                        No packets found
                                      </div>
                                    )}
                                  </Dropdown.Menu>
                                </Dropdown>
                                {/* ===== End Packet Barcode Dropdown ===== */}

                                <Badge bg="warning" className="ms-2 badge-stock-count">
                                  {totals.totalReturns} Return(s)
                                </Badge>
                              </div>
                              <div className="d-flex align-items-center" style={{ fontSize: '12px', gap: '15px' }}>
                                <span><strong>Items:</strong> {totals.totalItems}</span>
                                <span><strong>Qty:</strong> {totals.totalQty.toFixed(3)}</span>
                                <span><strong>Gross:</strong> {totals.totalGrossWt.toFixed(3)}</span>
                                <span><strong>Net:</strong> {totals.totalNetWt.toFixed(3)}</span>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Returns under this Stock Point */}
                        {isStockPointExpanded && returns.map((returnItem) => {
                          const isReturnExpanded = expandedReturns[returnItem.return_id];
                          const details = returnDetailsMap[returnItem.return_id];
                          const items = details?.return_items || [];
                          const isLoading = loadingDetails[returnItem.return_id];

                          return (
                            <React.Fragment key={returnItem.return_id}>
                              {/* Return Header Row */}
                              <tr className="return-header-row">
                                <td className="ps-3">
                                  <button className="expand-btn" onClick={() => toggleReturnExpand(returnItem.return_id)}>
                                    {isReturnExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                  </button>
                                </td>
                                <td colSpan="12" style={{ textAlign: 'left' }}>
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                      <span className="return-number">{returnItem.return_number}</span>
                                      <span className="return-from ms-3" style={{ fontSize: '12px' }}>
                                        Date: {formatDate(returnItem.return_date)}
                                      </span>
                                      <Badge bg="secondary" className="ms-2" style={{ fontSize: '10px' }}>
                                        {returnItem.total_items} Items
                                      </Badge>
                                    </div>
                                    <div className="d-flex align-items-center" style={{ fontSize: '12px', gap: '12px' }}>
                                      <span><strong>Qty:</strong> {returnItem.total_quantity}</span>
                                      <span><strong>Gross:</strong> {returnItem.total_gross_weight}</span>
                                      <span><strong>Net:</strong> {returnItem.total_net_weight}</span>
                                      <span>{getStatusBadge(returnItem.status)}</span>
                                    </div>
                                  </div>
                                </td>
                              </tr>

                              {/* Items under this Return */}
                              {isReturnExpanded && (
                                isLoading ? (
                                  <tr>
                                    <td colSpan="13" className="text-center py-3">
                                      <Spinner animation="border" size="sm" variant="warning" />
                                      <span className="ms-2">Loading items...</span>
                                    </td>
                                  </tr>
                                ) : items.length > 0 ? (
                                  items.map((item, index) => {
                                    const imagePath = item.image || null;
                                    const isUpdating = updatingStatus[item.item_id];
                                    const currentStatus = item.Received_Status || 'pending';
                                    const itemPacketCode = getItemPacketBarcode(item);

                                    return (
                                      <tr key={item.item_id || index} className="item-row">
                                        <td className="ps-4"></td>
                                        <td className="item-details-cell">
                                          <div className="item-code">#{item.PCode_BarCode || 'N/A'}</div>
                                          <div className="item-design">{item.design_name || item.sub_category || 'No Design'}</div>
                                          {itemPacketCode && (
                                            <div className="item-packet">
                                              <FaBarcode size={9} />
                                              Packet: {itemPacketCode}
                                            </div>
                                          )}
                                          <div style={{ fontSize: '10px', color: '#888' }}>{item.sub_category} - {item.category}</div>
                                        </td>
                                        <td>{renderImageThumbnail(imagePath, item.design_name || item.sub_category, '38px')}</td>
                                        <td>{item.PCode_BarCode || 'N/A'}</td>
                                        <td>{item.qty || 1}</td>
                                        <td>{parseFloat(item.gross_weight || 0).toFixed(3)}</td>
                                        <td>{parseFloat(item.stone_weight || 0).toFixed(3)}</td>
                                        <td>{parseFloat(item.net_weight || 0).toFixed(3)}</td>
                                        <td>{parseFloat(item.rate || 0).toFixed(2)}</td>
                                        <td><strong>₹{parseFloat(item.total_price || 0).toFixed(2)}</strong></td>
                                        <td>{getStatusBadge(returnItem.status)}</td>
                                        <td>
                                          {isUpdating ? (
                                            <Spinner animation="border" size="sm" variant="warning" />
                                          ) : (
                                            <Dropdown>
                                              <Dropdown.Toggle 
                                                variant="link" 
                                                className="p-0 text-decoration-none"
                                                id={`dropdown-${item.item_id}`}
                                              >
                                                <span className={`received-status-badge ${currentStatus}`}>
                                                  {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                                                  <span className="dropdown-arrow">▼</span>
                                                </span>
                                              </Dropdown.Toggle>

                                              <Dropdown.Menu className="status-dropdown-menu">
                                                <Dropdown.Item 
                                                  className={`dropdown-item pending-option ${currentStatus === 'pending' ? 'active' : ''}`}
                                                  onClick={() => updateReceivedStatus(item, 'pending')}
                                                >
                                                  <span className="status-dot pending-dot"></span>
                                                  Pending
                                                  {currentStatus === 'pending' && <FaCheck className="check-icon" />}
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item 
                                                  className={`dropdown-item received-option ${currentStatus === 'received' ? 'active' : ''}`}
                                                  onClick={() => updateReceivedStatus(item, 'received')}
                                                >
                                                  <span className="status-dot received-dot"></span>
                                                  Received
                                                  {currentStatus === 'received' && <FaCheck className="check-icon" />}
                                                </Dropdown.Item>
                                              </Dropdown.Menu>
                                            </Dropdown>
                                          )}
                                        </td>
                                        <td>
                                          <button className="view-btn" onClick={() => handleViewItems(returnItem, [item])}>
                                            <FaEye size={12} /> View
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td colSpan="13" className="text-center py-2 text-muted">
                                      No items found for this return
                                    </td>
                                  </tr>
                                )
                              )}
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Item Details */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" className="m-auto">
        <Modal.Header closeButton>
          <Modal.Title>
            Return Items - {selectedReturn?.return_number || 'Details'}
            <span className="ms-3" style={{ fontSize: '14px', fontWeight: 'normal', color: '#6c757d' }}>
              From: {selectedReturn?.from_stock_point_name || 'N/A'}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: '13px' }}>
          {selectedItems.length > 0 && (
            <div className="table-responsive">
              <Table bordered size="sm">
                <thead style={{ whiteSpace: 'nowrap', fontSize: '12px', backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th>SI</th>
                    <th>Image</th>
                    <th>PCode</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Sub Category</th>
                    <th>Metal</th>
                    <th>Purity</th>
                    <th>Qty</th>
                    <th>Gross Wt</th>
                    <th>Stone Wt</th>
                    <th>Net Wt</th>
                    <th>Rate</th>
                    <th>MC</th>
                    <th>Total Price</th>
                    <th>Received Status</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '12px' }}>
                  {selectedItems.map((item, index) => {
                    const imagePath = item.image || null;
                    const currentStatus = item.Received_Status || 'pending';
                    return (
                      <tr key={item.item_id || index}>
                        <td>{index + 1}</td>
                        <td>{renderImageThumbnail(imagePath, item.design_name || item.sub_category, '36px')}</td>
                        <td><strong>{item.PCode_BarCode || 'N/A'}</strong></td>
                        <td>{item.design_name || item.product_name || item.sub_category || 'N/A'}</td>
                        <td>{item.category || 'N/A'}</td>
                        <td>{item.sub_category || 'N/A'}</td>
                        <td>{item.metal_type || 'N/A'}</td>
                        <td>{item.purity || 'N/A'}</td>
                        <td>{item.qty || 1}</td>
                        <td>{parseFloat(item.gross_weight || 0).toFixed(3)}</td>
                        <td>{parseFloat(item.stone_weight || 0).toFixed(3)}</td>
                        <td>{parseFloat(item.net_weight || 0).toFixed(3)}</td>
                        <td>{parseFloat(item.rate || 0).toFixed(2)}</td>
                        <td>{parseFloat(item.making_charges || 0).toFixed(2)}</td>
                        <td><strong>₹{parseFloat(item.total_price || 0).toFixed(2)}</strong></td>
                        <td>
                          <span className={`received-status-badge ${currentStatus}`}>
                            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                    <td colSpan="8" className="text-end"><strong>Totals:</strong></td>
                    <td><strong>{selectedItems.reduce((s, i) => s + parseFloat(i.qty || 0), 0).toFixed(3)}</strong></td>
                    <td><strong>{selectedItems.reduce((s, i) => s + parseFloat(i.gross_weight || 0), 0).toFixed(3)}</strong></td>
                    <td><strong>{selectedItems.reduce((s, i) => s + parseFloat(i.stone_weight || 0), 0).toFixed(3)}</strong></td>
                    <td><strong>{selectedItems.reduce((s, i) => s + parseFloat(i.net_weight || 0), 0).toFixed(3)}</strong></td>
                    <td colSpan="2"></td>
                    <td><strong>₹{selectedItems.reduce((s, i) => s + parseFloat(i.total_price || 0), 0).toFixed(2)}</strong></td>
                    <td></td>
                  </tr>
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* ===== Packet Products Modal (NEW) ===== */}
      <Modal show={showPacketProductsModal} onHide={handleClosePacketProductsModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBarcode className="me-2" style={{ color: '#2e7d32' }} />
            Packet: {selectedPacketBarcode}
            <Badge bg="success" className="ms-2" style={{ fontSize: '11px' }}>
              {selectedPacketProducts.length} Product(s)
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: '13px' }}>
          {selectedPacketProducts.length > 0 ? (
            <div className="table-responsive">
              <Table bordered size="sm">
                <thead style={{ whiteSpace: 'nowrap', fontSize: '12px', backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th>SI</th>
                    <th>Image</th>
                    <th>PCode</th>
                    <th>Product Name</th>
                    <th>Return No.</th>
                    <th>Qty</th>
                    <th>Gross Wt</th>
                    <th>Net Wt</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '12px' }}>
                  {selectedPacketProducts.map((item, index) => {
                    const imagePath = item.image || null;
                    const currentStatus = item.Received_Status || 'pending';
                    return (
                      <tr key={item.item_id || index}>
                        <td>{index + 1}</td>
                        <td>{renderImageThumbnail(imagePath, item.design_name || item.sub_category, '34px')}</td>
                        <td><strong>{item.PCode_BarCode || 'N/A'}</strong></td>
                        <td>{item.design_name || item.product_name || item.sub_category || 'N/A'}</td>
                        <td>{item.return_number || 'N/A'}</td>
                        <td>{item.qty || 1}</td>
                        <td>{parseFloat(item.gross_weight || 0).toFixed(3)}</td>
                        <td>{parseFloat(item.net_weight || 0).toFixed(3)}</td>
                        <td>
                          <span className={`received-status-badge ${currentStatus}`}>
                            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted py-3">No products found for this packet.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePacketProductsModal}>Close</Button>
        </Modal.Footer>
      </Modal>
      {/* ===== End Packet Products Modal ===== */}

      {/* Image Preview Modal */}
      <Modal show={showImageModal} onHide={handleCloseImageModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedItemName}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedImage && (
            <img
              src={selectedImage}
              alt={selectedItemName}
              style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '';
                e.target.parentElement.innerHTML = `
                  <div style="display:flex;align-items:center;justify-content:center;height:200px;background:#f0f0f0;border-radius:8px;color:#999;">
                    <p>Image not available</p>
                  </div>`;
              }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseImageModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReceivedStock;