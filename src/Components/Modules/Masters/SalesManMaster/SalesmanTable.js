// Salesman_Table.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Button, Row, Col, Modal } from 'react-bootstrap';
import './SalesmanTable.css';
import baseURL from '../../../../Url/NodeBaseURL';
import baseURL2 from '../../../../Url/NodeBaseURL2';

const SalesmanTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Sr. No.',
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: 'Salesman Name',
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
        Header: "Profile Photo",
        accessor: "profile_photo",
        Cell: ({ value }) => {
          return value ? (
            <img
              src={`${baseURL}${value}`}
              alt="Profile"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "cover",
                cursor: "pointer",
              }}
              onClick={() => handleImageClick(`${baseURL}${value}`)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = 'No Image';
              }}
            />
          ) : (
            "No Image"
          );
        },
      },
      {
        Header: 'Duty Hours',
        Cell: ({ row }) => {
          const start = row.original.duty_start_time || 'N/A';
          const end = row.original.duty_end_time || 'N/A';
          return `${start} - ${end}`;
        },
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
              onClick={() => handleEdit(row.original.account_id)}
            />
            <FaTrash
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
              onClick={() => handleDelete(row.original.account_id)}
            />
          </div>
        ),
      },
    ],
    []
  );

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get/account-details`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();

        const salesmen = result
          .filter((item) => item.account_group === 'SALESMAN')
          .map((item) => ({
            ...item,
            birthday: formatDate(item.birthday),
            anniversary: formatDate(item.anniversary),
          }));

        setData(salesmen);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this salesman?')) {
      try {
        const response = await fetch(`${baseURL}/delete/account-details/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Salesman deleted successfully!');
          setData((prevData) => prevData.filter((salesman) => salesman.account_id !== id));
        } else {
          console.error('Failed to delete salesman');
          alert('Failed to delete salesman.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while deleting.');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/salesmanmaster/${id}`);
  };

  const handleCreate = () => {
    navigate('/salesmanmaster');
  };

  const handleView = (rowData) => {
    setModalData(rowData);
    setShowModal(true);
  };

  return (
    <div className="main-container">
      <div className="salesman-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Salesmen</h3>
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
          <Modal.Title>Salesman Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData && (
            <div className="modal-content-grid">
              <Row>
                <Col md={6}><strong>Salesman Name:</strong> {modalData.account_name}</Col>
                <Col md={6}><strong>Print Name:</strong> {modalData.print_name}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Religion:</strong> {modalData.religion || 'N/A'}</Col>
                <Col md={6}><strong>Gender:</strong> {modalData.gender || 'N/A'}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Address:</strong> {modalData.address1 || 'N/A'}</Col>
                <Col md={6}><strong>Pincode:</strong> {modalData.pincode || 'N/A'}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>State:</strong> {modalData.state || 'N/A'}</Col>
                <Col md={6}><strong>State Code:</strong> {modalData.state_code || 'N/A'}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Phone:</strong> {modalData.phone || 'N/A'}</Col>
                <Col md={6}><strong>Mobile:</strong> {modalData.mobile}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Email:</strong> {modalData.email}</Col>
                <Col md={6}><strong>Birthday:</strong> {modalData.birthday}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Anniversary:</strong> {modalData.anniversary}</Col>
                <Col md={6}><strong>Duty Start:</strong> {modalData.duty_start_time || 'N/A'}</Col>
              </Row>
              <Row>
                <Col md={6}><strong>Duty End:</strong> {modalData.duty_end_time || 'N/A'}</Col>
                <Col md={6}><strong>Company:</strong> {modalData.company_name || 'N/A'}</Col>
              </Row>
              {modalData.profile_photo && (
                <Row>
                  <Col md={12}>
                    <strong>Profile Photo:</strong>
                    <img
                      src={`${baseURL}${modalData.profile_photo}`}
                      alt="Profile"
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "5px",
                        objectFit: "cover",
                        marginTop: "10px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleImageClick(`${baseURL}${modalData.profile_photo}`)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Image Preview Modal */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '500px',
                objectFit: 'contain',
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.alt = 'Image failed to load';
              }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SalesmanTable;