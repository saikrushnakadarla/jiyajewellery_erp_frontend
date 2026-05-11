import React, { useEffect, useState } from 'react';
import { Col, Row, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import InputField from './../../Transactions/SalesForm/InputfieldSales';
import axios from 'axios';
import baseURL from "../../../../Url/NodeBaseURL";
import { FaTrash, FaCamera, FaUpload } from "react-icons/fa";
import Webcam from "react-webcam";

const ProductDetails = ({
  handleAdd,
  handleUpdate,
  isEditing,
  formData,
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
  isQtyEditable
}) => {


  const isByFixed = formData.pricing === "By fixed";

  const defaultBarcode = formData.category
    ? products.find((product) => product.product_name === formData.category)?.rbarcode || ""
    : "";

  // Generate options list for barcode selection
  const barcodeOptions = [
    ...products
      .filter((product) => (formData.category ? product.product_name === formData.category : true))
      .map((product) => ({
        value: product.rbarcode,
        label: product.rbarcode,
      })),
    ...data
      .filter((tag) => (formData.category ? tag.category === formData.category : true))
      .map((tag) => ({
        value: tag.PCode_BarCode,
        label: tag.PCode_BarCode,
      })),
  ];

  // Ensure default barcode is included in options
  if (defaultBarcode && !barcodeOptions.some((option) => option.value === defaultBarcode)) {
    barcodeOptions.unshift({ value: defaultBarcode, label: defaultBarcode });
  }

  // Set default barcode only if formData.code is empty
  useEffect(() => {
    if (!formData.code && defaultBarcode) {
      handleBarcodeChange(defaultBarcode);
    }
  }, [formData.category, defaultBarcode]); 

  return (
    <Col>
      <Row>
        <Col xs={12} md={2}>
          <InputField
            label="Category"
            name="category"
            value={formData.category || ""}
            type="select"
            onChange={handleChange}
            options={categoryOptions}
          />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="BarCode/Rbarcode"
            name="code"
            value={formData.code || defaultBarcode} // Default barcode when formData.code is empty
            onChange={(e) => handleBarcodeChange(e.target.value)}
            type="select"
            options={barcodeOptions}
            autoFocus
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
        <Col xs={12} md={2}>
          <InputField
            label="Sub Category"
            name="product_name"
            value={formData.product_name || ""}
            onChange={handleChange}
            type="select"
            options={subcategoryOptions}
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

        <Col xs={12} md={2}>
          <InputField
            label="Pricing"
            name="pricing"
            type="select"
            value={formData.pricing || ""} // Default to "Gross Weight"
            onChange={handleChange}
            options={[
              { value: "By Weight", label: "By Weight" },
              { value: "By fixed", label: "By fixed" },
              ...(formData.pricing &&
                !["By Weight", "By fixed"].includes(formData.pricing)
                ? [{ value: formData.pricing, label: formData.pricing }]
                : []),
            ]}
          />
        </Col>

        {/* Render different fields based on Pricing selection */}
        {isByFixed ? (
          // If Pricing is "By fixed", show only these fields:
          <>
            <Col xs={12} md={1}>
              <InputField
                label="Piece Cost"
                name="pieace_cost"
                value={formData.pieace_cost}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={1}>
              <InputField
                label="Amount"
                name="rate_amt"
                value={formData.rate_amt || "0.00"} // Default to "0.00" if undefined
                onChange={handleChange} // Trigger recalculation of Total MC
                readOnly={false} // Ensure it's editable
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
            <Col xs={12} md={1}>
              <InputField label="Tax%"
                name="tax_percent"
                value={formData.tax_percent}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={1}>
              <InputField
                label="Tax Amt"
                name="tax_amt"
                value={formData.tax_amt || "0.00"} // Default to "0.00" if undefined
                onChange={handleChange} // Optional, since it's auto-calculated
                readOnly
              />
            </Col>
            <Col xs={12} md={1}>
              <InputField
                label="Total Price"
                name="total_price"
                value={formData.total_price || "0.00"} // Default to "0.00" if undefined
                onChange={handleChange} // Optional, since it's auto-calculated
                readOnly
              />
            </Col>
            <Col xs={12} md={2}>
              <InputField
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
              />
            </Col>
            {/* <Col xs={12} md={2}>
              <InputField
                label="Upload Image"
                name="image"
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                ref={fileInputRef} // Attach ref to input field
              />
              {formData.imagePreview && (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={formData.imagePreview}
                    alt="Selected"
                    style={{
                      width: "100px",
                      height: "100px",
                      marginTop: "10px",
                      borderRadius: "8px", // Optional: add rounded corners to the image
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
            </Col> */}
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

              {/* Hidden File Input */}
              <input
                type="file"
                name="image"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />

              {/* Webcam Section */}
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
              {/* Image Preview */}
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
          // Otherwise (if Pricing is not "By fixed"), show all fields:
          <>
            <Col xs={12} md={2}>
              <InputField
                label="Purity"
                name="purity"
                value={formData.purity || ""}
                onChange={handleChange}
                type="select"
                options={purityOptions}
              />
            </Col>
            <Col xs={12} md={1}>
              <InputField
                label="Gross Wt"
                name="gross_weight"
                value={formData.gross_weight || ""}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={1}>
              <InputField
                label="Stone Wt"
                name="stone_weight"
                value={formData.stone_weight || ""}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={1}>
              <InputField
                label="St Price"
                name="stone_price"
                value={formData.stone_price || ""}
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
                value={formData.va_on || ""} // Default to "Gross Weight"
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
            <Col xs={12} md={1}>
              <InputField
                label="Size"
                name="size"
                value={formData.size}
                onChange={handleChange}
              />
            </Col>

            <Col xs={12} md={1}>
              <InputField
                label="Rate"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={1}>
              <InputField
                label="Amount"
                name="rate_amt"
                value={formData.rate_amt || "0.00"} // Default to "0.00" if undefined
                onChange={handleChange} // Trigger recalculation of Total MC
                readOnly={false} // Ensure it's editable
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
                value={formData.mc_per_gram || ""}
                onChange={handleChange}
                disabled={formData.mc_on === "MC / Piece"} // Disable when MC / Piece is selected
              />
            </Col>

            <Col xs={12} md={1}>
              <InputField
                label="Total MC"
                name="making_charges"
                value={formData.making_charges || ""}
                onChange={handleChange}
                disabled={formData.mc_on === "MC / Gram"} // Disable when MC / Gram is selected
              />
            </Col>

            {/* <Col xs={12} md={2}>
              <InputField
                label="Disscount %"
                name="disscount_percentage"
                value={formData.disscount_percentage || ""} // Display calculated Total MC
                onChange={handleChange}
              />
            </Col>

            <Col xs={12} md={2}>
              <InputField
                label="Total Disscount"
                name="disscount"
                value={formData.disscount || ""} // Display calculated Total MC
                onChange={handleChange}
              />
            </Col> */}
            {/* <Col xs={12} md={1}>
              <InputField
                label="Qty"
                name="qty"
                value={formData.qty}
                onChange={handleChange}
                readOnly={!isQtyEditable}
              />
            </Col> */}
            <Col xs={12} md={1}>
              <InputField
                label="HM Charge"
                name="hm_charges"
                value={formData.hm_charges || "0.00"} // Default to "0.00" if undefined
                onChange={handleChange} // Optional, since it's auto-calculated
              />
            </Col>
            <Col xs={12} md={1}>
              <InputField label="Tax%"
                name="tax_percent"
                value={formData.tax_percent}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={1}>
              <InputField
                label="Tax Amt"
                name="tax_amt"
                value={formData.tax_amt || "0.00"} // Default to "0.00" if undefined
                onChange={handleChange} // Optional, since it's auto-calculated
                readOnly
              />
            </Col>
            <Col xs={12} md={2}>
              <InputField
                label="Total Price"
                name="total_price"
                value={formData.total_price || "0.00"} // Default to "0.00" if undefined
                onChange={handleChange} // Optional, since it's auto-calculated
                readOnly
              />
            </Col>
            <Col xs={12} md={2}>
              <InputField
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
              />
            </Col>
            {/* <Col xs={12} md={2}>
              <InputField
                label="Upload Image"
                name="image"
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                ref={fileInputRef} // Attach ref to input field
              />
              {formData.imagePreview && (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={formData.imagePreview}
                    alt="Selected"
                    style={{
                      width: "100px",
                      height: "100px",
                      marginTop: "10px",
                      borderRadius: "8px", // Optional: add rounded corners to the image
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
            </Col> */}
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

              {/* Hidden File Input */}
              <input
                type="file"
                name="image"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />

              {/* Webcam Section */}
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
              {/* Image Preview */}
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
            onClick={isEditing ? handleUpdate : handleAdd} // Conditional action
            style={{
              backgroundColor: isEditing ? "#a36e29" : "#a36e29",
              borderColor: isEditing ? "#a36e29" : "#a36e29", padding: "4px 7px" ,
              marginTop: "3px",
              marginLeft: "-1px",
              fontSize: "13px"
          
            }}
          >
            {isEditing ? "Update" : "Add"}
          </Button>
        </Col>
      </Row>
    </Col>
  );
};

export default ProductDetails;