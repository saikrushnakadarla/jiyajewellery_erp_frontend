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
      console.log("Fetched Stock Points:", response.data);
      setStockPoints(response.data);
    } catch (error) {
      console.error("Error fetching stock points:", error);
    }
  };

  const activeStockPoints = stockPoints.filter(
    (sp) => sp.default_status === 'applied'
  );

  const otherStockPoints = stockPoints.filter(
    (sp) => sp.default_status !== 'applied'
  );

  // Get the first active stock point and set it as selected automatically
  useEffect(() => {
    if (activeStockPoints.length > 0 && !formData.active_stock_point_id) {
      const firstActive = activeStockPoints[0];
      setFormData((prev) => ({
        ...prev,
        active_stock_point_id: firstActive.stock_point_id.toString(),
        active_stock_point_details: firstActive
      }));
    }
  }, [activeStockPoints]);

  const handleActiveStockPointChange = (e) => {
    const value = e.target.value;
    
    setFormData((prev) => ({
      ...prev,
      active_stock_point_id: value
    }));

    if (value) {
      const selectedStockPoint = stockPoints.find(sp => sp.stock_point_id === parseInt(value));
      if (selectedStockPoint) {
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
    
    setFormData((prev) => ({
      ...prev,
      other_stock_point_id: value
    }));

    if (value) {
      const selectedStockPoint = stockPoints.find(sp => sp.stock_point_id === parseInt(value));
      if (selectedStockPoint) {
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

  const activeStockPointOptions = [
    { value: "", label: "Select Active Stock Point" },
    ...activeStockPoints.map(sp => ({
      value: sp.stock_point_id.toString(),
      label: `${sp.stock_point_name} (${sp.location})`
    }))
  ];

  const otherStockPointOptions = [
    { value: "", label: "Select Other Stock Point" },
    ...otherStockPoints.map(sp => ({
      value: sp.stock_point_id.toString(),
      label: `${sp.stock_point_name} (${sp.location})`
    }))
  ];

  return (
    <Col className="sales-form-section">
      <Row>
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
        </Col>

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
        </Col>
      </Row>
    </Col>
  );
};

export default CustomerDetails;