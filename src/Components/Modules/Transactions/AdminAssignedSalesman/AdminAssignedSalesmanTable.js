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
  FaUserTie,
} from 'react-icons/fa';
import { Button, Row, Col, Modal, Table, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../../Url/NodeBaseURL';
import { AuthContext } from "../../../Pages/Login/Context";
import Swal from 'sweetalert2';

const AdminAssignedSalesmanTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [transferDetails, setTransferDetails] = useState(null);
  const { authToken, userId, userName, role } = useContext(AuthContext);
  const { mobile } = location.state || {};
  const initialSearchValue = location.state?.mobile || '';

  // Hierarchical view state
  const [viewMode, setViewMode] = useState('hierarchical');
  const [expandedStockPoints, setExpandedStockPoints] = useState({});
  const [expandedSalesmen, setExpandedSalesmen] = useState({});
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

  const getSalesmanStatusBadge = (status) => {
    const statusColors = {
      'pending': { color: '#ffc107', text: 'Pending' },
      'accepted': { color: '#28a745', text: 'Accepted' },
      'rejected': { color: '#dc3545', text: 'Rejected' },
      'completed': { color: '#17a2b8', text: 'Completed' }
    };
    const statusInfo = statusColors[status] || { color: '#6c757d', text: status || 'N/A' };
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

  // ---------- Search filter (used by hierarchical view) ----------
  const filteredData = useMemo(() => {
    const term = (searchText || '').toString().trim().toLowerCase();
    if (!term) return data;
    return data.filter((t) =>
      [
        t.assigned_number,
        t.from_stock_point_name,
        t.to_salesman_name,
        t.salesman_mobile,
        t.salesman_status,
      ]
        .filter(Boolean)
        .some((v) => v.toString().toLowerCase().includes(term))
    );
  }, [data, searchText]);

  // ---------- Group: From Stock Point -> To Salesman -> Transfers ----------
  const hierarchicalData = useMemo(() => {
    const grouped = {};
    filteredData.forEach((transfer) => {
      const fromStockPoint = transfer.from_stock_point_name || 'Unknown Stock Point';
      const toSalesman = transfer.to_salesman_name || 'Unknown Salesman';

      if (!grouped[fromStockPoint]) {
        grouped[fromStockPoint] = {
          totalTransfers: 0,
          salesmen: {},
        };
      }
      if (!grouped[fromStockPoint].salesmen[toSalesman]) {
        grouped[fromStockPoint].salesmen[toSalesman] = {
          mobile: transfer.salesman_mobile || '',
          transfers: [],
        };
      }
      grouped[fromStockPoint].salesmen[toSalesman].transfers.push(transfer);
      grouped[fromStockPoint].totalTransfers++;
    });
    return grouped;
  }, [filteredData]);

  // When a search is active, expand everything so matches are visible
  const isSearching = (searchText || '').toString().trim() !== '';

  const isStockPointOpen = (fromStockPoint) =>
    isSearching || !!expandedStockPoints[fromStockPoint];

  const isSalesmanOpen = (fromStockPoint, salesman) =>
    isSearching || !!expandedSalesmen[`${fromStockPoint}-${salesman}`];

  const toggleStockPoint = (fromStockPoint) => {
    setExpandedStockPoints((prev) => ({
      ...prev,
      [fromStockPoint]: !prev[fromStockPoint],
    }));
  };

  const toggleSalesman = (fromStockPoint, salesman) => {
    const key = `${fromStockPoint}-${salesman}`;
    setExpandedSalesmen((prev) => ({
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
        Header: 'Assigned No',
        accessor: 'assigned_number',
      },
      {
        Header: 'Assigned Date',
        accessor: 'transfer_date',
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: 'From Stock Point',
        accessor: 'from_stock_point_name',
        Cell: ({ value }) => value || 'N/A',
      },
      {
        Header: 'To Salesman',
        accessor: 'to_salesman_name',
        Cell: ({ value }) => value || 'N/A',
      },
      {
        Header: 'Salesman Mobile',
        accessor: 'salesman_mobile',
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
      {
        Header: 'Total Net Wt',
        accessor: 'total_net_weight',
      },
      {
        Header: 'Salesman Status',
        accessor: 'salesman_status',
        Cell: ({ value }) => getSalesmanStatusBadge(value),
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
                onClick={() => handleViewDetails(row.original.assigned_id)}
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
                  onClick={() => handleDelete(row.original.assigned_id)}
                  title="Delete"
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
    navigate("/add-assign-salesmantransfer", {
      state: {
        editData: transfer,
        isEdit: true
      }
    });
  };

  const handleDelete = async (assignedId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete this assigned transfer?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${baseURL}/api/assigned-salesman/delete-assigned-transfer/${assignedId}`);
          if (response.status === 200) {
            Swal.fire('Deleted!', response.data.message, 'success');
            fetchAssignedTransfers();
          }
        } catch (error) {
          console.error('Error deleting assigned transfer:', error);
          Swal.fire('Error!', 'Failed to delete assigned transfer. Please try again.', 'error');
        }
      }
    });
  };

  const handleCreate = () => {
    navigate('/add-assign-salesmantransfer');
  };

  const fetchAssignedTransfers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/api/assigned-salesman/get-assigned-transfers`);
      console.log("Assigned Transfers Response: ", response.data);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assigned transfers:', error);
      setLoading(false);
    }
  };

  const handleViewDetails = async (assigned_id) => {
    try {
      const response = await axios.get(`${baseURL}/api/assigned-salesman/get-assigned-transfer/${assigned_id}`);
      console.log("Fetched assigned details: ", response.data);
      setTransferDetails(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching assigned details:", error);
      Swal.fire('Error', 'Failed to fetch assigned details', 'error');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTransferDetails(null);
  };

  useEffect(() => {
    fetchAssignedTransfers();
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
              <h3>Assigned to Salesman</h3>
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
              + Create Assign
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
                .to-salesman-row {
                  background-color: #fff8f0 !important;
                }
                .to-salesman-row td {
                  padding: 6px 10px !important;
                }
                .to-salesman-row:hover {
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
                .to-salesman-icon {
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
                .salesman-mobile {
                  font-size: 11px;
                  color: #666;
                  margin-left: 8px;
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

            {/* <div className="mb-2">
              <input
                type="text"
                className="form-control form-control-sm hierarchical-search"
                placeholder="Search assigned no, salesman, mobile..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div> */}

            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '30px' }}></th>
                    <th style={{ minWidth: '180px', textAlign: 'left' }}>Stock Point / Assigned Details</th>
                    <th style={{ width: '100px' }}>Assigned No</th>
                    <th style={{ width: '90px' }}>Date</th>
                    <th style={{ width: '60px' }}>Items</th>
                    <th style={{ width: '60px' }}>Qty</th>
                    <th style={{ width: '90px' }}>Gross Wt</th>
                    <th style={{ width: '90px' }}>Net Wt</th>
                    <th style={{ width: '110px' }}>Status</th>
                    <th style={{ width: '90px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(hierarchicalData).length === 0 && (
                    <tr>
                      <td colSpan="10" className="text-center text-muted" style={{ padding: '20px' }}>
                        No assigned transfers found
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
                              onClick={() => toggleStockPoint(fromStockPoint)}
                            >
                              {isStockPointOpen(fromStockPoint) ? <FaChevronDown /> : <FaChevronRight />}
                            </button>
                          </td>
                          <td colSpan="9" style={{ textAlign: 'left' }}>
                            <div className="d-flex align-items-center">
                              <FaWarehouse className="location-icon from-stock-icon" />
                              <strong>{fromStockPoint}</strong>
                              <Badge bg="primary" className="ms-2 badge-transfer-count">
                                {fromData.totalTransfers} Transfer(s)
                              </Badge>
                            </div>
                          </td>
                        </tr>

                        {isStockPointOpen(fromStockPoint) &&
                          Object.entries(fromData.salesmen)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([salesman, salesmanData]) => (
                              <React.Fragment key={`${fromStockPoint}-${salesman}`}>
                                {/* Level 2: To Salesman */}
                                <tr className="to-salesman-row">
                                  <td>
                                    <button
                                      className="expand-btn"
                                      onClick={() => toggleSalesman(fromStockPoint, salesman)}
                                    >
                                      {isSalesmanOpen(fromStockPoint, salesman) ? <FaChevronDown /> : <FaChevronRight />}
                                    </button>
                                  </td>
                                  <td colSpan="9" style={{ textAlign: 'left' }}>
                                    <div className="d-flex align-items-center">
                                      <FaUserTie className="location-icon to-salesman-icon" />
                                      <strong>→ {salesman}</strong>
                                      {salesmanData.mobile && (
                                        <span className="salesman-mobile">({salesmanData.mobile})</span>
                                      )}
                                      <Badge bg="success" className="ms-2 badge-transfer-count">
                                        {salesmanData.transfers.length} Transfer(s)
                                      </Badge>
                                    </div>
                                  </td>
                                </tr>

                                {/* Level 3: Assigned transfers */}
                                {isSalesmanOpen(fromStockPoint, salesman) &&
                                  salesmanData.transfers.map((transfer) => {
                                    const isAdmin = userName === "ADMIN";
                                    const canEdit = transfer.status === 'pending';

                                    return (
                                      <tr key={transfer.assigned_id} className="transfer-row">
                                        <td className="ps-3"></td>
                                        <td className="transfer-details-cell">
                                          <div className="transfer-number">#{transfer.assigned_number}</div>
                                          {transfer.remarks && (
                                            <div className="transfer-remarks">{transfer.remarks}</div>
                                          )}
                                        </td>
                                        <td>{transfer.assigned_number}</td>
                                        <td>{formatDate(transfer.transfer_date)}</td>
                                        <td>{transfer.total_items}</td>
                                        <td>{transfer.total_quantity}</td>
                                        <td>{transfer.total_gross_weight}</td>
                                        <td>{transfer.total_net_weight}</td>
                                        <td>{getSalesmanStatusBadge(transfer.salesman_status)}</td>
                                        <td>
                                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                            <FaEye
                                              style={{ cursor: 'pointer', color: 'green', fontSize: '14px' }}
                                              onClick={() => handleViewDetails(transfer.assigned_id)}
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
                                                onClick={() => handleDelete(transfer.assigned_id)}
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

      {/* Modal for Assigned Details */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" className="m-auto">
        <Modal.Header closeButton>
          <Modal.Title>Assigned Salesman Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: '13px' }}>
          {transferDetails && (
            <>
              <h5>Assigned Information</h5>
              <Table bordered size="sm">
                <tbody>
                  <tr>
                    <td width="30%"><strong>Assigned Number</strong></td>
                    <td>{transferDetails.transfer_details.assigned_number}</td>
                  </tr>
                  <tr>
                    <td><strong>Assigned Date</strong></td>
                    <td>{formatDate(transferDetails.transfer_details.transfer_date)}</td>
                  </tr>
                  <tr>
                    <td><strong>From Stock Point</strong></td>
                    <td>{transferDetails.transfer_details.from_stock_point_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>To Salesman</strong></td>
                    <td>{transferDetails.transfer_details.to_salesman_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Salesman Mobile</strong></td>
                    <td>{transferDetails.transfer_details.salesman_mobile || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Salesman Status</strong></td>
                    <td>{getSalesmanStatusBadge(transferDetails.transfer_details.salesman_status)}</td>
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

              {/* Assigned Items only when salesman_status is "accepted" */}
              {transferDetails.transfer_details.salesman_status === "accepted" && (
                <>
                  <h5>Assigned Items</h5>
                  <div className="table-responsive">
                    <Table bordered size="sm">
                      <thead style={{ whiteSpace: 'nowrap', fontSize: '12px', backgroundColor: '#f8f9fa' }}>
                        <tr>
                          <th>SI</th>
                          <th>Product Name</th>
                          <th>PCode/Barcode</th>
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
                        {transferDetails.transfer_items && transferDetails.transfer_items.length > 0 ? (
                          transferDetails.transfer_items.map((item, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{item.product_name || 'N/A'}</td>
                              <td>{item.PCode_BarCode || 'N/A'}</td>
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
                            <td colSpan="11" className="text-center">No items found</td>
                          </tr>
                        )}
                        {transferDetails.transfer_items && transferDetails.transfer_items.length > 0 && (
                          <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                            <td colSpan="8" className="text-end"><strong>Totals:</strong></td>
                            <td><strong>{transferDetails.transfer_items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0).toFixed(3)}</strong></td>
                            <td><strong>{transferDetails.transfer_items.reduce((sum, item) => sum + parseFloat(item.gross_weight || 0), 0).toFixed(3)}</strong></td>
                            <td>
                              <strong>
                                {(transferDetails.transfer_items || []).reduce((sum, item) => {
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

              {transferDetails.transfer_details.salesman_status === "pending" && (
                <div className="text-center text-muted" style={{ padding: '20px' }}>
                  <p><strong>Note:</strong> Items are hidden because the salesman has not accepted this transfer yet.</p>
                </div>
              )}
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

export default AdminAssignedSalesmanTable;