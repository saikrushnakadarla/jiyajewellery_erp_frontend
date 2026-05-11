

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout'; // Import the reusable DataTable component
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Button, Row, Col, Modal } from 'react-bootstrap';
import './Customers_Table.css';

import baseURL from '../../../../Url/NodeBaseURL';

const RepairsTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // State to store table data
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [modalData, setModalData] = useState(null); // State to store data for the modal
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  const columns = React.useMemo(
    () => [
      {
        Header: 'Sr. No.',
        Cell: ({ row }) => row.index + 1, // Generate a sequential number based on the row index
      },
      {
        Header: 'Trade Name',
        accessor: 'account_name',
      },
      {
        Header: 'Print Name',
        accessor: 'print_name',
      },
      {
        Header: 'Mobile',
        accessor: 'mobile',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: "Image",
        accessor: "images",
        Cell: ({ value }) =>
          value && value.length > 0 ? (
            <img
              src={`${baseURL}/uploads/${value[0].filename}`}
              alt="customerImage"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "5px",
                objectFit: "cover",
                cursor: "pointer",
              }}
            // onClick={() => handleImageClick(`http://localhost:5000/uploads/${value[0].filename}`)}
            />
          ) : (
            "No Image"
          ),
      },

      {
        Header: 'Action',
        Cell: ({ row }) => (
          <div >
            <FaEye
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'green' }}
              onClick={() => handleView(row.original)}
            />
            <FaEdit
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue', }}
              onClick={() => handleEdit(row.original.account_id)}
            />
            <FaTrash
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'red', }}
              onClick={() => handleDelete(row.original.account_id)}
            />
          </div>
        ),
      },
    ],
    []
  );

  // Utility function to format date to dd/mm/yyyy
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fetch data and filter where account_group = "CUSTOMERS"
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get/account-details`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();

        // Filter only customers and format dates
        const customers = result
          .filter((item) => item.account_group === 'CUSTOMERS')
          .map((item) => ({
            ...item,
            birthday: formatDate(item.birthday),
            anniversary: formatDate(item.anniversary),
          }));

        setData(customers);
        console.log("customer", customers)
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Delete a customer
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetch(`${baseURL}/delete/account-details/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Customer deleted successfully!');
          setData((prevData) => prevData.filter((customer) => customer.account_id !== id));
        } else {
          console.error('Failed to delete customer');
          alert('Failed to delete customer.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while deleting.');
      }
    }
  };

  // Navigate to edit form
  const handleEdit = (id) => {
    navigate(`/customermaster/${id}`);
  };

  const handleCreate = () => {
    navigate('/customermaster'); // Navigate to the /customermaster page
  };

  const handleView = (rowData) => {
    setModalData(rowData);
    setShowModal(true);
  };

  return (
    <div className="main-container">
      <div className="customers-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Customers</h3>
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
          <div>Loading...</div>
        ) : (
          <DataTable columns={columns} data={[...data].reverse()} />
        )}
      </div>

      {/* Modal for displaying full data */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Customer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData && (
            <div className="modal-content-grid">
              <Row>
                <Col md={6}><strong>Trade Name:</strong> {modalData.account_name}</Col>
                <Col md={6}><strong>Print Name:</strong> {modalData.print_name}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Religion:</strong> {modalData.religion}</Col>
                <Col md={6}><strong>Account Group:</strong> {modalData.account_group}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Address:</strong> {modalData.address1}</Col>
                <Col md={6}><strong>Pincode:</strong> {modalData.pincode}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>State:</strong> {modalData.state}</Col>
                <Col md={6}><strong>State Code:</strong> {modalData.state_code}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Phone:</strong> {modalData.phone}</Col>
                <Col md={6}><strong>Mobile:</strong> {modalData.mobile}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Email:</strong> {modalData.email}</Col>
                <Col md={6}><strong>Birthday:</strong> {modalData.birthday}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Anniversary:</strong> {modalData.anniversary}</Col>
                <Col md={6}><strong>Bank Account No:</strong> {modalData.bank_account_no}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Bank Name:</strong> {modalData.bank_name}</Col>
                <Col md={6}><strong>IFSC Code:</strong> {modalData.ifsc_code}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Branch:</strong> {modalData.branch}</Col>
                <Col md={6}><strong>GSTIN:</strong> {modalData.gst_in}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Aadhar Card:</strong> {modalData.aadhar_card}</Col>
                <Col md={6}><strong>PAN Card:</strong> {modalData.pan_card}</Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RepairsTable;
