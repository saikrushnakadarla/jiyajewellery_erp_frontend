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
  const [isLoading, setIsLoading] = useState(true);
  const [defaultSet, setDefaultSet] = useState(false);
  const [loggedInUserName, setLoggedInUserName] = useState("");

  useEffect(() => {
    // Get logged in user name from localStorage
    const userName = localStorage.getItem('userName') || '';
    console.log("===== CUSTOMER DETAILS =====");
    console.log("Logged in user name from localStorage:", userName);
    console.log("Raw localStorage userName:", localStorage.getItem('userName'));
    console.log("============================");
    setLoggedInUserName(userName);
    
    fetchStockPoints();
  }, []);

  // Force set MAIN STOCK ROOM as default
  useEffect(() => {
    if (stockPoints.length > 0 && !defaultSet) {
      console.log("All Stock Points from API:", stockPoints);
      
      // Find MAIN STOCK ROOM
      let mainStockRoom = stockPoints.find(
        sp => sp.stock_point_name === "MAIN STOCK ROOM"
      );
      
      if (!mainStockRoom) {
        mainStockRoom = stockPoints.find(
          sp => sp.stock_point_name?.toLowerCase() === "main stock room"
        );
      }
      
      if (!mainStockRoom) {
        mainStockRoom = stockPoints.find(
          sp => sp.stock_point_name?.toUpperCase().includes("MAIN")
        );
      }
      
      if (mainStockRoom) {
        console.log("Setting MAIN STOCK ROOM as default:", mainStockRoom);
        setFormData(prev => ({
          ...prev,
          active_stock_point_id: mainStockRoom.stock_point_id.toString(),
          active_stock_point_details: mainStockRoom
        }));
        setDefaultSet(true);
      } else if (stockPoints.length > 0) {
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
        <Col xs={12} md={6}>
          <InputField
            label="From Warehouse Point *"
            name="from_warehouse_point"
            type="text"
            value={loggedInUserName || "Not logged in"}
            disabled={true}
            required
            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
          />
        </Col>

        <Col xs={12} md={6}>
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