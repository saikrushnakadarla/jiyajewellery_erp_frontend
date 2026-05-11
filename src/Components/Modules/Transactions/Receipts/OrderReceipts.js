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
    console.log("location=", location)
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
    const [repeatedData, setRepeatedData] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);


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
        const fetchRepairs = async () => {
            try {
                const response = await axios.get(`${baseURL}/get-unique-order-details`);

                const filteredData = response.data.filter(
                    item => item.transaction_status === 'Orders' || item.transaction_status === "ConvertedInvoice"
                );

                setRepairDetails(filteredData);
                console.log("filteredData =", filteredData);
            } catch (error) {
                console.error('Error fetching repair details:', error);
            }
        };

        fetchRepairs();
    }, []);

    useEffect(() => {
        const fetchRepairDetailsByInvoice = async () => {
            if (formData.invoice_number) {
                try {
                    const response = await axios.get(`${baseURL}/get-order-details/${formData.invoice_number}`);
                    console.log("Detailed repair data:", response.data);

                    // Filter by transaction_status and set repeatedData
                    const filteredData = (response.data.repeatedData || []).filter(
                        item => item.transaction_status === "Orders" 
                    );

                    setRepeatedData(filteredData);

                } catch (error) {
                    console.error('Error fetching repair details by invoice number:', error);
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

                // Always reset invoice and amounts if account_name changes
                updatedData.invoice_number = "";
                updatedData.total_amt = "";
                updatedData.cash_amt = "";
                setInvoiceNumberOptions([]);

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
                            value: item.order_number,
                            label: item.order_number,
                        }));

                    setInvoiceNumberOptions(filteredInvoices);
                }
            }

            if (name === "mobile") {
                const match = accountData.find((item) => item.mobile === value);
                updatedData.account_name = match?.account_name || "";

                // Always reset invoice and amounts if mobile changes
                updatedData.invoice_number = "";
                updatedData.total_amt = "";
                updatedData.cash_amt = "";
                setInvoiceNumberOptions([]);

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
                            value: item.order_number,
                            label: item.order_number,
                        }));

                    setInvoiceNumberOptions(filteredInvoices);
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
                    alert("Paid amount cannot be greater than total amount.");

                    // Reset the discount_amt if it's greater than total
                    updatedData.discount_amt = ""; // or you can set it to totalAmt
                    updatedData.cash_amt = "";
                } else {
                    updatedData.cash_amt = (totalAmt - discountAmt).toFixed(2);
                }
            }


            // Update `invoiceNumberOptions` when `account_name` changes
            if (name === "account_name") {
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

                        return total > 0; // Only include invoices with non-zero balance
                    })
                    .map((item) => ({
                        value: item.order_number,
                        label: item.order_number,
                    }));

                setInvoiceNumberOptions(filteredInvoices);

            }

            // Update `total_amt` when `invoice_number` changes
            if (name === "invoice_number") {
                if (value === "") {
                    // Clear total_amt, cash_amt, and discount_amt when invoice_number is cleared
                    updatedData.total_amt = "";
                    updatedData.cash_amt = "";
                    updatedData.discount_amt = "";
                    setRepeatedData([]);
                } else {
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

                        updatedData.total_amt = total.toFixed(2);

                        // If there is already a value in discount_amt or cash_amt, clear them
                        if (updatedData.discount_amt || updatedData.cash_amt) {
                            updatedData.discount_amt = "";
                            updatedData.cash_amt = "";
                        }
                    }
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
                                value: item.order_number,
                                label: item.order_number,
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = id
                ? `${baseURL}/edit/orderreceipt/${id}`
                : `${baseURL}/post/orderpayments`;
            const method = id ? "PUT" : "POST";

            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to save data");

            alert(`Receipt ${id ? "updated" : "saved"} successfully!`);
            setIsSubmitted(true);

            console.log("FormData being passed to PDF generation:", formData);

            // Generate PDF
            const pdfBlob = await pdf(
                <PDFContent formData={formData} repairDetails={repairDetails} />
            ).toBlob();

            saveAs(pdfBlob, `${formData.receipt_no}.pdf`);
            await handleSavePDFToServer(pdfBlob, formData.receipt_no);

            // Create download link and trigger download
            // const link = document.createElement("a");
            // link.href = URL.createObjectURL(pdfBlob);
            // link.download = `receipt-${formData.receipt_no || "new"}.pdf`;
            // link.click();
            // URL.revokeObjectURL(link.href);

            // Navigate to receipts table
            // navigate("/receiptstable");
            navigate(-1);
        } catch (error) {
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
                invoice_number: invoiceData.order_number || "",
                mobile: invoiceData.mobile || "",
                total_amt: invoiceData.total_amt || ""
            };

            // Get filtered invoice options
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
                    value: item.order_number,
                    label: item.order_number,
                }));

            setInvoiceNumberOptions(filteredInvoices);


            // Calculate total amount based on invoice_number if present
            const selectedInvoice = repairDetails?.find(
                (item) => item.order_number === invoiceData.order_number
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


    // const handleBack = () => {
    //   const from = location.state?.from || "/receiptstable"; // Default to /receiptstable if no from location provided
    //   navigate(from);
    // };

    const handleBack = () => {
        navigate(-1); // Go back one step in the browser history
    };

    const handleStatusUpdate = async (id, currentStatus) => {
        const newStatus = currentStatus === "Delivered" ? "Not Delivered" : "Delivered";

        try {
            const response = await axios.put(`${baseURL}/update-repair-status/${id}`, {
                sale_status: newStatus
            });

            if (response.status === 200) {
                const updatedData = repeatedData.map(item =>
                    item.id === id ? { ...item, sale_status: newStatus } : item
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
                    {/* <Col xs={12} md={2}>
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
              label="Account Name"
              type="select"
              name="account_name"
              value={formData.account_name}
              onChange={handleInputChange}
              options={accountOptions}
              autoFocus
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
          </Col> */}
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
                        {invoiceData?.order_number ? (
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
                    <div className="form-buttons" style={{ marginTop: '0px' }}>
                        <Button
                            onClick={handleClose}
                            style={{ backgroundColor: "gray", borderColor: "gray", marginLeft: "5px" }}
                        // disabled={!isSubmitEnabled}
                        >
                            Close
                        </Button>
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
                            disabled={isSubmitted}
                            style={{
                                backgroundColor: isSubmitted ? "#a36e29" : "#a36e29",
                                borderColor: isSubmitted ? "#a36e29" : "#a36e29",
                                cursor: isSubmitted ? "not-allowed" : "pointer",
                            }}
                            onClick={handleSubmit}
                        >
                            {isSubmitted ? (id ? "Updated" : "Saved") : id ? "Update" : "Save"}
                        </Button>

                    </div>
                </Row>
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
                                {/* {userName === "ADMIN" && <th>Action</th>} */}
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
                                        {/* {userName === "ADMIN" && ( */}
                                        <td>
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleStatusUpdate(item.id, item.sale_status)}
                                            >
                                                {item.sale_status === "Delivered" ? "Mark Not Delivered" : "Mark Delivered"}
                                            </button>
                                        </td>
                                        {/* )} */}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={14} className="text-center">
                                        {/* <td colSpan={role === "admin" ? 14 : 13} className="text-center"> */}
                                        No item Details available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>



                </Row>
                <div className="form-buttons" style={{ marginTop: '0px' }}>
                    <Button
                        variant="secondary"
                        className="cus-back-btn"
                        type="button"
                        // onClick={() => navigate("/receiptstable")}
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
