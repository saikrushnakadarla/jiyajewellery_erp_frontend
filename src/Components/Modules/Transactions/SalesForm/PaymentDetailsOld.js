import React, { useEffect, useState } from 'react';
import { Col, Row, Button, Table } from 'react-bootstrap';
import InputField from './../../../Pages/InputField/InputField';

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
  netPayableAmount,
  netAmount, // Assuming total price is passed as a prop
  repairDetails, // Pass repairDetails as a prop
  setRepairDetails // Pass setRepairDetails function to update the state
}) => {
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [discount, setDiscount] = useState(); // State for discount input field

  // Calculate total entered amount
  useEffect(() => {
    const totalEnteredAmount =
      parseFloat(paymentDetails.cash_amount || 0) +
      parseFloat(paymentDetails.card_amt || 0) +
      parseFloat(paymentDetails.chq_amt || 0) +
      parseFloat(paymentDetails.online_amt || 0);

    const tolerance = 0.01;

    setIsSubmitEnabled(Math.abs(totalEnteredAmount - parseFloat(totalPrice || 0)) < tolerance);
  }, [paymentDetails, totalPrice]);

  const handleDiscountChange = (e) => {
    const value = e.target.value;
  
    if (value === '') {
      setDiscount('');
      localStorage.removeItem('discount'); // Clear discount only when user clears it
  
      const updatedRepairDetails = repairDetails.map((detail) => ({
        ...detail,
        disscount: '0.00',
        total_price: parseFloat(detail.original_total_price).toFixed(2),
      }));
  
      setRepairDetails(updatedRepairDetails);
    } else {
      setDiscount(value);
      localStorage.setItem('discount', value); // Save discount in localStorage
  
      const updatedRepairDetails = repairDetails.map((detail) => {
        const makingCharges = parseFloat(detail.making_charges) || 0;
        const discountAmount = (parseFloat(value) / 100) * makingCharges;
        const newTotalPrice = parseFloat(detail.original_total_price) - discountAmount;
  
        return {
          ...detail,
          disscount: discountAmount.toFixed(2),
          total_price: newTotalPrice.toFixed(2),
        };
      });
  
      setRepairDetails(updatedRepairDetails);
    }
  };
  

  useEffect(() => {
    const updatedRepairDetails = repairDetails.map((detail) => {
      if (!detail.original_total_price) {
        return {
          ...detail,
          original_total_price: detail.total_price, // Save original total price if not already saved
        };
      }
      return detail;
    });
  
    setRepairDetails(updatedRepairDetails);
  }, [repairDetails]);
  
  

  return (
    <div>
      <Col className="sales-form-section">
        <Row>
          <h4 className="mb-3">Summary</h4>
          <Table bordered hover responsive>
            <tr>
              <td colSpan="16" className="text-right">Total Amount</td>
              <td colSpan="4">{totalAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="12" className="text-right">Discount Amount</td>
              <td colSpan="4">  @
                <input
                  type="number"
                  value={discount}
                  onChange={handleDiscountChange}
                  style={{ width: '80px', padding: '5px' }}
                />
              </td>
              <td colSpan="4">
                {discountAmt.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td colSpan="16" className="text-right">Taxable Amount</td>
              <td colSpan="4">{taxableAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="16" className="text-right">Tax Amount</td>
              <td colSpan="4">{taxAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="16" className="text-right">Net Amount</td>
              <td colSpan="4">{netAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="16" className="text-right">Old Items Amount</td>
              <td colSpan="4">{oldItemsAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="16" className="text-right">Scheme Amount</td>
              <td colSpan="4">{schemeAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="16" className="text-right">Net Payable Amount</td>
              <td colSpan="4">{netPayableAmount.toFixed(2)}</td>
            </tr>
          </Table>
        </Row>
      </Col>

      <Col className="sales-form-section">
        <Row>
          <h4 className="mb-3">Payment Details</h4>
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
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
            >
              Save
            </Button>
          </Col>
          <Col xs={12} md={2}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              style={{ backgroundColor: 'gray', marginLeft: '-50px' }}
            >
              Cancel
            </Button>
          </Col>
        </Row>
      </Col>
    </div>
  );
};

export default PaymentDetails;
