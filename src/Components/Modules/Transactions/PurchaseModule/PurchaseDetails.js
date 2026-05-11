import React from 'react';
import { Col, Row } from 'react-bootstrap';
import InputField from '../../../Pages/InputField/InputField';

const PurchaseDetails = () => {
  return (
    <Col className="urd-form-section">
      <Row>
        <Col xs={12} md={6}>
          <InputField label="Indent" />
        </Col>
        <Col xs={12} md={6}>
          <InputField label="Bill No" />
        </Col>
        <Col xs={12} md={6}>
          <InputField label="Type" />
        </Col>
        <Col xs={12} md={6}>
          <InputField label="Rate-Cut" />
        </Col>
        <Col xs={12} md={6}>
          <InputField label="Date" 
            type="date" />
        </Col>
        <Col xs={12} md={6}>
          <InputField label="Bill Date" type="date" />
        </Col>
        <Col xs={12} md={6}>
          <InputField label="Due Date" type="date" />
        </Col>
        <Col xs={12} md={6}>
          <InputField label="Rate" />
        </Col>
      </Row>
    </Col>
  );
};

export default PurchaseDetails;