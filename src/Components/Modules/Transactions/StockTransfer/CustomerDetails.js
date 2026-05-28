import React, { useEffect, useState } from "react";
import { Col, Row, Button } from "react-bootstrap";
import InputField from "./../../Transactions/SalesForm/InputfieldSales";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import baseURL from './../../../../Url/NodeBaseURL';

const CustomerDetails = ({
  formData,
  setFormData,
  tabId
}) => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [stockPoints, setStockPoints] = useState([]);
  
  // Initialize formData with empty values if not set
  useEffect(() => {
    if (!formData.active_stock_point_id) {
      setFormData(prev => ({
        ...prev,
        active_stock_point_id: "",
        other_stock_point_id: "",
        active_stock_point_details: null,
        other_stock_point_details: null
      }));
    }
  }, []);

  // Fetch warehouses and stock points on component mount
  useEffect(() => {
    fetchWarehouses();
    fetchStockPoints();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/warehouse`);
      setWarehouses(response.data);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const fetchStockPoints = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/stockpoints`);
      console.log("Fetched Stock Points:", response.data); // Debug log
      setStockPoints(response.data);
    } catch (error) {
      console.error("Error fetching stock points:", error);
    }
  };

  // Get active stock points (where default_status is 'applied')
  const activeStockPoints = stockPoints.filter(
    (sp) => sp.default_status === 'applied'
  );

  // Get all other stock points (excluding the applied one)
  const otherStockPoints = stockPoints.filter(
    (sp) => sp.default_status !== 'applied'
  );

  console.log("Active Stock Points:", activeStockPoints); // Debug log
  console.log("Other Stock Points:", otherStockPoints); // Debug log

  const handleActiveStockPointChange = (e) => {
    const value = e.target.value;
    console.log("Selected Active Stock Point ID:", value); // Debug log
    
    setFormData((prev) => ({
      ...prev,
      active_stock_point_id: value
    }));

    // Find and store the selected stock point details
    if (value) {
      const selectedStockPoint = stockPoints.find(sp => sp.stock_point_id === parseInt(value));
      if (selectedStockPoint) {
        console.log("Active Stock Point Details:", selectedStockPoint); // Debug log
        setFormData((prev) => ({
          ...prev,
          active_stock_point_details: selectedStockPoint
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        active_stock_point_details: null
      }));
    }
  };

  const handleOtherStockPointChange = (e) => {
    const value = e.target.value;
    console.log("Selected Other Stock Point ID:", value); // Debug log
    
    setFormData((prev) => ({
      ...prev,
      other_stock_point_id: value
    }));

    // Find and store the selected stock point details
    if (value) {
      const selectedStockPoint = stockPoints.find(sp => sp.stock_point_id === parseInt(value));
      if (selectedStockPoint) {
        console.log("Other Stock Point Details:", selectedStockPoint); // Debug log
        setFormData((prev) => ({
          ...prev,
          other_stock_point_details: selectedStockPoint
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        other_stock_point_details: null
      }));
    }
  };

  const handleAddReceipt = () => {
    navigate("/receipts", {
      state: {
        from: `/sales?tabId=${tabId}`,
        invoiceData: {
          account_name: formData.account_name,
          mobile: formData.mobile,
        }
      }
    });
  };

  // Create options for active stock points
  const activeStockPointOptions = [
    { value: "", label: "Select Active Stock Point" },
    ...activeStockPoints.map(sp => ({
      value: sp.stock_point_id.toString(),
      label: `${sp.stock_point_name} (${sp.location}) - ${sp.warehouse_name || 'Warehouse ID: ' + sp.warehouse_id}`
    }))
  ];

  // Create options for other stock points
  const otherStockPointOptions = [
    { value: "", label: "Select Other Stock Point" },
    ...otherStockPoints.map(sp => ({
      value: sp.stock_point_id.toString(),
      label: `${sp.stock_point_name} (${sp.location}) - ${sp.warehouse_name || 'Warehouse ID: ' + sp.warehouse_id}`
    }))
  ];

  return (
    <Col className="sales-form-section">
      <Row>
        {/* Active Stock Point Dropdown (where default_status is 'applied') */}
        <Col xs={12} md={5}>
          <InputField
            label="Active Stock Point *"
            name="active_stock_point_id"
            type="select"
            value={formData.active_stock_point_id || ""}
            onChange={handleActiveStockPointChange}
            options={activeStockPointOptions}
            required
          />
          {/* Display selected active stock point details for debugging */}
          {/* {formData.active_stock_point_details && (
            <small style={{ color: 'green', display: 'block', marginTop: '5px' }}>
              Selected: {formData.active_stock_point_details.stock_point_name}
            </small>
          )} */}
        </Col>

        {/* Other Stock Point Dropdown (all except the applied one) */}
        <Col xs={12} md={5}>
          <InputField
            label="Other Stock Point *"
            name="other_stock_point_id"
            type="select"
            value={formData.other_stock_point_id || ""}
            onChange={handleOtherStockPointChange}
            options={otherStockPointOptions}
            required
          />
          {/* Display selected other stock point details for debugging */}
          {/* {formData.other_stock_point_details && (
            <small style={{ color: 'blue', display: 'block', marginTop: '5px' }}>
              Selected: {formData.other_stock_point_details.stock_point_name}
            </small>
          )} */}
        </Col>

        {/* Add Receipt Button */}
        <Col xs={12} md={2}>
          <Button
            style={{
              backgroundColor: '#28a745',
              borderColor: '#28a745',
              fontSize: "13px",
              padding: "5px",
              marginTop: "2px",
              width: "100%"
            }}
            onClick={handleAddReceipt}
          >
            Add Receipt
          </Button>
        </Col>
      </Row>
    </Col>
  );
};

export default CustomerDetails;