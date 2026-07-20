// StockInward.js
import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout';
import { FaEye, FaEdit, FaTrash, FaImage } from 'react-icons/fa';
import { Button, Row, Col, Modal, Table, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../../Url/NodeBaseURL';
import { AuthContext } from "../../../Pages/Login/Context";
import Swal from 'sweetalert2';

const StockInward = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [transferDetails, setTransferDetails] = useState(null);
  const { authToken, userId, userName, role } = useContext(AuthContext);
  const { mobile } = location.state || {};
  const initialSearchValue = location.state?.mobile || '';

  // State for image preview modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedItemName, setSelectedItemName] = useState('');

  // Cache for transfer items
  const [transferItemsCache, setTransferItemsCache] = useState({});

  // Get logged-in user's stock name from localStorage
  const getLoggedInStockName = () => {
    const storedUserName = localStorage.getItem('userName');
    console.log("Logged in user's stock name from localStorage:", storedUserName);
    return storedUserName || '';
  };

  const loggedInStockName = getLoggedInStockName();

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
        fontWeight: 'bold'
      }}>
        {statusInfo.text}
      </span>
    );
  };

  /**
   * Handle image click - opens image preview modal
   */
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

  /**
   * Get all images from transfer items
   */
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

  /**
   * Render image thumbnail
   */
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
                <i class="fa fa-image"></i>
              </div>
            `;
          }}
        />
      </div>
    );
  };

  /**
   * Render multiple images for a transfer
   */
  const renderTransferImages = (transfer, maxDisplay = 3) => {
    const images = getTransferImages(transfer);
    
    if (images.length === 0) {
      return (
        <span className="text-muted" style={{ fontSize: '12px' }}>No image</span>
      );
    }

    const displayImages = images.slice(0, maxDisplay);
    const remainingCount = images.length - maxDisplay;

    return (
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {displayImages.map((img, index) => (
          <div key={index} style={{ position: 'relative' }}>
            {renderImageThumbnail(img.image, img.productName, '40px')}
          </div>
        ))}
        {remainingCount > 0 && (
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '4px',
            backgroundColor: '#a36e29',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            +{remainingCount}
          </div>
        )}
      </div>
    );
  };

  /**
   * Fetch transfer items for a specific transfer
   */
  const fetchTransferItems = async (transferId) => {
    if (transferItemsCache[transferId]) {
      return; // Already cached
    }

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

  /**
   * Fetch items for all transfers in the list
   */
  const fetchAllTransferItems = async (transfers) => {
    const fetchPromises = transfers.map(transfer => 
      fetchTransferItems(transfer.transfer_id)
    );
    await Promise.allSettled(fetchPromises);
  };

  // Columns with Images
  const columns = React.useMemo(
    () => [
      {
        Header: 'SI',
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: 'Transfer No',
        accessor: 'transfer_number',
      },
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
      {
        Header: 'Total Items',
        accessor: 'total_items',
      },
      {
        Header: 'Total Qty',
        accessor: 'total_quantity',
      },
      {
        Header: 'Total Gross Wt',
        accessor: 'total_gross_weight',
      },
      // {
      //   Header: 'Total Net Wt',
      //   accessor: 'total_net_weight',
      // },
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
        Header: 'Actions',
        id: 'actions',
        Cell: ({ row }) => {
          return (
            <div>
              <FaEye
                style={{ cursor: 'pointer', marginLeft: '10px', color: 'green' }}
                onClick={() => handleViewDetails(row.original.transfer_id)}
              />
            </div>
          );
        },
      },
    ],
    [transferItemsCache]
  );

  const fetchStockTransfers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/api/stock-transfer/get-stock-transfers`);
      console.log("All Stock Transfers Response: ", response.data);
      
      // Filter data based on logged-in user's stock name matching to_stock_point_name
      const filtered = response.data.filter(transfer => {
        const toStockPoint = transfer.to_stock_point_name?.toUpperCase().trim();
        const loggedStock = loggedInStockName?.toUpperCase().trim();
        
        const isMatch = toStockPoint === loggedStock;
        
        if (isMatch) {
          console.log(`Matched: Transfer ${transfer.transfer_number} -> To Stock Point: ${transfer.to_stock_point_name}`);
        }
        
        return isMatch;
      });
      
      console.log("Filtered Stock Inward Data: ", filtered);
      console.log(`Total Transfers: ${response.data.length}, Filtered: ${filtered.length}`);
      
      setData(response.data);
      setFilteredData(filtered);
      
      // Fetch items for filtered transfers
      if (filtered && filtered.length > 0) {
        await fetchAllTransferItems(filtered);
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

  // Display current stock name for reference
  useEffect(() => {
    console.log("Current logged-in stock name:", loggedInStockName);
  }, [loggedInStockName]);

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
              <h3>Stock Inward</h3>
              {filteredData.length > 0 && (
                <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                  Showing inward transfers for: <strong>{loggedInStockName}</strong>
                </p>
              )}
            </div>
          </Col>
        </Row>
        
        {filteredData.length === 0 ? (
          <div className="text-center p-5">
            <p>No stock inward transfers found for <strong>{loggedInStockName}</strong></p>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={[...filteredData].reverse()} 
            initialSearchValue={initialSearchValue} 
          />
        )}
      </div>

      {/* Modal for Transfer Details */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" className="m-auto">
        <Modal.Header closeButton>
          <Modal.Title>Stock Transfer Details - Inward</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: '13px' }}>
          {transferDetails && (
            <>
              <h5>Transfer Information</h5>
              <Table bordered>
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
                    <td>
                      {transferDetails.transfer_details.to_stock_point_name || 'N/A'}
                      {transferDetails.transfer_details.to_stock_point_name === loggedInStockName && (
                        <span className="badge bg-success ms-2">Inward for your stock</span>
                      )}
                    </td>
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

              <h5>Inward Items</h5>
              <div className="table-responsive">
                <Table bordered>
                  <thead style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                    <tr>
                      <th>SI</th>
                      <th style={{ width: '60px' }}>Image</th>
                      <th>Product Name</th>
                      <th>Metal Type</th>
                      <th>Purity</th>
                      <th>Category</th>
                      <th>Sub Category</th>
                      <th>Design Name</th>
                      <th>Qty</th>
                      <th>Gross Wt</th>
                      <th>Stone Wt</th>
                      <th>Net Wt</th>
                      <th>Rate</th>
                      <th>MC</th>
                      <th>Stone Price</th>
                      <th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                    {transferDetails.transfer_items.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          {renderImageThumbnail(item.image, item.product_name || 'Product', '50px')}
                        </td>
                        <td>{item.product_name || 'N/A'}</td>
                        <td>{item.metal_type || 'N/A'}</td>
                        <td>{item.purity || 'N/A'}</td>
                        <td>{item.category || 'N/A'}</td>
                        <td>{item.sub_category || 'N/A'}</td>
                        <td>{item.design_name || 'N/A'}</td>
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
                      <td colSpan="8" className="text-end"><strong>Totals:</strong></td>
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

export default StockInward;