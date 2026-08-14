import React, { useState, useEffect } from "react";
import { Col, Row, Button, Table } from "react-bootstrap";
import InputField from "./InputfieldSales";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import baseURL from "../../../../Url/NodeBaseURL";

const AdvanceReceiptsForm = ({ 
  selectedMobile, 
  tabId,
  onAdvanceAmountChange,
  selectedAdvanceReceiptAmount,
  onReceiptIdsChange,
}) => {
  const [advanceReceipts, setAdvanceReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReceipts, setSelectedReceipts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (selectedMobile) {
      fetchAdvanceReceipts();
    }
  }, [selectedMobile]);

  useEffect(() => {
    // Update selectAll state based on selected receipts
    if (advanceReceipts.length > 0) {
      setSelectAll(selectedReceipts.length === advanceReceipts.length);
    } else {
      setSelectAll(false);
    }
  }, [selectedReceipts, advanceReceipts]);

    useEffect(() => {
    const total = getSelectedTotal();
    onAdvanceAmountChange?.(total);
    onReceiptIdsChange?.(selectedReceipts); // Pass selected IDs to parent
  }, [selectedReceipts, advanceReceipts]);

  // Calculate and send selected total to parent whenever selections change
  useEffect(() => {
    const total = getSelectedTotal();
    onAdvanceAmountChange?.(total);
  }, [selectedReceipts, advanceReceipts]);

  const fetchAdvanceReceipts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${baseURL}/advance-receipts/${selectedMobile}`);
      setAdvanceReceipts(response.data);
      // Reset selections when new data loads
      setSelectedReceipts([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error fetching advance receipts:", error);
      setError("Failed to load advance receipts");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedReceipts([]);
    } else {
      // Select all
      const allReceiptIds = advanceReceipts.map(receipt => receipt.id);
      setSelectedReceipts(allReceiptIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectReceipt = (receiptId) => {
    setSelectedReceipts(prev => {
      if (prev.includes(receiptId)) {
        return prev.filter(id => id !== receiptId);
      } else {
        return [...prev, receiptId];
      }
    });
  };

  const getSelectedTotal = () => {
    return advanceReceipts
      .filter(receipt => selectedReceipts.includes(receipt.id))
      .reduce((sum, receipt) => sum + (Number(receipt.discount_amt) || 0), 0);
  };

  return (
    <div className="advance-receipts-container">
      <Row className="mb-3">
        <Col>
          <h5>Advance Receipts for Mobile: {selectedMobile || "Not Selected"}</h5>
          {selectedReceipts.length > 0 && (
            <span className="ms-3 text-success">
              Selected Amount: {formatCurrency(getSelectedTotal())}
            </span>
          )}
        </Col>
      </Row>

      {loading && (
        <Row>
          <Col className="text-center">
            <p>Loading advance receipts...</p>
          </Col>
        </Row>
      )}

      {error && (
        <Row>
          <Col>
            <div className="alert alert-danger">{error}</div>
          </Col>
        </Row>
      )}

      {!loading && !error && advanceReceipts.length === 0 && (
        <Row>
          <Col>
            <div className="alert alert-info">
              No advance receipts found for this mobile number.
            </div>
          </Col>
        </Row>
      )}

      {!loading && !error && advanceReceipts.length > 0 && (
        <Row>
          <Col>
            <Table striped bordered hover>
              <thead style={{ fontSize: "13px" }}>
                <tr>
                  <th style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      title="Select All"
                    />
                  </th>
                  <th>Date</th>
                  <th>Receipt No.</th>
                  <th>Account Name</th>
                  <th>Mobile</th>
                  <th>Advance Amount</th>
                  {/* <th>Remarks</th> */}
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {advanceReceipts.map((receipt, index) => (
                  <tr key={receipt.id || index}>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedReceipts.includes(receipt.id)}
                        onChange={() => handleSelectReceipt(receipt.id)}
                      />
                    </td>
                    <td>{formatDate(receipt.date)}</td>
                    <td>{receipt.receipt_no}</td>
                    <td>{receipt.account_name}</td>
                    <td>{receipt.mobile}</td>
                    <td className="text-end">{formatCurrency(receipt.discount_amt)}</td>
                    {/* <td>{receipt.remarks || "-"}</td> */}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5" className="text-end fw-bold">
                    {selectedReceipts.length > 0 ? `Selected Total (${selectedReceipts.length} items):` : "Total Advance Amount:"}
                  </td>
                  <td className="text-end fw-bold">
                    {selectedReceipts.length > 0 
                      ? formatCurrency(getSelectedTotal())
                      : formatCurrency(advanceReceipts.reduce((sum, receipt) => 
                          sum + (Number(receipt.discount_amt) || 0), 0
                        ))
                    }
                  </td>
                </tr>
              </tfoot>
            </Table>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default AdvanceReceiptsForm;