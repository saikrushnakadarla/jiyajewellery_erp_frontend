import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Row, Col, Modal, Table } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../../Url/NodeBaseURL';
import { AuthContext } from "../../../Pages/Login/Context";
import Swal from 'sweetalert2';

const ReturnMainStockTable = () => {
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

  // Get logged-in user ID from localStorage
  const getLoggedInUserId = () => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId) : null;
  };

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
        accessor: 'from_stock_point_name',
        Cell: ({ value }) => value || 'N/A',
      },
      // {
      //   Header: 'From User',
      //   accessor: 'from_user_name',
      //   Cell: ({ value }) => value || 'N/A',
      // },
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
        Header: 'Actions',
        id: 'actions',
        Cell: ({ row }) => {
          const isAdmin = userName === "ADMIN";
          const canEdit = row.original.status === 'pending';
          
          return (
            <div>
              <FaEye
                style={{ cursor: 'pointer', marginLeft: '10px', color: 'green' }}
                onClick={() => handleViewDetails(row.original.return_id)}
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
                  onClick={() => handleDelete(row.original.return_id)}
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
    navigate("/add-return-to-main-stock", { 
      state: { 
        tabId,
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
    const tabId = crypto.randomUUID();
    navigate("/add-return-to-main-stock", { state: { tabId } });
  };

  const fetchReturnTransfers = async () => {
    try {
      setLoading(true);
      // Use the RETURN TO MAIN STOCK API endpoint
      const response = await axios.get(`${baseURL}/api/return-to-main-stock/get-return-transfers`);
      console.log("Return Transfers Response: ", response.data);
      
      // Get logged-in user ID from localStorage
      const loggedInUserId = getLoggedInUserId();
      console.log("Logged in User ID from localStorage:", loggedInUserId);
      
      // Filter data where from_user_id matches the logged-in user
      let filteredTransfers = response.data;
      if (loggedInUserId) {
        filteredTransfers = response.data.filter(
          transfer => transfer.from_user_id === loggedInUserId
        );
        console.log("Filtered Transfers (from_user_id match):", filteredTransfers);
      }
      
      setData(filteredTransfers);
      setFilteredData(filteredTransfers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching return transfers:', error);
      setLoading(false);
    }
  };

  const handleViewDetails = async (returnId) => {
    try {
      // Use the RETURN TO MAIN STOCK API endpoint
      const response = await axios.get(`${baseURL}/api/return-to-main-stock/get-return-transfer/${returnId}`);
      console.log("Fetched return details: ", response.data);
      
      // Verify that the user has access to view this transfer
      const loggedInUserId = getLoggedInUserId();
      if (loggedInUserId) {
        const transfer = response.data.return_details;
        if (transfer.from_user_id !== loggedInUserId) {
          Swal.fire('Access Denied', 'You do not have permission to view this transfer', 'error');
          return;
        }
      }
      
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

  return (
    <div className="main-container">
      <div className="sales-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Return to Main Stock</h3>
            <Button
              className="create_but"
              onClick={handleCreate}
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
            >
              + Create
            </Button>
          </Col>
        </Row>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <DataTable columns={columns} data={[...data].reverse()} initialSearchValue={initialSearchValue} />
        )}
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="xl" className="m-auto">
        <Modal.Header closeButton>
          <Modal.Title>Return to Main Stock Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: '13px' }}>
          {transferDetails && (
            <>
              <h5>Return Information</h5>
              <Table bordered>
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
                    <td>{transferDetails.return_details.from_stock_point_name || 'N/A'}</td>
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
                <Table bordered>
                  <thead style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
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
                      <th>Stone Wt</th>
                      <th>Net Wt</th>
                      <th>Rate</th>
                      <th>MC</th>
                      <th>Stone Price</th>
                      <th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                    {transferDetails.return_items && transferDetails.return_items.length > 0 ? (
                      transferDetails.return_items.map((item, index) => (
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
                          <td>{item.stone_weight}</td>
                          <td>{item.net_weight}</td>
                          <td>{item.rate}</td>
                          <td>{item.making_charges}</td>
                          <td>{item.stone_price}</td>
                          <td><strong>{item.total_price}</strong></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="16" className="text-center">No items found</td>
                      </tr>
                    )}
                    {transferDetails.return_items && transferDetails.return_items.length > 0 && (
                      <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                        <td colSpan="8" className="text-end"><strong>Totals:</strong></td>
                        <td><strong>{transferDetails.return_items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0).toFixed(3)}</strong></td>
                        <td><strong>{transferDetails.return_items.reduce((sum, item) => sum + parseFloat(item.gross_weight || 0), 0).toFixed(3)}</strong></td>
                        <td><strong>{transferDetails.return_items.reduce((sum, item) => sum + parseFloat(item.stone_weight || 0), 0).toFixed(3)}</strong></td>
                        <td><strong>{transferDetails.return_items.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)}</strong></td>
                        <td colSpan="2"></td>
                        <td></td>
                        <td><strong>{transferDetails.return_items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0).toFixed(2)}</strong></td>
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

export default ReturnMainStockTable;