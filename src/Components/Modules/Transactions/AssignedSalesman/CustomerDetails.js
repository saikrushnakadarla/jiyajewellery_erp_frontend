import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import InputField from "./../../Transactions/SalesForm/InputfieldSales";
import axios from "axios";
import baseURL from './../../../../Url/NodeBaseURL';

const CustomerDetails = ({
  formData,
  setFormData,
  tabId
}) => {
  const [stockPoints, setStockPoints] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get username from localStorage - FIXED: using correct key 'userName' (lowercase u)
  const userName = localStorage.getItem('userName');
  console.log("Retrieved from localStorage - Key: 'userName', Value:", userName);
  
  // Also check if it exists with different case for debugging
  const userNameUpperCase = localStorage.getItem('UserName');
  console.log("Retrieved from localStorage - Key: 'UserName', Value:", userNameUpperCase);
  
  useEffect(() => {
    fetchStockPoints();
    fetchSalesmen();
  }, []);

  // Set active stock point based on localStorage value
  useEffect(() => {
    if (stockPoints.length > 0 && userName) {
      console.log("All Stock Points from API:", stockPoints);
      console.log("Looking for stock point with name exactly:", userName);
      
      // Try exact match first
      let matchingStockPoint = stockPoints.find(
        sp => sp.stock_point_name === userName
      );
      
      // If not found, try case-insensitive match
      if (!matchingStockPoint) {
        console.log("Exact match not found, trying case-insensitive match...");
        matchingStockPoint = stockPoints.find(
          sp => sp.stock_point_name?.toLowerCase() === userName.toLowerCase()
        );
      }
      
      // If still not found, try trim and case-insensitive
      if (!matchingStockPoint) {
        console.log("Case-insensitive match not found, trying trim and case-insensitive...");
        matchingStockPoint = stockPoints.find(
          sp => sp.stock_point_name?.toLowerCase().trim() === userName.toLowerCase().trim()
        );
      }
      
      console.log("Matching Stock Point found:", matchingStockPoint);
      
      if (matchingStockPoint) {
        console.log("Setting active stock point to ID:", matchingStockPoint.stock_point_id);
        setFormData(prev => ({
          ...prev,
          active_stock_point_id: matchingStockPoint.stock_point_id.toString(),
          active_stock_point_details: matchingStockPoint
        }));
        setIsLoading(false);
      } else if (stockPoints.length > 0 && !formData.active_stock_point_id) {
        console.log("No matching stock point found for:", userName);
        console.log("Available stock point names:", stockPoints.map(sp => sp.stock_point_name));
        // Don't set default, keep it empty so user can select manually
        setIsLoading(false);
      }
    } else if (stockPoints.length > 0 && !userName) {
      console.log("No userName found in localStorage");
      setIsLoading(false);
    }
  }, [stockPoints, userName]);

  const fetchStockPoints = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/stockpoints`);
      console.log("Fetched Stock Points:", response.data);
      setStockPoints(response.data);
    } catch (error) {
      console.error("Error fetching stock points:", error);
      setIsLoading(false);
    }
  };

  const fetchSalesmen = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/get/account-details`);
      console.log("Fetched Salesmen:", response.data);
      
      // Filter accounts with account_group as "SALESMAN"
      const filteredSalesmen = response.data.filter(
        account => account.account_group === "SALESMAN"
      );
      
      console.log("Filtered Salesmen:", filteredSalesmen);
      setSalesmen(filteredSalesmen);
    } catch (error) {
      console.error("Error fetching salesmen:", error);
    }
  };

  const handleActiveStockPointChange = (e) => {
    const value = e.target.value;
    console.log("Manual selection changed to:", value);
    
    setFormData(prev => ({
      ...prev,
      active_stock_point_id: value
    }));

    if (value) {
      const selectedStockPoint = stockPoints.find(sp => sp.stock_point_id === parseInt(value));
      if (selectedStockPoint) {
        setFormData(prev => ({
          ...prev,
          active_stock_point_details: selectedStockPoint
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        active_stock_point_details: null
      }));
    }
  };

  const handleSalesmanChange = (e) => {
    const value = e.target.value;
    console.log("Salesman selected:", value);
    
    setFormData(prev => ({
      ...prev,
      salesman_id: value,
      salesman_name: value ? salesmen.find(s => s.account_id === parseInt(value))?.account_name : null
    }));
  };

  // Prepare active stock point options
  const activeStockPointOptions = [
    { value: "", label: "Select Active Stock Point" },
    ...stockPoints.map(sp => ({
      value: sp.stock_point_id.toString(),
      label: `${sp.stock_point_name} (${sp.location})`
    }))
  ];

  // Prepare salesman options
  const salesmanOptions = [
    { value: "", label: "Select Salesman" },
    ...salesmen.map(salesman => ({
      value: salesman.account_id.toString(),
      label: salesman.account_name
    }))
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
          {/* Debug info - remove in production */}
          {/* {userName && (
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              Expected stock point from login: "{userName}"
            </small>
          )} */}
        </Col>

        <Col xs={12} md={5}>
          <InputField
            label="Salesman"
            name="salesman_id"
            type="select"
            value={formData.salesman_id || ""}
            onChange={handleSalesmanChange}
            options={salesmanOptions}  
          />
        </Col>
      </Row>
    </Col>
  );
};

export default CustomerDetails;