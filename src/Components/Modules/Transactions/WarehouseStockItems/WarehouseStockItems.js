import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChevronRight, FaChevronDown, FaWarehouse, FaStore, FaImage, FaEye } from 'react-icons/fa';
import { Button, Row, Col, Modal, Table, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../../Url/NodeBaseURL';
import { AuthContext } from "../../../Pages/Login/Context";
import Swal from 'sweetalert2';

const WarehouseStockItems = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStockPoint, setSelectedStockPoint] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const { userName } = useContext(AuthContext);

  const [expandedStockPoints, setExpandedStockPoints] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedItemName, setSelectedItemName] = useState('');

  // Map: PCode_BarCode -> image path (from transfer items)
  const [transferImageMap, setTransferImageMap] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${date.getFullYear()}`;
  };

  const formatCurrency = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2);
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
        onClick={() => handleImageClick(imagePath, itemName)}
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
                <span>N/A</span>
              </div>
            `;
          }}
        />
      </div>
    );
  };

  // Fetch all transfer images and build PCode_BarCode -> image map
  const fetchTransferImages = async () => {
    try {
      const transfersRes = await axios.get(`${baseURL}/api/stock-transfer/get-stock-transfers`);
      const transfers = transfersRes.data || [];

      const imageMap = {};

      await Promise.all(
        transfers.map(async (transfer) => {
          try {
            const detailRes = await axios.get(
              `${baseURL}/api/stock-transfer/get-stock-transfer/${transfer.transfer_id}`
            );
            const items = detailRes.data?.transfer_items || [];
            items.forEach((item) => {
              if (item.PCode_BarCode && item.image) {
                imageMap[item.PCode_BarCode] = item.image;
              }
            });
          } catch (err) {
            console.warn(`Failed to fetch transfer ${transfer.transfer_id}`, err);
          }
        })
      );

      setTransferImageMap(imageMap);
    } catch (error) {
      console.error('Error fetching transfer images:', error);
    }
  };

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/get/opening-tags-entry`);
      console.log("Stock Data Response: ", response.data);

      if (response.data && response.data.result) {
        // Filter: Status must be 'Available' or 'Assigned', and Stock_Point must NOT be 'MAIN STOCK ROOM'
        const filtered = response.data.result.filter(
          (item) =>
            (item.Status === 'Available' || item.Status === 'Assigned') &&
            item.Stock_Point !== 'MAIN STOCK ROOM'
        );
        setStockData(filtered);
      } else {
        setStockData([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      Swal.fire('Error', 'Failed to fetch stock data. Please try again.', 'error');
      setLoading(false);
    }
  };

  // Group data by Stock Point
  const groupedData = useMemo(() => {
    const grouped = {};
    stockData.forEach(item => {
      const stockPoint = item.Stock_Point || 'Unassigned';
      if (!grouped[stockPoint]) {
        grouped[stockPoint] = [];
      }
      grouped[stockPoint].push(item);
    });
    return grouped;
  }, [stockData]);

  // Calculate totals for each stock point
  const getStockPointTotals = (items) => {
    return items.reduce((acc, item) => {
      acc.totalItems += 1;
      acc.totalQty += parseFloat(item.pcs || 1);
      acc.totalGrossWt += parseFloat(item.Gross_Weight || 0);
      acc.totalStoneWt += parseFloat(item.Stones_Weight || 0);
      acc.totalNetWt += parseFloat(item.TotalWeight_AW || 0);
      acc.totalAmount += parseFloat(item.total_price || 0);
      return acc;
    }, {
      totalItems: 0,
      totalQty: 0,
      totalGrossWt: 0,
      totalStoneWt: 0,
      totalNetWt: 0,
      totalAmount: 0
    });
  };

  const toggleStockPoint = (stockPoint) => {
    setExpandedStockPoints(prev => ({
      ...prev,
      [stockPoint]: !prev[stockPoint]
    }));
  };

  const handleViewItems = (stockPoint, items) => {
    setSelectedStockPoint(stockPoint);
    setSelectedItems(items);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStockPoint(null);
    setSelectedItems([]);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
    setSelectedItemName('');
  };

  useEffect(() => {
    const init = async () => {
      await fetchTransferImages();
      await fetchStockData();
    };
    init();
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
              <h3>Warehouse Stock Items</h3>
              <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                Total Products: {stockData.length} | Stock Points: {Object.keys(groupedData).length}
              </p>
            </div>
          </Col>
        </Row>

        {/* Hierarchical Stock View */}
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
              .item-row td {
                padding: 5px 8px !important;
              }
              .item-row:hover {
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
              .stock-icon {
                color: #a36e29;
              }
              .item-details-cell {
                text-align: left !important;
              }
              .item-details-cell .item-code {
                font-weight: 600;
                color: #a36e29;
                font-size: 12px;
              }
              .item-details-cell .item-design {
                font-size: 10px;
                color: #666;
                margin-top: 1px;
              }
              .badge-stock-count {
                font-size: 11px;
                padding: 3px 8px;
              }
              .text-center {
                text-align: center !important;
              }
              .ps-3 {
                padding-left: 2rem !important;
              }
              .view-btn {
                background-color: #a36e29;
                color: white;
                border: none;
                padding: 2px 10px;
                border-radius: 4px;
                font-size: 11px;
                cursor: pointer;
                transition: background-color 0.2s;
              }
              .view-btn:hover {
                background-color: #6b4c1c;
              }
              .product-image-thumb {
                width: 35px;
                height: 35px;
                object-fit: cover;
                border-radius: 4px;
                cursor: pointer;
                border: 1px solid #ddd;
              }
            `}
          </style>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th style={{ width: '30px' }}></th>
                  <th style={{ minWidth: '200px', textAlign: 'left' }}>Stock Point / Item Details</th>
                  <th style={{ width: '60px' }}>Image</th>
                  <th style={{ width: '100px' }}>PCode</th>
                  <th style={{ width: '80px' }}>Qty</th>
                  <th style={{ width: '90px' }}>Gross Wt</th>
                  <th style={{ width: '90px' }}>Stone Wt</th>
                  <th style={{ width: '90px' }}>Net Wt</th>
                  <th style={{ width: '100px' }}>Rate</th>
                  <th style={{ width: '110px' }}>Total Price</th>
                  <th style={{ width: '80px' }}>Status</th>
                  <th style={{ width: '80px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedData)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([stockPoint, items]) => {
                    const totals = getStockPointTotals(items);
                    const isExpanded = expandedStockPoints[stockPoint];

                    return (
                      <React.Fragment key={stockPoint}>
                        {/* Stock Point Header Row */}
                        <tr className="stock-point-row">
                          <td>
                            <button
                              className="expand-btn"
                              onClick={() => toggleStockPoint(stockPoint)}
                            >
                              {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                            </button>
                          </td>
                          <td colSpan="11" style={{ textAlign: 'left' }}>
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <FaWarehouse className="location-icon stock-icon" />
                                <strong>{stockPoint}</strong>
                                <Badge bg="primary" className="ms-2 badge-stock-count">
                                  {items.length} Item(s)
                                </Badge>
                              </div>
                              <div className="d-flex align-items-center" style={{ fontSize: '12px', gap: '15px' }}>
                                <span><strong>Qty:</strong> {totals.totalQty.toFixed(3)}</span>
                                <span><strong>Gross:</strong> {totals.totalGrossWt.toFixed(3)}</span>
                                <span><strong>Net:</strong> {totals.totalNetWt.toFixed(3)}</span>
                                <span><strong>Total:</strong> ₹{totals.totalAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Items under this Stock Point */}
                        {isExpanded && items.map((item, index) => {
                          // Get image from transfer image map by PCode_BarCode
                          const imagePath = transferImageMap[item.PCode_BarCode] || item.image || null;

                          return (
                            <tr key={item.opentag_id || index} className="item-row">
                              <td className="ps-3"></td>
                              <td className="item-details-cell">
                                <div className="item-code">#{item.PCode_BarCode || 'N/A'}</div>
                                <div className="item-design">{item.design_master || item.sub_category || 'No Design'}</div>
                                <div style={{ fontSize: '10px', color: '#888' }}>
                                  {item.sub_category} - {item.category}
                                </div>
                              </td>
                              <td>
                                {renderImageThumbnail(imagePath, item.design_master || item.sub_category, '38px')}
                              </td>
                              <td>{item.PCode_BarCode || 'N/A'}</td>
                              <td>{item.pcs || 1}</td>
                              <td>{parseFloat(item.Gross_Weight || 0).toFixed(3)}</td>
                              <td>{parseFloat(item.Stones_Weight || 0).toFixed(3)}</td>
                              <td>{parseFloat(item.TotalWeight_AW || 0).toFixed(3)}</td>
                              <td>{parseFloat(item.rate || 0).toFixed(2)}</td>
                              <td><strong>₹{parseFloat(item.total_price || 0).toFixed(2)}</strong></td>
                              <td>
                                <span style={{
                                  backgroundColor: item.Status === 'Assigned' ? '#28a745' : '#ffc107',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  display: 'inline-block',
                                  minWidth: '60px',
                                  textAlign: 'center'
                                }}>
                                  {item.Status || 'N/A'}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="view-btn"
                                  onClick={() => handleViewItems(stockPoint, [item])}
                                >
                                  <FaEye size={12} /> View
                                </button>
                              </td>
                            </tr>
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
          <Modal.Title>Stock Items - {selectedStockPoint}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: '13px' }}>
          {selectedItems.length > 0 && (
            <>
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
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '12px' }}>
                    {selectedItems.map((item, index) => {
                      const imagePath = transferImageMap[item.PCode_BarCode] || item.image || null;
                      return (
                        <tr key={item.opentag_id || index}>
                          <td>{index + 1}</td>
                          <td>{renderImageThumbnail(imagePath, item.design_master || item.sub_category, '36px')}</td>
                          <td><strong>{item.PCode_BarCode || 'N/A'}</strong></td>
                          <td>{item.design_master || item.sub_category || 'N/A'}</td>
                          <td>{item.category || 'N/A'}</td>
                          <td>{item.sub_category || 'N/A'}</td>
                          <td>{item.metal_type || 'N/A'}</td>
                          <td>{item.Purity || 'N/A'}</td>
                          <td>{item.pcs || 1}</td>
                          <td>{parseFloat(item.Gross_Weight || 0).toFixed(3)}</td>
                          <td>{parseFloat(item.Stones_Weight || 0).toFixed(3)}</td>
                          <td>{parseFloat(item.TotalWeight_AW || 0).toFixed(3)}</td>
                          <td>{parseFloat(item.rate || 0).toFixed(2)}</td>
                          <td>{parseFloat(item.Making_Charges || 0).toFixed(2)}</td>
                          <td><strong>₹{parseFloat(item.total_price || 0).toFixed(2)}</strong></td>
                        </tr>
                      );
                    })}
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                      <td colSpan="8" className="text-end"><strong>Totals:</strong></td>
                      <td><strong>{selectedItems.reduce((sum, item) => sum + parseFloat(item.pcs || 0), 0).toFixed(3)}</strong></td>
                      <td><strong>{selectedItems.reduce((sum, item) => sum + parseFloat(item.Gross_Weight || 0), 0).toFixed(3)}</strong></td>
                      <td><strong>{selectedItems.reduce((sum, item) => sum + parseFloat(item.Stones_Weight || 0), 0).toFixed(3)}</strong></td>
                      <td><strong>{selectedItems.reduce((sum, item) => sum + parseFloat(item.TotalWeight_AW || 0), 0).toFixed(3)}</strong></td>
                      <td colSpan="3"></td>
                      <td><strong>₹{selectedItems.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0).toFixed(2)}</strong></td>
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

export default WarehouseStockItems;