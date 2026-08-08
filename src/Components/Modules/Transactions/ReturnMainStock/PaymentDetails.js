import React from "react";
import { Col, Row, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PaymentDetails = ({
  handleSave,
  handleBack,
  // ===== NEW: Weight validation props =====
  capturedWeights = {},
  requireWeightForAll = false,
  repairDetails = []
}) => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/return-to-main-stock");
  };

  // Check if all items have weights captured
  const allItemsHaveWeights = () => {
    if (!requireWeightForAll || repairDetails.length === 0) return true;
    
    return repairDetails.every((item) => {
      const itemId = item.item_id || item.id || item.code;
      return capturedWeights[itemId] && capturedWeights[itemId].total_grams > 0;
    });
  };

  const hasMissingWeights = repairDetails.some((item) => {
    const itemId = item.item_id || item.id || item.code;
    return !capturedWeights[itemId] || capturedWeights[itemId].total_grams <= 0;
  });

  // Determine if Save should be disabled
  const isSaveDisabled = requireWeightForAll && !allItemsHaveWeights();

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
              title={isSaveDisabled ? "Please capture weight for all items first" : "Save & Return to Main Stock"}
            >
              Save & Return to Main Stock
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
        
        {/* ===== Show weight validation message ===== */}
        {requireWeightForAll && hasMissingWeights && (
          <Row className="mt-2">
            <Col>
              <div style={{ 
                color: "#856404", 
                backgroundColor: "#fff3cd", 
                padding: "8px 12px", 
                borderRadius: "4px",
                fontSize: "13px",
                border: "1px solid #ffeeba"
              }}>
                <strong>⚠️ Weight Required:</strong> Please capture weight for all items before saving.
                <span style={{ marginLeft: '10px' }}>
                  ({repairDetails.filter((item) => {
                    const itemId = item.item_id || item.id || item.code;
                    return !capturedWeights[itemId] || capturedWeights[itemId].total_grams <= 0;
                  }).length} items pending)
                </span>
              </div>
            </Col>
          </Row>
        )}
      </Col>
    </div>
  );
};

export default PaymentDetails;