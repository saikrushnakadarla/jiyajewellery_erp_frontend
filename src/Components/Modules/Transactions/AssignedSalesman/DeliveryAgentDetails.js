import React, { useEffect, useState } from "react";
import { Col, Row, Button } from "react-bootstrap";
import axios from "axios";
import InputField from "./../../Transactions/SalesForm/InputfieldSales";
import baseURL from "./../../../../Url/NodeBaseURL";

const Item = ({ label, value, fullWidth = false }) => (
  <div
    style={{
      minWidth: 0, // lets long text wrap inside the cell instead of overlapping
      gridColumn: fullWidth ? "1 / -1" : "auto",
    }}
  >
    <div style={{ fontSize: "11px", color: "#888", lineHeight: 1.3 }}>
      {label}
    </div>
    <div
      style={{
        fontSize: "13px",
        fontWeight: 600,
        color: "#333",
        lineHeight: 1.4,
        overflowWrap: "anywhere",
        wordBreak: "break-word",
      }}
    >
      {value || "-"}
    </div>
  </div>
);

const DeliveryAgentDetails = ({ formData, setFormData, onNext, onCancel }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/delivery-agents`);
        const data = Array.isArray(response.data) ? response.data : [];
        setAgents(
          data.filter((a) => (a.status || "").toLowerCase() === "active")
        );
      } catch (error) {
        console.error("Error fetching delivery agents:", error);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return path.startsWith("/") ? `${baseURL}${path}` : `${baseURL}/${path}`;
  };

  const handleAgentChange = (e) => {
    const value = e.target.value;
    const selected = value
      ? agents.find((a) => String(a.id) === String(value))
      : null;

    setFormData((prev) => ({
      ...prev,
      delivery_agent_id: value,
      delivery_agent_name: selected ? selected.full_name : "",
      delivery_agent_code: selected ? selected.agent_code : "",
      delivery_agent_mobile: selected ? selected.mobile_number : "",
      delivery_agent_details: selected || null,
    }));
  };

  const agentOptions = [
    {
      value: "",
      label: loading
        ? "Loading delivery agents..."
        : agents.length === 0
        ? "No delivery agents available"
        : "Select Delivery Agent",
    },
    ...agents.map((a) => ({ value: String(a.id), label: a.full_name })),
  ];

  const agent = formData.delivery_agent_details;
  const photo = agent ? getImageUrl(agent.profile_photo) : null;

  const fullAddress = agent
    ? [agent.address, agent.city, agent.state, agent.pincode]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <Col className="sales-form-section">
      <Row className="align-items-end">
        <Col xs={12} md={4}>
          <InputField
            label="Delivery Agent *"
            name="delivery_agent_id"
            type="select"
            value={formData.delivery_agent_id || ""}
            onChange={handleAgentChange}
            options={agentOptions}
            required
          />
        </Col>
      </Row>

      {agent && (
        <div
          style={{
            marginTop: "10px",
            padding: "14px 16px",
            border: "1px solid #e0cfae",
            borderRadius: "8px",
            backgroundColor: "#fffaf2",
            display: "flex",
            gap: "18px",
            alignItems: "flex-start",
          }}
        >
          {/* Photo */}
          <div style={{ width: "72px", height: "72px", flexShrink: 0 }}>
            {photo ? (
              <img
                src={photo}
                alt={agent.full_name}
                style={{
                  width: "72px",
                  height: "72px",
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "2px solid #a36e29",
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "#a36e29",
                  color: "#fff",
                  fontSize: "26px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {(agent.full_name || "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Details grid: equal columns, no overlap */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
              gap: "12px 24px",
            }}
          >
            <Item label="Agent Code" value={agent.agent_code} />
            <Item label="Full Name" value={agent.full_name} />
            <Item label="Mobile" value={agent.mobile_number} />
            <Item label="Alternate Number" value={agent.alternate_number} />
            <Item label="Email" value={agent.email} />
            <Item label="Employee Type" value={agent.employee_type} />
            <Item label="Status" value={agent.status} />
            <Item label="Joining Date" value={agent.joining_date} />
            <Item
              label="ID Proof"
              value={
                agent.id_proof_type
                  ? `${agent.id_proof_type} - ${agent.id_proof_number || ""}`
                  : ""
              }
            />
            <Item
              label="Emergency Contact"
              value={
                agent.emergency_contact_name
                  ? `${agent.emergency_contact_name} (${
                      agent.emergency_contact_number || "-"
                    })`
                  : ""
              }
            />
            {/* Address takes the full row so it never squeezes other fields */}
            <Item label="Address" value={fullAddress} fullWidth />
          </div>
        </div>
      )}

      {/* Next / Cancel buttons */}
      <Row className="justify-content-end mt-3">
        {onCancel && (
          <Col xs="auto">
            <Button
              variant="secondary"
              onClick={onCancel}
              style={{
                backgroundColor: "gray",
                borderColor: "gray",
                fontSize: "14px",
                padding: "6px 20px",
              }}
            >
              Cancel
            </Button>
          </Col>
        )}
        {onNext && (
          <Col xs="auto">
            <Button
              onClick={onNext}
              disabled={!formData.delivery_agent_id}
              style={{
                backgroundColor: formData.delivery_agent_id ? "#a36e29" : "#cccccc",
                borderColor: formData.delivery_agent_id ? "#a36e29" : "#cccccc",
                fontSize: "14px",
                padding: "6px 24px",
              }}
            >
              Next
            </Button>
          </Col>
        )}
      </Row>
    </Col>
  );
};

export default DeliveryAgentDetails;