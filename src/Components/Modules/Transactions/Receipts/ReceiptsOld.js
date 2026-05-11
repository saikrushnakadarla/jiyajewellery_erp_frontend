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
  const [formData, setFormData] = useState({
    transaction_type: "Receipt",
    date: "",
    mode: "",
    cheque_number: "",
    receipt_no: "",
    account_name: "",
    mobile: "",
    invoice_number: "",
    total_amt: "",
    discount_amt: "",
    cash_amt: "",
    remarks: "",
  });
  const { id } = useParams();
  const { invoiceData } = location.state || {};
  useEffect(() => {
    if (invoiceData) {
      console.log('Received Invoice Data:', invoiceData);
    }
  }, [invoiceData]);
  const [mobileOptions, setMobileOptions] = useState([]);
  const [accountOptions, setAccountOptions] = useState([]);
  const [repairDetails, setRepairDetails] = useState(null);
  const [invoiceNumberOptions, setInvoiceNumberOptions] = useState([]);
  const [accountData, setAccountData] = useState([]);

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

  useEffect(() => {
    if (repairData) {
      setFormData((prev) => ({
        ...prev,
        ...repairData, // Override with existing repair data
      }));

      if (repairData.account_name) {
        // Filter and map only invoices where bal_after_receipts or bal_amt is > 0
        const filteredInvoices = repairDetails
          ?.filter((item) => {
            const balance = Number(item.bal_after_receipts || item.bal_amt || 0);
            return item.account_name === repairData.account_name && balance > 0;
          })
          .map((item) => ({
            value: item.invoice_number,
            label: item.invoice_number,
          }));
      
        setInvoiceNumberOptions(filteredInvoices);
      
        // Set total_amt based on the selected invoice_number
        const selectedRepair = repairDetails?.find(
          (item) => item.invoice_number === repairData.invoice_number
        );
      
        if (selectedRepair) {
          const totalAmt = Number(
            selectedRepair.bal_after_receipts || selectedRepair.bal_amt || 0
          );
          console.log("totalAmt=", totalAmt);
      
          setFormData((prev) => ({
            ...prev,
            total_amt: totalAmt.toFixed(2),
          }));
        }
      }
      
    } else {
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, date: today }));
    }
  }, [repairData, repairDetails]);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await axios.get(`${baseURL}/get-unique-repair-details`);

        // Filter the data based on the 'transaction_status' column
        const filteredData = response.data.filter(item => item.transaction_status === 'Sales' || item.transaction_status === "ConvertedInvoice");

        setRepairDetails(filteredData);
        console.log("filteredData=", filteredData)

      } catch (error) {
        console.error('Error fetching repair details:', error);

      }
    };

    fetchRepairs();
  }, []);

  useEffect(() => {
    const fetchAccountNames = async () => {
      try {
        const response = await axios.get(`${baseURL}/account-names`);
        setAccountData(response.data); // store full data

        const nameOptions = response.data.map((item) => ({
          value: item.account_name,
          label: item.account_name,
        }));
        const mobileOptions = response.data.map((item) => ({
          value: item.mobile,
          label: item.mobile,
        }));

        setAccountOptions(nameOptions);
        setMobileOptions(mobileOptions);
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
        [name]: value,
      };

      // Clear `invoice_number` and related fields when `account_name` is cleared
      if (name === "account_name" && value === "") {
        updatedData.invoice_number = "";
        updatedData.total_amt = "";
        updatedData.cash_amt = "";
        setInvoiceNumberOptions([]);
      }


      // Sync fields using accountData
      if (name === "account_name") {
        const match = accountData.find((item) => item.account_name === value);
        updatedData.mobile = match?.mobile || "";

        if (value === "") {
          updatedData.invoice_number = "";
          updatedData.total_amt = "";
          updatedData.cash_amt = "";
          setInvoiceNumberOptions([]);
        } else {
          const filteredInvoices = repairDetails
            .filter((item) => item.account_name === value)
            .map((item) => ({
              value: item.invoice_number,
              label: item.invoice_number,
            }));
          setInvoiceNumberOptions(filteredInvoices);
        }
      }

      if (name === "mobile") {
        const match = accountData.find((item) => item.mobile === value);
        updatedData.account_name = match?.account_name || "";

        if (match?.account_name) {
          const filteredInvoices = repairDetails
            .filter((item) => item.account_name === match.account_name)
            .map((item) => ({
              value: item.invoice_number,
              label: item.invoice_number,
            }));
          setInvoiceNumberOptions(filteredInvoices);
        }

         if (value === "") {
          updatedData.invoice_number = "";
          updatedData.total_amt = "";
          updatedData.cash_amt = "";
          setInvoiceNumberOptions([]);
        } 
        
      }

      // Handle changes to `total_amt` or `discount_amt`
      if (name === "total_amt" || name === "discount_amt") {
        const totalAmt = Number(updatedData.total_amt) || 0;
        const discountAmt = Number(updatedData.discount_amt) || 0;

        // If `total_amt` is cleared, clear `cash_amt`
        if (name === "total_amt" && value === "") {
          updatedData.cash_amt = "";
        } else if (discountAmt > totalAmt) {
          // Ensure discount amount is not greater than total amount
          alert("Discount amount cannot be greater than total amount.");
          updatedData.discount_amt = "";
        } else {
          updatedData.cash_amt = (totalAmt - discountAmt).toFixed(2);
        }
      }

      // Update `invoiceNumberOptions` when `account_name` changes
      if (name === "account_name") {
        const filteredInvoices = repairDetails
          .filter((item) => item.account_name === value)
          .map((item) => ({
            value: item.invoice_number,
            label: item.invoice_number,
          }));
        setInvoiceNumberOptions(filteredInvoices);
      }

      // Update `total_amt` when `invoice_number` changes
      if (name === "invoice_number") {
        if (value === "") {
          // Clear `total_amt` and `cash_amt` when `invoice_number` is cleared
          updatedData.total_amt = "";
          updatedData.cash_amt = "";
        } else {
          // Set `total_amt` to the `bal_amt` of the selected invoice
          const selectedRepair = repairDetails.find(
            (item) => item.invoice_number === value
          );

          if (selectedRepair) {
            const paidAmt = Number(selectedRepair.paid_amt) || 0;
            const receiptsAmt = Number(selectedRepair.receipts_amt) || 0;
            const netBillAmount = Number(selectedRepair.net_bill_amount) || 0;
            const balAfterReceipts = Number(selectedRepair.bal_after_receipts) || 0;
            const balAmt = Number(selectedRepair.bal_amt) || 0;

            const total =
              paidAmt + receiptsAmt === netBillAmount
                ? balAfterReceipts
                : balAfterReceipts || balAmt;

            updatedData.total_amt = total.toFixed(2);  // ✅ 2 decimal places
            updatedData.cash_amt = "";
          }


          // if (selectedRepair) {
          //   updatedData.total_amt = Number(
          //      selectedRepair.bal_amt || 0
          //   );

          //   updatedData.cash_amt = ""; 
          // }



        }
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
            const filteredInvoices = repairDetails
              ?.filter((item) => item.account_name === result.payment.account_name)
              .map((item) => ({
                value: item.invoice_number,
                label: item.invoice_number,
              }));

            setInvoiceNumberOptions(filteredInvoices);

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
  }, [id, repairDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = id
        ? `${baseURL}/edit/receipt/${id}`
        : `${baseURL}/post/payments`;
      const method = id ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save data");

      alert(`Receipt ${id ? "updated" : "saved"} successfully!`);

      console.log("FormData being passed to PDF generation:", formData);

      // Generate PDF
      const pdfBlob = await pdf(
        <PDFContent formData={formData} repairDetails={repairDetails} />
      ).toBlob();

      // Create download link and trigger download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(pdfBlob);
      link.download = `receipt-${formData.receipt_no || "new"}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);

      // Navigate to receipts table
      navigate("/receiptstable");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (invoiceData) {
      // Set common fields
      const updatedData = {
        account_name: invoiceData.account_name || "",
        invoice_number: invoiceData.invoice_number || "",
        mobile: invoiceData.mobile || "",
        total_amt: invoiceData.total_amt || ""
      };

      // Get filtered invoice options
      const filteredInvoices = repairDetails
        ?.filter((item) => item.account_name === invoiceData.account_name)
        .map((item) => ({
          value: item.invoice_number,
          label: item.invoice_number,
        }));

      setInvoiceNumberOptions(filteredInvoices);

      // Calculate total amount based on invoice_number if present
      const selectedInvoice = repairDetails?.find(
        (item) => item.invoice_number === invoiceData.invoice_number
      );

      if (selectedInvoice) {
        const balAfterReceipts = Number(selectedInvoice.bal_after_receipts) || 0;
        const balAmt = Number(selectedInvoice.bal_amt) || 0;
        const totalAmt = balAfterReceipts || balAmt || 0;

        updatedData.total_amt = totalAmt.toFixed(2);
        console.log("Final total_amt set to:", totalAmt);
      }

      setFormData((prev) => ({
        ...prev,
        ...updatedData,
      }));
    }
  }, [invoiceData, repairDetails]);


  const handleBack = () => {
    const from = location.state?.from || "/receiptstable"; // Default to /receiptstable if no from location provided
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
              label="Balance Amt"
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
            // onClick={() => navigate("/receiptstable")}
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
