import React, { useEffect, useState } from 'react';
import { Col, Row, Button, Dropdown, DropdownButton, Modal, Form } from 'react-bootstrap';
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
  tabId
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
      })),
    ...data
      .filter((tag) => (formData.category ? tag.category === formData.category : true))
      .map((tag) => ({
        value: tag.PCode_BarCode,
        label: tag.PCode_BarCode,
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
      // rate_24k: "",
      pieace_cost: "",
      mrp_price: "",
      rate_amt: "",
      tax_percent: "03% GST",
      tax_amt: "",
      hm_charges: "60.00",
      total_price: "",
      transaction_status: "Sales",
      qty: "1",
      opentag_id: "",
      product_image: null,
      imagePreview: null,
      remarks: "",
      sale_status: "Delivered",
      custom_purity: "",
    }));
  };



  return (
    <Col >
      <Row>
        <Col xs={12} md={2}>
          <InputField
            label="BarCode/Rbarcode"
            name="code"
            value={formData.code || ""}
            onChange={(e) => handleBarcodeChange(e.target.value)}
            type="select"
            options={barcodeOptions.filter(option =>
              // Filter barcodes based on selected category if one is selected
              !formData.category ||
              products.some(prod =>
                prod.rbarcode === option.value &&
                prod.product_name === formData.category
              )
            )}
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


        <Col xs={12} md={2} >
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
            // onClick={() => navigate("/subcategory", { state: { from: "/sales" } })}
            onClick={() =>
              navigate("/subcategory", {
                state: {
                  from: `/sales?tabId=${tabId}`
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
            <Col xs={12} md={2}>
              <InputField
                label="Printing Purity"
                name="printing_purity"
                value={formData.printing_purity || ""}
                onChange={handleChange}
              />
            </Col>
            {/* <Col xs={12} md={1}>
              <InputField
                label="Gross Wt"
                name="gross_weight"
                value={formData.gross_weight || ""}
                onChange={handleChange}
              />
            </Col> */}
            {/* <Col xs={12} md={1}>
              <InputField
                label="Rate"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
              />
            </Col> */}
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
            <Col xs={12} md={2}>
              <InputField
                label="Taxable Amt"
                name="piece_taxable_amt"
                value={formData.piece_taxable_amt}
                onChange={handleChange}
                readOnly
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
                label="MRP"
                name="mrp_price"
                value={formData.mrp_price || "0.00"} // Default to "0.00" if undefined
                onChange={handleChange} // Trigger recalculation of Total MC
                readOnly={false} // Ensure it's editable
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
            <Col xs={12} md={2}>
              <InputField
                label="Status"
                type='select'
                name="sale_status"
                value={formData.sale_status}
                onChange={handleChange}
                options={[
                  { value: "Delivered", label: "Delivered" },
                  { value: "Not Delivered", label: "Not Delivered" },
                ]}
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
            {/* <Col xs={12} md={2}>
              <InputField
                label="Purity"
                name="purity"
                value={formData.purity || ""}
                onChange={handleChange}
                type="select"
                options={purityOptions}
              />
            </Col> */}
            {/* <Col xs={12} md={2}>
              <InputField
                label="Purity"
                name="purity"
                value={formData.purity || ""}
                onChange={handleChange}
              // type="select"
              // options={purityOptions}
              />
            </Col> */}
            <Col xs={12} md={2}>
              <InputField
                label="Selling Purity"
                name="selling_purity"
                type="select"
                value={formData.selling_purity}
                onChange={handleChange}
                options={[
                  // { label: "Select Purity", value: "" },
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
                label="St Price"
                name="stone_price"
                type='number'
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


            <Col xs={12} md={1}>
              <InputField
                label="Rate"
                name="rate"
                type='number'
                value={formData.rate}
                onChange={handleChange}
              />
            </Col>
            {/* <Col xs={12} md={1}>
              <InputField
                label="24K Rate"
                name="rate_24k"
                type='number'
                value={formData.rate_24k}
                onChange={handleChange}
              />
            </Col> */}
            <Col xs={12} md={1}>
              <InputField
                label="Amount"
                name="rate_amt"
                value={formData.rate_amt || "0.00"} // Default to "0.00" if undefined
                onChange={handleChange} // Trigger recalculation of Total MC
                readOnly={true} // Ensure it's editable
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
                readOnly={formData.mc_on === "MC / Piece"} // Only disable when MC / Piece is selected
              />
            </Col>

            <Col xs={12} md={1}>
              <InputField
                label="Total MC"
                name="making_charges"
                type='number'
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
            <Col xs={12} md={2}>
              <InputField
                label="HM Charges"
                name="hm_charges"
                type='number'
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
            <Col xs={12} md={2}>
              <InputField
                label="Status"
                type='select'
                name="sale_status"
                value={formData.sale_status}
                onChange={handleChange}
                options={[
                  { value: "Delivered", label: "Delivered" },
                  { value: "Not Delivered", label: "Not Delivered" },
                ]}
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
              borderColor: isEditing ? "#a36e29" : "#a36e29", padding: "4px 7px", marginTop:"5px", marginLeft:"-1px", fontSize : "13px"
            }}
          >
            {isEditing ? "Update" : "Add"}
          </Button>
        </Col>
        <Col xs={12} md={1}>
          <Button
            variant="secondary"
            // onClick={refreshSalesData}
            onClick={handleClear}
            style={{ backgroundColor: 'gray', marginLeft: '-52px', padding: "4px 7px",
              fontSize: "13px",
              marginTop: "5px" }}
          >
            Clear
          </Button>
        </Col>

        <Col xs={12} md={2}>
          <InputField
            label="Estimate Number"
            type="select"
            value={selectedEstimate}
            onChange={handleEstimateChange}
            options={[
              ...estimate.map((item) => ({
                value: item.estimate_number,
                label: item.estimate_number
              }))
            ]}
          />
        </Col>
      </Row>

    </Col>

  );
};

export default ProductDetails;