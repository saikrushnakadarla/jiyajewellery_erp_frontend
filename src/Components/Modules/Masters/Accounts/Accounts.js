import React, { useState, useEffect } from "react";
import "./Accounts.css";
import InputField from "../../../Pages/InputField/InputField";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import baseURL from "../../../../Url/NodeBaseURL";


const RepairForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the account ID from URL params
  const [formData, setFormData] = useState({
    account_name: "",
    print_name: "",
    account_group: "",
    op_bal: "",
    dr_cr: "",
    metal_balance: "",
    address1: "",
    address2: "",
    city: "",
    gst_in: '',
    pincode: "",
    state: "",
    state_code: "",
    phone: "",
    mobile: "",
    contact_person: "",
    email: "",
    birthday: "",
    anniversary: "",
    branch: "",
    bank_account_no: "",
    bank_name: "",
    ifsc_code: "",
  });
  const [states, setStates] = useState([]);

  // Fetch data if editing an existing account
  useEffect(() => {
    if (id) {
      const fetchAccountData = async () => {
        try {
          const response = await fetch(`${baseURL}/get/account-details/${id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch account data");
          }
          const result = await response.json();
          // setFormData(result);
            // Parse dates without timezone adjustment
            const parseDate = (dateString) => {
              if (!dateString) return '';
              const date = new Date(dateString);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            };
          setFormData({
            ...result,
            birthday: parseDate(result.birthday),
            anniversary: parseDate(result.anniversary),
          });
          
        } catch (error) {
          console.error("Error fetching account data:", error.message);
        }
      };
      fetchAccountData();
    }
  }, [id]);

  const [accountGroups, setAccountGroups] = useState([]);
  useEffect(() => {
    const fetchAccountGroups = async () => {
      try {
        const response = await fetch(`${baseURL}/accountsgroup`);
        if (!response.ok) {
          throw new Error("Failed to fetch account groups");
        }
        const data = await response.json();
        // Assuming the API returns an array of objects with `AccountsGroupName`
        const formattedOptions = data.map(group => ({
          value: group.AccountsGroupName,
          label: group.AccountsGroupName,
        }));
        setAccountGroups(formattedOptions);
      } catch (error) {
        console.error("Error fetching account groups:", error.message);
      }
    };
    fetchAccountGroups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    switch (name) {
      case "account_name":
      case "print_name":
        // Capitalize first letter
        updatedValue =  value.toUpperCase();

        // Ensure it contains at least one letter
        if (/^\d+$/.test(updatedValue)) {
          return; // Prevent update if only numbers
        }

        setFormData((prevData) => ({
          ...prevData,
          [name]: updatedValue,
          ...(name === "account_name" &&
            prevData.print_name === prevData.account_name && {
            print_name: updatedValue,
          }),
        }));
        return;

      case "print_name":
        // Capitalize first letter
        updatedValue = value.charAt(0).toUpperCase() + value.slice(1);
        break;

      case "mobile":
      case "phone":
        // Allow only numbers and limit to 10 digits
        updatedValue = value.replace(/\D/g, "").slice(0, 10);
        break;

      case "aadhar_card":
        // Allow only numbers and limit to 12 digits
        updatedValue = value.replace(/\D/g, "").slice(0, 12);
        break;

      case "pincode":
        // Allow only numbers and limit to 6 digits
        updatedValue = value.replace(/\D/g, "").slice(0, 6);
        break;

      case "gst_in":
        // GSTIN must be 15 alphanumeric characters (uppercase)
        updatedValue = value.toUpperCase().slice(0, 15);
        break;

      case "pan_card":
        // PAN must be 10 alphanumeric characters (uppercase)
        updatedValue = value.toUpperCase().slice(0, 10);
        break;

      case "ifsc_code":
        // IFSC must be exactly 11 alphanumeric characters (uppercase)
        updatedValue = value.toUpperCase().slice(0, 11);
        break;

      case "bank_account_no":
        // Allow only numbers and limit to 18 digits
        updatedValue = value.replace(/\D/g, "").slice(0, 18);
        break;

      default:
        break;
    }

    // Update state
    setFormData((prevData) => ({
      ...prevData,
      [name]: updatedValue,
    }));
  };

  const validateForm = () => {
    if (!formData.account_name?.trim()) {
      alert("Account Name is required.");
      return false;
    }
    if (!formData.mobile?.trim()) {
      alert("Mobile number is required.");
      return false;
    }
    if (formData.mobile.length !== 10) {
      alert("Mobile number must be exactly 10 digits.");
      return false;
    }
    if (formData.pincode?.trim() && formData.pincode.length !== 6) {
      alert("PinCode must be exactly 6 digits.");
      return false;
    }
    if (formData.aadhar_card?.trim() && formData.aadhar_card.length !== 12) {
      alert("Aadhar Card must be exactly 12 digits.");
      return false;
    }
    if (formData.pan_card?.trim() && formData.pan_card.length !== 10) {
      alert("PAN Card must be exactly 10 characters.");
      return false;
    }
    if (formData.gst_in?.trim() && formData.gst_in.length !== 15) {
      alert("GSTIN must be exactly 15 characters.");
      return false;
    }
    if (formData.ifsc_code?.trim() && formData.ifsc_code.length !== 11) {
      alert("IFSC Code must be exactly 11 characters.");
      return false;
    }
    return true;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    const sanitizedFormData = {
      account_name: formData.account_name || "",
      mobile: formData.mobile || "",
      aadhar_card: formData.aadhar_card || "",
      pan_card: formData.pan_card || "",
      gst_in: formData.gst_in || "",
      ifsc_code: formData.ifsc_code || "",
    };
  
    try {
      const method = id ? "PUT" : "POST";
      const url = id
        ? `${baseURL}/edit/account-details/${id}`
        : `${baseURL}/account-details`;
  
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedFormData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }
  
      alert(id ? "Account updated successfully!" : "Account created successfully!");
      navigate("/accountstable");
    } catch (err) {
      console.error("Error submitting form:", err.message);
      alert(`Error: ${err.message}`);
    }
  };
  


  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/states`);
        setStates(response.data); // Assuming `states` is a state variable to store states data
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, []);

  const handleStateChange = (e) => {
    const selectedState = states.find((state) => state.state_name === e.target.value);
    setFormData({
      ...formData,
      state: selectedState?.state_name || "",
      state_code: selectedState?.state_code || "",
    });
  };

  return (
    <div className="main-container">
      <Container className="accounts-form-container">
        <form onSubmit={handleSubmit}>
          <Row className="accounts-form-section">
            <h4 className="mb-4">{id ? "Edit Account" : "Create Account"}</h4>
            <Col xs={12} md={4}>
              <InputField
                label="Account Name"
                name="account_name"
                value={formData.account_name}
                onChange={handleChange}
                required
                autoFocus
              />
            </Col>
            <Col xs={12} md={4}>
              <InputField
                label="Print Name"
                name="print_name"
                value={formData.print_name}
                onChange={handleChange}
                required
              />
            </Col>
            <Col xs={12} md={4}>
              <InputField
                label="Group"
                name="account_group"
                type="select"
                value={formData.account_group}
                onChange={handleChange}
                options={accountGroups} // Dynamic options
              />
            </Col>
            <Col xs={12} md={2}>
              <InputField
                label="Op. Bal."
                name="op_bal"
                type="number"
                value={formData.op_bal}
                onChange={handleChange}
              />
            </Col>

            <Col xs={12} md={2}>
              <InputField
                label="Metal Balance"
                name="metal_balance"
                type="number"
                value={formData.metal_balance}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={2}>
              <InputField
                label="Dr/Cr"
                name="dr_cr"
                type="select"
                value={formData.dr_cr}
                onChange={handleChange}
                options={[
                  { value: "Dr", label: "Dr." },
                  { value: "Cr", label: "Cr." },
                ]}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="Address"
                name="address1"
                value={formData.address1}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="Address2"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </Col>

            <Col xs={12} md={2}>
              <InputField
                label="Pincode"
                name="pincode"
                type="number"
                value={formData.pincode}
                onChange={handleChange}
              />
            </Col>
            {/* <Col xs={12} md={2}>
              <InputField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={2}>
              <InputField
                label="State Code"
                name="state_code"
                type="text"
                value={formData.state_code}
                onChange={handleChange}
              />
            </Col> */}
            <Col xs={12} md={2}>
              <InputField
                label="State"
                name="state"
                type="select"
                value={formData.state}
                onChange={handleStateChange} // Use handleStateChange to update the state and state_code
                options={states.map((state) => ({
                  value: state.state_name,
                  label: state.state_name,
                }))}
              />
            </Col>
            <Col xs={12} md={2}>
              <InputField label="State Code" name="state_code" value={formData.state_code} onChange={handleChange} readOnly />
            </Col>

            <Col xs={12} md={3}>
              <InputField
                label="Phone"
                name="phone"
                type="number"
                value={formData.phone}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="Mobile"
                name="mobile"
                type="number"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="Contact Person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="Birthday On"
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={2}>
              <InputField
                label="Anniversary On"
                name="anniversary"
                type="date"
                value={formData.anniversary}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="GSTIN:"
                name="gst_in"
                value={formData.gst_in}
                onChange={handleChange}

              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="Bank Account No."
                name="bank_account_no"
                value={formData.bank_account_no}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="Bank Name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={2}>
              <InputField
                label="IFSC Code"
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={handleChange}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="Branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <div className="form-buttons">
            <Button
              variant="secondary"
              type="button"
              className="cus-back-btn"
              onClick={() => navigate("/accountstable")}
            >
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>

              {id ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </Container>
    </div>
  );
};

export default RepairForm;
