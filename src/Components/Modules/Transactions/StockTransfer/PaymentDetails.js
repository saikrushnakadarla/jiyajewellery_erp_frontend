import React from "react";
import { Row, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PaymentDetails = ({
  handleSave,
  handleBack,
}) => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/stock-transfer");
  };

  return (
    <div>
      <div className="sales-form-section">
        {/* Added gap-3 for even spacing, removed Col wrappers */}
        <Row className="justify-content-end gap-3 m-0">
          <Button
            onClick={handleSave}
            style={{
              backgroundColor: "#a36e29",
              borderColor: "#a36e29",
              fontSize: "14px",
              padding: "8px 20px",
              width: "auto", // Ensures button doesn't stretch
            }}
          >
            Save
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleBack}
            style={{
              backgroundColor: "gray",
              borderColor: "gray",
              fontSize: "14px",
              padding: "8px 20px",
              width: "auto",
            }}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleClose}
            style={{
              backgroundColor: "gray",
              borderColor: "gray",
              padding: "8px 20px",
              fontSize: "14px",
              width: "auto",
            }}
          >
            Close
          </Button>
        </Row>
      </div>
    </div>
  );
};

export default PaymentDetails;