import React, { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import axios from "axios";

const EditRepairForm = ({ repairData, baseURL, onClose, refreshData }) => {
  const [formData, setFormData] = useState({ ...repairData });

  // Handle input field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      let updatedData = { ...prevData, [name]: value };

      // Ensure correct amount calculation based on the rate type
      const qty = parseFloat(updatedData.qty) || 0;
      const weight = parseFloat(updatedData.weight) || 0;
      const rate = parseFloat(updatedData.rate) || 0;

      // Calculate amount based on selected rate type
      if (updatedData.rate_type === "Rate per Qty" && qty && rate) {
        updatedData.amount = qty * rate;
      } else if (updatedData.rate_type === "Rate for Weight" && weight && rate) {
        updatedData.amount = weight * rate;
      } else {
        updatedData.amount = 0;
      }

      return updatedData;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Ensure the form data contains an ID for updating
      if (!formData.id) {
        alert("Error: Missing ID for update.");
        return;
      }

      // Ensure proper data format for submission
      const updatedData = {
        ...formData,
        qty: parseFloat(formData.qty) || 0,
        weight: parseFloat(formData.weight) || 0,
        rate: parseFloat(formData.rate) || 0,
        amount: parseFloat(formData.amount) || 0,
      };

      // Send a PUT request to update the repair details in the database
      const response = await axios.put(
        `${baseURL}/assigned-repairdetails/${formData.id}`,
        updatedData
      );

      if (response.status === 200) {
        alert("Updated Successfully!");
        onClose(); // Close the modal after successful update
        refreshData(); // Refresh the data in the parent component
      } else {
        alert("Update failed. Please try again.");
      }
    } catch (error) {
      console.error("Error updating repair details:", error);
      alert("An error occurred while updating. Please check your network or API.");
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <Form.Group controlId="item_name">
            <Form.Label><b>Item Name</b></Form.Label>
            <Form.Control
              type="text"
              name="item_name"
              value={formData.item_name || ""}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="purity">
            <Form.Label><b>Purity</b></Form.Label>
            <Form.Control
              type="text"
              name="purity"
              value={formData.purity || ""}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="qty">
            <Form.Label><b>Quantity</b></Form.Label>
            <Form.Control
              type="number"
              name="qty"
              value={formData.qty || ""}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="weight">
            <Form.Label><b>Weight</b></Form.Label>
            <Form.Control
              type="number"
              name="weight"
              value={formData.weight || ""}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="rate_type">
            <Form.Label><b>Rate Type</b></Form.Label>
            <Form.Select
              name="rate_type"
              value={formData.rate_type || ""}
              onChange={handleInputChange}
            >
              <option value="" disabled>
                Select
              </option>
              <option value="Rate per Qty">Rate per Qty</option>
              <option value="Rate for Weight">Rate for Weight</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="rate">
            <Form.Label><b>Rate</b></Form.Label>
            <Form.Control
              type="number"
              name="rate"
              value={formData.rate || ""}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="amount">
            <Form.Label><b>Amount</b></Form.Label>
            <Form.Control
              type="number"
              name="amount"
              value={formData.amount || ""}
              readOnly
            />
          </Form.Group>
        </Col>
      </Row>
      <div className="text-end mt-3">
        <Button variant="secondary" onClick={onClose} className="me-2">
          Cancel
        </Button>
        <Button type="submit" variant="primary" style={{    backgroundColor: 'rgb(163, 110, 41)',
    borderColor: 'rgb(163, 110, 41)'}}>
          Update
        </Button>
      </div>
    </Form>
  );
};

export default EditRepairForm;
