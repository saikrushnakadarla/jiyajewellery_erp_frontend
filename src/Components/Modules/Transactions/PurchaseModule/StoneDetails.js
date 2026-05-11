import React from 'react';
import { Col, Row } from 'react-bootstrap';
import InputField from '../../../Pages/InputField/InputField';
import { Button} from "react-bootstrap";

const StoneDetails = () => {
  return (
   
      <Row>
        <Col xs={12} md={2}>
          <InputField label="Stone" />
        </Col>
        <Col xs={12} md={1}>
          <InputField label="PCs" type="number" />
        </Col>
        <Col xs={12} md={1}>
          <InputField label="CT" type="number" />
        </Col>
        <Col xs={12} md={1}>
          <InputField label="Gms" type="number" />
        </Col>
        <Col xs={12} md={1}>
          <InputField label="CWP" />
        </Col>
        <Col xs={12} md={1}>
          <InputField label="Rate" type="number" />
        </Col>
        <Col xs={12} md={1}>
          <InputField label="Clear" />
        </Col>
        <Col xs={12} md={1}>
          <InputField label="Class" />
        </Col>
        <Col xs={12} md={1}>
          <InputField label="Cut" />
        </Col>
        <Col xs={12} md={1}>
          <InputField label="Clarity" />
        </Col>
        <Col xs={12} md={1}>
          <Button style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>Add</Button>
        </Col>
      </Row>
   
  );
};

export default StoneDetails;