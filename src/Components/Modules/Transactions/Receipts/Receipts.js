import React, { useState, useEffect, useContext } from "react";
import "./Receipts.css";
import InputField from "../../../Pages/InputField/InputField";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import baseURL from "../../../../Url/NodeBaseURL";
import axios from "axios";
import { pdf } from "@react-pdf/renderer";
import PDFContent from "./ReceiptPdf";
import { useParams } from "react-router-dom";
import { saveAs } from "file-saver";
import { AuthContext } from "../../../Pages/Login/Context";

const RepairForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  console.log("location=", location);
  // If using context
  // const { user } = useAuth(); // Assuming you have an auth context
  const { authToken, userId, userName, role } = useContext(AuthContext);
  const repairData = location.state?.repairData;
  const [formData, setFormData] = useState({
    transaction_type: "Receipt",
    date: new Date().toISOString().split("T")[0],
    mode: "Cash",
    cheque_number: "",
    receipt_no: "",
    account_name: "",
    mobile: "",
    invoice_number: "",
    total_amt: "",
    discount_amt: "",
    cash_amt: "",
    remarks: "",
    total_wt: "",
    paid_wt: "",
    bal_wt: "",
    rate: "",
    category: "",
    is_advance: false, // Add this flag to track if ADVANCE is selected
  });
  const { id } = useParams();
  const { invoiceData } = location.state || {};

  useEffect(() => {
    if (invoiceData) {
      console.log("Received Invoice Data:", invoiceData);
    }
  }, [invoiceData]);
  const [mobileOptions, setMobileOptions] = useState([]);
  const [accountOptions, setAccountOptions] = useState([]);
  const [repairDetails, setRepairDetails] = useState(null);
  const [invoiceNumberOptions, setInvoiceNumberOptions] = useState([]);
  const [accountData, setAccountData] = useState([]);
  const [repeatedData, setRepeatedData] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [accountDetails, setAccountDetails] = useState([]);

  // Add these after your existing useState declarations
  const [rateCutData, setRateCutData] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [rateCutOptions, setRateCutOptions] = useState([]);
  const [showRateCutFields, setShowRateCutFields] = useState(false);

  useEffect(() => {
    const fetchLastReceiptNumber = async () => {
      try {
        const response = await axios.get(`${baseURL}/lastReceiptNumber`);
        setFormData((prev) => ({
          ...prev,
          receipt_no: repairData
            ? repairData.receipt_no
            : response.data.lastReceiptNumber,
        }));
      } catch (error) {
        console.error("Error fetching receipt number:", error);
      }
    };

    fetchLastReceiptNumber();
  }, [repairData]);

  // Fetch account details including account_id
  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/account-details`);
        setAccountDetails(response.data);
        console.log("Account details fetched:", response.data);
      } catch (error) {
        console.error("Error fetching account details:", error);
      }
    };

    fetchAccountDetails();
  }, []);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/get-unique-repair-details`,
        );

        const filteredData = response.data.filter(
          (item) =>
            item.transaction_status === "Sales" ||
            item.transaction_status === "ConvertedInvoice",
        );

        setRepairDetails(filteredData);
        console.log("filteredData =", filteredData);
      } catch (error) {
        console.error("Error fetching repair details:", error);
      }
    };

    fetchRepairs();
  }, []);

  useEffect(() => {
    const fetchRepairDetailsByInvoice = async () => {
      // Don't fetch details if ADVANCE is selected
      if (formData.invoice_number === "ADVANCE") {
        setRepeatedData([]);
        return;
      }

      if (formData.invoice_number) {
        try {
          const response = await axios.get(
            `${baseURL}/get-repair-details/${formData.invoice_number}`,
          );
          console.log("Detailed repair data:", response.data);

          // Filter by transaction_status and set repeatedData
          const filteredData = (response.data.repeatedData || []).filter(
            (item) =>
              item.transaction_status === "Sales" ||
              item.transaction_status === "ConvertedInvoice",
          );

          setRepeatedData(filteredData);
        } catch (error) {
          console.error(
            "Error fetching repair details by invoice number:",
            error,
          );
        }
      }
    };

    fetchRepairDetailsByInvoice();
  }, [formData.invoice_number]);

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


  useEffect(() => {
    const fetchRateCuts = async () => {
      try {
        const response = await axios.get(`${baseURL}/rateCuts`);
        console.log("RateCuts Data:", response.data);
        setRateCutData(response.data);
      } catch (error) {
        console.error("Error fetching rateCuts:", error);
      }
    };

    fetchRateCuts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      let updatedData = {
        ...prevData,
        [name]: value,
      };

      // Clear invoice_number and related fields when account_name is cleared
      if (name === "account_name" && value === "") {
        updatedData.invoice_number = "";
        updatedData.total_amt = "";
        updatedData.discount_amt = "";
        updatedData.cash_amt = "";
        updatedData.is_advance = false;
        updatedData.total_wt = "";
        updatedData.paid_wt = "";
        updatedData.bal_wt = "";
        updatedData.rate = "";
        updatedData.category = "";
        setShowRateCutFields(false);
        setInvoiceNumberOptions([]);
        setCategoryOptions([]);
        setRateCutOptions([]);
      }

      // Sync fields using accountData
      if (name === "account_name") {
        const match = accountData.find((item) => item.account_name === value);
        updatedData.mobile = match?.mobile || "";

        // Always reset invoice and amounts if account_name changes
        updatedData.invoice_number = "";
        updatedData.total_amt = "";
        updatedData.discount_amt = "";
        updatedData.cash_amt = "";
        updatedData.is_advance = false;
        updatedData.total_wt = "";
        updatedData.paid_wt = "";
        updatedData.bal_wt = "";
        updatedData.rate = "";
        updatedData.category = "";
        updatedData.transaction_type = "Receipt";
        setShowRateCutFields(false);
        setCategoryOptions([]);
        setRateCutOptions([]);

        // Create invoice options including ADVANCE
        if (value !== "") {
          const filteredInvoices = repairDetails
            .filter((item) => item.account_name === value)
            .filter((item) => {
              const paidAmt = Number(item.paid_amt) || 0;
              const receiptsAmt = Number(item.receipts_amt) || 0;
              const netBillAmount = Number(item.net_bill_amount) || 0;
              const balAfterReceipts = Number(item.bal_after_receipts) || 0;
              const balAmt = Number(item.bal_amt) || 0;

              const total =
                paidAmt + receiptsAmt === netBillAmount
                  ? balAfterReceipts
                  : balAfterReceipts || balAmt;

              return total > 0;
            })
            .map((item) => ({
              value: item.invoice_number,
              label: item.invoice_number,
            }));

          // Add ADVANCE option at the beginning
          const optionsWithAdvance = [
            { value: "ADVANCE", label: "ADVANCE" },
            ...filteredInvoices,
          ];

          setInvoiceNumberOptions(optionsWithAdvance);
        } else {
          setInvoiceNumberOptions([]);
        }
      }

      if (name === "mobile") {
        const match = accountData.find((item) => item.mobile === value);
        updatedData.account_name = match?.account_name || "";

        // Always reset invoice and amounts if mobile changes
        updatedData.invoice_number = "";
        updatedData.total_amt = "";
        updatedData.discount_amt = "";
        updatedData.cash_amt = "";
        updatedData.is_advance = false;
        updatedData.total_wt = "";
        updatedData.paid_wt = "";
        updatedData.bal_wt = "";
        updatedData.rate = "";
        updatedData.category = "";
        updatedData.transaction_type = "Receipt";
        setShowRateCutFields(false);
        setCategoryOptions([]);
        setRateCutOptions([]);

        // Create invoice options including ADVANCE
        if (match?.account_name) {
          const filteredInvoices = repairDetails
            .filter((item) => item.account_name === match.account_name)
            .filter((item) => {
              const paidAmt = Number(item.paid_amt) || 0;
              const receiptsAmt = Number(item.receipts_amt) || 0;
              const netBillAmount = Number(item.net_bill_amount) || 0;
              const balAfterReceipts = Number(item.bal_after_receipts) || 0;
              const balAmt = Number(item.bal_amt) || 0;

              const total =
                paidAmt + receiptsAmt === netBillAmount
                  ? balAfterReceipts
                  : balAfterReceipts || balAmt;

              return total > 0;
            })
            .map((item) => ({
              value: item.invoice_number,
              label: item.invoice_number,
            }));

          // Add ADVANCE option at the beginning
          const optionsWithAdvance = [
            { value: "ADVANCE", label: "ADVANCE" },
            ...filteredInvoices,
          ];

          setInvoiceNumberOptions(optionsWithAdvance);
        } else {
          setInvoiceNumberOptions([]);
        }
      }

      // Handle invoice_number selection including ADVANCE
      if (name === "invoice_number") {
        if (value === "ADVANCE") {
          // Handle ADVANCE selection
          updatedData.is_advance = true;
          updatedData.transaction_type = "Advance Receipt";
          updatedData.total_amt = "";
          updatedData.discount_amt = "";
          updatedData.cash_amt = "";
          updatedData.total_wt = "";
          updatedData.paid_wt = "";
          updatedData.bal_wt = "";
          updatedData.rate = "";
          updatedData.category = "";
          setShowRateCutFields(false);
          setRepeatedData([]);
          setCategoryOptions([]);
          setRateCutOptions([]);
        } else if (value === "") {
          // Clear all when empty
          updatedData.is_advance = false;
          updatedData.transaction_type = "Receipt";
          updatedData.total_amt = "";
          updatedData.discount_amt = "";
          updatedData.cash_amt = "";
          updatedData.total_wt = "";
          updatedData.paid_wt = "";
          updatedData.bal_wt = "";
          updatedData.rate = "";
          updatedData.category = "";
          setShowRateCutFields(false);
          setRepeatedData([]);
          setCategoryOptions([]);
          setRateCutOptions([]);
        } else {
          // Handle regular invoice selection
          updatedData.is_advance = false;
          updatedData.transaction_type = "Receipt";
          const selectedRepair = repairDetails.find(
            (item) => item.invoice_number === value,
          );

          if (selectedRepair) {
            const paidAmt = Number(selectedRepair.paid_amt) || 0;
            const receiptsAmt = Number(selectedRepair.receipts_amt) || 0;
            const netBillAmount = Number(selectedRepair.net_bill_amount) || 0;
            const balAfterReceipts =
              Number(selectedRepair.bal_after_receipts) || 0;
            const balAmt = Number(selectedRepair.bal_amt) || 0;

            const total =
              paidAmt + receiptsAmt === netBillAmount
                ? balAfterReceipts
                : balAfterReceipts || balAmt;

            updatedData.total_amt = total.toFixed(2);

            // Check if this invoice has rate cut data
            checkForRateCutData(value, updatedData.account_name, updatedData);
          }
        }
      }

      // Handle paid amount changes with rate cut
      if (name === "discount_amt" && !updatedData.is_advance && updatedData.rate) {
        const paidAmt = parseFloat(value) || 0;
        const rate = parseFloat(updatedData.rate) || 1;
        const totalAmt = parseFloat(updatedData.total_amt) || 0;
        const totalWt = parseFloat(updatedData.total_wt) || 0;

        if (paidAmt > totalAmt) {
          alert("Paid Amount cannot be greater than Outstanding Amount!");
          return prevData;
        }

        const paidWt = (paidAmt / rate).toFixed(3);
        const balAmt = (totalAmt - paidAmt).toFixed(2);
        const balWt = (totalWt - paidWt).toFixed(3);

        updatedData.paid_wt = paidWt;
        updatedData.bal_wt = balWt;
        updatedData.cash_amt = balAmt;
      }

      // Handle paid weight changes with rate cut
      if (name === "paid_wt" && !updatedData.is_advance && updatedData.rate) {
        const paidWt = parseFloat(value) || 0;
        const rate = parseFloat(updatedData.rate) || 1;
        const totalAmt = parseFloat(updatedData.total_amt) || 0;
        const totalWt = parseFloat(updatedData.total_wt) || 0;

        if (paidWt > totalWt) {
          alert("Paid Weight cannot be greater than Outstanding Weight!");
          return prevData;
        }

        const paidAmt = (paidWt * rate).toFixed(2);
        const balAmt = (totalAmt - paidAmt).toFixed(2);
        const balWt = (totalWt - paidWt).toFixed(3);

        updatedData.discount_amt = paidAmt;
        updatedData.cash_amt = balAmt;
        updatedData.bal_wt = balWt;
      }

      // Handle rate cut selection
      if (name === "rate" && value) {
        const selectedRateCut = rateCutOptions.find(opt => opt.value.toString() === value.toString());
        if (selectedRateCut && selectedRateCut.total_wt && selectedRateCut.rate) {
          updatedData.total_wt = selectedRateCut.total_wt;
          updatedData.bal_wt = selectedRateCut.bal_wt || selectedRateCut.total_wt;
          updatedData.rate = selectedRateCut.rate;
        }
      }

      // Handle category selection
      if (name === "category" && value) {
        const selectedRateCut = rateCutData.find(
          (rc) => rc.category === value &&
            rc.invoice === updatedData.invoice_number &&
            rc.account_name === updatedData.account_name
        );

        if (selectedRateCut) {
          const matchingRateCuts = rateCutData.filter(
            (rc) => rc.invoice === updatedData.invoice_number &&
              rc.category === value
          );

          const rateCutOpts = matchingRateCuts.map((rc) => ({
            label: `${rc.rate_cut} (Bal Wt: ${rc.bal_wt || 0})`,
            value: rc.rate_cut,
            total_wt: rc.bal_wt || rc.total_wt || 0,
            bal_wt: rc.bal_wt || rc.total_wt || 0
          }));

          setRateCutOptions(rateCutOpts);

          if (matchingRateCuts.length > 0) {
            updatedData.total_wt = matchingRateCuts[0].bal_wt || matchingRateCuts[0].total_wt || 0;
            updatedData.bal_wt = matchingRateCuts[0].bal_wt || matchingRateCuts[0].total_wt || 0;
            updatedData.rate = matchingRateCuts[0].rate_cut;
          }

          setShowRateCutFields(true);
        } else {
          setShowRateCutFields(false);
          setRateCutOptions([]);
        }
      }

      return updatedData;
    });
  };

  // Helper function to check for rate cut data
  const checkForRateCutData = (invoiceNumber, accountName, updatedData) => {
    const relatedRateCuts = rateCutData.filter(
      (rc) => rc.invoice === invoiceNumber && rc.account_name === accountName
    );

    if (relatedRateCuts.length > 0) {
      const uniqueCategories = [...new Set(relatedRateCuts.map(rc => rc.category))];
      setCategoryOptions(uniqueCategories.map(cat => ({ value: cat, label: cat })));
      setShowRateCutFields(true);
    } else {
      setShowRateCutFields(false);
      setCategoryOptions([]);
      setRateCutOptions([]);
      updatedData.total_wt = "";
      updatedData.paid_wt = "";
      updatedData.bal_wt = "";
      updatedData.rate = "";
      updatedData.category = "";
    }
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
            is_advance:
              result.payment.invoice_number === "ADVANCE" ? true : false,
          }));

          // Fetch related invoices immediately after setting account_name
          if (result.payment.account_name) {
            const filteredInvoices = repairDetails
              ?.filter(
                (item) => item.account_name === result.payment.account_name,
              )
              .map((item) => ({
                value: item.invoice_number,
                label: item.invoice_number,
              }));

            // Add ADVANCE option at the beginning
            const optionsWithAdvance = [
              { value: "ADVANCE", label: "ADVANCE" },
              ...(filteredInvoices || []),
            ];

            setInvoiceNumberOptions(optionsWithAdvance);

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

  const getTabId = () => {
    // First try to get from URL
    const urlParams = new URLSearchParams(window.location.search);
    let tabId = urlParams.get("tabId");

    // If not in URL, try sessionStorage
    if (!tabId) {
      tabId = sessionStorage.getItem("tabId");
    }

    // If still not found, generate new ID
    if (!tabId) {
      tabId = crypto.randomUUID();
      sessionStorage.setItem("tabId", tabId);

      // Update URL without page reload
      const newUrl = `${window.location.pathname}?tabId=${tabId}`;
      window.history.replaceState({}, "", newUrl);
    }

    return tabId;
  };

  const tabId = getTabId();

  const handleClose = () => {
    // navigate(`/sales?tabId=${tabId}`);
    navigate(-1);
  };

  const [company, setCompany] = useState(null);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${baseURL}/get/companies`);
      const firstCompany = response.data?.[0] || null;
      // API returns array with one object
      setCompany(firstCompany);
      console.log("firstCompany=", firstCompany);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

 const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation for Paid Amount / Advance Amount
  if (!formData.discount_amt || Number(formData.discount_amt) <= 0) {
    alert("Please enter the Paid Amount.");
    return;
  }
  
  try {
    const endpoint = id
      ? `${baseURL}/edit/receipt/${id}`
      : `${baseURL}/post/payments`;
    const method = id ? "PUT" : "POST";

    // Create a copy of formData to send
    const dataToSend = { ...formData };

    // If it's an advance payment, set total_amt to discount_amt
    if (formData.is_advance) {
      dataToSend.total_amt = dataToSend.discount_amt;
      dataToSend.cash_amt = "0.00";
    }

    // Save receipt
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) throw new Error("Failed to save data");

    console.log("Receipt saved successfully");

    // Get account_id based on mobile number from account details
    let accountId = null;
    
    if (formData.mobile) {
      const account = accountDetails.find(
        (item) => item.mobile === formData.mobile
      );
      
      if (account && account.account_id) {
        accountId = account.account_id;
        console.log("Found account_id:", accountId, "for mobile:", formData.mobile);
      } else {
        console.warn("No account found for mobile:", formData.mobile);
      }
    } else {
      console.warn("No mobile number available to fetch account_id");
    }

    // Create ledger entry only if account_id is found
    if (accountId) {
      const ledgerData = {
        transaction_date: new Date(formData.date).toISOString(),
        transaction_type: "RECEIPT",
        invoice_number: formData.receipt_no,
        credit: parseFloat(formData.discount_amt) || 0,
        debit: 0,
        net_wt: parseFloat(formData.paid_wt) || 0,
        gross_wt: parseFloat(formData.paid_wt) || 0,
        amount: parseFloat(formData.discount_amt) || 0,
        account_id: accountId
      };
      
      console.log("Sending to ledger:", ledgerData);
      
      const ledgerResponse = await fetch(`${baseURL}/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ledgerData),
      });
      
      const ledgerResult = await ledgerResponse.json();
      
      if (!ledgerResponse.ok) {
        console.error("Failed to create ledger entry:", ledgerResult);
        alert(`Warning: Receipt saved but ledger entry failed: ${ledgerResult.error || 'Unknown error'}`);
      } else {
        console.log("Ledger entry created successfully:", ledgerResult);
      }
    } else {
      console.warn("Skipping ledger entry - No account_id found for mobile:", formData.mobile);
    }

    alert(`Receipt ${id ? "updated" : "saved"} successfully!`);
    setIsSubmitted(true);

    console.log("FormData being passed to PDF generation:", dataToSend);

    // Generate PDF
    const pdfBlob = await pdf(
      <PDFContent
        formData={dataToSend}
        repairDetails={repairDetails}
        company={company}
      />,
    ).toBlob();

    await handleSavePDFToServer(pdfBlob, dataToSend.receipt_no);

    navigate(-1);
  } catch (error) {
    console.error("Error in handleSubmit:", error);
    alert(`Error: ${error.message}`);
  }
};

  const handleSavePDFToServer = async (pdfBlob, estimateNumber) => {
    const formData = new FormData();
    formData.append("invoice", pdfBlob, `${estimateNumber}.pdf`);

    try {
      const response = await fetch(`${baseURL}/upload-invoice`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload invoice");
      }

      console.log(`Estimate ${estimateNumber} saved on server`);
    } catch (error) {
      console.error("Error uploading invoice:", error);
    }
  };

  useEffect(() => {
    if (invoiceData) {
      // Set common fields
      const updatedData = {
        account_name: invoiceData.account_name || "",
        invoice_number: invoiceData.invoice_number || "",
        mobile: invoiceData.mobile || "",
        total_amt: invoiceData.total_amt || "",
        is_advance: invoiceData.invoice_number === "ADVANCE" ? true : false,
      };

      // Get filtered invoice options including ADVANCE
      const filteredInvoices = repairDetails
        ?.filter((item) => item.account_name === invoiceData.account_name)
        .filter((item) => {
          const paidAmt = Number(item.paid_amt) || 0;
          const receiptsAmt = Number(item.receipts_amt) || 0;
          const netBillAmount = Number(item.net_bill_amount) || 0;
          const balAfterReceipts = Number(item.bal_after_receipts) || 0;
          const balAmt = Number(item.bal_amt) || 0;

          const total =
            paidAmt + receiptsAmt === netBillAmount
              ? balAfterReceipts
              : balAfterReceipts || balAmt;

          return total > 0;
        })
        .map((item) => ({
          value: item.invoice_number,
          label: item.invoice_number,
        }));

      // Add ADVANCE option at the beginning
      const optionsWithAdvance = [
        { value: "ADVANCE", label: "ADVANCE" },
        ...(filteredInvoices || []),
      ];

      setInvoiceNumberOptions(optionsWithAdvance);

      // Calculate total amount based on invoice_number if present and not ADVANCE
      if (
        invoiceData.invoice_number &&
        invoiceData.invoice_number !== "ADVANCE"
      ) {
        const selectedInvoice = repairDetails?.find(
          (item) => item.invoice_number === invoiceData.invoice_number,
        );

        if (selectedInvoice) {
          const balAfterReceipts =
            Number(selectedInvoice.bal_after_receipts) || 0;
          const balAmt = Number(selectedInvoice.bal_amt) || 0;
          const totalAmt = balAfterReceipts || balAmt || 0;

          updatedData.total_amt = totalAmt.toFixed(2);
          console.log("Final total_amt set to:", totalAmt);
        }
      }

      setFormData((prev) => ({
        ...prev,
        ...updatedData,
      }));
    }
  }, [invoiceData, repairDetails]);

  const handleBack = () => {
    navigate(-1); // Go back one step in the browser history
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus =
      currentStatus === "Delivered" ? "Not Delivered" : "Delivered";

    try {
      const response = await axios.put(
        `${baseURL}/update-repair-status/${id}`,
        {
          sale_status: newStatus,
        },
      );

      if (response.status === 200) {
        const updatedData = repeatedData.map((item) =>
          item.id === id ? { ...item, sale_status: newStatus } : item,
        );
        setRepeatedData(updatedData);
      }
    } catch (error) {
      console.error("Error updating sale_status:", error);
    }
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
            />
          </Col>
          <Col xs={12} md={2}>
            <InputField
              label="Reference No."
              name="cheque_number"
              value={formData.cheque_number}
              onChange={handleInputChange}
            />
          </Col>

          <Col xs={12} md={2}>
            {invoiceData?.mobile ? (
              <InputField
                label="Mobile"
                type="text"
                name="mobile"
                value={formData.mobile}
                readOnly
              />
            ) : (
              <InputField
                label="Mobile"
                type="select"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                options={mobileOptions}
              />
            )}
          </Col>

          <Col xs={12} md={2}>
            {invoiceData?.account_name ? (
              <InputField
                label="Account Name"
                type="text"
                name="account_name"
                value={formData.account_name}
                readOnly
              />
            ) : (
              <InputField
                label="Account Name"
                type="select"
                name="account_name"
                value={formData.account_name}
                onChange={handleInputChange}
                options={accountOptions}
                autoFocus
              />
            )}
          </Col>

          <Col xs={12} md={2}>
            {invoiceData?.invoice_number ? (
              <InputField
                label="Invoice Number"
                type="text"
                name="invoice_number"
                value={formData.invoice_number}
                readOnly
              />
            ) : (
              <InputField
                label="Invoice Number"
                type="select"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleInputChange}
                options={invoiceNumberOptions}
              />
            )}
          </Col>


          {formData.is_advance && showRateCutFields && (
            <>
              <Col xs={12} md={2}>
                <InputField
                  label="Category"
                  type="select"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  options={categoryOptions}
                />
              </Col>

              <Col xs={12} md={2}>
                <InputField
                  label="Rate Cut"
                  type="select"
                  name="rate"
                  value={formData.rate}
                  onChange={handleInputChange}
                  options={rateCutOptions}
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
            </>
          )}

          {formData.is_advance ? (
            // Show only Advance Amount field for advance payments
            <Col xs={12} md={2}>
              <InputField
                label="Advance Amount"
                type="number"
                name="discount_amt" // Using discount_amt for advance amount
                value={formData.discount_amt}
                onChange={handleInputChange}
              />
            </Col>
          ) : (
            // Show all three amount fields for regular invoices
            <>
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
            </>
          )}

          <Col xs={12} md={2}>
            <InputField
              label="Remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
            />
          </Col>

          <div className="form-buttons" style={{ marginTop: "0px" }}>
            <Button
              onClick={handleClose}
              style={{
                backgroundColor: "gray",
                borderColor: "gray",
                marginLeft: "5px",
              }}
            >
              Close
            </Button>
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
              disabled={isSubmitted}
              style={{
                backgroundColor: isSubmitted ? "#a36e29" : "#a36e29",
                borderColor: isSubmitted ? "#a36e29" : "#a36e29",
                cursor: isSubmitted ? "not-allowed" : "pointer",
              }}
              onClick={handleSubmit}
            >
              {isSubmitted
                ? id
                  ? "Updated"
                  : "Saved"
                : id
                  ? "Update"
                  : "Save"}
            </Button>
          </div>
        </Row>

        {/* Only show invoice items table if not advance payment */}
        {!formData.is_advance && (
          <Row className="payments-form-section">
            <h4>Invoice Item Details</h4>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Bar Code</th>
                  <th>Product Name</th>
                  <th>Metal</th>
                  <th>Purity</th>
                  <th>Gross Wt</th>
                  <th>Stone Wt</th>
                  <th>W.Wt</th>
                  <th>Total Wt</th>
                  <th>MC</th>
                  <th>Rate / Piece Cost</th>
                  <th>Tax Amt</th>
                  <th>Total Price</th>
                  <th>Sale Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {repeatedData.length > 0 ? (
                  repeatedData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.code}</td>
                      <td>{item.product_name}</td>
                      <td>{item.metal_type}</td>
                      <td>{item.selling_purity}</td>
                      <td>{item.gross_weight}</td>
                      <td>{item.stone_weight}</td>
                      <td>{item.wastage_weight}</td>
                      <td>{item.total_weight_av}</td>
                      <td>{item.making_charges}</td>
                      <td>{item.pieace_cost ? item.pieace_cost : item.rate}</td>
                      <td>{item.tax_amt}</td>
                      <td>{item.total_price}</td>
                      <td>{item.sale_status}</td>
                      <td>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() =>
                            handleStatusUpdate(item.id, item.sale_status)
                          }
                        >
                          {item.sale_status === "Delivered"
                            ? "Mark Not Delivered"
                            : "Mark Delivered"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={14} className="text-center">
                      No item Details available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Row>
        )}

        {/* Show advance payment message if advance is selected */}
        {formData.is_advance && (
          <Row className="payments-form-section">
            <div className="alert alert-info text-center">
              <h5>Advance Payment</h5>
              <p>
                This is an advance payment receipt. Please enter the advance
                amount in the field above.
              </p>
            </div>
          </Row>
        )}

        <div className="form-buttons" style={{ marginTop: "0px" }}>
          <Button
            variant="secondary"
            className="cus-back-btn"
            type="button"
            onClick={handleBack}
          >
            Back
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default RepairForm;
