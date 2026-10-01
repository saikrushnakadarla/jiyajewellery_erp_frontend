import React, { useState, useEffect, useRef } from "react";
import InputField from "../../../Pages/InputField/InputField";
import DataTable from "../../../Pages/InputField/TableLayout";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import axios from "axios";
import baseURL from "../../../../Url/NodeBaseURL";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Select from "react-select"; // npm i react-select
import "./StockPoints.css"

// Match LABEL_BG to your form background if the label shows a visible patch
const LABEL_BG = "#efebe8";
const BRAND = "#a36e29";

// react-select styles so the Salesman field matches the other form fields
const salesmanSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 48,
    backgroundColor: "transparent",
    border: `1px solid ${BRAND}`,
    borderRadius: 4,
    boxShadow: state.isFocused ? `0 0 0 1px ${BRAND}` : "none",
    "&:hover": { borderColor: BRAND },
  }),
  valueContainer: (base) => ({ ...base, padding: "4px 10px", gap: 4 }),
  placeholder: (base) => ({ ...base, color: "#757575" }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#f5e9d8",
    border: "1px solid #e0cdb0",
    borderRadius: 4,
  }),
  multiValueLabel: (base) => ({ ...base, color: "#6b4518", fontWeight: 500 }),
  multiValueRemove: (base) => ({
    ...base,
    color: BRAND,
    cursor: "pointer",
    ":hover": { backgroundColor: BRAND, color: "#fff" },
  }),
  indicatorSeparator: (base) => ({ ...base, backgroundColor: "#e0cdb0" }),
  dropdownIndicator: (base) => ({ ...base, color: BRAND }),
  clearIndicator: (base) => ({ ...base, color: BRAND }),
  menu: (base) => ({
    ...base,
    marginTop: 4,
    border: `1px solid ${BRAND}`,
    borderRadius: 6,
    overflow: "hidden",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  }),
  menuList: (base) => ({ ...base, padding: 4, maxHeight: 220 }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }), // stays above other floating labels
  option: (base, state) => ({
    ...base,
    cursor: "pointer",
    padding: "9px 12px",
    borderRadius: 4,
    fontSize: 15,
    backgroundColor: state.isFocused ? "#f5e9d8" : "#fff",
    color: "#4a3412",
    ":active": { backgroundColor: "#ecd9b9" },
  }),
  noOptionsMessage: (base) => ({ ...base, color: "#757575", padding: "10px 12px" }),
};

const EMPTY_FORM = {
  "stock_point_name": "",
  "location": "",
  "warehouse_id": "",
  "description": "",
  "user_name": "",
  "password": "",
  "status": "active",
  "default_status": "not_applied",
  "salesman_ids": []
};

function StockPoints() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  
  const [warehouses, setWarehouses] = useState([]);
  const [salesmen, setSalesmen] = useState([]);   // only account_group === SALESMAN
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
    fetchSalesmen();
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

  // Fetch accounts and keep only SALESMAN (case-insensitive)
  const fetchSalesmen = async () => {
    try {
      const response = await axios.get(`${baseURL}/get/account-details`);
      const onlySalesmen = (response.data || []).filter(
        (acc) => (acc.account_group || "").trim().toUpperCase() === "SALESMAN"
      );
      setSalesmen(onlySalesmen);
    } catch (error) {
      console.error("Error fetching salesmen:", error);
    }
  };

  // Options for the multi-select
  const salesmanOptions = salesmen.map((s) => ({
    value: s.account_id,
    label: `${s.account_name}${s.mobile ? ` (${s.mobile})` : ""}`,
  }));

  const handleSalesmenChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      salesman_ids: (selected || []).map((o) => o.value),
    }));
  };

  // "77,72" -> "KALA, NANI"
  const getSalesmanNames = (ids) => {
    if (!ids) return "-";
    const list = String(ids).split(",").map(Number);
    const names = salesmen
      .filter((s) => list.includes(s.account_id))
      .map((s) => s.account_name);
    return names.length ? names.join(", ") : "-";
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
    
    // Validate user_name if provided
    if (formData.user_name && formData.user_name.trim().length < 3) {
      newErrors.user_name = "User name must be at least 3 characters";
    }
    
    // Validate password if provided
    if (formData.password && formData.password.trim().length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare data for submission (user_id will be auto-generated by backend)
    // salesman_ids (array of account_id) is sent along with the rest of formData
    const submitData = {
      ...formData,
      password: formData.password || null
    };
    
    if (editMode) {
      // Edit functionality
      try {
        const response = await axios.put(`${baseURL}/api/stockpoints/${editId}`, submitData);
        console.log("Data updated:", response.data);
        
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
        const response = await axios.post(`${baseURL}/api/stockpoints`, submitData);
        console.log("Data submitted:", response.data);
        
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
    if (row.default_status === 'applied') {
      alert("Cannot edit the default stock point!");
      return;
    }
    
    setEditMode(true);
    setEditId(row.stock_point_id);
    setFormData({ 
      stock_point_name: row.stock_point_name,
      location: row.location,
      warehouse_id: row.warehouse_id,
      description: row.description || "",
      user_name: row.user_name || "",
      password: "",  // Don't show password, user will enter new one if needed
      status: row.status || "active",
      default_status: row.default_status || "not_applied",
      // Pre-select existing salesmen when editing
      salesman_ids: row.salesman_ids
        ? String(row.salesman_ids).split(",").map(Number)
        : []
    });
    setErrors({});
    
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleDelete = async (id, default_status) => {
    if (default_status === 'applied') {
      alert("Cannot delete the default stock point!");
      return;
    }
    
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

  const handleApplyDefault = async (id, currentStatus, stockPointName) => {
    if (stockPointName === "MAIN STOCK ROOM") {
      alert("MAIN STOCK ROOM is the default stock point and cannot be changed!");
      return;
    }
    
    alert(`Cannot change default status. Only MAIN STOCK ROOM is the default stock point.`);
    return;
  };

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM, salesman_ids: [] });
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
      
      await fetchWarehouses();
      
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

  // Mask password for display
  const maskPassword = (password) => {
    if (!password) return "Not set";
    return "•".repeat(Math.min(password.length, 8));
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
        Header: "User Name",
        accessor: "user_name",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Password",
        accessor: "password",
        Cell: ({ value }) => maskPassword(value),
      },
      {
        Header: "Salesman",
        accessor: "salesman_ids",
        Cell: ({ value }) => getSalesmanNames(value),
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <span style={{ 
            color: value === 'active' ? 'green' : 'red',
            fontWeight: 'bold'
          }}>
            {value?.toUpperCase()}
          </span>
        ),
      },
      {
        Header: "Default Column",
        Cell: ({ row }) => {
          const isApplied = row.original.default_status === 'applied';
          const isMainStockRoom = row.original.stock_point_name === "MAIN STOCK ROOM";
          
          const isButtonDisabled = isApplied || isMainStockRoom || applyingId === row.original.stock_point_id;
          
          let buttonText = 'Apply';
          let buttonColor = '#ffc107';
          
          if (isMainStockRoom) {
            buttonText = 'Default';
            buttonColor = '#28a745';
          } else if (isApplied) {
            buttonText = 'Applied';
            buttonColor = '#6c757d';
          }
          
          return (
            <button
              onClick={() => handleApplyDefault(
                row.original.stock_point_id, 
                row.original.default_status,
                row.original.stock_point_name
              )}
              disabled={isButtonDisabled}
              style={{
                padding: '5px 15px',
                backgroundColor: buttonColor,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
                opacity: isButtonDisabled ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {applyingId === row.original.stock_point_id 
                ? 'Applying...' 
                : buttonText}
            </button>
          );
        },
      },
      {
        Header: "Action",
        Cell: ({ row }) => {
          const isDefaultStockPoint = row.original.default_status === 'applied' || row.original.stock_point_name === "MAIN STOCK ROOM";
          
          return (
            <div>
              <FaEdit
                style={{ 
                  cursor: isDefaultStockPoint ? 'not-allowed' : 'pointer', 
                  marginLeft: '10px', 
                  color: isDefaultStockPoint ? '#ccc' : 'blue',
                  opacity: isDefaultStockPoint ? 0.5 : 1
                }}
                onClick={() => {
                  if (!isDefaultStockPoint) {
                    handleEdit(row.original);
                  } else {
                    alert("Cannot edit the default stock point!");
                  }
                }}
              />
              <FaTrash
                style={{ 
                  cursor: isDefaultStockPoint ? 'not-allowed' : 'pointer', 
                  marginLeft: '10px', 
                  color: isDefaultStockPoint ? '#ccc' : 'red',
                  opacity: isDefaultStockPoint ? 0.5 : 1
                }}
                onClick={() => {
                  if (!isDefaultStockPoint) {
                    handleDelete(row.original.stock_point_id, row.original.default_status);
                  } else {
                    alert("Cannot delete the default stock point!");
                  }
                }}
              />
            </div>
          );
        },
      },
    ],
    [submittedData, warehouses, salesmen, applyingId]
  );

  return (
    <div className="main-container">
      <div className="customer-master-container" style={{marginTop:"80px"}}>
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
              label="User Name"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              error={errors.user_name}
              placeholder="Enter user name (optional)"
            />
            
            <InputField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder={editMode ? "Enter new password (leave blank to keep current)" : "Enter password (optional)"}
            />
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

          {/* Salesman multi-select: placed below all other fields */}
          <div className="form-row">
            <div style={{ position: "relative", flex: 1 }}>
              <label
                style={{
                  position: "absolute",
                  top: -10,
                  left: 12,
                  padding: "0 6px",
                  background: LABEL_BG,
                  color: BRAND,
                  fontWeight: 700,
                  fontSize: "14px",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              >
                Salesman
              </label>
              <Select
                isMulti
                isClearable
                options={salesmanOptions}
                value={salesmanOptions.filter((o) =>
                  formData.salesman_ids.includes(o.value)
                )}
                onChange={handleSalesmenChange}
                placeholder="Select salesman(s) (optional)"
                closeMenuOnSelect={true}
                hideSelectedOptions={true}
                blurInputOnSelect={false}
                maxMenuHeight={220}
                menuPlacement="auto"
                noOptionsMessage={() => "No more salesman to select"}
                styles={salesmanSelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>
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