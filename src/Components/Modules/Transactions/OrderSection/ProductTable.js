import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { FaEdit, FaTrash } from "react-icons/fa";
import "./ProductTable.css";

const ProductTable = ({ orderDetails, onDelete, onEdit }) => {
  const taxableAmount = orderDetails.reduce((sum, item) => {
    const stonePrice = parseFloat(item.stone_price) || 0;
    const makingCharges = parseFloat(item.making_charges) || 0;
    const rateAmt = parseFloat(item.rate_amt) || 0;
    return sum + stonePrice + makingCharges + rateAmt;
  }, 0);
  const taxAmount = orderDetails.reduce((sum, item) => sum + parseFloat(item.tax_amt || 0), 0);
  const netAmount = taxableAmount + taxAmount;

  return (
    <div style={{ maxHeight: "200px", overflowY: "auto", position: "relative" }}>
    <Table className='dataTable_headerCell2' bordered hover responsive>
    <thead style={{ position: "sticky", top: 0, background: "white", zIndex: 2 }}>
        <tr style={{fontSize:"13px"}}>
          {/* <th>Date</th> */}
          {/* <th>Invoice Number</th> */}
          <th>Product Name</th>
          <th>Metal</th>
          <th>Design Name</th>
          <th>Purity</th>
          <th>Gr Wt</th>
          <th>St Wt</th>
          <th>St Pr</th>
          {/* <th>Wt BW</th> */}
          {/* <th>Wastage On</th> */}
          <th>VA%</th>
          {/* <th>Wastage Weight</th> */}
          <th>Total Wt</th>
          <th>Rate</th>
          {/* <th>MC On</th>
          <th>MC Per Gram</th> */}
          <th>MC</th>
          {/* <th>Discount %</th> */}
          <th>Discount</th>
          
          {/* <th>Rate Amount</th> */}
          {/* <th>Tax %</th> */}
          <th>Tax Amt</th>
          <th>Total Price</th>
          <th>image</th>
          <th>Actions</th> {/* Add Action column for delete */}
        </tr>
      </thead>
      <tbody style={{ fontSize: "13px" }}>
        {orderDetails.length > 0 ? (
          orderDetails.map((detail, index) => (
            <tr key={index}>
              {/* <td>{detail.date}</td> */}
              {/* <td>{detail.order_number}</td> */}
              <td>{detail.product_name}</td>
              <td>{detail.metal_type}</td>
              <td>{detail.design_name}</td>
              <td>{detail.purity}</td>
              <td>{detail.gross_weight}</td>
              <td>{detail.stone_weight}</td>
              <td>{detail.stone_price}</td>
              {/* <td>{detail.weight_bw}</td> */}
              {/* <td>{detail.va_on}</td> */}
              <td>{detail.va_percent}</td>
              {/* <td>{detail.wastage_weight}</td> */}
              <td>{detail.total_weight_av}</td>
              <td>{detail.rate}</td>
              {/* <td>{detail.mc_on}</td>
              <td>{detail.mc_per_gram}</td> */}
              <td>{detail.making_charges}</td>
              {/* <td>{detail.disscount_percentage}</td> */}
              <td>{detail.disscount}</td>
              
              {/* <td>{detail.rate_amt}</td> */}
              {/* <td>{detail.tax_percent}</td> */}
              <td>{detail.tax_amt}</td>
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
              <td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaEdit
                    onClick={() => onEdit(index)}
                    style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue' }}
                  />
                  <FaTrash
                    style={{ cursor: 'pointer', marginLeft: '10px', color: 'red', }}
                    onClick={() => onDelete(index)}
                  />
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="25" className="text-center">
              No data available
            </td>
          </tr>
        )}
      </tbody>
      {/* <tfoot>
        <tr>
          <td colSpan="20" className="text-right">Taxable Amount</td> 
          <td colSpan="5">{taxableAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td colSpan="20" className="text-right">Tax Amount</td> 
          <td colSpan="5">{taxAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td colSpan="20" className="text-right">Net Amount</td> 
          <td colSpan="5">{netAmount.toFixed(2)}</td>
        </tr>
      </tfoot> */}
    </Table>
    </div>
  );
};

export default ProductTable;
