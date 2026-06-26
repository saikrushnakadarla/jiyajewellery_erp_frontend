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
  const [isLoading, setIsLoading] = useState(true);
  const [defaultSet, setDefaultSet] = useState(false);
  const [loggedInUserName, setLoggedInUserName] = useState("");

  // Camera/Image states
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Col className="sales-form-section">
      <Row className="align-items-end">
        <Col xs={12} md={4}>
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
                marginTop: '24px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
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