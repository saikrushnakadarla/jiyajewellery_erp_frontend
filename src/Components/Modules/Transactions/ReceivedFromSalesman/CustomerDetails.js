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
  estimatesData = [],
  data = [] // opening_tags_entry data
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

  // States for StockOutWard
  const [stockOutWardOptions, setStockOutWardOptions] = useState([]);
  const [selectedStockOutWard, setSelectedStockOutWard] = useState("");
  const [stockOutWardGrossWt, setStockOutWardGrossWt] = useState("");
  
  // Get username from localStorage
  const userName = localStorage.getItem('userName');
  console.log("Retrieved from localStorage - Key: 'userName', Value:", userName);

  // ===== Calculate total gross weight of products with Status = "Assigned" ONLY =====
  const calculateTotalGrossWeight = () => {
    if (!selectedSalesmanProducts || selectedSalesmanProducts.length === 0) {
      return 0;
    }
    
    // Filter products that have Status = "Assigned" in the opening_tags_entry data
    const assignedProducts = selectedSalesmanProducts.filter(product => {
      const tag = data.find(t => t.PCode_BarCode === product.PCode_BarCode);
      return tag && tag.Status === "Assigned";
    });
    
    let totalGrossWt = 0;
    assignedProducts.forEach(product => {
      totalGrossWt += parseFloat(product.gross_weight) || 0;
    });
    
    console.log("Total Gross Weight for Assigned products only:", totalGrossWt.toFixed(3));
    return totalGrossWt;
  };

  // ===== Build StockOutWard options - SIMILAR TO PRODUCT DETAILS =====
  useEffect(() => {
    const buildStockOutWardOptions = () => {
      const options = [];
      const seenPacketBarcodes = new Set();
      const seenProductCodes = new Set();

      console.log("Building StockOutWard options...");
      console.log("selectedSalesmanProducts:", selectedSalesmanProducts);
      console.log("data (opening_tags_entry):", data);
      console.log("estimatesData:", estimatesData);

      // ===== GET ASSIGNED PRODUCTS WITH STATUS "ASSIGNED" =====
      // Only include products that are still assigned (not yet received/transferred)
      const assignedProducts = selectedSalesmanProducts.filter(product => {
        const tag = data.find(t => t.PCode_BarCode === product.PCode_BarCode);
        return tag && tag.Status === "Assigned";
      });

      console.log("Assigned products with Status='Assigned':", assignedProducts);

      // ===== 1. ADD PACKET BARCODES (from estimates) =====
      if (estimatesData && estimatesData.length > 0 && data && data.length > 0) {
        const packetMap = {};
        
        estimatesData.forEach(est => {
          if (est.packet_barcode && est.code) {
            // Check if this product is assigned to the salesman with Status "Assigned"
            const isAssigned = assignedProducts.some(
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

        // Add packet options
        Object.keys(packetMap).forEach(packetBarcode => {
          if (!seenPacketBarcodes.has(packetBarcode)) {
            seenPacketBarcodes.add(packetBarcode);
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
            // Mark products in this packet as seen
            productsInPacket.forEach(p => seenProductCodes.add(p.code));
          }
        });
      }

      // ===== 2. ADD INDIVIDUAL BARCODES (products with Status "Assigned") =====
      assignedProducts.forEach((product) => {
        const productCode = product.PCode_BarCode;
        
        // Check if this product already has a packet barcode
        const hasPacketBarcode = estimatesData.some(est => 
          est.code === productCode && est.packet_barcode
        );
        
        // Only add if not already in a packet and not already seen
        if (!hasPacketBarcode && !seenProductCodes.has(productCode)) {
          seenProductCodes.add(productCode);
          options.push({
            value: productCode,
            label: `${productCode} - ${product.product_name || product.sub_category || 'Product'}`,
            type: "barcode",
            grossWeight: parseFloat(product.gross_weight) || 0,
            packetBarcode: null,
            product: product
          });
        }
      });

      setStockOutWardOptions(options);
      console.log("Final StockOutWard Options:", options);
    };

    buildStockOutWardOptions();
  }, [selectedSalesmanProducts, estimatesData, data]);

  // ===== Handle StockOutWard selection =====
  const handleStockOutWardChange = (e) => {
    const selectedValue = e.target.value;
    console.log("StockOutWard selected:", selectedValue);
    setSelectedStockOutWard(selectedValue);
    
    const selectedOption = stockOutWardOptions.find(opt => opt.value === selectedValue);
    
    if (selectedOption) {
      const grossWt = parseFloat(selectedOption.grossWeight) || 0;
      setStockOutWardGrossWt(grossWt.toFixed(3));
      
      setFormData(prev => ({
        ...prev,
        stock_outward_barcode: selectedValue,
        stock_outward_gross_wt: grossWt.toFixed(3),
        stock_outward_type: selectedOption.type || null,
        stock_outward_packet_barcode: selectedOption.packetBarcode || null
      }));
      
      console.log("Updated formData with stock_outward_barcode:", selectedValue);
    } else {
      // When "Select Barcode/Packet" is chosen, show total weight of all assigned products
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

  // ===== Update StockOutWardGrossWt whenever salesman changes =====
  useEffect(() => {
    if (formData.salesman_id && selectedSalesmanProducts.length > 0) {
      const totalGrossWt = calculateTotalGrossWeight();
      setStockOutWardGrossWt(totalGrossWt.toFixed(3));
      
      setFormData(prev => ({
        ...prev,
        stock_outward_gross_wt: totalGrossWt.toFixed(3)
      }));
      
      setSelectedStockOutWard("");
      
      console.log("Total Gross Weight for Assigned products:", totalGrossWt.toFixed(3));
    } else {
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
  }, [formData.salesman_id, formData.active_stock_point_id]);

  useEffect(() => {
    fetchStockPoints();
    fetchSalesmen();
  }, []);

  // Set active stock point based on localStorage value
  useEffect(() => {
    if (stockPoints.length > 0 && userName) {
      let matchingStockPoint = stockPoints.find(
        sp => sp.stock_point_name === userName
      );
      
      if (!matchingStockPoint) {
        matchingStockPoint = stockPoints.find(
          sp => sp.stock_point_name?.toLowerCase() === userName.toLowerCase()
        );
      }
      
      if (!matchingStockPoint) {
        matchingStockPoint = stockPoints.find(
          sp => sp.stock_point_name?.toLowerCase().trim() === userName.toLowerCase().trim()
        );
      }
      
      if (matchingStockPoint) {
        setFormData(prev => ({
          ...prev,
          active_stock_point_id: matchingStockPoint.stock_point_id.toString(),
          active_stock_point_details: matchingStockPoint
        }));
        setIsLoading(false);
      } else if (stockPoints.length > 0 && !formData.active_stock_point_id) {
        setIsLoading(false);
      }
    } else if (stockPoints.length > 0 && !userName) {
      setIsLoading(false);
    }
  }, [stockPoints, userName]);

  const fetchStockPoints = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/stockpoints`);
      setStockPoints(response.data);
    } catch (error) {
      console.error("Error fetching stock points:", error);
      setIsLoading(false);
    }
  };

  const fetchSalesmen = async () => {
    try {
      const response = await axios.get(`${baseURL}/get/account-details`);
      const filteredSalesmen = response.data.filter(
        account => account.account_group === "SALESMAN"
      );
      setSalesmen(filteredSalesmen);
    } catch (error) {
      console.error("Error fetching salesmen:", error);
    }
  };

  const handleSalesmanChange = (e) => {
    const value = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      salesman_id: value,
      salesman_name: value ? salesmen.find(s => s.account_id === parseInt(value))?.account_name : null
    }));
  };

  const handleActiveStockPointChange = (e) => {
    const value = e.target.value;
    
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

  // Count available products with Status === "Assigned"
  const assignedCount = selectedSalesmanProducts.filter(product => {
    const tag = data.find(t => t.PCode_BarCode === product.PCode_BarCode);
    return tag && tag.Status === "Assigned";
  }).length;

  // Get the selected option to display additional info
  const selectedOption = stockOutWardOptions.find(opt => opt.value === selectedStockOutWard);

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
          {formData.salesman_id && (
            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
              Assigned products available: {assignedCount}
            </div>
          )}
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
          {formData.salesman_id && (
            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
              {stockOutWardOptions.length === 0 && assignedCount > 0 && (
                <span style={{ color: '#dc3545', display: 'block' }}>
                  ⚠️ No products found with Status="Assigned". They may have been already received.
                </span>
              )}
              {stockOutWardOptions.length === 0 && assignedCount === 0 && (
                <span style={{ color: '#dc3545', display: 'block' }}>
                  ⚠️ No assigned products found for this salesman.
                </span>
              )}
              {stockOutWardOptions.length > 0 && assignedCount > 0 && (
                <span style={{ color: '#28a745', display: 'block' }}>
                  ✓ {stockOutWardOptions.length} product(s) available for transfer
                </span>
              )}
              {selectedOption && selectedOption.type === "packet" && (
                <span style={{ color: '#007bff', display: 'block', fontSize: '10px' }}>
                  📦 Packet contains {selectedOption.products?.length || 0} products
                </span>
              )}
            </div>
          )}
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
          {formData.salesman_id && (
            <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
              Total weight of all assigned products: {calculateTotalGrossWeight().toFixed(3)}g
            </div>
          )}
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