import React from "react";
import { Button } from "react-bootstrap";

const AgentSummaryBar = ({ formData, onChangeAgent }) => {
  const agent = formData.delivery_agent_details;
  if (!agent) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px",
        padding: "8px 14px",
        marginBottom: "10px",
        border: "1px solid #e0cfae",
        borderRadius: "8px",
        backgroundColor: "#fffaf2",
        fontSize: "13px",
      }}
    >
      <div>
        <strong style={{ color: "#a36e29" }}>Delivery Agent:</strong>{" "}
        {agent.full_name} ({agent.agent_code}) &nbsp;|&nbsp; {agent.mobile_number}
      </div>
      <Button
        size="sm"
        variant="outline-secondary"
        onClick={onChangeAgent}
        style={{ fontSize: "12px", padding: "2px 12px" }}
      >
        Change Agent
      </Button>
    </div>
  );
};

export default AgentSummaryBar;