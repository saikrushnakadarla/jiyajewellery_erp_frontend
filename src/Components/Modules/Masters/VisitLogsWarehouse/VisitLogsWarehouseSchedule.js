import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Form, Alert, Badge, Modal } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../../Url/NodeBaseURL';
import Navbar from '../../../../Navbar/Navbar';
import { 
  FaPlus, FaEdit, FaTrash, FaCalendarCheck, FaUser, 
  FaClock, FaCheck, FaTimes, FaWarehouse, FaBarcode, 
  FaBoxes, FaList, FaEye, FaCheckCircle, FaMinusCircle
} from 'react-icons/fa';
import './VisitLogsWarehouseSchedule.css';
import Swal from 'sweetalert2';

const VisitLogsWarehouseSchedule = () => {
  // State for form data
  const [formData, setFormData] = useState({
    scheduled_date: '',
    customer_id: '',
    warehouse_id: '',
    barcodes: []
  });

  // State for dropdown data
  const [customers, setCustomers] = useState([]);
  const [stockPoints, setStockPoints] = useState([]);
  
  // State for scheduled visits list
  const [scheduledVisits, setScheduledVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State for Stock Transfer and Barcode Items
  const [stockTransfers, setStockTransfers] = useState([]);
  const [transferItems, setTransferItems] = useState([]);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [selectedStockPoint, setSelectedStockPoint] = useState(null);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [availableBarcodes, setAvailableBarcodes] = useState([]);
  const [selectedBarcodes, setSelectedBarcodes] = useState([]);
  const [selectedBarcodeDetails, setSelectedBarcodeDetails] = useState([]);

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  // Fetch customers and stock points on component mount
  useEffect(() => {
    console.log('🚀 Component mounted - fetching data...');
    fetchCustomers();
    fetchStockPoints();
    fetchScheduledVisits();
    fetchStockTransfers();
  }, []);

  // Fetch customers from account-details API
  const fetchCustomers = async () => {
    try {
      console.log('📋 Fetching customers from account-details API...');
      // Use the correct API endpoint from your backend
      const response = await axios.get(`${baseURL}/get/account-details`);
      const accounts = response.data;
      
      console.log(`📊 Total accounts fetched: ${accounts.length}`);
      
      // Filter customers (already filtered by backend but double-check)
      const customerList = accounts.filter(account => 
        account.account_group && account.account_group.toUpperCase() === 'CUSTOMERS'
      );
      
      console.log(`✅ Customers found: ${customerList.length}`);
      console.log('📋 Customer list:', customerList.map(c => ({ 
        account_id: c.account_id,        // This is what we store in the schedule table
        customer_id: c.customer_id,      // This is the customer code (CUST-001, CUST-002, etc.)
        name: c.account_name, 
        group: c.account_group 
      })));
      
      setCustomers(customerList);
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch customers data'
      });
    }
  };

  // Fetch stock points (warehouses)
  const fetchStockPoints = async () => {
    try {
      console.log('📋 Fetching stock points...');
      const response = await axios.get(`${baseURL}/api/stockpoints`);
      const mappedData = response.data.map(item => ({
        id: item.stock_point_id,
        name: item.stock_point_name,
        location: item.location,
        warehouse_id: item.warehouse_id,
        warehouse_name: item.warehouse_name,
        status: item.status,
        description: item.description
      }));
      console.log(`✅ Stock points found: ${mappedData.length}`);
      setStockPoints(mappedData);
    } catch (error) {
      console.error('❌ Error fetching stock points:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch stock points'
      });
    }
  };

  // Fetch all stock transfers
  const fetchStockTransfers = async () => {
    try {
      console.log('📋 Fetching stock transfers...');
      const response = await axios.get(`${baseURL}/api/stock-transfer/get-stock-transfers`);
      console.log(`✅ Stock transfers found: ${response.data.length}`);
      setStockTransfers(response.data);
    } catch (error) {
      console.error('❌ Error fetching stock transfers:', error);
    }
  };

  // Fetch scheduled visits
  const fetchScheduledVisits = async () => {
    try {
      setFetchLoading(true);
      console.log('📋 Fetching scheduled visits...');
      const response = await axios.get(`${baseURL}/api/visit-logs-warehouse-schedule`);
      console.log(`✅ Scheduled visits found: ${response.data.length}`);
      setScheduledVisits(response.data);
    } catch (error) {
      console.error('❌ Error fetching scheduled visits:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  // Fetch barcodes for a specific stock point
  const fetchBarcodesForStockPoint = async (stockPointId) => {
    try {
      setBarcodeLoading(true);
      console.log(`📋 Fetching barcodes for stock point ${stockPointId}...`);
      
      // Use the backend API to fetch barcodes
      const response = await axios.get(`${baseURL}/api/visit-logs-warehouse-schedule/barcodes/${stockPointId}`);
      
      if (response.data.success) {
        console.log(`✅ Barcodes found: ${response.data.barcodes.length}`);
        setAvailableBarcodes(response.data.barcodes);
        setSelectedStockPoint(stockPoints.find(s => s.id === stockPointId));
        setShowBarcodeModal(true);
        // Reset selected barcodes when opening modal
        setSelectedBarcodes([]);
        setSelectedBarcodeDetails([]);
      } else {
        setAvailableBarcodes([]);
        Swal.fire({
          icon: 'info',
          title: 'No Barcodes Found',
          text: 'No barcodes found for this stock point'
        });
      }
    } catch (error) {
      console.error('❌ Error fetching barcodes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch barcodes for this stock point'
      });
    } finally {
      setBarcodeLoading(false);
    }
  };

  // Handle stock point selection change
  const handleStockPointChange = (e) => {
    const { value } = e.target;
    console.log(`🔄 Stock point changed to: ${value}`);
    setFormData(prev => ({
      ...prev,
      warehouse_id: value,
      barcodes: [] // Reset barcodes when stock point changes
    }));
    
    // Fetch barcodes for the selected stock point
    if (value) {
      fetchBarcodesForStockPoint(parseInt(value));
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`🔄 Form field changed: ${name} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle barcode selection toggle in modal
  const handleBarcodeToggle = (barcodeItem) => {
    const barcode = barcodeItem.barcode;
    const isSelected = selectedBarcodes.includes(barcode);
    
    if (isSelected) {
      // Remove barcode
      setSelectedBarcodes(prev => prev.filter(b => b !== barcode));
      setSelectedBarcodeDetails(prev => prev.filter(b => b.barcode !== barcode));
    } else {
      // Add barcode
      setSelectedBarcodes(prev => [...prev, barcode]);
      setSelectedBarcodeDetails(prev => [...prev, barcodeItem]);
    }
  };

  // Handle select all barcodes
  const handleSelectAllBarcodes = () => {
    const allBarcodes = availableBarcodes.map(item => item.barcode);
    setSelectedBarcodes(allBarcodes);
    setSelectedBarcodeDetails([...availableBarcodes]);
  };

  // Handle deselect all barcodes
  const handleDeselectAllBarcodes = () => {
    setSelectedBarcodes([]);
    setSelectedBarcodeDetails([]);
  };

  // Handle confirm barcode selection
  const handleConfirmBarcodes = () => {
    if (selectedBarcodes.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Barcodes Selected',
        text: 'Please select at least one barcode to proceed.'
      });
      return;
    }
    
    console.log(`✅ Selected ${selectedBarcodes.length} barcodes:`, selectedBarcodes);
    setFormData(prev => ({
      ...prev,
      barcodes: selectedBarcodes
    }));
    setShowBarcodeModal(false);
    
    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Barcodes Selected',
      text: `Selected ${selectedBarcodes.length} barcode(s) for scheduling.`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Submitting form data:', formData);
    
    // Validate required fields
    if (!formData.scheduled_date) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select a scheduled date and time'
      });
      return;
    }

    if (!formData.customer_id) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select a customer'
      });
      return;
    }

    if (!formData.warehouse_id) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select a stock point/warehouse'
      });
      return;
    }

    if (formData.barcodes.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select at least one barcode'
      });
      return;
    }

    // Prepare data for API
    // IMPORTANT: customer_id here is the account_id from the account_details table
    const submitData = {
      scheduled_date: formData.scheduled_date,
      customer_id: parseInt(formData.customer_id), // This is the account_id (56, 53, etc.)
      warehouse_id: parseInt(formData.warehouse_id),
      barcodes: formData.barcodes
    };
    
    console.log('📤 Sending data to API:', {
      ...submitData,
      // Log what this means
      customer_account_id: submitData.customer_id,
      note: 'customer_id in API is the account_id from account_details table'
    });
    
    try {
      setLoading(true);
      
      let response;
      if (isEditing) {
        console.log(`📝 Updating schedule ${editingId}...`);
        response = await axios.put(`${baseURL}/api/visit-logs-warehouse-schedule/${editingId}`, submitData);
      } else {
        console.log('📝 Creating new schedule...');
        response = await axios.post(`${baseURL}/api/visit-logs-warehouse-schedule`, submitData);
      }
      
      console.log('📥 API Response:', response.data);
      
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: isEditing ? 'Updated!' : 'Scheduled!',
          text: isEditing ? 'Visit schedule updated successfully!' : `${formData.barcodes.length} visit(s) scheduled successfully!`,
          timer: 2000,
          showConfirmButton: false
        });
        
        resetForm();
        fetchScheduledVisits();
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      console.error('❌ Error response:', error.response?.data);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to process request'
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    console.log('🔄 Resetting form...');
    setFormData({
      scheduled_date: '',
      customer_id: '',
      warehouse_id: '',
      barcodes: []
    });
    setIsEditing(false);
    setEditingId(null);
    setSelectedBarcodeDetails([]);
    setAvailableBarcodes([]);
    setSelectedBarcodes([]);
  };

  // Handle edit
  const handleEdit = (schedule) => {
    console.log(`📝 Editing schedule:`, schedule);
    const formattedDate = schedule.scheduled_date 
      ? new Date(schedule.scheduled_date).toISOString().slice(0, 16)
      : '';
    
    setFormData({
      scheduled_date: formattedDate,
      customer_id: schedule.customer_id, // This is the account_id
      warehouse_id: schedule.warehouse_id || '',
      barcodes: schedule.barcode ? [schedule.barcode] : []
    });
    
    setIsEditing(true);
    setEditingId(schedule.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    console.log('🔄 Cancelling edit...');
    resetForm();
  };

  // Handle delete
  const handleDelete = async (id) => {
    console.log(`🗑️ Deleting schedule ${id}...`);
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This visit schedule will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${baseURL}/api/visit-logs-warehouse-schedule/${id}`);
        console.log('📥 Delete response:', response.data);
        
        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: 'Visit schedule deleted successfully',
            timer: 2000,
            showConfirmButton: false
          });
          
          if (editingId === id) {
            resetForm();
          }
          
          fetchScheduledVisits();
        }
      } catch (error) {
        console.error('❌ Error deleting schedule:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete visit schedule'
        });
      }
    }
  };

  // Get visit status badge
  const getVisitStatusBadge = (status) => {
    if (!status || status === 'scheduled') {
      return <Badge bg="primary">Scheduled</Badge>;
    }
    if (status === 'completed') {
      return <Badge bg="success">Completed</Badge>;
    }
    if (status === 'cancelled') {
      return <Badge bg="danger">Cancelled</Badge>;
    }
    return <Badge bg="secondary">{status}</Badge>;
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get customer name by account_id
  const getCustomerName = (accountId) => {
    const customer = customers.find(c => c.account_id === accountId);
    return customer ? customer.account_name : 'Unknown Customer';
  };

  // Get customer code by account_id (this is the customer_id field from account_details)
  const getCustomerCode = (accountId) => {
    const customer = customers.find(c => c.account_id === accountId);
    return customer ? customer.customer_id || 'N/A' : 'N/A';
  };

  // Get stock point name by ID
  const getStockPointName = (stockPointId) => {
    const stockPoint = stockPoints.find(s => s.id === stockPointId);
    return stockPoint ? stockPoint.name : 'Unknown Stock Point';
  };

  return (
    <>
      <Navbar />
      <div className="vlws-main-container">
        <Container className="vlws-container" fluid>
          {/* Header */}
          <Row className="vlws-header-row mb-4">
            <Col md={12}>
              <div className="vlws-header-card">
                <div className="vlws-header-content">
                  <div className="vlws-header-icon-wrapper">
                    <FaWarehouse className="vlws-header-icon" />
                  </div>
                  <div className="vlws-header-text-wrapper">
                    <h1 className="vlws-header-title">Visit Logs Warehouse Schedule</h1>
                    <p className="vlws-header-subtitle">
                      Schedule customer visits with multiple barcode items at stock points
                    </p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Schedule Form */}
          <Row className="vlws-form-section mb-4">
            <Col md={12}>
              <div className="vlws-form-card">
                <div className="vlws-form-header">
                  {isEditing ? (
                    <>
                      <FaEdit className="vlws-form-icon" />
                      <h4>Edit Visit Schedule</h4>
                    </>
                  ) : (
                    <>
                      <FaPlus className="vlws-form-icon" />
                      <h4>Schedule New Visit</h4>
                    </>
                  )}
                </div>
                <Form onSubmit={handleSubmit}>
                  <Row className="align-items-end">
                    {/* Date Field */}
                    <Col lg={3} md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="vlws-label">
                          <FaCalendarCheck className="me-1" /> Visit Date & Time <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="scheduled_date"
                          value={formData.scheduled_date}
                          onChange={handleInputChange}
                          min={today + 'T00:00'}
                          className="vlws-input"
                          required
                        />
                      </Form.Group>
                    </Col>

                    {/* Customer Dropdown */}
                    <Col lg={3} md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="vlws-label">
                          <FaUser className="me-1" /> Customer <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="customer_id"
                          value={formData.customer_id}
                          onChange={handleInputChange}
                          className="vlws-select"
                          required
                        >
                          <option value="">-- Select Customer --</option>
                          {customers.map(customer => (
                            <option key={customer.account_id} value={customer.account_id}>
                              {customer.account_name} 
                              {customer.customer_id ? ` (${customer.customer_id})` : ''}
                              {` - ID: ${customer.account_id}`}
                            </option>
                          ))}
                        </Form.Select>
                        {/* <small className="text-muted">
                          Note: Customer ID (account_id) will be stored in the schedule
                        </small> */}
                      </Form.Group>
                    </Col>

                    {/* Stock Point Dropdown */}
                    <Col lg={3} md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="vlws-label">
                          <FaWarehouse className="me-1" /> Stock Point <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="warehouse_id"
                          value={formData.warehouse_id}
                          onChange={handleStockPointChange}
                          className="vlws-select"
                          required
                        >
                          <option value="">-- Select Stock Point --</option>
                          {stockPoints.map(stockPoint => (
                            <option key={stockPoint.id} value={stockPoint.id}>
                              {stockPoint.name} {stockPoint.location ? `(${stockPoint.location})` : ''}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {/* Selected Barcodes Display */}
                    <Col lg={3} md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="vlws-label">
                          <FaBarcode className="me-1" /> Selected Barcodes <span className="text-danger">*</span>
                        </Form.Label>
                        <div className="vlws-selected-barcodes">
                          {formData.barcodes.length > 0 ? (
                            <>
                              <div className="vlws-barcode-count">
                                <Badge bg="primary" className="me-2">
                                  {formData.barcodes.length} selected
                                </Badge>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, barcodes: [] }));
                                    setSelectedBarcodes([]);
                                    setSelectedBarcodeDetails([]);
                                  }}
                                >
                                  <FaTimes />
                                </Button>
                              </div>
                              <div className="vlws-barcode-tags mt-1">
                                {formData.barcodes.slice(0, 3).map((barcode, index) => (
                                  <Badge key={index} bg="dark" className="me-1 mb-1">
                                    {barcode}
                                  </Badge>
                                ))}
                                {formData.barcodes.length > 3 && (
                                  <Badge bg="secondary">+{formData.barcodes.length - 3} more</Badge>
                                )}
                              </div>
                            </>
                          ) : (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                if (formData.warehouse_id) {
                                  fetchBarcodesForStockPoint(parseInt(formData.warehouse_id));
                                } else {
                                  Swal.fire({
                                    icon: 'warning',
                                    title: 'Select Stock Point First',
                                    text: 'Please select a stock point to view available barcodes.'
                                  });
                                }
                              }}
                              disabled={!formData.warehouse_id}
                            >
                              <FaPlus className="me-1" /> Select Barcodes
                            </Button>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Selected Barcodes Details Preview */}
                  {selectedBarcodeDetails.length > 0 && (
                    <Row className="mt-3">
                      <Col md={12}>
                        <div className="vlws-barcode-preview">
                          <h6 className="mb-2">Selected Barcode Details ({selectedBarcodeDetails.length} items):</h6>
                          <div className="vlws-table-responsive">
                            <Table bordered hover responsive size="sm" className="vlws-table">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Barcode</th>
                                  <th>Product Name</th>
                                  <th>Category</th>
                                  <th>Qty</th>
                                  <th>Gross Wt</th>
                                  <th>Net Wt</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedBarcodeDetails.slice(0, 5).map((item, index) => (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td><Badge bg="dark">{item.barcode}</Badge></td>
                                    <td>{item.product_name}</td>
                                    <td>{item.category}</td>
                                    <td>{item.qty}</td>
                                    <td>{item.gross_weight}g</td>
                                    <td>{item.net_weight}g</td>
                                  </tr>
                                ))}
                                {selectedBarcodeDetails.length > 5 && (
                                  <tr>
                                    <td colSpan="7" className="text-center text-muted">
                                      And {selectedBarcodeDetails.length - 5} more items...
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </Table>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  )}

                  <Row className="mt-3">
                    <Col md={12}>
                      <div className="d-flex gap-2">
                        <Button
                          type="submit"
                          variant="primary"
                          className="vlws-submit-btn"
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : isEditing ? (
                            <>
                              <FaCheck className="me-1" /> Update Schedule
                            </>
                          ) : (
                            <>
                              <FaPlus className="me-1" /> Schedule Visit
                            </>
                          )}
                        </Button>
                        {isEditing && (
                          <Button
                            variant="outline-secondary"
                            className="vlws-cancel-btn"
                            onClick={handleCancelEdit}
                          >
                            <FaTimes className="me-1" /> Cancel
                          </Button>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Col>
          </Row>

          {/* Info Alert */}
          <Row className="mb-4">
            <Col md={12}>
              <Alert variant="info" className="vlws-info-alert">
                <FaClock className="me-2" />
                <strong>Schedule Management:</strong> Select a stock point to see available barcodes, then choose multiple barcodes to associate with the customer visit.
                <br />
                <small className="text-muted">
                  Note: The customer is identified by their account_id (e.g., 56, 53) which is stored in the schedule.
                  The customer_code (e.g., CUST-001, CUST-002) is a separate identifier.
                </small>
              </Alert>
            </Col>
          </Row>

          {/* Scheduled Visits Table */}
          <Row className="vlws-table-section">
            <Col md={12}>
              <div className="vlws-table-card">
                <div className="vlws-table-header">
                  <h4>Scheduled Visits</h4>
                  <Badge bg="primary" className="ms-2">
                    Total: {scheduledVisits.length}
                  </Badge>
                </div>
                <div className="vlws-table-responsive">
                  <Table bordered hover responsive className="vlws-table">
                    <thead className="vlws-table-head">
                      <tr>
                        <th>#</th>
                        <th>Scheduled Date & Time</th>
                        <th>Customer (account_id)</th>
                        <th>Customer Code</th>
                        <th>Stock Point</th>
                        <th>Barcode</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fetchLoading ? (
                        <tr>
                          <td colSpan="9" className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      ) : scheduledVisits.length > 0 ? (
                        scheduledVisits.map((schedule, index) => (
                          <tr key={schedule.id} className={editingId === schedule.id ? 'vlws-editing-row' : ''}>
                            <td>{index + 1}</td>
                            <td>
                              <FaCalendarCheck className="me-2 text-primary" />
                              {formatDateTime(schedule.scheduled_date)}
                            </td>
                            <td>
                              <FaUser className="me-2 text-success" />
                              {schedule.customer_name || getCustomerName(schedule.customer_id)}
                              <br />
                              <small className="text-muted">ID: {schedule.customer_id}</small>
                            </td>
                            <td>
                              <Badge bg="info">{schedule.customer_code || getCustomerCode(schedule.customer_id)}</Badge>
                            </td>
                            <td>
                              <FaWarehouse className="me-2 text-warning" />
                              {schedule.warehouse_name || getStockPointName(schedule.warehouse_id)}
                            </td>
                            <td>
                              <Badge bg="dark" className="vlws-barcode-badge">
                                <FaBarcode className="me-1" />
                                {schedule.barcode || 'N/A'}
                              </Badge>
                            </td>
                            <td>{getVisitStatusBadge(schedule.status)}</td>
                            <td>{formatDateTime(schedule.created_at)}</td>
                            <td>
                              <div className="vlws-action-buttons">
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => handleEdit(schedule)}
                                  title="Edit"
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(schedule.id)}
                                  title="Delete"
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-4 text-muted">
                            No scheduled visits found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Barcode Items Modal - Multi-select */}
      <Modal 
        show={showBarcodeModal} 
        onHide={() => {
          setShowBarcodeModal(false);
          setAvailableBarcodes([]);
        }}
        size="xl"
        className="vlws-barcode-modal"
      >
        <Modal.Header closeButton className="vlws-modal-header">
          <Modal.Title>
            <FaBarcode className="me-2" />
            Select Barcodes - {selectedStockPoint?.name || ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {barcodeLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading barcode items...</p>
            </div>
          ) : (
            <>
              {availableBarcodes.length > 0 ? (
                <>
                  <div className="vlws-modal-toolbar mb-3 d-flex justify-content-between align-items-center">
                    <div>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={handleSelectAllBarcodes}
                        className="me-2"
                      >
                        <FaCheckCircle className="me-1" /> Select All
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={handleDeselectAllBarcodes}
                      >
                        <FaMinusCircle className="me-1" /> Deselect All
                      </Button>
                    </div>
                    <div>
                      <Badge bg="primary" className="me-2">
                        Selected: {selectedBarcodes.length} / {availableBarcodes.length}
                      </Badge>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleConfirmBarcodes}
                        disabled={selectedBarcodes.length === 0}
                      >
                        <FaCheck className="me-1" /> Confirm Selection
                      </Button>
                    </div>
                  </div>
                  <div className="vlws-table-responsive">
                    <Table bordered hover responsive className="vlws-table">
                      <thead className="vlws-table-head">
                        <tr>
                          <th style={{ width: '50px' }}>Select</th>
                          <th>#</th>
                          <th>Barcode</th>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Design</th>
                          <th>Qty</th>
                          <th>Gross Wt</th>
                          <th>Net Wt</th>
                          <th>Transfer #</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableBarcodes.map((item, index) => (
                          <tr key={index} className={selectedBarcodes.includes(item.barcode) ? 'vlws-selected-row' : ''}>
                            <td className="text-center">
                              <Form.Check
                                type="checkbox"
                                checked={selectedBarcodes.includes(item.barcode)}
                                onChange={() => handleBarcodeToggle(item)}
                                className="vlws-barcode-checkbox"
                              />
                            </td>
                            <td>{index + 1}</td>
                            <td>
                              <Badge bg="dark" className="vlws-barcode-badge">
                                <FaBarcode className="me-1" />
                                {item.barcode}
                              </Badge>
                            </td>
                            <td>{item.product_name}</td>
                            <td>{item.category}</td>
                            <td>{item.design_name || 'N/A'}</td>
                            <td>{item.qty}</td>
                            <td>{item.gross_weight}g</td>
                            <td>{item.net_weight}g</td>
                            <td>{item.transfer_number}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted">
                  <FaBarcode size={40} className="mb-2" />
                  <p>No barcode items found for this stock point.</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowBarcodeModal(false);
              setAvailableBarcodes([]);
              setSelectedBarcodes([]);
              setSelectedBarcodeDetails([]);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default VisitLogsWarehouseSchedule;