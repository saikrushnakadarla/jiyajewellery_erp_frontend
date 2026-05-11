import React, { useEffect, useState } from 'react';
import { Col, Row, Button, Table } from 'react-bootstrap';
import InputField from './../../Transactions/SalesForm/InputfieldSales';
import { useNavigate } from "react-router-dom";
const PaymentDetails = ({
  paymentDetails,
  setPaymentDetails,
  handleSave,
  handleBack,
  orderDetails,
  totalPrice,
  schemeSalesData,
  oldSalesData,
  taxableAmount,
  totalAmount,
  discountAmt,
  taxAmount,
  oldItemsAmount,
  schemeAmount,
  salesAmountToPass,
  netPayableAmount,
  netAmount,
  discount,
  handleDiscountChange,
  advanceAmount,
  setAdvanceAmount
}) => {
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

  useEffect(() => {
    const totalEnteredAmount =
      parseFloat(paymentDetails.cash_amount || 0) +
      parseFloat(paymentDetails.card_amt || 0) +
      parseFloat(paymentDetails.chq_amt || 0) +
      parseFloat(paymentDetails.online_amt || 0);
    const tolerance = 0.01;
    setIsSubmitEnabled(Math.abs(totalEnteredAmount - parseFloat(totalPrice || 0)) < tolerance);
  }, [paymentDetails, totalPrice]);

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

  const maxAdvanceAmount = netAmount - (schemeAmount + oldItemsAmount + salesAmountToPass);


  return (
    <div>
      <Col className="sales-form-section">
        <Row>
          <h7 className="mb-3">Summary</h7>
          <Table bordered hover responsive>
            <tr style={{ fontSize: "13px" }}>
              <td colSpan="16" className="text-right">Total Amount</td>
              <td colSpan="4">{totalAmount.toFixed(2)}</td>
            </tr>
            <tr style={{ fontSize: "13px" }}>
              <td colSpan="12" className="text-right">Discount Amount</td>
              <td colSpan="4">  @
                <input
                  type="number"
                  value={discount}
                  onChange={handleDiscountChange}
                  style={{ width: '80px', padding: '5px', height: "23px", fontSize: "12px" }}
                />
              </td>
              <td colSpan="4">
                {discountAmt.toFixed(2)}
              </td>
            </tr>



            <tr style={{ fontSize: "13px" }}>
              <td colSpan="16" className="text-right">Taxable Amount</td>
              <td colSpan="4">{taxableAmount.toFixed(2)}</td>
            </tr>
            <tr style={{ fontSize: "13px" }}>
              <td colSpan="16" className="text-right">Tax Amount</td>
              <td colSpan="4">{taxAmount.toFixed(2)}</td>
            </tr>
            <tr style={{ fontSize: "13px" }}>
              <td colSpan="16" className="text-right">Net Amount</td>
              <td colSpan="4">{netAmount.toFixed(2)}</td>
            </tr>
            <tr style={{ fontSize: "13px" }}>
              <td colSpan="16" className="text-right">Old Items Amount</td>
              <td colSpan="4">{oldItemsAmount.toFixed(2)}</td>
            </tr>
            <tr style={{ fontSize: "13px" }}>
              <td colSpan="16" className="text-right">Scheme Amount</td>
              <td colSpan="4">{schemeAmount.toFixed(2)}</td>
            </tr>
            <tr style={{ fontSize: "13px" }}>
              <td colSpan="16" className="text-right" >Sale Return Amount</td>
              {/* <td colSpan="4">{salesNetAmount.toFixed(2)}</td> */}
              <td colSpan="4">{salesAmountToPass.toFixed(2)}</td>
            </tr>
            <tr style={{ fontSize: "13px" }}>
              <td colSpan="16" className="text-right">Advance Amount</td>
              <td colSpan="4">
                <input
                  type="number"
                  value={advanceAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setAdvanceAmount(""); 
                    } else {
                      const numberValue = Number(value);
                      if (numberValue <= maxAdvanceAmount) {
                        setAdvanceAmount(numberValue);
                      } else {
                        alert(`Advance Amount should not exceed ₹${maxAdvanceAmount.toFixed(2)}`);
                        setAdvanceAmount(""); 
                      }
                    }
                  }}
                  style={{ width: '100px', padding: '5px', fontSize: "13px" }}
                  min="0"
                />
              </td>
            </tr>
            <tr style={{ fontSize: "13px" }}>
              <td colSpan="16" className="text-right">Net Payable Amount</td>
              <td colSpan="4">{netPayableAmount.toFixed(2)}</td>
            </tr>
          </Table>
        </Row>
      </Col>

      <Col className="sales-form-section">
        <Row>
          <h6 className="mb-3">Payment Details</h6>
          <Col xs={12} md={4}>
            <InputField
              label="Cash Amt"
              name="cash_amount"
              value={paymentDetails.cash_amount}
              onChange={(e) =>
                setPaymentDetails({ ...paymentDetails, cash_amount: e.target.value })
              }
            />
          </Col>
          <Col xs={12} md={4}>
            <InputField
              label="Card Amt"
              name="card_amt"
              value={paymentDetails.card_amt}
              onChange={(e) =>
                setPaymentDetails({ ...paymentDetails, card_amt: e.target.value })
              }
            />
          </Col>
          <Col xs={12} md={4}>
            <InputField
              label="Cheque Amt"
              name="chq_amt"
              value={paymentDetails.chq_amt}
              onChange={(e) =>
                setPaymentDetails({ ...paymentDetails, chq_amt: e.target.value })
              }
            />
          </Col>
          <Col xs={12} md={4}>
            <InputField
              label="Online Amt"
              name="online_amt"
              value={paymentDetails.online_amt}
              onChange={(e) =>
                setPaymentDetails({ ...paymentDetails, online_amt: e.target.value })
              }
            />
          </Col>
          <Col xs={12} md={3}>
            <Button
              onClick={handleSave}
              style={{
                backgroundColor: '#a36e29', borderColor: '#a36e29', fontSize: "14px",
                marginTop: "3px",
                padding: "4px 8px"
              }}
            >
              Save
            </Button>
          </Col>
          <Col xs={12} md={2}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              style={{
                backgroundColor: 'gray', marginLeft: '-55px', fontSize: "14px",
                marginTop: "3px",
                padding: "4px 8px"
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClose}
              style={{
                backgroundColor: "gray", borderColor: "gray", marginLeft: "16px",
                marginTop: "-57px",
                padding: "4px 10px",
                fontSize: "14px"
              }}
            // disabled={!isSubmitEnabled}
            >
              Close
            </Button>
          </Col>
        </Row>
      </Col>
    </div>
  );
};

export default PaymentDetails;
