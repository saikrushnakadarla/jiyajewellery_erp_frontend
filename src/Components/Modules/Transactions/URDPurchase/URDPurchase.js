import React, { useState, useEffect } from "react";
import "./URDPurchase.css";
import InputField from "../../Transactions/SalesForm/InputfieldSales";
import { Container, Row, Col, Button, Table, Form } from "react-bootstrap";
import { renderMatches, useNavigate, useLocation } from 'react-router-dom';
import baseURL from "../../../../Url/NodeBaseURL";
import axios from "axios";
import { AiOutlinePlus } from "react-icons/ai";
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

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
  const [editingRow, setEditingRow] = useState(null);
  const [purityOptions, setPurityOptions] = useState([]);

  useEffect(() => {
    const fetchAndFilterPurity = async () => {
      try {
        const response = await axios.get(`${baseURL}/purity`);
        console.log("Fetched Purity Options:", response.data);

        const allPurityOptions = response.data;

        const filteredPurityOptions = allPurityOptions.filter(
          (option) => option.metal.toLowerCase() === productDetails.metal.toLowerCase()
        );

        console.log("Filtered Purity Options:", filteredPurityOptions);

        const defaultPurityOption = filteredPurityOptions.find(option =>
          option.name.toLowerCase().replace(/\s/g, "").includes("22k")
        );

        console.log("Default Selected Purity:", defaultPurityOption);

        setPurityOptions(filteredPurityOptions);

        setProductDetails((prevDetails) => ({
          ...prevDetails,
          purity: defaultPurityOption?.name || "",
          purityPercentage: defaultPurityOption?.purity_percentage || 0, // Store purity_percentage
        }));
      } catch (error) {
        console.error("Error fetching purity options:", error);
      }
    };

    if (productDetails.metal) {
      fetchAndFilterPurity();
    }
  }, [productDetails.metal]);

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
    if (productDetails.metal?.toLowerCase() === 'gold') {
      setProductDetails((prevState) => ({
        ...prevState,
        ml_percent: 1, // Set default value for Gold
      }));
    } else if (productDetails.metal?.toLowerCase() === 'silver') {
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

  const [rates, setRates] = useState({ rate_24crt: "", rate_22crt: "", rate_18crt: "", rate_16crt: "" });

  useEffect(() => {
    const fetchCurrentRates = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/current-rates`);
        console.log('API Response:', response.data);

        setRates({
          rate_24crt: response.data.rate_24crt || "",
          rate_22crt: response.data.rate_22crt || "",
          rate_18crt: response.data.rate_18crt || "",
          rate_16crt: response.data.rate_16crt || "",
          rate_silver: response.data.silver_rate || "", // Add rate_silver from the response
        });
      } catch (error) {
        console.error('Error fetching current rates:', error);
      }
    };

    fetchCurrentRates();
  }, []);

  const normalizePurity = (purity) => purity.toLowerCase().replace(/\s+/g, "");

  useEffect(() => {
    const normalizedMetal = productDetails.metal.toLowerCase();
    const normalizedPurity = normalizePurity(productDetails.purity);

    // If metal is silver and purity is Manual, set rate_silver
    if (normalizedMetal === "silver" && normalizedPurity === "manual") {
      setProductDetails((prevDetails) => ({ ...prevDetails, rate: rates.rate_silver }));
      return;
    }

    // If metal is gold and purity is Manual, set rate_22crt
    if (normalizedMetal === "gold" && normalizedPurity === "manual") {
      setProductDetails((prevDetails) => ({ ...prevDetails, rate: rates.rate_22crt }));
      return;
    }

    // If metal is silver, always set rate_silver
    if (normalizedMetal === "silver") {
      setProductDetails((prevDetails) => ({ ...prevDetails, rate: rates.rate_silver }));
      return;
    }

    // Normal purity-based rate assignment for gold
    const currentRate =
      normalizedPurity.includes("24") ? rates.rate_24crt :
        normalizedPurity.includes("22") ? rates.rate_22crt :
          normalizedPurity.includes("18") ? rates.rate_18crt :
            normalizedPurity.includes("16") ? rates.rate_16crt :
              rates.rate_22crt;


    setProductDetails((prevDetails) => ({ ...prevDetails, rate: currentRate }));
  }, [productDetails.purity, productDetails.metal, rates]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setProductDetails((prevDetails) => {
      let updatedDetails = { ...prevDetails, [name]: value };

      if (name === "metal") {
        if (!value) {
          // If metal is cleared, reset all dependent fields
          updatedDetails = {
            ...updatedDetails,
            purity: "",
            purityPercentage: "",
            rate: 0,
            gross: 0,
            dust: 0,
            touch_percent: 0,
            ml_percent: 0,
            eqt_wt: 0,
            remarks: "",
            total_amount: 0,
          };
        } else {
          // If metal is selected, reset purity and set rate for silver
          updatedDetails.purity = "";
          updatedDetails.purityPercentage = "";
          updatedDetails.rate = value === "Silver" ? rates.rate_silver || "0.00" : "";
        }
      }

      if (name === "purity") {
        if (value !== "Manual") {
          const selectedOption = purityOptions.find(option => option.name === value);
          updatedDetails.purityPercentage = selectedOption ? selectedOption.purity_percentage : 0;
        } else {
          updatedDetails.purityPercentage = 0; // Directly set purityPercentage to 0
        }

        // **Get the correct rate based on purity**
        const normalizedPurity = normalizePurity(value);
        updatedDetails.rate =
          normalizedPurity.includes("24") ? rates.rate_24crt :
            normalizedPurity.includes("22") ? rates.rate_22crt :
              normalizedPurity.includes("18") ? rates.rate_18crt :
                normalizedPurity.includes("16") ? rates.rate_16crt :
                  rates.rate_22crt; // Default to rate_22crt if no match
      }

      if (name === "purityPercentage") {
        updatedDetails.purityPercentage = parseFloat(value) || 0;
      }

      // **Ensure net weight is calculated with the latest purity and rate**
      updatedDetails.eqt_wt = calculateNetWeight({
        ...updatedDetails,
        purityPercentage: updatedDetails.purityPercentage,
      });

      updatedDetails.total_amount = calculateTotalAmount(updatedDetails);

      return updatedDetails;
    });
  };

  const calculateNetWeight = ({ gross, dust, purity, purityPercentage, ml_percent }) => {
    const purityPercentageValue = purity === "Manual"
      ? parseFloat(purityPercentage) || 0
      : parseFloat(purityPercentage) || 0;  // Ensure the correct purityPercentage is used

    const grossWeight = parseFloat(gross) || 0;
    const dustWeight = parseFloat(dust) || 0;
    const mlPercentValue = parseFloat(ml_percent) || 0;

    const netWeight = ((grossWeight - dustWeight) * (purityPercentageValue - mlPercentValue)) / 100;
    return parseFloat(netWeight.toFixed(3));
  };

  const calculateTotalAmount = ({ eqt_wt, rate }, currentRate) => {
    const netWeight = Number(eqt_wt) || 0;
    const rateAmount = Number(rate) || Number(currentRate) || 0;

    const totalAmount = netWeight * rateAmount;
    return Number(totalAmount.toFixed(2));
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
          (item) => item.account_group === 'CUSTOMERS' || item.account_group === 'SUPPLIERS'
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

  const handleAddOrUpdateItem = () => {
    if (productDetails.product_name && productDetails.metal) {
      if (editingRow !== null) {
        // Update existing item
        const updatedItems = [...items];
        updatedItems[editingRow] = { ...productDetails };
        setItems(updatedItems);
        setEditingRow(null); // Reset editing state
      } else {
        // Add new item
        setItems([...items, { ...productDetails }]);
      }

      // Reset form fields
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


  const handleEditItem = (item, index) => {
    setProductDetails(item);  // Populate form fields with existing data
    setEditingRow(index); // Store index for updating
  };

  const getTabId = () => {
    // First try to get from URL
    const urlParams = new URLSearchParams(window.location.search);
    let tabId = urlParams.get('tabId');
    
    // If not in URL, try sessionStorage
    if (!tabId) {
      tabId = sessionStorage.getItem('tabId');
    }
    
    // If still not found, generate new ID
    if (!tabId) {
      tabId = crypto.randomUUID();
      sessionStorage.setItem('tabId', tabId);
      
      // Update URL without page reload
      const newUrl = `${window.location.pathname}?tabId=${tabId}`;
      window.history.replaceState({}, '', newUrl);
    }
    
    return tabId;
  };

  const tabId = getTabId();

  const handleClose = () => {
    // navigate(`/sales?tabId=${tabId}`);
    navigate(-1);
  };
  const handleDeleteItem = (index) => {
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
        alert("URD Purchase saved successfully!");
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
                  <Col xs={12} md={3} className="d-flex align-items-center">
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
                        autoFocus
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
                  <Col xs={12} md={3}>
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
                  <Col xs={12} md={1}>
                    <InputField
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      readOnly
                    />
                  </Col>
                  <Col xs={12} md={1}>
                    <InputField
                      label="PIN"
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

          <div className="urd-form-section mt-1">
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
                  value={productDetails.metal}
                  onChange={handleInputChange}
                  options={metalOptions.map(option => ({ value: option.value, label: option.label }))}
                />
              </Col>

              {/* <Col xs={12} md={2}>
                <InputField
                  label="HSN Code"
                  name="hsn_code"
                  type="text"
                  value={productDetails.hsn_code}
                  onChange={handleInputChange}
                />
              </Col> */}
              <Col xs={12} md={2}>
                <InputField
                  label="Gross"
                  type="number"
                  name="gross"
                  value={productDetails.gross}
                  onChange={handleInputChange}
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField
                  label="Dust"
                  type="number"
                  name="dust"
                  value={productDetails.dust}
                  onChange={handleInputChange}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Purity"
                  type="select"
                  name="purity"
                  value={productDetails.purity}
                  onChange={handleInputChange}
                  options={[
                    ...purityOptions.map((purity) => ({
                      value: purity.name,
                      label: purity.name,
                    })),
                    { value: "Manual", label: "Manual" },
                  ]}
                />
              </Col>
              {productDetails.purity === "Manual" && (
                <Col xs={12} md={2}>
                  <InputField
                    label="Custom Purity %"
                    type="number"
                    name="purityPercentage"
                    value={productDetails.purityPercentage || ""}
                    onChange={handleInputChange}
                  />
                </Col>
              )}
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
              <Col xs={12} md={2}>
                <InputField
                  label="Rate"
                  name="rate"
                  value={productDetails.rate}
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
                  style={{
                    backgroundColor: "#a36e29", borderColor: "#a36e29", padding: "5px 9px",
                    marginTop: "2px",
                    marginLeft: "-1px",
                    fontSize: "14px"

                  }}
                  onClick={handleAddOrUpdateItem}
                >
                  {editingRow !== null ? "Update" : "Add"}
                </Button>
              </Col>

            </Row>
          </div>
          <div className="urd-form-section mt-1">
            <h4>Item Details</h4>

            <Table bordered hover responsive>
              <thead style={{ fontSize: "13px" }}>
                <tr>
                  <th>S.No</th>
                  {/* <th>product ID</th> */}
                  <th>Product</th>
                  <th>Metal</th>
                  {/* <th>HSN</th> */}
                  <th>Gross</th>
                  <th>Dust</th>
                  <th>Purity</th>
                  <th>ML%</th>
                  <th>Net WT</th>
                  <th>Rate</th>
                  <th>Total Value</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    {/* <td>{item.product_id}</td> */}
                    <td>{item.product_name}</td>
                    <td>{item.metal}</td>
                    {/* <td>{item.hsn_code}</td> */}
                    <td>{item.gross}</td>
                    <td>{item.dust}</td>
                    <td>{item.purity}</td>
                    <td>{item.ml_percent}</td>
                    <td>{item.eqt_wt}</td>
                    <td>{item.rate}</td>
                    <td>{item.total_amount}</td>
                    <td>{item.remarks}</td>
                    <td>
                      <FaEdit
                        style={{ cursor: "pointer", marginLeft: "10px", color: "blue" }}
                        onClick={() => handleEditItem(item, index)}
                      />
                      <FaTrash
                        style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
                        onClick={() => handleDeleteItem(index)}
                      />
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

            {/* <Button type="submit" variant="success" style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>Print</Button> */}
            <Button
              onClick={handleClose}
              style={{ backgroundColor: "gray", borderColor: "gray", marginLeft: "5px" }}
            // disabled={!isSubmitEnabled}
            >
              Close
            </Button>
            <Button
              variant="secondary"
              onClick={handleBack} style={{ backgroundColor: 'gray', }}
            >
              cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
              onClick={handleSubmit}
            >
              Save
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default URDPurchase;
