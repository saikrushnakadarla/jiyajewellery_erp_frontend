import React from 'react';
import { Col, Row, Button } from 'react-bootstrap';
import InputField from './../../../Pages/InputField/InputField';

const ProductDetails = ({ 
  formData, 
  data,
  handleChange, 
  handleBarcodeChange,
  handleProductNameChange,
  handleImageUpload,
  handleAdd,
  products,
  filteredDesignOptions,
  filteredPurityOptions,
  filteredMetalTypes,
  uniqueProducts,
  isQtyEditable
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      // Check file size (e.g., 5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('File size should be less than 5MB');
        return;
      }

      // Create a preview URL and pass the file to parent
      handleImageUpload(file);
    }
  };

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
<Col xs={12} md={3}>
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
              </Col>
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
              <Col xs={12} md={3}>
                <InputField
                  label="Design Master"
                  name="design_name"
                  value={formData.design_name}
                  onChange={handleChange}
                  type="select"
                  options={filteredDesignOptions?.map((designOption) => ({
                    value: designOption.design_master,
                    label: designOption.design_master,
                  }))}
                />
              </Col>
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
      <Col xs={12} md={1}>
        <InputField
          label="Gross Wt"
          name="gross_weight"
          value={formData.gross_weight || ""} // Default to "0" if undefined
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
      <Col xs={12} md={2}>
        <InputField
          label="Making Charges"
          name="making_charges"
          value={formData.making_charges || ""}
          onChange={handleChange}
        />
      </Col>
      <Col xs={12} md={1}>
        <InputField label="Rate" name="rate"
          value={formData.rate}
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
      <Col xs={12} md={2}>
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
      <Col xs={12} md={3}>
          <div className="mb-3">
            <label className="form-label">Product Image</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleFileChange}
            />
            {formData.product_image && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(formData.product_image)}
                  alt="Preview"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
              </div>
            )}
          </div>
        </Col>
        <Col xs={12} md={1}>
          <Button onClick={handleAdd} style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>Add</Button>
        </Col>
      </Row>
      </Col> 
  );
};

export default ProductDetails;