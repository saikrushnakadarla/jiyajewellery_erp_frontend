import React, { useEffect, useState } from 'react';
import { Col, Row, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import InputField from './InputfieldSales';
import axios from 'axios';
import { AiOutlinePlus } from "react-icons/ai";
import baseURL from "../../../../Url/NodeBaseURL";
import baseURL2 from "../../../../Url/NodeBaseURL2";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaCamera, FaUpload } from "react-icons/fa";
import Webcam from "react-webcam";
import './SalesForm.css'

const ProductDetails = ({
  handleAdd,
  handleUpdate,
  isEditing,
  formData,
  setFormData,
  setRepairDetails,  // <-- ADDED THIS PROP
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
  selectedSalesmanProducts = []
}) => {

  const [showModal, setShowModal] = useState(false);
  const isByFixed = formData.pricing === "By fixed";
  const navigate = useNavigate();
  const [estimatesData, setEstimatesData] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [groupedPacketProducts, setGroupedPacketProducts] = useState({});

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setLoggedInUserId(parseInt(userId));
    }
  }, []);

  // Fetch estimates data from baseURL2
  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const response = await axios.get(`${baseURL2}/get/estimates`);
        console.log("Estimates data fetched in ProductDetails:", response.data);
        setEstimatesData(response.data);
        
        // Group products by packet barcode
        const grouped = {};
        response.data.forEach(est => {
          if (est.code && est.packet_barcode) {
            if (!grouped[est.packet_barcode]) {
              grouped[est.packet_barcode] = [];
            }
            // Add product info to the group
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
        });
        setGroupedPacketProducts(grouped);
        console.log("Grouped packet products:", grouped);
      } catch (error) {
        console.error("Error fetching estimates:", error);
      }
    };
    fetchEstimates();
  }, []);

  // Get packet barcode from estimates for a given product code
  const getPacketBarcode = (productCode) => {
    if (!estimatesData || !productCode) return null;
    
    const estimates = estimatesData.filter(item => item.code === productCode);
    const packetBarcodes = estimates
      .map(item => item.packet_barcode)
      .filter(barcode => barcode && barcode !== null && barcode !== '');
    
    return packetBarcodes.length > 0 ? packetBarcodes[0] : null;
  };

  // Check if a product has an estimate
  const hasEstimate = (productCode) => {
    if (!estimatesData || !productCode) return false;
    return estimatesData.some(item => item.code === productCode);
  };

  const defaultBarcode = formData.category
    ? products.find((product) => product.product_name === formData.category)?.rbarcode || ""
    : "";

  // Build barcode options - ONLY show packet barcode for estimated products
  const barcodeOptions = [];
  const seenPacketBarcodes = new Set();

  // First, add packet barcodes from grouped products (estimated products)
  Object.keys(groupedPacketProducts).forEach(packetBarcode => {
    if (!seenPacketBarcodes.has(packetBarcode)) {
      seenPacketBarcodes.add(packetBarcode);
      const productsInPacket = groupedPacketProducts[packetBarcode];
      
      barcodeOptions.push({
        value: packetBarcode, // Use packet barcode as value
        label: packetBarcode, // Show only packet barcode
        type: "packet",
        packetBarcode: packetBarcode,
        isEstimated: true,
        products: productsInPacket // Store all products in this packet
      });
    }
  });

  // Then add non-estimated products (assigned products without packet)
  (selectedSalesmanProducts || []).forEach((product) => {
    const packetBarcode = getPacketBarcode(product.PCode_BarCode);
    const isEstimated = hasEstimate(product.PCode_BarCode);
    
    // Only add if not estimated (no packet barcode)
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

  // Add tag options from opening_tags_entry (non-estimated)
  data
    .filter((tag) => {
      if (formData.category && tag.category !== formData.category) return false;
      if (tag.Status !== 'Available') return false;
      if (tag.user_id === null || tag.user_id === undefined) return false;
      if (loggedInUserId && tag.user_id !== loggedInUserId) return false;
      
      const isAssigned = selectedSalesmanProducts?.some(
        assigned => assigned.PCode_BarCode === tag.PCode_BarCode
      );
      
      if (formData.salesman_id) {
        return isAssigned;
      }
      
      return true;
    })
    .forEach((tag) => {
      const packetBarcode = getPacketBarcode(tag.PCode_BarCode);
      const isEstimated = hasEstimate(tag.PCode_BarCode);
      
      // Only add if not estimated (no packet barcode)
      if (!isEstimated || !packetBarcode) {
        barcodeOptions.push({
          value: tag.PCode_BarCode,
          label: `${tag.PCode_BarCode} - ${tag.sub_category || tag.category || 'Product'}`,
          type: 'tag',
          tagData: tag,
          packetBarcode: null,
          isEstimated: false,
          products: [tag]
        });
      }
    });

  // Remove duplicates
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

  // Handle barcode selection - for packet barcodes, add all products
  const handleBarcodeSelect = (selectedValue) => {
    const selectedOption = uniqueBarcodeOptions.find(opt => opt.value === selectedValue);
    
    if (selectedOption) {
      if (selectedOption.type === "packet" && selectedOption.products && selectedOption.products.length > 0) {
        // This is a packet barcode - add all products to the table
        console.log("Packet selected with products:", selectedOption.products);
        
        // Get existing repair details from localStorage
        const storedRepairDetails = JSON.parse(localStorage.getItem(`repairDetails_${tabId}`)) || [];
        
        // Check for duplicates before adding
        const existingCodes = new Set(storedRepairDetails.map(item => item.code));
        const newProducts = selectedOption.products.filter(product => !existingCodes.has(product.code));
        
        if (newProducts.length === 0) {
          alert("All products in this packet are already added");
          setFormData(prev => ({
            ...prev,
            code: selectedValue,
            packet_barcode: selectedOption.packetBarcode,
            is_estimated: true
          }));
          return;
        }
        
        // Add all new products to repairDetails
        const updatedRepairDetails = [
          ...storedRepairDetails,
          ...newProducts.map(product => ({
            ...product,
            // Map fields to match formData structure
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
            imagePreview: null,
            sale_status: "Delivered",
            piece_taxable_amt: product.piece_taxable_amt || "",
            festival_discount: product.festival_discount || "",
            disscount: product.disscount || "",
            disscount_percentage: product.disscount_percentage || "",
            hm_charges: product.hm_charges || "60.00",
            remarks: product.remarks || "",
            printing_purity: product.printing_purity || "",
            selling_purity: product.selling_purity || ""
          }))
        ];
        
        // Use setRepairDetails to update state
        setRepairDetails(updatedRepairDetails);
        localStorage.setItem(`repairDetails_${tabId}`, JSON.stringify(updatedRepairDetails));
        
        // Set formData to show the packet barcode
        setFormData(prev => ({
          ...prev,
          code: selectedValue,
          packet_barcode: selectedOption.packetBarcode,
          is_estimated: true,
          product_name: newProducts.map(p => p.product_name || p.sub_category).join(', ')
        }));
        
        // Auto select the first product's details for display
        if (newProducts.length > 0) {
          const firstProduct = newProducts[0];
          setFormData(prev => ({
            ...prev,
            code: firstProduct.code,
            product_name: firstProduct.product_name || firstProduct.sub_category,
            metal_type: firstProduct.metal_type,
            purity: firstProduct.purity,
            category: firstProduct.category,
            sub_category: firstProduct.sub_category,
            gross_weight: firstProduct.gross_weight,
            stone_weight: firstProduct.stone_weight,
            stone_price: firstProduct.stone_price,
            weight_bw: firstProduct.weight_bw,
            va_on: firstProduct.va_on || "Gross Weight",
            va_percent: firstProduct.va_percent,
            wastage_weight: firstProduct.wastage_weight,
            total_weight_av: firstProduct.total_weight_av,
            mc_on: firstProduct.mc_on || "MC %",
            mc_per_gram: firstProduct.mc_per_gram,
            making_charges: firstProduct.making_charges,
            rate: firstProduct.rate,
            rate_amt: firstProduct.rate_amt,
            tax_percent: firstProduct.tax_percent || "03% GST",
            tax_amt: firstProduct.tax_amt,
            total_price: firstProduct.total_price,
            pricing: firstProduct.pricing || "By Weight",
            qty: firstProduct.qty || 1,
            packet_barcode: selectedOption.packetBarcode,
            is_estimated: true,
            design_name: firstProduct.design_name
          }));
        }
        
        alert(`Added ${newProducts.length} product(s) from packet ${selectedOption.packetBarcode}`);
        
      } else {
        // Regular barcode selection (non-packet)
        if (selectedOption.packetBarcode) {
          setFormData(prev => ({
            ...prev,
            code: selectedValue,
            packet_barcode: selectedOption.packetBarcode,
            is_estimated: selectedOption.isEstimated || false
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            code: selectedValue,
            packet_barcode: null,
            is_estimated: false
          }));
        }
        handleBarcodeChange(selectedValue);
      }
    }
  };

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
      packet_barcode: null,
      is_estimated: false,
    }));
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
            autoFocus
          />
          {/* Display packet barcode if available */}
          {formData.packet_barcode && (
            <div style={{ fontSize: "12px", color: "#a36e29", marginTop: "2px", fontWeight: "bold" }}>
              Packet: {formData.packet_barcode}
            </div>
          )}
          {formData.is_estimated && (
            <div style={{ fontSize: "11px", color: "#28a745", marginTop: "2px" }}>
              ✓ Estimated
            </div>
          )}
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
            />
          </div>
          <AiOutlinePlus
            size={20}
            color="black"
            style={{
              marginLeft: "10px",
              cursor: "pointer",
              marginBottom: "20px",
            }}
            onClick={() =>
              navigate("/itemmaster", {
                state: {
                  from: `/sales?tabId=${tabId}`
                }
              })
            }
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
            />
          </div>
          <AiOutlinePlus
            size={20}
            color="black"
            style={{
              marginLeft: "10px",
              cursor: "pointer",
              marginBottom: "20px",
            }}
            onClick={() =>
              navigate("/subcategory", {
                state: {
                  from: `/sales?tabId=${tabId}`,
                  metal_type: formData.metal_type
                }
              })
            }
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
          />
        </Col>

        {/* By Fixed Pricing Fields */}
        {isByFixed ? (
          <>
            <Col xs={12} md={2}>
              <InputField
                label="Printing Purity"
                name="printing_purity"
                value={formData.printing_purity || ""}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={2}>
              <InputField
                label="Piece Cost"
                name="pieace_cost"
                value={formData.pieace_cost}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={1}>
              <InputField
                label="Qty"
                name="qty"
                value={formData.qty}
                onChange={handleChange}
                readOnly={!isQtyEditable}
              />
            </Col>
            <Col xs={12} md={4}>
              <DropdownButton
                id="dropdown-basic-button"
                title="Choose / Capture Image"
                variant="primary"
                size="sm"
                onClick={() => setShowOptions(!showOptions)}
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
                  ...(formData.product_name
                    ? [{
                        label: subcategoryOptions.find(option => option.value === formData.product_name)?.selling_purity || "Default Purity",
                        value: subcategoryOptions.find(option => option.value === formData.product_name)?.selling_purity || ""
                      }]
                    : []),
                  { label: "Manual", value: "Manual" }
                ]}
              />
            </Col>

            {formData.selling_purity === "Manual" && (
              <Col xs={12} md={2}>
                <InputField
                  label="Custom Purity %"
                  name="custom_purity"
                  value={formData.custom_purity || ""}
                  onChange={handleChange}
                />
              </Col>
            )}

            <Col xs={12} md={1}>
              <InputField
                label="Gross Wt"
                name="gross_weight"
                type='number'
                value={formData.gross_weight || ""}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={1}>
              <InputField
                label="Stone Wt"
                name="stone_weight"
                type='number'
                value={formData.stone_weight || ""}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={1}>
              <InputField
                label="Weight BW"
                name="weight_bw"
                value={formData.weight_bw || ""}
                onChange={handleChange}
                readOnly
              />
            </Col>

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
                  ...(formData.va_on &&
                    !["Gross Weight", "Weight BW"].includes(formData.va_on)
                    ? [{ value: formData.va_on, label: formData.va_on }]
                    : []),
                ]}
              />
            </Col>
            <Col xs={12} md={1}>
              <InputField
                label="Wastage%"
                name="va_percent"
                type='number'
                value={formData.va_percent || "0"}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={1}>
              <InputField
                label="W.Wt"
                name="wastage_weight"
                value={formData.wastage_weight || "0.00"}
                onChange={handleChange}
                readOnly
              />
            </Col>
            <Col xs={12} md={2}>
              <InputField
                label="Total Weight AW"
                name="total_weight_av"
                value={formData.total_weight_av || ""}
                onChange={handleChange}
                readOnly
              />
            </Col>

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
                  ...(formData.mc_on &&
                    !["MC / Gram", "MC / Piece", "MC %"].includes(formData.mc_on)
                    ? [{ value: formData.mc_on, label: formData.mc_on }]
                    : []),
                ]}
              />
            </Col>

            <Col xs={12} md={1}>
              <InputField
                label={formData.mc_on === "MC %" ? "MC %" : "MC/Gm"}
                name="mc_per_gram"
                type='number'
                value={formData.mc_per_gram || ""}
                onChange={handleChange}
                readOnly={formData.mc_on === "MC / Piece"}
              />
            </Col>
            <Col xs={12} md={1}>
              <InputField
                label="Total MC"
                name="making_charges"
                type='number'
                value={formData.making_charges || ""}
                onChange={handleChange}
                disabled={formData.mc_on === "MC / Gram"}
              />
            </Col>

            <Col xs={12} md={2}>
              <DropdownButton
                id="dropdown-basic-button"
                title="Choose / Capture Image"
                variant="primary"
                size="sm"
                onClick={() => setShowOptions(!showOptions)}
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

        <Col xs={12} md={1}>
          <Button
            onClick={isEditing ? handleUpdate : handleAdd}
            style={{
              backgroundColor: "#a36e29",
              borderColor: "#a36e29",
              padding: "4px 7px",
              marginTop: "5px",
              marginLeft: "-1px",
              fontSize: "13px"
            }}
          >
            {isEditing ? "Update" : "Add"}
          </Button>
        </Col>
        <Col xs={12} md={1}>
          <Button
            variant="secondary"
            onClick={handleClear}
            style={{
              backgroundColor: 'gray',
              marginLeft: '-52px',
              padding: "4px 7px",
              fontSize: "13px",
              marginTop: "5px"
            }}
          >
            Clear
          </Button>
        </Col>
      </Row>
    </Col>
  );
};

export default ProductDetails;