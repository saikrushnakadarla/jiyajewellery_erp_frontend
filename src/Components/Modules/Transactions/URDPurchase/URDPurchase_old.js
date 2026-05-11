import React, { useState, useEffect } from "react";
import "./URDPurchase.css";
import InputField from "../../../Pages/InputField/InputField";
import { Container, Row, Col, Button,Table } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import baseURL from "../../../../Url/NodeBaseURL";
import axios from "axios";
import { AiOutlinePlus } from "react-icons/ai";

const URDPurchase = () => {

    const [metal, setMetal] = useState("");
    const [type, setType] = useState("");
    const [purity, setPurity] = useState("");
    const [product, setProduct] = useState("");
    const [hsnCode, setHsnCode] = useState("");
    const [stoneType, setStoneType] = useState("");
    const [stoneType2, setStoneType2] = useState("");
    const [isChecked, setIsChecked] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({
      name: "",
      mobile: "",
      email: "",
      address1: "",
      address2: "",
      address3: "",
      city: "",
      
    });
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value
      }));
    };
  

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(`${baseURL}/get/account-details`);
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
          const result = await response.json();
    
          // Filter only suppliers
          const customers = result.filter(
            (item) => item.account_group === 'CUSTOMERS'
          );
    
          setCustomers(customers);
          // setLoading(false);
          console.log("Customers=",customers)
        } catch (error) {
          console.error('Error fetching data:', error);
          setLoading(false);
        }
      };
    
      fetchData();
    }, []);
  
    const handleCustomerChange = (customerId) => {
      setFormData((prevData) => ({
        ...prevData,
        customer_id: customerId, // Ensure customer_id is correctly updated
      }));
    
      const customer = customers.find((cust) => String(cust.account_id) === String(customerId));
      console.log("Customer Id=",customer)
    
      if (customer) {
        setFormData({
          ...formData,
          customer_id: customerId, // Ensure this is correctly set
          name: customer.account_name, // Set the name field to the selected customer
          mobile: customer.mobile || "",
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
      } else {
        setFormData({
          ...formData,
          customer_id: "",
          name: "",
          mobile: "",
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
        });
      }
    };
    const handleBack = () => {
        navigate('/urdpurchasetable');
    };

    const handleAddCustomer = () => {
      navigate("/customermaster", { state: { from: "/urd_purchase" } });
    };

  return (
    <div className="main-container">
    <div className="urdpurchase-form-container">
        <form className="urdpurchase-form">
        {/* Left Section */}
        <div className="urdpurchase-form-left">
          {/* Customer Details */}
          <Col className="urd-form-section">
            <h4 className="mb-3">Customer Details</h4>
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
                    label="Customer Name:"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    readOnly
                  />
                </Col>
                <Col xs={12} md={2}>
                <InputField
                    label="Email:"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    readOnly
                  />
                </Col>
                <Col xs={12} md={2}>
                <InputField
                    label="Address1:"
                    name="address1"
                    value={formData.address1}
                    onChange={handleChange}
                    readOnly
                  />
                </Col>
                <Col xs={12} md={2}>
                <InputField
                    label="Address2:"
                    name="address2"
                    value={formData.address2}
                    onChange={handleChange}
                    readOnly
                  />
                </Col>
                <Col xs={12} md={2}>
                <InputField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    readOnly
                  />
                </Col>
                <Col xs={12} md={2}>
                  <InputField 
                  label="PinCode" 
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  readOnly
                  />
                </Col>
                <Col xs={12} md={2}>
                  <InputField label="State:"  name="state" value={formData.state} onChange={handleChange} readOnly/>
                </Col>
                <Col xs={12} md={2}>
                  <InputField label="State Code:"  name="state_code" value={formData.state_code} onChange={handleChange} readOnly/>
                </Col>
                <Col xs={12} md={2}>
                  <InputField label="Aadhar" name="aadhar_card" value={formData.aadhar_card} onChange={handleChange} readOnly/>
                </Col>
                <Col xs={12} md={2}>
                  <InputField label="GSTIN"name="gst_in" value={formData.gst_in} onChange={handleChange} readOnly />
                </Col>
                <Col xs={12} md={2}>
                  <InputField label="PAN" name="pan_card" value={formData.pan_card} onChange={handleChange} readOnly />
                </Col>
                
              </Row>
            
          </Col> 
        </div>
        {/* Right Section */}
        <div className="urdpurchase-form-right">
          <div className="urd-form-section">
            <Row className="mt-5">  
              <InputField label="Date" type="date" />
            </Row>
            <Row>
              <InputField label="URD Purchase No" />
            </Row> 
            
          </div>
        </div>
      </form>
       
      <div className="urd-form-section">
        <h4>Purchase Details</h4>
        <Row>
        <Col xs={12} md={2}>
        <InputField label="P ID" />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="Product:"
            type="select"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            options={[
              { value: "PRODUCT1", label: "Product1" },
              { value: "PRODUCT2", label: "Product2" },
              { value: "PRODUCT3", label: "Product3" },
              { value: "PRODUCT4", label: "Product4" },
            ]}
          />
          </Col>
          <Col xs={12} md={2}>
          <InputField
            label="Metal:"
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
          
          <Col xs={12} md={2}>
          <InputField
            label="Purity:"
            type="select"
            value={purity}
            onChange={(e) => setPurity(e.target.value)}
            options={[
              { value: "24K", label: "24K" },
              { value: "22K", label: "22K (916)" },
              { value: "22KHM", label: "22K (916HM)" },
              { value: "18K", label: "18K (750)" },
              { value: "14K", label: "14K (585)" },
              { value: "10K", label: "10K (417)" },
              { value: "9K", label: "9K (375)" },
            ]}
          />
          </Col>
          
          <Col xs={12} md={2}>
          <InputField label="HSN Code" type="text" />
          </Col>
          <Col xs={12} md={2}>
          <InputField label="Gross" type="number" />
          </Col>
          <Col xs={12} md={2}>
          <InputField label="Dust" type="number" />
          </Col> 
          <Col xs={12} md={1}>
          <InputField label="Touch %" type="number" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="ML %" type="number" />
          </Col>    
          <Col xs={12} md={1}>
          <InputField label="Eqv WT" type="number" />
          </Col>
          <Col xs={12} md={2}>
          <InputField label="Remarks:" type="text" />
          </Col>
          <Col xs={12} md={2}>
          <InputField label="Rate" type="number" />
          </Col>
          <Col xs={12} md={2}>
          <InputField label="Value" type="number" />
          </Col>
          {/* <Col xs={12} md={2}>
          <InputField
            label="Stone Type:"
            type="select"
            value={stoneType}
            onChange={(e) => setStoneType(e.target.value)}
            options={[
              { value: "STONETYPE1", label: "StoneType1" },
              { value: "STONETYPE2", label: "StoneType2" },
              { value: "STONETYPE3", label: "StoneType3" },
            ]}
          />
          </Col>
          <Col xs={12} md={2}>
          <InputField label="Pieces" type="number" />
          </Col>
          <Col xs={12} md={2}>
          <InputField label="Gms/CT" type="number" />
          </Col>
          <Col xs={12} md={2}>
          <InputField label="Rate" type="number" />
          </Col>
          <Col xs={12} md={2}>
          <InputField label="Stone Amt" type="number" />
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
              HallMark
            </label>
            </div>           
          </Col> */}
          <Col xs={12} md={1}>
            <Button style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>Add</Button>
          </Col>
        </Row>
      </div>
        <div className="urd-form-section">
          <h4>Item Details</h4>
          
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item</th>
                <th>WT</th>
                <th>Dust</th>
                <th>Purity</th>
                <th>Touch%</th>
                <th>ML%</th>
                <th>Eqv WT</th>
                <th>Rate</th>
                <th>HSN</th>
                <th>Stone</th>
                <th>CT</th>
                <th>PCS</th>
                <th>Stone Value</th>
                <th>M.Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Sample Item</td>
                <td>10</td>
                <td>0.5</td>
                <td>22K</td>
                <td>95%</td>
                <td>2%</td>
                <td>9.5</td>
                <td>4500</td>
                <td>HSN1234</td>
                <td>Ruby</td>
                <td>0.2</td>
                <td>5</td>
                <td>500</td>
                <td>50</td>
              </tr>
            </tbody>
          </Table>
        </div>
        <div className="form-buttons">
          <Button type="submit" variant="success" style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>Save</Button>
          <Button type="submit" variant="success" style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>Print</Button>
          <Button
            variant="secondary"
            onClick={handleBack} style={{ backgroundColor: 'gray', marginRight: '10px' }}
          >
          cancel
          </Button>
          
        </div>
     
    </div>
    </div>
  );
};

export default URDPurchase;
