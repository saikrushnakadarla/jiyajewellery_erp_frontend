import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import DataTable from '../../../Pages/InputField/TableLayout'; // Import the reusable DataTable component
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Button, Row, Col, Modal } from 'react-bootstrap'; 
import './AccountsTable.css';

import baseURL from '../../../../Url/NodeBaseURL';

const AccountsTable = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const [data, setData] = useState([]); // State to store accounts data
  const [loading, setLoading] = useState(true); // State to manage loading
  const [showModal, setShowModal] = useState(false); // State to manage modal visibility
  const [modalData, setModalData] = useState(null); // State to store data for the modal

  // Fetch accounts data from the API
  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${baseURL}/get/account-details`);
      if (!response.ok) {
        throw new Error('Failed to fetch accounts data');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching accounts data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts(); // Initial fetch when the component mounts
  }, []);

  const handleEdit = (id) => {
    navigate(`/accounts/${id}`); // Navigate to the edit form with account ID
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        const response = await fetch(`${baseURL}/delete/account-details/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error deleting account: ${errorText}`);
        }
        alert('Account deleted successfully!');
        // Refetch data after deletion
        fetchAccounts();
      } catch (err) {
        console.error('Error deleting account:', err.message);
        alert(`Error: ${err.message}`);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return ''; // Return an empty string if no date is provided

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0'); // Pad single digit days with 0
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Pad months with 0
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const handleView = (rowData) => {
    setModalData(rowData); // Set the data for the modal
    setShowModal(true); // Open the modal
  };

  const columns = React.useMemo(
    () => [
      { Header: 'Sr. No.', Cell: ({ row }) => row.index + 1 },
      { Header: 'Account Name', accessor: 'account_name', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Print Name', accessor: 'print_name', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Group', accessor: 'account_group', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Mobile', accessor: 'mobile', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Contact Person', accessor: 'contact_person', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Email', accessor: 'email', Cell: ({ value }) => value || 'N/A' },
      {
        Header: 'Action',
        Cell: ({ row }) => (
          <div className="d-flex align-items-center">
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

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleCreate = () => {
    navigate('/accounts'); // Navigate to the /repairs page
  };

  return (
    <div className="main-container">
      <div className="accounts-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Accounts</h3>
            <Button
              className="create_but"
              onClick={handleCreate}
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
            >
              + Create
            </Button>
          </Col>
        </Row>
        <DataTable columns={columns} data={[...data].reverse()} />

        {/* Modal for viewing full data */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Account Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalData && (
              <div className="modal-content-grid">
                <Row>
                  <Col md={6}><strong>Trade Name:</strong> {modalData.account_name}</Col>
                  <Col md={6}><strong>Print Name:</strong> {modalData.print_name}</Col>
                </Row>
                <Row>
                  <Col md={6}><strong>Account Group:</strong> {modalData.account_group}</Col>
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
                  <Col md={6}><strong>Birthday:</strong> {formatDate(modalData.birthday)}</Col>
                </Row>
                <Row>
                  <Col md={6}><strong>Anniversary:</strong> {formatDate(modalData.anniversary)}</Col>
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
    </div>
  );
};

export default AccountsTable;
