import React, { useState, useEffect } from "react";
import "./SalesForm.css";
import InputField from "../../../Pages/InputField/InputField";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import baseURL from "../../../../Url/NodeBaseURL";

const RepairForm = () => {
  const [products, setProducts] = useState([]);
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState([]);
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

  const navigate = useNavigate();
  const [isQtyEditable, setIsQtyEditable] = useState(false);


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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };



  const handleProductNameChange = (productName) => {
    const product = products.find((prod) => String(prod.product_name) === String(productName));

    if (product) {
      setFormData((prevData) => ({
        ...prevData,
        barcode: product.rbarcode,
        product_id: product.product_id || "",
        product_name: product.product_name || "",
        metal_type: product.Category || "",
        design_name: product.design_master || "",
        purity: product.purity || "",
        
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        barcode: "",
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
          barcode: product.rbarcode, // Priority to tag barcode if available
          product_id: product.product_id,
          product_name: product.product_name,
          metal_type: product.Category,
          design_name: product.design_master,
          purity: product.purity,
          gross_weight: "", // Use tag's gross weight
          stones_weight: "",
          stones_price:"",
          weight_bw: "",
          va_on: "",
          va_percentage:  "",
          wastage_weight: "",
          total_weight_aw: "",
          mc_on: "",
          mc_per_gm: "",
          making_charges: "",
        }));
      } else {
        // If no tag is found, just fill product details
        setFormData((prevData) => ({
          ...prevData,
          barcode: product.rbarcode,
          product_id: product.product_id,
          product_name: product.product_name,
          metal_type: product.Category,
          design_name: product.design_master,
          purity: product.purity,
          gross_weight: "",
          stones_weight: "",
          stones_price: "",
          weight_bw: "",
          va_on: "",
          va_percentage: "",
          wastage_weight: "",
          total_weight_aw: "",
          mc_on: "",
          mc_per_gm: "",
          making_charges: "",
        }));
      }
    } else {
      // Reset form data if no product is selected
      setFormData((prevData) => ({
        ...prevData,
        barcode: "",
        product_id: "",
        product_name: "",
        metal_type: "",
        design_name: "",
        purity: "",
        gross_weight: "",
        stones_weight: "",
        stones_price: "",
        weight_bw: "",
        va_on: "",
        va_percentage: "",
        wastage_weight: "",
        total_weight_aw: "",
        mc_on: "",
        mc_per_gm: "",
        making_charges: "",
      }));
    }
  };
  
  const handleBarcodeChange = async (barcode) => {
    try {
      // Check for product by barcode
      const product = products.find((prod) => String(prod.rbarcode) === String(barcode));
  
      if (product) {
        // If product found by barcode, populate the form
        setFormData((prevData) => ({
          ...prevData,
          barcode: product.rbarcode,
          product_id: product.product_id,
          product_name: product.product_name,
          metal_type: product.Category,
          design_name: product.design_master,
          purity: product.purity,
          gross_weight: "",
          stones_weight: "",
          stones_price: "",
          weight_bw: "",
          va_on: "",
          va_percentage: "",
          wastage_weight: "",
          total_weight_aw: "",
          mc_on: "",
          mc_per_gm: "",
          making_charges: "",
          qty: 1, // Set qty to 1 for product
        }));
        setIsQtyEditable(false); // Set qty as read-only
      } else {
        // Check if tag exists by barcode
        const tag = data.find((tag) => String(tag.PCode_BarCode) === String(barcode));
  
        if (tag) {
          const productId = tag.product_id;
          const productDetails = products.find((prod) => String(prod.product_id) === String(productId));
  
          setFormData((prevData) => ({
            ...prevData,
            barcode: tag.PCode_BarCode || "",
            product_id: tag.product_id || "",
            product_name: productDetails?.product_name || "",
            metal_type: productDetails?.Category || "",
            design_name: productDetails?.design_master || "",
            purity: productDetails?.purity || "",
            gross_weight: tag.Gross_Weight || "",
            stones_weight: tag.Stones_Weight || "",
            stones_price: tag.Stones_Price || "",
            weight_bw: tag.Weight_BW || "",
            va_on: tag.Wastage_On || "",
            va_percentage: tag.Wastage_Percentage || "",
            wastage_weight: tag.WastageWeight || "",
            total_weight_aw: tag.TotalWeight_AW || "",
            mc_on: tag.Making_Charges_On || "",
            mc_per_gm: tag.MC_Per_Gram || "",
            making_charges: tag.Making_Charges || "",
            qty: 1, // Allow qty to be editable for tag
          }));
          setIsQtyEditable(true); // Allow editing of qty
        } else {
          // Reset form if no tag is found
          setFormData((prevData) => ({
            ...prevData,
            barcode: "",
            product_id: "",
            product_name: "",
            metal_type: "",
            design_name: "",
            purity: "",
            gross_weight: "",
            stones_weight: "",
            stones_price: "",
            qty: "", // Reset qty
          }));
          setIsQtyEditable(true); // Default to editable
        }
      }
    } catch (error) {
      console.error("Error handling barcode change:", error);
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
    name="barcode"
    value={formData.barcode}
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
                    onChange={handleChange}
                    readOnly
                  />
                </Col>
                <Col xs={12} md={2}>
                  <InputField
                    label="Design Name"
                    name="design_name"
                    value={formData.design_name}
                    onChange={handleChange}
                    readOnly
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
                <Col xs={12} md={2}>
                  <InputField
                    label="Gross Weight"
                    name="gross_weight"
                    value={formData.gross_weight}
                    onChange={handleChange}
                    
                  />
                </Col>
                <Col xs={12} md={2}>
                  <InputField
                    label="Stones Weight"
                    name="stones_weight"
                    value={formData.stones_weight}
                    onChange={handleChange}
                    
                  />
                </Col>
                <Col xs={12} md={2}>
                  <InputField
                    label="Stones Price"
                    name="stones_price"
                    value={formData.stones_price}
                    onChange={handleChange} 
                  />
                </Col>
                <Col xs={12} md={1}>
                  <InputField label="Weight BW" name="weight_bw" value={formData.weight_bw} onChange={handleChange} />
                </Col>
                <Col xs={12} md={1}>
                  <InputField label="St Price" name="stones_price" value={formData.stones_price} onChange={handleChange} />
                </Col>
                
                <Col xs={12} md={1}>
                  <InputField label="VA On" name="va_on" value={formData.va_on} onChange={handleChange} />
                </Col>
                <Col xs={12} md={1}>
                  <InputField label="VA%" name="va_percentage" value={formData.va_percentage} onChange={handleChange} />
                </Col>
                <Col xs={12} md={1}>
                  <InputField label="WW" name="wastage_weight" value={formData.wastage_weight} onChange={handleChange} />
                </Col>
                
                <Col xs={12} md={2}>
                  <InputField label="Total Weight AW" name="total_weight_aw" value={formData.total_weight_aw} onChange={handleChange} />
                </Col>
                <Col xs={12} md={1}>
                  <InputField label="MC on" name="mc_on" value={formData.mc_on}   onChange={handleChange}/>
                </Col>
                <Col xs={12} md={1}>
                  <InputField
                    label="MC/Gm" name="mc_per_gm" value={formData.mc_per_gm}   onChange={handleChange}                  
                  />
                </Col>
                <Col xs={12} md={2}>
                  <InputField
                    label="Making Charges" name="Making_Charges" value={formData.Making_Charges}  onChange={handleChange}                   
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


                {/* <Col xs={12} md={1}>
                  <InputField label="Rate" value={formData.stones_weight} onChange={handleChange}  />
                </Col>
                <Col xs={12} md={1}>
                  <InputField label="Tax%" value={formData.stones_weight}  onChange={handleChange} />
                </Col>
                <Col xs={12} md={1}>
                  <InputField label="Tax Amt" value={formData.stones_weight}  onChange={handleChange} />
                </Col>
                <Col xs={12} md={2}>
                  <InputField label="Total Price" value={formData.stones_weight}  onChange={handleChange} />
                </Col> */}
               
                {/* <Col xs={12} md={3}>
                  <InputField label="Rodium" />
                </Col>   */}
                <Col xs={12} md={1}>
                <Button type="submit" style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>Add</Button>
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
