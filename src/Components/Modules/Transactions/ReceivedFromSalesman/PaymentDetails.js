import React from "react";
import { Col, Row, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PaymentDetails = ({
  handleSave,
  handleBack,
  // ===== NEW: Weight validation props =====
  capturedWeights = {},
  requireWeightForAll = false,
  repairDetails = [],
  // ===== BAG WEIGHT MATCH PROPS =====
  assignedCaptureWeight = 0,
  receivedCaptureWeightOfBag = 0,
  weightsMatch = false,
}) => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/receive-from-salesman");
  };

  // Check if any weight has been captured (for the entire batch)
  // FIX: Use item.item_id || item.code as the canonical key
  const hasTotalWeightCaptured = () => {
    if (!requireWeightForAll || repairDetails.length === 0) return true;
    
    const allKeys = Object.keys(capturedWeights);
    if (allKeys.length === 0) return false;
    
    return allKeys.some(key => capturedWeights[key] && capturedWeights[key].total_grams > 0);
  };

  // Check if any item has direct weight_machine_reading
  const hasAnyItemWithDirectWeight = () => {
    return repairDetails.some(item => 
      item.weight_machine_reading && parseFloat(item.weight_machine_reading) > 0
    );
  };

  // Combined check: has any weight been captured
  const hasAnyWeightCaptured = () => {
    if (!requireWeightForAll || repairDetails.length === 0) return true;
    return hasTotalWeightCaptured() || hasAnyItemWithDirectWeight();
  };

  // Determine if Save should be disabled - include bag weight match check
  const isSaveDisabled = 
    (requireWeightForAll && !hasAnyWeightCaptured()) ||
    (assignedCaptureWeight > 0 && !weightsMatch);

  const showWeightWarning = requireWeightForAll && !hasAnyWeightCaptured();
  const showBagWeightWarning = assignedCaptureWeight > 0 && !weightsMatch;

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
                (showBagWeightWarning ? "Weight mismatch - please recapture" :
                 "Please capture total weight for all items first") : 
                "Save & Receive"}
            >
              Save & Receive
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
        {showWeightWarning && (
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
                <strong>⚠️ Weight Required:</strong> Please capture total weight for all items before saving.
              </div>
            </Col>
          </Row>
        )}

        {/* ===== Show bag weight mismatch warning ===== */}
        {showBagWeightWarning && (
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
                <strong>⚠️ Weight Mismatch:</strong> Captured weight here ({receivedCaptureWeightOfBag.toFixed(3)}g)
                does not match Assigned Salesman's captured weight ({assignedCaptureWeight.toFixed(3)}g).
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
                <strong>ℹ️ Info:</strong> The products will be received and added to your stock point.
              </div>
            </Col>
          </Row>
        )}

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <Row className="mt-2">
            <Col>
              <div style={{ fontSize: '11px', color: '#666', background: '#f5f5f5', padding: '5px 10px', borderRadius: '4px' }}>
                Debug: repairDetails: {repairDetails.length}, 
                capturedWeights keys: {Object.keys(capturedWeights).join(', ') || 'none'},
                hasWeight: {hasAnyWeightCaptured() ? 'YES' : 'NO'},
                assignedWeight: {assignedCaptureWeight ? assignedCaptureWeight.toFixed(3) : '0'},
                receivedWeight: {receivedCaptureWeightOfBag ? receivedCaptureWeightOfBag.toFixed(3) : '0'},
                weightsMatch: {weightsMatch ? 'YES' : 'NO'},
                disabled: {isSaveDisabled ? 'YES' : 'NO'}
              </div>
            </Col>
          </Row>
        )}
      </Col>
    </div>
  );
};

export default PaymentDetails;