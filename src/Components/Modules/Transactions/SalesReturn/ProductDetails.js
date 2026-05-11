import React, { useEffect, useState } from 'react';
import { Col, Row, Button } from 'react-bootstrap';
import InputField from './../../../Pages/InputField/InputField';
import axios from 'axios';
import baseURL from "../../../../Url/NodeBaseURL";

const ProductDetails = ({ 
  handleAdd,
  handleUpdate,
  isEditing, 
  formData, 
  data,
  handleChange, 
  handleBarcodeChange,
  handleProductNameChange,
  products,
  filteredDesignOptions,
  filteredPurityOptions,
  filteredMetalTypes,
  uniqueProducts,
  isBarcodeSelected,
  isQtyEditable
}) => {

  console.log("Filtered Design Options:", filteredDesignOptions);
  console.log("Filtered Purity Options:", filteredPurityOptions);
  console.log("Filtered Metal Types:", filteredMetalTypes);
  console.log("Unique Products:", uniqueProducts);
  
  return (
    <Col >
    <Row>
    {/* <Col xs={12} md={2}>
                  <InputField
                    label="BarCode/Rbarcode"
                    name="code"
                    value={formData.code}
                    onChange={(e) => handleBarcodeChange(e.target.value)}
                    type="select"
                    options={
                      !formData.product_id
                        ? [
                            ...products.map((product) => ({
                              value: product.rbarcode,
                              label: product.rbarcode,
                            })),
                            ...data.map((tag) => ({
                              value: tag.PCode_BarCode,
                              label: tag.PCode_BarCode,
                            })),
                          ]
                        : [
                            ...products
                              .filter(
                                (product) =>
                                  String(product.product_id) === String(formData.product_id)
                              )
                              .map((product) => ({
                                value: product.rbarcode,
                                label: product.rbarcode,
                              })),
                            ...data
                              .filter(
                                (tag) =>
                                  String(tag.product_id) === String(formData.product_id)
                              )
                              .map((tag) => ({
                                value: tag.PCode_BarCode,
                                label: tag.PCode_BarCode,
                              })),
                          ]
                    }
                  />
              </Col> */}
                             <Col xs={12} md={2}>
    <InputField
      label="BarCode/Rbarcode"
      name="code"
      value={formData.code}
      onChange={(e) => handleBarcodeChange(e.target.value)}
      type="select"
      options={
        formData.barcodeOptions?.length > 0
          ? formData.barcodeOptions
          : [
              ...products.map((product) => ({
                value: product.rbarcode,
                label: product.rbarcode,
              })),
              ...data.map((tag) => ({
                value: tag.PCode_BarCode,
                label: tag.PCode_BarCode,
              })),
            ]
      }
    />
  </Col>

  {/* Product Name Field */}
  <Col xs={12} md={2}>
    {isBarcodeSelected ? (
      <InputField
        label="Product Name"
        name="product_name"
        value={formData.product_name}
        onChange={handleChange}
        type="text"
      />
    ) : (
      <InputField
        label="Product Name"
        name="product_name"
        value={formData.product_name}
        onChange={(e) => handleProductNameChange(e.target.value)}
        type="select"
        options={uniqueProducts.map((prod) => ({
          value: prod.product_Name,
          label: prod.product_Name,
        }))}
      />
    )}
  </Col>

  {/* Metal Type Field */}
  <Col xs={12} md={2}>
    <InputField
      label="Metal Type"
      name="metal_type"
      value={formData.metal_type}
      onChange={handleChange}
      type="select"
      options={filteredMetalTypes.map((metalType) => ({
        value: metalType.metal_type,
        label: metalType.metal_type,
      }))}
    />
  </Col>

  {/* Design Master Field */}
  <Col xs={12} md={2}>
    {isBarcodeSelected ? (
      <InputField
        label="Design Master"
        name="design_name"
        value={formData.design_name}
        onChange={handleChange}
        type="text"
      />
    ) : (
      <InputField
        label="Design Master"
        name="design_name"
        value={formData.design_name}
        onChange={handleChange}
        type="select"
        options={filteredDesignOptions.map((designOption) => ({
          value: designOption.design_master,
          label: designOption.design_master,
        }))}
      />
    )}
  </Col>

  {/* Purity Field */}
  <Col xs={12} md={2}>
    <InputField
      label="Purity"
      name="purity"
      value={formData.purity}
      onChange={handleChange}
      type="select"
      options={filteredPurityOptions.map((Purity) => ({
        value: Purity.Purity,
        label: Purity.Purity,
      }))}
    />
  </Col>

  {/* Other Fields */}
  <Col xs={12} md={2}>
    <InputField
      label="Category"
      name="category"
      value={formData.category || ""}
      onChange={handleChange}
      readOnly
    />
  </Col>
  <Col xs={12} md={2}>
    <InputField
      label="Sub Category"
      name="sub_category"
      value={formData.sub_category || ""}
      onChange={handleChange}
      readOnly={!isBarcodeSelected}
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
        label="VA On"
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
          label="VA%"
          name="va_percent"
          value={formData.va_percent || ""}
          onChange={handleChange}
        />
      </Col>
      <Col xs={12} md={1}>
        <InputField
          label="WW"
          name="wastage_weight"
          value={formData.wastage_weight || ""}
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
          value={formData.mc_on || ""} // Default to "By Weight"
          onChange={handleChange}
          options={[
            { value: "By Weight", label: "By Weight" },
            { value: "Fixed", label: "Fixed" },
            ...(formData.mc_on &&
            !["By Weight", "Fixed"].includes(formData.mc_on)
              ? [{ value: formData.mc_on, label: formData.mc_on }]
              : []),
          ]}
        />
      </Col>
      <Col xs={12} md={1}>
        <InputField
          label="MC/Gm"
          name="mc_per_gram"
          value={formData.mc_per_gram || ""}
          onChange={handleChange}
        />
      </Col>
      <Col xs={12} md={1}>
        <InputField
          label="Total MC"
          name="making_charges"
          value={formData.making_charges || ""}
          onChange={handleChange}
        />
      </Col>
      <Col xs={12} md={1}>
          <InputField
            label="Rate"
            name="rate"
            value={formData.rate }
            onChange={handleChange}
          />
        </Col>
      <Col xs={12} md={1}>
      <InputField
        label="Qty"
        name="qty"
        value={formData.qty}
        onChange={handleChange}
        readOnly={!isQtyEditable} // Make it editable when isQtyEditable is true
      />
    </Col>
      <Col xs={12} md={1}>
      <InputField
        label="Amount"
        name="rate_amt"
        value={formData.rate_amt || "0.00"} // Default to "0.00" if undefined
        onChange={handleChange} // Optional, since it's auto-calculated
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
      <Col xs={12} md={2}>
        <InputField
          label="Total Price"
          name="total_price"
          value={formData.total_price || "0.00"} // Default to "0.00" if undefined
          onChange={handleChange} // Optional, since it's auto-calculated
          readOnly
        />
      </Col>
      <Col xs={12} md={1}>
          <Button
            onClick={isEditing ? handleUpdate : handleAdd} // Conditional action
            style={{
              backgroundColor: isEditing ? "#a36e29" : "#a36e29",
              borderColor: isEditing ? "#a36e29" : "#a36e29",
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