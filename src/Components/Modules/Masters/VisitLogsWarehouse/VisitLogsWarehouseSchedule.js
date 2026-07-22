import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Table, Form, Alert, Badge, Modal } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../../Url/NodeBaseURL';
import Navbar from '../../../../Navbar/Navbar';
import { 
  FaPlus, FaEdit, FaTrash, FaCalendarCheck, FaUser, 
  FaClock, FaCheck, FaTimes, FaWarehouse, FaBarcode, 
  FaBoxes, FaList, FaEye, FaCheckCircle, FaMinusCircle,
  FaUserTie, FaUserCheck, FaUserPlus, FaMapMarkerAlt,
  FaCity, FaMapPin, FaChevronDown, FaChevronRight,
  FaBuilding, FaLocationDot
} from 'react-icons/fa';
import './VisitLogsWarehouseSchedule.css';
import Swal from 'sweetalert2';

const VisitLogsWarehouseSchedule = () => {
  // State for form data
  const [formData, setFormData] = useState({
    scheduled_date: '',
    customer_id: '',
    warehouse_id: '',
    barcodes: [],
    salesman_id: ''  // Added salesman_id
  });

  // State for dropdown data
  const [customers, setCustomers] = useState([]);
  const [stockPoints, setStockPoints] = useState([]);
  const [salesmen, setSalesmen] = useState([]);  // Added salesmen state
  
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

  // State for custom dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStates, setExpandedStates] = useState({});
  const [expandedDistricts, setExpandedDistricts] = useState({});
  const [expandedCities, setExpandedCities] = useState({});
  const dropdownRef = useRef(null);

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  // Fetch customers, stock points, and salesmen on component mount
  useEffect(() => {
    console.log('🚀 Component mounted - fetching data...');
    fetchCustomers();
    fetchStockPoints();
    fetchScheduledVisits();
    fetchStockTransfers();
    fetchSalesmen();
  }, []);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch customers from account-details API
  const fetchCustomers = async () => {
    try {
      console.log('📋 Fetching customers from account-details API...');
      const response = await axios.get(`${baseURL}/get/account-details`);
      const accounts = response.data;
      
      console.log(`📊 Total accounts fetched: ${accounts.length}`);
      
      const customerList = accounts.filter(account => 
        account.account_group && account.account_group.toUpperCase() === 'CUSTOMERS'
      );
      
      console.log(`✅ Customers found: ${customerList.length}`);
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
      
      const response = await axios.get(`${baseURL}/api/visit-logs-warehouse-schedule/barcodes/${stockPointId}`);
      
      if (response.data.success) {
        console.log(`✅ Barcodes found: ${response.data.barcodes.length}`);
        setAvailableBarcodes(response.data.barcodes);
        setSelectedStockPoint(stockPoints.find(s => s.id === stockPointId));
        setShowBarcodeModal(true);
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
      barcodes: []
    }));
    
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
      setSelectedBarcodes(prev => prev.filter(b => b !== barcode));
      setSelectedBarcodeDetails(prev => prev.filter(b => b.barcode !== barcode));
    } else {
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
    
    Swal.fire({
      icon: 'success',
      title: 'Barcodes Selected',
      text: `Selected ${selectedBarcodes.length} barcode(s) for scheduling.`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Get salesman name by ID
  const getSalesmanName = (salesmanId) => {
    if (!salesmanId) return 'Not Assigned';
    const salesman = salesmen.find(s => s.account_id === salesmanId);
    return salesman ? salesman.account_name : 'Unknown Salesman';
  };

  // Handle form submission
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

    // Prepare data for API including salesman
    const selectedSalesman = salesmen.find(s => s.account_id === parseInt(formData.salesman_id));
    
    const submitData = {
      scheduled_date: formData.scheduled_date,
      customer_id: parseInt(formData.customer_id),
      warehouse_id: parseInt(formData.warehouse_id),
      barcodes: formData.barcodes,
      salesman_id: formData.salesman_id ? parseInt(formData.salesman_id) : null,
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
      barcodes: [],
      salesman_id: ''  // Reset salesman
    });
    setIsEditing(false);
    setEditingId(null);
    setSelectedBarcodeDetails([]);
    setAvailableBarcodes([]);
    setSelectedBarcodes([]);
    setSearchTerm('');
    setExpandedStates({});
    setExpandedDistricts({});
    setExpandedCities({});
  };

  // Handle edit
  const handleEdit = (schedule) => {
    console.log(`📝 Editing schedule:`, schedule);
    const formattedDate = schedule.scheduled_date 
      ? new Date(schedule.scheduled_date).toISOString().slice(0, 16)
      : '';
    
    setFormData({
      scheduled_date: formattedDate,
      customer_id: schedule.customer_account_id || schedule.customer_id,
      warehouse_id: schedule.warehouse_id || '',
      barcodes: schedule.barcode ? [schedule.barcode] : [],
      salesman_id: schedule.salesman_id || ''  // Set salesman if exists
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

  // Get customer code by account_id
  const getCustomerCode = (accountId) => {
    const customer = customers.find(c => c.account_id === accountId);
    return customer ? customer.customer_id || 'N/A' : 'N/A';
  };

  // Get stock point name by ID
  const getStockPointName = (stockPointId) => {
    const stockPoint = stockPoints.find(s => s.id === stockPointId);
    return stockPoint ? stockPoint.name : 'Unknown Stock Point';
  };

  // Get selected customer name
  const getSelectedCustomerName = () => {
    if (!formData.customer_id) return '-- Select Customer --';
    const customer = customers.find(c => c.account_id === parseInt(formData.customer_id));
    return customer ? `${customer.account_name} ${customer.customer_id ? `(${customer.customer_id})` : ''}` : '-- Select Customer --';
  };

  // Get grouped data for custom dropdown
  const getGroupedData = () => {
    const grouped = {};
    
    customers.forEach(customer => {
      const state = customer.state && customer.state.trim() ? customer.state.trim() : 'Unknown State';
      const district = customer.district && customer.district.trim() ? customer.district.trim() : 'Unknown District';
      const city = customer.city && customer.city.trim() ? customer.city.trim() : 'Unknown City';
      
      if (!grouped[state]) {
        grouped[state] = {};
      }
      if (!grouped[state][district]) {
        grouped[state][district] = {};
      }
      if (!grouped[state][district][city]) {
        grouped[state][district][city] = [];
      }
      grouped[state][district][city].push(customer);
    });
    
    return grouped;
  };

  // Filter data based on search
  const filterData = (data, search) => {
    if (!search) return data;
    const lowerSearch = search.toLowerCase();
    const filtered = {};
    
    Object.keys(data).forEach(state => {
      const stateMatch = state.toLowerCase().includes(lowerSearch);
      const districts = {};
      
      Object.keys(data[state]).forEach(district => {
        const districtMatch = district.toLowerCase().includes(lowerSearch);
        const cities = {};
        
        Object.keys(data[state][district]).forEach(city => {
          const cityMatch = city.toLowerCase().includes(lowerSearch);
          const customersMatch = data[state][district][city].filter(c => 
            c.account_name.toLowerCase().includes(lowerSearch) ||
            (c.customer_id && c.customer_id.toLowerCase().includes(lowerSearch)) ||
            (c.phone && c.phone.includes(lowerSearch))
          );
          
          if (cityMatch || districtMatch || stateMatch || customersMatch.length > 0) {
            cities[city] = customersMatch.length > 0 ? customersMatch : data[state][district][city];
          }
        });
        
        if (Object.keys(cities).length > 0) {
          districts[district] = cities;
        }
      });
      
      if (Object.keys(districts).length > 0) {
        filtered[state] = districts;
      }
    });
    
    return filtered;
  };

  // Toggle state expansion
  const toggleState = (state) => {
    setExpandedStates(prev => ({
      ...prev,
      [state]: !prev[state]
    }));
  };

  // Toggle district expansion
  const toggleDistrict = (state, district) => {
    const key = `${state}|||${district}`;
    setExpandedDistricts(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle city expansion
  const toggleCity = (state, district, city) => {
    const key = `${state}|||${district}|||${city}`;
    setExpandedCities(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle customer selection
  const handleCustomerSelect = (customerId) => {
    setFormData(prev => ({
      ...prev,
      customer_id: customerId.toString()
    }));
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  // Render hierarchical dropdown
  const renderDropdownItems = () => {
    const groupedData = getGroupedData();
    const filteredData = filterData(groupedData, searchTerm);
    
    if (Object.keys(filteredData).length === 0) {
      return (
        <div className="vlws-dropdown-empty">
          <FaUser className="me-2" />
          No customers found
        </div>
      );
    }

    const items = [];
    
    Object.keys(filteredData).sort().forEach(state => {
      const districts = filteredData[state];
      const isStateExpanded = expandedStates[state] || searchTerm;
      const stateCustomerCount = Object.values(districts).reduce((count, districtCities) => {
        return count + Object.values(districtCities).reduce((c, customers) => c + customers.length, 0);
      }, 0);
      
      items.push(
        <div key={`state-${state}`} className="vlws-dropdown-group">
          <div 
            className="vlws-dropdown-group-header"
            onClick={() => toggleState(state)}
          >
            <span className="vlws-dropdown-toggle-icon">
              {isStateExpanded ? <FaChevronDown /> : <FaChevronRight />}
            </span>
            <FaBuilding className="vlws-state-icon" />
            <span className="vlws-dropdown-group-label">{state}</span>
            <Badge bg="secondary" className="vlws-customer-count">{stateCustomerCount} customer(s)</Badge>
          </div>
          
          {isStateExpanded && (
            <div className="vlws-dropdown-group-children">
              {Object.keys(districts).sort().map(district => {
                const cities = districts[district];
                const isDistrictExpanded = expandedDistricts[`${state}|||${district}`] || searchTerm;
                const districtCustomerCount = Object.values(cities).reduce((count, customers) => count + customers.length, 0);
                
                return (
                  <div key={`district-${state}-${district}`} className="vlws-dropdown-subgroup">
                    <div 
                      className="vlws-dropdown-subgroup-header"
                      onClick={() => toggleDistrict(state, district)}
                    >
                      <span className="vlws-dropdown-toggle-icon">
                        {isDistrictExpanded ? <FaChevronDown /> : <FaChevronRight />}
                      </span>
                      <FaCity className="vlws-district-icon" />
                      <span className="vlws-dropdown-subgroup-label">{district}</span>
                      <Badge bg="secondary" className="vlws-customer-count">{districtCustomerCount} customer(s)</Badge>
                    </div>
                    
                    {isDistrictExpanded && (
                      <div className="vlws-dropdown-subgroup-children">
                        {Object.keys(cities).sort().map(city => {
                          const customerList = cities[city];
                          const isCityExpanded = expandedCities[`${state}|||${district}|||${city}`] || searchTerm;
                          
                          return (
                            <div key={`city-${state}-${district}-${city}`} className="vlws-dropdown-subgroup">
                              <div 
                                className="vlws-dropdown-subgroup-header vlws-city-header"
                                onClick={() => toggleCity(state, district, city)}
                              >
                                <span className="vlws-dropdown-toggle-icon">
                                  {isCityExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                </span>
                                <FaMapMarkerAlt className="vlws-city-icon" />
                                <span className="vlws-dropdown-subgroup-label">{city}</span>
                                <Badge bg="secondary" className="vlws-customer-count">{customerList.length} customer(s)</Badge>
                              </div>
                              
                              {isCityExpanded && (
                                <div className="vlws-dropdown-subgroup-children">
                                  {customerList.map(customer => (
                                    <div
                                      key={customer.account_id}
                                      className={`vlws-dropdown-item ${formData.customer_id === customer.account_id.toString() ? 'active' : ''}`}
                                      onClick={() => handleCustomerSelect(customer.account_id)}
                                    >
                                      <FaUser className="vlws-customer-icon" />
                                      <span className="vlws-customer-name">{customer.account_name}</span>
                                      {customer.customer_id && (
                                        <span className="vlws-customer-id">({customer.customer_id})</span>
                                      )}
                                      {customer.phone && (
                                        <span className="vlws-customer-phone">📞 {customer.phone}</span>
                                      )}
                                      {customer.email && (
                                        <span className="vlws-customer-email">✉️ {customer.email}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
    
    return items;
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

                    {/* Customer Dropdown - Custom Hierarchical */}
                    <Col lg={3} md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="vlws-label">
                          <FaUser className="me-1" /> Customer <span className="text-danger">*</span>
                        </Form.Label>
                        <div className="vlws-custom-dropdown" ref={dropdownRef}>
                          <div 
                            className="vlws-dropdown-select"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          >
                            <span className="vlws-dropdown-selected">
                              {getSelectedCustomerName()}
                            </span>
                            <FaChevronDown className={`vlws-dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
                          </div>
                          
                          {isDropdownOpen && (
                            <div className="vlws-dropdown-menu">
                              <div className="vlws-dropdown-search">
                                <FaUser className="vlws-search-icon" />
                                <input
                                  type="text"
                                  placeholder="Search customers by name, ID, or phone..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="vlws-search-input"
                                />
                                {searchTerm && (
                                  <button 
                                    className="vlws-search-clear"
                                    onClick={() => setSearchTerm('')}
                                  >
                                    <FaTimes />
                                  </button>
                                )}
                              </div>
                              <div className="vlws-dropdown-items">
                                {renderDropdownItems()}
                              </div>
                            </div>
                          )}
                        </div>
                        {/* <small className="text-muted mt-1 d-block">
                          <FaMapMarkerAlt className="me-1" />
                          Grouped by State → District → City
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

                    {/* Salesman Dropdown */}
                    <Col lg={3} md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="vlws-label">
                          <FaUserTie className="me-1" /> Salesman (Optional)
                        </Form.Label>
                        <Form.Select
                          name="salesman_id"
                          value={formData.salesman_id}
                          onChange={handleInputChange}
                          className="vlws-select"
                        >
                          <option value="">-- Select Salesman (Optional) --</option>
                          {salesmen.map(salesman => (
                            <option key={salesman.account_id} value={salesman.account_id}>
                              {salesman.account_name} {salesman.phone ? `(${salesman.phone})` : ''}
                            </option>
                          ))}
                        </Form.Select>
                        {salesmen.length === 0 && (
                          <small className="text-muted mt-1 d-block">
                            No salesmen available. You can assign later.
                          </small>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Selected Barcodes Display */}
                  <Row className="mt-2">
                    <Col md={12}>
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
                <strong>Schedule Management:</strong> Select a stock point to see available barcodes, then choose multiple barcodes to associate with the customer visit. You can optionally assign a salesman to this visit.
                <br />
                <small className="text-muted">
                  Note: The customer is identified by their account_id (e.g., 56, 53) which is stored in the schedule.
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
                        <th>Customer</th>
                        <th>Customer Code</th>
                        <th>Stock Point</th>
                        <th>Barcode</th>
                        <th>Salesman</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fetchLoading ? (
                        <tr>
                          <td colSpan="10" className="text-center py-4">
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
                              {schedule.customer_name || getCustomerName(schedule.customer_account_id)}
                              <br />
                              <small className="text-muted">ID: {schedule.customer_account_id}</small>
                            </td>
                            <td>
                              <Badge bg="info">{schedule.customer_id || getCustomerCode(schedule.customer_account_id)}</Badge>
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
                            <td>
                              {schedule.salesman_id ? (
                                <Badge bg="success" className="vlws-salesman-badge">
                                  <FaUserCheck className="me-1" />
                                  {schedule.salesman_name || getSalesmanName(schedule.salesman_id)}
                                </Badge>
                              ) : (
                                <Badge bg="secondary">Not Assigned</Badge>
                              )}
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
                          <td colSpan="10" className="text-center py-4 text-muted">
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

      {/* Barcode Items Modal */}
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