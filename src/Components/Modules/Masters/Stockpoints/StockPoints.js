import React, { useState, useEffect, useRef } from "react";
import InputField from "../../../Pages/InputField/InputField";
import DataTable from "../../../Pages/InputField/TableLayout";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import baseURL from "../../../../Url/NodeBaseURL";

function StockPoints() {
  const [formData, setFormData] = useState({
    "stock_point_name": "",
    "location": "",
    "warehouse_id": "",
    "description": "",
    "status": "active"
  });
  
  const [warehouses, setWarehouses] = useState([]);
  const formRef = useRef(null);
  const [submittedData, setSubmittedData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
 
  useEffect(() => {
    fetchStockPoints();
    fetchWarehouses();
  }, []);

  const fetchStockPoints = async () => {
    try {
      const response = await axios.get(`${baseURL}/stockpoints`);
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
        const response = await axios.put(`${baseURL}/stockpoints/${editId}`, formData);
        console.log("Data updated:", response.data);
        
        // Update the table with the edited data
        setSubmittedData(
          submittedData.map((item) =>
            item.stock_point_id === editId ? { ...formData, stock_point_id: editId } : item
          )
        );
        
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
        setSubmittedData([...submittedData, { ...formData, stock_point_id: response.data.id }]);
        
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
      status: row.status || "active"
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
      await axios.delete(`${baseURL}/stockpoints/${id}`);
      setSubmittedData(submittedData.filter((item) => item.stock_point_id !== id));
      console.log(`Stock point with ID ${id} deleted successfully.`);
      alert("Stock point deleted successfully!");
    } catch (error) {
      console.error("Error deleting record:", error);
      alert(error.response?.data?.message || "Error deleting stock point");
    }
  };

  const resetForm = () => {
    setFormData({
      stock_point_name: "",
      location: "",
      warehouse_id: "",
      description: "",
      status: "active"
    });
    setEditMode(false);
    setEditId(null);
    setErrors({});
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
    [submittedData, warehouses]
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
    </div>
  );
}

export default StockPoints;