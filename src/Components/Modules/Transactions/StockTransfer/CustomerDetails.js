import React, { useEffect, useState, useRef } from "react";
import { Col, Row, Button, Modal } from "react-bootstrap";
import InputField from "./../../Transactions/SalesForm/InputfieldSales";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import baseURL from './../../../../Url/NodeBaseURL';
import { FaCamera, FaTimes } from 'react-icons/fa';

const CustomerDetails = ({
  formData,
  setFormData,
  tabId
}) => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [stockPoints, setStockPoints] = useState([]);
  
  // Camera/Image states
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
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
        stock_point_image: reader.result, // Store base64 image
        stock_point_image_file: file
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setCapturedImage(null);
    setFormData((prev) => ({
      ...prev,
      stock_point_image: null,
      stock_point_image_file: null
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

  return (
    <>
      <Col className="sales-form-section">
        <Row className="align-items-end">
          {/* Active Stock Point - takes 4 columns */}
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

          {/* Other Stock Point - takes 4 columns */}
          <Col xs={12} md={4}>
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
      </Col>

      {/* Camera Capture Modal */}
      <Modal show={showCamera} onHide={stopCamera} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Capture Stock Point Image</Modal.Title>
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
    </>
  );
};

export default CustomerDetails;