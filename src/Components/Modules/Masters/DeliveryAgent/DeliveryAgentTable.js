// DeliveryAgentTable.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Button, Row, Col, Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import './DeliveryAgent.css';
import baseURL from '../../../../Url/NodeBaseURL';

const formatDate = (value) => {
  if (!value) return 'N/A';
  const [y, m, d] = String(value).slice(0, 10).split('-');
  return y && m && d ? `${d}/${m}/${y}` : 'N/A';
};

const DeliveryAgentTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const columns = React.useMemo(
    () => [
      { Header: 'Sr. No.', Cell: ({ row }) => row.index + 1 },
      { Header: 'Agent Code', accessor: 'agent_code' },
      { Header: 'Agent Name', accessor: 'full_name' },
      { Header: 'Mobile', accessor: 'mobile_number' },
      { Header: 'Employee Type', accessor: 'employee_type' },
      {
        Header: 'Joining Date',
        accessor: 'joining_date',
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: 'Photo',
        accessor: 'profile_photo',
        Cell: ({ value }) =>
          value ? (
            <img
              src={`${baseURL}${value}`}
              alt="Agent"
              className="da-thumb"
              onClick={() => handleImageClick(`${baseURL}${value}`)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = 'No Image';
              }}
            />
          ) : (
            'No Image'
          ),
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => (
          <span className={`da-status ${value === 'Active' ? 'da-status-active' : 'da-status-inactive'}`}>
            {value}
          </span>
        ),
      },
      {
        Header: 'Action',
        Cell: ({ row }) => (
          <div>
            <FaEye
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'green' }}
              onClick={() => handleView(row.original)}
            />
            <FaEdit
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue' }}
              onClick={() => handleEdit(row.original.id)}
            />
            <FaTrash
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
              onClick={() => handleDelete(row.original.id)}
            />
          </div>
        ),
      },
    ],
    []
  );

  const handleImageClick = (url) => {
    setSelectedImage(url);
    setShowImageModal(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get/delivery-agents`);
        if (!response.ok) throw new Error('Failed to fetch data');
        setData(await response.json());
      } catch (error) {
        console.error('Error fetching delivery agents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Delete this delivery agent?',
      text: 'If the agent has delivery history, mark them Inactive instead.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#a36e29',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete',
    });
    if (!confirm.isConfirmed) return;

    try {
      const response = await fetch(`${baseURL}/delete/delivery-agents/${id}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        setData((prev) => prev.filter((a) => a.id !== id));
        Swal.fire({ icon: 'success', title: 'Deleted', text: 'Delivery agent deleted successfully.', confirmButtonColor: '#a36e29' });
      } else {
        Swal.fire({ icon: 'error', title: 'Cannot delete', text: result.message || 'Failed to delete delivery agent.', confirmButtonColor: '#a36e29' });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'An error occurred while deleting.', confirmButtonColor: '#a36e29' });
    }
  };

  const handleEdit = (id) => navigate(`/deliveryagentmaster/${id}`);
  const handleCreate = () => navigate('/deliveryagentmaster');
  const handleView = (row) => {
    setModalData(row);
    setShowModal(true);
  };

  return (
    <div className="main-container">
      <div className="da-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Delivery Agents</h3>
            <Button
              className="create_but"
              onClick={handleCreate}
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
            >
              + Create
            </Button>
          </Col>
        </Row>
        {loading ? <div>Loading...</div> : <DataTable columns={columns} data={data} />}
      </div>

      {/* Details modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Delivery Agent Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData && (
            <div className="modal-content-grid">
              <Row>
                <Col md={6}><strong>Agent Code:</strong> {modalData.agent_code}</Col>
                <Col md={6}><strong>Agent Name:</strong> {modalData.full_name}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Mobile:</strong> {modalData.mobile_number}</Col>
                <Col md={6}><strong>Alternate No.:</strong> {modalData.alternate_number || 'N/A'}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Email:</strong> {modalData.email || 'N/A'}</Col>
                <Col md={6}><strong>Status:</strong> {modalData.status}</Col>
              </Row>
              <Row>
                <Col md={12}><strong>Address:</strong> {modalData.address || 'N/A'}</Col>
              </Row>
              <Row>
                <Col md={4}><strong>City:</strong> {modalData.city || 'N/A'}</Col>
                <Col md={4}><strong>State:</strong> {modalData.state || 'N/A'}</Col>
                <Col md={4}><strong>Pincode:</strong> {modalData.pincode || 'N/A'}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Employee Type:</strong> {modalData.employee_type}</Col>
                <Col md={6}><strong>Joining Date:</strong> {formatDate(modalData.joining_date)}</Col>
              </Row>
              <Row>
                <Col md={12}>
                  <strong>ID Proof:</strong>{' '}
                  {modalData.id_proof_type ? `${modalData.id_proof_type} - ${modalData.id_proof_number || 'N/A'}` : 'N/A'}
                </Col>
              </Row>
              <Row>
                <Col md={6}><strong>Emergency Contact:</strong> {modalData.emergency_contact_name || 'N/A'}</Col>
                <Col md={6}><strong>Emergency No.:</strong> {modalData.emergency_contact_number || 'N/A'}</Col>
              </Row>
              {modalData.profile_photo && (
                <Row>
                  <Col md={12}>
                    <strong>Profile Photo:</strong>
                    <img
                      src={`${baseURL}${modalData.profile_photo}`}
                      alt="Agent"
                      style={{ width: '150px', height: '150px', borderRadius: '5px', objectFit: 'cover', marginTop: '10px', cursor: 'pointer' }}
                      onClick={() => handleImageClick(`${baseURL}${modalData.profile_photo}`)}
                      onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    />
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Image preview modal */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
              onError={(e) => { e.target.onerror = null; e.target.alt = 'Image failed to load'; }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DeliveryAgentTable;