import React, { useEffect, useState, useRef } from "react";
import { Col, Row, Button, Modal } from "react-bootstrap";
import InputField from "./../../Transactions/SalesForm/InputfieldSales";
import axios from "axios";
import baseURL from './../../../../Url/NodeBaseURL';
import { FaCamera, FaTimes } from 'react-icons/fa';
import "./CustomerDetails.css"

const CustomerDetails = ({
  formData,
  setFormData,
  tabId,
  selectedSalesmanProducts = [],
  estimatesData = []
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

  // New states for StockOutWard
  const [stockOutWardOptions, setStockOutWardOptions] = useState([]);
  const [selectedStockOutWard, setSelectedStockOutWard] = useState("");
  const [stockOutWardGrossWt, setStockOutWardGrossWt] = useState("");
  
  // Get username from localStorage
  const userName = localStorage.getItem('userName');
  console.log("Retrieved from localStorage - Key: 'userName', Value:", userName);

  // ===== NEW FUNCTION: Calculate total gross weight of all products =====
  const calculateTotalGrossWeight = () => {
    if (!selectedSalesmanProducts || selectedSalesmanProducts.length === 0) {
      return 0;
    }
    
    let totalGrossWt = 0;
    selectedSalesmanProducts.forEach(product => {
      totalGrossWt += parseFloat(product.gross_weight) || 0;
    });
    
    return totalGrossWt;
  };

  // Build StockOutWard options from selectedSalesmanProducts and estimates
  useEffect(() => {
    const buildStockOutWardOptions = () => {
      const options = [];
      const seenBarcodes = new Set();

      // 1. Add Packet Barcodes from estimates (if product has estimate)
      if (estimatesData && estimatesData.length > 0) {
        const packetMap = {};
        estimatesData.forEach(est => {
          if (est.packet_barcode && est.code) {
            const isAssigned = selectedSalesmanProducts.some(
              p => p.PCode_BarCode === est.code
            );
            if (isAssigned) {
              if (!packetMap[est.packet_barcode]) {
                packetMap[est.packet_barcode] = [];
              }
              packetMap[est.packet_barcode].push(est);
            }
          }
        });

        Object.keys(packetMap).forEach(packetBarcode => {
          if (!seenBarcodes.has(packetBarcode)) {
            seenBarcodes.add(packetBarcode);
            const productsInPacket = packetMap[packetBarcode];
            let totalGrossWt = 0;
            productsInPacket.forEach(est => {
              totalGrossWt += parseFloat(est.gross_weight) || 0;
            });
            options.push({
              value: packetBarcode,
              label: `${packetBarcode} (Packet - ${productsInPacket.length} products)`,
              type: "packet",
              grossWeight: totalGrossWt.toFixed(3),
              packetBarcode: packetBarcode,
              products: productsInPacket
            });
          }
        });
      }

      // 2. Add Normal Barcodes (products without packet barcode or not estimated)
      selectedSalesmanProducts.forEach(product => {
        const hasEstimate = estimatesData.some(est => 
          est.code === product.PCode_BarCode && est.packet_barcode
        );
        
        if (!hasEstimate && !seenBarcodes.has(product.PCode_BarCode)) {
          seenBarcodes.add(product.PCode_BarCode);
          options.push({
            value: product.PCode_BarCode,
            label: `${product.PCode_BarCode} - ${product.product_name || product.sub_category || 'Product'}`,
            type: "barcode",
            grossWeight: parseFloat(product.gross_weight) || 0,
            packetBarcode: null,
            product: product
          });
        }
      });

      setStockOutWardOptions(options);
      console.log("StockOutWard Options built:", options);
    };

    buildStockOutWardOptions();
  }, [selectedSalesmanProducts, estimatesData]);

  // ===== UPDATED: Handle StockOutWard selection =====
  const handleStockOutWardChange = (e) => {
    const selectedValue = e.target.value;
    console.log("StockOutWard selected:", selectedValue);
    setSelectedStockOutWard(selectedValue);
    
    // Find the selected option
    const selectedOption = stockOutWardOptions.find(opt => opt.value === selectedValue);
    
    if (selectedOption) {
      // If a specific packet/barcode is selected, show its gross weight
      const grossWt = parseFloat(selectedOption.grossWeight) || 0;
      setStockOutWardGrossWt(grossWt.toFixed(3));
      
      // Update formData with the selection
      setFormData(prev => ({
        ...prev,
        stock_outward_barcode: selectedValue,
        stock_outward_gross_wt: grossWt.toFixed(3),
        stock_outward_type: selectedOption.type || null,
        stock_outward_packet_barcode: selectedOption.packetBarcode || null
      }));
      
      console.log("Updated formData with stock_outward_barcode:", selectedValue);
    } else {
      // If "Select Barcode/Packet" is chosen, show total gross weight
      const totalGrossWt = calculateTotalGrossWeight();
      setStockOutWardGrossWt(totalGrossWt.toFixed(3));
      
      setFormData(prev => ({
        ...prev,
        stock_outward_barcode: null,
        stock_outward_gross_wt: totalGrossWt.toFixed(3),
        stock_outward_type: null,
        stock_outward_packet_barcode: null
      }));
    }
  };

  // ===== NEW: Update StockOutWardGrossWt whenever salesman changes =====
  useEffect(() => {
    if (formData.salesman_id && selectedSalesmanProducts.length > 0) {
      // When salesman is selected, calculate and display total gross weight of all products
      const totalGrossWt = calculateTotalGrossWeight();
      setStockOutWardGrossWt(totalGrossWt.toFixed(3));
      
      // Also update formData with the total gross weight
      setFormData(prev => ({
        ...prev,
        stock_outward_gross_wt: totalGrossWt.toFixed(3)
      }));
      
      // Reset selected dropdown to default
      setSelectedStockOutWard("");
      
      console.log("Total Gross Weight for Salesman:", totalGrossWt.toFixed(3));
    } else {
      // If no salesman selected, clear the field
      setStockOutWardGrossWt("");
      setFormData(prev => ({
        ...prev,
        stock_outward_gross_wt: null
      }));
    }
  }, [formData.salesman_id, selectedSalesmanProducts]);

  // Reset StockOutWard fields when salesman or stock point changes
  useEffect(() => {
    setSelectedStockOutWard("");
    // Don't clear gross weight here, it will be updated by the above useEffect
  }, [formData.salesman_id, formData.active_stock_point_id]);

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
      const response = await axios.get(`${baseURL}/get/account-details`);
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
      
      setFormData((prev) => ({
        ...prev,
        capture_image: reader.result,
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

  // Prepare StockOutWard options for dropdown
  const stockOutWardOptionsList = [
    { value: "", label: "Select Barcode/Packet" },
    ...stockOutWardOptions.map(opt => ({
      value: opt.value,
      label: opt.label
    }))
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Col className="sales-form-section">
      {/* Row 1: Salesman, Active Stock Point, Capture Image */}
      <Row className="align-items-end">
        <Col xs={12} md={4}>
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

        {/* Capture Image Button + Image Preview */}
        <Col xs={12} md={4}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            paddingBottom: '4px'
          }}>
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
                gap: '6px',
                backgroundColor: 'transparent',
                marginBottom:"5px"
              }}
              className="capture-image-btn"
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

      {/* Row 2: StockOutWardBarcodes and StockOutWardGrossWT */}
      <Row className="align-items-end" style={{ marginTop: '10px' }}>
        <Col xs={12} md={4}>
          <InputField
            label="StockOutWard Barcodes *"
            name="stock_outward_barcode"
            type="select"
            value={selectedStockOutWard || ""}
            onChange={handleStockOutWardChange}
            options={stockOutWardOptionsList}
            required
          />
        </Col>

        <Col xs={12} md={4}>
          <InputField
            label="StockOutWard Gross WT"
            name="stock_outward_gross_wt"
            type="text"
            value={stockOutWardGrossWt}
            readOnly
            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
          />
        </Col>

        <Col xs={12} md={4}>
          {/* Empty column for alignment */}
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