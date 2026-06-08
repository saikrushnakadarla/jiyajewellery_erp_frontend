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
  const [defaultSet, setDefaultSet] = useState(false);
  
  useEffect(() => {
    fetchStockPoints();
    fetchSalesmen();
  }, []);

  // Force set MAIN STOCK ROOM as default - always run when stockPoints loads
  useEffect(() => {
    if (stockPoints.length > 0 && !defaultSet) {
      console.log("All Stock Points from API:", stockPoints);
      
      // Find MAIN STOCK ROOM (exact match)
      let mainStockRoom = stockPoints.find(
        sp => sp.stock_point_name === "MAIN STOCK ROOM"
      );
      
      // If not found, try case-insensitive
      if (!mainStockRoom) {
        mainStockRoom = stockPoints.find(
          sp => sp.stock_point_name?.toLowerCase() === "main stock room"
        );
      }
      
      // If still not found, try any stock point with "MAIN" in name
      if (!mainStockRoom) {
        mainStockRoom = stockPoints.find(
          sp => sp.stock_point_name?.toUpperCase().includes("MAIN")
        );
      }
      
      if (mainStockRoom) {
        console.log("Setting MAIN STOCK ROOM as default:", mainStockRoom);
        console.log("Stock Point ID:", mainStockRoom.stock_point_id);
        console.log("Stock Point Name:", mainStockRoom.stock_point_name);
        
        // Force set the value regardless of existing formData
        setFormData(prev => ({
          ...prev,
          active_stock_point_id: mainStockRoom.stock_point_id.toString(),
          active_stock_point_details: mainStockRoom
        }));
        setDefaultSet(true);
      } else if (stockPoints.length > 0) {
        // Fallback to first stock point if MAIN STOCK ROOM not found
        console.log("MAIN STOCK ROOM not found, using first stock point:", stockPoints[0]);
        setFormData(prev => ({
          ...prev,
          active_stock_point_id: stockPoints[0].stock_point_id.toString(),
          active_stock_point_details: stockPoints[0]
        }));
        setDefaultSet(true);
      }
      
      setIsLoading(false);
    }
  }, [stockPoints, defaultSet, setFormData]);

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
      const response = await axios.get(`${baseURL}/get/account-details`);
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

  const handleSalesmanChange = (e) => {
    const value = e.target.value;
    console.log("Salesman selected:", value);
    
    setFormData(prev => ({
      ...prev,
      salesman_id: value,
      salesman_name: value ? salesmen.find(s => s.account_id === parseInt(value))?.account_name : null
    }));
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

  // Prepare salesman options
  const salesmanOptions = [
    { value: "", label: "Select Salesman" },
    ...salesmen.map(salesman => ({
      value: salesman.account_id.toString(),
      label: salesman.account_name
    }))
  ];

  // Prepare active stock point options
  const activeStockPointOptions = [
    { value: "", label: "Select Active Stock Point" },
    ...stockPoints.map(sp => ({
      value: sp.stock_point_id.toString(),
      label: `${sp.stock_point_name} (${sp.location})`
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
            label="Salesman *"
            name="salesman_id"
            type="select"
            value={formData.salesman_id || ""}
            onChange={handleSalesmanChange}
            options={salesmanOptions}
            required
          />
        </Col>

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
      </Row>
    </Col>
  );
};

export default CustomerDetails;