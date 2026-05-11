import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Col, Row, Button } from "react-bootstrap";
import InputField from "./../../../Pages/InputField/InputField";
import { Table } from "react-bootstrap";
import axios from "axios"; // Assuming you are using axios for API calls
import baseURL from '../../../../Url/NodeBaseURL';

const PaymentDetails = ({
  paymentDetails,
  setPaymentDetails,
  handleSave,
  handleBack,
  repairDetails,
  invoiceDetails,
  selectedRows,
  totalPrice,
  resetForm
}) => {


  // Calculate taxable amount based on selected rows
  const taxableAmount = selectedRows.reduce((sum, rowIndex) => {
    const detail = invoiceDetails[rowIndex];
    const stonePrice = parseFloat(detail.stone_price) || 0;
    const makingCharges = parseFloat(detail.making_charges) || 0;
    const rateAmt = parseFloat(detail.rate_amt) || 0;
    const itemDiscount = parseFloat(detail.disscount) || 0;
    const itemFestivalDiscount = parseFloat(detail.festival_discount) || 0;
    return sum + stonePrice + makingCharges + rateAmt - itemDiscount - itemFestivalDiscount;
  }, 0);

  const taxAmount = selectedRows.reduce((sum, rowIndex) => {
    const detail = invoiceDetails[rowIndex];
    return sum + parseFloat(detail.tax_amt || 0);
  }, 0);

  const netAmount = taxableAmount + taxAmount;

  const navigate = useNavigate();

  const getTabId = () => {
    // First try to get from URL
    const urlParams = new URLSearchParams(window.location.search);
    let tabId = urlParams.get('tabId');
    
    // If not in URL, try sessionStorage
    if (!tabId) {
      tabId = sessionStorage.getItem('tabId');
    }
    
    // If still not found, generate new ID
    if (!tabId) {
      tabId = crypto.randomUUID();
      sessionStorage.setItem('tabId', tabId);
      
      // Update URL without page reload
      const newUrl = `${window.location.pathname}?tabId=${tabId}`;
      window.history.replaceState({}, '', newUrl);
    }
    
    return tabId;
  };

  const tabId = getTabId();

  const handleClose = () => {
    // navigate(`/sales?tabId=${tabId}`);
    navigate(-1);
  };

  const handleCheckout = async () => {
    try {
      const selectedInvoices = selectedRows.map((rowIndex) => invoiceDetails[rowIndex]);
  
      // Prepare data for updating `repair_details`
      const repairDetailsUpdates = selectedInvoices.map((invoice) => ({
        id: invoice.id,
        status: "Sale Returned",
      }));
  
      // Prepare data for updating `open_tags_entry`
      const openTagsUpdates = selectedInvoices.map((invoice) => ({
        PCode_BarCode: invoice.code,
        Status: "Sale Returned",
      }));
  
      // Prepare data for updating `product` table
      const productUpdates = selectedInvoices.map((invoice) => ({
        product_id: invoice.product_id,
        qty: invoice.qty,
        gross_weight: invoice.gross_weight,
      }));
  
      // Extract codes for adding 'Available' entries
      const codesForAvailableEntries = selectedInvoices.map((invoice) => invoice.code);
  
      // API Calls
      await axios.post(`${baseURL}/updateRepairDetails`, { updates: repairDetailsUpdates });
      await axios.post(`${baseURL}/updateOpenTags`, { updates: openTagsUpdates });
      await axios.post(`${baseURL}/updateProduct`, { updates: productUpdates });
      await axios.post(`${baseURL}/addAvailableEntry`, { codes: codesForAvailableEntries });
  
      alert("Sale Returned Successfully!");
      resetForm();
  
      // Refresh the window
      window.location.reload();
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("An error occurred during checkout. Please try again.");
    }
  };
  
  return (
    <div>
      <Col >
        <Row>
          <h4 className="mb-3">Summary</h4>
          <Table bordered hover responsive>
            {Array.isArray(invoiceDetails) && invoiceDetails.length > 0 ? (
              <>
                <tr>
                  <td colSpan="20" className="text-right">
                    Taxable Amount
                  </td>
                  <td colSpan="4">{taxableAmount}</td>
                </tr>
                <tr>
                  <td colSpan="20" className="text-right">
                    Tax Amount
                  </td>
                  <td colSpan="4">{taxAmount}</td>
                </tr>
                <tr>
                  <td colSpan="20" className="text-right">
                    Net Amount
                  </td>
                  <td colSpan="4">{netAmount}</td>
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
          <Col xs={12} md={3}>
            <Button
              onClick={handleCheckout}
              style={{ backgroundColor: "#a36e29", borderColor: "#a36e29" }}
              // disabled={!isSubmitEnabled}
            >
              Save
            </Button>
            <Button
              onClick={handleClose}
              style={{ backgroundColor: "gray", borderColor: "gray" , marginLeft:"5px"}}
              // disabled={!isSubmitEnabled}
            >
              Close
            </Button>
          </Col>
          {/* <Col xs={12} md={2}>
            <Button
              type="button"
              className="cus-back-btn"
              variant="secondary"
              onClick={handleBack}
              style={{ backgroundColor: "gray", marginLeft: "-280px" }}
            >
              Cancel
            </Button>
          </Col> */}
        </Row>
      </Col>
    </div>
  );
};

export default PaymentDetails;
