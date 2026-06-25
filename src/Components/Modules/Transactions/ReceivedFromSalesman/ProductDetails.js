import React, { useEffect, useState, useRef } from 'react';
import { Col, Row, Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import InputField from './InputfieldSales';
import axios from 'axios';
import { AiOutlinePlus } from "react-icons/ai";
import baseURL from "../../../../Url/NodeBaseURL";
import baseURL2 from "../../../../Url/NodeBaseURL2";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaCamera, FaUpload, FaQrcode, FaBarcode } from "react-icons/fa";
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
  stock = [],
  activeStockPointDetails = null,
}) => {

  const [showModal, setShowModal] = useState(false);
  const isByFixed = formData.pricing === "By fixed";
  const navigate = useNavigate();
  const [estimatesData, setEstimatesData] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [groupedPacketProducts, setGroupedPacketProducts] = useState({});
  const [isPacketAdded, setIsPacketAdded] = useState(false);

  // Barcode scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [isScannerInitialized, setIsScannerInitialized] = useState(false);
  const scannerRef = useRef(null);

  // Packet Barcode Scanner states
  const [showPacketScanner, setShowPacketScanner] = useState(false);
  const [isPacketScannerInitialized, setIsPacketScannerInitialized] = useState(false);
  const packetScannerRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setLoggedInUserId(parseInt(userId));
    }
  }, []);

  // ─── KEY FIX: filter selectedSalesmanProducts by active stock point ───────
  const salesmanProductsForCurrentStock = React.useMemo(() => {
    if (!activeStockPointDetails || !stock || stock.length === 0) {
      return selectedSalesmanProducts;
    }

    const activeStockPointName = activeStockPointDetails.stock_point_name;

    const barcodesInActiveStock = new Set(
      stock
        .filter(s => s.Stock_Point === activeStockPointName)
        .map(s => s.PCode_BarCode)
    );

    return selectedSalesmanProducts.filter(p =>
      barcodesInActiveStock.has(p.PCode_BarCode)
    );
  }, [selectedSalesmanProducts, stock, activeStockPointDetails]);

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
          
          const productsWithImages = newProducts.map(product => {
            const assignedProduct = salesmanProductsForCurrentStock?.find(
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
              item_id: assignedProduct?.item_id || null
            };
          });
          
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
            custom_purity: ''
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

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const response = await axios.get(`${baseURL2}/get/estimates`);
        setEstimatesData(response.data);
        
        const grouped = {};
        response.data.forEach(est => {
          if (est.code && est.packet_barcode) {
            const isAssignedToSalesman = salesmanProductsForCurrentStock.some(
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
            }
          }
        });
        setGroupedPacketProducts(grouped);
        console.log("Grouped packet products for current stock point:", grouped);
      } catch (error) {
        console.error("Error fetching estimates:", error);
      }
    };
    fetchEstimates();
  }, [salesmanProductsForCurrentStock]);

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

  salesmanProductsForCurrentStock.forEach((product) => {
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

  const handleBarcodeSelect = (selectedValue) => {
    const selectedOption = uniqueBarcodeOptions.find(opt => opt.value === selectedValue);
    
    if (selectedOption) {
      if (selectedOption.type === "packet" && selectedOption.products && selectedOption.products.length > 0) {
        console.log("Packet selected with products:", selectedOption.products);
        
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
            is_packet_selection: true
          }));
          return;
        }
        
        const productsWithImages = newProducts.map(product => {
          const assignedProduct = salesmanProductsForCurrentStock?.find(
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
            item_id: assignedProduct?.item_id || null
          };
        });
        
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
          custom_purity: ''
        }));
        
        alert(`Added ${productsWithImages.length} product(s) from packet ${selectedOption.packetBarcode}`);
        
      } else {
        setIsPacketAdded(false);
        if (selectedOption.packetBarcode) {
          setFormData(prev => ({
            ...prev,
            code: selectedValue,
            packet_barcode: selectedOption.packetBarcode,
            is_estimated: selectedOption.isEstimated || false,
            is_packet_selection: false
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            code: selectedValue,
            packet_barcode: null,
            is_estimated: false,
            is_packet_selection: false
          }));
        }
        handleBarcodeChange(selectedValue);
      }
    }
  };

  const handleClear = () => {
    setIsPacketAdded(false);
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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('/')) return `${baseURL}${imagePath}`;
    return `${baseURL}/${imagePath}`;
  };

  return (
    <Col>
      <Row>
        <Col xs={12} md={2}>
          <InputField
            label="BarCode/Rbarcode"
            name="code"
            value={formData.code || defaultBarcode}
            onChange={(e) => handleBarcodeSelect(e.target.value)}
            type="select"
            options={uniqueBarcodeOptions}
          />
        </Col>

        <Col xs={12} md={2} className="d-flex align-items-center">
          <div style={{ flex: 1 }}>
            <InputField
              label="Category"
              name="category"
              value={formData.category || ""}
              type="select"
              onChange={handleChange}
              options={categoryOptions}
              disabled={isPacketAdded}
            />
          </div>
          <AiOutlinePlus
            size={20}
            color="black"
            style={{ marginLeft: "10px", cursor: "pointer", marginBottom: "20px" }}
            onClick={() => navigate("/itemmaster", { state: { from: `/sales?tabId=${tabId}` } })}
          />
        </Col>

        <Col xs={12} md={2}>
          <InputField
            label="Metal Type"
            name="metal_type"
            value={formData.metal_type || ""}
            onChange={handleChange}
            type="select"
            options={metaltypeOptions}
            disabled={isPacketAdded}
          />
        </Col>

        <Col xs={12} md={2} className="d-flex align-items-center">
          <div style={{ flex: 1 }}>
            <InputField
              label="Sub Category"
              name="product_name"
              value={formData.product_name || ""}
              onChange={handleChange}
              type="select"
              options={subcategoryOptions}
              disabled={isPacketAdded}
            />
          </div>
          <AiOutlinePlus
            size={20}
            color="black"
            style={{ marginLeft: "10px", cursor: "pointer", marginBottom: "20px" }}
            onClick={() => navigate("/subcategory", { state: { from: `/sales?tabId=${tabId}`, metal_type: formData.metal_type } })}
          />
        </Col>

        <Col xs={12} md={2}>
          <InputField
            label="Product Design Name"
            name="design_name"
            value={formData.design_name}
            onChange={handleChange}
            type="select"
            options={designOptions}
            disabled={isPacketAdded}
          />
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
            <Col xs={12} md={5}>
              {/* All buttons in one row - no wrapping */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                flexWrap: 'nowrap',
                overflow: 'visible'
              }}>
                <DropdownButton
                  id="dropdown-basic-button"
                  title="Choose / Capture Image"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowOptions(!showOptions)}
                  style={{ minWidth: '155px', flexShrink: 0 }}
                  disabled={isPacketAdded}
                >
                  {showOptions && (
                    <>
                      <Dropdown.Item onClick={() => fileInputRef.current && fileInputRef.current.click()}><FaUpload /> Choose Image</Dropdown.Item>
                      <Dropdown.Item onClick={() => setShowWebcam(true)}><FaCamera /> Capture Image</Dropdown.Item>
                    </>
                  )}
                </DropdownButton>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={startScanner}
                  style={{ 
                    backgroundColor: '#007bff',
                    borderColor: '#007bff',
                    whiteSpace: 'nowrap',
                    minWidth: '105px',
                    flexShrink: 0
                  }}
                >
                  <FaQrcode /> Scan Barcode
                </Button>

                <Button
                  variant="success"
                  size="sm"
                  onClick={startPacketScanner}
                  style={{ 
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                    whiteSpace: 'nowrap',
                    minWidth: '110px',
                    flexShrink: 0
                  }}
                >
                  <FaBarcode /> Scan Packet
                </Button>

                <Button
                  onClick={isEditing ? handleUpdate : handleAdd}
                  style={{
                    backgroundColor: "#a36e29",
                    borderColor: "#a36e29",
                    padding: "4px 10px",
                    fontSize: "13px",
                    whiteSpace: 'nowrap',
                    minWidth: '50px',
                    flexShrink: 0
                  }}
                  disabled={isPacketAdded}
                >
                  {isEditing ? "Update" : "Add"}
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleClear}
                  style={{
                    backgroundColor: 'gray',
                    padding: "4px 10px",
                    fontSize: "13px",
                    whiteSpace: 'nowrap',
                    minWidth: '50px',
                    flexShrink: 0
                  }}
                >
                  Clear
                </Button>
              </div>

              <input
                type="file"
                name="image"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />

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
            </Col>
          </>
        ) : (
          <>
            <Col xs={12} md={2}>
              <InputField
                label="Selling Purity"
                name="selling_purity"
                type="select"
                value={formData.selling_purity}
                onChange={handleChange}
                options={[
                  ...(formData.product_name ? [{
                    label: subcategoryOptions.find(option => option.value === formData.product_name)?.selling_purity || "Default Purity",
                    value: subcategoryOptions.find(option => option.value === formData.product_name)?.selling_purity || ""
                  }] : []),
                  { label: "Manual", value: "Manual" }
                ]}
                disabled={isPacketAdded}
              />
            </Col>

            {formData.selling_purity === "Manual" && (
              <Col xs={12} md={2}>
                <InputField label="Custom Purity %" name="custom_purity" value={formData.custom_purity || ""} onChange={handleChange} disabled={isPacketAdded} />
              </Col>
            )}

            <Col xs={12} md={1}><InputField label="Gross Wt" name="gross_weight" type='number' value={formData.gross_weight || ""} onChange={handleChange} disabled={isPacketAdded} /></Col>
            <Col xs={12} md={1}><InputField label="Stone Wt" name="stone_weight" type='number' value={formData.stone_weight || ""} onChange={handleChange} disabled={isPacketAdded} /></Col>
            <Col xs={12} md={1}><InputField label="Weight BW" name="weight_bw" value={formData.weight_bw || ""} onChange={handleChange} readOnly disabled={isPacketAdded} /></Col>

            <Col xs={12} md={2}>
              <InputField
                label="Wastage On"
                name="va_on"
                type="select"
                value={formData.va_on || ""}
                onChange={handleChange}
                options={[
                  { value: "Gross Weight", label: "Gross Weight" },
                  { value: "Weight BW", label: "Weight BW" },
                  ...(formData.va_on && !["Gross Weight", "Weight BW"].includes(formData.va_on) ? [{ value: formData.va_on, label: formData.va_on }] : []),
                ]}
                disabled={isPacketAdded}
              />
            </Col>
            <Col xs={12} md={1}><InputField label="Wastage%" name="va_percent" type='number' value={formData.va_percent || "0"} onChange={handleChange} disabled={isPacketAdded} /></Col>
            <Col xs={12} md={1}><InputField label="W.Wt" name="wastage_weight" value={formData.wastage_weight || "0.00"} onChange={handleChange} readOnly disabled={isPacketAdded} /></Col>
            <Col xs={12} md={2}><InputField label="Total Weight AW" name="total_weight_av" value={formData.total_weight_av || ""} onChange={handleChange} readOnly disabled={isPacketAdded} /></Col>

            <Col xs={12} md={2}>
              <InputField
                label="MC On"
                name="mc_on"
                type="select"
                value={formData.mc_on || ""}
                onChange={handleChange}
                options={[
                  { value: "MC / Gram", label: "MC / Gram" },
                  { value: "MC / Piece", label: "MC / Piece" },
                  { value: "MC %", label: "MC %" },
                  ...(formData.mc_on && !["MC / Gram", "MC / Piece", "MC %"].includes(formData.mc_on) ? [{ value: formData.mc_on, label: formData.mc_on }] : []),
                ]}
                disabled={isPacketAdded}
              />
            </Col>
            <Col xs={12} md={1}><InputField label={formData.mc_on === "MC %" ? "MC %" : "MC/Gm"} name="mc_per_gram" type='number' value={formData.mc_per_gram || ""} onChange={handleChange} readOnly={formData.mc_on === "MC / Piece"} disabled={isPacketAdded} /></Col>
            <Col xs={12} md={1}><InputField label="Total MC" name="making_charges" type='number' value={formData.making_charges || ""} onChange={handleChange} disabled={formData.mc_on === "MC / Gram" || isPacketAdded} /></Col>

            <Col xs={12} md={5}>
              {/* All buttons in one row - no wrapping */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                flexWrap: 'nowrap',
                overflow: 'visible'
              }}>
                <DropdownButton
                  id="dropdown-basic-button"
                  title="Choose / Capture Image"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowOptions(!showOptions)}
                  style={{ minWidth: '155px', flexShrink: 0 }}
                  disabled={isPacketAdded}
                >
                  {showOptions && (
                    <>
                      <Dropdown.Item onClick={() => fileInputRef.current && fileInputRef.current.click()}><FaUpload /> Choose Image</Dropdown.Item>
                      <Dropdown.Item onClick={() => setShowWebcam(true)}><FaCamera /> Capture Image</Dropdown.Item>
                    </>
                  )}
                </DropdownButton>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={startScanner}
                  style={{ 
                    backgroundColor: '#007bff',
                    borderColor: '#007bff',
                    whiteSpace: 'nowrap',
                    minWidth: '105px',
                    flexShrink: 0
                  }}
                >
                  <FaQrcode /> Scan Barcode
                </Button>

                <Button
                  variant="success"
                  size="sm"
                  onClick={startPacketScanner}
                  style={{ 
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                    whiteSpace: 'nowrap',
                    minWidth: '110px',
                    flexShrink: 0
                  }}
                >
                  <FaBarcode /> Scan Packet
                </Button>

                <Button
                  onClick={isEditing ? handleUpdate : handleAdd}
                  style={{
                    backgroundColor: "#a36e29",
                    borderColor: "#a36e29",
                    padding: "4px 10px",
                    fontSize: "13px",
                    whiteSpace: 'nowrap',
                    minWidth: '50px',
                    flexShrink: 0
                  }}
                  disabled={isPacketAdded}
                >
                  {isEditing ? "Update" : "Add"}
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleClear}
                  style={{
                    backgroundColor: 'gray',
                    padding: "4px 10px",
                    fontSize: "13px",
                    whiteSpace: 'nowrap',
                    minWidth: '50px',
                    flexShrink: 0
                  }}
                >
                  Clear
                </Button>
              </div>

              <input
                type="file"
                name="image"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />

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
            </Col>
          </>
        )}
      </Row>

      {/* Product Barcode Scanner Modal */}
      <Modal show={showScanner} onHide={stopScanner} centered>
        <Modal.Header closeButton>
          <Modal.Title>Scan Product Barcode</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: 'center', padding: '20px' }}>
          <div id="barcode-reader" style={{ width: '100%', minHeight: '300px' }}></div>
          <p className="mt-3">Point your camera at the product barcode to scan and automatically load product details</p>
          <p className="text-info mt-2">⚠️ Only products assigned to you and with status "Available" can be scanned</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={stopScanner}>Cancel Scan</Button>
        </Modal.Footer>
      </Modal>

      {/* Packet Barcode Scanner Modal */}
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
    </Col>
  );
};

export default ProductDetails;