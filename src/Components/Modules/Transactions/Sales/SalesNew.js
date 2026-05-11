import React, { useState, useEffect } from "react";
import "./SalesForm.css";
import InputField from "../../Masters/ItemMaster/Inputfield";
import { Container, Row, Col, Button, Form, Modal  } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import baseURL from "../../../../Url/NodeBaseURL";
import axios from 'axios';
import Webcam from "react-webcam";

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
      // const uniqueProductNames = Array.from(
      //   new Map(result.result.map((prod) => [prod.sub_category, prod])).values()
      // );

      // // Extract unique metal types
      // const uniqueMetalTypes = Array.from(
      //   new Set(result.result.map((prod) => prod.metal_type))
      // ).map((metalType) => ({ metal_type: metalType }));

      // // Extract unique design names
      // const uniqueDesigns = Array.from(
      //   new Set(result.result.map((prod) => prod.design_master))
      // ).map((designMaster) => ({ design_master: designMaster }));

      // const uniquePurity = Array.from(
      //   new Set(result.result.map((prod) => prod.Purity))
      // ).map((Purity) => ({ Purity: Purity }));

      setData(result.result); // Set the full data
      // setUniqueProducts(uniqueProductNames); // Set unique product_Name options
      // setMetalTypes(uniqueMetalTypes); // Set all unique metal types
      // setFilteredMetalTypes(uniqueMetalTypes); // Initially, show all metal types
      // setDesignOptions(uniqueDesigns); // Set all unique designs
      // setFilteredDesignOptions(uniqueDesigns); // Initially, show all designs
      // setPurity(uniquePurity); // Set all unique metal types
      // setFilteredPurityOptions(uniquePurity); // Initially, show all metal types
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const [showScanner, setShowScanner] = useState(false);
  
  const handleScan = (barcode) => {
    handleBarcodeChange(barcode); 
    setShowScanner(false); 
  };

  useEffect(() => {
    fetchProducts();
    fetchTags();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Preserve the current barcode
    const currentBarcode = formData.code;

    // Update the specific field in formData
    const updatedFormData = { ...formData, [name]: value };

    setFormData(updatedFormData);

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // if (name === "purity" || name === "metal_type") {
    //   // Separate condition for gold
    //   if (formData.metal_type.toLowerCase() === "gold") {
    //     // Check for different purity values and set the rate accordingly for gold
    //     if (
    //       value.toLowerCase().includes("22") || // Check for 22 KT, 22K, 22k, etc.
    //       value.toLowerCase().includes("22kt") ||
    //       value.toLowerCase().includes("22k")
    //     ) {
    //       updatedFormData.rate = rates.rate_22crt;
    //     } else if (
    //       value.toLowerCase().includes("24") || // Check for 24 KT, 24K, etc.
    //       value.toLowerCase().includes("24kt") ||
    //       value.toLowerCase().includes("24k")
    //     ) {
    //       updatedFormData.rate = rates.rate_24crt;
    //     } else if (
    //       value.toLowerCase().includes("18") || // Check for 18 KT, 18K, etc.
    //       value.toLowerCase().includes("18kt") ||
    //       value.toLowerCase().includes("18k")
    //     ) {
    //       updatedFormData.rate = rates.rate_18crt;
    //     } else if (
    //       value.toLowerCase().includes("16") || // Check for 16 KT, 16K, etc.
    //       value.toLowerCase().includes("16kt") ||
    //       value.toLowerCase().includes("16k")
    //     ) {
    //       updatedFormData.rate = rates.rate_16crt;
    //     } else {
    //       updatedFormData.rate = "";
    //     }
    //   }
    // }

    // Trigger recalculation for Total MC if relevant fields are updated
    // if (
    //   formData.metal_type?.toLowerCase() === "gold" &&
    //   (name === "mc_per_gram" || name === "rate_amt")
    // ) {
    //   const mcPercentage = parseFloat(
    //     name === "mc_per_gram" ? value : formData.mc_per_gram
    //   ) || 0;
    //   const rateAmount = parseFloat(
    //     name === "rate_amt" ? value : formData.rate_amt
    //   ) || 0;

    //   const totalMC = (mcPercentage / 100) * rateAmount;
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     making_charges: totalMC.toFixed(2),
    //   }));
    // }

    // Handle discount calculation
    if (name === "disscount_percentage") {
      const discountPercentage = parseFloat(value) || 0;
      const makingCharges = parseFloat(formData.making_charges) || 0;
      const discountAmount = (discountPercentage / 100) * makingCharges;

      updatedFormData.disscount = discountAmount.toFixed(2);
    }

    setFormData(updatedFormData);
  };

  const handleProductNameChange = (productName) => {
    const productEntries = data.filter((prod) => prod.sub_category === productName);

    if (productEntries.length > 0) {
      const uniqueMetalTypes = Array.from(
        new Set(productEntries.map((prod) => prod.metal_type))
      ).map((metalType) => ({ metal_type: metalType }));

      setFormData((prevData) => ({
        ...prevData,
        product_name: productName,
        metal_type: "",
        design_name: "",
      }));

      setFilteredMetalTypes(uniqueMetalTypes); // Update metal types based on selected product
      setFilteredDesignOptions([]); // Clear design options initially
    } else {
      // Reset fields if no matching product entries found
      setFormData((prevData) => ({
        ...prevData,
        code: "",
        product_name: "",
        metal_type: "",
        design_name: "",
        purity: "",
        category: "",
        sub_category: "",
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
        disscount_percentage: "",
        disscount: "",
        rate: "",
        rate_amt: "",
        tax_percent: "",
        tax_amt: "",
        total_price: "",
        qty: "", // Rese
      }));

      setFilteredMetalTypes(metalTypes);
      setFilteredDesignOptions(designOptions);
    }
  };

  const handleMetalTypeChange = (metalType) => {
    const productEntries = data.filter(
      (prod) => prod.sub_category === formData.product_name && prod.metal_type === metalType
    );

    if (productEntries.length > 0) {
      const uniqueDesignOptions = Array.from(
        new Set(productEntries.map((prod) => prod.design_master))
      ).map((designMaster) => ({ design_master: designMaster }));

      setFormData((prevData) => ({
        ...prevData,
        metal_type: metalType,
        design_name: "",
      }));

      setFilteredDesignOptions(uniqueDesignOptions); // Update design options based on metal type
    } else {
      // Reset if no matching entries found
      setFormData((prevData) => ({
        ...prevData,
        metal_type: "",
        design_name: "",
      }));

      setFilteredDesignOptions([]);
    }
  };

  const handleDesignNameChange = (designName) => {
    const productEntries = data.filter(
      (prod) =>
        prod.sub_category === formData.product_name &&
        prod.metal_type === formData.metal_type &&
        prod.design_master === designName
    );

    if (productEntries.length > 0) {
      const uniquePurityOptions = Array.from(
        new Set(productEntries.map((prod) => prod.Purity))
      ).map((Purity) => ({ Purity }));

      setFormData((prevData) => ({
        ...prevData,
        design_name: designName,
        purity: "",
      }));

      setFilteredPurityOptions(uniquePurityOptions); // Update purity options based on design
    } else {
      setFormData((prevData) => ({
        ...prevData,
        design_name: "",
        purity: "",

      }));

      setFilteredPurityOptions([]);
    }
  };

  const [isBarcodeSelected, setIsBarcodeSelected] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [metaltypeOptions, setMetaltypeOptions] = useState([]);
  const [purityOptions, setpurityOptions] = useState([]);
  const [designOptions, setDesignOptions] = useState([]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`${baseURL}/get/products`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const result = await response.json();
        if (result && Array.isArray(result)) {
          const formattedOptions = result.map((item) => ({
            label: item.product_name, // Display name
            value: item.product_name, // Unique value
          }));
          setCategoryOptions(formattedOptions);
        } else {
          console.error("Invalid API response format", result);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchCategory();
  }, []);

  useEffect(() => {
    const fetchSubCategory = async () => {
      try {
        const response = await fetch(`${baseURL}/subcategory`); // Use the correct API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        if (result && result.data) {
          const formattedOptions = result.data.map((item) => ({
            label: item.sub_category_name, // Display value
            value: item.sub_category_name, // Unique ID for value
          }));

          setSubcategoryOptions(formattedOptions);
        } else {
          console.error("Invalid API response format", result);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchSubCategory();
  }, []);

  useEffect(() => {
    const fetchMetalType = async () => {
      try {
        const response = await fetch(`${baseURL}/metaltype`);
        const data = await response.json();
        const categories = Array.from(
          new Set(data.map((product) => product.metal_name))
        );
        setMetaltypeOptions(categories.map((category) => ({
          value: category,
          label: category,
        })));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchMetalType();
  }, []);

  useEffect(() => {
    const fetchDesignName = async () => {
      try {
        const response = await fetch(`${baseURL}/designmaster`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const result = await response.json();
        if (result && Array.isArray(result)) {
          const formattedOptions = result.map((item) => ({
            label: item.design_name, // Display name
            value: item.design_name, // Unique value
          }));
          setDesignOptions(formattedOptions);
        } else {
          console.error("Invalid API response format", result);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchDesignName();
  }, []);

  useEffect(() => {
    const fetchPurity = async () => {
      try {
        const response = await fetch(`${baseURL}/purity`);
        const data = await response.json();

        const filteredData = data.filter((product) => {
          return product.metal?.toLowerCase() === formData.metal_type?.toLowerCase();
        });
        const purities = Array.from(
          new Set(filteredData.map((product) => `${product.name} | ${product.purity}`))
        );
        const purityOptions = purities.map((purity) => ({
          value: purity,
          label: purity,
        }));

        setpurityOptions(purityOptions);
        const defaultPurity = purityOptions.find((option) =>
          /22/i.test(option.value)
        )?.value;

        setFormData((prevData) => ({
          ...prevData,
          purity: defaultPurity || "",
        }));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    if (formData.metal_type) {
      fetchPurity();
    }
  }, [formData.metal_type]);

  const handleBarcodeChange = async (code) => {
    try {
      if (!code) {
        // If barcode is cleared, reset all related fields and set code to ""
        setIsBarcodeSelected(false);  // Reset the barcode selection flag
        setFormData((prevData) => ({
          ...prevData,
          code: "",  // Reset code when barcode is cleared
          product_id: "",
          product_name: "",
          metal_type: "",
          design_name: "",
          purity: "",
          category: "",
          sub_category: "",
          gross_weight: "",
          stone_weight: "",
          stone_price: "",
          weight_bw: "",
          va_on: "Gross Weight",
          va_percent: "",
          wastage_weight: "",
          total_weight_aw: "",
          mc_on: "MC %",
          mc_per_gram: "",
          making_charges: "",
          disscount_percentage: "",
          disscount: "",
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
      if (product) {
        setIsBarcodeSelected(true);

        // Find the default purity value that includes "22"
        const defaultPurity = purityOptions.find((option) =>
          /22/i.test(option.value)
        )?.value;  // Set the barcode as selected
        setFormData((prevData) => ({
          ...prevData,
          code: product.rbarcode,  // Retain the selected barcode
          product_id: product.product_id,
          product_name: "", // Make editable
          metal_type: product.Category,
          design_name: "", // Make editable
          purity: defaultPurity || "",
          category: product.product_name,
          sub_category: "",
          gross_weight: "",
          stone_weight: "",
          stone_price: "",
          weight_bw: "",
          va_on: "Gross Weight",
          va_percent: "",
          wastage_weight: "",
          total_weight_aw: "",
          mc_on: "MC %",
          mc_per_gram: "",
          making_charges: "",
          disscount_percentage: "",
          disscount: "",
          tax_percent: product.tax_slab,
          qty: 1, // Set qty to 1 for product
        }));
        setIsQtyEditable(false); // Set qty as read-only
      } else {
        // Check if tag exists by code
        const tag = data.find((tag) => String(tag.PCode_BarCode) === String(code));
        if (tag) {
          // setIsBarcodeSelected(true);  
          // If the tag is marked as "Sold"
          if (tag.Status === "Sold") {
            alert("The product is already sold out!");
            setFormData((prevData) => ({
              ...prevData,
            }));
            setIsQtyEditable(true); // Allow editing of qty
            return;
          }

          const productId = tag.product_id;
          const productDetails = products.find((prod) => String(prod.product_id) === String(productId));

          setFormData((prevData) => ({
            ...prevData,
            code: tag.PCode_BarCode || "", // Retain the barcode
            product_id: tag.product_id || "",
            opentag_id: tag.opentag_id || "",
            product_name: tag.sub_category || "", // Make editable
            metal_type: tag.metal_type || "",
            design_name: tag.design_master || "", // Make editable
            purity: tag.Purity || "",
            category: tag.category || "",
            sub_category: tag.sub_category || "",
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
            code: "", // Reset code
            product_id: "",
            product_name: "",
            metal_type: "",
            design_name: "",
            purity: "",
            category: "",
            sub_category: "",
            gross_weight: "",
            stone_weight: "",
            stone_price: "",
            weight_bw: "",
            va_on: "Gross Weight",
            va_percent: "",
            wastage_weight: "",
            total_weight_aw: "",
            mc_on: "MC %",
            mc_per_gram: "",
            making_charges: "",
            disscount_percentage: "",
            disscount: "",
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
              <Col xs={12} md={1}>
        <Button variant="primary" onClick={() => setShowScanner(true)}>
          Scan 
        </Button>
      </Col>
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
                    label="Purity"
                    name="purity"
                    value={formData.purity || ""}
                    onChange={handleChange}
                    type="select"
                    options={purityOptions}
                  />
                </Col>
                  {/* Modal for Barcode Scanner */}
      <Modal show={showScanner} onHide={() => setShowScanner(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Scan Barcode</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Webcam
            audio={false}
            screenshotFormat="image/png"
            width="100%"
            height="auto"
            videoConstraints={{ facingMode: "environment" }}
          />
          <Button variant="success" onClick={() => handleScan("1234567890")}>
            Simulate Scan (Replace with Scanner Logic)
          </Button>
        </Modal.Body>
      </Modal>
              </Row>
            </Col>
          </div>
        </Form>
      </Container>
    </div>
  );
};

export default RepairForm;
