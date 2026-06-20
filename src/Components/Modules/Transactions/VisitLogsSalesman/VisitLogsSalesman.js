import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../../Url/NodeBaseURL';
import StockNavbar from '../../../../Navbar/StockNavbar';
import { 
  FaPlus, FaEdit, FaTrash, FaCalendarCheck, FaUser, 
  FaClock, FaCheck, FaTimes, FaWarehouse, FaBarcode, 
  FaBoxes, FaList, FaEye, FaCheckCircle, FaMinusCircle,
  FaUserTie, FaUserCheck, FaSync, FaTimesCircle, FaUserPlus
} from 'react-icons/fa';
import './VisitLogsSalesman.css';
import Swal from 'sweetalert2';

const VisitLogsSalesmanSchedule = () => {
  // State for form data - simplified
  const [formData, setFormData] = useState({
    scheduled_date: '',
    salesman_id: ''
  });

  // State for dropdown data
  const [salesmen, setSalesmen] = useState([]);
  
  // State for scheduled visits list
  const [scheduledVisits, setScheduledVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State for Assign Salesman mode
  const [isAssignMode, setIsAssignMode] = useState(false);
  const [assignScheduleId, setAssignScheduleId] = useState(null);
  const [assignScheduleData, setAssignScheduleData] = useState(null);

  // State to track which schedules have been assigned
  const [assignedScheduleIds, setAssignedScheduleIds] = useState([]);

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  // Fetch salesmen on component mount
  useEffect(() => {
    console.log('🚀 Component mounted - fetching data...');
    fetchSalesmen();
    fetchScheduledVisits();
  }, []);

  // Fetch salesmen from account-details API
  const fetchSalesmen = async () => {
    try {
      console.log('📋 Fetching salesmen from account-details API...');
      const response = await axios.get(`${baseURL}/get/account-details`);
      const accounts = response.data;
      
      const salesmanList = accounts.filter(account => 
        account.account_group && account.account_group.toUpperCase() === 'SALESMAN'
      );
      
      console.log(`✅ Salesmen found: ${salesmanList.length}`);
      setSalesmen(salesmanList);
    } catch (error) {
      console.error('❌ Error fetching salesmen:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch salesmen data'
      });
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
      
      // Update assigned schedule IDs based on fetched data
      const assignedIds = response.data
        .filter(schedule => schedule.salesman_id !== null)
        .map(schedule => schedule.id);
      setAssignedScheduleIds(assignedIds);
      console.log(`📌 Assigned schedule IDs:`, assignedIds);
    } catch (error) {
      console.error('❌ Error fetching scheduled visits:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch scheduled visits'
      });
    } finally {
      setFetchLoading(false);
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

  // Handle form submission - Simplified
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Submitting form data:', formData);
    
    if (!formData.scheduled_date) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select a scheduled date and time'
      });
      return;
    }

    if (!formData.salesman_id) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select a salesman'
      });
      return;
    }

    // If in assign mode, call the assign API
    if (isAssignMode && assignScheduleId) {
      await handleAssignSubmit();
      return;
    }

    // Find salesman name
    const selectedSalesman = salesmen.find(s => s.account_id === parseInt(formData.salesman_id));
    
    // For demo purposes, we'll use a default customer, warehouse, and barcode
    // In a real scenario, you might want to add these fields back or use defaults
    const submitData = {
      scheduled_date: formData.scheduled_date,
      customer_id: 53, // Default customer ID (Raja)
      warehouse_id: 2, // Default warehouse ID
      barcodes: ['GBR017'], // Default barcode
      salesman_id: parseInt(formData.salesman_id),
      salesman_name: selectedSalesman ? selectedSalesman.account_name : ''
    };
    
    console.log('📤 Sending data to API:', submitData);
    
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
          text: isEditing ? 'Visit schedule updated successfully!' : 'Visit scheduled successfully!',
          timer: 2000,
          showConfirmButton: false
        });
        
        resetForm();
        await fetchScheduledVisits(); // Refresh data after operation
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

  // Handle Assign Salesman - Submit
  const handleAssignSubmit = async () => {
    console.log('📝 Assigning salesman with data:', formData);
    
    if (!formData.salesman_id) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select a salesman'
      });
      return;
    }

    // Find salesman name
    const selectedSalesman = salesmen.find(s => s.account_id === parseInt(formData.salesman_id));
    
    const assignData = {
      salesman_id: parseInt(formData.salesman_id),
      salesman_name: selectedSalesman ? selectedSalesman.account_name : ''
    };
    
    try {
      setLoading(true);
      console.log(`📤 Assigning salesman to schedule ${assignScheduleId}:`, assignData);
      
      const response = await axios.put(
        `${baseURL}/api/visit-logs-warehouse-schedule/${assignScheduleId}/assign-salesman`,
        assignData
      );
      
      console.log('📥 Assign response:', response.data);
      
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Assigned!',
          text: `Salesman ${assignData.salesman_name} assigned successfully!`,
          timer: 2000,
          showConfirmButton: false
        });
        
        resetForm();
        await fetchScheduledVisits(); // Refresh data after assignment
        
        // Show a success message and refresh the component
        console.log('🔄 Component refreshed after assignment');
      }
    } catch (error) {
      console.error('❌ Error assigning salesman:', error);
      console.error('❌ Error response:', error.response?.data);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to assign salesman'
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
      salesman_id: ''
    });
    setIsEditing(false);
    setEditingId(null);
    setIsAssignMode(false);
    setAssignScheduleId(null);
    setAssignScheduleData(null);
  };

  // Handle edit
  const handleEdit = (schedule) => {
    console.log(`📝 Editing schedule:`, schedule);
    const formattedDate = schedule.scheduled_date 
      ? new Date(schedule.scheduled_date).toISOString().slice(0, 16)
      : '';
    
    setFormData({
      scheduled_date: formattedDate,
      salesman_id: schedule.salesman_id || ''
    });
    
    setIsEditing(true);
    setEditingId(schedule.id);
    setIsAssignMode(false);
    setAssignScheduleId(null);
    setAssignScheduleData(null);
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
          
          await fetchScheduledVisits(); // Refresh data after deletion
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

  // Handle Assign Salesman - Open in Form
  const handleAssignSalesman = (schedule) => {
    console.log('👤 Assigning salesman to schedule:', schedule);
    
    // Format the scheduled date for the datetime-local input
    const formattedDate = schedule.scheduled_date 
      ? new Date(schedule.scheduled_date).toISOString().slice(0, 16)
      : '';
    
    setFormData({
      scheduled_date: formattedDate,
      salesman_id: schedule.salesman_id || ''
    });
    
    setIsAssignMode(true);
    setAssignScheduleId(schedule.id);
    setAssignScheduleData(schedule);
    setIsEditing(false);
    setEditingId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if a schedule has been assigned
  const isScheduleAssigned = (scheduleId) => {
    return assignedScheduleIds.includes(scheduleId);
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

  // Get salesman name by ID
  const getSalesmanName = (salesmanId) => {
    if (!salesmanId) return 'Not Assigned';
    const salesman = salesmen.find(s => s.account_id === salesmanId);
    return salesman ? salesman.account_name : 'Unknown Salesman';
  };

  // Get customer name by account_id (for display in table)
  const getCustomerName = (accountId) => {
    // Since we're using a default customer, just return a placeholder
    // In a real scenario, you'd fetch this from an API
    const customerNames = {
      53: 'Raja',
      56: 'RANI',
      57: 'krishna'
    };
    return customerNames[accountId] || 'Customer';
  };

  // Get customer code by account_id
  const getCustomerCode = (accountId) => {
    const customerCodes = {
      53: 'CUST-001',
      56: 'CUST-002'
    };
    return customerCodes[accountId] || 'N/A';
  };

  // Get stock point name by ID
  const getStockPointName = (stockPointId) => {
    const stockPointNames = {
      2: 'Main Warehouse'
    };
    return stockPointNames[stockPointId] || 'Stock Point';
  };

  // Refresh data
  const handleRefresh = async () => {
    await fetchScheduledVisits();
    Swal.fire({
      icon: 'success',
      title: 'Refreshed',
      text: 'Data has been refreshed successfully',
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <>
      <StockNavbar />
      <div className="vlss-main-container">
        <Container className="vlss-container" fluid>
          {/* Header */}
          <Row className="vlss-header-row mb-4">
            <Col md={12}>
              <div className="vlss-header-card">
                <div className="vlss-header-content">
                  <div className="vlss-header-icon-wrapper">
                    <FaCalendarCheck className="vlss-header-icon" />
                  </div>
                  <div className="vlss-header-text-wrapper">
                    <h1 className="vlss-header-title">Visit Logs Salesman Schedule</h1>
                    <p className="vlss-header-subtitle">
                      Schedule and assign customer visits to salesmen
                    </p>
                  </div>
                  <div className="vlss-header-actions ms-auto">
                    <button 
                      className="vlss-refresh-btn"
                      onClick={handleRefresh}
                      disabled={loading}
                    >
                      <FaSync className={loading ? 'vlss-spin' : ''} /> Refresh
                    </button>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Schedule Form - Simplified */}
          <Row className="vlss-form-section mb-4">
            <Col md={12}>
              <div className="vlss-form-card">
                <div className="vlss-form-header">
                  {isAssignMode ? (
                    <>
                      <FaUserPlus className="vlss-form-icon text-success" />
                      <h4>Assign Salesman</h4>
                      {assignScheduleData && (
                        <span className="vlss-assign-info-text ms-3">
                          <small className="text-muted">
                            Customer: <strong>{assignScheduleData.customer_name || getCustomerName(assignScheduleData.customer_id)}</strong> | 
                            Barcode: <strong>{assignScheduleData.barcode || 'N/A'}</strong> | 
                            Stock Point: <strong>{assignScheduleData.warehouse_name || getStockPointName(assignScheduleData.warehouse_id)}</strong>
                          </small>
                        </span>
                      )}
                    </>
                  ) : isEditing ? (
                    <>
                      <FaEdit className="vlss-form-icon" />
                      <h4>Edit Visit Schedule</h4>
                    </>
                  ) : (
                    <>
                      <FaPlus className="vlss-form-icon" />
                      <h4>Schedule New Visit</h4>
                    </>
                  )}
                </div>
                <Form onSubmit={handleSubmit}>
                  <Row className="align-items-end">
                    {/* Visit Date & Time */}
                    <Col lg={4} md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="vlss-label">
                          <FaCalendarCheck className="me-1" /> Visit Date & Time <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="scheduled_date"
                          value={formData.scheduled_date}
                          onChange={handleInputChange}
                          min={today + 'T00:00'}
                          className="vlss-input"
                          disabled={isAssignMode}
                          required={!isAssignMode}
                        />
                        {isAssignMode && (
                          <Form.Text className="text-muted">
                            This date is pre-filled from the schedule and cannot be changed.
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>

                    {/* Salesman Dropdown */}
                    <Col lg={4} md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="vlss-label">
                          <FaUserTie className="me-1" /> Salesman <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="salesman_id"
                          value={formData.salesman_id}
                          onChange={handleInputChange}
                          className="vlss-select"
                          required
                        >
                          <option value="">-- Select Salesman --</option>
                          {salesmen.map(salesman => (
                            <option key={salesman.account_id} value={salesman.account_id}>
                              {salesman.account_name} {salesman.phone ? `(${salesman.phone})` : ''}
                            </option>
                          ))}
                        </Form.Select>
                        {salesmen.length === 0 && (
                          <small className="text-warning mt-1 d-block">
                            No salesmen available. Please add salesmen to assign visits.
                          </small>
                        )}
                      </Form.Group>
                    </Col>

                    {/* Submit Button */}
                    <Col lg={4} md={12} className="mb-3">
                      <div className="d-flex gap-2">
                        <Button
                          type="submit"
                          variant={isAssignMode ? "success" : "primary"}
                          className="vlss-submit-btn w-100"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-1"
                              />
                              {isAssignMode ? 'Assigning...' : isEditing ? 'Saving...' : 'Saving...'}
                            </>
                          ) : isAssignMode ? (
                            <>
                              <FaUserCheck className="me-1" /> Assign Salesman
                            </>
                          ) : isEditing ? (
                            <>
                              <FaCheck className="me-1" /> Update Schedule
                            </>
                          ) : (
                            <>
                              <FaPlus className="me-1" /> Schedule Visit
                            </>
                          )}
                        </Button>
                        {(isEditing || isAssignMode) && (
                          <Button
                            variant="outline-secondary"
                            className="vlss-cancel-btn"
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
              <Alert variant="info" className="vlss-info-alert">
                <FaClock className="me-2" />
                <strong>Schedule Management:</strong> Select a date/time and assign a salesman to schedule a customer visit.
              </Alert>
            </Col>
          </Row>

          {/* Stats Cards */}
          <Row className="vlss-stats-row mb-4">
            <Col lg={3} md={6} className="mb-3">
              <div className="vlss-stat-card vlss-stat-total">
                <div className="vlss-stat-icon">
                  <FaCalendarCheck />
                </div>
                <div className="vlss-stat-info">
                  <h5 className="vlss-stat-number">{scheduledVisits.length}</h5>
                  <p className="vlss-stat-label">Total Visits</p>
                </div>
              </div>
            </Col>
            <Col lg={3} md={6} className="mb-3">
              <div className="vlss-stat-card vlss-stat-scheduled">
                <div className="vlss-stat-icon">
                  <FaClock />
                </div>
                <div className="vlss-stat-info">
                  <h5 className="vlss-stat-number">
                    {scheduledVisits.filter(v => !v.status || v.status === 'scheduled').length}
                  </h5>
                  <p className="vlss-stat-label">Scheduled</p>
                </div>
              </div>
            </Col>
            <Col lg={3} md={6} className="mb-3">
              <div className="vlss-stat-card vlss-stat-completed">
                <div className="vlss-stat-icon">
                  <FaCheckCircle />
                </div>
                <div className="vlss-stat-info">
                  <h5 className="vlss-stat-number">
                    {scheduledVisits.filter(v => v.status === 'completed').length}
                  </h5>
                  <p className="vlss-stat-label">Completed</p>
                </div>
              </div>
            </Col>
            <Col lg={3} md={6} className="mb-3">
              <div className="vlss-stat-card vlss-stat-cancelled">
                <div className="vlss-stat-icon">
                  <FaTimesCircle />
                </div>
                <div className="vlss-stat-info">
                  <h5 className="vlss-stat-number">
                    {scheduledVisits.filter(v => v.status === 'cancelled').length}
                  </h5>
                  <p className="vlss-stat-label">Cancelled</p>
                </div>
              </div>
            </Col>
          </Row>

          {/* Scheduled Visits Table */}
          <Row className="vlss-table-section">
            <Col md={12}>
              <div className="vlss-table-card">
                <div className="vlss-table-header">
                  <div className="vlss-table-title">
                    <h4>Scheduled Visits</h4>
                    <Badge bg="primary" className="ms-2">
                      Total: {scheduledVisits.length}
                    </Badge>
                  </div>
                  <div className="vlss-table-filters">
                    <input 
                      type="text" 
                      placeholder="Search visits..." 
                      className="vlss-search-input"
                      id="vlssSearchInput"
                    />
                  </div>
                </div>
                <div className="vlss-table-responsive">
                  {fetchLoading ? (
                    <div className="vlss-loading-container">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-3">Loading scheduled visits...</p>
                    </div>
                  ) : scheduledVisits.length > 0 ? (
                    <Table bordered hover responsive className="vlss-table">
                      <thead className="vlss-table-head">
                        <tr>
                          <th>#</th>
                          <th>Schedule Date & Time</th>
                          <th>Customer</th>
                          <th>Salesman</th>
                          <th>Stock Point</th>
                          <th>Barcode</th>
                          <th>Status</th>
                          <th>Created At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scheduledVisits.map((schedule, index) => {
                          const isAssigned = schedule.salesman_id !== null;
                          
                          return (
                            <tr 
                              key={schedule.id} 
                              className={`vlss-row ${getRowStatusClass(schedule.status)}`}
                            >
                              <td className="vlss-id-cell">{index + 1}</td>
                              <td>
                                <div className="vlss-date-time">
                                  <div className="vlss-date">
                                    <FaCalendarCheck className="me-1 text-primary" />
                                    {formatDate(schedule.scheduled_date)}
                                  </div>
                                  <div className="vlss-time">
                                    <FaClock className="me-1 text-muted" />
                                    {formatTime(schedule.scheduled_date)}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="vlss-customer-info">
                                  <FaUser className="me-2 text-success" />
                                  <span className="vlss-customer-name">
                                    {schedule.customer_name || getCustomerName(schedule.customer_id)}
                                  </span>
                                  <br />
                                  <small className="text-muted">ID: {schedule.customer_id}</small>
                                </div>
                              </td>
                              <td>
                                {isAssigned ? (
                                  <Badge bg="success" className="vlss-salesman-badge">
                                    <FaUserCheck className="me-1" />
                                    {schedule.salesman_name || getSalesmanName(schedule.salesman_id)}
                                  </Badge>
                                ) : (
                                  <Badge bg="secondary">Not Assigned</Badge>
                                )}
                              </td>
                              <td>
                                <div className="vlss-warehouse-info">
                                  <FaWarehouse className="me-2 text-warning" />
                                  <span>{schedule.warehouse_name || getStockPointName(schedule.warehouse_id)}</span>
                                </div>
                              </td>
                              <td>
                                <Badge bg="dark" className="vlss-barcode-badge">
                                  <FaBarcode className="me-1" />
                                  {schedule.barcode || 'N/A'}
                                </Badge>
                              </td>
                              <td>{getVisitStatusBadge(schedule.status)}</td>
                              <td>
                                <div className="vlss-created-info">
                                  <div className="vlss-date">
                                    {formatDate(schedule.created_at)}
                                  </div>
                                  <div className="vlss-time small text-muted">
                                    {formatTime(schedule.created_at)}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="vlss-action-buttons">
                                  <button 
                                    className="vlss-view-btn"
                                    onClick={() => {
                                      Swal.fire({
                                        title: 'Visit Details',
                                        html: `
                                          <div style="text-align: left;">
                                            <p><strong>Schedule ID:</strong> ${schedule.id}</p>
                                            <p><strong>Customer:</strong> ${schedule.customer_name || getCustomerName(schedule.customer_id)}</p>
                                            <p><strong>Salesman:</strong> ${schedule.salesman_name || getSalesmanName(schedule.salesman_id) || 'Not Assigned'}</p>
                                            <p><strong>Stock Point:</strong> ${schedule.warehouse_name || getStockPointName(schedule.warehouse_id)}</p>
                                            <p><strong>Barcode:</strong> ${schedule.barcode || 'N/A'}</p>
                                            <p><strong>Scheduled Date:</strong> ${formatDateTime(schedule.scheduled_date)}</p>
                                            <p><strong>Status:</strong> ${schedule.status || 'Scheduled'}</p>
                                            <p><strong>Created:</strong> ${formatDateTime(schedule.created_at)}</p>
                                          </div>
                                        `,
                                        icon: 'info',
                                        confirmButtonColor: '#3085d6'
                                      });
                                    }}
                                    title="View Details"
                                  >
                                    <FaEye /> View
                                  </button>
                                  <Button
                                    variant="outline-warning"
                                    size="sm"
                                    className="ms-1"
                                    onClick={() => handleEdit(schedule)}
                                    title="Edit"
                                  >
                                    <FaEdit />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="ms-1"
                                    onClick={() => handleDelete(schedule.id)}
                                    title="Delete"
                                  >
                                    <FaTrash />
                                  </Button>
                                  {/* Assign Salesman Button - Disabled if already assigned */}
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    className="ms-1"
                                    onClick={() => handleAssignSalesman(schedule)}
                                    title="Assign Salesman"
                                    disabled={
                                      schedule.status === 'completed' || 
                                      schedule.status === 'cancelled' || 
                                      isAssigned
                                    }
                                  >
                                    <FaUserPlus /> Assign
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="vlss-empty-state">
                      <FaCalendarCheck size={50} className="vlss-empty-icon" />
                      <h5>No Scheduled Visits</h5>
                      <p className="text-muted">There are no customer visits scheduled at this time.</p>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

// Helper functions for formatting
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getRowStatusClass = (status) => {
  if (!status || status === 'scheduled') return 'vlss-row-scheduled';
  if (status === 'completed') return 'vlss-row-completed';
  if (status === 'cancelled') return 'vlss-row-cancelled';
  return '';
};

export default VisitLogsSalesmanSchedule;