import React, { useEffect, useState, useRef } from "react";
import { Col, Row, Button, Modal } from "react-bootstrap";
import InputField from "./../../Transactions/SalesForm/InputfieldSales";
import axios from "axios";
import baseURL from './../../../../Url/NodeBaseURL';
import { FaCamera, FaTimes } from 'react-icons/fa';

const CustomerDetails = ({
  formData,
  setFormData,
  tabId
}) => {
  const [stockPoints, setStockPoints] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Camera/Image states
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Get username from localStorage
  const userName = localStorage.getItem('userName');
  console.log("Retrieved from localStorage - Key: 'userName', Value:", userName);
  
  useEffect(() => {
    fetchStockPoints();
    fetchSalesmen();
  }, []);

  // Set active stock point based on localStorage value
  useEffect(() => {
    if (stockPoints.length > 0 && userName) {
      console.log("All Stock Points from API:", stockPoints);
      console.log("Looking for stock point with name exactly:", userName);
      
      let matchingStockPoint = stockPoints.find(
        sp => sp.stock_point_name === userName
      );
      
      if (!matchingStockPoint) {
        console.log("Exact match not found, trying case-insensitive match...");
        matchingStockPoint = stockPoints.find(
          sp => sp.stock_point_name?.toLowerCase() === userName.toLowerCase()
        );
      }
      
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

  // UPDATED: When salesman changes, store both ID and name in formData
  const handleSalesmanChange = (e) => {
    const value = e.target.value;
    console.log("Salesman selected:", value);
    
    const selectedSalesman = value ? salesmen.find(s => s.account_id === parseInt(value)) : null;
    
    setFormData(prev => ({
      ...prev,
      salesman_id: value,
      salesman_name: selectedSalesman ? selectedSalesman.account_name : null,
      // Clear barcode and product data when salesman changes
      code: "",
      product_id: "",
      product_name: "",
      metal_type: "",
      design_name: "",
      purity: "",
      category: "",
      sub_category: "",
      gross_weight: "",
      stone_weight: "",
      stone_price: "",
      weight_bw: "",
      va_on: "Gross Weight",
      va_percent: "",
      wastage_weight: "",
      total_weight_av: "",
      mc_on: "MC %",
      mc_per_gram: "",
      making_charges: "",
      disscount_percentage: "",
      disscount: "",
      rate: "",
      pieace_cost: "",
      mrp_price: "",
      rate_amt: "",
      tax_percent: "03% GST",
      tax_amt: "",
      total_price: "",
      qty: "",
      remarks: "",
      sale_status: "Delivered",
      piece_taxable_amt: "",
      festival_discount: "",
      custom_purity: "",
      image: null,
      imagePreview: null,
    }));
  };

  // ============= CAMERA FUNCTIONS =============
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      setShowCamera(true);
      setTimeout(() => { 
        if (videoRef.current) videoRef.current.srcObject = stream; 
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        handleImageUpload(file);
      }, 'image/jpeg');

      stopCamera();
    }
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = {
        file,
        preview: reader.result,
        name: file.name,
        size: file.size
      };
      setCapturedImage(imageData);
      
      // Store the image preview in formData for later use
      setFormData((prev) => ({
        ...prev,
        capture_image: reader.result, // Store base64 image
        capture_image_file: file
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setCapturedImage(null);
    setFormData((prev) => ({
      ...prev,
      capture_image: null,
      capture_image_file: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  // ============= END CAMERA FUNCTIONS =============

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
      <Row className="align-items-end">
        <Col xs={12} md={4}>
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

        <Col xs={12} md={4}>
          <InputField
            label="Salesman"
            name="salesman_id"
            type="select"
            value={formData.salesman_id || ""}
            onChange={handleSalesmanChange}
            options={salesmanOptions}  
          />
        </Col>

        {/* Capture Image Button + Image Preview - takes 4 columns */}
        <Col xs={12} md={4}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            paddingBottom: '4px'
          }}>
            {/* Capture Image Button */}
            <Button 
              onClick={startCamera} 
              variant="outline-primary" 
              size="sm"
              style={{ 
                padding: '6px 14px',
                fontSize: '13px',
                whiteSpace: 'nowrap',
                borderColor: '#a36e29',
                color: '#a36e29',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: "5px",
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'; // Light brown on hover
                // Use 'transparent' if you want no background on hover
                e.currentTarget.style.boxShadow = 'none';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <FaCamera /> Capture Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {/* Image Preview - shown when image is captured */}
            {capturedImage && (
              <div style={{ 
                position: 'relative', 
                display: 'inline-block',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '4px',
                backgroundColor: '#f9f9f9',
                marginTop: '24px'
              }}>
                <img
                  src={capturedImage.preview}
                  alt="Stock Point"
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '4px',
                    objectFit: 'cover'
                  }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#dc3545',
                    border: 'none',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    lineHeight: 1
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Camera Capture Modal */}
      <Modal show={showCamera} onHide={stopCamera} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Capture Image</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: 'center' }}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            style={{ 
              width: '100%', 
              maxHeight: '400px', 
              objectFit: 'contain' 
            }} 
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={stopCamera}>Cancel</Button>
          <Button variant="primary" onClick={captureImage} style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>
            Capture
          </Button>
        </Modal.Footer>
      </Modal>
    </Col>
  );
};

export default CustomerDetails;