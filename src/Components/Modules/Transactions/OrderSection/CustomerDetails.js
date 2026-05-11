import React, { useState, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import InputField from './../../Transactions/SalesForm/InputfieldSales';
import { AiOutlinePlus } from 'react-icons/ai';
import { useLocation } from "react-router-dom";
import baseURL from '../../../../Url/NodeBaseURL';

const CustomerDetails = ({ formData, setFormData, handleCustomerChange, handleAddCustomer, customers, customerImage, setCustomerImage }) => {
  const location = useLocation();



  // Update formData.mobile if mobile is passed via location.state
  useEffect(() => {
    if (location.state?.mobile) {
      console.log("Received Mobile from navigation:", location.state.mobile);
      const customer = customers.find(
        (cust) => cust.mobile === location.state.mobile
      );
      if (customer) {
        handleCustomerChange(customer.account_id); // Use account_id to update formData
      }
    }
  }, [location.state, customers]);

  return (
    <Col className="sales-form-section">
      <Row>
        {/* <Col xs={12} md={3} className="d-flex align-items-center">
          <div style={{ flex: 1 }}>
            <InputField
              label="Mobile"
              name="mobile"
              type="select"
              value={formData.customer_id || ""} // Ensure customer_id is used for selection
              onChange={(e) => handleCustomerChange(e.target.value)} // Trigger handleCustomerChange
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
                  }));
                  setCustomerImage("");
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
                }));
                setCustomerImage("");
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
        {/* <Col xs={12} md={2}>
          <InputField
            label="Address2:"
            name="address2"
            value={formData.address2 || ""}
            readOnly
          />
        </Col> */}
        <Col xs={12} md={1}>
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
          <InputField
            label="State:"
            name="state"
            value={formData.state || ""}
            readOnly
          />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="State Code:"
            name="state_code"
            value={formData.state_code || ""}
            readOnly
          />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="Aadhar"
            name="aadhar_card"
            value={formData.aadhar_card || ""}
            readOnly
          />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="GSTIN"
            name="gst_in"
            value={formData.gst_in || ""}
            readOnly
          />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="PAN"
            name="pan_card"
            value={formData.pan_card || ""}
            readOnly
          />
        </Col>
        {customerImage && (
          <Col xs={12} md={2}>
            <div style={{ width: "50px", height: "50px" }}>
              <img
                // src={customerImage}
                src={`${baseURL}/uploads/${customerImage}`}
                alt="Customer"
                style={{ width: "100%", height: "80%", marginBottom: "0px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ccc" }}
              />
            </div>
          </Col>
        )}

      </Row>
    </Col>

  );
};

export default CustomerDetails;