import React from "react";
import { Col, Row, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PaymentDetails = ({
  handleSave,
  handleBack,
  isAllProductsSelected,
  selectedTransferItems,
  repairDetails,
  // ===== NEW: Weight validation props =====
  capturedWeights = {},
  requireWeightForAll = false
}) => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/assign-to-salesman");
  };

  // Check if all items have weights captured
  const allItemsHaveWeights = () => {
    if (!requireWeightForAll || repairDetails.length === 0) return true;
    
    return repairDetails.every((item, index) => {
      const itemId = item.item_id || item.id || item.code;
      return capturedWeights[itemId] && capturedWeights[itemId].total_grams > 0;
    });
  };

  const hasMissingWeights = repairDetails.some((item, index) => {
    const itemId = item.item_id || item.id || item.code;
    return !capturedWeights[itemId] || capturedWeights[itemId].total_grams <= 0;
  });

  // Determine if Save should be disabled
  const isSaveDisabled = !isAllProductsSelected || 
    (selectedTransferItems?.length > 0 && repairDetails?.length === 0) ||
    (requireWeightForAll && !allItemsHaveWeights());

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
              title={isSaveDisabled ? 
                (requireWeightForAll && !allItemsHaveWeights() ? 
                  "Please capture weight for all items first" : 
                  "Please add ALL products from the stock transfer first") : 
                "Save & Send for Approval"}
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
                  ({repairDetails.filter((item, index) => {
                    const itemId = item.item_id || item.id || item.code;
                    return !capturedWeights[itemId] || capturedWeights[itemId].total_grams <= 0;
                  }).length} items pending)
                </span>
              </div>
            </Col>
          </Row>
        )}

        {!isSaveDisabled && !requireWeightForAll && (
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