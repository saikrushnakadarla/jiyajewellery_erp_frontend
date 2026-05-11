import React, { useState, useEffect } from "react";
import "./URDPurchase.css";
import InputField from "../../../Pages/InputField/InputField";
import { Container, Row, Col, Button, Table, Form } from "react-bootstrap";
import { renderMatches, useNavigate, useLocation } from 'react-router-dom';
import baseURL from "../../../../Url/NodeBaseURL";
import axios from "axios";
import { AiOutlinePlus } from "react-icons/ai";

const URDPurchase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date().toISOString().split("T")[0];
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
   const { state } = useLocation();
  const { mobile } = location.state || {};
  const initialSearchValue = location.state?.mobile || '';
  const [items, setItems] = useState(
    JSON.parse(localStorage.getItem("purchaseItems")) || []
  );
  const [formData, setFormData] = useState({
    customer_id: "",
    account_name: "",
    mobile: "",
    email: "",
    address1: "",
    address2: "",
    address3: "",
    city: "",
    state: "",
    state_code: "",
    aadhar_card: "",
    gst_in: "",
    pan_card: "",
    date: today,
    urdpurchase_number: "",


  });
  const [productDetails, setProductDetails] = useState({
    product_id: "",
    product_name: "",
    metal: "",
    purity: "",
    hsn_code: "",
    gross: 0,
    dust: 0,
    touch_percent: 0,
    ml_percent: 0,
    eqt_wt: 0,
    remarks: "",
    rate: 0,
    total_amount: 0,
  });
  const [purity, setPurity] = useState([]);
  const [metalType, setMetalType] = useState([]);

  const [purityOptions, setPurityOptions] = useState([]);

  // Function to parse purity value to percentage
  const parsePurityToPercentage = (purity) => {
    if (!purity) return null;

    const match = purity.match(/(\d+)(k|K)/); // Match formats like "22K", "24k", etc.
    if (match) {
      const caratValue = parseInt(match[1], 10); // Extract carat number
      return (caratValue / 24) * 100; // Convert carat to percentage (e.g., 22K = 91.6)
    }

    // Handle other formats like "916HM" directly if required
    if (purity.toLowerCase() === "916hm") return 91.6;

    return null; // Default if no match
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prevState => {
      const updatedData = { ...prevState, [name]: value };

      if (name === "purity") {
        // Update the rate based on the selected purity
        const rate =
          value === "24K" ? rates.rate_24crt :
            value === "22K" ? rates.rate_22crt :
              value === "18K" ? rates.rate_18crt :
                value === "16K" ? rates.rate_16crt :
                  "";

        updatedDetails.rate = rate;
      }

      // Update HSN Code based on selected metal
      if (name === 'metal') {
        const selectedMetal = metalOptions.find(option => option.value === value);
        updatedData.hsn_code = selectedMetal ? selectedMetal.hsn_code : '';
      }

      return updatedData;
    });

    // Update the product details
    const updatedDetails = {
      ...productDetails,
      [name]: value,
    };

    // Calculate Net WT based on updated details
    if (
      updatedDetails.gross &&
      updatedDetails.dust &&
      updatedDetails.ml_percent &&
      updatedDetails.purity
    ) {
      const purityValue = parsePurityToPercentage(updatedDetails.purity);

      if (purityValue) {
        const gross = parseFloat(updatedDetails.gross) || 0;
        const dust = parseFloat(updatedDetails.dust) || 0;
        const mlPercent = parseFloat(updatedDetails.ml_percent) || 0;

        const netWeight = ((gross - dust) * (purityValue - mlPercent)) / 100;

        updatedDetails.eqt_wt = netWeight.toFixed(2); // Display as a string with 2 decimal points
      }
    }

    // Recalculate Amount when Net WT or Rate changes
    if (updatedDetails.eqt_wt && updatedDetails.rate) {
      const netWT = parseFloat(updatedDetails.eqt_wt) || 0;
      const rate = parseFloat(updatedDetails.rate) || 0;

      const totalAmount = netWT * rate; // Calculate Amount
      updatedDetails.total_amount = totalAmount.toFixed(2); // Display as a string with 2 decimal points
    }

    setProductDetails(updatedDetails);

    setProductDetails(updatedDetails);
    setProductDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
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
        console.log("Customers=", customers)
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
    console.log("Customer Id=", customer)

    if (customer) {
      setFormData({
        ...formData,
        customer_id: customerId, // Ensure this is correctly set
        account_name: customer.account_name, // Set the name field to the selected customer
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
        account_name: "",
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
        date: "",
        urdpurchase_number: "",
      });
    }
  };

  // Set the mobile value in formData if passed via location state
useEffect(() => {
  if (mobile) {
    console.log("Selected Mobile from New Link:", mobile);

    // Find the customer with the matching mobile
    const matchedCustomer = customers.find((cust) => cust.mobile === mobile);

    if (matchedCustomer) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        customer_id: matchedCustomer.account_id, // Set customer_id to match the dropdown
        account_name: matchedCustomer.account_name,
        mobile: matchedCustomer.mobile || "",
        email: matchedCustomer.email || "",
        address1: matchedCustomer.address1 || "",
        address2: matchedCustomer.address2 || "",
        city: matchedCustomer.city || "",
        pincode: matchedCustomer.pincode || "",
        state: matchedCustomer.state || "",
        state_code: matchedCustomer.state_code || "",
        aadhar_card: matchedCustomer.aadhar_card || "",
        gst_in: matchedCustomer.gst_in || "",
        pan_card: matchedCustomer.pan_card || "",
      }));
    } else {
      // If no customer matches, just set the mobile
      setFormData((prevFormData) => ({
        ...prevFormData,
        mobile: mobile,
      }));
    }
  }
}, [mobile, customers]);

  const handleBack = () => {
    navigate('/urdpurchasetable');
  };

  const handleAddCustomer = () => {
    navigate("/customermaster", { state: { from: "/urd_purchase" } });
  };

  useEffect(() => {
    localStorage.setItem("purchaseItems", JSON.stringify(items));
  }, [items]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddItem = () => {
    // Ensure product_name and metal are selected before adding the item
    if (productDetails.product_name && productDetails.metal) {
      // Create a new item with the current productDetails
      const newItem = { ...productDetails };

      // Update the items array with the new item
      setItems([...items, newItem]);

      // Clear the productDetails state after adding the item
      setProductDetails({
        product_id: "",
        product_name: "",
        metal: "",
        purity: "",
        hsn_code: "",
        gross: 0,
        dust: 0,
        touch_percent: 0,
        ml_percent: 0,
        eqt_wt: 0,
        remarks: "",
        rate: 0,
        total_amount: 0,
      });
    }
  };

  const handleDeleteItem = (index) => {
    // Remove the item at the specified index from the items array
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems); // Update the state
    localStorage.setItem('purchaseItems', JSON.stringify(updatedItems)); // Update localStorage
  };


  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    const payload = {
      customerDetails: formData,
      items: items,
    };

    try {
      const response = await axios.post(`${baseURL}/save-purchase`, payload);

      // Check if the response is successful
      if (response.status === 200 || response.status === 201) {
        alert("Purchase saved successfully!");
        localStorage.removeItem("purchaseItems");
        setItems([]);
        navigate("/urdpurchasetable"); // Navigate to the desired page
      } else {
        alert("Failed to save the purchase. Please try again.");
      }
    } catch (error) {
      console.error("Error saving purchase:", error);
      alert("An error occurred while saving the purchase. Please try again.");
    }
  };

  useEffect(() => {
    const fetchPurity = async () => {
      try {
        const response = await axios.get(`${baseURL}/purity`);
        setPurityOptions(response.data); // Populate purity options dynamically
      } catch (error) {
        console.error("Error fetching purity options:", error);
      }
    };

    fetchPurity();
  }, []);

  const [metalOptions, setMetalOptions] = useState([]);

  useEffect(() => {
    const fetchMetalTypes = async () => {
      try {
        const response = await axios.get(`${baseURL}/metaltype`);
        const metalTypes = response.data.map(item => ({
          value: item.metal_name, // Metal name for dropdown
          label: item.metal_name, // Display value
          hsn_code: item.hsn_code, // Associated HSN Code
        }));
        setMetalOptions(metalTypes);
      } catch (error) {
        console.error('Error fetching metal types:', error);
      }
    };

    fetchMetalTypes();
  }, []);

  useEffect(() => {
    if (productDetails.metal === 'Gold') {
      setProductDetails((prevState) => ({
        ...prevState,
        ml_percent: 1, // Set default value for Gold
      }));
    } else if (productDetails.metal === 'Silver') {
      setProductDetails((prevState) => ({
        ...prevState,
        ml_percent: 3, // Set default value for Silver
      }));
    } else if (!productDetails.metal) {
      setProductDetails((prevState) => ({
        ...prevState,
        ml_percent: '', // Clear ml_percent if metal is cleared
      }));
    }
  }, [productDetails.metal]);

  useEffect(() => {
    const fetchLastURDPurchaseNumber = async () => {
      try {
        const response = await axios.get(`${baseURL}/lastURDPurchaseNumber`);
        setFormData((prev) => ({
          ...prev,
          urdpurchase_number: response.data.lastURDPurchaseNumber,
        }));
      } catch (error) {
        console.error("Error fetching estimate number:", error);
      }
    };

    fetchLastURDPurchaseNumber();
  }, []);

  const [rateOptions, setRateOptions] = useState([]);

  const [rates, setRates] = useState({ rate_24crt: "", rate_22crt: "", rate_18crt: "", rate_16crt: "" });

  useEffect(() => {
    const fetchCurrentRates = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/current-rates`);
        console.log('API Response:', response.data);

        // Log the 24crt rate separately
        console.log('24crt Rate:', response.data.rate_24crt);

        // Dynamically set the rates based on response
        setRates({
          rate_24crt: response.data.rate_24crt || "",
          rate_22crt: response.data.rate_22crt || "",
          rate_18crt: response.data.rate_18crt || "",
          rate_16crt: response.data.rate_16crt || "",
        });
      } catch (error) {
        console.error('Error fetching current rates:', error);
      }
    };
    fetchCurrentRates();
  }, []);


  const currentRate =
    productDetails.purity === "24K" ? rates.rate_24crt :
      productDetails.purity === "22K" ? rates.rate_22crt :
        productDetails.purity === "18K" ? rates.rate_18crt :
          productDetails.purity === "16K" ? rates.rate_16crt :
            "";


  return (
    <div className="main-container">
      <div className="urdpurchase-form-container">
        <Form>
          <div className="urdpurchase-form">
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
    value={formData.customer_id || ""} // Use customer_id to match the selected value
    onChange={(e) => handleCustomerChange(e.target.value)}
    options={[
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
                      name="account_name"
                      type="select"
                      value={formData.customer_id || ""} // Use customer_id to match selected value
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      options={[
                        ...customers.map((customer) => ({
                          value: customer.account_id, // Use account_id as the value
                          label: customer.account_name, // Display mobile as the label
                        })),
                      ]}

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
                    <InputField label="State:" name="state" value={formData.state} onChange={handleChange} readOnly />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField label="State Code:" name="state_code" value={formData.state_code} onChange={handleChange} readOnly />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField label="Aadhar" name="aadhar_card" value={formData.aadhar_card} onChange={handleChange} readOnly />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField label="GSTIN" name="gst_in" value={formData.gst_in} onChange={handleChange} readOnly />
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
                  <InputField label="Date" type="date" name="date" value={formData.date} onChange={handleChange} />
                </Row>
                <Row>
                  <InputField label="URD Purchase No" name="urdpurchase_number" value={formData.urdpurchase_number} onChange={handleChange} />
                </Row>

              </div>
            </div>
          </div>

          <div className="urd-form-section">
            <h4>Purchase Details</h4>
            <Row>
              <Col xs={12} md={2}>
                <InputField
                  label="Product"
                  name="product_name"
                  value={productDetails.product_name}
                  onChange={handleInputChange}

                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Metal"
                  name="metal"
                  type="select"
                  value={formData.metal}
                  onChange={handleInputChange}
                  options={metalOptions.map(option => ({ value: option.value, label: option.label }))}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Purity"
                  type="select"
                  name="purity"
                  value={productDetails.purity}
                  onChange={handleInputChange}
                  options={purityOptions.map((purity) => ({
                    value: purity.name,
                    label: purity.name,
                  }))}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="HSN Code"
                  name="hsn_code"
                  type="text"
                  value={formData.hsn_code}
                  onChange={handleInputChange}
                  readOnly // Make it read-only
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Gross"
                  type="number"
                  name="gross"
                  value={productDetails.gross}
                  onChange={handleInputChange}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Dust"
                  type="number"
                  name="dust"
                  value={productDetails.dust}
                  onChange={handleInputChange}
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField
                  label="ML %"
                  type="number"
                  name="ml_percent"
                  value={productDetails.ml_percent}
                  onChange={handleInputChange}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Net WT"
                  type="number"
                  name="eqt_wt"
                  value={productDetails.eqt_wt}
                  onChange={handleInputChange}
                />
              </Col>
                        {/* <Col xs={12} md={1}>
                  <InputField
                    label="Touch %"
                    type="number"
                    name="touch_percent"
                    value={productDetails.touch_percent}
                    onChange={handleInputChange}
                  />
                </Col> */}
              <Col xs={12} md={2}>
                        {/* <InputField
                    label="Rate"
                    type="select"
                    name="rate"
                    value={productDetails.rate}
                    onChange={handleInputChange}
                    options={rateOptions} // Dynamic dropdown from API
                  /> */}
                <InputField
                  label="Rate"
                  name="rate"
                  value={productDetails.rate || currentRate}
                  onChange={handleInputChange}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Amount"
                  type="number"
                  name="total_amount"
                  value={productDetails.total_amount}
                  onChange={handleInputChange}
                  readOnly
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Remarks"
                  type="text"
                  name="remarks"
                  value={productDetails.remarks}
                  onChange={handleInputChange}
                />
              </Col>
              <Col xs={12} md={1}>
                <Button
                  style={{ backgroundColor: "#a36e29", borderColor: "#a36e29" }}
                  onClick={handleAddItem}
                >
                  Add
                </Button>
              </Col>
            </Row>
          </div>
          <div className="urd-form-section">
            <h4>Item Details</h4>

            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>S.No</th>
                  {/* <th>product ID</th> */}
                  <th>Product Name</th>
                  <th>Metal</th>
                  <th>Purity</th>
                  <th>HSN</th>
                  <th>Gross</th>
                  <th>Dust</th>
                  <th>Touch%</th>
                  <th>ML%</th>
                  <th>Net WT</th>
                  <th>Remark</th>
                  <th>Rate</th>
                  <th>Total Value</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    {/* <td>{item.product_id}</td> */}
                    <td>{item.product_name}</td>
                    <td>{item.metal}</td>
                    <td>{item.purity}</td>
                    <td>{item.hsn_code}</td>
                    <td>{item.gross}</td>
                    <td>{item.dust}</td>
                    <td>{item.touch_percent}</td>
                    <td>{item.ml_percent}</td>
                    <td>{item.eqt_wt}</td>
                    <td>{item.remarks}</td>
                    <td>{item.rate}</td>
                    <td>{item.total_amount}</td>
                    <td>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteItem(index)}
                    >
                      Delete
                    </Button>
                  </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="d-flex justify-content-between px-2 mt-2">
              <h5>Total Amount:</h5>
              <h5>
                ₹{" "}
                {items
                  .reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0)
                  .toFixed(2)}
              </h5>
            </div>
          </div>
          <div className="form-buttons">
            <Button
              type="submit"
              variant="success"
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
              onClick={handleSubmit}
            >
              Save
            </Button>
            <Button type="submit" variant="success" style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>Print</Button>
            <Button
              variant="secondary"
              onClick={handleBack} style={{ backgroundColor: 'gray', marginRight: '10px' }}
            >
              cancel
            </Button>

          </div>
        </Form>
      </div>
    </div>
  );
};

export default URDPurchase;
