import React, { useState, useEffect } from "react";
import "./Receipts.css";
import InputField from "../../../Pages/InputField/InputField";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import baseURL from "../../../../Url/NodeBaseURL";
import axios from "axios";
import { pdf } from "@react-pdf/renderer";
import PDFContent from "./ReceiptPdf";
import { useParams } from "react-router-dom";

const RepairForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const repairData = location.state?.repairData;
  const { id } = useParams();
  const { invoiceData } = location.state || {};

  const [formData, setFormData] = useState({
    transaction_type: "Receipt",
    date: "",
    mode: "",
    cheque_number: "",
    receipt_no: "",
    account_name: "",
    mobile: "",
    invoice_number: "",
    rate_cut_id: "",
    rate_cut: "",
    total_amt: "",
    total_wt: "",
    discount_amt: "",
    paid_wt: "",
    cash_amt: "",
    bal_wt: "",
    remarks: "",
  });

  const [mobileOptions, setMobileOptions] = useState([]);
  const [accountOptions, setAccountOptions] = useState([]);
  const [repairDetails, setRepairDetails] = useState(null);
  const [invoiceNumberOptions, setInvoiceNumberOptions] = useState([]);
  const [accountData, setAccountData] = useState([]);

  // ✅ RateCut dropdown state (mirrors purchase payment)
  const [rateCuts, setRateCuts] = useState([]);
  const [rateCutIdOptions, setRateCutIdOptions] = useState([]);
  const [selectedRateCut, setSelectedRateCut] = useState(null);

  useEffect(() => {
    if (invoiceData) console.log('Received Invoice Data:', invoiceData);
  }, [invoiceData]);

  // ✅ Fetch last receipt no
  useEffect(() => {
    const fetchLastReceiptNumber = async () => {
      try {
        const response = await axios.get(`${baseURL}/lastReceiptNumber`);
        setFormData((prev) => ({
          ...prev,
          receipt_no: repairData ? repairData.receipt_no : response.data.lastReceiptNumber,
        }));
      } catch (error) {
        console.error("Error fetching receipt number:", error);
      }
    };
    fetchLastReceiptNumber();
  }, [repairData]);

  // ✅ Fetch repair details (unique sales)
  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await axios.get(`${baseURL}/get-unique-repair-details`);
        const filteredData = response.data.filter(
          item => item.transaction_status === 'Sales' || item.transaction_status === "ConvertedInvoice"
        );
        setRepairDetails(filteredData);
      } catch (error) {
        console.error('Error fetching repair details:', error);
      }
    };
    fetchRepairs();
  }, []);

  // ✅ Fetch account names
  useEffect(() => {
    const fetchAccountNames = async () => {
      try {
        const response = await axios.get(`${baseURL}/account-names`);
        setAccountData(response.data);
        setAccountOptions(
          response.data.map(item => ({ value: item.account_name, label: item.account_name }))
        );
        setMobileOptions(
          response.data.map(item => ({ value: item.mobile, label: item.mobile }))
        );
      } catch (error) {
        console.error("Error fetching account names:", error);
      }
    };
    fetchAccountNames();
  }, []);

  // ✅ Fetch ALL sales rateCuts once (mirrors purchase)
  useEffect(() => {
    const fetchRateCuts = async () => {
      try {
        const response = await axios.get(`${baseURL}/sales-rateCuts`);
        setRateCuts(response.data || []);
      } catch (error) {
        console.error("Error fetching rateCuts:", error);
      }
    };
    fetchRateCuts();
  }, []);

  // ✅ When invoice changes → filter ratecuts for that invoice
  useEffect(() => {
    if (formData.invoice_number) {
      const matching = rateCuts.filter(rc => rc.invoice === formData.invoice_number);
      setRateCutIdOptions(
        matching.map(rc => ({
          label: `RateCut #${rc.rate_cut_id} — Bal: ₹${rc.balance_amount} (${rc.bal_wt}g)`,
          value: rc.rate_cut_id,
        }))
      );
    } else {
      setRateCutIdOptions([]);
    }
  }, [formData.invoice_number, rateCuts]);

  // ✅ When rate_cut_id is selected → populate total_amt, total_wt, rate_cut
  useEffect(() => {
    if (formData.invoice_number && formData.rate_cut_id) {
      const matchingRateCut = rateCuts.find(
        rc => String(rc.rate_cut_id) === String(formData.rate_cut_id)
      );
      if (matchingRateCut) {
        setSelectedRateCut(matchingRateCut);
        setFormData(prev => ({
          ...prev,
          rate_cut: matchingRateCut.rate_cut,
          total_amt: matchingRateCut.balance_amount,
          total_wt: matchingRateCut.bal_wt,
          discount_amt: "",
          cash_amt: "",
          paid_wt: "",
          bal_wt: "",
        }));
      }
    }
  }, [formData.invoice_number, formData.rate_cut_id, rateCuts]);

  // ✅ When repairData comes in (edit mode)
  useEffect(() => {
    if (repairData) {
      setFormData(prev => ({ ...prev, ...repairData }));
      if (repairData.account_name) {
        const filteredInvoices = repairDetails
          ?.filter(item => {
            const balance = Number(item.bal_after_receipts || item.bal_amt || 0);
            return item.account_name === repairData.account_name && balance > 0;
          })
          .map(item => ({ value: item.invoice_number, label: item.invoice_number }));
        setInvoiceNumberOptions(filteredInvoices || []);
      }
    } else {
      const today = new Date().toISOString().split("T")[0];
      setFormData(prev => ({ ...prev, date: today }));
    }
  }, [repairData, repairDetails]);

  // ✅ Edit mode: fetch existing payment by id
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get/payment/${id}`);
        const result = await response.json();
        if (result?.payment) {
          let formattedDate = "";
          if (result.payment.date) {
            const dateObj = new Date(result.payment.date);
            const day = String(dateObj.getDate()).padStart(2, "0");
            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
            const year = dateObj.getFullYear();
            formattedDate = `${year}-${month}-${day}`;
          }

          setFormData((prevData) => ({
            ...prevData,
            ...result.payment,
            date: formattedDate,
          }));

          if (result.payment.account_name) {
            const filteredInvoices = repairDetails
              ?.filter((item) => item.account_name === result.payment.account_name)
              .map((item) => ({
                value: item.invoice_number,
                label: item.invoice_number,
              }));
            setInvoiceNumberOptions(filteredInvoices || []);
          }
        }
      } catch (error) {
        console.error("Error fetching payment:", error);
      }
    };
    if (id) fetchData();
  }, [id, repairDetails]);

  // ✅ Handle invoiceData passed from Sales Table "Add Receipt"
  useEffect(() => {
    if (invoiceData) {
      const updatedData = {
        account_name: invoiceData.account_name || "",
        invoice_number: invoiceData.invoice_number || "",
        mobile: invoiceData.mobile || "",
        total_amt: "",
      };

      const filteredInvoices = repairDetails
        ?.filter((item) => item.account_name === invoiceData.account_name)
        .map((item) => ({
          value: item.invoice_number,
          label: item.invoice_number,
        }));

      setInvoiceNumberOptions(filteredInvoices || []);

      setFormData((prev) => ({
        ...prev,
        ...updatedData,
      }));
    }
  }, [invoiceData, repairDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    // Clear ratecut selection if invoice cleared
    if (name === "invoice_number" && value === "") {
      updated.rate_cut_id = "";
      updated.rate_cut = "";
      updated.total_amt = "";
      updated.total_wt = "";
      updated.discount_amt = "";
      updated.cash_amt = "";
      updated.paid_wt = "";
      updated.bal_wt = "";
      setSelectedRateCut(null);
    }

    // Account name change → sync mobile + invoice list
    if (name === "account_name") {
      const match = accountData.find(item => item.account_name === value);
      updated.mobile = match?.mobile || "";

      if (value === "") {
        updated.invoice_number = "";
        updated.rate_cut_id = "";
        updated.rate_cut = "";
        updated.total_amt = "";
        updated.total_wt = "";
        updated.discount_amt = "";
        updated.cash_amt = "";
        setInvoiceNumberOptions([]);
        setRateCutIdOptions([]);
        setSelectedRateCut(null);
      } else {
        const filteredInvoices = repairDetails
          ?.filter(item => item.account_name === value)
          .map(item => ({ value: item.invoice_number, label: item.invoice_number }));
        setInvoiceNumberOptions(filteredInvoices || []);
      }
    }

    // Mobile change → sync account
    if (name === "mobile") {
      const match = accountData.find(item => item.mobile === value);
      updated.account_name = match?.account_name || "";

      if (value === "") {
        updated.invoice_number = "";
        updated.rate_cut_id = "";
        updated.rate_cut = "";
        updated.total_amt = "";
        updated.total_wt = "";
        updated.discount_amt = "";
        updated.cash_amt = "";
        setInvoiceNumberOptions([]);
        setRateCutIdOptions([]);
        setSelectedRateCut(null);
      } else if (match?.account_name) {
        const filteredInvoices = repairDetails
          ?.filter(item => item.account_name === match.account_name)
          .map(item => ({ value: item.invoice_number, label: item.invoice_number }));
        setInvoiceNumberOptions(filteredInvoices || []);
      }
    }

    // ✅ Paid amount change → calculate paid_wt, bal_amt, bal_wt (mirrors purchase)
    if (name === "discount_amt") {
      const paidAmt = parseFloat(value) || 0;
      const rateCut = parseFloat(formData.rate_cut) || 1;
      const totalAmt = parseFloat(formData.total_amt) || 0;
      const totalWt = parseFloat(formData.total_wt) || 0;

      if (paidAmt > totalAmt) {
        alert("Paid Amount cannot be greater than Outstanding Amount!");
        return;
      }

      const paidWt = (paidAmt / rateCut).toFixed(3);
      const balAmt = (totalAmt - paidAmt).toFixed(2);
      const balWt = (totalWt - paidWt).toFixed(3);

      updated.cash_amt = balAmt;
      updated.paid_wt = paidWt;
      updated.bal_wt = balWt;
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = id ? `${baseURL}/edit/receipt/${id}` : `${baseURL}/post/payments`;
      const method = id ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save data");

      // ✅ Apply payment to selected ratecut (mirrors purchase)
      if (selectedRateCut && formData.discount_amt) {
        try {
          await axios.post(`${baseURL}/sales-ratecuts/apply-receipt`, {
            rate_cut_id: selectedRateCut.rate_cut_id,
            paid_amount: parseFloat(formData.discount_amt) || 0,
          });
        } catch (rcErr) {
          console.error("Error applying receipt to ratecut:", rcErr);
          alert("Receipt saved, but failed to update ratecut balance.");
        }
      }

      alert(`Receipt ${id ? "updated" : "saved"} successfully!`);

      // Generate PDF
      const pdfBlob = await pdf(
        <PDFContent formData={formData} repairDetails={repairDetails} />
      ).toBlob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(pdfBlob);
      link.download = `receipt-${formData.receipt_no || "new"}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);

      navigate("/receiptstable");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleBack = () => {
    const from = location.state?.from || "/receiptstable";
    navigate(from);
  };

  return (
    <div className="main-container">
      <Container className="payments-form-container">
        <Row className="payments-form-section">
          <h4 className="mb-4">Receipts</h4>
          <Col xs={12} md={2}>
            <InputField
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              max={new Date().toISOString().split("T")[0]}
              disabled={!!id}
            />
          </Col>
          <Col xs={12} md={2}>
            <InputField
              label="Receipt No."
              name="receipt_no"
              value={formData.receipt_no}
              onChange={handleInputChange}
            />
          </Col>
          <Col xs={12} md={2}>
            <InputField
              label="Mode"
              type="select"
              name="mode"
              value={formData.mode}
              onChange={handleInputChange}
              options={[
                { value: "Cash", label: "Cash" },
                { value: "Cheque", label: "Cheque" },
                { value: "Online", label: "Online" },
              ]}
              autoFocus
            />
          </Col>
          <Col xs={12} md={3}>
            <InputField
              label="Reference Number"
              name="cheque_number"
              value={formData.cheque_number}
              onChange={handleInputChange}
            />
          </Col>
          <Col xs={12} md={3}>
            <InputField
              label="Account Name"
              type="select"
              name="account_name"
              value={formData.account_name}
              onChange={handleInputChange}
              options={accountOptions}
            />
          </Col>
          <Col xs={12} md={2}>
            <InputField
              label="Mobile"
              type="select"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              options={mobileOptions}
            />
          </Col>
          <Col xs={12} md={2}>
            <InputField
              label="Invoice Number"
              type="select"
              name="invoice_number"
              value={formData.invoice_number}
              onChange={handleInputChange}
              options={invoiceNumberOptions}
            />
          </Col>

          {/* ✅ RateCut dropdown — only when ratecuts exist for selected invoice */}
          {rateCutIdOptions.length > 0 && (
            <Col xs={12} md={3}>
              <InputField
                label="Rate Cut Id"
                type="select"
                name="rate_cut_id"
                value={formData.rate_cut_id || ""}
                onChange={handleInputChange}
                options={rateCutIdOptions}
              />
            </Col>
          )}

          <Col xs={12} md={2}>
            <InputField
              label="Rate Cut"
              name="rate_cut"
              value={formData.rate_cut}
              onChange={handleInputChange}
              readOnly
            />
          </Col>
          <Col xs={12} md={2}>
            <InputField
              label="Out Standing Amt"
              type="number"
              name="total_amt"
              value={formData.total_amt || ""}
              onChange={handleInputChange}
              readOnly
            />
          </Col>
          <Col xs={12} md={2}>
            <InputField
              label="Paid Amt"
              type="number"
              name="discount_amt"
              value={formData.discount_amt}
              onChange={handleInputChange}
            />
          </Col>
          <Col xs={12} md={2}>
            <InputField
              label="Bal Amt"
              type="number"
              name="cash_amt"
              value={formData.cash_amt}
              readOnly
            />
          </Col>
          <Col xs={12} md={2}>
            <InputField
              label="Remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
            />
          </Col>
        </Row>

        <div className="form-buttons">
          <Button
            variant="secondary"
            className="cus-back-btn"
            type="button"
            onClick={handleBack}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            style={{ backgroundColor: "#a36e29", borderColor: "#a36e29" }}
            onClick={handleSubmit}
          >
            {id ? "Update" : "Save"}
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default RepairForm;