import React, { useEffect, useState } from "react";
import { Col, Row, Button, Table, Modal } from "react-bootstrap";
import InputField from "./InputfieldSales";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import baseURL from "../../../../Url/NodeBaseURL";

const PaymentDetails = ({
  paymentDetails,
  setPaymentDetails,
  handleSave,
  handleBack,
  repairDetails,
  setRepairDetails,
  totalPrice,
  schemeSalesData,
  oldSalesData,
  taxableAmount,
  discountAmt,
  totalAmount,
  taxAmount,
  oldItemsAmount,
  schemeAmount,
  netPayableAmount,
  netAmount,
  salesNetAmount,
  salesTaxableAmount,
  salesAmountToPass,
  updatedOldItemsAmount,
  netPayAmount,
  discount,
  handleDiscountChange,
  refreshSalesData,
  offers,
  loading,
  festivalShowModal,
  handleFestivalShowModal,
  handleFestivalCloseModal,
  appliedOffers,
  setAppliedOffers,
  festivalDiscountAmt,
  handleApply,
  isAnyOfferApplied,
  tabId,
  manualNetAmount,
  setManualNetAmount,
  handleManualNetAmountChange,
  isManualNetMode,
  setIsManualNetMode,
  handleManualNetPayAmountChange,
  manualNetPayAmount,
  selectedAdvanceReceiptAmount,
}) => {
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const location = useLocation();
  const [appliedOfferKey, setAppliedOfferKey] = useState(null);
  const navigate = useNavigate();

  let rounded = Math.round(netPayableAmount);

  useEffect(() => {
    const storedPaymentDetails =
      JSON.parse(localStorage.getItem(`paymentDetails_${tabId}`)) || {};

    const cashAmount =
      location.state?.cash_amount ??
      storedPaymentDetails.cash_amount ??
      rounded;

    const cardAmt =
      location.state?.card_amt ?? storedPaymentDetails.card_amt ?? 0;

    const chqAmt = location.state?.chq_amt ?? storedPaymentDetails.chq_amt ?? 0;

    const onlineAmt =
      location.state?.online_amt ?? storedPaymentDetails.online_amt ?? 0;

    setPaymentDetails({
      cash_amount: cashAmount,
      card_amt: cardAmt,
      chq_amt: chqAmt,
      online_amt: onlineAmt,
    });
  }, [location.state, rounded, tabId]);

  useEffect(() => {
    if (rounded && location.state?.cash_amount === undefined) {
      setPaymentDetails((prev) => {
        const updatedDetails = {
          ...prev,
          cash_amount: parseFloat(rounded).toFixed(2),
        };
        localStorage.setItem(
          `paymentDetails_${tabId}`,
          JSON.stringify(updatedDetails),
        );
        return updatedDetails;
      });
    }
  }, [rounded, location.state, tabId]);

  useEffect(() => {
    const totalEnteredAmount =
      parseFloat(paymentDetails.cash_amount || 0) +
      parseFloat(paymentDetails.card_amt || 0) +
      parseFloat(paymentDetails.chq_amt || 0) +
      parseFloat(paymentDetails.online_amt || 0);

    const tolerance = 0.01;

    setIsSubmitEnabled(
      Math.abs(totalEnteredAmount - parseFloat(totalPrice || 0)) < tolerance,
    );
  }, [paymentDetails, totalPrice]);

  const handlePaymentChange = (field, value) => {
    const newValue = parseFloat(value) || 0;

    const totalAmount =
      (field === "cash_amount"
        ? newValue
        : parseFloat(paymentDetails.cash_amount || 0)) +
      (field === "card_amt"
        ? newValue
        : parseFloat(paymentDetails.card_amt || 0)) +
      (field === "chq_amt"
        ? newValue
        : parseFloat(paymentDetails.chq_amt || 0)) +
      (field === "online_amt"
        ? newValue
        : parseFloat(paymentDetails.online_amt || 0));

    if (totalAmount > rounded) {
      alert("Total payment amount cannot exceed Net Payable Amount.");
      return;
    }

    const updatedDetails = { ...paymentDetails, [field]: newValue };
    setPaymentDetails(updatedDetails);
    localStorage.setItem(
      `paymentDetails_${tabId}`,
      JSON.stringify(updatedDetails),
    );
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <>
      <div>
        <Col className="sales-form-section">
          <Row>
            <h4 className="mb-3" style={{ fontSize: "18px" }}>
              Payment Details
            </h4>
            <Col xs={12} md={4}>
              <InputField
                label="Cash Amt"
                name="cash_amount"
                value={paymentDetails.cash_amount}
                onChange={(e) =>
                  handlePaymentChange("cash_amount", e.target.value)
                }
              />
            </Col>
            <Col xs={12} md={4}>
              <InputField
                label="Card Amt"
                name="card_amt"
                value={paymentDetails.card_amt}
                onChange={(e) =>
                  handlePaymentChange("card_amt", e.target.value)
                }
              />
            </Col>
            <Col xs={12} md={4}>
              <InputField
                label="Cheque Amt"
                name="chq_amt"
                value={paymentDetails.chq_amt}
                onChange={(e) => handlePaymentChange("chq_amt", e.target.value)}
              />
            </Col>
            <Col xs={12} md={4}>
              <InputField
                label="Online Amt"
                name="online_amt"
                value={paymentDetails.online_amt}
                onChange={(e) =>
                  handlePaymentChange("online_amt", e.target.value)
                }
              />
            </Col>
            <Col xs={12} md={3}>
              <Button
                onClick={handleSave}
                style={{
                  backgroundColor: "#a36e29",
                  borderColor: "#a36e29",
                  fontSize: "14px",
                  marginTop: "3px",
                  padding: "4px 8px",
                }}
              >
                Save
              </Button>
            </Col>
            <Col xs={12} md={2}>
              <Button
                variant="secondary"
                onClick={handleBack}
                style={{
                  backgroundColor: "gray",
                  marginLeft: "-62px",
                  fontSize: "14px",
                  marginTop: "3px",
                  padding: "4px 8px",
                }}
              >
                Cancel
              </Button>
            </Col>
            <Col xs={12} md={2}>
              <Button
                onClick={handleClose}
                style={{
                  backgroundColor: "gray",
                  borderColor: "gray",
                  marginLeft: "-57px",
                  marginTop: "px",
                  padding: "4px 10px",
                  fontSize: "14px",
                }}
              >
                Close
              </Button>
            </Col>
          </Row>
        </Col>
      </div>

      <Modal
        show={festivalShowModal}
        onHide={handleFestivalCloseModal}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Available Offers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <p>Loading offers...</p>
          ) : offers.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>S No</th>
                  <th>Offer Name</th>
                  <th>Discount On Rate</th>
                  <th>Discount % on MC</th>
                  <th>Discount % for Fixed</th>
                  <th>Valid From</th>
                  <th>Valid To</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer, index) => {
                  const offerKey = `${offer._id}_${index}`;
                  const isApplied = appliedOffers[offerKey] || false;

                  const formatDate = (dateStr) => {
                    const date = new Date(dateStr);
                    return `${date.getDate().toString().padStart(2, "0")}-${(
                      date.getMonth() + 1
                    )
                      .toString()
                      .padStart(2, "0")}-${date.getFullYear()}`;
                  };

                  return (
                    <tr key={offer._id}>
                      <td>{index + 1}</td>
                      <td>{offer.offer_name}</td>
                      <td>{offer.discount_on_rate}</td>
                      <td>{offer.discount_percentage}</td>
                      <td>{offer.discount_percent_fixed}</td>
                      <td>{formatDate(offer.valid_from)}</td>
                      <td>{formatDate(offer.valid_to)}</td>
                      <td>
                        <Button
                          variant={isApplied ? "danger" : "success"}
                          size="sm"
                          onClick={() => handleApply(offer, index)}
                        >
                          {isApplied ? "Unapply" : "Apply"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <p>No offers available at the moment.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFestivalCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PaymentDetails;