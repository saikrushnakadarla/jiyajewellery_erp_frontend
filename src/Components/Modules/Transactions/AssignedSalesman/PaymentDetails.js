import React from "react";
import { Col, Row, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PaymentDetails = ({
  handleSave,
  handleBack,
  isAllProductsSelected,  // <-- NEW: Receive validation state
  selectedTransferItems,   // <-- NEW: For showing count
  repairDetails,          // <-- NEW: For showing count
}) => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/assign-to-salesman");
  };

  // Determine if Save should be disabled
  const isSaveDisabled = !isAllProductsSelected || (selectedTransferItems?.length > 0 && repairDetails?.length === 0);

  return (
    <div>
      <Col className="sales-form-section">
        <Row className="justify-content-end">
          <Col xs="auto">
            <Button
              onClick={handleSave}
              disabled={isSaveDisabled}
              style={{
                backgroundColor: isSaveDisabled ? "#cccccc" : "#a36e29",
                borderColor: isSaveDisabled ? "#cccccc" : "#a36e29",
                fontSize: "14px",
                padding: "8px 20px",
                marginRight: "10px",
                cursor: isSaveDisabled ? "not-allowed" : "pointer",
              }}
              title={isSaveDisabled ? "Please add ALL products from the stock transfer first" : "Save & Send for Approval"}
            >
              Save & Send for Approval
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
        {/* Show info message */}
        {!isSaveDisabled && (
          <Row className="mt-2">
            <Col>
              <div style={{ 
                color: "#0c5460", 
                backgroundColor: "#d1ecf1", 
                padding: "8px 12px", 
                borderRadius: "4px",
                fontSize: "13px",
                border: "1px solid #bee5eb"
              }}>
                <strong>ℹ️ Info:</strong> The assigned salesman will receive a notification to accept or reject this assignment.
              </div>
            </Col>
          </Row>
        )}
      </Col>
    </div>
  );
};

export default PaymentDetails;