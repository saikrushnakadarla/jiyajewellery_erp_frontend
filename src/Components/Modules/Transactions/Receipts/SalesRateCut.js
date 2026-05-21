import React, { useState, useEffect } from "react";
import InputField from "../../../Pages/InputField/InputField";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import baseURL from "../../../../Url/NodeBaseURL";
import axios from 'axios';

const SalesRateCut = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const receivedData = location.state || {};
    
    console.log("Received Sales Data in RateCut:", receivedData);
    console.log("repair_id value:", receivedData.repair_id);

    const [formData, setFormData] = useState({
        repair_id: receivedData.repair_id || "",
        invoice_number: receivedData.invoice_number || "",
        account_name: receivedData.account_name || "",
        mobile: receivedData.mobile || "",
        total_amt: receivedData.total_amt || "",
        rate_cut_wt: "",
        rate_cut: "",
        rate_cut_amt: "",
        paid_amount: "",
        balance_amount: "",
        paid_wt: "",
        bal_wt: "",
        transaction_type: "Sales",
    });

    const [rateCuts, setRateCuts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [originalBalance, setOriginalBalance] = useState(receivedData.total_amt || 0);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            let updatedData = { ...prevData, [name]: value };

            // Validate rate_cut_wt
            if (name === "rate_cut_wt" && parseFloat(value) < 0) {
                alert("Rate Cut Weight cannot be negative.");
                return prevData;
            }

            // Auto-calculate rate_cut_amt
            if (updatedData.rate_cut_wt && updatedData.rate_cut) {
                updatedData.rate_cut_amt = (parseFloat(updatedData.rate_cut_wt) * parseFloat(updatedData.rate_cut)).toFixed(2);
            }

            // Calculate paid_wt and balance calculations
            if (updatedData.rate_cut_amt !== undefined && updatedData.rate_cut_amt !== "") {
                let paidAmount = updatedData.paid_amount ? parseFloat(updatedData.paid_amount) : 0;
                
                // Check if paid_amount is greater than rate_cut_amt
                if (paidAmount > parseFloat(updatedData.rate_cut_amt)) {
                    alert("Paid Amount cannot be greater than Rate Cut Amount.");
                    return prevData;
                }

                // Calculate paid_wt based on paid_amount
                if (updatedData.rate_cut && updatedData.rate_cut !== "") {
                    const rateCutValue = parseFloat(updatedData.rate_cut);
                    if (paidAmount > 0 && rateCutValue > 0) {
                        updatedData.paid_wt = (paidAmount / rateCutValue).toFixed(3);
                    } else {
                        updatedData.paid_wt = "0.000";
                    }
                    
                    // Calculate balance
                    updatedData.balance_amount = (parseFloat(updatedData.rate_cut_amt) - paidAmount).toFixed(2);
                    
                    // Calculate bal_wt
                    const rateCutWt = parseFloat(updatedData.rate_cut_wt) || 0;
                    const paidWt = parseFloat(updatedData.paid_wt) || 0;
                    updatedData.bal_wt = (rateCutWt - paidWt).toFixed(3);
                }
            }

            return updatedData;
        });
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate repair_id
        if (!formData.repair_id) {
            alert("Repair ID is missing. Please go back and select a valid invoice.");
            console.error("No repair_id found in formData:", formData);
            return;
        }

        // Validate required fields
        if (!formData.rate_cut_wt || parseFloat(formData.rate_cut_wt) <= 0) {
            alert("Please enter Rate Cut Weight.");
            return;
        }

        if (!formData.rate_cut || parseFloat(formData.rate_cut) <= 0) {
            alert("Please enter Rate Cut value.");
            return;
        }

        if (!formData.paid_amount || parseFloat(formData.paid_amount) <= 0) {
            alert("Please enter Paid Amount.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${baseURL}/sales/ratecuts`, formData);
            alert(`Rate Cut added successfully! ₹${formData.paid_amount} has been deducted from the balance.`);
            console.log("Response:", response.data);
            
            // Update the original balance display
            const newBalance = parseFloat(originalBalance) - parseFloat(formData.paid_amount);
            setOriginalBalance(newBalance.toFixed(2));
            
            // Reset form
            setFormData({
                ...formData,
                rate_cut_wt: "",
                rate_cut: "",
                rate_cut_amt: "",
                paid_amount: "",
                balance_amount: "",
                paid_wt: "",
                bal_wt: "",
            });
            
            // Refresh rate cuts list
            await fetchRateCuts();
            
        } catch (error) {
            console.error("Error saving data:", error);
            alert(`Error: ${error.response?.data?.error || "Failed to save data."}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchRateCuts = async () => {
        if (!formData.repair_id) {
            console.log("No repair_id available to fetch rate cuts");
            return;
        }
        
        try {
            const response = await axios.get(`${baseURL}/sales/rateCuts/by-repair/${formData.repair_id}`);
            console.log("Fetched rate cuts:", response.data);
            setRateCuts(response.data);
        } catch (error) {
            console.error("Error fetching rate cuts:", error);
        }
    };

const fetchUpdatedBalance = async () => {
    if (!formData.repair_id) return;
    
    try {
        const response = await axios.get(`${baseURL}/get-repair-details-by-id/${formData.repair_id}`);
        if (response.data) {
            // Update the balance amount display
            const newBalance = response.data.bal_after_receipts || response.data.bal_amt;
            setOriginalBalance(newBalance);
            setFormData(prev => ({
                ...prev,
                total_amt: newBalance
            }));
            
            // Also update rate cut cumulative values
            if (response.data.rate_cut_paid_amount) {
                console.log("Total rate cut paid so far:", response.data.rate_cut_paid_amount);
            }
        }
    } catch (error) {
        console.error("Error fetching updated balance:", error);
    }
};

    useEffect(() => {
        if (formData.repair_id) {
            fetchRateCuts();
            fetchUpdatedBalance();
        }
    }, [formData.repair_id]);

    const getTabId = () => {
        const urlParams = new URLSearchParams(window.location.search);
        let tabId = urlParams.get('tabId');
        if (!tabId) {
            tabId = sessionStorage.getItem('tabId');
        }
        if (!tabId) {
            tabId = crypto.randomUUID();
            sessionStorage.setItem('tabId', tabId);
            const newUrl = `${window.location.pathname}?tabId=${tabId}`;
            window.history.replaceState({}, '', newUrl);
        }
        return tabId;
    };

    const tabId = getTabId();

    const handleClose = () => {
        navigate(`/sales?tabId=${tabId}`);
    };

    return (
        <div className="main-container">
            <Container className="payments-form-container">
                <Row className="payments-form-section">
                    <h4 className="mb-4">Sales Rate Cut</h4>

                    {!formData.repair_id && (
                        <Col xs={12}>
                            <div className="alert alert-warning">
                                <strong>Warning:</strong> Repair ID is missing. Please go back and select a valid invoice before applying rate cut.
                            </div>
                        </Col>
                    )}

                    <Col xs={12} md={3}>
                        <InputField
                            label="Invoice Number"
                            name="invoice_number"
                            value={formData.invoice_number}
                            onChange={handleInputChange}
                            readOnly
                        />
                    </Col>
                    <Col xs={12} md={3}>
                        <InputField
                            label="Account Name"
                            name="account_name"
                            value={formData.account_name}
                            onChange={handleInputChange}
                            readOnly
                        />
                    </Col>
                    <Col xs={12} md={3}>
                        <InputField
                            label="Mobile"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            readOnly
                        />
                    </Col>
                    <Col xs={12} md={3}>
                        <InputField
                            label="Current Balance Amount"
                            name="total_amt"
                            value={originalBalance}
                            onChange={handleInputChange}
                            readOnly
                        />
                    </Col>

                    <Col xs={12} md={3}>
                        <InputField
                            label="Rate Cut Wt (grams)"
                            type="number"
                            name="rate_cut_wt"
                            value={formData.rate_cut_wt}
                            onChange={handleInputChange}
                            placeholder="Enter weight"
                            step="0.001"
                        />
                    </Col>
                    <Col xs={12} md={3}>
                        <InputField
                            label="Rate Cut (₹ per gram)"
                            type="number"
                            name="rate_cut"
                            value={formData.rate_cut}
                            onChange={handleInputChange}
                            placeholder="Enter rate"
                            step="0.01"
                        />
                    </Col>
                    <Col xs={12} md={3}>
                        <InputField
                            label="Rate Cut Amount"
                            type="number"
                            name="rate_cut_amt"
                            value={formData.rate_cut_amt}
                            onChange={handleInputChange}
                            readOnly
                        />
                    </Col>
                    <Col xs={12} md={3}>
                        <InputField
                            label="Paid Amount (to deduct)"
                            type="number"
                            name="paid_amount"
                            value={formData.paid_amount}
                            onChange={handleInputChange}
                            placeholder="Enter paid amount"
                            step="0.01"
                        />
                    </Col>
                    <Col xs={12} md={3}>
                        <InputField
                            label="Balance Amount"
                            type="number"
                            name="balance_amount"
                            value={formData.balance_amount}
                            onChange={handleInputChange}
                            readOnly
                        />
                    </Col>
                    <Col xs={12} md={3}>
                        <InputField
                            label="Paid Weight"
                            type="number"
                            name="paid_wt"
                            value={formData.paid_wt}
                            onChange={handleInputChange}
                            readOnly
                            step="0.001"
                        />
                    </Col>
                    <Col xs={12} md={3}>
                        <InputField
                            label="Balance Weight"
                            type="number"
                            name="bal_wt"
                            value={formData.bal_wt}
                            onChange={handleInputChange}
                            readOnly
                            step="0.001"
                        />
                    </Col>

                    <div className="form-buttons" style={{ marginTop: '20px' }}>
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
                            disabled={loading || !formData.repair_id}
                        >
                            {loading ? "Processing..." : "Apply Rate Cut & Deduct"}
                        </Button>
                    </div>

                    <h4 className="mb-4 mt-4">Rate Cuts History</h4>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>S No</th>
                                <th>Date</th>
                                <th>Rate Cut Wt</th>
                                <th>Rate Cut</th>
                                <th>Rate Cut Amt</th>
                                <th>Paid Amt (Deducted)</th>
                                <th>Balance After Cut</th>
                                <th>Paid Wt</th>
                                <th>Bal Wt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rateCuts.length > 0 ? (
                                rateCuts.map((rateCut, index) => (
                                    <tr key={rateCut.sales_rate_cut_id || index}>
                                        <td>{index + 1}</td>
                                        <td>{rateCut.created_at ? new Date(rateCut.created_at).toLocaleDateString() : '-'}</td>
                                        <td>{rateCut.rate_cut_wt}</td>
                                        <td>{rateCut.rate_cut}</td>
                                        <td>{rateCut.rate_cut_amt}</td>
                                        <td className="text-danger">- ₹{rateCut.paid_amount}</td>
                                        <td>{rateCut.balance_amount}</td>
                                        <td>{rateCut.paid_wt}</td>
                                        <td>{rateCut.bal_wt}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center">
                                        No rate cuts applied yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                    
                    {rateCuts.length > 0 && (
                        <div className="alert alert-info">
                            <strong>Total Deducted: </strong> 
                            ₹{rateCuts.reduce((sum, cut) => sum + (parseFloat(cut.paid_amount) || 0), 0).toFixed(2)}
                        </div>
                    )}
                </Row>
            </Container>
        </div>
    );
};

export default SalesRateCut;