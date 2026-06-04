import React, { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import InputField from "./InputfieldSales";

const InvoiceDetails = ({ formData, setFormData }) => {

  const generateReceivedNumber = () => {
    const lastReceivedNumber = localStorage.getItem("lastReceivedNumber");

    let lastNumber = 0;

    if (lastReceivedNumber) {
      const match = lastReceivedNumber.match(/RCN(\d+)/);

      if (match) {
        lastNumber = parseInt(match[1], 10);
      }
    }

    const nextNumber = lastNumber + 1;

    const newReceivedNumber = `RCN${String(nextNumber).padStart(3, "0")}`;

    localStorage.setItem("lastReceivedNumber", newReceivedNumber);

    console.log("Generated Received Number:", newReceivedNumber);

    return newReceivedNumber;
  };

  useEffect(() => {
    setFormData((prev) => {
      const updatedData = { ...prev };

      if (!prev.date) {
        updatedData.date = new Date().toISOString().split("T")[0];
      }

      if (!prev.received_number) {
        updatedData.received_number = generateReceivedNumber();
      }

      return updatedData;
    });
  }, [setFormData]);

  return (
    <Col className="sales-form-section">
      <Row>
        <Col xs={12} md={12}>
          <InputField
            label="Date:"
            name="date"
            type="date"
            value={formData.date || ""}
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
            label="Received Number"
            name="received_number"
            value={formData.received_number || ""}
            placeholder="RCN001"
            readOnly
          />
        </Col>
      </Row>
    </Col>
  );
};

export default InvoiceDetails;