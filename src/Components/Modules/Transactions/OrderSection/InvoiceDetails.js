import React, { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import InputField from "./../../Transactions/SalesForm/InputfieldSales";
import { useLocation } from "react-router-dom";

const InvoiceDetails = ({ formData, setFormData }) => {
  const location = useLocation();

  // Set the default date value to the current date if it's not already set
  useEffect(() => {
    if (!formData.date) {
      setFormData((prev) => ({
        ...prev,
        date: new Date().toISOString().split("T")[0],
      }));
    }
  }, [formData, setFormData]);

  // Update formData.order_number from location.state
  useEffect(() => {
    if (location.state?.order_number && formData.order_number !== location.state.order_number) {
      console.log("Received Invoice Number from navigation:", location.state.order_number);
      setFormData((prev) => ({
        ...prev,
        order_number: location.state.order_number,
      }));
    }
  }, [location.state, formData.order_number, setFormData]);

  return (
    <Col className="sales-form-section">
      <Row>
        {/* <Col xs={12} md={6}>
          <InputField
            label="Terms"
            type="select"
            value={formData.terms}
            name="terms"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                terms: e.target.value,
              }))
            }
            options={[
              { value: "Cash", label: "Cash" },
              { value: "Credit", label: "Credit" },
            ]}
          />
        </Col> */}
        <Col xs={12} md={12}>
          <InputField
            label="Date:"
            name="date"
            value={formData.date}
            type="date"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                date: e.target.value,
              }))
            }
            max={new Date().toISOString().split("T")[0]}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <InputField
            label="Invoice Number"
            name="order_number"
            value={formData.order_number || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                order_number: e.target.value,
              }))
            }
          />
        </Col>
      </Row>
    </Col>
  );
};

export default InvoiceDetails;
