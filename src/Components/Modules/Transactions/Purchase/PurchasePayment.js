import React, { useState, useEffect } from "react";
import InputField from "../../../Pages/InputField/InputField";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import baseURL from "../../../../Url/NodeBaseURL";
import axios from 'axios';

const RepairForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const receivedData = location.state || {};
    console.log("Pricing=", receivedData.Pricing)
    console.log("Purchase Id=", receivedData.purchase_id)

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0], // Sets today's date in YYYY-MM-DD format
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

    const [purchases, setPurchases] = useState([]);
    const [rateCuts, setRateCuts] = useState([]);
    const [accountOptions, setAccountOptions] = useState([]);
    const [invoiceOptions, setInvoiceOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [rateCutOptions, setRateCutOptions] = useState([]);
    const [rateCutIdOptions, setRateCutIdOptions] = useState([]);

    useEffect(() => {
        const fetchLastPaymentNumber = async () => {
            try {
                const response = await axios.get(`${baseURL}/lastPaymentNumber`);
                // setFormData(prev => ({ ...prev, payment_no: response.data.lastPaymentNumber }));
                setFormData((prev) => ({
                    ...prev,
                    payment_no: response.data.lastPaymentNumber,
                }));
            } catch (error) {
                console.error("Error fetching invoice_number number:", error);
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
                total_wt: ""
            };
        }

        if (name === "paid_amt") {
            const paidAmt = parseFloat(value) || 0;
            const rateCut = parseFloat(formData.rate_cut) || 1; // Prevent division by zero
            const totalAmt = parseFloat(formData.total_amt) || 0;
            const totalWt = parseFloat(formData.total_wt) || 0;

            if (paidAmt > totalAmt) {
                alert("Paid Amount cannot be greater than Outstanding Amount!");
                return;
            }

            const paidWt = (paidAmt / rateCut).toFixed(3);
            const balAmt = (totalAmt - paidAmt).toFixed(2); // Set to two decimal places
            const balWt = (totalWt - paidWt).toFixed(3);

            updatedFormData = {
                ...updatedFormData,
                bal_amt: balAmt,
                paid_wt: paidWt,
                bal_wt: balWt,
                paid_by: "By Amount"
            };
        } else if (name === "paid_wt") {
            const paidWt = parseFloat(value) || 0;
            const rateCut = parseFloat(formData.rate_cut) || 1; // Prevent multiplication errors
            const totalAmt = parseFloat(formData.total_amt) || 0;
            const totalWt = parseFloat(formData.total_wt) || 0;

            if (paidWt > totalWt) {
                alert("Paid Weight cannot be greater than Outstanding Weight!");
                return;
            }

            const paidAmt = (paidWt * rateCut).toFixed(2);
            const balAmt = (totalAmt - paidAmt).toFixed(2); // Set to two decimal places
            const balWt = (totalWt - paidWt).toFixed(3);

            updatedFormData = {
                ...updatedFormData,
                bal_amt: balAmt,
                paid_amt: paidAmt,
                bal_wt: balWt,
                paid_by: "By Weight"
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
        const fetchPurchases = async () => {
            try {
                const response = await axios.get(`${baseURL}/get/purchases`);
                setPurchases(response.data)
            } catch (error) {
                console.error("Error fetching rateCuts:", error);
            }
        };

        fetchPurchases();
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
        if (formData.invoice) {
            const filteredCategories = purchases
                .filter((purchase) => purchase.invoice === formData.invoice)
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
    }, [formData.invoice, purchases]);

    useEffect(() => {
        const fetchRateCuts = async () => {
            try {
                const response = await axios.get(`${baseURL}/rateCuts`);
                console.log("RateCuts Data:", response.data);
                setRateCuts(response.data)
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

            setRateCutOptions(
                matchingRateCuts.map((rateCut) => ({
                    label: rateCut.rate_cut.toString(),
                    value: rateCut.rate_cut,
                }))
            );

            setRateCutIdOptions(
                matchingRateCuts.map((rateCut) => ({
                    label: rateCut.rate_cut_id?.toString() || "", // Ensure it's a string
                    value: rateCut.rate_cut_id || "",
                }))
            );
        }
    }, [formData.invoice, formData.category, rateCuts]);

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
        navigate(`/sales?tabId=${tabId}`);
      };
    


    useEffect(() => {
        if (receivedData.Pricing === "By fixed") {
            const matchingRateCut = rateCuts.find(
                (rateCut) => rateCut.purchase_id === receivedData.purchase_id
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

            console.log("matchingRateCut=", matchingRateCut);

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

        console.log("Submitting Data:", formData); // Log the form data before sending

        try {
            const response = await axios.post("http://localhost:5001/purchasePayments", formData);
            alert("Purchase Payment Added Successfully!");
            console.log(response.data);

            setFormData({
                date: new Date().toISOString().split("T")[0],
                mode: "Cash",
                cheque_number: "",
                payment_no: "",
                account_name: "",
                invoice: "",
                category: "",
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

            navigate("/purchasetable");
        } catch (error) {
            console.error("Error submitting data:", error);
            console.error("Response Data:", error.response?.data); // Log backend error message
            alert(`Error: ${error.response?.data?.message || "Failed to add purchase payment."}`);
        }
    };


    const handleBack = () => {
        navigate("/purchasetable");
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
                            options={categoryOptions} // Dynamically populated
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
                            {/* <Col xs={12} md={2}>
                        <InputField
                            label="Rate Cut"
                            type="select"
                            name="rate_cut"
                            value={formData.rate_cut}
                            onChange={handleInputChange}
                            options={rateCutOptions}
                        >
                        </InputField>
                    </Col> */}
                            <Col xs={12} md={2}>
                                <InputField
                                    label="Rate Cut"
                                    // type="select"
                                    name="rate_cut"
                                    value={formData.rate_cut}
                                    onChange={handleInputChange}
                                // options={rateCutOptions}
                                >
                                </InputField>
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
                    {/* {receivedData.Pricing !== "By fixed" && (
                        <>
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
                    )} */}

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
                                  style={{ backgroundColor: "gray", borderColor: "gray" , marginLeft:"5px"}}
                                  // disabled={!isSubmitEnabled}
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

export default RepairForm;
