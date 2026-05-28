import React, { useState, useEffect, useRef } from "react";
import InputField from "../../../Pages/InputField/InputField";
import DataTable from "../../../Pages/InputField/TableLayout";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import axios from "axios";
import baseURL from "../../../../Url/NodeBaseURL";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "./StockPoints.css"

function StockPoints() {
  const [formData, setFormData] = useState({
    "stock_point_name": "",
    "location": "",
    "warehouse_id": "",
    "description": "",
    "status": "active",
    "default_status": "not_applied"
  });
  
  const [warehouses, setWarehouses] = useState([]);
  const formRef = useRef(null);
  const [submittedData, setSubmittedData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [applyingId, setApplyingId] = useState(null);
  
  // Modal states
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [warehouseFormData, setWarehouseFormData] = useState({
    warehouse_name: "",
    location: "",
    status: "active"
  });
  const [warehouseErrors, setWarehouseErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStockPoints();
    fetchWarehouses();
  }, []);

  const fetchStockPoints = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/stockpoints`);
      setSubmittedData(response.data);
    } catch (error) {
      console.error("Error fetching stock points:", error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/warehouse`);
      setWarehouses(response.data);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;
    
    if (name === "stock_point_name") {
      updatedValue = value.toUpperCase();
    }
    
    setFormData({
      ...formData,
      [name]: updatedValue,
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.stock_point_name.trim()) {
      newErrors.stock_point_name = "Stock point name is required";
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    
    if (!formData.warehouse_id) {
      newErrors.warehouse_id = "Please select a warehouse";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (editMode) {
      // Edit functionality
      try {
        const response = await axios.put(`${baseURL}/api/stockpoints/${editId}`, formData);
        console.log("Data updated:", response.data);
        
        // Update the table with the edited data
        await fetchStockPoints();
        
        resetForm();
        alert("Stock point updated successfully!");
      } catch (error) {
        console.error("Error updating data:", error);
        alert(error.response?.data?.message || "Error updating stock point");
      }
    } else {
      // Add functionality
      try {
        const response = await axios.post(`${baseURL}/api/stockpoints`, formData);
        console.log("Data submitted:", response.data);
        
        // Update the table with the new data
        await fetchStockPoints();
        
        resetForm();
        alert("Stock point created successfully!");
      } catch (error) {
        console.error("Error submitting data:", error);
        alert(error.response?.data?.message || "Error creating stock point");
      }
    }
  };

  const handleEdit = (row) => {
    setEditMode(true);
    setEditId(row.stock_point_id);
    setFormData({ 
      stock_point_name: row.stock_point_name,
      location: row.location,
      warehouse_id: row.warehouse_id,
      description: row.description || "",
      status: row.status || "active",
      default_status: row.default_status || "not_applied"
    });
    setErrors({});
    
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the stock point with ID ${id}?`);
    
    if (!isConfirmed) {
      return;
    }
    
    try {
      await axios.delete(`${baseURL}/api/stockpoints/${id}`);
      await fetchStockPoints();
      console.log(`Stock point with ID ${id} deleted successfully.`);
      alert("Stock point deleted successfully!");
    } catch (error) {
      console.error("Error deleting record:", error);
      alert(error.response?.data?.message || "Error deleting stock point");
    }
  };

  // New function to handle apply/unapply
  const handleApplyDefault = async (id, currentStatus) => {
    setApplyingId(id);
    
    try {
      // If current status is 'applied', we don't need to do anything
      if (currentStatus === 'applied') {
        alert("This stock point is already set as default!");
        return;
      }
      
      // Call API to update default stock point
      const response = await axios.put(`${baseURL}/api/stockpoints/${id}/default`);
      
      if (response.status === 200) {
        // Refresh the table data to reflect changes
        await fetchStockPoints();
        alert("Default stock point updated successfully!");
      }
    } catch (error) {
      console.error("Error updating default stock point:", error);
      alert(error.response?.data?.message || "Error updating default stock point");
    } finally {
      setApplyingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      stock_point_name: "",
      location: "",
      warehouse_id: "",
      description: "",
      status: "active",
      default_status: "not_applied"
    });
    setEditMode(false);
    setEditId(null);
    setErrors({});
  };

  // Warehouse Modal Handlers
  const handleOpenWarehouseModal = () => {
    setShowWarehouseModal(true);
    setWarehouseFormData({
      warehouse_name: "",
      location: "",
      status: "active"
    });
    setWarehouseErrors({});
  };

  const handleCloseWarehouseModal = () => {
    setShowWarehouseModal(false);
    setWarehouseFormData({
      warehouse_name: "",
      location: "",
      status: "active"
    });
    setWarehouseErrors({});
    setIsSubmitting(false);
  };

  const handleWarehouseChange = (e) => {
    const { name, value } = e.target;
    setWarehouseFormData({
      ...warehouseFormData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (warehouseErrors[name]) {
      setWarehouseErrors({
        ...warehouseErrors,
        [name]: ""
      });
    }
  };

  const validateWarehouseForm = () => {
    const newErrors = {};
    
    if (!warehouseFormData.warehouse_name.trim()) {
      newErrors.warehouse_name = "Warehouse name is required";
    }
    
    if (!warehouseFormData.location.trim()) {
      newErrors.location = "Location is required";
    }
    
    setWarehouseErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddWarehouse = async (e) => {
    e.preventDefault();
    
    if (!validateWarehouseForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${baseURL}/api/warehouse`, warehouseFormData);
      console.log("Warehouse added:", response.data);
      
      // Refresh warehouse list
      await fetchWarehouses();
      
      // Auto-select the newly added warehouse
      if (response.data.warehouse_id) {
        setFormData({
          ...formData,
          warehouse_id: response.data.warehouse_id
        });
      }
      
      alert("Warehouse added successfully!");
      handleCloseWarehouseModal();
    } catch (error) {
      console.error("Error adding warehouse:", error);
      alert(error.response?.data?.message || "Error adding warehouse");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWarehouseName = (warehouseId) => {
    const warehouse = warehouses.find(w => w.warehouse_id === warehouseId);
    return warehouse ? warehouse.warehouse_name : "N/A";
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Sr. No.",
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: "Stock Point Name",
        accessor: "stock_point_name",
      },
      {
        Header: "Location",
        accessor: "location",
      },
      {
        Header: "Warehouse",
        accessor: "warehouse_id",
        Cell: ({ value }) => getWarehouseName(value),
      },
      {
        Header: "Description",
        accessor: "description",
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <span style={{ 
            color: value === 'active' ? 'green' : 'red',
            fontWeight: 'bold'
          }}>
            {value.toUpperCase()}
          </span>
        ),
      },
      {
        Header: "Default Column",
        Cell: ({ row }) => {
          const isApplied = row.original.default_status === 'applied';
          return (
            <button
              onClick={() => handleApplyDefault(row.original.stock_point_id, row.original.default_status)}
              disabled={applyingId === row.original.stock_point_id || isApplied}
              style={{
                padding: '5px 15px',
                backgroundColor: isApplied ? '#28a745' : '#ffc107',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: applyingId === row.original.stock_point_id || isApplied ? 'not-allowed' : 'pointer',
                opacity: applyingId === row.original.stock_point_id || isApplied ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!isApplied && applyingId !== row.original.stock_point_id) {
                  e.target.style.backgroundColor = '#e0a800';
                }
              }}
              onMouseLeave={(e) => {
                if (!isApplied && applyingId !== row.original.stock_point_id) {
                  e.target.style.backgroundColor = '#ffc107';
                }
              }}
            >
              {applyingId === row.original.stock_point_id 
                ? 'Applying...' 
                : isApplied 
                  ? 'Unapply' 
                  : 'Apply'}
            </button>
          );
        },
      },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div>
            <FaEdit
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue' }}
              onClick={() => handleEdit(row.original)}
            />
            <FaTrash
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
              onClick={() => handleDelete(row.original.stock_point_id)}
            />
          </div>
        ),
      },
    ],
    [submittedData, warehouses, applyingId]
  );

  return (
    <div className="main-container">
      <div className="customer-master-container">
        <h3 style={{ textAlign: "center", marginBottom: "30px" }}>
          {editMode ? "Edit Stock Point" : "Add Stock Point"}
        </h3>
        
        <form 
          ref={formRef}
          className="customer-master-form" 
          onSubmit={handleSubmit} 
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        >
          <div className="form-row">
            <InputField
              label="Stock Point Name *"
              name="stock_point_name"
              value={formData.stock_point_name}
              onChange={handleChange}
              required={true}
              error={errors.stock_point_name}
              autoFocus
              placeholder="Enter stock point name"
            />
            
            <InputField
              label="Location *"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required={true}
              error={errors.location}
              placeholder="Enter location"
            />
            
            <div style={{ position: 'relative', flex: 1 }}>
              <InputField
                label="Warehouse *"
                name="warehouse_id"
                type="select"
                value={formData.warehouse_id}
                onChange={handleChange}
                required={true}
                error={errors.warehouse_id}
                options={[
                  { value: '', label: 'Select Warehouse' },
                  ...warehouses.map(warehouse => ({
                    value: warehouse.warehouse_id,
                    label: warehouse.warehouse_name
                  }))
                ]}
              />
              <FaPlus
                style={{
                  position: 'absolute',
                  right: '-25px',
                  top: '10px',
                  cursor: 'pointer',
                  color: '#a36e29',
                  fontSize: '18px',
                  zIndex: 10
                }}
                onClick={handleOpenWarehouseModal}
                title="Add New Warehouse"
              />
            </div>
          </div>
          
          <div className="form-row">
            <InputField
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="Enter description (optional)"
            />
            
            <InputField
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />
          </div>
          
          <div className="sup-button-container">
            <button type="button" className="cus-back-btn" onClick={resetForm}>
              Cancel
            </button>
            <button type="submit" className="cus-submit-btn">
              {editMode ? "Update" : "Save"}
            </button>
          </div>
        </form>
        
        <div style={{ marginTop: "20px" }} className="purity-table-container">
          <DataTable columns={columns} data={[...submittedData].reverse()} />
        </div>
      </div>

      {/* Warehouse Add Modal */}
      <Modal show={showWarehouseModal} onHide={handleCloseWarehouseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#a36e29' }}>Add New Warehouse</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleAddWarehouse}>
            <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <InputField
                  label="Warehouse Name *"
                  name="warehouse_name"
                  value={warehouseFormData.warehouse_name}
                  onChange={handleWarehouseChange}
                  required={true}
                  error={warehouseErrors.warehouse_name}
                  autoFocus
                  placeholder="Enter warehouse name"
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <InputField
                  label="Location *"
                  name="location"
                  value={warehouseFormData.location}
                  onChange={handleWarehouseChange}
                  required={true}
                  error={warehouseErrors.location}
                  placeholder="Enter location"
                />
              </div>
            </div>
            
            <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <InputField
                  label="Status"
                  name="status"
                  type="select"
                  value={warehouseFormData.status}
                  onChange={handleWarehouseChange}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' }
                  ]}
                />
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseWarehouseModal} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddWarehouse}
            disabled={isSubmitting}
            style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
          >
            {isSubmitting ? 'Adding...' : 'Add Warehouse'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default StockPoints;