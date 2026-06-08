import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Row, Col, Modal, Table, Form } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../../Url/NodeBaseURL';
import { FaEye, FaTrash, FaEdit } from 'react-icons/fa';

const RepairsTable = ({ selectedMobile, tabId, setRepairDetails, formData, repairDetails,
    orderData,
    handleCloseModal,
    handleViewDetails,
    handleOrderCheckboxChange,
    showModal,
    orderDetails,
    loading,
    formatDate,
    selectedOrder
}) => {
    const navigate = useNavigate();

    const filteredOrders = orderData.filter(
        (item) => String(item.mobile) === String(selectedMobile)
    );

  const handleNavigate = (e) => {
    e.preventDefault(); // Prevent form submission if inside a <form>
    console.log("Selected Mobile being passed:", selectedMobile);
    navigate('/orders', { state: { mobile: selectedMobile } });
};

    return (
        // <div className="main-container">
        <div style={{ paddingBottom: "15px" }}>
            <div className="table-responsive">
                <Row className="mb-3">
                    <Col className="d-flex justify-content-between align-items-center">
                        <button className="btn btn-primary" onClick={handleNavigate} style={{
                            backgroundColor: "rgb(163, 110, 41)",
                            borderColor: "rgb(163, 110, 41)",
                            color: "white", fontSize: '13px', padding: '5px'
                        }} >
                            New
                        </button>
                    </Col>
                </Row>
                <Table bordered hover style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>SI</th>
                            <th>Date</th>
                            <th>Mobile</th>
                            <th>Account</th>
                            <th>Order No.</th>
                            <th>Advance Amt</th>
                            <th>Net Amt</th>
                            <th>Paid Amt</th>
                            <th>Bal Amt</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && filteredOrders.length > 0 ? (
                            filteredOrders.map((item, index) => {
                                const paid_amt = Number(item.paid_amt) || 0;
                                const receipts_amt = Number(item.receipts_amt) || 0;
                                const totalPaid = (paid_amt + receipts_amt).toFixed(2);

                                const bal_amt = Number(item.bal_amt) || 0;
                                const bal_after_receipts = Number(item.bal_after_receipts) || 0;
                                let finalBalance =
                                    bal_amt === receipts_amt
                                        ? bal_after_receipts || 0
                                        : bal_after_receipts || bal_amt || 0;

                                return (
                                    <tr key={index}>
                                        <td>
                                            <Form.Check
                                                type="checkbox"
                                                checked={selectedOrder === item.order_number} // Only this one is checked
                                                onChange={(e) => handleOrderCheckboxChange(e, item.order_number)}
                                            />
                                        </td>

                                        <td>{index + 1}</td>
                                        <td>{formatDate(item.date)}</td>
                                        <td>{item.mobile}</td>
                                        <td>{item.account_name}</td>
                                        <td>{item.order_number}</td>
                                        <td>{item.advance_amt || 0}</td>
                                        <td>{item.net_bill_amount || 0}</td>
                                        <td>{totalPaid}</td>
                                        <td>{finalBalance.toFixed(2)}</td>
                                        <td>
                                            <FaEye
                                                style={{ cursor: 'pointer', marginLeft: '10px', color: 'green' }}
                                                onClick={() => handleViewDetails(item.order_number)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="15" className="text-center">
                                    {loading ? 'Loading...' : 'No Orders found'}
                                </td>
                            </tr>
                        )}
                    </tbody>


                </Table>

            </div>


            {/* Modal to display repair details */}
            <Modal show={showModal} onHide={handleCloseModal} size="xl" className="m-auto">
                <Modal.Header closeButton>
                    <Modal.Title>Orders Details</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ fontSize: '13px' }}>
                    {orderDetails && (
                        <>
                            <h5>Customer Info</h5>
                            <Table bordered>
                                <tbody>
                                    <tr>
                                        <td>Mobile</td>
                                        <td>{orderDetails.uniqueData.mobile}</td>
                                    </tr>
                                    <tr>
                                        <td>Account Name</td>
                                        <td>{orderDetails.uniqueData.account_name}</td>
                                    </tr>
                                    <tr>
                                        <td>Email</td>
                                        <td>{orderDetails.uniqueData.email}</td>
                                    </tr>
                                    <tr>
                                        <td>Address</td>
                                        <td>{orderDetails.uniqueData.address1}</td>
                                    </tr>
                                    <tr>
                                        <td>Invoice Number</td>
                                        <td>{orderDetails.uniqueData.order_number}</td>
                                    </tr>
                                    <tr>
                                        <td>Total Amount</td>
                                        <td>{orderDetails.uniqueData.net_amount}</td>
                                    </tr>
                                </tbody>
                            </Table>

                            <h5>Products</h5>
                            <div className="table-responsive">
                                <Table bordered>
                                    <thead style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                                        <tr>
                                            <th>Bar Code</th>
                                            <th>Product Name</th>
                                            <th>Metal Type</th>
                                            <th>Purity</th>
                                            <th>Gross Wt</th>
                                            <th>Stone Wt</th>
                                            <th>W.Wt</th>
                                            <th>Total Wt</th>
                                            <th>Size</th>
                                            <th>MC</th>
                                            <th>Rate</th>
                                            <th>Tax Amt</th>
                                            <th>Total Price</th>

                                        </tr>
                                    </thead>
                                    <tbody style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                                        {orderDetails.repeatedData.map((product, index) => (
                                            <tr key={index}>
                                                <td>{product.code}</td>
                                                <td>{product.product_name}</td>
                                                <td>{product.metal_type}</td>
                                                <td>{product.purity}</td>
                                                <td>{product.gross_weight}</td>
                                                <td>{product.stone_weight}</td>
                                                <td>{product.wastage_weight}</td>
                                                <td>{product.total_weight_av}</td>
                                                <td>{product.size}</td>
                                                <td>{product.making_charges}</td>
                                                <td>{product.rate}</td>
                                                <td>{product.tax_amt}</td>
                                                <td>{product.total_price}</td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default RepairsTable;