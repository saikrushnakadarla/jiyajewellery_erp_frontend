import React from "react";
import { Modal, Button, Form, Row, Col, Table } from "react-bootstrap";
import InputField from "../../Masters/ItemMaster/Inputfield";
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const StoneDetailsModal = ({
    show,
    handleClose,
    stoneDetails,
    setStoneDetails,
    handleAddStone,
    stoneList,          
    handleEditStone,
    handleDeleteStone,
    editingStoneIndex
}) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        let newDetails = { ...stoneDetails, [name]: value };

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

        setStoneDetails(newDetails);
    };

    const totalweight = stoneList.reduce((sum, stone) => sum + (parseFloat(stone.stoneWt) || 0), 0).toFixed(3);
    const totalprice = stoneList.reduce((sum, stone) => sum + (parseFloat(stone.amount) || 0), 0).toFixed(2);

    return (
        <Modal show={show} onHide={handleClose} centered size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Stone Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col xs={12} md={2}>
                            <InputField label="Stone Name" name="stoneName" value={stoneDetails.stoneName || ""} onChange={handleChange} />
                        </Col>
                        <Col xs={12} md={2}>
                            <InputField label="Cut" name="cut" value={stoneDetails.cut || ""} onChange={handleChange} />
                        </Col>
                        <Col xs={12} md={2}>
                            <InputField label="Color" name="color" value={stoneDetails.color || ""} onChange={handleChange} />
                        </Col>
                        <Col xs={12} md={2}>
                            <InputField label="Clarity" name="clarity" value={stoneDetails.clarity || ""} onChange={handleChange} />
                        </Col>
                        <Col xs={12} md={2}>
                            <InputField label="Stone Wt" name="stoneWt" type="number" value={stoneDetails.stoneWt || ""} onChange={handleChange} />
                        </Col>
                        <Col xs={12} md={2}>
                            <InputField label="Carat Wt" name="caratWt" type="number" value={stoneDetails.caratWt || ""} onChange={handleChange} />
                        </Col>
                        <Col xs={12} md={2}>
                            <InputField label="Stone Price" name="stonePrice" type="number" value={stoneDetails.stonePrice || ""} onChange={handleChange} />
                        </Col>
                        <Col xs={12} md={2}>
                            <InputField label="Amount" name="amount" type="number" value={stoneDetails.amount || ""} readOnly />
                        </Col>

                        <Col xs={12} md={2}>
                            <Button
                                style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
                                onClick={handleAddStone}
                            >
                                {editingStoneIndex !== null ? "Update" : "Add"}
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
                        {stoneList.length > 0 ? (
                            stoneList.map((stone, index) => (
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
                                            onClick={() => handleEditStone(index)}
                                        />
                                        <FaTrash
                                            style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
                                            onClick={() => handleDeleteStone(index)}
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
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default StoneDetailsModal;
