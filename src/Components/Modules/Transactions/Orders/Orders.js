// React Component
import React, { useState, useEffect } from "react";
import "./Orders.css";
import InputField from "../../../Pages/InputField/InputField";
import { Container, Row, Col, Button, Table, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiOutlinePlus } from "react-icons/ai";
import baseURL from "../../../../Url/NodeBaseURL";


const RepairForm = () => {
  const navigate = useNavigate();
  const [metal, setMetal] = useState("");
  const [products, setProducts] = useState([]);
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: "value001",
    mobile: "",
    account_name: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    pincode: "",
    state: "",
    state_code: "",
    aadhar_card: "",
    gst_in: "",
    pan_card: "",
    date: "",
    invoice_number: "",
    code: "",
    product_id:"",
    metal: "",
    product_name: "",
    metal_type: "",
    design_name: "",
    purity: "",
    gross_weight: "",
    stone_weight: "",
    weight_bw: "",
    stone_price: "",
    va_on: "",
    va_percent: "",
    wastage_weight: "",
    total_weight_av: "",
    mc_on: "",
    mc_per_gram: "",
    making_charges: "",
    rate: "",
    rate_amt: "",
    tax_percent: "",
    tax_amt: "",
    total_price: "",
    transaction_status: "Orders",
    qty:"",
    opentag_id:"",
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cash_amount: 0,

    card_amt: 0,
    chq: "",
    chq_amt: 0,
    online: "",
    online_amt: 0,


  });


  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    setFormData((prevData) => ({ ...prevData, date: today }));
  }, []);


  const [orderDetails, setRepairDetails] = useState([]);
  const [isQtyEditable, setIsQtyEditable] = useState(false);
  useEffect(() => {
    const fetchLastInvoiceNumber = async () => {
      try {
        const response = await axios.get(`${baseURL}/lastInvoiceNumber`);
        setFormData({ ...formData, invoice_number: response.data.lastInvoiceNumber });
      } catch (error) {
        console.error("Error fetching invoice number:", error);
      }
    };

    fetchLastInvoiceNumber();
  }, []);

  useEffect(() => {
   
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
          throw new Error('Failed to fetch tags');
        }
        const result = await response.json();
        setData(result.result);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${baseURL}/get/account-details`);
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const result = await response.json();
        const customers = result.filter(
          (item) => item.account_group === 'CUSTOMERS'
        );
        setCustomers(customers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchProducts();
    fetchTags();
    fetchCustomers();
  }, []);

  const handleCustomerChange = (customerId) => {
    const customer = customers.find(
      (cust) => String(cust.account_id) === String(customerId)
    );
    if (customer) {
      setFormData({
        ...formData,
        customer_id: customerId,
        mobile: customer.mobile || "",
        account_name: customer.account_name || "",
        email: customer.email || "",
        address1: customer.address1 || "",
        address2: customer.address2 || "",
        city: customer.city || "",
        pincode: customer.pincode || "",
        state: customer.state || "",
        state_code: customer.state_code || "",
        aadhar_card: customer.aadhar_card || "",
        gst_in: customer.gst_in || "",
        pan_card: customer.pan_card || "",

      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleMetalTypeChange = (metalType) => {
    const product = products.find((prod) => String(prod.Category) === String(metalType));

    if (product) {
      setFormData((prevData) => ({
        ...prevData,
        code: product.rbarcode || "",
        product_id: product.product_id || "",
        product_name: product.product_name || "",
        metal_type: product.Category || "",
        design_name: product.design_master || "",
        purity: product.purity || "",
        
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        code: "",
        product_id: "",
        product_name: "",
        metal_type: "",
        design_name: "",
        purity: "",
        
      }));
    }
  };

  const handleDesignNameChange = (designName) => {
    const product = products.find((prod) => String(prod.design_master) === String(designName));

    if (product) {
      setFormData((prevData) => ({
        ...prevData,
        code: product.rbarcode || "",
        product_id: product.product_id || "",
        product_name: product.product_name || "",
        metal_type: product.Category || "",
        design_name: product.design_master || "",
        purity: product.purity || "",
        
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        code: "",
        product_id: "",
        product_name: "",
        metal_type: "",
        design_name: "",
        purity: "",
        
      }));
    }
  };
  
  const handleProductNameChange = (productName) => {
    const product = products.find((prod) => String(prod.product_name) === String(productName));

    if (product) {
      setFormData((prevData) => ({
        ...prevData,

        code: product.rbarcode,

        product_id: product.product_id || "",
        product_name: product.product_name || "",
        metal_type: product.Category || "",
        design_name: product.design_master || "",
        purity: product.purity || "",
        
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        code: "",
        product_id: "",
        product_name: "",
        metal_type: "",
        design_name: "",
        purity: "",
        
      }));
    }
  };

  const handleProductChange = (productId) => {
    const product = products.find((prod) => String(prod.product_id) === String(productId));
  
    if (product) {
      // Find the corresponding tag entry from the open-tags-entry
      const tag = data.find((tag) => String(tag.product_id) === String(productId));
      
      // If tag is found, populate the form with the tag's details
      if (tag) {
        setFormData((prevData) => ({
          ...prevData,
          code: '', // Priority to tag code if available
          product_id: product.product_id,
          product_name: product.product_name,
          metal_type: product.Category,
          design_name: product.design_master,
          purity: product.purity,
          gross_weight: "", // Use tag's gross weight
          stone_weight: "",
          stone_price:"",
          weight_bw: "",
          va_on: "",
          va_percent:  "",
          wastage_weight: "",
          total_weight_aw: "",
          mc_on: "",
          mc_per_gram: "",
          making_charges: "",
        }));
      } else {
        // If no tag is found, just fill product details
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
        }));
      }
    } else {
      // Reset form data if no product is selected
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
      }));
    }
  };
  
  const handleBarcodeChange = async (code) => {
    try {
      // Check for product by code
      const product = products.find((prod) => String(prod.rbarcode) === String(code));
  
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
          tax_percent:product.tax_slab ,
          qty: 1, // Set qty to 1 for product
        }));
        setIsQtyEditable(false); // Set qty as read-only
      } else {
        // Check if tag exists by code
        const tag = data.find((tag) => String(tag.PCode_BarCode) === String(code));
  
        if (tag) {
          const productId = tag.product_id;
          const productDetails = products.find((prod) => String(prod.product_id) === String(productId));
  
          setFormData((prevData) => ({
            ...prevData,
            code: tag.PCode_BarCode || "",
            product_id: tag.product_id || "",
            product_name: productDetails?.product_name || "",
            metal_type: productDetails?.Category || "",
            design_name: productDetails?.design_master || "",
            purity: productDetails?.purity || "",
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
            tax_percent:productDetails?.tax_slab || "",
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

  const handleAdd = () => {
    setRepairDetails([...orderDetails, { ...formData }]); // Add current formData to orderDetails
    
    // Reset only the product-related fields, keeping the customer details intact
    setFormData((prevData) => ({
      ...prevData, // Retain customer-related fields
      code: "",
      product_id: "",
      metal: "",
      product_name: "",
      metal_type: "",
      design_name: "",
      purity: "",
      gross_weight: "",
      stone_weight: "",
      weight_bw: "",
      stone_price: "",
      va_on: "",
      va_percent: "",
      wastage_weight: "",
      total_weight_av: "",
      mc_on: "",
      mc_per_gram: "",
      making_charges: "",
      rate: "",
      rate_amt: "",
      tax_percent: "",
      tax_amt: "",
      total_price: "",
      qty:"",
    }));
  };
  
  const handleSave = async () => {
    const dataToSave = orderDetails.map((item) => ({
      ...item,
      cash_amount: paymentDetails.cash_amount || 0,
      card_amount: paymentDetails.card || 0,
      card_amt: paymentDetails.card_amt || 0,
      chq: paymentDetails.chq || "",
      chq_amt: paymentDetails.chq_amt || 0,
      online: paymentDetails.online || "",
      online_amt: paymentDetails.online_amt || 0,
    }));

    try {
      await axios.post(`${baseURL}/save-repair-details`, {
        orderDetails: dataToSave,
      });
      alert("Data saved successfully");
      setRepairDetails([]);
      setFormData({
        customer_id: "",
        mobile: "",
        account_name: "",
        email: "",
        address1: "",
        address2: "",
        city: "",
        pincode: "",
        state: "",
        state_code: "",
        aadhar_card: "",
        gst_in: "",
        pan_card: "",
        date: "",
        invoice_number: "",
      });
      setPaymentDetails({
        cash_amount: 0,  card_amt: 0,
        chq: "",
        chq_amt: 0,
        online: "",
        online_amt: 0,
      });
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data");
    }
  };
  const handleBack = () => {
    navigate("/salestable");
  };

  const handleAddCustomer = () => {
    navigate("/customermaster", { state: { from: "/sales" } });
  };

  useEffect(() => {
    const grossWeight = parseFloat(formData.gross_weight) || 0; // Default to 0
    const stonesWeight = parseFloat(formData.stone_weight) || 0; // Default to 0
    const weightBW = grossWeight - stonesWeight;
  
    setFormData((prev) => ({
      ...prev,
      weight_bw: weightBW.toFixed(2), // Ensures two decimal places
    }));
  }, [formData.gross_weight, formData.stone_weight]);
  
  useEffect(() => {
    const wastagePercentage = parseFloat(formData.va_percent) || 0; // Default to 0
    const grossWeight = parseFloat(formData.gross_weight) || 0; // Default to 0
    const weightBW = parseFloat(formData.weight_bw) || 0; // Default to 0
  
    let wastageWeight = 0;
    let totalWeight = 0;
  
    if (formData.va_on === "Gross Weight") {
      wastageWeight = (grossWeight * wastagePercentage) / 100;
      totalWeight = grossWeight + wastageWeight;
    } else if (formData.va_on === "Weight BW") {
      wastageWeight = (weightBW * wastagePercentage) / 100;
      totalWeight = weightBW + wastageWeight;
    }
    setFormData((prev) => ({
      ...prev,
      wastage_weight: wastageWeight.toFixed(2),
      total_weight_av: totalWeight.toFixed(2),
    }));
  }, [formData.va_on, formData.va_percent, formData.gross_weight, formData.weight_bw]);
  
  const handleMakingChargesCalculation = () => {
    const totalWeight = parseFloat(formData.total_weight_av) || 0; // Default to 0
    const mcPerGram = parseFloat(formData.mc_per_gram) || 0; // Default to 0
    const makingCharges = parseFloat(formData.making_charges) || 0; // Default to 0
  
    if (formData.mc_on === "By Weight") {
      const calculatedMakingCharges = totalWeight * mcPerGram;
      setFormData((prev) => ({
        ...prev,
        making_charges: calculatedMakingCharges.toFixed(2),
      }));
    } else if (formData.mc_on === "Fixed") {
      if (totalWeight > 0) { // Prevent division by zero
        const calculatedMcPerGram = makingCharges / totalWeight;
        setFormData((prev) => ({
          ...prev,
          mc_per_gram: calculatedMcPerGram.toFixed(2),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          mc_per_gram: "0.00",
        }));
      }
    }
  };
  
  useEffect(() => {
    handleMakingChargesCalculation();
  }, [formData.mc_on, formData.mc_per_gram, formData.making_charges, formData.total_weight_av]);

  useEffect(() => {
    const rate = parseFloat(formData.rate) || 0; // Default to 0
    const totalWeight = parseFloat(formData.total_weight_av) || 0; // Default to 0
    const stonePrice = parseFloat(formData.stone_price) || 0; // Default to 0
    const makingCharges = parseFloat(formData.making_charges) || 0; // Default to 0  
    const rateAmt = rate * totalWeight + stonePrice + makingCharges; 
    setFormData((prev) => ({
      ...prev,
      rate_amt: rateAmt.toFixed(2), // Ensures two decimal places
    }));
  }, [formData.rate, formData.total_weight_av, formData.stone_price, formData.making_charges]);

  useEffect(() => {
    const taxPercent = parseFloat(formData.tax_percent) || 0; // Default to 0
    const rateAmt = parseFloat(formData.rate_amt) || 0; // Default to 0  
    const taxAmt = (rateAmt * taxPercent) / 100;  
    setFormData((prev) => ({
      ...prev,
      tax_amt: taxAmt.toFixed(2), // Ensures two decimal places
    }));
  }, [formData.tax_percent, formData.rate_amt]);
  
  useEffect(() => {
    const rateAmt = parseFloat(formData.rate_amt) || 0; // Default to 0
    const taxAmt = parseFloat(formData.tax_amt) || 0; // Default to 0
    const totalPrice = rateAmt + taxAmt; 
    setFormData((prev) => ({
      ...prev,
      total_price: totalPrice.toFixed(2), // Ensures two decimal places
    }));
  }, [formData.rate_amt, formData.tax_amt]);
  
  return (
    <div className="main-container">
      <Container className="sales-form-container">
        <Form>
        <h3 style={{ marginTop: '-45px', marginBottom: '10px', textAlign: 'left', color: '#a36e29' }}>Orders</h3>
          <div className="sales-form">
            <div className="sales-form-left">
              <Col className="sales-form-section">
              <Row>
  <Col xs={12} md={2} className="d-flex align-items-center">
    <div style={{ flex: 1 }}>
      <InputField
        label="Mobile"
        name="mobile"
        type="select"
        value={formData.customer_id || ""} // Use customer_id to match selected value
        onChange={(e) => handleCustomerChange(e.target.value)}
        options={[
          { value: "", label: "Select" }, // Placeholder option
          ...customers.map((customer) => ({
            value: customer.account_id, // Use account_id as the value
            label: customer.mobile, // Display mobile as the label
          })),
        ]}
      />
    </div>
    <AiOutlinePlus
      size={20}
      color="black"
      onClick={handleAddCustomer}
      style={{
        marginLeft: "10px",
        cursor: "pointer",
        marginBottom: "20px",
      }}
    />
  </Col>
  <Col xs={12} md={2}>
    <InputField
      label="Customer Name"
      name="account_name"
      value={formData.account_name || ""}
      readOnly
    />
  </Col>
  <Col xs={12} md={2}>
    <InputField
      label="Email:"
      name="email"
      type="email"
      value={formData.email || ""}
      readOnly
    />
  </Col>
  <Col xs={12} md={2}>
    <InputField
      label="Address1:"
      name="address1"
      value={formData.address1 || ""}
      readOnly
    />
  </Col>
  <Col xs={12} md={2}>
    <InputField
      label="Address2:"
      name="address2"
      value={formData.address2 || ""}
      readOnly
    />
  </Col>
  <Col xs={12} md={2}>
    <InputField
      label="City"
      name="city"
      value={formData.city || ""}
      readOnly
    />
  </Col>
  <Col xs={12} md={1}>
    <InputField
      label="PIN"
      name="pincode"
      value={formData.pincode || ""}
      readOnly
    />
  </Col>
  <Col xs={12} md={2}>
    <InputField label="State:" name="state" value={formData.state || ""} readOnly />
  </Col>
  <Col xs={12} md={2}>
    <InputField label="State Code:" name="state_code" value={formData.state_code || ""} readOnly />
  </Col>
  <Col xs={12} md={3}>
    <InputField label="Aadhar" name="aadhar_card" value={formData.aadhar_card || ""} readOnly />
  </Col>
  <Col xs={12} md={2}>
    <InputField label="GSTIN" name="gst_in" value={formData.gst_in || ""} readOnly />
  </Col>
  <Col xs={12} md={2}>
    <InputField label="PAN" name="pan_card" value={formData.pan_card || ""} readOnly />
  </Col>
</Row>

              </Col>
            </div>
            {/* Right Section */}
            <div className="sales-form-right">
              <Col className="sales-form-section">
                <Row>
                  <InputField
                    label="Date"
                    name="date"
                    type="date"
                    value={formData.date}
                    max={new Date().toISOString().split("T")[0]} 
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </Row>
                <Row>

                  <InputField
                    label="Invoice Number"
                    name="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) =>
                      setFormData({ ...formData, invoice_number: e.target.value })
                    }
                  />
                </Row>
              </Col>

            </div>
            </div>
          <div className="sales-form-section">
            <Col >
              <Row>
              <Col xs={12} md={2}>
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
              .filter((product) => String(product.product_id) === String(formData.product_id))
              .map((product) => ({
                value: product.rbarcode,
                label: product.rbarcode,
              })),
            ...data
              .filter((tag) => String(tag.product_id) === String(formData.product_id))
              .map((tag) => ({
                value: tag.PCode_BarCode,
                label: tag.PCode_BarCode,
              })),
          ]
    }
  />
</Col>
                <Col xs={12} md={2}>
                  <InputField
                    label="P ID"
                    name="product_id"
                    value={formData.product_id}
                    onChange={(e) => handleProductChange(e.target.value)}
                    type="select"
                    options={products.map((product) => ({
                      value: product.product_id,
                      label: product.product_id,
                    }))}
                  />
                </Col>
                <Col xs={12} md={3}>
                  <InputField
                    label="Product Name"
                    name="product_name"
                    value={formData.product_name}
                    onChange={(e) => handleProductNameChange(e.target.value)}
                    type="select"
                    options={products.map((product) => ({
                      value: product.product_name,
                      label: product.product_name,
                    }))}
                  />
                </Col>
                <Col xs={12} md={2}>
                  <InputField
                    label="Metal Type"
                    name="metal_type"
                    value={formData.metal_type}
                    onChange={(e) => handleMetalTypeChange(e.target.value)}                    
                    type="select"
                    options={products.map((product) => ({
                      value: product.Category,
                      label: product.Category,
                    }))}                    
                  />
                </Col>
                <Col xs={12} md={2}>
                  <InputField
                    label="Design Name"
                    name="design_name"
                    value={formData.design_name}
                    onChange={(e) => handleDesignNameChange(e.target.value)}
                    type="select"
                    options={products.map((product) => ({
                      value: product.design_master,
                      label: product.design_master,
                    }))}
                  />
                </Col>
                <Col xs={12} md={1}>
                  <InputField
                    label="Purity"
                    name="purity"
                    value={formData.purity}
                    onChange={handleChange}
                    readOnly
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
                <Col xs={12} md={2}>
                  <InputField
                    label="Stones Price"
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
                      ...(formData.va_on ? [{ value: formData.va_on, label: formData.va_on }] : []),
                      { value: "Gross Weight", label: "Gross Weight" },
                      { value: "Weight BW", label: "Weight BW" },
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
                <Col xs={12} md={1}>
                  <InputField
                    label="MC on"
                    name="mc_on"
                    type="select"                    
                    value={formData.mc_on || ""} // Default to "Gross Weight"
                    onChange={handleChange}
                    options={[
                      ...(formData.mc_on ? [{ value: formData.mc_on, label: formData.mc_on }] : []),
                      { value: "By Weight", label: "By Weight" },
                      { value: "Fixed", label: "Fixed" },
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
                  <Col xs={12} md={1}>
                    <Button onClick={handleAdd} style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>Add</Button>
                  </Col>
                </Row>
                </Col>             
          </div>
          <div className="sales-form-section">
  <Table bordered hover responsive>
    <thead>
      <tr>
        <th>Date</th>
        <th>Invoice Number</th>
        <th>Code</th>
        
        <th>Product Name</th>
        <th>Metal Type</th>
        <th>Design Name</th>
        <th>Purity</th>
        <th>Gross Weight</th>
        <th>Stone Weight</th>
        <th>Stone Price</th>
        <th>Weight BW</th>
        <th>Wastage On</th>
        <th>VA%</th>
        <th>Wastage Weight</th>
        <th>Total Weight AW</th>
        <th>Making Charges On</th>
        <th>MC Per Gram</th>
        <th>Making Charges</th>
        <th>Rate</th>
        <th>Rate Amount</th>
        <th>Tax %</th>
        <th>Tax Amount</th>
        <th>Total Price</th>
      </tr>
    </thead>
    <tbody>
      {orderDetails.length > 0 ? (
        orderDetails.map((detail, index) => (
          <tr key={index}>
            <td>{detail.date}</td>
            <td>{detail.invoice_number}</td>
            <td>{detail.code}</td>           
            <td>{detail.product_name}</td>
            <td>{detail.metal_type}</td>
            <td>{detail.design_name}</td>
            <td>{detail.purity}</td>
            <td>{detail.gross_weight}</td>
            <td>{detail.stone_weight}</td>
            <td>{detail.stone_price}</td>
            <td>{detail.weight_bw}</td>
            <td>{detail.va_on}</td>
            <td>{detail.va_percent}</td>
            <td>{detail.wastage_weight}</td>
            <td>{detail.total_weight_av}</td>
            <td>{detail.mc_on}</td>
            <td>{detail.mc_per_gram}</td>
            <td>{detail.making_charges}</td>
            <td>{detail.rate}</td>
            <td>{detail.rate_amt}</td>
            <td>{detail.tax_percent}</td>
            <td>{detail.tax_amt}</td>
            <td>{detail.total_price}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="24" className="text-center">
            No data available
          </td>
        </tr>
      )}
    </tbody>
  </Table>
</div>
          <div className="sales-form2">
          <div className="sales-form-third">
            <Col className="sales-form-section">
              <Row >
                <h4 className="mb-3">Old</h4>
                <Col xs={12} md={3}>
                  <InputField
                    label="Category"
                    type="select"
                    value={metal}
                    onChange={(e) => setMetal(e.target.value)}
                    options={[
                      { value: "GOLD", label: "Gold" },
                      { value: "SILVER", label: "Silver" },
                      { value: "PLATINUM", label: "Platinum" },
                    ]}
                  />
                </Col>
                <Col xs={12} md={4}>
                  <InputField label="Item" />
                </Col>
                <Col xs={12} md={3}>
                  <InputField label="Dust" />
                </Col>
                <Col xs={12} md={2}>
                  <InputField
                    label="Purity"
                    type="select"
                    value={metal}
                    onChange={(e) => setMetal(e.target.value)}
                    options={[
                      { value: "916HM", label: "916HM" },
                      { value: "22k", label: "22k" },
                      { value: "18k", label: "18k" },
                    ]}
                  />
                </Col>
                <Col xs={12} md={2}>
                  <InputField label="Touch %" />
                </Col>
                <Col xs={12} md={3}>
                  <InputField
                    label="Remark"
                    type="select"
                    value={metal}
                    onChange={(e) => setMetal(e.target.value)}
                    options={[
                      { value: "916HM", label: "916HM" },
                      { value: "22k", label: "22k" },
                      { value: "18k", label: "18k" },
                    ]}
                  />
                </Col>
                <Col xs={12} md={3}>
                  <InputField label="Rate" />
                </Col>
                <Col xs={12} md={2}>
                  <InputField
                    label="HSN"
                    type="select"
                    value={metal}
                    onChange={(e) => setMetal(e.target.value)}
                    options={[
                      { value: "916HM", label: "916HM" },
                      { value: "22k", label: "22k" },
                      { value: "18k", label: "18k" },
                    ]}
                  />
                </Col>
                <Col xs={12} md={2}>
                  <InputField label="Amount" />
                </Col>
                <Col xs={12} md={2}>
                  <InputField
                    label="Stone"
                    type="select"
                    value={metal}
                    onChange={(e) => setMetal(e.target.value)}
                    options={[
                      { value: "916HM", label: "916HM" },
                      { value: "22k", label: "22k" },
                      { value: "18k", label: "18k" },
                    ]}
                  />
                </Col>
                <Col xs={12} md={1}>
                  <InputField label="PCs" />
                </Col>
                <Col xs={12} md={1}>
                  <InputField label="CT" />
                </Col>
                <Col xs={12} md={2}>
                  <InputField label="R" />
                </Col>
                <Col xs={12} md={2}>
                  <InputField label="S.Amt" />
                </Col>
                <Col xs={12} md={1}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="cashCheckbox"
                      value="cash"
                    />
                    <label className="form-check-label" htmlFor="cashCheckbox">
                      Cash
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="hallMarkCheckbox"
                      value="hallmark"
                    />
                    <label className="form-check-label" htmlFor="hallMarkCheckbox">
                      HallMark
                    </label>
                  </div>
                </Col>
              </Row>
            </Col>
          </div>

<div className="sales-form-fourth">
  <Col className="sales-form-section">
    <Row>
      <h4 className="mb-3">Payment Details</h4>
      <Col xs={12} md={4}>
                        <InputField
                          label="Cash Amt"
                          name="cash_amount"
                          value={paymentDetails.cash_amount}
                          onChange={(e) =>
                            setPaymentDetails({ ...paymentDetails, cash_amount: e.target.value })
                          }
                        />
                      </Col>                      
                      <Col xs={12} md={4}>
                        <InputField label="Card Amt" name="card_amt"
                          value={paymentDetails.card_amt}
                          onChange={(e) =>
                            setPaymentDetails({ ...paymentDetails, card_amt: e.target.value })
                          } />
                      </Col>                      
                      <Col xs={12} md={4}>
                        <InputField label="Cheque Amt" name="chq_amt"
                          value={paymentDetails.chq_amt}
                          onChange={(e) =>
                            setPaymentDetails({ ...paymentDetails, chq_amt: e.target.value })
                          } />
                      </Col>                     
                      <Col xs={12} md={4}>
                        <InputField label="Online Amt" name="online_amt"
                          value={paymentDetails.online_amt}
                          onChange={(e) =>
                            setPaymentDetails({ ...paymentDetails, online_amt: e.target.value })
                          } />
                      </Col>
                      <Col xs={12} md={2}>
                        <Button onClick={handleSave} style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>Save</Button>
                      </Col>
                      <Col xs={12} md={2}>
                <Button type="submit" style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>Print</Button>
                </Col>
                <Col xs={12} md={2}>
                <Button
            type="button"
            className="cus-back-btn"
            variant="secondary"
            onClick={handleBack} style={{ backgroundColor: 'gray', marginRight: '10px' }}
          >
            cancel
          </Button>
                </Col>
                    </Row>
                  </Col>
                </div>
              </div>
            </Form>
          </Container>
        </div>
        );
};

export default RepairForm;
