import React, { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import InputField from "./InputfieldSales";

const InvoiceDetails = ({ formData, setFormData }) => {

  const generateAssignedNumber = () => {
    const lastAssignedNumber =
      localStorage.getItem("lastAssignedNumber");

    let lastNumber = 0;

    if (lastAssignedNumber) {
      const match = lastAssignedNumber.match(/ASN(\d+)/);

      if (match) {
        lastNumber = parseInt(match[1], 10);
      }
    }

    const nextNumber = lastNumber + 1;

    const newAssignedNumber = `ASN${String(nextNumber).padStart(3, "0")}`;

    localStorage.setItem(
      "lastAssignedNumber",
      newAssignedNumber
    );

    console.log(
      "Generated Assigned Number:",
      newAssignedNumber
    );

    return newAssignedNumber;
  };

  useEffect(() => {
    setFormData((prev) => {
      const updatedData = { ...prev };

      if (!prev.date) {
        updatedData.date = new Date()
          .toISOString()
          .split("T")[0];
      }

      if (!prev.assigned_number) {
        updatedData.assigned_number =
          generateAssignedNumber();
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
            label="Assigned Number"
            name="assigned_number"
            value={formData.assigned_number || ""}
            placeholder="ASN001"
            readOnly
          />
        </Col>
      </Row>
    </Col>
  );
};

export default InvoiceDetails;