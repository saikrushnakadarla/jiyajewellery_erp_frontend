import React, { useState, useEffect } from "react";
import "./SalesForm.css";
import InputField from "../../Masters/ItemMaster/Inputfield";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import baseURL from "../../../../Url/NodeBaseURL";

const RepairForm = () => {
  const [products, setProducts] = useState([]);
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
    code: "",  // Add this to track the code value
  });

  // Handle form data changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`${baseURL}/get/repair-details`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const result = await response.json();
      setProducts(result); // Store the result in the state
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleCodeSelect = (selectedCode) => {
    if (selectedCode === "") {
      setFormData({
        code: "",  // Clear the code field
        product_id: "",
        product_name: "",
        metal_type: "",
        design_name: "",
        purity: "",
        barcode: "",
        gross_weight: "",
        st_weight: "",
        weight_bw: "",
        rate: "",
        tax: "",
        stones_price: "",
      });
      return;
    }
    const selectedProduct = products.find((prod) => prod.code === selectedCode);
    if (selectedProduct) {
      setFormData((prevState) => ({
        ...prevState,
        code: selectedCode,  // Set the code
        product_id: selectedProduct.product_id,
        product_name: selectedProduct.product_name,
        metal_type: selectedProduct.metal_type,
        design_name: selectedProduct.design_name,
        purity: selectedProduct.purity,
        barcode: selectedProduct.barcode,
        gross_weight: selectedProduct.gross_weight,
        st_weight: selectedProduct.st_weight,
        weight_bw: selectedProduct.weight_bw,
        rate: selectedProduct.rate,
        tax: selectedProduct.tax,
        stones_price: selectedProduct.stones_price,
      }));
    }
  };

  useEffect(() => {
    fetchTags(); // Fetch products on component mount
  }, []);

  return (
    <div className="main-container">
      <Container className="sales-form-container">
        <Form>
          <h3 style={{ marginTop: "-45px", marginBottom: "10px", textAlign: "left", color: "#a36e29" }}>Sales</h3>
          <div className="sales-form-section">
            <Col>
              <Row>
                {/* Dropdown for product code */}
                <Col xs={12} md={2}>
                  <InputField
                    label="BarCode/Rbarcode"
                    name="code"
                    value={formData.code}
                    onChange={(e) => {
                      handleChange(e); // Update the form state with the selected code
                      handleCodeSelect(e.target.value); // Fetch and update remaining data based on the selected code
                    }}
                    type="select"
                    options={products.map((prod) => ({
                      value: prod.code,
                      label: prod.code,
                    }))}
                  />
                </Col>

                {/* Other form fields */}
                <Col xs={12} md={3}>
                  <InputField label="Product Name" name="product_name" value={formData.product_name} />
                </Col>
                <Col xs={12} md={2}>
                  <InputField label="Metal Type" name="metal_type" value={formData.metal_type} />
                </Col>
                <Col xs={12} md={3}>
                  <InputField label="Design Master" name="design_name" value={formData.design_name} />
                </Col>
                <Col xs={12} md={2}>
                  <InputField label="Purity" name="purity" value={formData.purity} onChange={handleChange} />
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
