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

    const [formData, setFormData] = useState({
        sales_id: receivedData.sales_id || "",
        invoice: receivedData.invoice || "",
        category: receivedData.category || "",
        total_pure_wt: "",
        rate_cut_wt: "",
        rate_cut: "",
        rate_cut_amt: "",
        paid_amount: "",
        balance_amount: "",
        paid_wt: "",
    });

    const [isEditable] = useState(false);
    const [rateCuts, setRateCuts] = useState([]);
    const [loadingBalance, setLoadingBalance] = useState(true);

    // Fetch LIVE balance from backend — never computed locally, cannot drift
    useEffect(() => {
        const fetchBalance = async () => {
            if (!receivedData.sales_id) {
                setLoadingBalance(false);
                return;
            }
            try {
                const response = await axios.get(
                    `${baseURL}/sales-balance/${receivedData.sales_id}`,
                    { params: { total_weight_av: receivedData.total_weight_av || 0 } }
                );
                setFormData(prev => ({
                    ...prev,
                    total_pure_wt: Number(response.data.balance_weight).toFixed(3),
                }));
            } catch (error) {
                console.error("Error fetching live balance:", error);
                setFormData(prev => ({ ...prev, total_pure_wt: "0.000" }));
            } finally {
                setLoadingBalance(false);
            }
        };
        fetchBalance();
    }, [receivedData.sales_id, receivedData.total_weight_av]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            let updatedData = { ...prevData, [name]: value };

            if (name === "rate_cut_wt" && parseFloat(value) > parseFloat(prevData.total_pure_wt)) {
                alert("Rate Cut Weight cannot be greater than Balance Weight.");
                return prevData;
            }

            if (updatedData.rate_cut_wt && updatedData.rate_cut) {
                updatedData.rate_cut_amt =
                    parseFloat(updatedData.rate_cut_wt) * parseFloat(updatedData.rate_cut);
            }

            const paidAmount = updatedData.paid_amount ? parseFloat(updatedData.paid_amount) : 0;
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
            alert("Sales RateCut added successfully!");
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
                setRateCuts(
                    response.data.filter(rc => rc.sales_id === receivedData.sales_id)
                );
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
                    <Col xs={12} md={2}>
                        <InputField
                            label="Balance Weight"
                            name="total_pure_wt"
                            value={loadingBalance ? "Loading..." : formData.total_pure_wt}
                            onChange={handleInputChange}
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

                    <div className="form-buttons" style={{ marginTop: '-1px' }}>
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