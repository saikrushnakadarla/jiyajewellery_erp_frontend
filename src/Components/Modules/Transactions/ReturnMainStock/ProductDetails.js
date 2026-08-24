import React, { useEffect, useState, useRef } from 'react';
import { Col, Row, Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import InputField from './InputfieldSales';
import axios from 'axios';
import { AiOutlinePlus } from "react-icons/ai";
import baseURL from "../../../../Url/NodeBaseURL";
import baseURL2 from "../../../../Url/NodeBaseURL2";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaCamera, FaUpload, FaQrcode, FaBarcode, FaWeightHanging } from "react-icons/fa";
import Webcam from "react-webcam";
import { Html5QrcodeScanner } from 'html5-qrcode';
import Swal from 'sweetalert2';
import './SalesForm.css';

const ProductDetails = ({
  handleAdd,
  handleUpdate,
  isEditing,
  formData,
  setFormData,
  setRepairDetails,
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
  selectedSalesmanProducts = [],
  // ============= WEIGHT CAPTURE PROPS =============
  onCaptureWeight,
  isWeightProcessing = false,
  currentItemId,
  triggerWeightCamera,
  setTriggerWeightCamera,
  // ============= BAG WEIGHT PROPS =============
  receivedBagWeight = 0,
  returnCaptureWeightOfBag = 0,
  onReturnCaptureWeightOfBagChange,
  // ============= NEW: Direct weight detection callback =============
  onReceivedBagWeightDetected,
  clearProductTable,
}) => {

  const [showModal, setShowModal] = useState(false);
  const isByFixed = formData.pricing === "By fixed";
  const navigate = useNavigate();
  const [estimatesData, setEstimatesData] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [groupedPacketProducts, setGroupedPacketProducts] = useState({});
  const [isPacketAdded, setIsPacketAdded] = useState(false);

  const [packetImage, setPacketImage] = useState(null);
  const [packetTotals, setPacketTotals] = useState({ grossWeight: 0, packingWt: 0 });

  // Barcode scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [isScannerInitialized, setIsScannerInitialized] = useState(false);
  const scannerRef = useRef(null);

  // Packet Barcode Scanner states
  const [showPacketScanner, setShowPacketScanner] = useState(false);
  const [isPacketScannerInitialized, setIsPacketScannerInitialized] = useState(false);
  const packetScannerRef = useRef(null);

  // ============= WEIGHT CAPTURE STATES =============
  const [showWeightCamera, setShowWeightCamera] = useState(false);
  const [weightCameraStream, setWeightCameraStream] = useState(null);
  const weightVideoRef = useRef(null);
  const weightCanvasRef = useRef(null);
  const weightFileInputRef = useRef(null);
  const [isProcessingWeight, setIsProcessingWeight] = useState(false);
  const [extractedWeight, setExtractedWeight] = useState(null);
  const [weightCaptureError, setWeightCaptureError] = useState(null);
  const [weightCaptureItemId, setWeightCaptureItemId] = useState(null);

  // ============= BAG WEIGHT CAPTURE STATE =============
  const [isBagWeightCapture, setIsBagWeightCapture] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setLoggedInUserId(parseInt(userId));
    }
  }, []);

  // Initialize scanner when modal opens
  useEffect(() => {
    if (showScanner && !isScannerInitialized) {
      const timer = setTimeout(() => {
        initializeScanner();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showScanner, isScannerInitialized]);

  useEffect(() => {
    if (showPacketScanner && !isPacketScannerInitialized) {
      const timer = setTimeout(() => {
        initializePacketScanner();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showPacketScanner, isPacketScannerInitialized]);

  // ============= WEIGHT CAMERA FUNCTIONS =============

  // Process weight image using Gemini API
  const processWeightImage = async (imageFile) => {
    const targetItemId = weightCaptureItemId || formData.code;
    
    setIsProcessingWeight(true);
    setExtractedWeight(null);
    setWeightCaptureError(null);

    try {
      const formDataObj = new FormData();
      formDataObj.append('image', imageFile);
      formDataObj.append('estimate_number', '');
      formDataObj.append('item_id', targetItemId || 'unknown');

      const response = await axios.post(`${baseURL2}/api/extract-weight-gemini`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success && response.data.record) {
        const record = response.data.record;

        const weightData = {
          total_grams: record.total_grams,
          grams: record.grams,
          milligrams: record.milligrams,
          raw_text: record.raw_text,
          confidence: record.confidence || 100
        };

        setExtractedWeight(weightData);

        // ============= NEW: Branch for bag weight capture =============
        if (isBagWeightCapture) {
          if (onReturnCaptureWeightOfBagChange) {
            onReturnCaptureWeightOfBagChange(record.total_grams);
          }
          setIsBagWeightCapture(false);
          stopWeightCamera();
          Swal.fire({
            icon: 'success',
            title: '✅ Bag Weight Captured',
            text: `${record.total_grams.toFixed(3)} g`,
            timer: 1500,
            showConfirmButton: false
          });
          setIsProcessingWeight(false);
          return; // skip the per-item onCaptureWeight path
        }

        // Notify parent component about the captured weight (per-item)
        if (onCaptureWeight) {
          const key = targetItemId && targetItemId !== 'unknown' ? targetItemId : 'total_weight';
          onCaptureWeight(key, weightData);
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
              ${!targetItemId || targetItemId === 'unknown' ? '<div style="font-size: 12px; color: #ff9800; margin-top: 5px;">⚠️ No product selected. Weight saved as total weight.</div>' : ''}
            </div>
          `,
          timer: 3000,
          showConfirmButton: false
        });

        setWeightCaptureItemId(null);

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
    setIsBagWeightCapture(false);
    setWeightCaptureItemId(itemId);

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

  // Start weight camera for bag weight capture
  const startWeightCameraForBag = () => {
    setIsBagWeightCapture(true);
    setWeightCaptureItemId(null);
    
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
    setIsBagWeightCapture(false);
    
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

  // Watch for trigger from parent (ProductTable)
  useEffect(() => {
    if (triggerWeightCamera && setTriggerWeightCamera) {
      if (triggerWeightCamera.itemId) {
        setWeightCaptureItemId(triggerWeightCamera.itemId);
        // Open weight camera
        startWeightCameraForItem(triggerWeightCamera.itemId);
      }
      // Reset trigger
      setTriggerWeightCamera(null);
    }
  }, [triggerWeightCamera]);

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

  const initializePacketScanner = () => {
    const element = document.getElementById('packet-barcode-reader');
    if (!element) {
      console.error('Packet barcode reader element not found');
      return;
    }

    try {
      const scanner = new Html5QrcodeScanner(
        "packet-barcode-reader",
        { qrbox: { width: 250, height: 250 }, fps: 5 },
        false
      );

      packetScannerRef.current = scanner;
      scanner.render(
        (decodedText) => handlePacketBarcodeScanSuccess(decodedText),
        (error) => {
          if (error !== "NotFoundException: No MultiFormat Readers were able to detect the code") {
            console.log('Packet scan error:', error);
          }
        }
      );

      setIsPacketScannerInitialized(true);
    } catch (error) {
      console.error('Packet scanner initialization failed:', error);
      alert('Failed to initialize camera for packet scanning.');
      setShowPacketScanner(false);
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

  const stopPacketScanner = () => {
    if (packetScannerRef.current) {
      try { packetScannerRef.current.clear(); } catch (error) { console.log('Error clearing packet scanner:', error); }
      packetScannerRef.current = null;
    }
    setIsPacketScannerInitialized(false);
    setShowPacketScanner(false);
  };

  const startScanner = () => setShowScanner(true);
  const startPacketScanner = () => setShowPacketScanner(true);

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
        // Check if it's an assigned product
        const assignedProduct = selectedSalesmanProducts?.find(
          (prod) => String(prod.PCode_BarCode) === String(barcode)
        );

        if (assignedProduct) {
          Swal.close();
          handleBarcodeChange(barcode);
          // NEW: Notify parent of bag weight immediately for single item
          if (onReceivedBagWeightDetected) {
            onReceivedBagWeightDetected(assignedProduct.capture_weight_of_bag || 0);
          }
          Swal.fire({
            icon: 'success',
            title: 'Product Found!',
            text: `Product "${assignedProduct.product_name || assignedProduct.sub_category || 'Product'}" loaded successfully`,
            timer: 1500,
            showConfirmButton: false
          });
          return;
        }

        // Check if it's a product from products table
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

        // Check if it's a tag from opening_tags_entry
        const tag = data.find((tag) => String(tag.PCode_BarCode) === String(barcode));
        if (tag) {
          if (tag.Status !== "Available" && tag.Status !== "Selected") {
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'Product Not Available',
              text: `This product is not available (Status: ${tag.Status})`,
              confirmButtonText: 'OK'
            });
            return;
          }

          if (tag.Status === "Available" && loggedInUserId && tag.user_id !== loggedInUserId) {
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

  const handlePacketBarcodeScanSuccess = async (decodedText) => {
    try {
      stopPacketScanner();

      Swal.fire({
        title: 'Scanning Packet Barcode...',
        text: 'Please wait while we process the packet barcode',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      let packetBarcode = decodedText;

      // Try to parse as JSON first
      try {
        const parsedData = JSON.parse(decodedText);
        packetBarcode = parsedData.qr_code || parsedData.barcode || parsedData.PCode_BarCode || parsedData.code || parsedData.BarCode || decodedText;
        console.log("Parsed JSON packet data:", parsedData);
        console.log("Extracted packet barcode:", packetBarcode);
      } catch {
        const barcodeMatch = decodedText.match(/PACKET:\s*([A-Z0-9]+)/i);
        if (barcodeMatch) {
          packetBarcode = barcodeMatch[1];
        } else {
          const altMatch = decodedText.match(/(barcode|Barcode|PCode|code|packet|qr_code)[:\s]*([^\s,}]+)/i);
          if (altMatch) {
            packetBarcode = altMatch[2];
          }
        }
      }

      console.log("Final packet barcode extracted:", packetBarcode);

      if (packetBarcode) {
        let packetProducts = groupedPacketProducts[packetBarcode];

        if (!packetProducts || packetProducts.length === 0) {
          const matchingPacketKey = Object.keys(groupedPacketProducts).find(
            key => key === packetBarcode || key.includes(packetBarcode)
          );
          if (matchingPacketKey) {
            packetProducts = groupedPacketProducts[matchingPacketKey];
            console.log("Found packet by matching key:", matchingPacketKey);
          }
        }

        if (packetProducts && packetProducts.length > 0) {
          Swal.close();

          const storedRepairDetails = JSON.parse(localStorage.getItem(`repairDetails_${tabId}`)) || [];
          const existingCodes = new Set(storedRepairDetails.map(item => item.code));
          const newProducts = packetProducts.filter(product => !existingCodes.has(product.code));

          if (newProducts.length === 0) {
            Swal.fire({
              icon: 'info',
              title: 'All Products Added',
              text: 'All products in this packet are already added',
              timer: 1500,
              showConfirmButton: false
            });
            return;
          }

          // ===== FIXED: Add capture_weight_of_bag to packet products =====
          const productsWithImages = newProducts.map(product => {
            const assignedProduct = selectedSalesmanProducts?.find(
              p => p.PCode_BarCode === product.code
            );

            let imagePath = assignedProduct?.image || null;
            let imagePreview = null;

            if (imagePath) {
              if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                imagePreview = imagePath;
              } else if (imagePath.startsWith('/')) {
                imagePreview = `${baseURL}${imagePath}`;
              } else {
                imagePreview = `${baseURL}/${imagePath}`;
              }
            }

            return {
              ...product,
              code: product.code,
              product_name: product.product_name || product.sub_category,
              metal_type: product.metal_type,
              purity: product.purity,
              category: product.category,
              sub_category: product.sub_category,
              gross_weight: product.gross_weight,
              stone_weight: product.stone_weight,
              stone_price: product.stone_price,
              weight_bw: product.weight_bw,
              va_on: product.va_on || "Gross Weight",
              va_percent: product.va_percent,
              wastage_weight: product.wastage_weight,
              total_weight_av: product.total_weight_av,
              mc_on: product.mc_on || "MC %",
              mc_per_gram: product.mc_per_gram,
              making_charges: product.making_charges,
              rate: product.rate,
              rate_amt: product.rate_amt,
              tax_percent: product.tax_percent || "03% GST",
              tax_amt: product.tax_amt,
              total_price: product.total_price,
              pricing: product.pricing || "By Weight",
              qty: product.qty || 1,
              packet_barcode: packetBarcode,
              is_estimated: true,
              design_name: product.design_name,
              imagePreview: imagePreview,
              image: imagePath,
              sale_status: "Delivered",
              piece_taxable_amt: product.piece_taxable_amt || "",
              festival_discount: product.festival_discount || "",
              disscount: product.disscount || "",
              disscount_percentage: product.disscount_percentage || "",
              hm_charges: product.hm_charges || "60.00",
              remarks: product.remarks || "",
              printing_purity: product.printing_purity || "",
              selling_purity: product.selling_purity || "",
              is_packet_selection: true,
              assigned_id: assignedProduct?.assigned_id || null,
              item_id: assignedProduct?.item_id || null,
              // ===== FIXED: Include capture_weight_of_bag =====
              capture_weight_of_bag: assignedProduct?.capture_weight_of_bag || 0,
              received_id: assignedProduct?.received_id || null,
              cover_wt: product.cover_wt || assignedProduct?.cover_wt || "",
              card_wt: product.card_wt || assignedProduct?.card_wt || "",
              packing_wt: product.packing_wt || assignedProduct?.packing_wt || "",
            };
          });

          // ===== NEW: Notify parent immediately with the bag weight =====
          const packetBagWeight = productsWithImages.find(p => p.capture_weight_of_bag > 0)?.capture_weight_of_bag || 0;
          if (onReceivedBagWeightDetected) {
            onReceivedBagWeightDetected(packetBagWeight);
          }

          const updatedRepairDetails = [...storedRepairDetails, ...productsWithImages];
          setRepairDetails(updatedRepairDetails);
          localStorage.setItem(`repairDetails_${tabId}`, JSON.stringify(updatedRepairDetails));

          setIsPacketAdded(true);

          setFormData(prev => ({
            ...prev,
            code: packetBarcode,
            packet_barcode: packetBarcode,
            is_estimated: true,
            is_packet_selection: true,
            product_name: '',
            metal_type: '',
            purity: '',
            category: '',
            sub_category: '',
            gross_weight: '',
            stone_weight: '',
            stone_price: '',
            weight_bw: '',
            va_on: 'Gross Weight',
            va_percent: '',
            wastage_weight: '',
            total_weight_av: '',
            mc_on: 'MC %',
            mc_per_gram: '',
            making_charges: '',
            rate: '',
            rate_amt: '',
            tax_percent: '03% GST',
            tax_amt: '',
            total_price: '',
            pricing: 'By Weight',
            qty: '1',
            design_name: '',
            selling_purity: '',
            printing_purity: '',
            imagePreview: null,
            image: null,
            disscount: '',
            disscount_percentage: '',
            pieace_cost: '',
            hm_charges: '60.00',
            remarks: '',
            piece_taxable_amt: '',
            festival_discount: '',
            custom_purity: '',
            cover_wt: '',
            card_wt: '',
            packing_wt: '',
          }));

          Swal.fire({
            icon: 'success',
            title: 'Packet Added!',
            text: `Added ${productsWithImages.length} product(s) from packet ${packetBarcode}`,
            timer: 2000,
            showConfirmButton: false
          });

        } else {
          Swal.close();
          const availablePackets = Object.keys(groupedPacketProducts);
          console.log("Available packets:", availablePackets);
          console.log("Scanned packet barcode:", packetBarcode);

          Swal.fire({
            icon: 'warning',
            title: 'Packet Not Found',
            text: `No products found for packet: ${packetBarcode}`,
            confirmButtonText: 'OK'
          });
        }
      } else {
        Swal.close();
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Packet Barcode',
          text: 'Could not extract barcode. Please try a different barcode.',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      Swal.close();
      console.error('Error processing packet barcode scan:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error processing packet barcode. Please try again.'
      });
    }
  };

  // Fetch estimates data from baseURL2
  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const response = await axios.get(`${baseURL2}/get/estimates`);
        console.log("Estimates data fetched in ProductDetails:", response.data);
        setEstimatesData(response.data);

        // Group products by packet barcode - ONLY for products assigned to the selected salesman
        const grouped = {};
        const packetImages = {};

        response.data.forEach(est => {
          if (est.code && est.packet_barcode) {
            const isAssignedToSalesman = selectedSalesmanProducts.some(
              assigned => assigned.PCode_BarCode === est.code
            );

            if (isAssignedToSalesman) {
              if (!grouped[est.packet_barcode]) {
                grouped[est.packet_barcode] = [];
              }
              grouped[est.packet_barcode].push({
                code: est.code,
                product_name: est.product_name,
                metal_type: est.metal_type,
                purity: est.purity,
                category: est.category,
                sub_category: est.sub_category,
                gross_weight: est.gross_weight,
                stone_weight: est.stone_weight,
                stone_price: est.stone_price,
                weight_bw: est.weight_bw,
                va_on: est.va_on,
                va_percent: est.va_percent,
                wastage_weight: est.wastage_weight,
                total_weight_av: est.total_weight_av,
                mc_on: est.mc_on,
                mc_per_gram: est.mc_per_gram,
                making_charges: est.making_charges,
                rate: est.rate,
                rate_amt: est.rate_amt,
                tax_percent: est.tax_percent,
                tax_amt: est.tax_amt,
                total_price: est.total_price,
                pricing: est.pricing,
                qty: est.qty || 1,
                packet_barcode: est.packet_barcode,
                is_estimated: true,
                design_name: est.design_name,
                stone_price_per_carat: est.stone_price_per_carat,
                deduct_st_Wt: est.deduct_st_Wt,
                pur_Gross_Weight: est.pur_Gross_Weight,
                pur_Stones_Weight: est.pur_Stones_Weight,
                pur_deduct_st_Wt: est.pur_deduct_st_Wt,
                pur_stone_price_per_carat: est.pur_stone_price_per_carat,
                pur_Stones_Price: est.pur_Stones_Price,
                pur_Weight_BW: est.pur_Weight_BW,
                pur_Making_Charges_On: est.pur_Making_Charges_On,
                pur_MC_Per_Gram: est.pur_MC_Per_Gram,
                pur_Making_Charges: est.pur_Making_Charges,
                pur_Wastage_On: est.pur_Wastage_On,
                pur_Wastage_Percentage: est.pur_Wastage_Percentage,
                pur_WastageWeight: est.pur_WastageWeight,
                pur_TotalWeight_AW: est.pur_TotalWeight_AW
              });

              if (est.pack_images) {
                try {
                  const images = JSON.parse(est.pack_images);
                  if (images && images.length > 0) {
                    packetImages[est.packet_barcode] = images[0];
                  }
                } catch (e) {
                  packetImages[est.packet_barcode] = est.pack_images;
                }
              }
            }
          }
        });
        setGroupedPacketProducts(grouped);
        window.packetImages = packetImages;

        console.log("Grouped packet products for salesman:", grouped);
        console.log("Packet images:", packetImages);
      } catch (error) {
        console.error("Error fetching estimates:", error);
      }
    };
    fetchEstimates();
  }, [selectedSalesmanProducts]);

  const getPacketBarcode = (productCode) => {
    if (!estimatesData || !productCode) return null;
    const estimates = estimatesData.filter(item => item.code === productCode);
    const packetBarcodes = estimates
      .map(item => item.packet_barcode)
      .filter(barcode => barcode && barcode !== null && barcode !== '');
    return packetBarcodes.length > 0 ? packetBarcodes[0] : null;
  };

  const hasEstimate = (productCode) => {
    if (!estimatesData || !productCode) return false;
    return estimatesData.some(item => item.code === productCode);
  };

  const defaultBarcode = formData.category
    ? products.find((product) => product.product_name === formData.category)?.rbarcode || ""
    : "";

  // Build barcode options
  const barcodeOptions = [];
  const seenPacketBarcodes = new Set();

  Object.keys(groupedPacketProducts).forEach(packetBarcode => {
    if (!seenPacketBarcodes.has(packetBarcode)) {
      seenPacketBarcodes.add(packetBarcode);
      const productsInPacket = groupedPacketProducts[packetBarcode];
      if (productsInPacket && productsInPacket.length > 0) {
        barcodeOptions.push({
          value: packetBarcode,
          label: `${packetBarcode} (${productsInPacket.length} products)`,
          type: "packet",
          packetBarcode: packetBarcode,
          isEstimated: true,
          products: productsInPacket
        });
      }
    }
  });

  (selectedSalesmanProducts || []).forEach((product) => {
    const packetBarcode = getPacketBarcode(product.PCode_BarCode);
    const isEstimated = hasEstimate(product.PCode_BarCode);

    if (!isEstimated || !packetBarcode) {
      barcodeOptions.push({
        value: product.PCode_BarCode,
        label: `${product.PCode_BarCode} - ${product.product_name || product.sub_category || ''}`,
        type: "assigned",
        productData: product,
        packetBarcode: null,
        isEstimated: false,
        products: [product]
      });
    }
  });

  const uniqueBarcodeOptions = [];
  const seenValues = new Set();
  for (const option of barcodeOptions) {
    if (!seenValues.has(option.value)) {
      seenValues.add(option.value);
      uniqueBarcodeOptions.push(option);
    }
  }

  if (defaultBarcode && !uniqueBarcodeOptions.some((option) => option.value === defaultBarcode)) {
    uniqueBarcodeOptions.unshift({ value: defaultBarcode, label: defaultBarcode });
  }

  useEffect(() => {
    if (!formData.code && defaultBarcode) {
      handleBarcodeChange(defaultBarcode);
    }
  }, [formData.category, defaultBarcode]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('/')) return `${baseURL}${imagePath}`;
    return `${baseURL}/${imagePath}`;
  };

  // ===== UPDATED handleBarcodeSelect with immediate weight notification =====
  const handleBarcodeSelect = (selectedValue) => {
    const selectedOption = uniqueBarcodeOptions.find(opt => opt.value === selectedValue);

    if (selectedOption) {
      let packetImageUrl = null;
      let totalGrossWeight = 0;
      let totalPackingWt = 0;

      if (selectedOption.type === "packet" && selectedOption.packetBarcode) {
        const imageFileName = window.packetImages?.[selectedOption.packetBarcode];
        if (imageFileName) {
          packetImageUrl = `${baseURL2}/uploads/pack-images/${imageFileName}`;
        }

        if (selectedOption.products && selectedOption.products.length > 0) {
          selectedOption.products.forEach(product => {
            const grossWt = parseFloat(product.gross_weight) || 0;
            totalGrossWeight += grossWt;

            const estimateProduct = estimatesData.find(est => est.code === product.code);
            const packingWt = parseFloat(estimateProduct?.packing_wt) || 0;
            totalPackingWt += packingWt;
          });
        }

        const totalPackingWtFinal = totalGrossWeight + totalPackingWt;

        setPacketTotals({
          grossWeight: totalGrossWeight,
          packingWt: totalPackingWtFinal
        });
      } else {
        setPacketTotals({ grossWeight: 0, packingWt: 0 });
        setPacketImage(null);
      }

      setPacketImage(packetImageUrl);

      if (selectedOption.type === "packet" && selectedOption.products && selectedOption.products.length > 0) {
        console.log("Packet selected with products:", selectedOption.products);
        console.log("Total Gross Weight:", totalGrossWeight);
        console.log("Total Packing Weight:", totalPackingWt);

        const storedRepairDetails = JSON.parse(localStorage.getItem(`repairDetails_${tabId}`)) || [];
        const existingCodes = new Set(storedRepairDetails.map(item => item.code));
        const newProducts = selectedOption.products.filter(product => !existingCodes.has(product.code));

        if (newProducts.length === 0) {
          alert("All products in this packet are already added");
          setFormData(prev => ({
            ...prev,
            code: selectedValue,
            packet_barcode: selectedOption.packetBarcode,
            is_estimated: true,
            is_packet_selection: true,
            cover_wt: '',
            card_wt: '',
            packing_wt: '',
          }));
          return;
        }

        // ===== FIXED: Add capture_weight_of_bag to productsWithImages =====
        const productsWithImages = newProducts.map(product => {
          const assignedProduct = selectedSalesmanProducts?.find(
            p => p.PCode_BarCode === product.code
          );

          let imagePath = assignedProduct?.image || null;
          let imagePreview = null;

          if (imagePath) {
            imagePreview = getImageUrl(imagePath);
          }

          const estimateProduct = estimatesData.find(est => est.code === product.code);
          const packingWt = estimateProduct?.packing_wt || "";

          return {
            ...product,
            code: product.code,
            product_name: product.product_name || product.sub_category,
            metal_type: product.metal_type,
            purity: product.purity,
            category: product.category,
            sub_category: product.sub_category,
            gross_weight: product.gross_weight,
            stone_weight: product.stone_weight,
            stone_price: product.stone_price,
            weight_bw: product.weight_bw,
            va_on: product.va_on || "Gross Weight",
            va_percent: product.va_percent,
            wastage_weight: product.wastage_weight,
            total_weight_av: product.total_weight_av,
            mc_on: product.mc_on || "MC %",
            mc_per_gram: product.mc_per_gram,
            making_charges: product.making_charges,
            rate: product.rate,
            rate_amt: product.rate_amt,
            tax_percent: product.tax_percent || "03% GST",
            tax_amt: product.tax_amt,
            total_price: product.total_price,
            pricing: product.pricing || "By Weight",
            qty: product.qty || 1,
            packet_barcode: selectedOption.packetBarcode,
            is_estimated: true,
            design_name: product.design_name,
            imagePreview: imagePreview,
            image: imagePath,
            sale_status: "Delivered",
            piece_taxable_amt: product.piece_taxable_amt || "",
            festival_discount: product.festival_discount || "",
            disscount: product.disscount || "",
            disscount_percentage: product.disscount_percentage || "",
            hm_charges: product.hm_charges || "60.00",
            remarks: product.remarks || "",
            printing_purity: product.printing_purity || "",
            selling_purity: product.selling_purity || "",
            is_packet_selection: true,
            assigned_id: assignedProduct?.assigned_id || null,
            item_id: assignedProduct?.item_id || null,
            // ===== FIXED: Include capture_weight_of_bag =====
            capture_weight_of_bag: assignedProduct?.capture_weight_of_bag || 0,
            received_id: assignedProduct?.received_id || null,
            cover_wt: product.cover_wt || assignedProduct?.cover_wt || "",
            card_wt: product.card_wt || assignedProduct?.card_wt || "",
            packing_wt: packingWt || "",
          };
        });

        // ===== NEW: Notify parent immediately with the bag weight =====
        const packetBagWeight = productsWithImages.find(p => p.capture_weight_of_bag > 0)?.capture_weight_of_bag || 0;
        if (onReceivedBagWeightDetected) {
          onReceivedBagWeightDetected(packetBagWeight);
        }

        const updatedRepairDetails = [...storedRepairDetails, ...productsWithImages];
        setRepairDetails(updatedRepairDetails);
        localStorage.setItem(`repairDetails_${tabId}`, JSON.stringify(updatedRepairDetails));

        setIsPacketAdded(true);

        setFormData(prev => ({
          ...prev,
          code: selectedValue,
          packet_barcode: selectedOption.packetBarcode,
          is_estimated: true,
          is_packet_selection: true,
          product_name: '',
          metal_type: '',
          purity: '',
          category: '',
          sub_category: '',
          gross_weight: '',
          stone_weight: '',
          stone_price: '',
          weight_bw: '',
          va_on: 'Gross Weight',
          va_percent: '',
          wastage_weight: '',
          total_weight_av: '',
          mc_on: 'MC %',
          mc_per_gram: '',
          making_charges: '',
          rate: '',
          rate_amt: '',
          tax_percent: '03% GST',
          tax_amt: '',
          total_price: '',
          pricing: 'By Weight',
          qty: '1',
          design_name: '',
          selling_purity: '',
          printing_purity: '',
          imagePreview: null,
          image: null,
          disscount: '',
          disscount_percentage: '',
          pieace_cost: '',
          hm_charges: '60.00',
          remarks: '',
          piece_taxable_amt: '',
          festival_discount: '',
          custom_purity: '',
          cover_wt: '',
          card_wt: '',
          packing_wt: '',
        }));

        alert(`Added ${productsWithImages.length} product(s) from packet ${selectedOption.packetBarcode}\nTotal Gross Weight: ${totalGrossWeight.toFixed(2)}g\nTotal Packing Weight: ${totalPackingWt.toFixed(2)}g`);

      } else {
        setIsPacketAdded(false);
        setPacketImage(null);
        setPacketTotals({ grossWeight: 0, packingWt: 0 });
        
        // ===== NEW: For single barcode selection, look up capture_weight_of_bag =====
        const matchedProduct = selectedSalesmanProducts?.find(p => p.PCode_BarCode === selectedValue);
        if (onReceivedBagWeightDetected) {
          onReceivedBagWeightDetected(matchedProduct?.capture_weight_of_bag || 0);
        }

        if (selectedOption.packetBarcode) {
          setFormData(prev => ({
            ...prev,
            code: selectedValue,
            packet_barcode: selectedOption.packetBarcode,
            is_estimated: selectedOption.isEstimated || false,
            is_packet_selection: false,
            cover_wt: '',
            card_wt: '',
            packing_wt: '',
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            code: selectedValue,
            packet_barcode: null,
            is_estimated: false,
            is_packet_selection: false,
            cover_wt: '',
            card_wt: '',
            packing_wt: '',
          }));
        }
        handleBarcodeChange(selectedValue);
      }
    }
  };

  // ===== UPDATED handleClear - Reset bag weight notification =====
 // ===== UPDATED handleClear - Reset bag weight notification and clear product table =====
const handleClear = () => {
  setIsPacketAdded(false);
  setPacketImage(null);
  setPacketTotals({ grossWeight: 0, packingWt: 0 });
  setExtractedWeight(null);
  setWeightCaptureError(null);
  // NEW: Reset bag weight to 0 when clearing
  if (onReceivedBagWeightDetected) {
    onReceivedBagWeightDetected(0);
  }
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
    packet_barcode: null,
    is_estimated: false,
    is_packet_selection: false,
    cover_wt: "",
    card_wt: "",
    packing_wt: "",
    weight_machine_reading: 0,
    weight_machine_grams: 0,
    weight_machine_milligrams: 0,
    weight_machine_confidence: 0,
    weight_machine_raw: null,
  }));

  // 🆕 NEW: also clear items from the Product Table
  if (clearProductTable) {
    clearProductTable();
  }
};

  // Calculations for price fields
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
      setFormData(prev => ({
        ...prev,
        tax_amt: taxAmt.toFixed(2),
        total_price: totalPrice.toFixed(2),
      }));
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

  const displayImage = formData.imagePreview || (formData.image ? getImageUrl(formData.image) : null);

  const buttonHeightStyle = {
    height: '38px',
    marginBottom: '8px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 12px',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    borderRadius: '4px',
    border: '1px solid transparent',
  };

  // Check if weights match
  const doWeightsMatch = returnCaptureWeightOfBag > 0 && receivedBagWeight > 0 &&
    Math.abs(returnCaptureWeightOfBag - receivedBagWeight) < 0.001;

  return (
    <Col>
      <Row>
        <Col xs={12}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: '6px',
            flexWrap: 'wrap'
          }}>
            <div
              style={{
                flex: "0 0 320px",
                maxWidth: "60%",
                minWidth: "250px"
              }}
            >
              <InputField
                label="BarCode/Rbarcode"
                name="code"
                value={formData.code || defaultBarcode}
                onChange={(e) => handleBarcodeSelect(e.target.value)}
                type="select"
                options={uniqueBarcodeOptions}
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={startScanner}
              style={{
                ...buttonHeightStyle,
                backgroundColor: '#007bff',
                borderColor: '#007bff',
                gap: '6px',
              }}
              title="Scan Barcode"
            >
              <FaQrcode size={13} /> Scan Barcode
            </Button>

            <Button
              variant="success"
              size="sm"
              onClick={startPacketScanner}
              style={{
                ...buttonHeightStyle,
                backgroundColor: '#28a745',
                borderColor: '#28a745',
                gap: '6px',
              }}
              title="Scan Packet"
            >
              <FaBarcode size={13} /> Scan Packet
            </Button>

            <Button
              variant="warning"
              size="sm"
              onClick={startWeightCamera}
              style={{
                ...buttonHeightStyle,
                backgroundColor: '#ff9800',
                borderColor: '#ff9800',
                color: 'white',
                gap: '6px',
                minWidth: '140px',
              }}
              title="Capture Weight from Machine"
            >
              <FaWeightHanging size={13} /> Capture Weight
            </Button>

            <DropdownButton
              id="dropdown-basic-button"
              title="Choose / Capture Image"
              variant="primary"
              size="sm"
              onClick={() => setShowOptions(!showOptions)}
              style={{ 
                flexShrink: 0,
                marginBottom: '8px',
                height: '38px',
              }}
              disabled={isPacketAdded}
              className="d-flex align-items-center"
            >
              {showOptions && (
                <>
                  <Dropdown.Item onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                    <FaUpload /> Choose Image
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setShowWebcam(true)}>
                    <FaCamera /> Capture Image
                  </Dropdown.Item>
                </>
              )}
            </DropdownButton>

            <Button
              onClick={isEditing ? handleUpdate : handleAdd}
              style={{
                ...buttonHeightStyle,
                backgroundColor: "#a36e29",
                borderColor: "#a36e29",
                minWidth: '100px',
              }}
              disabled={isPacketAdded}
            >
              {isEditing ? "Update" : "Add"}
            </Button>

            <Button
              variant="secondary"
              onClick={handleClear}
              style={{
                ...buttonHeightStyle,
                backgroundColor: 'gray',
                borderColor: 'gray',
                minWidth: '100px',
              }}
            >
              Clear
            </Button>

            <input
              type="file"
              name="image"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          {showWebcam && (
            <div style={{ marginTop: '10px' }}>
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
          
          {displayImage && (
            <div style={{ position: "relative", display: "inline-block", marginTop: "10px" }}>
              <img
                src={displayImage}
                alt="Selected"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "8px",
                  objectFit: "cover"
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '';
                  e.target.alt = 'Image not available';
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

          {packetImage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <img
                src={packetImage}
                alt="Packet"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  padding: '5px',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  setPacketImage(null);
                }}
              />
              <span style={{ fontSize: '12px', color: '#666' }}>Packet Image</span>
            </div>
          )}

          {(packetTotals.grossWeight > 0 || packetTotals.packingWt > 0) && (
            <div style={{ marginTop: '10px' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                  Packet Summary
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#666' }}>Total Gross Wt: </span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#28a745' }}>
                      {packetTotals.grossWeight.toFixed(2)}g
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#666' }}>Total Packing Wt: </span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#007bff' }}>
                      {packetTotals.packingWt.toFixed(2)}g
                    </span>
                  </div>
                </div>
                
                {/* NEW: Weight comparison UI for Return to Main Stock */}
                <div style={{ marginTop: '8px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#666' }}>Capture Weight of ReceivedSalesmanForm: </span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#a36e29' }}>
                      {receivedBagWeight ? receivedBagWeight.toFixed(3) : '0.000'}g
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>Capture Weight here:</span>
                    <input
                      type="number"
                      step="0.001"
                      readOnly
                      value={returnCaptureWeightOfBag || ''}
                      placeholder="Capture with camera"
                      style={{
                        width: '110px', 
                        padding: '4px 8px',
                        border: `2px solid ${doWeightsMatch ? '#28a745' : '#dc3545'}`,
                        borderRadius: '4px', 
                        fontWeight: 'bold'
                      }}
                    />
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={startWeightCameraForBag}
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                    >
                      <FaWeightHanging /> Capture
                    </Button>
                    {returnCaptureWeightOfBag > 0 && receivedBagWeight > 0 && (
                      doWeightsMatch
                        ? <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅ Match</span>
                        : <span style={{ color: '#dc3545', fontWeight: 'bold' }}>❌ Mismatch</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {extractedWeight && (
            <div style={{ marginTop: '10px', padding: '8px 15px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 'bold', color: '#155724' }}>✅ Weight Captured:</span>
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#0d47a1' }}>
                {extractedWeight.total_grams?.toFixed(3)} g
              </span>
              <span style={{ fontSize: '14px', color: '#155724' }}>
                ({extractedWeight.grams} g / {extractedWeight.milligrams} mg)
              </span>
              <span style={{ fontSize: '12px', color: '#666' }}>
                Raw: {extractedWeight.raw_text}
              </span>
              <button
                type="button"
                onClick={() => {
                  setExtractedWeight(null);
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
          )}

          {weightCaptureError && (
            <div style={{ marginTop: '10px', padding: '8px 15px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '8px', color: '#721c24' }}>
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
          )}

          {isProcessingWeight && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Processing...</span>
              </div>
              <span style={{ color: '#0d47a1' }}>Processing weight image with Gemini AI...</span>
            </div>
          )}
        </Col>

        {isByFixed ? (
          <>
            <Col xs={12} md={2}>
              <InputField label="Printing Purity" name="printing_purity" value={formData.printing_purity || ""} onChange={handleChange} disabled={isPacketAdded} />
            </Col>
            <Col xs={12} md={2}>
              <InputField label="Piece Cost" name="pieace_cost" value={formData.pieace_cost} onChange={handleChange} disabled={isPacketAdded} />
            </Col>
            <Col xs={12} md={1}>
              <InputField label="Qty" name="qty" value={formData.qty} onChange={handleChange} readOnly={!isQtyEditable} disabled={isPacketAdded} />
            </Col>
          </>
        ) : (
          <></>
        )}
      </Row>

      <Modal show={showScanner} onHide={stopScanner} centered>
        <Modal.Header closeButton>
          <Modal.Title>Scan Product Barcode</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: 'center', padding: '20px' }}>
          <div id="barcode-reader" style={{ width: '100%', minHeight: '300px' }}></div>
          <p className="mt-3">Point your camera at the product barcode to scan and automatically load product details</p>
          <p className="text-info mt-2">⚠️ Only products assigned to you and with status "Available" or "Selected" can be scanned</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={stopScanner}>Cancel Scan</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPacketScanner} onHide={stopPacketScanner} centered>
        <Modal.Header closeButton>
          <Modal.Title>Scan Packet Barcode</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: 'center', padding: '20px' }}>
          <div id="packet-barcode-reader" style={{ width: '100%', minHeight: '300px' }}></div>
          <p className="mt-3">Point your camera at the packet barcode to scan and automatically add all products from that packet</p>
          <p className="text-info mt-2">⚠️ Only packets with products assigned to you will be added</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={stopPacketScanner}>Cancel Scan</Button>
        </Modal.Footer>
      </Modal>

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

      <input
        ref={weightFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleWeightFileUpload}
        style={{ display: 'none' }}
      />
    </Col>
  );
};

export default ProductDetails;