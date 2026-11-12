import React from "react";
import { Nav } from "react-bootstrap";

const AssignmentModeTabs = ({ mode, onChange }) => {
  const tabStyle = (active) => ({
    color: active ? "#fff" : "#a36e29",
    backgroundColor: active ? "#a36e29" : "transparent",
    fontWeight: 600,
    fontSize: "14px",
  });

  return (
    <Nav
      variant="tabs"
      className="justify-content-center"
      activeKey={mode}
      onSelect={(key) => key && onChange(key)}
      style={{ marginBottom: "12px" }}
    >
      <Nav.Item>
        <Nav.Link eventKey="direct" style={tabStyle(mode === "direct")}>
          Without Delivery Agent
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="agent" style={tabStyle(mode === "agent")}>
          With Logistic Partner
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
};

export default AssignmentModeTabs;