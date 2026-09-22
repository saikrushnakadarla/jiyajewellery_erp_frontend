import React, { useState, useEffect } from "react";
import InputField from "../../../Pages/InputField/InputField";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import baseURL from "../../../../Url/NodeBaseURL";
import axios from 'axios';

const SalesPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const receivedData = location.state || {};

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        mode: "Cash",
        cheque_number: "",
        payment_no: "",
        account_name: receivedData.account_name || "",
        invoice: receivedData.invoice || "",
        category: receivedData.category || "",
        rate_cut: "",
        total_wt: "",
        paid_wt: "",
        bal_wt: "",
        total_amt: "",
        paid_amt: "",
        bal_amt: "",
        remarks: "",
        rate_cut_id: "",
        paid_by: "",
    });

    const [sales, setSales] = useState([]);
    const [rateCuts, setRateCuts] = useState([]);
    const [accountOptions, setAccountOptions] = useState([]);
    const [invoiceOptions, setInvoiceOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [rateCutIdOptions, setRateCutIdOptions] = useState([]);

    useEffect(() => {
        const fetchLastPaymentNumber = async () => {
            try {
                const response = await axios.get(`${baseURL}/lastSalesPaymentNumber`);
                setFormData((prev) => ({
                    ...prev,
                    payment_no: response.data.lastPaymentNumber,
                }));
            } catch (error) {
                console.error("Error fetching payment number:", error);
            }
        };
        fetchLastPaymentNumber();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let updatedFormData = { ...formData, [name]: value };

        if (name === "rate_cut_id" && value === "") {
            updatedFormData = {
                ...updatedFormData,
                rate_cut: "",
                total_amt: "",
                total_wt: "",
            };
        }

        if (name === "paid_amt") {
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

            updatedFormData = {
                ...updatedFormData,
                bal_amt: balAmt,
                paid_wt: paidWt,
                bal_wt: balWt,
                paid_by: "By Amount",
            };
        }

        setFormData(updatedFormData);
    };

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
        const fetchSales = async () => {
            try {
                const response = await axios.get(`${baseURL}/get/sales`);
                setSales(response.data);
            } catch (error) {
                console.error("Error fetching sales:", error);
            }
        };
        fetchSales();
    }, []);

    useEffect(() => {
        if (formData.account_name) {
            const filteredInvoices = sales
                .filter((sale) => sale.account_name === formData.account_name)
                .map((sale) => sale.invoice_number);
            const uniqueInvoices = [...new Set(filteredInvoices)].map((invoice) => ({
                value: invoice,
                label: invoice,
            }));
            setInvoiceOptions(uniqueInvoices);
        } else {
            setInvoiceOptions([]);
        }
    }, [formData.account_name, sales]);

    useEffect(() => {
        if (formData.invoice) {
            const filteredCategories = sales
                .filter((sale) => sale.invoice_number === formData.invoice)
                .map((sale) => sale.category || sale.product_name);
            const uniqueCategories = [...new Set(filteredCategories)].map((category) => ({
                value: category,
                label: category,
            }));
            setCategoryOptions(uniqueCategories);
        } else {
            setCategoryOptions([]);
        }
    }, [formData.invoice, sales]);

    useEffect(() => {
        const fetchRateCuts = async () => {
            try {
                const response = await axios.get(`${baseURL}/sales-rateCuts`);
                setRateCuts(response.data);
            } catch (error) {
                console.error("Error fetching rateCuts:", error);
            }
        };
        fetchRateCuts();
    }, []);

    useEffect(() => {
        if (formData.invoice && formData.category) {
            const matchingRateCuts = rateCuts.filter(
                (rateCut) =>
                    rateCut.invoice === formData.invoice &&
                    rateCut.category === formData.category
            );

            setRateCutIdOptions(
                matchingRateCuts.map((rateCut) => ({
                    label: rateCut.rate_cut_id?.toString() || "",
                    value: rateCut.rate_cut_id || "",
                }))
            );
        }
    }, [formData.invoice, formData.category, rateCuts]);

    useEffect(() => {
        if (receivedData.Pricing === "By fixed") {
            const matchingRateCut = rateCuts.find(
                (rateCut) => rateCut.sales_id === receivedData.sales_id
            );

            if (matchingRateCut) {
                setFormData((prevState) => ({
                    ...prevState,
                    total_amt: matchingRateCut.balance_amount,
                    rate_cut_id: matchingRateCut.rate_cut_id,
                }));
            }
        } else if (formData.invoice && formData.category && formData.rate_cut_id) {
            const matchingRateCut = rateCuts.find(
                (rateCut) =>
                    rateCut.invoice === formData.invoice &&
                    rateCut.category === formData.category &&
                    rateCut.rate_cut_id === formData.rate_cut_id
            );

            if (matchingRateCut) {
                setFormData((prevState) => ({
                    ...prevState,
                    rate_cut: matchingRateCut.rate_cut,
                    total_amt: matchingRateCut.balance_amount,
                    total_wt: matchingRateCut.bal_wt,
                }));
            }
        }
    }, [formData.invoice, formData.category, formData.rate_cut_id, rateCuts, receivedData]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`${baseURL}/salesPayments`, formData);
            alert("Sales Payment Added Successfully!");
            navigate("/salestable");
        } catch (error) {
            console.error("Error submitting data:", error);
            alert(`Error: ${error.response?.data?.message || "Failed to add sales payment."}`);
        }
    };

    const handleBack = () => navigate("/salestable");

    const getTabId = () => {
        const urlParams = new URLSearchParams(window.location.search);
        let tabId = urlParams.get('tabId');
        if (!tabId) tabId = sessionStorage.getItem('tabId');
        if (!tabId) {
            tabId = crypto.randomUUID();
            sessionStorage.setItem('tabId', tabId);
            const newUrl = `${window.location.pathname}?tabId=${tabId}`;
            window.history.replaceState({}, '', newUrl);
        }
        return tabId;
    };

    const tabId = getTabId();
    const handleClose = () => navigate(`/sales?tabId=${tabId}`);

    return (
        <div className="main-container">
            <Container className="payments-form-container">
                <Row className="payments-form-section">
                    <h4 className="mb-4">Sales Payments</h4>

                    <Col xs={12} md={2}>
                        <InputField
                            label="Date"
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            max={new Date().toISOString().split("T")[0]}
                        />
                    </Col>
                    <Col xs={12} md={2}>
                        <InputField
                            label="Payment No."
                            name="payment_no"
                            value={formData.payment_no}
                            onChange={handleInputChange}
                            readOnly
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
                            options={accountOptions}
                        />
                    </Col>
                    <Col xs={12} md={2}>
                        <InputField
                            label="Invoice"
                            type="select"
                            name="invoice"
                            value={formData.invoice}
                            onChange={handleInputChange}
                            options={invoiceOptions}
                        />
                    </Col>
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
                    {receivedData.Pricing !== "By fixed" && (
                        <>
                            <Col xs={12} md={2}>
                                <InputField
                                    label="Rate Cut Id"
                                    type="select"
                                    name="rate_cut_id"
                                    value={formData.rate_cut_id}
                                    onChange={handleInputChange}
                                    options={rateCutIdOptions}
                                />
                            </Col>
                            <Col xs={12} md={2}>
                                <InputField
                                    label="Rate Cut"
                                    name="rate_cut"
                                    value={formData.rate_cut}
                                    onChange={handleInputChange}
                                />
                            </Col>
                        </>
                    )}
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
                            name="paid_amt"
                            value={formData.paid_amt}
                            onChange={handleInputChange}
                        />
                    </Col>
                    <Col xs={12} md={2}>
                        <InputField
                            label="Bal Amt"
                            type="number"
                            name="bal_amt"
                            value={formData.bal_amt}
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
                        onClick={handleClose}
                        style={{ backgroundColor: "gray", borderColor: "gray", marginLeft: "5px" }}
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
                        style={{ backgroundColor: "#a36e29", borderColor: "#a36e29" }}
                        onClick={handleSubmit}
                    >
                        Save
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default SalesPayment;