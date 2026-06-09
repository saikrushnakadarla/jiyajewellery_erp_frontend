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
  const [selectedItem, setSelectedItem] = useState(null);
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${date.getFullYear()}`;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Available': { color: '#17a2b8', text: 'Available' },
      'Selected': { color: '#28a745', text: 'Selected' },
      'Assigned': { color: '#ffc107', text: 'Assigned' },
      'Sold': { color: '#dc3545', text: 'Sold' }
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
        Header: 'PCode/Barcode',
        accessor: 'PCode_BarCode',
      },
      {
        Header: 'Product Name',
        accessor: 'product_Name',
        Cell: ({ value }) => value || 'N/A',
      },
      {
        Header: 'Design Master',
        accessor: 'design_master',
        Cell: ({ value }) => value || 'N/A',
      },
      {
        Header: 'Category',
        accessor: 'category',
      },
      {
        Header: 'Sub Category',
        accessor: 'sub_category',
      },
      {
        Header: 'Metal Type',
        accessor: 'metal_type',
      },
      {
        Header: 'Purity',
        accessor: 'Purity',
      },
      {
        Header: 'Gross Weight',
        accessor: 'Gross_Weight',
      },
      {
        Header: 'Stone Weight',
        accessor: 'Stones_Weight',
      },
      {
        Header: 'Net Weight',
        accessor: 'Weight_BW',
      },
      {
        Header: 'Total Weight (AW)',
        accessor: 'TotalWeight_AW',
      },
      {
        Header: 'Rate',
        accessor: 'rate',
      },
      {
        Header: 'Making Charges',
        accessor: 'Making_Charges',
      },
      {
        Header: 'Stone Price',
        accessor: 'Stones_Price',
      },
      {
        Header: 'Total Price',
        accessor: 'total_price',
      },
      {
        Header: 'Status',
        accessor: 'Status',
        Cell: ({ value }) => getStatusBadge(value),
      },
      {
        Header: 'Stock Point',
        accessor: 'Stock_Point',
      },
      {
        Header: 'Source',
        accessor: 'Source',
      },
      {
        Header: 'Actions',
        id: 'actions',
        Cell: ({ row }) => {
          const isAdmin = userName === "ADMIN";
          
          return (
            <div>
              <FaEye
                style={{ cursor: 'pointer', marginLeft: '10px', color: 'green' }}
                onClick={() => handleViewDetails(row.original)}
              />
              {isAdmin && (
                <FaEdit
                  style={{
                    cursor: 'pointer',
                    marginLeft: '10px',
                    color: 'blue',
                  }}
                  onClick={() => handleEdit(row.original)}
                />
              )}
              <FaTrash
                style={{
                  cursor: 'pointer',
                  marginLeft: '10px',
                  color: 'red',
                }}
                onClick={() => handleDelete(row.original.opentag_id)}
              />
            </div>
          );
        },
      },
    ],
    [userName]
  );

  const handleEdit = (item) => {
    const tabId = crypto.randomUUID();
    navigate("/add-return-to-main-stock", { 
      state: { 
        tabId,
        editData: item,
        isEdit: true 
      } 
    });
  };

  const handleDelete = async (opentagId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete this item?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Update the API endpoint as per your backend
          const response = await axios.delete(`${baseURL}/api/opening-tags/delete/${opentagId}`);
          if (response.status === 200) {
            Swal.fire('Deleted!', response.data.message, 'success');
            fetchOpeningTags();
          }
        } catch (error) {
          console.error('Error deleting item:', error);
          Swal.fire('Error!', 'Failed to delete item. Please try again.', 'error');
        }
      }
    });
  };

  const handleCreate = () => {
    const tabId = crypto.randomUUID();
    navigate("/add-return-to-main-stock", { state: { tabId } });
  };

  const fetchOpeningTags = async () => {
    try {
      setLoading(true);
      // Fetch data from the opening-tags-entry API
      const response = await axios.get('http://localhost:5001/get/opening-tags-entry');
      console.log("Opening Tags Response: ", response.data);
      
      // Filter data based on Status === "Selected" and Stock_Point === "MAIN STOCK ROOM"
      let filteredItems = [];
      if (response.data.result && Array.isArray(response.data.result)) {
        filteredItems = response.data.result.filter(
          item => item.Status === "Selected" && item.Stock_Point === "MAIN STOCK ROOM"
        );
        console.log("Filtered Items (Selected & MAIN STOCK ROOM):", filteredItems);
      }
      
      setData(filteredItems);
      setFilteredData(filteredItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching opening tags:', error);
      setLoading(false);
      Swal.fire('Error!', 'Failed to fetch data from server.', 'error');
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  useEffect(() => {
    fetchOpeningTags();
  }, []);

  return (
    <div className="main-container">
      <div className="sales-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Return to Main Stock - Selected Items</h3>
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
          <Modal.Title>Item Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: '13px' }}>
          {selectedItem && (
            <>
              <h5>Product Information</h5>
              <Table bordered>
                <tbody>
                  <tr>
                    <td width="30%"><strong>PCode/Barcode</strong></td>
                    <td>{selectedItem.PCode_BarCode}</td>
                  </tr>
                  <tr>
                    <td><strong>Product Name</strong></td>
                    <td>{selectedItem.product_Name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Design Master</strong></td>
                    <td>{selectedItem.design_master || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Category</strong></td>
                    <td>{selectedItem.category}</td>
                  </tr>
                  <tr>
                    <td><strong>Sub Category</strong></td>
                    <td>{selectedItem.sub_category}</td>
                  </tr>
                  <tr>
                    <td><strong>Metal Type</strong></td>
                    <td>{selectedItem.metal_type}</td>
                  </tr>
                  <tr>
                    <td><strong>Purity</strong></td>
                    <td>{selectedItem.Purity}</td>
                  </tr>
                  <tr>
                    <td><strong>Status</strong></td>
                    <td>{getStatusBadge(selectedItem.Status)}</td>
                  </tr>
                  <tr>
                    <td><strong>Stock Point</strong></td>
                    <td>{selectedItem.Stock_Point}</td>
                  </tr>
                  <tr>
                    <td><strong>Source</strong></td>
                    <td>{selectedItem.Source}</td>
                  </tr>
                  <tr>
                    <td><strong>Account Name</strong></td>
                    <td>{selectedItem.account_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Invoice</strong></td>
                    <td>{selectedItem.invoice || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Date</strong></td>
                    <td>{formatDate(selectedItem.date)}</td>
                  </tr>
                </tbody>
              </Table>

              <h5>Weight & Pricing Details</h5>
              <Table bordered>
                <tbody>
                  <tr>
                    <td width="30%"><strong>Gross Weight</strong></td>
                    <td>{selectedItem.Gross_Weight} g</td>
                  </tr>
                  <tr>
                    <td><strong>Stone Weight</strong></td>
                    <td>{selectedItem.Stones_Weight} g</td>
                  </tr>
                  <tr>
                    <td><strong>Net Weight (BW)</strong></td>
                    <td>{selectedItem.Weight_BW} g</td>
                  </tr>
                  <tr>
                    <td><strong>Wastage %</strong></td>
                    <td>{selectedItem.Wastage_Percentage}%</td>
                  </tr>
                  <tr>
                    <td><strong>Wastage Weight</strong></td>
                    <td>{selectedItem.WastageWeight} g</td>
                  </tr>
                  <tr>
                    <td><strong>Total Weight (AW)</strong></td>
                    <td>{selectedItem.TotalWeight_AW} g</td>
                  </tr>
                  <tr>
                    <td><strong>MC Per Gram</strong></td>
                    <td>{selectedItem.MC_Per_Gram}</td>
                  </tr>
                  <tr>
                    <td><strong>Making Charges</strong></td>
                    <td>₹{selectedItem.Making_Charges}</td>
                  </tr>
                  <tr>
                    <td><strong>Rate</strong></td>
                    <td>₹{selectedItem.rate}</td>
                  </tr>
                  <tr>
                    <td><strong>Stone Price</strong></td>
                    <td>₹{selectedItem.Stones_Price}</td>
                  </tr>
                  <tr>
                    <td><strong>Tax</strong></td>
                    <td>{selectedItem.tax}</td>
                  </tr>
                  <tr>
                    <td><strong>Tax Amount</strong></td>
                    <td>₹{selectedItem.tax_amt}</td>
                  </tr>
                  <tr>
                    <td><strong>Total Price</strong></td>
                    <td><strong>₹{selectedItem.total_price}</strong></td>
                  </tr>
                  <tr>
                    <td><strong>Pieces</strong></td>
                    <td>{selectedItem.pcs}</td>
                  </tr>
                </tbody>
              </Table>
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