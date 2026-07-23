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
              title={isSaveDisabled ? "Please add ALL products from the stock transfer first" : "Save"}
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
        {/* Show validation message below buttons */}
        {!isAllProductsSelected && selectedTransferItems?.length > 0 && (
          <Row className="mt-2">
            <Col>
              <div style={{ 
                color: "#856404", 
                backgroundColor: "#fff3cd", 
                padding: "8px 12px", 
                borderRadius: "4px",
                fontSize: "13px",
                border: "1px solid #ffc107"
              }}>
                <strong>⚠️ Note:</strong> You must add <strong>ALL</strong> products from the stock transfer before saving.
                {repairDetails?.length > 0 && selectedTransferItems?.length > 0 && (
                  <span> Added: {repairDetails.length} of {selectedTransferItems.length} products.</span>
                )}
                {(!repairDetails || repairDetails.length === 0) && (
                  <span> Please add products first.</span>
                )}
              </div>
            </Col>
          </Row>
        )}
      </Col>
    </div>
  );
};

export default PaymentDetails;