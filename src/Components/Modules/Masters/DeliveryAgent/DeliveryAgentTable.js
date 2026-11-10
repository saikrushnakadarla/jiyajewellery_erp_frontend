// DeliveryAgentTable.js  (Logistic Partner Table)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Button, Row, Col, Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import './DeliveryAgent.css';
import baseURL from '../../../../Url/NodeBaseURL';

const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  const n = Number(value);
  return Number.isNaN(n) ? 'N/A' : `₹${n.toLocaleString('en-IN')}`;
};

const formatList = (value) => (value ? value.split(',').join(', ') : 'N/A');

const DeliveryAgentTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleImageClick = (url) => {
    setSelectedImage(url);
    setShowImageModal(true);
  };

  const handleEdit = (id) => navigate(`/deliveryagentmaster/${id}`);
  const handleCreate = () => navigate('/deliveryagentmaster');
  const handleView = (row) => {
    setModalData(row);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Delete this logistic partner?',
      text: 'If the partner has shipment history, mark it Inactive instead.',
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
        Swal.fire({ icon: 'success', title: 'Deleted', text: 'Logistic partner deleted successfully.', confirmButtonColor: '#a36e29' });
      } else {
        Swal.fire({ icon: 'error', title: 'Cannot delete', text: result.message || 'Failed to delete logistic partner.', confirmButtonColor: '#a36e29' });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'An error occurred while deleting.', confirmButtonColor: '#a36e29' });
    }
  };

  const columns = React.useMemo(
    () => [
      { Header: 'Sr. No.', Cell: ({ row }) => row.index + 1 },
      { Header: 'Partner Code', accessor: 'agent_code' },
      { Header: 'Partner Name', accessor: 'full_name' },
      { Header: 'Type', accessor: 'partner_type', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Contact Person', accessor: 'contact_person', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Mobile', accessor: 'mobile_number' },
      { Header: 'City', accessor: 'city', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Service Type', accessor: 'service_type', Cell: ({ value }) => formatList(value) },
      {
        Header: 'Insurance',
        accessor: 'insurance_available',
        Cell: ({ value }) => (value === 'Yes' ? 'Yes' : 'No'),
      },
      {
        Header: 'Max Declared Value',
        accessor: 'max_declared_value',
        Cell: ({ value }) => formatMoney(value),
      },
      {
        Header: 'Logo',
        accessor: 'profile_photo',
        Cell: ({ value }) =>
          value ? (
            <img
              src={`${baseURL}${value}`}
              alt="Logo"
              className="da-thumb"
              onClick={() => handleImageClick(`${baseURL}${value}`)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = 'No Logo';
              }}
            />
          ) : (
            'No Logo'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get/delivery-agents`);
        if (!response.ok) throw new Error('Failed to fetch data');
        setData(await response.json());
      } catch (error) {
        console.error('Error fetching logistic partners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="main-container">
      <div className="da-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Logistic Partner Table</h3>
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
          <Modal.Title>Logistic Partner Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData && (
            <div className="modal-content-grid">
              <Row>
                <Col md={6}><strong>Partner Code:</strong> {modalData.agent_code}</Col>
                <Col md={6}><strong>Partner Name:</strong> {modalData.full_name}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Partner Type:</strong> {modalData.partner_type || 'N/A'}</Col>
                <Col md={6}><strong>Status:</strong> {modalData.status}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Contact Person:</strong> {modalData.contact_person || 'N/A'}</Col>
                <Col md={6}><strong>Mobile:</strong> {modalData.mobile_number}</Col>
              </Row>
              <Row>
                <Col md={12}><strong>Email:</strong> {modalData.email || 'N/A'}</Col>
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
                <Col md={6}><strong>Serviceable Areas:</strong> {modalData.serviceable_areas || 'N/A'}</Col>
                <Col md={6}><strong>Service Type:</strong> {formatList(modalData.service_type)}</Col>
              </Row>
              <Row>
                <Col md={12} style={{ wordBreak: 'break-all' }}>
                  <strong>Tracking URL:</strong> {modalData.tracking_url_template || 'N/A'}
                </Col>
              </Row>
              <Row>
                <Col md={6}><strong>Insurance Available:</strong> {modalData.insurance_available || 'No'}</Col>
                <Col md={6}><strong>Max Declared Value:</strong> {formatMoney(modalData.max_declared_value)}</Col>
              </Row>
              {modalData.profile_photo && (
                <Row>
                  <Col md={12}>
                    <strong>Logo:</strong>
                    <img
                      src={`${baseURL}${modalData.profile_photo}`}
                      alt="Logo"
                      style={{ width: '150px', height: '150px', borderRadius: '5px', objectFit: 'contain', marginTop: '10px', cursor: 'pointer', display: 'block' }}
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