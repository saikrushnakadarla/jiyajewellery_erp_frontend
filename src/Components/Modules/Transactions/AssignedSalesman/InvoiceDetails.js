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

  // Helper: build a local (non-UTC) "YYYY-MM-DDTHH:mm" string for the
  // datetime-local input. Using new Date().toISOString() would convert to
  // UTC first, which shifts the date/time incorrectly for IST users
  // (e.g. between 12:00 AM–5:30 AM IST it would even show the wrong day).
  const getLocalDateTimeString = (date = new Date()) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  useEffect(() => {
    setFormData((prev) => {
      const updatedData = { ...prev };

      if (!prev.date) {
        // Default to current LOCAL date & time (not UTC-sliced date-only
        // string) so the calendar event downstream gets a real scheduled
        // time instead of falling back to a hardcoded 9:00 AM.
        updatedData.date = getLocalDateTimeString();
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
            label="Date & Time:"
            name="date"
            type="datetime-local"
            value={formData.date || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                date: e.target.value,
              }))
            }
            // No `max` restricting to "now" — this field represents when the
            // visit/assignment is scheduled, which is often later today or
            // in the future. Remove this comment block and add a max back
            // (using getLocalDateTimeString()) if you specifically need to
            // block future-dated entries.
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