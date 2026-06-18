import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout';
import { FaEye, FaEdit, FaTrash, FaChevronRight, FaChevronDown, FaWarehouse, FaStore, FaImage } from 'react-icons/fa';
import { Button, Row, Col, Modal, Table, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../../Url/NodeBaseURL';
import { AuthContext } from "../../../Pages/Login/Context";
import Swal from 'sweetalert2';

const StockTransferTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [transferDetails, setTransferDetails] = useState(null);
  const { authToken, userId, userName, role } = useContext(AuthContext);
  const { mobile } = location.state || {};
  const initialSearchValue = location.state?.mobile || '';
  
  const [viewMode, setViewMode] = useState('hierarchical');
  const [expandedFromStockPoints, setExpandedFromStockPoints] = useState({});
  const [expandedToStockPoints, setExpandedToStockPoints] = useState({});

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedItemName, setSelectedItemName] = useState('');
  const [transferItemsCache, setTransferItemsCache] = useState({});

  const getTabId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let tabId = urlParams.get('tabId');
    if (!tabId) {
      tabId = sessionStorage.getItem('tabId');
    }
    if (!tabId) {
      tabId = crypto.randomUUID();
      sessionStorage.setItem('tabId', tabId);
      const newUrl = `${window.location.pathname}?tabId=${tabId}`;
      window.history.replaceState({}, '', newUrl);
    }
    return tabId;
  };

  const tabId = getTabId();

  useEffect(() => {
    if (mobile) {
      console.log('Selected Mobile from Dashboard:', mobile);
    }
  }, [mobile]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${date.getFullYear()}`;
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
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 'bold',
        display: 'inline-block',
        minWidth: '70px',
        textAlign: 'center'
      }}>
        {statusInfo.text}
      </span>
    );
  };

  const handleImageClick = (imagePath, itemName) => {
    if (imagePath) {
      const imageUrl = imagePath.startsWith('http') 
        ? imagePath 
        : `${baseURL}${imagePath}`;
      setSelectedImage(imageUrl);
      setSelectedItemName(itemName || 'Product Image');
      setShowImageModal(true);
    }
  };

  const getTransferImages = (transfer) => {
    const cachedItems = transferItemsCache[transfer.transfer_id];
    if (cachedItems && cachedItems.length > 0) {
      return cachedItems
        .filter(item => item.image)
        .map(item => ({
          image: item.image,
          productName: item.product_name || 'Product',
          itemId: item.item_id || Math.random()
        }));
    }
    return [];
  };

  const renderImageThumbnail = (imagePath, itemName, size = '40px') => {
    if (!imagePath) {
      return (
        <div style={{
          width: size,
          height: size,
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '12px'
        }}>
          <FaImage />
        </div>
      );
    }

    const imageUrl = imagePath.startsWith('http') 
      ? imagePath 
      : `${baseURL}${imagePath}`;

    return (
      <div 
        style={{
          width: size,
          height: size,
          borderRadius: '4px',
          overflow: 'hidden',
          cursor: 'pointer',
          border: '1px solid #ddd',
          position: 'relative',
          flexShrink: 0
        }}
        onClick={() => handleImageClick(imageUrl, itemName)}
      >
        <img 
          src={imageUrl} 
          alt={itemName || 'Product'} 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            const parent = e.target.parentElement;
            parent.innerHTML = `
              <div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#f0f0f0;color:#999;font-size:12px;">
                <FaImage />
              </div>
            `;
          }}
        />
      </div>
    );
  };

  const renderTransferImages = (transfer, maxDisplay = 2) => {
    const images = getTransferImages(transfer);
    
    if (images.length === 0) {
      return (
        <span className="text-muted" style={{ fontSize: '11px' }}>No image</span>
      );
    }

    const displayImages = images.slice(0, maxDisplay);
    const remainingCount = images.length - maxDisplay;

    return (
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
        {displayImages.map((img, index) => (
          <div key={index}>
            {renderImageThumbnail(img.image, img.productName, '35px')}
          </div>
        ))}
        {remainingCount > 0 && (
          <div style={{
            width: '35px',
            height: '35px',
            borderRadius: '4px',
            backgroundColor: '#a36e29',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            +{remainingCount}
          </div>
        )}
      </div>
    );
  };

  const fetchTransferItems = async (transferId) => {
    if (transferItemsCache[transferId]) return;
    try {
      const response = await axios.get(`${baseURL}/api/stock-transfer/get-stock-transfer/${transferId}`);
      if (response.data && response.data.transfer_items) {
        setTransferItemsCache(prev => ({
          ...prev,
          [transferId]: response.data.transfer_items
        }));
      }
    } catch (error) {
      console.error(`Error fetching items for transfer ${transferId}:`, error);
    }
  };

  const fetchAllTransferItems = async (transfers) => {
    const fetchPromises = transfers.map(transfer => 
      fetchTransferItems(transfer.transfer_id)
    );
    await Promise.allSettled(fetchPromises);
  };

  const hierarchicalData = useMemo(() => {
    const grouped = {};
    data.forEach(transfer => {
      const fromStockPoint = transfer.from_stock_point_name || 'Unknown Stock Point';
      const toStockPoint = transfer.to_stock_point_name || 'Unknown Stock Point';

      if (!grouped[fromStockPoint]) {
        grouped[fromStockPoint] = {
          transfers: [],
          totalTransfers: 0,
          toStockPoints: {}
        };
      }
      if (!grouped[fromStockPoint].toStockPoints[toStockPoint]) {
        grouped[fromStockPoint].toStockPoints[toStockPoint] = [];
      }
      grouped[fromStockPoint].toStockPoints[toStockPoint].push(transfer);
      grouped[fromStockPoint].totalTransfers++;
    });
    return grouped;
  }, [data]);

  const toggleFromStockPoint = (fromStockPoint) => {
    setExpandedFromStockPoints(prev => ({
      ...prev,
      [fromStockPoint]: !prev[fromStockPoint]
    }));
  };

  const toggleToStockPoint = (fromStockPoint, toStockPoint) => {
    const key = `${fromStockPoint}-${toStockPoint}`;
    setExpandedToStockPoints(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const columns = React.useMemo(
    () => [
      { Header: 'SI', Cell: ({ row }) => row.index + 1 },
      { Header: 'Transfer No', accessor: 'transfer_number' },
      {
        Header: 'Transfer Date',
        accessor: 'transfer_date',
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: 'From Warehouse Point',
        accessor: 'from_stock_point_name',
        Cell: ({ value }) => value || 'N/A',
      },
      {
        Header: 'To Warehouse Point',
        accessor: 'to_stock_point_name',
        Cell: ({ value }) => value || 'N/A',
      },
      { Header: 'Items', accessor: 'total_items' },
      { Header: 'Qty', accessor: 'total_quantity' },
      {
        Header: 'Images',
        id: 'images',
        Cell: ({ row }) => {
          const transfer = row.original;
          if (!transferItemsCache[transfer.transfer_id]) {
            fetchTransferItems(transfer.transfer_id);
          }
          return renderTransferImages(transfer, 2);
        },
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => getStatusBadge(value),
      },
      {
        Header: 'Actions',
        id: 'actions',
        Cell: ({ row }) => {
          const isAdmin = userName === "ADMIN";
          const canEdit = row.original.status === 'pending';
          return (
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
              <FaEye
                style={{ cursor: 'pointer', color: 'green', fontSize: '15px' }}
                onClick={() => handleViewDetails(row.original.transfer_id)}
                title="View Details"
              />
              {isAdmin && canEdit && (
                <FaEdit
                  style={{ cursor: 'pointer', color: 'blue', fontSize: '15px' }}
                  onClick={() => handleEdit(row.original)}
                  title="Edit"
                />
              )}
              {isAdmin && (
                <FaTrash
                  style={{ cursor: 'pointer', color: 'red', fontSize: '15px' }}
                  onClick={() => handleDelete(row.original.transfer_id)}
                  title="Delete"
                />
              )}
            </div>
          );
        },
      },
    ],
    [userName, transferItemsCache]
  );

  const handleEdit = (transfer) => {
    const tabId = crypto.randomUUID();
    navigate("/add-stocktransfer", { 
      state: { tabId, editData: transfer, isEdit: true } 
    });
  };

  const handleDelete = async (transferId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this stock transfer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${baseURL}/api/stock-transfer/delete-stock-transfer/${transferId}`);
          if (response.status === 200) {
            Swal.fire('Deleted!', response.data.message, 'success');
            setTransferItemsCache(prev => {
              const newCache = { ...prev };
              delete newCache[transferId];
              return newCache;
            });
            fetchStockTransfers();
          }
        } catch (error) {
          console.error('Error deleting stock transfer:', error);
          Swal.fire('Error!', 'Failed to delete stock transfer. Please try again.', 'error');
        }
      }
    });
  };

  const handleCreate = () => {
    const tabId = crypto.randomUUID();
    navigate("/add-stocktransfer", { state: { tabId } });
  };

  const fetchStockTransfers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/api/stock-transfer/get-stock-transfers`);
      console.log("Stock Transfers Response: ", response.data);
      setData(response.data);
      if (response.data && response.data.length > 0) {
        await fetchAllTransferItems(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stock transfers:', error);
      setLoading(false);
    }
  };

  const handleViewDetails = async (transfer_id) => {
    try {
      const response = await axios.get(`${baseURL}/api/stock-transfer/get-stock-transfer/${transfer_id}`);
      console.log("Fetched transfer details: ", response.data);
      setTransferDetails(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching transfer details:", error);
      Swal.fire('Error', 'Failed to fetch transfer details', 'error');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTransferDetails(null);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
    setSelectedItemName('');
  };

  useEffect(() => {
    fetchStockTransfers();
  }, []);

  if (loading) {
    return (
      <div className="main-container">
        <div className="sales-table-container">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
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
              <h3>Stock Transfers</h3>
              <div className="btn-group me-3 mt-2">
                <Button
                  variant={viewMode === 'hierarchical' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setViewMode('hierarchical')}
                >
                  🗂️ Hierarchical View
                </Button>
                <Button
                  variant={viewMode === 'flat' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setViewMode('flat')}
                >
                  📋 Flat View
                </Button>
              </div>
            </div>
            <Button
              className="create_but"
              onClick={handleCreate}
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
            >
              + Create Transfer
            </Button>
          </Col>
        </Row>

        {/* Hierarchical View */}
        {viewMode === 'hierarchical' ? (
          <div className="hierarchical-view">
            <style>
              {`
                .hierarchical-view .table {
                  margin-bottom: 0;
                  font-size: 13px;
                }
                .hierarchical-view .table thead th {
                  background-color: #a36e29;
                  color: white;
                  padding: 8px 10px;
                  font-weight: 600;
                  text-align: center;
                  vertical-align: middle;
                  white-space: nowrap;
                }
                .hierarchical-view .table tbody td {
                  padding: 6px 8px;
                  vertical-align: middle;
                  text-align: center;
                }
                .stock-point-row {
                  background-color: #f8f9fa !important;
                  font-weight: 600;
                }
                .stock-point-row td {
                  padding: 8px 10px !important;
                }
                .stock-point-row:hover {
                  background-color: #e9ecef !important;
                }
                .to-stock-point-row {
                  background-color: #fff8f0 !important;
                }
                .to-stock-point-row td {
                  padding: 6px 10px !important;
                }
                .to-stock-point-row:hover {
                  background-color: #fff0e0 !important;
                }
                .transfer-row td {
                  padding: 5px 8px !important;
                }
                .transfer-row:hover {
                  background-color: #f1f3f5 !important;
                }
                .expand-btn {
                  background: none;
                  border: none;
                  cursor: pointer;
                  padding: 2px 6px;
                  color: #a36e29;
                  font-size: 14px;
                }
                .expand-btn:hover {
                  color: #6b4c1c;
                }
                .location-icon {
                  font-size: 16px;
                  margin-right: 6px;
                }
                .from-stock-icon {
                  color: #a36e29;
                }
                .to-stock-icon {
                  color: #28a745;
                }
                .transfer-details-cell {
                  text-align: left !important;
                }
                .transfer-details-cell .transfer-number {
                  font-weight: 600;
                  color: #a36e29;
                  font-size: 12px;
                }
                .transfer-details-cell .transfer-remarks {
                  font-size: 10px;
                  color: #666;
                  margin-top: 1px;
                }
                .text-center {
                  text-align: center !important;
                }
                .ps-3 {
                  padding-left: 2rem !important;
                }
                .ps-4 {
                  padding-left: 3.5rem !important;
                }
                .ps-5 {
                  padding-left: 5rem !important;
                }
                .badge-transfer-count {
                  font-size: 11px;
                  padding: 3px 8px;
                }
              `}
            </style>
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '30px' }}></th>
                    <th style={{ minWidth: '180px', textAlign: 'left' }}>Stock Point / Transfer Details</th>
                    <th style={{ width: '90px' }}>Transfer No</th>
                    <th style={{ width: '90px' }}>Date</th>
                    <th style={{ width: '50px' }}>Items</th>
                    <th style={{ width: '55px' }}>Qty</th>
                    <th style={{ width: '120px' }}>Images</th>
                    <th style={{ width: '90px' }}>Status</th>
                    <th style={{ width: '90px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(hierarchicalData)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([fromStockPoint, fromData]) => (
                      <React.Fragment key={fromStockPoint}>
                        <tr className="stock-point-row">
                          <td>
                            <button
                              className="expand-btn"
                              onClick={() => toggleFromStockPoint(fromStockPoint)}
                            >
                              {expandedFromStockPoints[fromStockPoint] ? 
                                <FaChevronDown /> : 
                                <FaChevronRight />
                              }
                            </button>
                          </td>
                          <td colSpan="8" style={{ textAlign: 'left' }}>
                            <div className="d-flex align-items-center">
                              <FaWarehouse className="location-icon from-stock-icon" />
                              <strong>{fromStockPoint}</strong>
                              <Badge bg="primary" className="ms-2 badge-transfer-count">
                                {fromData.totalTransfers} Transfer(s)
                              </Badge>
                            </div>
                          </td>
                        </tr>

                        {expandedFromStockPoints[fromStockPoint] && 
                          Object.entries(fromData.toStockPoints)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([toStockPoint, transfers]) => (
                              <React.Fragment key={`${fromStockPoint}-${toStockPoint}`}>
                                <tr className="to-stock-point-row">
                                  <td>
                                    <button
                                      className="expand-btn"
                                      onClick={() => toggleToStockPoint(fromStockPoint, toStockPoint)}
                                    >
                                      {expandedToStockPoints[`${fromStockPoint}-${toStockPoint}`] ? 
                                        <FaChevronDown /> : 
                                        <FaChevronRight />
                                      }
                                    </button>
                                  </td>
                                  <td colSpan="8" style={{ textAlign: 'left' }}>
                                    <div className="d-flex align-items-center">
                                      <FaStore className="location-icon to-stock-icon" />
                                      <strong>→ {toStockPoint}</strong>
                                      <Badge bg="success" className="ms-2 badge-transfer-count">
                                        {transfers.length} Transfer(s)
                                      </Badge>
                                    </div>
                                  </td>
                                </tr>

                                {expandedToStockPoints[`${fromStockPoint}-${toStockPoint}`] && 
                                  transfers.map((transfer) => {
                                    const images = getTransferImages(transfer);
                                    const imageCount = images.length;

                                    return (
                                      <tr key={transfer.transfer_id} className="transfer-row">
                                        <td className="ps-3"></td>
                                        <td className="transfer-details-cell">
                                          <div className="transfer-number">#{transfer.transfer_number}</div>
                                          {transfer.remarks && (
                                            <div className="transfer-remarks">{transfer.remarks}</div>
                                          )}
                                        </td>
                                        <td>{transfer.transfer_number}</td>
                                        <td>{formatDate(transfer.transfer_date)}</td>
                                        <td>{transfer.total_items}</td>
                                        <td>{transfer.total_quantity}</td>
                                        <td>
                                          {imageCount > 0 ? (
                                            <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                              {images.slice(0, 2).map((img, idx) => (
                                                <div key={idx}>
                                                  {renderImageThumbnail(img.image, img.productName, '32px')}
                                                </div>
                                              ))}
                                              {imageCount > 2 && (
                                                <div style={{
                                                  width: '32px',
                                                  height: '32px',
                                                  borderRadius: '3px',
                                                  backgroundColor: '#a36e29',
                                                  color: 'white',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  fontSize: '9px',
                                                  fontWeight: 'bold'
                                                }}>
                                                  +{imageCount - 2}
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-muted" style={{ fontSize: '11px' }}>No image</span>
                                          )}
                                        </td>
                                        <td>{getStatusBadge(transfer.status)}</td>
                                        <td>
                                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                            <FaEye
                                              style={{ cursor: 'pointer', color: 'green', fontSize: '14px' }}
                                              onClick={() => handleViewDetails(transfer.transfer_id)}
                                              title="View Details"
                                            />
                                            {userName === "ADMIN" && transfer.status === 'pending' && (
                                              <FaEdit
                                                style={{ cursor: 'pointer', color: 'blue', fontSize: '14px' }}
                                                onClick={() => handleEdit(transfer)}
                                                title="Edit"
                                              />
                                            )}
                                            {userName === "ADMIN" && (
                                              <FaTrash
                                                style={{ cursor: 'pointer', color: 'red', fontSize: '14px' }}
                                                onClick={() => handleDelete(transfer.transfer_id)}
                                                title="Delete"
                                              />
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })
                                }
                              </React.Fragment>
                            ))
                        }
                      </React.Fragment>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={[...data].reverse()} 
            initialSearchValue={initialSearchValue} 
          />
        )}
      </div>

      {/* Modal for Transfer Details */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" className="m-auto">
        <Modal.Header closeButton>
          <Modal.Title>Stock Transfer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: '13px' }}>
          {transferDetails && (
            <>
              <h5>Transfer Information</h5>
              <Table bordered size="sm">
                <tbody>
                  <tr>
                    <td width="30%"><strong>Transfer Number</strong></td>
                    <td>{transferDetails.transfer_details.transfer_number}</td>
                  </tr>
                  <tr>
                    <td><strong>Transfer Date</strong></td>
                    <td>{formatDate(transferDetails.transfer_details.transfer_date)}</td>
                  </tr>
                  <tr>
                    <td><strong>From Warehouse</strong></td>
                    <td>{transferDetails.transfer_details.from_warehouse_name}</td>
                  </tr>
                  <tr>
                    <td><strong>To Warehouse</strong></td>
                    <td>{transferDetails.transfer_details.to_warehouse_name}</td>
                  </tr>
                  <tr>
                    <td><strong>From Stock Point</strong></td>
                    <td>{transferDetails.transfer_details.from_stock_point_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>To Stock Point</strong></td>
                    <td>{transferDetails.transfer_details.to_stock_point_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Status</strong></td>
                    <td>{getStatusBadge(transferDetails.transfer_details.status)}</td>
                  </tr>
                  <tr>
                    <td><strong>Remarks</strong></td>
                    <td>{transferDetails.transfer_details.remarks || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Created By</strong></td>
                    <td>{transferDetails.transfer_details.created_by || 'System'}</td>
                  </tr>
                  <tr>
                    <td><strong>Created At</strong></td>
                    <td>{formatDate(transferDetails.transfer_details.created_at)}</td>
                  </tr>
                </tbody>
              </Table>

              <h5>Transfer Items</h5>
              <div className="table-responsive">
                <Table bordered size="sm">
                  <thead style={{ whiteSpace: 'nowrap', fontSize: '12px', backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th>SI</th>
                      <th style={{ width: '50px' }}>Image</th>
                      <th>Product Name</th>
                      <th>Metal</th>
                      <th>Purity</th>
                      <th>Category</th>
                      <th>Sub Category</th>
                      <th>Qty</th>
                      <th>Gross Wt</th>
                      <th>Stone Wt</th>
                      <th>Net Wt</th>
                      <th>Rate</th>
                      <th>MC</th>
                      <th>Stone Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '12px' }}>
                    {transferDetails.transfer_items.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          {renderImageThumbnail(item.image, item.product_name || 'Product', '40px')}
                        </td>
                        <td>{item.product_name || 'N/A'}</td>
                        <td>{item.metal_type || 'N/A'}</td>
                        <td>{item.purity || 'N/A'}</td>
                        <td>{item.category || 'N/A'}</td>
                        <td>{item.sub_category || 'N/A'}</td>
                        <td>{item.qty}</td>
                        <td>{item.gross_weight}</td>
                        <td>{item.stone_weight}</td>
                        <td>{item.net_weight}</td>
                        <td>{item.rate}</td>
                        <td>{item.making_charges}</td>
                        <td>{item.stone_price}</td>
                        <td><strong>{item.total_price}</strong></td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                      <td colSpan="7" className="text-end"><strong>Totals:</strong></td>
                      <td><strong>{transferDetails.transfer_items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0).toFixed(3)}</strong></td>
                      <td><strong>{transferDetails.transfer_items.reduce((sum, item) => sum + parseFloat(item.gross_weight || 0), 0).toFixed(3)}</strong></td>
                      <td><strong>{transferDetails.transfer_items.reduce((sum, item) => sum + parseFloat(item.stone_weight || 0), 0).toFixed(3)}</strong></td>
                      <td><strong>{transferDetails.transfer_items.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)}</strong></td>
                      <td colSpan="3"></td>
                      <td><strong>{transferDetails.transfer_items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0).toFixed(2)}</strong></td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

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
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '';
                e.target.parentElement.innerHTML = `
                  <div style="display:flex;align-items:center;justify-content:center;height:200px;background:#f0f0f0;border-radius:8px;color:#999;">
                    <p>Image not available</p>
                  </div>
                `;
              }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseImageModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StockTransferTable;