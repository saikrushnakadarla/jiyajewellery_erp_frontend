import React, { useEffect, useState } from "react";
import { Col, Row, Button } from "react-bootstrap";
import axios from "axios";
import InputField from "./../../Transactions/SalesForm/InputfieldSales";
import baseURL from "./../../../../Url/NodeBaseURL";

const Item = ({ label, value, fullWidth = false }) => (
  <div
    style={{
      minWidth: 0,
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

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  return Number.isNaN(n) ? "" : `₹${n.toLocaleString("en-IN")}`;
};

const formatList = (value) => (value ? value.split(",").join(", ") : "");

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
        console.error("Error fetching logistic partners:", error);
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
        ? "Loading logistic partners..."
        : agents.length === 0
        ? "No logistic partners available"
        : "Select Logistic Partner",
    },
    ...agents.map((a) => ({
      value: String(a.id),
      label: a.partner_type ? `${a.full_name} (${a.partner_type})` : a.full_name,
    })),
  ];

  // Prefer the fresh record from the fetched list; fall back to the stored copy
  const agent =
    (formData.delivery_agent_id &&
      agents.find((a) => String(a.id) === String(formData.delivery_agent_id))) ||
    formData.delivery_agent_details ||
    null;

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
            label="Logistic Partner *"
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
          {/* Logo */}
          <div style={{ width: "72px", height: "72px", flexShrink: 0 }}>
            {photo ? (
              <img
                src={photo}
                alt={agent.full_name}
                style={{
                  width: "72px",
                  height: "72px",
                  objectFit: "contain",
                  borderRadius: "8px",
                  border: "2px solid #a36e29",
                  background: "#fff",
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
                  borderRadius: "8px",
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

          {/* Details grid */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
              gap: "12px 24px",
            }}
          >
            <Item label="Partner Code" value={agent.agent_code} />
            <Item label="Partner Name" value={agent.full_name} />
            <Item label="Partner Type" value={agent.partner_type} />
            <Item label="Status" value={agent.status} />
            <Item label="Contact Person" value={agent.contact_person} />
            <Item label="Mobile" value={agent.mobile_number} />
            <Item label="Email" value={agent.email} />
            <Item label="Service Type" value={formatList(agent.service_type)} />
            <Item label="Serviceable Areas" value={agent.serviceable_areas} />
            <Item label="Insurance Available" value={agent.insurance_available} />
            <Item
              label="Max Declared Value"
              value={formatMoney(agent.max_declared_value)}
            />
            <Item label="Address" value={fullAddress} fullWidth />
            <Item
              label="Tracking URL"
              value={agent.tracking_url_template}
              fullWidth
            />
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