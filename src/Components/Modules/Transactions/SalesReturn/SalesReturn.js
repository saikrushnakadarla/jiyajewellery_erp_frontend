import React, { useState, useEffect } from "react";
import "./SalesReturn.css";
import InputField from "../../Masters/ItemMaster/Inputfield";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import baseURL from "../../../../Url/NodeBaseURL";

const RepairForm = () => {
  const [products, setProducts] = useState([]);
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    product_id: "",
    product_name: "",
    metal_type: "",
    design_name: "",
    purity: "",
    gross_weight: "",
    st_weight: "",
    weight_bw: "",
    rate: "",
    tax: "",
    barcode: "",
    stones_price: "",
  });
  const [isQtyEditable, setIsQtyEditable] = useState(false);
  const [uniqueProducts, setUniqueProducts] = useState([]); 
  const [metalTypes, setMetalTypes] = useState([]);
  const [purity, setPurity] = useState([]);
  const [filteredMetalTypes, setFilteredMetalTypes] = useState([]);
  const [designOptions, setDesignOptions] = useState([]); 
  const [filteredDesignOptions, setFilteredDesignOptions] = useState([]); 
  const [filteredPurityOptions, setFilteredPurityOptions] = useState([]);

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${baseURL}/get/products`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const result = await response.json();
        setProducts(result);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await fetch(`${baseURL}/get/opening-tags-entry`);
        if (!response.ok) {
          throw new Error("Failed to fetch tags");
        }
        const result = await response.json();
    
        // Remove duplicate product_Name entries
        const uniqueProductNames = Array.from(
          new Map(result.result.map((prod) => [prod.product_Name, prod])).values()
        );
    
        // Extract unique metal types
        const uniqueMetalTypes = Array.from(
          new Set(result.result.map((prod) => prod.metal_type))
        ).map((metalType) => ({ metal_type: metalType }));
    
        // Extract unique design names
        const uniqueDesigns = Array.from(
          new Set(result.result.map((prod) => prod.design_master))
        ).map((designMaster) => ({ design_master: designMaster }));

        const uniquePurity = Array.from(
          new Set(result.result.map((prod) => prod.Purity))
        ).map((Purity) => ({ Purity: Purity }));
    
        setData(result.result); // Set the full data
        setUniqueProducts(uniqueProductNames); // Set unique product_Name options
        setMetalTypes(uniqueMetalTypes); // Set all unique metal types
        setFilteredMetalTypes(uniqueMetalTypes); // Initially, show all metal types
        setDesignOptions(uniqueDesigns); // Set all unique designs
        setFilteredDesignOptions(uniqueDesigns); // Initially, show all designs
        setPurity(uniquePurity); // Set all unique metal types
        setFilteredPurityOptions(uniquePurity); // Initially, show all metal types
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
      
  useEffect(() => {
    fetchProducts();
    fetchTags();
  }, []);

  const handleProductNameChange = (productName) => {
    const product = data.find((prod) => String(prod.product_Name) === String(productName));
  
    if (product) {
      setFormData((prevData) => ({
        ...prevData,
        code: product.rbarcode,
        product_id: product.product_id || "",
        product_name: product.product_Name || "",
        
      }));
  
      // Filter metal types based on the selected product's metal type
      const filteredMetalTypes = metalTypes.filter(
        (metalType) => metalType.metal_type === product.metal_type
      );
      setFilteredMetalTypes(filteredMetalTypes); // Update filtered metal types
  
      // Filter and deduplicate design_master options for the selected product
      const filteredDesignOptions = Array.from(
        new Set(
          data
            .filter((prod) => prod.product_Name === productName)
            .map((prod) => prod.design_master)
        )
      ).map((designMaster) => ({ design_master: designMaster }));
      setFilteredDesignOptions(filteredDesignOptions); // Update filtered design options
  
      // Filter and deduplicate purity options for the selected product
      const filteredPurityOptions = Array.from(
        new Set(
          data
            .filter((prod) => prod.product_Name === productName)
            .map((prod) => prod.Purity)
        )
      ).map((Purity) => ({ Purity }));
      setFilteredPurityOptions(filteredPurityOptions); // Update filtered purity options
    } else {
      setFormData((prevData) => ({
        ...prevData,
        code: "",
        product_id: "",
        product_name: "",
        metal_type: "",
        design_name: "",
        purity: "",
        gross_weight: "",
        stone_weight: "",
        stone_price: "",
        weight_bw: "",
        va_on: "",
        va_percent: "",
        wastage_weight: "",
        total_weight_aw: "",
        mc_on: "",
        mc_per_gram: "",
        making_charges: "",
        rate: "",
        rate_amt: "",
        tax_percent: "",
        tax_amt: "",
        total_price: "",
        qty: "",
      }));
  
      setFilteredMetalTypes(metalTypes); // Reset to all metal types
      setFilteredDesignOptions(designOptions); // Clear design_master options
      setFilteredPurityOptions(purity); // Clear purity options
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
  
    setFormData(updatedFormData);
  
    // Check if all required fields are selected
    const { product_name, metal_type, design_name, purity } = updatedFormData;
  
    if (product_name && metal_type && design_name && purity) {
      // Find all matching entries from the data
      const matchingEntries = data.filter(
        (prod) =>
          prod.product_Name === product_name &&
          prod.metal_type === metal_type &&
          prod.design_master === design_name &&
          prod.Purity === purity
      );
  
      if (matchingEntries.length > 1) {
        // Multiple matches found, populate options but don't set any value
        setFormData((prevData) => ({
          ...prevData,
          code: "", // Ensure no barcode is selected by default
          barcodeOptions: matchingEntries.map((entry) => ({
            value: entry.PCode_BarCode,
            label: entry.PCode_BarCode,
          })),
        }));
      } else if (matchingEntries.length === 1) {
        // Single match found, set the corresponding values
        const matchingEntry = matchingEntries[0];
        const productId = matchingEntry.product_id;
        const productDetails = products.find((prod) => String(prod.product_id) === String(productId));
  
        setFormData((prevData) => ({
          ...prevData,
          code: matchingEntry.PCode_BarCode,
          gross_weight: matchingEntry.Gross_Weight,
          stone_weight: matchingEntry.Stones_Weight || "",
          stone_price: matchingEntry.Stones_Price || "",
          weight_bw: matchingEntry.Weight_BW || "",
          va_on: matchingEntry.Wastage_On || "",
          va_percent: matchingEntry.Wastage_Percentage || "",
          wastage_weight: matchingEntry.WastageWeight || "",
          total_weight_aw: matchingEntry.TotalWeight_AW || "",
          mc_on: matchingEntry.Making_Charges_On || "",
          mc_per_gram: matchingEntry.MC_Per_Gram || "",
          making_charges: matchingEntry.Making_Charges || "",
          tax_percent: productDetails?.tax_slab || "",
          qty: 1,
          barcodeOptions: [], // Clear previous options if any
        }));
      } else {
        // No match found, reset form fields
        setFormData((prevData) => ({
          ...prevData,
          code: "",
          barcodeOptions: [],
          gross_weight: "",
          stone_weight: "",
          stone_price: "",
          weight_bw: "",
          va_on: "",
          va_percent: "",
          wastage_weight: "",
          total_weight_aw: "",
          mc_on: "",
          mc_per_gram: "",
          making_charges: "",
          rate: "",
          rate_amt: "",
          tax_percent: "",
          tax_amt: "",
          total_price: "",
          qty: "",
        }));
      }
    } else {
      // Reset the PCode_BarCode if all fields are not selected
      setFormData((prevData) => ({
        ...prevData,
        code: "",
        barcodeOptions: [],
      }));
    }
  };
  
  
  const handleBarcodeChange = async (code) => {
    try {
      if (!code) {
        // If barcode is cleared, reset all related fields
        setFormData((prevData) => ({
          ...prevData,
          code: "",
          product_id: "",
          product_name: "",
          metal_type: "",
          design_name: "",
          purity: "",
          gross_weight: "",
          stone_weight: "",
          stone_price: "",
          weight_bw: "",
          va_on: "",
          va_percent: "",
          wastage_weight: "",
          total_weight_aw: "",
          mc_on: "",
          mc_per_gram: "",
          making_charges: "",
          rate: "",
          rate_amt: "",
          tax_percent: "",
          tax_amt: "",
          total_price: "",
          qty: "", // Reset qty
        }));
        setIsQtyEditable(true); // Default to editable if barcode is cleared
        return; // Exit early
      }
  
      // Check for product by code
      const product = products.find((prod) => String(prod.rbarcode) === String(code));
      console.log("productDetails:", product);
      if (product) {
        // If product found by code, populate the form
        setFormData((prevData) => ({
          ...prevData,
          code: product.rbarcode,
          product_id: product.product_id,
          product_name: product.product_name,
          metal_type: product.Category,
          design_name: product.design_master,
          purity: product.purity,
          gross_weight: "",
          stone_weight: "",
          stone_price: "",
          weight_bw: "",
          va_on: "",
          va_percent: "",
          wastage_weight: "",
          total_weight_aw: "",
          mc_on: "",
          mc_per_gram: "",
          making_charges: "",
          tax_percent: product.tax_slab,
          qty: 1, // Set qty to 1 for product
        }));
        setIsQtyEditable(false); // Set qty as read-only
      } else {
        // Check if tag exists by code
        const tag = data.find((tag) => String(tag.PCode_BarCode) === String(code));
  
        if (tag) {
          const productId = tag.product_id;
          const productDetails = products.find((prod) => String(prod.product_id) === String(productId));
          console.log("productDetails:", productDetails);
          // Log opentag_id for debugging
          console.log("opentag_id:", tag.opentag_id);
  
          setFormData((prevData) => ({
            ...prevData,
            code: tag.PCode_BarCode || "",
            product_id: tag.product_id || "",
            opentag_id: tag.opentag_id || "",
            product_name: tag.product_Name || "",
            metal_type: productDetails?.Category || "",
            design_name: tag.design_master || "",
            purity: tag.Purity || "",
            gross_weight: tag.Gross_Weight || "",
            stone_weight: tag.Stones_Weight || "",
            stone_price: tag.Stones_Price || "",
            weight_bw: tag.Weight_BW || "",
            va_on: tag.Wastage_On || "",
            va_percent: tag.Wastage_Percentage || "",
            wastage_weight: tag.WastageWeight || "",
            total_weight_aw: tag.TotalWeight_AW || "",
            mc_on: tag.Making_Charges_On || "",
            mc_per_gram: tag.MC_Per_Gram || "",
            making_charges: tag.Making_Charges || "",
            tax_percent: productDetails?.tax_slab || "",
            qty: 1, // Allow qty to be editable for tag
          }));
          setIsQtyEditable(true); // Allow editing of qty
        } else {
          // Reset form if no tag is found
          setFormData((prevData) => ({
            ...prevData,
            code: "",
            product_id: "",
            product_name: "",
            metal_type: "",
            design_name: "",
            purity: "",
            gross_weight: "",
            stone_weight: "",
            stone_price: "",
            weight_bw: "",
            va_on: "",
            va_percent: "",
            wastage_weight: "",
            total_weight_aw: "",
            mc_on: "",
            mc_per_gram: "",
            making_charges: "",
            rate: "",
            rate_amt: "",
            tax_percent: "",
            tax_amt: "",
            total_price: "",
            qty: "", // Reset qty
          }));
          setIsQtyEditable(true); // Default to editable
        }
      }
    } catch (error) {
      console.error("Error handling code change:", error);
    }
  };

  return (
    <div className="main-container">
      <Container className="sales-form-container">
        <Form>
          <h3 style={{ marginTop: '-45px', marginBottom: '10px', textAlign: 'left', color: '#a36e29' }}>Sales</h3>
          <div className="sales-form-section">
            <Col>
            <Row>
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
                  options={filteredDesignOptions.map((designOption) => ({
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
      </Row>
            </Col>
          </div>
        </Form>
      </Container>
    </div>
  );
};

export default RepairForm;
