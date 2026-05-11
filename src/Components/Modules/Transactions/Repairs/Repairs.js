import React, { useState, useEffect, useContext, useRef } from "react";
import "./Repairs.css";
import InputField from "../../Transactions/SalesForm/InputfieldSales";
import { Container, Row, Col, Button, Form, Dropdown } from "react-bootstrap";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import baseURL from "../../../../Url/NodeBaseURL";
import axios from "axios";
import { AiOutlinePlus } from "react-icons/ai";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import PDFContent from "./RepairInvoice";
import { AuthContext } from "../../../Pages/Login/Context";
import { FaTrash } from "react-icons/fa";
import Webcam from "react-webcam";

const RepairForm = () => {
  const today = new Date(); // Define today as a Date object
  const formattedToday = today.toISOString().split("T")[0]; // Format today's date as YYYY-MM-DD

  const defaultDeliveryDate = new Date(); // Create a new Date object for the default delivery date
  defaultDeliveryDate.setDate(today.getDate() + 3); // Add 3 days to today's date

  const formattedDate = defaultDeliveryDate.toISOString().split("T")[0];
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { authToken, userId, userName } = useContext(AuthContext);
  console.log(userId, userName)
  console.log("ID=", id)
  const { state } = useLocation();
  const { mobile } = location.state || {};
  const initialSearchValue = location.state?.mobile || '';
  const [formData, setFormData] = useState({
    customer_id: "",
    account_name: "",
    mobile: "",
    email: "",
    address1: "",
    address2: "",
    address3: "",
    city: "",
    staff: userName,
    delivery_date: formattedDate,
    place: "",
    metal: "",
    counter: "",
    entry_type: "Repair",
    receipt_no: "",
    repair_no: "",
    date: formattedToday,
    metal_type: "",
    item: "",
    tag_no: "",
    description: "",
    purity: "",
    category: "",
    sub_category: "",
    gross_weight: "",
    pcs: "",
    estimated_dust: "",
    estimated_amt: "",
    extra_weight: "",
    stone_value: "",
    making_charge: "",
    handling_charge: "",
    total: "",
    status: "Pending",
  });
  const [customers, setCustomers] = useState([]);
  const [metalTypes, setMetalTypes] = useState([]);
  const [purityData, setPurityData] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredPurity, setFilteredPurity] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

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
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch Purity Data when Metal Type changes
  useEffect(() => {
    const fetchPurity = async () => {
      try {
        const response = await axios.get(`${baseURL}/purity`);
        setPurityData(response.data);
      } catch (error) {
        console.error("Error fetching purity data:", error);
      }
    };

    fetchPurity();
  }, []);

  // Filter Purity Data based on selected Metal Type
  useEffect(() => {
    if (formData.metal_type) {
      const filtered = purityData.filter(
        (item) => item.metal === formData.metal_type
      );
      setFilteredPurity(filtered);
    } else {
      setFilteredPurity([]);
    }
  }, [formData.metal_type, purityData]);

  useEffect(() => {
    const fetchMetalTypes = async () => {
      try {
        const response = await axios.get(`${baseURL}/metaltype`);
        setMetalTypes(response.data);
      } catch (error) {
        console.error("Error fetching metal types:", error);
      }
    };
    fetchMetalTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

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
        customer_id: customer.account_id, // Ensure this is correctly set
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
      });
    }
  };

  useEffect(() => {
    if (mobile) {
      console.log("Selected Mobile from New Link:", mobile);

      // Find the customer matching the passed mobile
      const matchedCustomer = customers.find((cust) => cust.mobile === mobile);

      if (matchedCustomer) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          customer_id: matchedCustomer.account_id,
          account_name: matchedCustomer.account_name,
          mobile: matchedCustomer.mobile, // Set the mobile field in formData
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
        // If no matching customer, only set mobile
        setFormData((prevFormData) => ({
          ...prevFormData,
          mobile: mobile,
        }));
      }
    }
  }, [mobile, customers]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Convert image to base64 and update state
      };
      reader.readAsDataURL(file);
    }
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setIsCameraOpen(false);
  };

  const clearImage = () => {
    setImage(null);
  };

  const parseDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchRepairById = async () => {
      if (id) {
        try {
          const response = await axios.get(`${baseURL}/get/repairs/${id}`);
          const fetchedData = response.data;
          console.log("Fetched Data:", fetchedData);

          // Check if image exists
          if (fetchedData.image) {
            setImage(fetchedData.image); // Set existing image
          }

          // Format the date fields
          const formattedData = {
            ...fetchedData,
            date: parseDate(fetchedData.date),
            delivery_date: parseDate(fetchedData.delivery_date),
          };

          setFormData((prevData) => ({
            ...prevData,
            ...formattedData, // Merge formatted data into the form state
          }));
        } catch (error) {
          console.error("Error fetching repair data:", error);
          alert("Failed to load repair details. Please try again later.");
        }
      }
    };

    fetchRepairById();
  }, [id]);

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
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFormData = {
      ...formData,
      image, // Include the image in the request payload
    };

    try {
      if (id) {
        // Update existing repair entry
        const response = await axios.put(`${baseURL}/update/repairs/${id}`, updatedFormData);
        if (response.status === 200) {
          alert("Repair entry updated successfully!");
        }
      } else {
        // Create a new repair entry
        const response = await axios.post(`${baseURL}/add/repairs`, updatedFormData);
        if (response.status === 201) {
          alert("Repair entry added successfully!");
        }
      }
      // navigate("/repairstable");
      navigate(-1);
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("Failed to submit the repair entry");
    }
  };


  // const handleAddCustomer = () => {
  //   navigate("/customermaster", { state: { from: "/repairs" } });
  // };

  const handleAddCustomer = (mobile) => {
    console.log("handleAddCustomer received mobile:", mobile);
    navigate("/customermaster", { 
      state: { 
        from: `/repairs`,
        mobile: mobile // Pass the mobile number here
      } 
    });
  };

  const handleBack = () => {
    // navigate("/repairstable");
    navigate(-1);
  };

  useEffect(() => {
    if (!id) {
      const fetchLastRPNNumber = async () => {
        try {
          const response = await axios.get(`${baseURL}/lastRPNNumber`);
          setFormData((prev) => ({
            ...prev,
            repair_no: response.data.lastRPNNumber, // Only set repair_no when creating a new repair
          }));
        } catch (error) {
          console.error('Error fetching RPN number:', error);
        }
      };

      fetchLastRPNNumber();
    }
  }, [id]);

  return (
    <div className="main-container">
      <Container className="repair-form-container">
        <Form onSubmit={handleSubmit}>
          <div className="repair-form" >
            {/* Left Section */}
            <div className="repair-form-left">
              <Col className="form-section">
                <h4 className="mb-4">Customer Details</h4>
                <Row>
                  {/* <Col xs={12} md={3} className="d-flex align-items-center">
                    <div style={{ flex: 1 }}>
                      <InputField
                        label="Mobile"
                        name="mobile"
                        type="select"
                        value={formData.customer_id || ""} // Use customer_id to match selected option
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
                  </Col> */}

                  <Col xs={12} md={3} className="d-flex align-items-center">
                    <div style={{ flex: 1 }}>
                      <InputField
                        label="Mobile"
                        name="mobile"
                        type="select"
                        value={formData.mobile || ""}
                        onChange={(e) => {
                          const inputMobile = e.target.value;
                          if (!inputMobile) {
                            setFormData((prev) => ({
                              ...prev,
                              mobile: "",
                              account_name: "",
                              email: "",
                              address1: "",
                              address2:"",
                              city: "",
                              pincode: "",
                              state: "",
                              aadhar_card: "",
                              gst_in: "",
                            }));
                            return;
                          }

                          const isValidMobile = /^\d{10}$/.test(inputMobile);
                          if (!isValidMobile) {
                            alert("Please enter a valid 10-digit mobile number.");
                            return;
                          }

                          setFormData((prev) => ({ ...prev, mobile: inputMobile }));

                          const existing = customers.find((c) => c.mobile === inputMobile);
                          if (existing) {
                            handleCustomerChange(existing.account_id);

                          }
                        }}
                        onKeyDown={({ key, value }) => {
                          if (key === "Enter") {
                            const isValidMobile = /^\d{10}$/.test(value);
                            const exists = customers.some((c) => c.mobile === value);
                            if (isValidMobile && !exists) {
                              handleAddCustomer(value);
                            }
                          }
                        }}
                        options={customers.map((c) => ({ value: c.mobile, label: c.mobile }))}
                        allowCustomInput
                      />


                    </div>
                    <AiOutlinePlus
                      size={20}
                      color="black"
                      // onClick={handleAddCustomer}
                      onClick={() => {
                        console.log("Mobile passed to handleAddCustomer:", formData.mobile);
                        handleAddCustomer(formData.mobile); // This should be passing the correct mobile number
                      }}
                      style={{
                        marginLeft: "10px",
                        cursor: "pointer",
                        marginBottom: "20px",
                      }}
                    />
                  </Col>

                  <Col xs={12} md={3}>
                    <InputField
                      label="Customer Name"
                      name="account_name"
                      type="select"
                      value={formData.account_name.toUpperCase() || ""}
                      onChange={(e) => {
                        const inputName = (e.target.value || "").toUpperCase();

                        if (!inputName) {
                          // Clear all dependent fields
                          setFormData((prev) => ({
                            ...prev,
                            mobile: "",
                            account_name: "",
                            email: "",
                            address1: "",
                            address2:"",
                            city: "",
                            pincode: "",
                            state: "",
                            aadhar_card: "",
                            gst_in: "",
                          }));
                          return;
                        }

                        setFormData((prev) => ({ ...prev, account_name: inputName }));

                        const existing = customers.find((c) => c.account_name.toUpperCase() === inputName);
                        if (existing) {
                          handleCustomerChange(existing.account_id);

                        }
                      }}
                      options={customers.map((c) => ({
                        value: c.account_name.toUpperCase(),
                        label: c.account_name.toUpperCase(),
                      }))}
                      allowCustomInput
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <InputField
                      label="Email:"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      readOnly
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <InputField
                      label="Address1:"
                      name="address1"
                      value={formData.address1}
                      onChange={handleChange}
                      readOnly
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <InputField
                      label="Address2:"
                      name="address2"
                      value={formData.address2}
                      onChange={handleChange}
                      readOnly
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <InputField
                      label="City:"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      readOnly
                    />
                  </Col>
                </Row>
              </Col>
            </div>
            <div className="repair-form-right">
              <Col className="form-section">
                <Row>
                  <InputField
                    label="Entry Type:"
                    name="entry_type"
                    type="select"
                    value={formData.entry_type}
                    onChange={handleChange}
                    options={[
                      { value: "Repair", label: "Repair" },
                      { value: "Poolish", label: "Poolish" },
                      { value: "Other", label: "Other" }
                    ]}
                  />
                </Row>
                <Row>
                  <InputField
                    label="Repair No:"
                    name="repair_no"
                    value={formData.repair_no}
                    onChange={handleChange}
                    readOnly
                  />

                </Row>
                <Row>
                  <InputField label="Date:" name="date" type="date" value={formData.date} onChange={handleChange} />
                </Row>
              </Col>
            </div>
          </div>
          <Row className="form-section pt-4">
            <Col xs={12} md={2}>
              <InputField label="Staff:" name="staff" value={formData.staff} onChange={handleChange} readOnly />
            </Col>
            <Col xs={12} md={2}>
              <InputField label="Delivery Date:" type="date" name="delivery_date" value={formData.delivery_date} onChange={handleChange} />
            </Col>
            <Col xs={12} md={3}>
              <InputField label="Counter:" name="counter" value={formData.counter} onChange={handleChange} />
            </Col>
          </Row>
          <div className="repair-form2">
            <div className="repair-form-left">
              <Col className="form-section">
                <h4>Repair Item Details</h4>
                <Row>
                  <Col xs={12} md={3}>
                    <InputField label="Category" name="category" value={formData.category} onChange={handleChange} />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField label="Sub Category" name="sub_category" value={formData.sub_category} onChange={handleChange} />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField label="Item name" name="item" value={formData.item} onChange={handleChange} />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField
                      label="Metal Type"
                      name="metal_type"
                      type="select"
                      value={formData.metal_type}
                      onChange={handleChange}
                      options={metalTypes.map((metal) => ({
                        value: metal.metal_name,
                        label: metal.metal_name
                      }))}
                    />
                  </Col>
                  {/* <Col xs={12} md={2}>
                    <InputField label="Tag No:" name="tag_no" value={formData.tag_no} onChange={handleChange} />
                  </Col> */}
                  <Col xs={12} md={3}>
                    <InputField label="Description:" name="description" value={formData.description} onChange={handleChange} />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField
                      label="Purity"
                      name="purity"
                      type="select"
                      value={formData.purity}
                      onChange={handleChange}
                      options={filteredPurity.map((item) => ({
                        value: item.name,
                        label: item.name
                      }))}
                    />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField label="Gross Weight" name="gross_weight" value={formData.gross_weight} onChange={handleChange} />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField label="Pcs" name="pcs" value={formData.pcs} onChange={handleChange} />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField label="Est Dust" name="estimated_dust" value={formData.estimated_dust} onChange={handleChange} />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField label="Est Amt" name="estimated_amt" value={formData.estimated_amt} onChange={handleChange} />
                  </Col>

                </Row>
              </Col>
            </div>
            <div className="repair-form-right">
              <Col className="form-section">
                {/* <h4>Upload Image</h4> */}
                <Row>
                  <Col xs={12} md={4}>
                    <div className="image-upload-container">
                      {/* Dropdown Button for Upload Options */}
                      <Dropdown>
                        <Dropdown.Toggle id="dropdown-basic-button">Upload Image</Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => fileInputRef.current.click()}>
                            Select Image
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => setIsCameraOpen(true)}>
                            Capture Image
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>

                      {/* Hidden file input */}
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                      />

                      {/* Webcam Modal */}
                      {isCameraOpen && (
                        <div className="webcam-container mt-2">
                          <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="img-thumbnail"
                          />
                          <div className="d-flex gap-2 mt-2">
                            <Button onClick={captureImage} variant="primary">
                              Capture
                            </Button>
                            <Button onClick={() => setIsCameraOpen(false)} variant="danger">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Image Preview with Delete Icon */}
                      {image && (
                        <div style={{ position: "relative", display: "inline-block", marginTop: "10px" }}>
                          <img src={image} alt="Selected"
                            style={{
                              width: "100px",
                              height: "100px",
                              borderRadius: "8px",
                            }} />
                          <button
                            type="button"
                            onClick={clearImage}
                            style={{
                              position: "absolute",
                              top: "5px",
                              right: "5px",
                              background: "transparent",
                              border: "none",
                              color: "red",
                              fontSize: "16px",
                              cursor: "pointer",
                              zIndex: 10,
                            }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </Col>
            </div>
          </div>
          <div className="form-buttons">
            <Button
              onClick={handleClose}
              style={{ backgroundColor: "gray", borderColor: "gray", marginLeft: "5px" }}
            // disabled={!isSubmitEnabled}
            >
              Close
            </Button>
            <Button className="cus-back-btn" variant="secondary" onClick={handleBack}>cancel</Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: "#a36e29", borderColor: "#a36e29" }}
            >
              {id ? "Update" : "Save"}
            </Button>
          </div>
        </Form>
      </Container>
    </div>
  );
};

export default RepairForm;
