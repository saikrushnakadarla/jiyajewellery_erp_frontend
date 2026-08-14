import React, { useEffect, useState } from "react";
import { Col, Row, Button } from "react-bootstrap";
import InputField from "./../../../Pages/InputField/InputField";
import { Table } from "react-bootstrap";
import axios from "axios"; // Assuming you are using axios for API calls
import baseURL from '../../../../Url/NodeBaseURL';

const PaymentDetails = ({
  invoiceDetails,
  selectedRows,
  setSelectedRows,
  isAllSelected,
  setIsAllSelected,
  resetSaleReturnForm,
  salesTaxableAmount,
  salesTaxAmount,
  salesNetAmount,
  handleCheckout
}) => {

//   const handleCheckout = async () => {
//     if (!invoiceDetails.length || !selectedRows.length) {
//         alert("No invoices selected for sale return.");
//         return;
//     }

//     try {
//         const selectedInvoices = selectedRows.map((rowIndex) => invoiceDetails[rowIndex]);

//         const repairDetailsUpdates = selectedInvoices.map((invoice) => ({
//             id: invoice.id,
//             status: "Sale Returned",
//         }));

//         const openTagsUpdates = selectedInvoices.map((invoice) => ({
//             PCode_BarCode: invoice.code,
//             Status: "Sale Returned",
//         }));

//         const productUpdates = selectedInvoices.map((invoice) => ({
//             product_id: invoice.product_id,
//             qty: invoice.qty,
//             gross_weight: invoice.gross_weight,
//         }));

//         const codesForAvailableEntries = selectedInvoices.map((invoice) => invoice.code);

//         // Execute all API calls in parallel
//         const responses = await Promise.allSettled([
//             axios.post(`${baseURL}/updateRepairDetails`, { updates: repairDetailsUpdates }),
//             axios.post(`${baseURL}/updateOpenTags`, { updates: openTagsUpdates }),
//             axios.post(`${baseURL}/updateProduct`, { updates: productUpdates }),
//             axios.post(`${baseURL}/addAvailableEntry`, { codes: codesForAvailableEntries }),
//         ]);

//         // Check if any API failed
//         const failedRequests = responses.filter(res => res.status === "rejected");
//         if (failedRequests.length > 0) {
//             console.error("Some API calls failed:", failedRequests);
//             alert("Some updates failed. Please check console for details.");
//         } else {
//             alert("Sale Return added Successfully!");
//         }
        
//     } catch (error) {
//         console.error("Error during checkout:", error);
//         alert("An error occurred during checkout. Please try again.");
//     }
// };


  return (
    <div>
      <Col >
        <Row>
          <h4 className="mb-3" style={{fontSize:"20px"}}>Summary</h4>
          <Table bordered hover responsive style={{fontSize:"13px"}}>
            {Array.isArray(invoiceDetails) && invoiceDetails.length > 0 ? (
              <>
                <tr>
                  <td colSpan="20" className="text-right">
                    Taxable Amount
                  </td>
                  <td colSpan="4">{parseFloat(salesTaxableAmount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="20" className="text-right">
                    Tax Amount
                  </td>
                  <td colSpan="4">{parseFloat(salesTaxAmount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="20" className="text-right">Net Amount</td>
                  <td colSpan="4">{parseFloat(salesNetAmount).toFixed(2)}</td>
                </tr>

              </>
            ) : (
              <>
                <tr>
                  <td colSpan="20" className="text-right">
                    Taxable Amount
                  </td>
                  <td colSpan="4">0.00</td>
                </tr>
                <tr>
                  <td colSpan="20" className="text-right">
                    Tax Amount
                  </td>
                  <td colSpan="4">0.00</td>
                </tr>
                <tr>
                  <td colSpan="20" className="text-right">
                    Net Amount
                  </td>
                  <td colSpan="4">0.00</td>
                </tr>
              </>
            )}
          </Table>
        </Row>
        <Row>
          {/* <Col xs={12} md={3}>
            <Button
              onClick={handleCheckout}
              style={{ backgroundColor: "#a36e29", borderColor: "#a36e29" }}
            // disabled={!isSubmitEnabled}
            >
              Add
            </Button>
          </Col> */}
        </Row>
      </Col>
    </div>
  );
};

export default PaymentDetails;
