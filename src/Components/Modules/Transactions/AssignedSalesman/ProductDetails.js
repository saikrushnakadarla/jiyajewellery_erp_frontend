import React, { useEffect, useState } from 'react';
import { Col, Row, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import InputField from './InputfieldSales';
import axios from 'axios';
import { AiOutlinePlus } from "react-icons/ai";
import baseURL from "../../../../Url/NodeBaseURL";
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
  orderData
}) => {

  const [showModal, setShowModal] = useState(false);
  const isByFixed = formData.pricing === "By fixed";
  const navigate = useNavigate();

  const defaultBarcode = formData.category
    ? products.find((product) => product.product_name === formData.category)?.rbarcode || ""
    : "";

  const barcodeOptions = [
    ...products
      .filter((product) => (formData.category ? product.product_name === formData.category : true))
      .map((product) => ({
        value: product.rbarcode,
        label: product.rbarcode,
        type: "product"
      })),
   ...data
    .filter((tag) => {
      // Filter by category if selected
      if (formData.category && tag.category !== formData.category) return false;
      // Only show Available products
      if (tag.Status !== 'Available') return false;
      // Only show products in MAIN STOCK ROOM
      if (tag.Stock_Point !== 'MAIN STOCK ROOM') return false;
      return true;
    })
    .map((tag) => ({
      value: tag.PCode_BarCode,
      label: tag.PCode_BarCode,
      type: 'tag',
      tagData: tag  // Store full tag data for reference
    })),
  ];

  if (defaultBarcode && !barcodeOptions.some((option) => option.value === defaultBarcode)) {
    barcodeOptions.unshift({ value: defaultBarcode, label: defaultBarcode });
  }

  useEffect(() => {
    if (!formData.code && defaultBarcode) {
      handleBarcodeChange(defaultBarcode);
    }
  }, [formData.category, defaultBarcode]);

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

  return (
    <Col>
      <Row>
        <Col xs={12} md={2}>
          <InputField
            label="BarCode/Rbarcode"
            name="code"
            value={formData.code || defaultBarcode}
            onChange={(e) => handleBarcodeChange(e.target.value)}
            type="select"
            options={barcodeOptions}
            autoFocus
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

        {/* REMOVED: Pricing Field */}

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
            {/* REMOVED: Remarks Field */}
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

            {/* REMOVED: Remarks Field */}
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