import React, { useState, useEffect } from "react";
import "./Payments.css";
import InputField from "../../../Pages/InputField/InputField";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import baseURL from "../../../../Url/NodeBaseURL";
import axios from 'axios';
import { pdf } from "@react-pdf/renderer";
import { useParams } from "react-router-dom";
import PDFContent from "./ReceiptPdf";

const RepairForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const receivedData = location.state || {}; // Extract received data
  // const repairData = location.state?.repairData;

  const [formData, setFormData] = useState({
    transaction_type: "Payment",
    date: "",
    mode: "",
    cheque_number: "",
    receipt_no: "",
    account_name: receivedData.account_name || "",
    invoice_number: receivedData.invoice_number || "",
    category: receivedData.category || "",
    total_wt: receivedData.total_wt || "",
    paid_wt: "",
    bal_wt: "",
    rate: "",
    total_amt: "",
    discount_amt: "",
    cash_amt: "",
    remarks: "",
  });
  const { id } = useParams();
  const [purchases, setPurchases] = useState([]);
  const [accountOptions, setAccountOptions] = useState([]);
  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    const fetchLastPaymentNumber = async () => {
      try {
        const response = await axios.get(`${baseURL}/lastPaymentNumber`);
        // setFormData(prev => ({ ...prev, receipt_no: response.data.lastPaymentNumber }));
        setFormData((prev) => ({
          ...prev,
          receipt_no:response.data.lastPaymentNumber,
        }));
      } catch (error) {
        console.error("Error fetching invoice_number number:", error);
      }
    };

    fetchLastPaymentNumber();
  }, []);

  useEffect(() => {
    const fetchAccountNames = async () => {
      try {
        const response = await axios.get(`${baseURL}/payment-account-names`);
        const formattedOptions = response.data.map((item) => ({
          value: item.account_name,
          label: item.account_name,
        }));
        setAccountOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching account names:", error);
      }
    };

    fetchAccountNames();
  }, []);

  useEffect(() => {
    axios.get(`${baseURL}/get/purchases`)
      .then((response) => {
        console.log("Purchases fetched successfully:", response.data);
        setPurchases(response.data); // Store purchases in state
      })
      .catch((error) => {
        console.error("Error fetching purchases:", error);
      });
  }, []);

  useEffect(() => {
    if (formData.account_name) {
      const filteredInvoices = purchases
        .filter((purchase) => purchase.account_name === formData.account_name)
        .map((purchase) => purchase.invoice); // Extract invoice numbers

      // Remove duplicates using Set
      const uniqueInvoices = [...new Set(filteredInvoices)].map((invoice) => ({
        value: invoice,
        label: invoice,
      }));

      setInvoiceOptions(uniqueInvoices);
    } else {
      setInvoiceOptions([]); // Reset if no account selected
    }
  }, [formData.account_name, purchases]);

  useEffect(() => {
    if (formData.invoice_number) {
      const filteredCategories = purchases
        .filter((purchase) => purchase.invoice === formData.invoice_number)
        .map((purchase) => purchase.category);

      // Remove duplicates using Set
      const uniqueCategories = [...new Set(filteredCategories)].map((category) => ({
        value: category,
        label: category,
      }));

      setCategoryOptions(uniqueCategories);
    } else {
      setCategoryOptions([]);
    }
  }, [formData.invoice_number, purchases]);

  useEffect(() => {
    if (formData.account_name && formData.invoice_number && formData.category) {
      const matchingPurchase = purchases.find(
        (purchase) =>
          purchase.account_name === formData.account_name &&
          purchase.invoice === formData.invoice_number &&
          purchase.category === formData.category
      );

      if (matchingPurchase) {
        setFormData((prevState) => ({
          ...prevState,
          total_wt:
            parseFloat(matchingPurchase.balWt_after_payment) > 0
              ? matchingPurchase.balWt_after_payment
              : matchingPurchase.balance_pure_weight || "",
        }));
      }
    }
  }, [formData.account_name, formData.invoice_number, formData.category, purchases]);


  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split("T")[0];
    setFormData((prevData) => ({ ...prevData, date: today }));
    const fetchAccountNames = async () => {
      try {
        const response = await fetch(`${baseURL}/payment-account-names`);
        if (!response.ok) {
          throw new Error("Failed to fetch account names");
        }
        const data = await response.json();
        console.error(' account name:', data);

        // Map API response to match the options structure
        const formattedOptions = data.map((item) => ({
          value: item.account_name,
          label: item.account_name,
        }));

        setAccountOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching account names:", error);
      }
    };

    fetchAccountNames();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: value, // Ensure the field is updated first
      };


      const totalAmt = Number(updatedData.total_amt) || 0;
      const discountAmt = value === "" ? "" : Number(updatedData.discount_amt) || 0;
      const totalWt = Number(updatedData.total_wt) || 0;
      const paidWt = Number(updatedData.paid_wt) || 0;
      const rate = Number(updatedData.rate) || 0;

      if (name === "discount_amt") {
        if (discountAmt > totalAmt) {
          alert("Paid amount cannot be greater than total amount.");
          updatedData.discount_amt = updatedData.prevPaidAmt || "";
        } else {
          updatedData.cash_amt = discountAmt !== "" ? (totalAmt - discountAmt).toFixed(2) : ""; // Update only if discount_amt exists, otherwise clear it

          // Calculate paid_wt as discount_amt * rate and update it
          updatedData.paid_wt = discountAmt !== "" ? (discountAmt / rate).toFixed(3) : "";

          // Update bal_wt (total_wt - discount_amt)
          updatedData.bal_wt = discountAmt !== "" ? (updatedData.total_wt - updatedData.paid_wt).toFixed(3) : updatedData.total_wt;
        }
        updatedData.prevPaidAmt = updatedData.discount_amt;
      }

      if (name === "total_wt" || name === "paid_wt") {
        if (paidWt > totalWt) {
          alert("Balance Weight cannot be greater than total weight.");
          updatedData.paid_wt = updatedData.prevPaidWt || "";
        } else {
          updatedData.bal_wt = (totalWt - paidWt).toFixed(3);
        }
        updatedData.prevPaidWt = updatedData.paid_wt;
      }

      if (name === "rate" || name === "total_wt") {
        updatedData.total_amt = (updatedData.total_wt * rate).toFixed(2);
      }

      return updatedData;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get/payment/${id}`);
        const result = await response.json();
        console.log("Fetched data:", result);
        if (result?.payment) {
          // Convert date to dd-mm-yyyy format
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
            date: formattedDate, // Set formatted date
          }));

          // Fetch related invoices immediately after setting account_name
          if (result.payment.account_name) {
            const filteredInvoices = purchases
              ?.filter((item) => item.account_name === result.payment.account_name)
              .map((item) => ({
                value: item.invoice,
                label: item.invoice,
              }));

            setInvoiceOptions(filteredInvoices);

            // If invoice_number exists, set it in formData
            if (result.payment.invoice_number) {
              setFormData((prevData) => ({
                ...prevData,
                invoice_number: result.payment.invoice_number,
              }));
            }
          }
        } else {
          console.error("Payment not found");
        }
      } catch (error) {
        console.error("Error fetching payment:", error);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, purchases]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = id
        ? `${baseURL}/edit/payments/${id}`
        : `${baseURL}/post/payments`;
      const method = id ? "PUT" : "POST";
  
      // Save payment details to the server
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) throw new Error("Failed to save data");
  
      alert(`Payment ${id ? "updated" : "saved"} successfully!`);
  
      // Generate the PDF
      const pdfDoc = <PDFContent formData={formData} purchases={purchases} />;
      const pdfBlob = await pdf(pdfDoc).toBlob();
  
      // Create a download link and trigger it
      const link = document.createElement("a");
      link.href = URL.createObjectURL(pdfBlob);
      link.download = `Payment-receipt-${formData.receipt_no || "new"}.pdf`;
      link.click();
  
      // Clean up the download link
      URL.revokeObjectURL(link.href);
  
      // Navigate back to the correct previous page
      if (location.state?.from) {
        navigate(location.state.from, { replace: true });
      } else {
        navigate(-1); // Go back in history if "from" is not available
      }
      
    } catch (error) {
      window.alert(`Error: ${error.message}`);
    }
  };
  

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from); // If there's a specific "from" location, navigate to it
    } else {
      navigate(-1); // Otherwise, go back in history
    }
  };
  

  return (
    <div className="main-container">
      <Container className="payments-form-container">
        <Row className="payments-form-section">
          <h4 className="mb-4">Payments</h4>

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
              label="Payment No."
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
          <Col xs={12} md={2}>
            <InputField
              label="Reference Number"
              name="cheque_number"
              value={formData.cheque_number}
              onChange={handleInputChange}
            />
          </Col>

          <Col xs={12} md={2}>
            <InputField
              label="Account Name"
              type="select"
              name="account_name"
              value={formData.account_name}
              onChange={handleInputChange}
              options={accountOptions} // Dynamically populated
            />
          </Col>
          <Col xs={12} md={2}>
            <InputField
              label="Invoice"
              type="select"
              name="invoice_number"
              value={formData.invoice_number}
              onChange={handleInputChange}
              options={invoiceOptions} // Dynamically populated with invoiceData
            />
          </Col>
          <Col xs={12} md={2}>
            <InputField
              label="Category"
              type="select"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              options={categoryOptions} // Dynamically populated
            />
          </Col>
          <Col xs={12} md={2}>
            <InputField
              label="Out Standing Wt"
              type="number"
              name="total_wt"
              value={formData.total_wt}
              onChange={handleInputChange}
              readOnly
            />
          </Col>

          <Col xs={12} md={2}>
            <InputField
              label="Paid Wt"
              type="number"
              name="paid_wt"
              value={formData.paid_wt}
              onChange={handleInputChange}
            />
          </Col>
          <Col xs={12} md={2}>
            <InputField
              label="Bal Wt"
              type="number"
              name="bal_wt"
              value={formData.bal_wt}
              readOnly
            />
          </Col>
          <Col xs={12} md={2}>
            <InputField
              label="Rate"
              type="number"
              name="rate"
              value={formData.rate}
              onChange={handleInputChange}
            />
          </Col>


          <Col xs={12} md={2}>
            <InputField
              label="Out Standing Amt"
              type="number"
              name="total_amt"
              value={formData.total_amt}
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
            // onClick={() => navigate("/paymentstable")}
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
