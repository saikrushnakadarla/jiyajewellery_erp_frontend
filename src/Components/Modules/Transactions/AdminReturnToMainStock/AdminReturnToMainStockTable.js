import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout';
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaChevronRight,
  FaChevronDown,
  FaWarehouse,
  FaStore,
} from 'react-icons/fa';
import { Button, Row, Col, Modal, Table, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../../Url/NodeBaseURL';
import { AuthContext } from "../../../Pages/Login/Context";
import Swal from 'sweetalert2';

const AdminReturnMainStockTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [transferDetails, setTransferDetails] = useState(null);
  const [stockPoints, setStockPoints] = useState([]);
  const { authToken, userId, userName, role } = useContext(AuthContext);
  const { mobile } = location.state || {};
  const initialSearchValue = location.state?.mobile || '';

  // Hierarchical view state
  const [viewMode, setViewMode] = useState('hierarchical');
  const [expandedFromStockPoints, setExpandedFromStockPoints] = useState({});
  const [expandedToStockPoints, setExpandedToStockPoints] = useState({});
  const [searchText, setSearchText] = useState(initialSearchValue);

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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${baseURL}/${cleanPath}`;
  };

  // Resolve stock point name from from_user_id
  const getStockPointName = (fromUserId) => {
    if (!stockPoints.length) return 'N/A';

    const stockPoint = stockPoints.find((sp) => sp.user_id === fromUserId);
    if (stockPoint) {
      return stockPoint.stock_point_name;
    }

    // MAIN STOCK ROOM has user_id null
    const mainStock = stockPoints.find((sp) => sp.user_id === null && sp.default_status === 'applied');
    return mainStock ? mainStock.stock_point_name : 'N/A';
  };

  const getPacketBarcode = (transfer) => {
    const items = transfer.items || [];
    return items.length > 0 && items[0].packet_barcode ? items[0].packet_barcode : null;
  };

  // Reusable capture-image thumbnail (flat + hierarchical)
  const renderCaptureThumb = (value, size = '40px') => {
    if (!value) return <span className="text-muted" style={{ fontSize: '11px' }}>No image</span>;
    const imageUrl = getImageUrl(value);
    return (
      <div style={{ textAlign: 'center' }}>
        <img
          src={imageUrl}
          alt="Capture"
          style={{
            width: size,
            height: size,
            objectFit: 'cover',
            borderRadius: '4px',
            cursor: 'pointer',
            border: '1px solid #ddd'
          }}
          onClick={(e) => {
            e.stopPropagation();
            window.open(imageUrl, '_blank');
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = '<span style="color:#999;font-size:11px">Invalid image</span>';
          }}
        />
      </div>
    );
  };

  // ---------- Search filter (used by hierarchical view) ----------
  const filteredData = useMemo(() => {
    const term = (searchText || '').toString().trim().toLowerCase();
    if (!term) return data;
    return data.filter((t) =>
      [
        t.return_number,
        getStockPointName(t.from_user_id),
        t.to_stock_point_name,
        t.from_user_name,
        getPacketBarcode(t),
        t.status,
      ]
        .filter(Boolean)
        .some((v) => v.toString().toLowerCase().includes(term))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, searchText, stockPoints]);

  // ---------- Group: From Stock Point -> To Stock Point -> Returns ----------
  const hierarchicalData = useMemo(() => {
    const grouped = {};
    filteredData.forEach((transfer) => {
      const fromName = getStockPointName(transfer.from_user_id);
      const fromStockPoint = fromName && fromName !== 'N/A' ? fromName : 'Unknown Stock Point';
      const toStockPoint = transfer.to_stock_point_name || 'MAIN STOCK ROOM';

      if (!grouped[fromStockPoint]) {
        grouped[fromStockPoint] = {
          totalTransfers: 0,
          toStockPoints: {},
        };
      }
      if (!grouped[fromStockPoint].toStockPoints[toStockPoint]) {
        grouped[fromStockPoint].toStockPoints[toStockPoint] = [];
      }
      grouped[fromStockPoint].toStockPoints[toStockPoint].push(transfer);
      grouped[fromStockPoint].totalTransfers++;
    });
    return grouped;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData, stockPoints]);

  // While searching, expand everything so matches are visible
  const isSearching = (searchText || '').toString().trim() !== '';

  const isFromOpen = (fromStockPoint) => isSearching || !!expandedFromStockPoints[fromStockPoint];
  const isToOpen = (fromStockPoint, toStockPoint) =>
    isSearching || !!expandedToStockPoints[`${fromStockPoint}-${toStockPoint}`];

  const toggleFromStockPoint = (fromStockPoint) => {
    setExpandedFromStockPoints((prev) => ({
      ...prev,
      [fromStockPoint]: !prev[fromStockPoint],
    }));
  };

  const toggleToStockPoint = (fromStockPoint, toStockPoint) => {
    const key = `${fromStockPoint}-${toStockPoint}`;
    setExpandedToStockPoints((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ---------- Flat view columns ----------
  const columns = React.useMemo(
    () => [
      {
        Header: 'SI',
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: 'Return No',
        accessor: 'return_number',
      },
      {
        Header: 'Return Date',
        accessor: 'return_date',
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: 'From Stock Point',
        accessor: 'from_user_id',
        Cell: ({ value }) => getStockPointName(value),
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
      {
        Header: 'Total Net Wt',
        accessor: 'total_net_weight',
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => getStatusBadge(value),
      },
      {
        Header: 'Packet Barcode',
        accessor: 'packet_barcode',
        Cell: ({ row }) => {
          const barcode = getPacketBarcode(row.original);
          return barcode ? <span>{barcode}</span> : <span style={{ color: '#999' }}>N/A</span>;
        },
      },
      {
        Header: 'Capture Image',
        accessor: 'capture_image',
        Cell: ({ value }) => renderCaptureThumb(value, '50px'),
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
                onClick={() => handleViewDetails(row.original.return_id)}
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
                  onClick={() => handleDelete(row.original.return_id)}
                  title="Delete"
                />
              )}
            </div>
          );
        },
      },
    ],
    [userName, stockPoints]
  );

  const handleEdit = (transfer) => {
    navigate("/add-return-to-main-stock", {
      state: {
        editData: transfer,
        isEdit: true
      }
    });
  };

  const handleDelete = async (returnId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete this return transfer?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${baseURL}/api/return-to-main-stock/delete-return-transfer/${returnId}`);
          if (response.status === 200) {
            Swal.fire('Deleted!', response.data.message, 'success');
            fetchReturnTransfers();
          }
        } catch (error) {
          console.error('Error deleting return transfer:', error);
          Swal.fire('Error!', 'Failed to delete return transfer. Please try again.', 'error');
        }
      }
    });
  };

  const handleCreate = () => {
    navigate('/add-return-to-main-stock');
  };

  const fetchStockPoints = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/stockpoints`);
      console.log("Stock Points Response: ", response.data);
      setStockPoints(response.data);
    } catch (error) {
      console.error('Error fetching stock points:', error);
    }
  };

  const fetchReturnTransfers = async () => {
    try {
      setLoading(true);
      await fetchStockPoints();

      const response = await axios.get(`${baseURL}/api/return-to-main-stock/get-return-transfers`);
      console.log("Return Transfers Response: ", response.data);

      const allTransfers = response.data;

      // Fetch details for each transfer to get packet_barcode
      const transfersWithItems = await Promise.all(
        allTransfers.map(async (transfer) => {
          try {
            const detailResponse = await axios.get(`${baseURL}/api/return-to-main-stock/get-return-transfer/${transfer.return_id}`);
            return {
              ...transfer,
              items: detailResponse.data.return_items || []
            };
          } catch (error) {
            console.error(`Error fetching details for return ${transfer.return_id}:`, error);
            return {
              ...transfer,
              items: []
            };
          }
        })
      );

      setData(transfersWithItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching return transfers:', error);
      setLoading(false);
    }
  };

  const handleViewDetails = async (returnId) => {
    try {
      const response = await axios.get(`${baseURL}/api/return-to-main-stock/get-return-transfer/${returnId}`);
      console.log("Fetched return details: ", response.data);
      setTransferDetails(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching return details:", error);
      Swal.fire('Error', 'Failed to fetch return details', 'error');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTransferDetails(null);
  };

  useEffect(() => {
    fetchReturnTransfers();
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
              <h3>Return to Main Stock</h3>
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
            {/* Uncomment if you want the Create button back
            <Button
              className="create_but"
              onClick={handleCreate}
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
            >
              + Create Return
            </Button>
            */}
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
                .ps-3 {
                  padding-left: 2rem !important;
                }
                .badge-transfer-count {
                  font-size: 11px;
                  padding: 3px 8px;
                }
                .hierarchical-search {
                  max-width: 320px;
                  font-size: 13px;
                }
              `}
            </style>

            <div className="mb-2">
              <input
                type="text"
                className="form-control form-control-sm hierarchical-search"
                placeholder="Search return no, stock point, packet barcode..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '30px' }}></th>
                    <th style={{ minWidth: '180px', textAlign: 'left' }}>Stock Point / Return Details</th>
                    <th style={{ width: '100px' }}>Return No</th>
                    <th style={{ width: '90px' }}>Date</th>
                    <th style={{ width: '60px' }}>Items</th>
                    <th style={{ width: '60px' }}>Qty</th>
                    <th style={{ width: '90px' }}>Gross Wt</th>
                    <th style={{ width: '120px' }}>Packet Barcode</th>
                    <th style={{ width: '110px' }}>Status</th>
                    <th style={{ width: '110px' }}>Capture Image</th>
                    <th style={{ width: '90px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(hierarchicalData).length === 0 && (
                    <tr>
                      <td colSpan="11" className="text-center text-muted" style={{ padding: '20px' }}>
                        No return transfers found
                      </td>
                    </tr>
                  )}

                  {Object.entries(hierarchicalData)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([fromStockPoint, fromData]) => (
                      <React.Fragment key={fromStockPoint}>
                        {/* Level 1: From Stock Point */}
                        <tr className="stock-point-row">
                          <td>
                            <button
                              className="expand-btn"
                              onClick={() => toggleFromStockPoint(fromStockPoint)}
                            >
                              {isFromOpen(fromStockPoint) ? <FaChevronDown /> : <FaChevronRight />}
                            </button>
                          </td>
                          <td colSpan="10" style={{ textAlign: 'left' }}>
                            <div className="d-flex align-items-center">
                              <FaWarehouse className="location-icon from-stock-icon" />
                              <strong>{fromStockPoint}</strong>
                              <Badge bg="primary" className="ms-2 badge-transfer-count">
                                {fromData.totalTransfers} Transfer(s)
                              </Badge>
                            </div>
                          </td>
                        </tr>

                        {isFromOpen(fromStockPoint) &&
                          Object.entries(fromData.toStockPoints)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([toStockPoint, transfers]) => (
                              <React.Fragment key={`${fromStockPoint}-${toStockPoint}`}>
                                {/* Level 2: To Stock Point */}
                                <tr className="to-stock-point-row">
                                  <td>
                                    <button
                                      className="expand-btn"
                                      onClick={() => toggleToStockPoint(fromStockPoint, toStockPoint)}
                                    >
                                      {isToOpen(fromStockPoint, toStockPoint) ? <FaChevronDown /> : <FaChevronRight />}
                                    </button>
                                  </td>
                                  <td colSpan="10" style={{ textAlign: 'left' }}>
                                    <div className="d-flex align-items-center">
                                      <FaStore className="location-icon to-stock-icon" />
                                      <strong>→ {toStockPoint}</strong>
                                      <Badge bg="success" className="ms-2 badge-transfer-count">
                                        {transfers.length} Transfer(s)
                                      </Badge>
                                    </div>
                                  </td>
                                </tr>

                                {/* Level 3: Return transfers */}
                                {isToOpen(fromStockPoint, toStockPoint) &&
                                  transfers.map((transfer) => {
                                    const isAdmin = userName === "ADMIN";
                                    const canEdit = transfer.status === 'pending';
                                    const barcode = getPacketBarcode(transfer);

                                    return (
                                      <tr key={transfer.return_id} className="transfer-row">
                                        <td className="ps-3"></td>
                                        <td className="transfer-details-cell">
                                          <div className="transfer-number">#{transfer.return_number}</div>
                                          {transfer.remarks && (
                                            <div className="transfer-remarks">{transfer.remarks}</div>
                                          )}
                                        </td>
                                        <td>{transfer.return_number}</td>
                                        <td>{formatDate(transfer.return_date)}</td>
                                        <td>{transfer.total_items}</td>
                                        <td>{transfer.total_quantity}</td>
                                        <td>{transfer.total_gross_weight}</td>
                                        <td>
                                          {barcode ? barcode : <span className="text-muted">N/A</span>}
                                        </td>
                                        <td>{getStatusBadge(transfer.status)}</td>
                                        <td>{renderCaptureThumb(transfer.capture_image, '32px')}</td>
                                        <td>
                                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                            <FaEye
                                              style={{ cursor: 'pointer', color: 'green', fontSize: '14px' }}
                                              onClick={() => handleViewDetails(transfer.return_id)}
                                              title="View Details"
                                            />
                                            {isAdmin && canEdit && (
                                              <FaEdit
                                                style={{ cursor: 'pointer', color: 'blue', fontSize: '14px' }}
                                                onClick={() => handleEdit(transfer)}
                                                title="Edit"
                                              />
                                            )}
                                            {isAdmin && (
                                              <FaTrash
                                                style={{ cursor: 'pointer', color: 'red', fontSize: '14px' }}
                                                onClick={() => handleDelete(transfer.return_id)}
                                                title="Delete"
                                              />
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </React.Fragment>
                            ))}
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

      {/* Modal for Return Details */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" className="m-auto">
        <Modal.Header closeButton>
          <Modal.Title>Return to Main Stock Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: '13px' }}>
          {transferDetails && (
            <>
              <h5>Return Information</h5>
              <Table bordered size="sm">
                <tbody>
                  <tr>
                    <td width="30%"><strong>Return Number</strong></td>
                    <td>{transferDetails.return_details.return_number}</td>
                  </tr>
                  <tr>
                    <td><strong>Return Date</strong></td>
                    <td>{formatDate(transferDetails.return_details.return_date)}</td>
                  </tr>
                  <tr>
                    <td><strong>From Stock Point</strong></td>
                    <td>{getStockPointName(transferDetails.return_details.from_user_id)}</td>
                  </tr>
                  <tr>
                    <td><strong>From User</strong></td>
                    <td>{transferDetails.return_details.from_user_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>To Stock Point</strong></td>
                    <td>{transferDetails.return_details.to_stock_point_name || 'MAIN STOCK ROOM'}</td>
                  </tr>
                  <tr>
                    <td><strong>Status</strong></td>
                    <td>{getStatusBadge(transferDetails.return_details.status)}</td>
                  </tr>
                  <tr>
                    <td><strong>Remarks</strong></td>
                    <td>{transferDetails.return_details.remarks || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Capture Image</strong></td>
                    <td>
                      {transferDetails.return_details.capture_image ? (
                        <img
                          src={getImageUrl(transferDetails.return_details.capture_image)}
                          alt="Capture"
                          style={{
                            maxWidth: '200px',
                            maxHeight: '200px',
                            objectFit: 'contain',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={() => window.open(getImageUrl(transferDetails.return_details.capture_image), '_blank')}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '<span style="color:#999">Invalid image</span>';
                          }}
                        />
                      ) : (
                        <span style={{ color: '#999' }}>No image available</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Created By</strong></td>
                    <td>{transferDetails.return_details.created_by || 'System'}</td>
                  </tr>
                  <tr>
                    <td><strong>Created At</strong></td>
                    <td>{formatDate(transferDetails.return_details.created_at)}</td>
                  </tr>
                </tbody>
              </Table>

              <h5>Returned Items</h5>
              <div className="table-responsive">
                <Table bordered size="sm">
                  <thead style={{ whiteSpace: 'nowrap', fontSize: '12px', backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th>SI</th>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>PCode/Barcode</th>
                      <th>Packet Barcode</th>
                      <th>Metal Type</th>
                      <th>Purity</th>
                      <th>Category</th>
                      <th>Sub Category</th>
                      <th>Design Name</th>
                      <th>Qty</th>
                      <th>Gross Wt</th>
                      <th>Packing Wt</th>
                    </tr>
                  </thead>
                  <tbody style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>
                    {transferDetails.return_items && transferDetails.return_items.length > 0 ? (
                      transferDetails.return_items.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            {item.image ? (
                              <img
                                src={getImageUrl(item.image)}
                                alt={item.product_name || 'Product'}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                                onClick={() => window.open(getImageUrl(item.image), '_blank')}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentNode.innerHTML = '<span style="color:#999">No img</span>';
                                }}
                              />
                            ) : (
                              <span style={{ color: '#999' }}>No img</span>
                            )}
                          </td>
                          <td>{item.product_name || 'N/A'}</td>
                          <td>{item.PCode_BarCode || 'N/A'}</td>
                          <td>{item.packet_barcode || 'N/A'}</td>
                          <td>{item.metal_type || 'N/A'}</td>
                          <td>{item.purity || 'N/A'}</td>
                          <td>{item.category || 'N/A'}</td>
                          <td>{item.sub_category || 'N/A'}</td>
                          <td>{item.design_name || 'N/A'}</td>
                          <td>{item.qty}</td>
                          <td>{item.gross_weight}</td>
                          <td>{parseFloat(item.packing_wt || 0) + parseFloat(item.gross_weight || 0)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="13" className="text-center">No items found</td>
                      </tr>
                    )}
                    {transferDetails.return_items && transferDetails.return_items.length > 0 && (
                      <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                        <td colSpan="10" className="text-end"><strong>Totals:</strong></td>
                        <td><strong>{transferDetails.return_items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0).toFixed(3)}</strong></td>
                        <td><strong>{transferDetails.return_items.reduce((sum, item) => sum + parseFloat(item.gross_weight || 0), 0).toFixed(3)}</strong></td>
                        <td>
                          <strong>
                            {transferDetails.return_items.reduce((sum, item) => {
                              const total = parseFloat(item.packing_wt || 0) + parseFloat(item.gross_weight || 0);
                              return sum + total;
                            }, 0).toFixed(3)}
                          </strong>
                        </td>
                      </tr>
                    )}
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

export default AdminReturnMainStockTable;