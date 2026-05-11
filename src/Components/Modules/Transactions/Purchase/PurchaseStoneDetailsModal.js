import React from "react";
import { Modal, Button, Form, Row, Col, Table } from "react-bootstrap";
import InputField from "../../Masters/ItemMaster/Inputfield";
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const StoneDetailsModal = ({
    showPurchase,
    handleClosePurchase,
    purStoneDetails,
    setPurStoneDetails,
    handleAddTagPurStone,
    purchaseStoneList,          
    handleTagPurEditStone,
    handleTagPurDeleteStone,
    editingPurchaseStoneIndex
}) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        let newDetails = { ...purStoneDetails, [name]: value };

        if (name === "stoneWt") {
            const stoneWt = parseFloat(value) || 0;
            newDetails.caratWt = (stoneWt * 5).toFixed(2);
        }

        if (name === "caratWt") {
            const caratWt = parseFloat(value) || 0;
            newDetails.stoneWt = (caratWt / 5).toFixed(2);
        }
        
        if (name === "stoneWt" || name === "stonePrice" || name === "caratWt") {
            const stonePrice = parseFloat(newDetails.stonePrice) || 0;
            const caratWt = parseFloat(newDetails.caratWt) || 0;
            newDetails.amount = (stonePrice * caratWt).toFixed(2);
        }

        setPurStoneDetails(newDetails);
    };

    const totalweight = purchaseStoneList.reduce((sum, stone) => sum + (parseFloat(stone.stoneWt) || 0), 0).toFixed(3);
    const totalprice = purchaseStoneList.reduce((sum, stone) => sum + (parseFloat(stone.amount) || 0), 0).toFixed(2);

    return (
        <Modal show={showPurchase} onHide={handleClosePurchase} centered size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Stone Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col xs={12} md={2}>
                            <InputField label="Stone Name" name="stoneName" value={purStoneDetails.stoneName || ""} onChange={handleChange} />
                        </Col>
                        <Col xs={12} md={2}>
                            <InputField label="Cut" name="cut" value={purStoneDetails.cut || ""} onChange={handleChange} />
                        </Col>
                        <Col xs={12} md={2}>
                            <InputField label="Color" name="color" value={purStoneDetails.color || ""} onChange={handleChange} />
                        </Col>
                        <Col xs={12} md={2}>
                            <InputField label="Clarity" name="clarity" value={purStoneDetails.clarity || ""} onChange={handleChange} />
                        </Col>
                        <Col xs={12} md={2}>
                            <InputField label="Stone Wt" name="stoneWt" type="number" value={purStoneDetails.stoneWt || ""} onChange={handleChange} />
                        </Col>
                        <Col xs={12} md={2}>
                            <InputField label="Carat Wt" name="caratWt" type="number" value={purStoneDetails.caratWt || ""} onChange={handleChange} />
                        </Col>
                        <Col xs={12} md={2}>
                            <InputField label="Stone Price" name="stonePrice" type="number" value={purStoneDetails.stonePrice || ""} onChange={handleChange} />
                        </Col>
                        <Col xs={12} md={2}>
                            <InputField label="Amount" name="amount" type="number" value={purStoneDetails.amount || ""} readOnly />
                        </Col>

                        <Col xs={12} md={2}>
                            <Button
                                style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
                                onClick={handleAddTagPurStone}
                            >
                                {editingPurchaseStoneIndex !== null ? "Update" : "Add"}
                            </Button>
                        </Col>

                    </Row>
                </Form>
                <Table striped bordered hover className="mt-4">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Stone Name</th>
                            <th>Cut</th>
                            <th>Color</th>
                            <th>Clarity</th>
                            <th>Stone Wt</th>
                            <th>Carat Wt</th>
                            <th>Stone Price</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchaseStoneList.length > 0 ? (
                            purchaseStoneList.map((stone, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{stone.stoneName}</td>
                                    <td>{stone.cut}</td>
                                    <td>{stone.color}</td>
                                    <td>{stone.clarity}</td>
                                    <td>{stone.stoneWt}</td>
                                    <td>{stone.caratWt}</td>
                                    <td>{stone.stonePrice}</td>
                                    <td>{stone.amount}</td>
                                    <td>
                                        <FaEdit
                                            style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue' }}
                                            onClick={() => handleTagPurEditStone(index)}
                                        />
                                        <FaTrash
                                            style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
                                            onClick={() => handleTagPurDeleteStone(index)}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="text-center">No stone details available.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
                <div className="col-md-12 d-flex justify-content-end" style={{ marginTop: "30px", marginLeft: "-15px" }}>
                    <div className="me-3">
                        <InputField label="Total Weight:" value={totalweight} readOnly />
                    </div>
                    <div>
                        <InputField label="Total Price:" value={totalprice} readOnly />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClosePurchase}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default StoneDetailsModal;
