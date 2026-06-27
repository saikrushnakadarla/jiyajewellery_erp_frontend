import React from "react";
import { Col, Row, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PaymentDetails = ({
  handleSave,
  handleBack,
}) => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/receive-from-salesman");
  };

  return (
    <div>
      <Col className="sales-form-section">
        <Row className="justify-content-end">
          <Col xs="auto">
            <Button
              onClick={handleSave}
              style={{
                backgroundColor: "#a36e29",
                borderColor: "#a36e29",
                fontSize: "14px",
                padding: "8px 20px",
                marginRight: "10px",
              }}
            >
              Save
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant="secondary"
              onClick={handleBack}
              style={{
                backgroundColor: "gray",
                fontSize: "14px",
                padding: "8px 20px",
                marginRight: "10px",
              }}
            >
              Cancel
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              onClick={handleClose}
              style={{
                backgroundColor: "gray",
                borderColor: "gray",
                padding: "8px 20px",
                fontSize: "14px",
              }}
            >
              Close
            </Button>
          </Col>
        </Row>
      </Col>
    </div>
  );
};

export default PaymentDetails;