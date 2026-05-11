import React, { useState } from 'react';
import { Table, Button, Modal, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import "./ProductTable.css";

const ProductTable = ({ repairDetails, onDelete, onEdit }) => {
  console.log("repairDetails=", repairDetails)
  const taxableAmount = repairDetails.reduce((sum, item) => {
    const stonePrice = parseFloat(item.stone_price) || 0;
    const makingCharges = parseFloat(item.making_charges) || 0;
    const rateAmt = parseFloat(item.rate_amt) || 0;
    return sum + stonePrice + makingCharges + rateAmt;
  }, 0);
  const taxAmount = repairDetails.reduce((sum, item) => sum + parseFloat(item.tax_amt || 0), 0);
  const netAmount = taxableAmount + taxAmount;

  const [showModal, setShowModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const handleView = (detail) => {
    setSelectedDetail(detail);
    setShowModal(true);
  };

  return (

    // <div style={{ maxHeight: "107px", overflowY: "auto", position: "relative" }}>
    <div >
      <Table className='dataTable_headerCell1' bordered hover responsive>
        <thead style={{ position: "sticky", top: 0, background: "white", zIndex: 2, fontSize: "13px" }}>
          <tr>
            <th>S No</th>
            <th>BarCode</th>
            {/* <th>Invoice Number</th> */}
            <th>Product Name</th>
            <th>Metal</th>
            <th>Purity</th>
            <th>Gr Wt</th>
            <th>St Wt</th>
            <th>VA%</th>
            <th>Total Wt</th>
            <th>Rate</th>
            <th>MC</th>
            <th>Discount</th>
            <th>Fest Discount</th>
            {/* <th>Tax %</th>
            <th>Tax Amt</th> */}
            <th>Total Price</th>
            <th>Image</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {repairDetails.length > 0 ? (
            repairDetails.map((detail, index) => (
              <tr key={index} className='table-values-sales'>
                <td>{index + 1}</td>
                <td>{detail.code}</td>
                {/* <td>{detail.invoice_number}</td> */}
                <td>{detail.product_name}</td>
                <td>{detail.metal_type}</td>
                {/* <td>{detail.pricing === 'By Weight' ? detail.selling_purity : detail.printing_purity}</td> */}
                <td>
                  {detail.pricing === 'By Weight'
                    ? (detail.selling_purity !== undefined && detail.selling_purity !== '' ? detail.selling_purity : detail.purity)
                    : (detail.printing_purity !== undefined && detail.printing_purity !== '' ? detail.printing_purity : detail.purity)}
                </td>
                <td>{detail.gross_weight}</td>
                <td>{detail.stone_weight}</td>
                <td>{detail.va_percent}</td>
                <td>{detail.total_weight_av}</td>
                <td>{detail.pieace_cost ? detail.pieace_cost : detail.rate}</td>
                <td>{detail.making_charges}</td>
                <td>{detail.disscount}</td>
                <td>{detail.festival_discount}</td>
                {/* <td>{detail.tax_percent}</td>
                <td>{detail.tax_amt}</td> */}
                <td>{detail.total_price}</td>
                <td>
                  {detail.imagePreview ? (
                    <img
                      src={detail.imagePreview}
                      alt="Uploaded"
                      style={{ width: "50px", height: "50px" }}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td style={{ color: detail.sale_status === "Delivered" ? "green" : "red" }}>
                  {detail.sale_status}
                </td>

                <td>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <FaEye
                      onClick={() => handleView(detail)}
                      style={{ cursor: 'pointer', marginLeft: '10px', color: 'green' }}
                    />
                    <FaEdit
                      onClick={() => {
                        onEdit(index);
                        setTimeout(() => onEdit(index), 1);
                      }}
                      style={{ cursor: "pointer", marginLeft: "10px", color: "blue" }}
                    />
                    <FaTrash
                      style={{ cursor: "pointer", marginLeft: "10px", color: "red" }}
                      onClick={() => onDelete(index)}
                    />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="19 " className="text-center">
                No data available
              </td>
            </tr>
          )}
        </tbody>
        {repairDetails.length > 0 && (
          <tfoot style={{ fontSize: "12px" }}>
            <tr style={{ fontWeight: 'bold', background: '#f8f9fa' }}>
              <td>{repairDetails.length}</td>
              <td colSpan="4"></td>
              <td>
                {repairDetails.reduce((sum, item) => sum + parseFloat(item.gross_weight || 0), 0).toFixed(3)}
              </td>
              <td>    {repairDetails.reduce((sum, item) => sum + parseFloat(item.stone_weight || 0), 0).toFixed(3)}</td>
              <td></td>
              <td>
                {repairDetails.reduce((sum, item) => sum + parseFloat(item.total_weight_av || 0), 0).toFixed(3)}
              </td>
              <td colSpan="10"></td>
            </tr>
          </tfoot>
        )}
      </Table>
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Product Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDetail && (
            <Row>
              <Col md={4}>
                <p><strong>BarCode:</strong> {selectedDetail.code}</p>
                <p><strong>Metal:</strong> {selectedDetail.metal_type}</p>
                <p><strong>Pricing:</strong> {selectedDetail.pricing}</p>
                <p><strong>Weight BW:</strong> {selectedDetail.weight_bw}</p>
                <p><strong>VA%:</strong> {selectedDetail.va_percent}</p>
                <p><strong>Rate:</strong> {selectedDetail.rate}</p>
                <p><strong>MC %:</strong> {selectedDetail.mc_per_gram}</p>
                <p><strong>Discount %:</strong> {selectedDetail.disscount_percentage}</p>
                <p><strong>Tax Amount:</strong> {selectedDetail.tax_amt}</p>
              </Col>
              <Col md={4}>
                <p><strong>Category:</strong> {selectedDetail.category}</p>
                <p><strong>Design Name:</strong> {selectedDetail.design_name}</p>
                <p><strong>Gross Weight:</strong> {selectedDetail.gross_weight}</p>
                <p><strong>Stone Price:</strong> {selectedDetail.stone_price}</p>
                <p><strong>Wastage Wt:</strong> {selectedDetail.wastage_weight}</p>
                <p><strong>Metal Amount:</strong> {selectedDetail.rate_amt}</p>
                <p><strong>Total MC:</strong> {selectedDetail.making_charges}</p>
                <p><strong>Discount:</strong> {selectedDetail.disscount}</p>
                <p><strong>Total Price:</strong> {selectedDetail.total_price}</p>
              </Col>
              <Col md={4}>
                <p><strong>Sub Category:</strong> {selectedDetail.product_name}</p>
                <p><strong>Purity:</strong> {selectedDetail.purity}</p>
                <p><strong>Stone Weight:</strong> {selectedDetail.stone_weight}</p>
                <p><strong>Wastage on:</strong> {selectedDetail.va_on}</p>
                <p><strong>Total Weight:</strong> {selectedDetail.total_weight_av}</p>
                <p><strong>MC On:</strong> {selectedDetail.mc_on}</p>
                <p><strong>HM Charges:</strong> {selectedDetail.hm_charges}</p>
                <p><strong>Tax %:</strong> {selectedDetail.tax_percent}</p>
                <p><strong>Remarks:</strong> {selectedDetail.remarks}</p>
              </Col>

              {/* {selectedDetail.imagePreview && (
                <Col md={12} className="text-center">
                  <strong>Image:</strong>
                  <br />
                  <img src={selectedDetail.imagePreview} alt='Uploaded' style={{ width: '100%', height: 'auto' }} />
                </Col>
              )} */}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>


  );
};

export default ProductTable;
