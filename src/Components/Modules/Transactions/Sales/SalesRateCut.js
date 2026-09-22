import React, { useState, useEffect } from "react";
import InputField from "../../../Pages/InputField/InputField";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import baseURL from "../../../../Url/NodeBaseURL";
import axios from "axios";

const SalesRateCut = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const receivedData = location.state || {};

    console.log("🔵 receivedData:", receivedData);
    console.log("🔵 bal_after_receipts:", receivedData.bal_after_receipts);

    // ✅ Seed balance_amount with bal_after_receipts
    const initialBalanceAmount =
        receivedData.bal_after_receipts !== undefined &&
        receivedData.bal_after_receipts !== null &&
        receivedData.bal_after_receipts !== ""
            ? String(receivedData.bal_after_receipts)
            : "";

    const [formData, setFormData] = useState({
        sales_id: receivedData.sales_id || "",
        invoice: receivedData.invoice || "",
        category: receivedData.category || "",
        rate_cut_wt: "",
        rate_cut: "",
        rate_cut_amt: "",
        paid_amount: "",
        balance_amount: initialBalanceAmount,
    });

    const [isEditable] = useState(false);
    const [rateCuts, setRateCuts] = useState([]);
    const [rate22crt, setRate22crt] = useState(0);

    // ✅ Fetch current 22crt rate
    useEffect(() => {
        const fetchCurrentRate = async () => {
            try {
                const response = await axios.get(`${baseURL}/get/current-rates`);
                const rate = parseFloat(response.data?.rate_22crt || 0);
                console.log("🟢 rate_22crt fetched:", rate);
                setRate22crt(rate);
            } catch (error) {
                console.error("🔴 Error fetching rates:", error);
            }
        };
        fetchCurrentRate();
    }, []);

    // ✅ DERIVED VALUES — always in sync, never stale
    const balanceAmountNum = Number(formData.balance_amount) || 0;
    const balanceWeight =
        rate22crt > 0 && balanceAmountNum > 0
            ? (balanceAmountNum / rate22crt).toFixed(3)
            : "";

    const paidAmountNum = Number(formData.paid_amount) || 0;
    const paidWeight =
        rate22crt > 0 && paidAmountNum > 0
            ? (paidAmountNum / rate22crt).toFixed(3)
            : "";

    console.log(
        "🟡 balanceAmountNum:", balanceAmountNum,
        "rate22crt:", rate22crt,
        "balanceWeight:", balanceWeight
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            let updatedData = { ...prevData, [name]: value };

            // Auto-calc Rate Cut Amount = Rate Cut Wt × Rate Cut
            if (updatedData.rate_cut_wt && updatedData.rate_cut) {
                updatedData.rate_cut_amt =
                    parseFloat(updatedData.rate_cut_wt) *
                    parseFloat(updatedData.rate_cut);
            }

            // Auto-calc Balance Amount = Rate Cut Amt − Paid Amt
            const paidAmount = updatedData.paid_amount
                ? parseFloat(updatedData.paid_amount)
                : 0;

            if (
                updatedData.rate_cut_amt !== undefined &&
                updatedData.rate_cut_amt !== ""
            ) {
                if (paidAmount > parseFloat(updatedData.rate_cut_amt)) {
                    alert("Paid Amount cannot be greater than Rate Cut Amount.");
                    return prevData;
                }
                updatedData.balance_amount =
                    parseFloat(updatedData.rate_cut_amt) - paidAmount;
            }

            return updatedData;
        });
    };

    const handleBack = () => navigate("/salestable");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // ✅ Include derived weights in the payload
            const payload = {
                ...formData,
                total_pure_wt: balanceWeight,
                paid_wt: paidWeight,
            };
            console.log("📤 Submitting:", payload);
            await axios.post(`${baseURL}/sales-ratecuts`, payload);
            alert("RateCut added successfully!");
            navigate("/salestable");
        } catch (error) {
            console.error("Error saving data:", error);
            alert("Failed to save data.");
        }
    };

    useEffect(() => {
        const fetchRateCuts = async () => {
            try {
                const response = await axios.get(`${baseURL}/sales-rateCuts`);
                const filtered = response.data.filter(
                    (rc) => rc.sales_id === receivedData.sales_id
                );
                setRateCuts(filtered);
            } catch (error) {
                console.error("Error fetching rateCuts:", error);
            }
        };
        if (receivedData.sales_id) fetchRateCuts();
    }, [receivedData.sales_id]);

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

                    {/* ✅ Balance Weight — derived, always correct */}
                    <Col xs={12} md={2}>
                        <InputField
                            label={`Balance Weight (Rate: ${rate22crt || 0})`}
                            name="total_pure_wt"
                            value={balanceWeight}
                            onChange={() => {}}
                            readOnly
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

                    <div className="form-buttons" style={{ marginTop: "-1px" }}>
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
                                rateCuts.map((rc, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>{rc.invoice}</td>
                                        <td>{rc.category}</td>
                                        <td>{rc.rate_cut_wt}</td>
                                        <td>{rc.rate_cut}</td>
                                        <td>{rc.rate_cut_amt}</td>
                                        <td>{rc.paid_amount}</td>
                                        <td>{rc.balance_amount}</td>
                                        <td>{rc.paid_wt}</td>
                                        <td>{rc.bal_wt}</td>
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