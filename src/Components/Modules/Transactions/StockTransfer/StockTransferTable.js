import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout';
import { FaEye, FaEdit, FaTrash, FaChevronRight, FaChevronDown, FaWarehouse, FaBuilding, FaStore } from 'react-icons/fa';
import { Button, Row, Col, Modal, Table, Badge, Spinner, Alert } from 'react-bootstrap';
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
  
  // State for view mode (hierarchical or flat)
  const [viewMode, setViewMode] = useState('hierarchical'); // 'hierarchical' or 'flat'
  
  // State for expanded sections
  const [expandedFromStockPoints, setExpandedFromStockPoints] = useState({});
  const [expandedToStockPoints, setExpandedToStockPoints] = useState({});

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

  // Build hierarchical data structure based on Stock Points
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

  // Toggle expand/collapse for From Stock Points
  const toggleFromStockPoint = (fromStockPoint) => {
    setExpandedFromStockPoints(prev => ({
      ...prev,
      [fromStockPoint]: !prev[fromStockPoint]
    }));
  };

  // Toggle expand/collapse for To Stock Points
  const toggleToStockPoint = (fromStockPoint, toStockPoint) => {
    const key = `${fromStockPoint}-${toStockPoint}`;
    setExpandedToStockPoints(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
            <div>
              <FaEye
                style={{ cursor: 'pointer', marginLeft: '10px', color: 'green' }}
                onClick={() => handleViewDetails(row.original.transfer_id)}
              />
              {isAdmin && canEdit && (
                <FaEdit
                  style={{
                    cursor: 'pointer',
                    marginLeft: '10px',
                    color: 'blue',
                  }}
                  onClick={() => handleEdit(row.original)}
                />
              )}
              {isAdmin && (
                <FaTrash
                  style={{
                    cursor: 'pointer',
                    marginLeft: '10px',
                    color: 'red',
                  }}
                  onClick={() => handleDelete(row.original.transfer_id)}
                />
              )}
            </div>
          );
        },
      },
    ],
    [userName]
  );

  const handleEdit = (transfer) => {
    const tabId = crypto.randomUUID();
    navigate("/add-stocktransfer", { 
      state: { 
        tabId,
        editData: transfer,
        isEdit: true 
      } 
    });
  };

  const handleDelete = async (transferId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete this stock transfer?`,
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
              {/* View Mode Toggle */}
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
                .stock-point-row {
                  background-color: #f8f9fa;
                  font-weight: 500;
                  cursor: pointer;
                }
                .stock-point-row:hover {
                  background-color: #e9ecef;
                }
                .to-stock-point-row {
                  background-color: #fff3e0;
                }
                .to-stock-point-row:hover {
                  background-color: #ffe4b5;
                }
                .transfer-row {
                  background-color: #ffffff;
                }
                .transfer-row:hover {
                  background-color: #f1f3f5;
                }
                .expand-btn {
                  background: none;
                  border: none;
                  cursor: pointer;
                  padding: 0;
                  color: #a36e29;
                  font-size: 16px;
                  transition: transform 0.2s;
                }
                .expand-btn:hover {
                  color: #6b4c1c;
                }
                .location-icon {
                  font-size: 18px;
                }
                .from-stock-icon {
                  color: #a36e29;
                }
                .to-stock-icon {
                  color: #28a745;
                }
                .ps-6 {
                  padding-left: 4rem !important;
                }
                .ps-7 {
                  padding-left: 6rem !important;
                }
                .table-hover tbody tr:hover {
                  background-color: rgba(0,0,0,.02);
                }
              `}
            </style>
            <table className="table table-striped table-bordered table-hover">
              <thead style={{ backgroundColor: '#a36e29', color: 'white' }}>
                <tr>
                  <th style={{ width: '50px' }}></th>
                  <th>Stock Point / Transfer Details</th>
                  <th>Transfer No</th>
                  <th>Date</th>
                  <th>Total Items</th>
                  <th>Total Qty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(hierarchicalData)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([fromStockPoint, fromData]) => (
                    <React.Fragment key={fromStockPoint}>
                      {/* From Stock Point Row */}
                      <tr className="stock-point-row">
                        <td className="text-center">
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
                        <td colSpan="6">
                          <div className="d-flex align-items-center">
                            <FaWarehouse className="location-icon from-stock-icon me-2" />
                            <strong>{fromStockPoint}</strong>
                            <Badge bg="primary" className="ms-2">
                              {fromData.totalTransfers} Transfer(s)
                            </Badge>
                          </div>
                        </td>
                        <td></td>
                      </tr>

                      {/* To Stock Points for this From Stock Point */}
                      {expandedFromStockPoints[fromStockPoint] && 
                        Object.entries(fromData.toStockPoints)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([toStockPoint, transfers]) => (
                            <React.Fragment key={`${fromStockPoint}-${toStockPoint}`}>
                              {/* To Stock Point Row */}
                              <tr className="to-stock-point-row">
                                <td className="text-center">
                                  <button
                                    className="expand-btn ms-3"
                                    onClick={() => toggleToStockPoint(fromStockPoint, toStockPoint)}
                                  >
                                    {expandedToStockPoints[`${fromStockPoint}-${toStockPoint}`] ? 
                                      <FaChevronDown /> : 
                                      <FaChevronRight />
                                    }
                                  </button>
                                </td>
                                <td colSpan="6">
                                  <div className="d-flex align-items-center">
                                    <FaStore className="location-icon to-stock-icon me-2" />
                                    <strong>→ {toStockPoint}</strong>
                                    <Badge bg="success" className="ms-2">
                                      {transfers.length} Transfer(s)
                                    </Badge>
                                  </div>
                                </td>
                                <td></td>
                              </tr>

                              {/* Individual Transfer Rows */}
                              {expandedToStockPoints[`${fromStockPoint}-${toStockPoint}`] && 
                                transfers.map((transfer, idx) => (
                                  <tr key={transfer.transfer_id} className="transfer-row">
                                    <td className="ps-6"></td>
                                    <td className="ps-7">
                                      <div>
                                        <strong>Transfer #{transfer.transfer_number}</strong>
                                        {transfer.remarks && (
                                          <div className="small text-muted">{transfer.remarks}</div>
                                        )}
                                      </div>
                                    </td>
                                    <td>{transfer.transfer_number}</td>
                                    <td>{formatDate(transfer.transfer_date)}</td>
                                    <td>{transfer.total_items}</td>
                                    <td>{transfer.total_quantity}</td>
                                    <td>{getStatusBadge(transfer.status)}</td>
                                    <td>
                                      <FaEye
                                        style={{ cursor: 'pointer', marginLeft: '10px', color: 'green' }}
                                        onClick={() => handleViewDetails(transfer.transfer_id)}
                                      />
                                      {userName === "ADMIN" && transfer.status === 'pending' && (
                                        <FaEdit
                                          style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue' }}
                                          onClick={() => handleEdit(transfer)}
                                        />
                                      )}
                                      {userName === "ADMIN" && (
                                        <FaTrash
                                          style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
                                          onClick={() => handleDelete(transfer.transfer_id)}
                                        />
                                      )}
                                    </td>
                                  </tr>
                                ))
                              }
                            </React.Fragment>
                          ))
                      }
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Flat View with DataTable */
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
                <Table bordered>
                  <thead style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                    <tr>
                      <th>SI</th>
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
                      <td colSpan="7" className="text-end"><strong>Totals:</strong></td>
                      <td><strong>{transferDetails.transfer_items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0).toFixed(3)}</strong></td>
                      <td><strong>{transferDetails.transfer_items.reduce((sum, item) => sum + parseFloat(item.gross_weight || 0), 0).toFixed(3)}</strong></td>
                      <td><strong>{transferDetails.transfer_items.reduce((sum, item) => sum + parseFloat(item.stone_weight || 0), 0).toFixed(3)}</strong></td>
                      <td><strong>{transferDetails.transfer_items.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)}</strong></td>
                      <td colSpan="2"></td>
                      <td></td>
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
    </div>
  );
};

export default StockTransferTable;