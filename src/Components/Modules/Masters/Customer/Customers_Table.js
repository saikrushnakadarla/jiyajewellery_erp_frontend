import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Button, Row, Col, Modal } from 'react-bootstrap';
import './Customers_Table.css';

import baseURL from '../../../../Url/NodeBaseURL';

const RepairsTable = () => {
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
        Cell: ({ value }) => {
          // Parse the JSON string if it exists
          let parsedImages = null;
          if (value && typeof value === 'string') {
            try {
              parsedImages = JSON.parse(value);
            } catch (e) {
              console.error('Error parsing images:', e);
            }
          } else if (value && Array.isArray(value)) {
            parsedImages = value;
          }

          return parsedImages && parsedImages.length > 0 ? (
            <img
              src={`${baseURL}/uploads/customer_images/${parsedImages[0].filename}`}
              alt="customerImage"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "5px",
                objectFit: "cover",
                cursor: "pointer",
              }}
              onClick={() => handleImageClick(`${baseURL}/uploads/customer_images/${parsedImages[0].filename}`)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'fallback-image-url'; // Add a fallback image
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

  // Handle image click to show enlarged image
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

        const customers = result
          .filter((item) => item.account_group === 'CUSTOMERS')
          .map((item) => ({
            ...item,
            birthday: formatDate(item.birthday),
            anniversary: formatDate(item.anniversary),
          }));

        setData(customers);
        console.log("customer", customers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleEdit = (id) => {
    navigate(`/customermaster/${id}`);
  };

  const handleCreate = () => {
    navigate('/customermaster');
  };

  const handleView = (rowData) => {
    // Parse images if needed for modal view
    if (rowData.images && typeof rowData.images === 'string') {
      try {
        rowData.images = JSON.parse(rowData.images);
      } catch (e) {
        console.error('Error parsing images in modal:', e);
      }
    }
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
              {/* Add image display in modal */}
              {modalData.images && modalData.images.length > 0 && (
                <Row>
                  <Col md={12}>
                    <strong>Image:</strong>
                    <img
                      src={`${baseURL}/uploads/customer_images/${modalData.images[0].filename}`}
                      alt="customerImage"
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "5px",
                        objectFit: "cover",
                        marginTop: "10px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleImageClick(`${baseURL}/uploads/customer_images/${modalData.images[0].filename}`)}
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

export default RepairsTable;