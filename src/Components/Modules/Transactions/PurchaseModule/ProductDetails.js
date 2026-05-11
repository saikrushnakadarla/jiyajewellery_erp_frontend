import React from 'react';
import { Col, Row } from 'react-bootstrap';
import InputField from '../../../Pages/InputField/InputField';

const ProductDetails = ({ product, setProduct, metal, setMetal, purity, setPurity }) => {
  return (
  
       <Row>
        <Col xs={12} md={1}>
        <InputField label="P ID" />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="Product Name "
            type="select"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            options={[
              { value: "PRODUCT1", label: "Product1" },
              { value: "PRODUCT2", label: "Product2" },
              { value: "PRODUCT3", label: "Product3" },
              { value: "PRODUCT4", label: "Product4" },
            ]}
          />
          </Col>
          <Col xs={12} md={2}>
          <InputField
            label="Metal Type"
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
          <Col xs={12} md={2}>
          <InputField
            label="Design Name"
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
          <Col xs={12} md={1}>
          <InputField
            label="Purity:"
            type="select"
            value={purity}
            onChange={(e) => setPurity(e.target.value)}
            options={[
              { value: "24K", label: "24K" },
              { value: "22K", label: "22K (916)" },
              { value: "22KHM", label: "22K (916HM)" },
              { value: "18K", label: "18K (750)" },
              { value: "14K", label: "14K (585)" },
              { value: "10K", label: "10K (417)" },
              { value: "9K", label: "9K (375)" },
            ]}
          />
          </Col>          
          <Col xs={12} md={1}>
          <InputField label="HSN" type="text" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="Type" type="text" />
          </Col>
          <Col xs={12} md={2}>
          <InputField label="Stock Type" type="text" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="PCs" type="text" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="Gross" type="number" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="Stone" type="number" />
          </Col> 
          <Col xs={12} md={1}>
          <InputField label="Net" type="number" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="Rate" type="number" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="Unit" type="number" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="W%" type="number" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="Waste" type="number" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="Pure Wt" type="number" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="Alloy" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="Cost" type="number" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="Total Wt" type="number" />
          </Col>
          <Col xs={12} md={2}>
          <InputField label="WT*Rate Amt" type="number" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="MC/Gm" type="number" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="MC" type="number" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="Stn.Amt" type="number" />
          </Col>
          <Col xs={12} md={1}>
          <InputField label="Total" type="number" />
          </Col>
          </Row>
  
  );
};

export default ProductDetails;