import React, { useEffect, useState, useRef } from 'react';
import { Col, Row, Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import InputField from './InputfieldSales';
import axios from 'axios';
import { AiOutlinePlus } from "react-icons/ai";
import baseURL from "../../../../Url/NodeBaseURL2";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaCamera, FaUpload, FaQrcode, FaWeightHanging } from "react-icons/fa";
import Webcam from "react-webcam";
import { Html5QrcodeScanner } from 'html5-qrcode';
import Swal from 'sweetalert2';
import './SalesForm.css';
import "./ProductDetails.css"

const ProductDetails = ({
  handleAdd,
  handleUpdate,
  isEditing,
  formData,
  setFormData,
  data,
  handleChange,
  handleImageChange,
  fileInputRef,
  clearImage,
  captureImage,
  setShowWebcam,
  showWebcam,
  webcamRef,
  setShowOptions,
  showOptions,
  handleBarcodeChange,
  handleProductNameChange,
  handleMetalTypeChange,
  handleDesignNameChange,
  products,
  filteredDesignOptions,
  filteredPurityOptions,
  filteredMetalTypes,
  categoryOptions,
  subcategoryOptions,
  designOptions,
  uniqueProducts,
  purityOptions,
  metaltypeOptions,
  isBarcodeSelected,
  isQtyEditable,
  estimate,
  selectedEstimate,
  handleEstimateChange,
  refreshSalesData,
  fetchCategory,
  fetchSubCategory,
  taxableAmount,
  tabId,
  setIsTotalPriceCleared,
  isManualTotalPriceChange, 
  setIsManualTotalPriceChange,
  offers,
  handleOrderChange,
  selectedOrder,
  orderData,
  visitLogsData,
  itemGrossTotal,
  packetGrossTotal,
  totalWeightWithBag,
  onTotalWeightWithBagChange,
  onCaptureWeight,
  isWeightProcessing = false,
  currentItemId,
  // NEW: Trigger weight camera from parent
  triggerWeightCamera,
  setTriggerWeightCamera,
}) => {

  const [showModal, setShowModal] = useState(false);
  const isByFixed = formData.pricing === "By fixed";
  const navigate = useNavigate();

  const [loggedInUserId, setLoggedInUserId] = useState(null);

  // Barcode scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [isScannerInitialized, setIsScannerInitialized] = useState(false);
  const scannerRef = useRef(null);

  // ============= WEIGHT CAMERA STATES =============
  const [showWeightCamera, setShowWeightCamera] = useState(false);
  const [weightCameraStream, setWeightCameraStream] = useState(null);
  const weightVideoRef = useRef(null);
  const weightCanvasRef = useRef(null);
  const weightFileInputRef = useRef(null);
  const [isProcessingWeight, setIsProcessingWeight] = useState(false);
  const [extractedWeight, setExtractedWeight] = useState(null);
  const [weightCaptureError, setWeightCaptureError] = useState(null);

  // Gemini extraction fields
  const [extractedGrams, setExtractedGrams] = useState(null);
  const [extractedMilligrams, setExtractedMilligrams] = useState(null);
  const [extractedTotalGrams, setExtractedTotalGrams] = useState(null);
  const [extractedRawText, setExtractedRawText] = useState(null);

  // ============= WEIGHT CAPTURE FOR TABLE ITEM =============
  const [weightCaptureItemId, setWeightCaptureItemId] = useState(null);
  const [weightCaptureItemDetails, setWeightCaptureItemDetails] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setLoggedInUserId(parseInt(userId));
    }
  }, []);

  // Watch for trigger from parent (ProductTable)
  useEffect(() => {
    if (triggerWeightCamera && setTriggerWeightCamera) {
      // If we have a currentItemId from the table item, use it
      if (triggerWeightCamera.itemId) {
        setWeightCaptureItemId(triggerWeightCamera.itemId);
        setWeightCaptureItemDetails(triggerWeightCamera.itemDetails || null);
        // Open weight camera
        startWeightCameraForItem(triggerWeightCamera.itemId);
      }
      // Reset trigger
      setTriggerWeightCamera(null);
    }
  }, [triggerWeightCamera]);

  // Initialize scanner when modal opens
  useEffect(() => {
    if (showScanner && !isScannerInitialized) {
      const timer = setTimeout(() => {
        initializeScanner();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showScanner, isScannerInitialized]);

  const initializeScanner = () => {
    const element = document.getElementById('barcode-reader');
    if (!element) {
      console.error('Barcode reader element not found');
      return;
    }

    try {
      const scanner = new Html5QrcodeScanner(
        "barcode-reader",
        { qrbox: { width: 250, height: 250 }, fps: 5 },
        false
      );

      scannerRef.current = scanner;
      scanner.render(
        (decodedText) => handleBarcodeScanSuccess(decodedText),
        (error) => {
          if (error !== "NotFoundException: No MultiFormat Readers were able to detect the code") {
            console.log('Scan error:', error);
          }
        }
      );

      setIsScannerInitialized(true);
    } catch (error) {
      console.error('Scanner initialization failed:', error);
      alert('Failed to initialize camera. Please check permissions.');
      setShowScanner(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try { scannerRef.current.clear(); } catch (error) { console.log('Error clearing scanner:', error); }
      scannerRef.current = null;
    }
    setIsScannerInitialized(false);
    setShowScanner(false);
  };

  const startScanner = () => setShowScanner(true);

  const handleBarcodeScanSuccess = async (decodedText) => {
    try {
      stopScanner();

      Swal.fire({
        title: 'Scanning Product...',
        text: 'Please wait while we process the barcode',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      let barcode = decodedText;
      try {
        const parsedData = JSON.parse(decodedText);
        barcode = parsedData.barcode || parsedData.PCode_BarCode || parsedData.code || parsedData.BarCode || decodedText;
      } catch {
        const barcodeMatch = decodedText.match(/TAG:\s*([A-Z0-9]+)/i);
        if (barcodeMatch) {
          barcode = barcodeMatch[1];
        }
        const altMatch = decodedText.match(/(barcode|Barcode|PCode|code|prefix)[:\s]*([^\s,]+)/i);
        if (altMatch) {
          barcode = altMatch[2];
        }
      }

      console.log("Scanned barcode:", barcode);

      if (barcode) {
        const product = products.find((prod) => String(prod.rbarcode) === String(barcode));
        if (product) {
          Swal.close();
          handleBarcodeChange(barcode);
          Swal.fire({
            icon: 'success',
            title: 'Product Found!',
            text: `Product "${product.product_name}" loaded successfully`,
            timer: 1500,
            showConfirmButton: false
          });
          return;
        }

        const tag = data.find((tag) => String(tag.PCode_BarCode) === String(barcode));
        if (tag) {
          if (formData.salesman_id) {
            const salesmanId = parseInt(formData.salesman_id);
            const isScheduled = visitLogsData?.some(
              log => log.salesman_id === salesmanId && log.barcode === String(barcode)
            );
            if (!isScheduled) {
              Swal.close();
              Swal.fire({
                icon: 'error',
                title: 'Product Not Scheduled',
                text: `This product is not scheduled for ${formData.salesman_name || 'selected salesman'}.`,
                confirmButtonText: 'OK'
              });
              return;
            }
          }

          if (tag.Status !== "Available") {
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'Product Not Available',
              text: `This product is not available (Status: ${tag.Status})`,
              confirmButtonText: 'OK'
            });
            return;
          }

          if (tag.Stock_Point === "MAIN STOCK ROOM") {
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'Product Not Assigned',
              text: 'This product is still in MAIN STOCK ROOM and cannot be assigned to a salesman.',
              confirmButtonText: 'OK'
            });
            return;
          }

          if (loggedInUserId && tag.user_id !== loggedInUserId) {
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'Product Not Assigned',
              text: 'This product does not belong to you. You can only transfer products assigned to you.',
              confirmButtonText: 'OK'
            });
            return;
          }

          Swal.close();
          handleBarcodeChange(barcode);
          Swal.fire({
            icon: 'success',
            title: 'Product Found!',
            text: `Product "${tag.sub_category || tag.product_name || 'Product'}" loaded successfully`,
            timer: 1500,
            showConfirmButton: false
          });
          return;
        }

        Swal.close();
        Swal.fire({
          icon: 'warning',
          title: 'Product Not Found',
          text: `No product found with barcode: ${barcode}`,
          confirmButtonText: 'OK'
        });
      } else {
        Swal.close();
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Barcode',
          text: 'Could not extract barcode from QR code. Please try a different barcode.',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      Swal.close();
      console.error('Error processing barcode scan:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error processing barcode. Please try again.'
      });
    }
  };

  const getScheduledBarcodes = () => {
    if (!formData.salesman_id || !visitLogsData || visitLogsData.length === 0) {
      return [];
    }
    const salesmanId = parseInt(formData.salesman_id);
    return visitLogsData
      .filter(log => log.salesman_id === salesmanId)
      .map(log => log.barcode);
  };

  const scheduledBarcodes = getScheduledBarcodes();

  const buildBarcodeOptions = () => {
    const options = [];

    if (!formData.salesman_id) {
      const productOptions = products
        .filter((product) => (formData.category ? product.product_name === formData.category : true))
        .map((product) => ({
          value: product.rbarcode,
          label: product.rbarcode,
          type: "product"
        }));
      options.push(...productOptions);
    }

    if (formData.salesman_id) {
      const scheduledSet = new Set(scheduledBarcodes);
      
      const scheduledTags = data.filter((tag) => {
        if (formData.category && tag.category !== formData.category) return false;
        if (!scheduledSet.has(tag.PCode_BarCode)) return false;
        if (tag.Status !== 'Available') return false;
        if (tag.Stock_Point === 'MAIN STOCK ROOM') return false;
        if (loggedInUserId && tag.user_id !== loggedInUserId) return false;
        return true;
      });

      options.push(
        ...scheduledTags.map((tag) => ({
          value: tag.PCode_BarCode,
          label: tag.PCode_BarCode,
          type: 'tag',
          tagData: tag,
          isScheduled: true
        }))
      );
    } else {
      const stockTags = data.filter((tag) => {
        if (formData.category && tag.category !== formData.category) return false;
        if (tag.Status !== 'Available') return false;
        if (tag.Stock_Point === 'MAIN STOCK ROOM') return false;
        if (tag.user_id === null || tag.user_id === undefined) return false;
        if (loggedInUserId && tag.user_id !== loggedInUserId) return false;
        return true;
      });

      options.push(
        ...stockTags.map((tag) => ({
          value: tag.PCode_BarCode,
          label: tag.PCode_BarCode,
          type: 'tag',
          tagData: tag
        }))
      );
    }

    if (options.length === 0) {
      options.push({
        value: '',
        label: formData.salesman_id ? 'No products scheduled for this salesman' : 'No products available',
        disabled: true
      });
    }

    const uniqueOptions = [];
    const seenValues = new Set();
    for (const option of options) {
      if (!seenValues.has(option.value) && option.value !== '') {
        seenValues.add(option.value);
        uniqueOptions.push(option);
      }
    }

    return uniqueOptions;
  };

  const uniqueBarcodeOptions = buildBarcodeOptions();

  const defaultBarcode = formData.category
    ? products.find((product) => product.product_name === formData.category)?.rbarcode || ""
    : "";

  useEffect(() => {
    if (!formData.code && defaultBarcode && !formData.salesman_id) {
      handleBarcodeChange(defaultBarcode);
    }
  }, [formData.category, defaultBarcode, formData.salesman_id]);

  const handleClear = () => {
    setFormData(prevFormData => ({
      ...prevFormData,
      code: "",
      product_id: "",
      metal: "",
      product_name: "",
      metal_type: "",
      design_name: "",
      purity: "",
      pricing: "By Weight",
      category: "",
      sub_category: "",
      gross_weight: "",
      stone_weight: "",
      weight_bw: "",
      stone_price: "",
      va_on: "Gross Weight",
      va_percent: "",
      wastage_weight: "",
      total_weight_av: "",
      mc_on: "MC %",
      disscount_percentage: "",
      disscount: "",
      mc_per_gram: "",
      making_charges: "",
      rate: "",
      pieace_cost: "",
      mrp_price: "",
      rate_amt: "",
      tax_percent: "03% GST",
      tax_amt: "",
      hm_charges: "",
      total_price: "",
      transaction_status: "Stock Transfer",
      qty: "1",
      opentag_id: "",
      product_image: null,
      imagePreview: null,
      sale_status: "Delivered",
      custom_purity: "",
      cover_wt: "",
      card_wt: "",
      packing_wt: "",
    }));
  };

  useEffect(() => {
    const grossWeight = parseFloat(formData.gross_weight) || 0;
    const stoneWeight = parseFloat(formData.stone_weight) || 0;
    const stonePrice = parseFloat(formData.stone_price) || 0;
    const vaPercent = parseFloat(formData.va_percent) || 0;
    const rate = parseFloat(formData.rate) || 0;
    const mcPerGram = parseFloat(formData.mc_per_gram) || 0;
    const taxPercent = parseFloat(formData.tax_percent) || 0;
    const discount = parseFloat(formData.disscount) || 0;
    const festivalDiscount = parseFloat(formData.festival_discount) || 0;
    const qty = parseFloat(formData.qty) || 0;
    const pieceCost = parseFloat(formData.pieace_cost) || 0;

    const weightBW = grossWeight - stoneWeight;

    const wastageWeight =
      formData.va_on === "Gross Weight"
        ? (grossWeight * vaPercent) / 100
        : (weightBW * vaPercent) / 100;

    const totalWeightAW = weightBW + wastageWeight;

    let rateAmt = 0;
    if (formData.pricing === "By fixed") {
      rateAmt = pieceCost * qty;
    } else {
      rateAmt = rate * totalWeightAW;
    }

    let makingCharges = 0;
    let calculatedMcPerGram = null;

    if (formData.mc_on === "MC %") {
      makingCharges = (mcPerGram * rateAmt) / 100;
    } else if (formData.mc_on === "MC / Gram") {
      makingCharges = mcPerGram * totalWeightAW;
    } else if (formData.mc_on === "MC / Piece") {
      const pieceMakingCharges = parseFloat(formData.making_charges) || 0;
      if (pieceMakingCharges && totalWeightAW > 0) {
        calculatedMcPerGram = pieceMakingCharges / totalWeightAW;
        makingCharges = pieceMakingCharges;
      }
    } else {
      makingCharges = parseFloat(formData.making_charges) || 0;
    }

    let taxAmt = 0;
    let totalPrice = 0;

    if (formData.pricing === "By fixed") {
      const taxable = pieceCost * qty;
      taxAmt = (taxPercent * taxable) / 100;
      totalPrice = taxable;

      setFormData(prev => ({
        ...prev,
        piece_taxable_amt: taxable.toFixed(2),
        tax_amt: taxAmt.toFixed(2),
        mrp_price: (totalPrice / qty).toFixed(2),
        total_price: totalPrice.toFixed(2),
      }));
    } else {
      const totalDiscount = discount + festivalDiscount;
      const taxable = rateAmt + stonePrice + makingCharges - totalDiscount;
      taxAmt = (taxable * taxPercent) / 100;
      totalPrice = taxable;
      setFormData(prev => {
        const roundedTaxAmt = parseFloat(taxAmt).toFixed(2);
        const roundedTotalPrice = (Math.round(parseFloat(totalPrice) * 100) / 100).toFixed(2);

        return {
          ...prev,
          tax_amt: taxAmt.toFixed(2),
          total_price: roundedTotalPrice,
        };
      });
    }

    setFormData(prev => ({
      ...prev,
      weight_bw: weightBW.toFixed(2),
      wastage_weight: wastageWeight.toFixed(2),
      total_weight_av: totalWeightAW.toFixed(2),
      rate_amt: rateAmt.toFixed(2),
      making_charges: makingCharges.toFixed(2),
      ...(calculatedMcPerGram !== null && {
        mc_per_gram: calculatedMcPerGram.toFixed(2),
      }),
    }));
  }, [
    formData.gross_weight,
    formData.stone_weight,
    formData.stone_price,
    formData.va_percent,
    formData.va_on,
    formData.rate,
    formData.mc_on,
    formData.mc_per_gram,
    formData.making_charges,
    formData.tax_percent,
    formData.disscount,
    formData.festival_discount,
    formData.qty,
    formData.pieace_cost,
    formData.pricing,
  ]);

  // ============= WEIGHT CAPTURE FUNCTIONS =============

  // Process weight image using Gemini API
  const processWeightImage = async (imageFile) => {
    // Use the barcode as the item identifier
    const targetItemId = weightCaptureItemId || formData.code;
    
    if (!targetItemId) {
      alert("Please select a product first before capturing weight.");
      return;
    }

    setIsProcessingWeight(true);
    setExtractedWeight(null);
    setWeightCaptureError(null);

    try {
      const formDataObj = new FormData();
      formDataObj.append('image', imageFile);
      formDataObj.append('estimate_number', '');
      formDataObj.append('item_id', targetItemId);

      const response = await axios.post(`${baseURL}/api/extract-weight-gemini`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success && response.data.record) {
        const record = response.data.record;

        setExtractedRawText(record.raw_text);
        setExtractedGrams(record.grams);
        setExtractedMilligrams(record.milligrams);
        setExtractedTotalGrams(record.total_grams);

        const weightData = {
          total_grams: record.total_grams,
          grams: record.grams,
          milligrams: record.milligrams,
          raw_text: record.raw_text,
          confidence: record.confidence || 100
        };

        setExtractedWeight(weightData);

        // Notify parent component about the captured weight
        if (onCaptureWeight) {
          // Pass the barcode as the item ID - this will be used to match the item
          onCaptureWeight(targetItemId, weightData);
        }

        // Close weight camera after successful capture
        stopWeightCamera();

        Swal.fire({
          icon: 'success',
          title: '✅ Weight Extracted!',
          html: `
            <div style="font-size: 24px; padding: 10px 0;">
              <strong>${record.total_grams.toFixed(3)} g</strong>
              <div style="font-size: 14px; color: #666; margin-top: 5px;">
                ${record.grams} g / ${record.milligrams} mg
              </div>
              <div style="font-size: 12px; color: #888; margin-top: 5px;">
                Raw: ${record.raw_text}
              </div>
            </div>
          `,
          timer: 3000,
          showConfirmButton: false
        });

        // Reset weight capture item states
        setWeightCaptureItemId(null);
        setWeightCaptureItemDetails(null);

      } else {
        setWeightCaptureError(response.data.message || 'Could not extract weight from image');
        Swal.fire({
          icon: 'warning',
          title: 'Could Not Detect Weight',
          text: response.data.message || 'Please try a clearer photo of the weight machine display.',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      let errorMessage = 'Error processing weight image.';
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      setWeightCaptureError(errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'Extraction Failed',
        text: errorMessage,
        confirmButtonText: 'OK'
      });
    } finally {
      setIsProcessingWeight(false);
    }
  };

  // Start weight camera for a specific item (called from ProductTable)
  const startWeightCameraForItem = (itemId, itemDetails = null) => {
    setWeightCaptureItemId(itemId);
    setWeightCaptureItemDetails(itemDetails);
    
    // Open the camera
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    })
    .then(stream => {
      setWeightCameraStream(stream);
      setShowWeightCamera(true);
      setTimeout(() => { 
        if (weightVideoRef.current) weightVideoRef.current.srcObject = stream; 
      }, 100);
    })
    .catch(error => {
      console.error('Error accessing camera:', error);
      alert('Failed to access camera. Please check permissions.');
    });
  };

  // Start weight camera - called from the Capture Weight button
  const startWeightCamera = () => {
    // If no product is selected in the form, show alert
    if (!formData.code) {
      alert("Please select a product first using the barcode dropdown or scan button.");
      return;
    }

    // If the product is already in the table, use its ID
    // Otherwise, we'll use the barcode as identifier
    const itemId = currentItemId || formData.code;
    
    // Open the camera
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    })
    .then(stream => {
      setWeightCameraStream(stream);
      setShowWeightCamera(true);
      setTimeout(() => { 
        if (weightVideoRef.current) weightVideoRef.current.srcObject = stream; 
      }, 100);
    })
    .catch(error => {
      console.error('Error accessing camera:', error);
      alert('Failed to access camera. Please check permissions.');
    });
  };

  const stopWeightCamera = () => {
    if (weightCameraStream) {
      weightCameraStream.getTracks().forEach(track => track.stop());
      setWeightCameraStream(null);
    }
    setShowWeightCamera(false);
    setWeightCaptureError(null);
  };

  const captureWeightImage = () => {
    if (weightVideoRef.current && weightCanvasRef.current) {
      const video = weightVideoRef.current;
      const canvas = weightCanvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const file = new File([blob], `weight_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        processWeightImage(file);
      }, 'image/jpeg');
    }
  };

  // Trigger weight file upload
  const triggerWeightFileUpload = () => {
    weightFileInputRef.current?.click();
  };

  const handleWeightFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      processWeightImage(file);
    }
    event.target.value = '';
  };

  const scheduledCount = formData.salesman_id ? scheduledBarcodes.length : 0;

  return (
    <Col>
      {/* First Row - Barcode and Action Buttons */}
      <Row>
        {/* Barcode/Rbarcode with Scan Button */}
        <Col xs={12} md={4}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
            <div style={{ flex: 1, minWidth: '100px' }}>
              <InputField
                label="BarCode/Rbarcode"
                name="code"
                value={formData.code || (formData.salesman_id ? '' : defaultBarcode)}
                onChange={(e) => handleBarcodeChange(e.target.value)}
                type="select"
                options={uniqueBarcodeOptions}
                autoFocus
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={startScanner}
              className="scan-barcode-btn"
              style={{ 
                backgroundColor: '#007bff',
                borderColor: '#007bff',
                whiteSpace: 'nowrap',
                padding: '4px 10px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0,
                minWidth: '80px',
                height: '38px',
                marginBottom:"8px"
              }}
              title="Scan Barcode"
            >
              <FaQrcode size={13} /> Scan Barcode
            </Button>
          </div>
        </Col>

        {/* ============= ACTION BUTTONS ============= */}
        <Col xs={12} md={8}>
          <div className="d-flex align-items-center" style={{ gap: '10px', flexWrap: 'wrap' }}>
            {/* 1. Choose / Capture Image Dropdown */}
            <DropdownButton
              id="dropdown-basic-button"
              title="Choose / Capture Image"
              variant="primary"
              size="sm"
              onClick={() => setShowOptions(!showOptions)}
              style={{ minWidth: '170px' }}
            >
              {showOptions && (
                <>
                  <Dropdown.Item
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    <FaUpload /> Choose Image
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setShowWebcam(true)}>
                    <FaCamera /> Capture Image
                  </Dropdown.Item>
                </>
              )}
            </DropdownButton>

            {/* ============= Capture Weight Button - REMOVED as requested ============= */}
            {/* The Capture Weight button is now only available in the table */}

            {/* Hidden file input for weight upload */}
            <input
              ref={weightFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleWeightFileUpload}
              style={{ display: 'none' }}
            />

            {/* 3. Add / Update Button */}
            <Button
              onClick={isEditing ? handleUpdate : handleAdd}
              style={{
                backgroundColor: "#a36e29",
                borderColor: "#a36e29",
                padding: "4px 20px",
                fontSize: "13px",
                whiteSpace: 'nowrap'
              }}
            >
              {isEditing ? "Update" : "Add"}
            </Button>

            {/* 4. Clear Button */}
            <Button
              variant="secondary"
              onClick={handleClear}
              style={{
                backgroundColor: 'gray',
                padding: "4px 20px",
                fontSize: "13px",
                whiteSpace: 'nowrap'
              }}
            >
              Clear
            </Button>
          </div>
        </Col>
      </Row>

      {/* Display extracted weight info */}
      {extractedWeight && (
        <Row style={{ marginTop: '10px' }}>
          <Col xs={12}>
            <div style={{
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '8px',
              padding: '8px 15px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontWeight: 'bold', color: '#155724' }}>
                ✅ Weight Captured:
              </span>
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#0d47a1' }}>
                {extractedTotalGrams?.toFixed(3)} g
              </span>
              <span style={{ fontSize: '14px', color: '#155724' }}>
                ({extractedGrams} g / {extractedMilligrams} mg)
              </span>
              <span style={{ fontSize: '12px', color: '#666' }}>
                Raw: {extractedRawText}
              </span>
              <button
                type="button"
                onClick={() => {
                  setExtractedWeight(null);
                  setExtractedGrams(null);
                  setExtractedMilligrams(null);
                  setExtractedTotalGrams(null);
                  setExtractedRawText(null);
                }}
                style={{
                  background: '#dc3545',
                  border: 'none',
                  color: 'white',
                  borderRadius: '4px',
                  padding: '2px 10px',
                  cursor: 'pointer',
                  marginLeft: 'auto'
                }}
              >
                ✕ Close
              </button>
            </div>
          </Col>
        </Row>
      )}

      {/* Weight capture error */}
      {weightCaptureError && (
        <Row style={{ marginTop: '10px' }}>
          <Col xs={12}>
            <div style={{
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '8px',
              padding: '8px 15px',
              color: '#721c24'
            }}>
              ⚠️ {weightCaptureError}
              <button
                type="button"
                onClick={() => setWeightCaptureError(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#721c24',
                  marginLeft: '10px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
          </Col>
        </Row>
      )}

      {/* Processing indicator */}
      {isProcessingWeight && (
        <Row style={{ marginTop: '10px' }}>
          <Col xs={12}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 15px',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px'
            }}>
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Processing...</span>
              </div>
              <span style={{ color: '#0d47a1' }}>Processing weight image with Gemini AI...</span>
            </div>
          </Col>
        </Row>
      )}

      {/* Weight Totals Display */}
      {itemGrossTotal > 0 && (
        <Row style={{ marginTop: '10px' }}>
          <Col xs={12}>
            <div style={{ 
              display: 'flex', 
              gap: '30px', 
              flexWrap: 'wrap',
              padding: '8px 12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #dee2e6',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontWeight: 'bold', color: '#a36e29' }}>Item Gross Total:</span>
                <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>{itemGrossTotal?.toFixed(3) || '0.000'} g</span>
              </div>
              <div>
                <span style={{ fontWeight: 'bold', color: '#a36e29' }}>Packet Gross Total:</span>
                <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>{packetGrossTotal?.toFixed(3) || '0.000'} g</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#a36e29' }}>Total Weight with Bag:</span>
                <input
                  type="number"
                  step="0.001"
                  placeholder="Enter weight"
                  style={{
                    width: '120px',
                    padding: '4px 8px',
                    border: '2px solid #a36e29',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    color: '#a36e29',
                    backgroundColor: 'white'
                  }}
                  value={totalWeightWithBag || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    if (onTotalWeightWithBagChange) {
                      onTotalWeightWithBagChange(value);
                    }
                  }}
                />
                <span style={{ fontSize: '12px', color: '#6c757d' }}>g</span>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* Hidden input for image upload */}
      <input
        type="file"
        name="image"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleImageChange}
      />

      {/* Webcam capture section */}
      {showWebcam && (
        <div>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={150}
            height={150}
          />
          <Button variant="success" size="sm" onClick={captureImage} style={{ marginRight: "5px" }}>
            Capture
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowWebcam(false)}>
            Cancel
          </Button>
        </div>
      )}

      {/* Image preview with delete option */}
      {formData.imagePreview && (
        <div style={{ position: "relative", display: "inline-block", marginTop: "10px" }}>
          <img
            src={formData.imagePreview}
            alt="Selected"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "8px",
            }}
          />
          <button
            type="button"
            onClick={clearImage}
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              background: "transparent",
              border: "none",
              color: "red",
              fontSize: "16px",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            <FaTrash />
          </button>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <Modal show={showScanner} onHide={stopScanner} centered>
        <Modal.Header closeButton>
          <Modal.Title>Scan Product Barcode</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: 'center', padding: '20px' }}>
          <div id="barcode-reader" style={{ width: '100%', minHeight: '300px' }}></div>
          <p className="mt-3">Point your camera at the product barcode to scan and automatically load product details</p>
          <p className="text-info mt-2">⚠️ Only products assigned to you and with status "Available" can be scanned</p>
          {formData.salesman_id && (
            <p className="text-info mt-1">🔍 Showing only products scheduled for {formData.salesman_name || 'selected salesman'}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={stopScanner}>Cancel Scan</Button>
        </Modal.Footer>
      </Modal>

      {/* ============= WEIGHT CAMERA MODAL ============= */}
      <Modal show={showWeightCamera} onHide={stopWeightCamera} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Capture Weight Machine Display</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: 'center' }}>
          <video 
            ref={weightVideoRef} 
            autoPlay 
            playsInline 
            style={{ 
              width: '100%', 
              maxHeight: '400px', 
              objectFit: 'contain' 
            }} 
          />
          <canvas ref={weightCanvasRef} style={{ display: 'none' }} />
          <p className="mt-2 text-muted">
            Point the camera at the weight machine display to capture and extract the weight using Gemini AI
          </p>
          <p className="text-muted" style={{ fontSize: '12px' }}>
            Or use the "Upload Weight" button below to select an image from your device
          </p>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={triggerWeightFileUpload}
            style={{ marginTop: '5px' }}
          >
            📤 Upload Weight Image
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={stopWeightCamera}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={captureWeightImage} 
            disabled={isProcessingWeight}
            style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
          >
            {isProcessingWeight ? 'Processing...' : 'Capture & Extract Weight'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Col>
  );
};

export default ProductDetails;