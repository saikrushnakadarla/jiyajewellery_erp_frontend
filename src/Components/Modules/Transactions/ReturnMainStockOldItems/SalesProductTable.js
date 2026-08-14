import React, { useState } from "react";
import { Table, Button } from "react-bootstrap";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const ProductTable = ({
  repairDetails,
  onDelete,
  onEdit,
  invoiceDetails,
  uniqueInvoice,
  filteredInvoices,
  selectedRows,
  isAllSelected,
  handleCheckboxChange,
  handleSelectAllChange,
}) => {
  console.log("invoiceDetails=", invoiceDetails)
  const taxableAmount = repairDetails.reduce((sum, item) => {
    const stonePrice = parseFloat(item.stone_price) || 0;
    const makingCharges = parseFloat(item.making_charges) || 0;
    const rateAmt = parseFloat(item.rate_amt) || 0;
    return sum + stonePrice + makingCharges + rateAmt;
  }, 0);

  const taxAmount = repairDetails.reduce(
    (sum, item) => sum + parseFloat(item.tax_amt || 0),
    0
  );
  const netAmount = taxableAmount + taxAmount;

  return (
    <Table striped bordered hover>
      <thead>
        <tr style={{fontSize:"13px"}}>
          <th>
            <input
              type="checkbox"
              checked={isAllSelected} // If all rows are selected, "Check All" will be checked
              onChange={handleSelectAllChange} // Handle "Check All" toggle
            />
          </th>
          <th>Date</th>
          <th>Invoice</th>
          <th>Code</th>
          <th>Product Name</th>
          {/* <th>Metal Type</th> */}
          <th>Gross Wt</th>
          <th>Total Wt</th>
          <th>Rate</th>
          {/* <th>Tax %</th> */}
          <th>Tax Amount</th>
          <th>Total Price</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(invoiceDetails) && invoiceDetails.length > 0 ? (
          invoiceDetails.map((detail, index) => (
            <tr key={index} style={{fontSize:"12px"}}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(index)} // Check if this row is selected
                  onChange={(event) => handleCheckboxChange(event, index)} // Handle checkbox change
                />
              </td>
              <td>{new Date(detail.date).toLocaleDateString('en-GB')}</td>

              <td>{detail.invoice_number}</td>
              <td>{detail.code}</td>
              <td>{detail.product_name}</td>
              <td>{detail.gross_weight}</td>
              <td>{detail.total_weight_av}</td>
              <td>{detail.rate}</td>
              {/* <td>{detail.tax_percent}</td> */}
              <td>{detail.tax_amt}</td>
              <td>{detail.total_price}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="12" className="text-center" style={{fontSize:"13px"}}>
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default ProductTable;
