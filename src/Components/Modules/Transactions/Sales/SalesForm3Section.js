import React from "react";
import { Col, Row } from "react-bootstrap";
import InputField from "../../../Pages/InputField/InputField"; // Adjust the path as per your project structure.

const SalesFormSection = ({ metal, setMetal }) => {
  return (
    <Col className="sales-form-section">
      <Row>
        <h4 className="mb-3">Old</h4>
        <Col xs={12} md={3}>
          <InputField
            label="Category"
            type="select"
            value={metal}
            onChange={(e) => setMetal(e.target.value)}
            options={[
              { value: "GOLD", label: "Gold" },
              { value: "SILVER", label: "Silver" },
              { value: "PLATINUM", label: "Platinum" },
            ]}
          />
        </Col>
        <Col xs={12} md={4}>
          <InputField label="Item" />
        </Col>
        <Col xs={12} md={3}>
          <InputField label="Dust" />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="Purity"
            type="select"
            value={metal}
            onChange={(e) => setMetal(e.target.value)}
            options={[
              { value: "916HM", label: "916HM" },
              { value: "22k", label: "22k" },
              { value: "18k", label: "18k" },
            ]}
          />
        </Col>
        <Col xs={12} md={2}>
          <InputField label="Touch %" />
        </Col>
        <Col xs={12} md={3}>
          <InputField
            label="Remark"
            type="select"
            value={metal}
            onChange={(e) => setMetal(e.target.value)}
            options={[
              { value: "916HM", label: "916HM" },
              { value: "22k", label: "22k" },
              { value: "18k", label: "18k" },
            ]}
          />
        </Col>
        <Col xs={12} md={3}>
          <InputField label="Rate" />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="HSN"
            type="select"
            value={metal}
            onChange={(e) => setMetal(e.target.value)}
            options={[
              { value: "916HM", label: "916HM" },
              { value: "22k", label: "22k" },
              { value: "18k", label: "18k" },
            ]}
          />
        </Col>
        <Col xs={12} md={2}>
          <InputField label="Amount" />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="Stone"
            type="select"
            value={metal}
            onChange={(e) => setMetal(e.target.value)}
            options={[
              { value: "916HM", label: "916HM" },
              { value: "22k", label: "22k" },
              { value: "18k", label: "18k" },
            ]}
          />
        </Col>
        <Col xs={12} md={1}>
          <InputField label="PCs" />
        </Col>
        <Col xs={12} md={1}>
          <InputField label="CT" />
        </Col>
        <Col xs={12} md={2}>
          <InputField label="R" />
        </Col>
        <Col xs={12} md={2}>
          <InputField label="S.Amt" />
        </Col>
        <Col xs={12} md={1}>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="cashCheckbox"
              value="cash"
            />
            <label className="form-check-label" htmlFor="cashCheckbox">
              Cash
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="hallMarkCheckbox"
              value="hallmark"
            />
            <label className="form-check-label" htmlFor="hallMarkCheckbox">
              HallMark
            </label>
          </div>
        </Col>
      </Row>
    </Col>
  );
};

export default SalesFormSection;
