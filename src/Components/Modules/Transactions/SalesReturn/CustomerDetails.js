import React from 'react';
import { Col, Row } from 'react-bootstrap';
import InputField from './../../Transactions/SalesForm/InputfieldSales';
import { AiOutlinePlus } from 'react-icons/ai';

const CustomerDetails = ({ formData, handleCustomerChange, handleAddCustomer, customers }) => {
  return (
    <Col className="sales-form-section">
      <Row>
        <Col xs={12} md={3} className="d-flex align-items-center">
          <div style={{ flex: 1 }}>
            <InputField
              label="Mobile"
              name="mobile"
              type="select"
              value={formData.customer_id || ""} // Use customer_id to match selected value
              onChange={(e) => handleCustomerChange(e.target.value)}
              options={customers.map((customer) => ({
                value: customer.account_id,
                label: customer.mobile,
              }))}
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
            options={customers.map((customer) => ({
              value: customer.account_id,
              label: customer.account_name,
            }))}
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
        <Col xs={12} md={3}>
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
      </Row>
    </Col>
  );
};

export default CustomerDetails;