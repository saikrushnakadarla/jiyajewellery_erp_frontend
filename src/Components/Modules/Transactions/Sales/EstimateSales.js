import React, { useState, useEffect } from "react";
import "./SalesForm.css";
import { Container, Row, Col, Table, Form } from "react-bootstrap";
import baseURL from "../../../../Url/NodeBaseURL";
import axios from 'axios';
import InputField from "../../Masters/ItemMaster/Inputfield";

const RepairForm = () => {
    const [data, setData] = useState([]);
    const [selectedEstimate, setSelectedEstimate] = useState("");
    const [estimateDetails, setEstimateDetails] = useState(null);
    const [stock, setStock] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${baseURL}/get-unique-estimates`);
                setData(response.data);
            } catch (error) {
                console.error('Error fetching estimate details:', error);
            }
        };
        fetchData();
    }, []);
    useEffect(() => {
        fetch(`${baseURL}/get/opening-tags-entry`) // Correct URL
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch stock entries");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Fetched Stock Data:", data); // Log the entire response to see its structure
                setStock(data.result); // Use data.result since the backend sends { result: [...] }
                console.log("Updated Stock State:", data.result); // Log the updated state value
            })
            .catch((error) => {
                console.error("Error fetching stock entries:", error);
            });
    }, []);

    const fetchEstimateDetails = async (estimate_number) => {
        if (!estimate_number) return;

        try {
            const response = await axios.get(`${baseURL}/get-estimates/${estimate_number}`);

            // First, update the state with the full estimate details
            setEstimateDetails(response.data);

            if (!stock) {
                console.warn("Stock data not yet available!");
                return;
            }

            // Filter only matching repeatedData items
            const filteredData = response.data.repeatedData.filter(item =>
                stock.some(stockItem => stockItem.PCode_BarCode === item.code && stockItem.Status === "Available")
            );

            // Store only filtered data in localStorage
            if (filteredData.length > 0) {
                localStorage.setItem("repairDetails", JSON.stringify(filteredData));
            } else {
                localStorage.removeItem("repairDetails"); // Remove if no matching data
            }
        } catch (error) {
            console.error('Error fetching selected estimate details:', error);
        }
    };

    const handleEstimateChange = (e) => {
        const selectedValue = e.target.value;
        setSelectedEstimate(selectedValue);

        if (selectedValue) {
            fetchEstimateDetails(selectedValue);
        } else {
            setEstimateDetails(null);
            localStorage.removeItem("repairDetails");
        }
    };

    return (
        <div className="main-container">
            <Container className="sales-form-container">
                <Form>
                    <h3 style={{ marginTop: '-45px', marginBottom: '10px', textAlign: 'left', color: '#a36e29' }}>Sales</h3>
                    <div className="sales-form-section">
                        <Col>
                            <Row>
                                {/* Dropdown for selecting estimate_number */}
                                <InputField
                                    label="Estimate Number"
                                    type="select"
                                    value={selectedEstimate}
                                    onChange={handleEstimateChange}
                                    options={[
                                        { value: "", label: "Select Estimate" }, // Default empty option
                                        ...data.map((item) => ({
                                            value: item.estimate_number,
                                            label: item.estimate_number
                                        }))
                                    ]}
                                />
                            </Row>

                            {/* Display Unique Estimate Data */}
                            {estimateDetails && estimateDetails.uniqueData && (
                                <Row className="mt-3">
                                    <Col>
                                        <h5>Estimate Details</h5>
                                        <p><strong>Estimate Number:</strong> {estimateDetails.uniqueData.estimate_number}</p>
                                        <p><strong>Date:</strong> {new Date(estimateDetails.uniqueData.date).toLocaleDateString()}</p>
                                        <p><strong>Net Amount:</strong> ₹{estimateDetails.uniqueData.net_amount}</p>
                                        <p><strong>Tax Amount:</strong> ₹{estimateDetails.uniqueData.tax_amount}</p>
                                        <p><strong>Taxable Amount:</strong> ₹{estimateDetails.uniqueData.taxable_amount}</p>
                                        <p><strong>Total Amount:</strong> ₹{estimateDetails.uniqueData.total_amount}</p>
                                    </Col>
                                </Row>
                            )}

                            {/* Display Repeated Product Details */}
                            {estimateDetails && estimateDetails.repeatedData && estimateDetails.repeatedData.length > 0 && (
                                <Row className="mt-3">
                                    <Col>
                                        <h5>Product Details</h5>
                                        <Table striped bordered hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Product Name</th>
                                                    <th>Category</th>
                                                    <th>Design Name</th>
                                                    <th>Purity</th>
                                                    <th>Gross Weight</th>
                                                    <th>Rate</th>
                                                    <th>Total Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {estimateDetails.repeatedData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{item.product_name}</td>
                                                        <td>{item.category}</td>
                                                        <td>{item.design_name}</td>
                                                        <td>{item.purity}</td>
                                                        <td>{item.gross_weight} g</td>
                                                        <td>₹{item.rate}</td>
                                                        <td>₹{item.total_rs}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                            )}
                        </Col>
                    </div>
                </Form>
            </Container>
        </div>
    );
};

export default RepairForm;
