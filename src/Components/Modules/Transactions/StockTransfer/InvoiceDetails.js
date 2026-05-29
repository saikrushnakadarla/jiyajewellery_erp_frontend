import React, { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import InputField from "./InputfieldSales";
import { useLocation } from "react-router-dom";

const InvoiceDetails = ({ formData, setFormData }) => {
  const location = useLocation();

  useEffect(() => {
    if (!formData.date) {
      setFormData((prev) => ({
        ...prev,
        date: new Date().toISOString().split("T")[0],
      }));
    }
  }, [formData, setFormData]);

  useEffect(() => {
    if (location.state?.transfer_number && formData.transfer_number !== location.state.transfer_number) {
      console.log("Received Transfer Number from navigation:", location.state.transfer_number);
      setFormData((prev) => ({
        ...prev,
        transfer_number: location.state.transfer_number,
      }));
    }
  }, [location.state, formData.transfer_number, setFormData]);

  return (
    <Col className="sales-form-section">
      <Row>
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
            label="Transfer Number"
            name="transfer_number"
            value={formData.transfer_number || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                transfer_number: e.target.value,
              }))
            }
          />
        </Col>
      </Row>
    </Col>
  );
};

export default InvoiceDetails;