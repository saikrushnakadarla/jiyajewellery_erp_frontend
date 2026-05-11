
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Button, Modal, Row, Col } from 'react-bootstrap';
import './Supplier_Table.css';
import baseURL from '../../../../Url/NodeBaseURL';

const SupplierTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Sr. No.',
        Cell: ({ row }) => row.index + 1,
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


    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get/account-details`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        const suppliers = result
          .filter((item) => item.account_group === 'SUPPLIERS')
          .map((item) => ({
            ...item,
            birthday: formatDate(item.birthday),
            anniversary: formatDate(item.anniversary),
          }));
        setData(suppliers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        const response = await fetch(`${baseURL}/delete/account-details/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Supplier deleted successfully!');
          setData((prevData) => prevData.filter((supplier) => supplier.id !== id));
        } else {
          alert('Failed to delete supplier.');
        }
        fetchData();
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while deleting.');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/suppliermaster/${id}`);
  };

  const handleView = (supplier) => {
    setModalData(supplier);
    setShowModal(true);
  };

  const handleCreate = () => {
    navigate('/suppliermaster');
  };

  return (
    <div className="main-container">
      <div className="customers-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Suppliers</h3>
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

        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Supplier Details</Modal.Title>
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
    </div>
  );
};

export default SupplierTable;
