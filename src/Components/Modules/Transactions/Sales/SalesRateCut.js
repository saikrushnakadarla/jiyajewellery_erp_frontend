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
    console.log("bal_after_receipts=", receivedData.bal_after_receipts);

    const [formData, setFormData] = useState({
        sales_id: receivedData.sales_id || "",
        invoice: receivedData.invoice || "",
        category: receivedData.category || "",
        total_pure_wt: "",        // This will be current balance weight (after conversion)
        rate_cut_wt: "",
        rate_cut: "",
        rate_cut_amt: "",
        paid_amount: "",
        balance_amount: "",
        paid_wt: "",
    });

    const [isEditable, setIsEditable] = useState(false);
    const [rateCuts, setRateCuts] = useState([]);
    const [goldRate, setGoldRate] = useState(0);
    const [currentBalanceAmount, setCurrentBalanceAmount] = useState(0);
    const [currentBalanceWeight, setCurrentBalanceWeight] = useState(0);

    // ✅ Fetch current gold rate (22crt)
    useEffect(() => {
        const fetchGoldRate = async () => {
            try {
                const response = await axios.get(`${baseURL}/get/current-rates`);
                const rate = parseFloat(response.data?.rate_22crt || 0);
                setGoldRate(rate);
            } catch (error) {
                console.error("Error fetching gold rate:", error);
            }
        };
        fetchGoldRate();
    }, []);

    // ✅ Fetch existing rate cuts for this sale
    useEffect(() => {
        const fetchRateCuts = async () => {
            try {
                const response = await axios.get(`${baseURL}/sales-rateCuts`);
                const filtered = response.data.filter(
                    (rateCut) => rateCut.sales_id === receivedData.sales_id
                );
                setRateCuts(filtered);
            } catch (error) {
                console.error("Error fetching sales rateCuts:", error);
            }
        };
        if (receivedData.sales_id) fetchRateCuts();
    }, [receivedData.sales_id]);

    // ✅ Compute current balance amount and weight
    useEffect(() => {
        if (!receivedData.sales_id) return;

        // Original balance amount (before any ratecuts)
        const originalBalanceAmount = Number(receivedData.bal_after_receipts) || 0;

        // Sum of all previous ratecut amounts (already consumed)
        const totalUsedAmount = rateCuts.reduce(
            (sum, rc) => sum + (parseFloat(rc.rate_cut_amt) || 0),
            0
        );

        // Current remaining balance amount = original − used
        const remainingAmount = Math.max(0, originalBalanceAmount - totalUsedAmount);
        setCurrentBalanceAmount(remainingAmount);

        // Convert to weight using current gold rate
        if (goldRate > 0) {
            const weight = remainingAmount / goldRate;
            setCurrentBalanceWeight(weight);
        }

        // Seed form's total_pure_wt and balance_amount
        setFormData(prev => ({
            ...prev,
            total_pure_wt: goldRate > 0 ? (remainingAmount / goldRate).toFixed(3) : "",
            balance_amount: remainingAmount.toFixed(2),
        }));
    }, [rateCuts, goldRate, receivedData.sales_id, receivedData.bal_after_receipts]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            let updatedData = { ...prevData, [name]: value };

            // Validate rate_cut_wt shouldn't exceed balance weight
            if (name === "rate_cut_wt" &&
                parseFloat(value) > parseFloat(prevData.total_pure_wt || 0)) {
                alert("Rate Cut Weight cannot be greater than Balance Weight.");
                return prevData;
            }

            // Auto-calculate rate_cut_amt
            if (updatedData.rate_cut_wt && updatedData.rate_cut) {
                updatedData.rate_cut_amt =
                    parseFloat(updatedData.rate_cut_wt) * parseFloat(updatedData.rate_cut);
            }

            // Calculate balance_amount
            let paidAmount = updatedData.paid_amount ? parseFloat(updatedData.paid_amount) : 0;
            if (updatedData.rate_cut_amt !== undefined) {
                if (paidAmount > updatedData.rate_cut_amt) {
                    alert("Paid Amount cannot be greater than Rate Cut Amount.");
                    return prevData;
                }
                updatedData.balance_amount = updatedData.rate_cut_amt - paidAmount;
            }

            return updatedData;
        });
    };

    const handleBack = () => navigate("/salestable");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${baseURL}/sales-ratecuts`, formData);
            alert("RateCut added successfully!");
            navigate("/salestable");
        } catch (error) {
            console.error("Error saving data:", error);
            alert("Failed to save data.");
        }
    };

    return (
        <div className="main-container">
            <Container className="payments-form-container">
                <Row className="payments-form-section">
                    <h4 className="mb-4">Sales Rate Cut</h4>

                    <Col xs={12} md={2}>
                        <InputField
                            label="Invoice"
                            name="invoice"
                            value={formData.invoice}
                            onChange={handleInputChange}
                            readOnly={!isEditable}
                        />
                    </Col>
                    <Col xs={12} md={2}>
                        <InputField
                            label="Category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            readOnly={!isEditable}
                        />
                    </Col>
                    <Col xs={12} md={2}>
                        <InputField
                            label={`Balance Weight (Rate: ${goldRate})`}
                            name="total_pure_wt"
                            value={formData.total_pure_wt}
                            onChange={handleInputChange}
                            readOnly={!isEditable}
                        />
                    </Col>

                    <Col xs={12} md={2}>
                        <InputField
                            label="Rate Cut Wt"
                            type="number"
                            name="rate_cut_wt"
                            value={formData.rate_cut_wt}
                            onChange={handleInputChange}
                        />
                    </Col>
                    <Col xs={12} md={2}>
                        <InputField
                            label="Rate Cut"
                            type="number"
                            name="rate_cut"
                            value={formData.rate_cut}
                            onChange={handleInputChange}
                        />
                    </Col>
                    <Col xs={12} md={2}>
                        <InputField
                            label="Rate Cut Amt"
                            type="number"
                            name="rate_cut_amt"
                            value={formData.rate_cut_amt}
                            onChange={handleInputChange}
                        />
                    </Col>
                    <Col xs={12} md={2}>
                        <InputField
                            label="Paid Amt"
                            type="number"
                            name="paid_amount"
                            value={formData.paid_amount}
                            onChange={handleInputChange}
                        />
                    </Col>
                    <Col xs={12} md={2}>
                        <InputField
                            label="Bal Amt"
                            type="number"
                            name="balance_amount"
                            value={formData.balance_amount}
                            onChange={handleInputChange}
                        />
                    </Col>
                    <div className="form-buttons" style={{ marginTop: '-1px' }}>
                        <Button variant="secondary" className="cus-back-btn" type="button" onClick={handleBack}>
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

                    <h4 className="mb-4 mt-4">Rate Cuts List</h4>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>S No</th>
                                <th>Invoice</th>
                                <th>Category</th>
                                <th>Rate Cut Wt</th>
                                <th>Rate Cut</th>
                                <th>Rate Cut Amt</th>
                                <th>Paid Amt</th>
                                <th>Bal Amt</th>
                                <th>Paid Wt</th>
                                <th>Bal Wt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rateCuts.length > 0 ? (
                                rateCuts.map((rateCut, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{rateCut.invoice}</td>
                                        <td>{rateCut.category}</td>
                                        <td>{rateCut.rate_cut_wt}</td>
                                        <td>{rateCut.rate_cut}</td>
                                        <td>{rateCut.rate_cut_amt}</td>
                                        <td>{rateCut.paid_amount}</td>
                                        <td>{rateCut.balance_amount}</td>
                                        <td>{rateCut.paid_wt}</td>
                                        <td>{rateCut.bal_wt}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center">
                                        No rate cuts available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Row>
            </Container>
        </div>
    );
};

export default SalesRateCut;