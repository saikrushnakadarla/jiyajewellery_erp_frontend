import React, { useState, useEffect } from "react";
import "./Purchase.css";
import InputField from "../../../Pages/InputField/InputField";
import { Container, Row, Col, Button, Table, Form } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

import axios from "axios";
import { AiOutlinePlus } from "react-icons/ai";


const URDPurchase = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(
    {
      mobile: "",
      account_name: "",
      gst_in: "",
      terms: "Cash",
      invoice: "",
      bill_no: "",
      rate_cut: "",
      date: new Date().toISOString().split("T")[0],
      bill_date: new Date().toISOString().split("T")[0],
      due_date: "",
      category: "",
      rbarcode: "",
      pcs: "",
      gross_weight: "",
      stone_weight: "",
      net_weight: "",
      hm_charges: "",
      other_charges: "",
      charges: "",
      purity: "",
      pure_weight: "",
      rate: "",
      total_amount: "",
    });

  // Handle Change Function
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const [tableData, setTableData] = useState([]);

  const handleAddOrEdit = (e) => {
    e.preventDefault();

    if (editingIndex === null) {
      // Add new entry to the table
      setTableData([...tableData, formData]);
    } else {
      // Edit existing entry in the table
      const updatedTableData = tableData.map((row, index) =>
        index === editingIndex ? formData : row
      );
      setTableData(updatedTableData);
      setEditingIndex(null); // Reset edit mode
    }

    // Reset formData only when needed (optional for editing scenarios)
    setFormData({
      ...formData, // If necessary, keep persistent fields like mobile, etc.
      category: '',
      rbarcode: '',
      pcs: '',
      gross_weight: '',
      stone_weight: '',
      net_weight: '',
      hm_charges: '',
      other_charges: '',
      charges: '',
      purity: '',
      pure_weight: '',
      rate: '',
      total_amount: '',
    });
  };


  const handleSave = async () => {
    try {
      const dataToSave = {
        formData: { ...formData }, // Explicitly spread to ensure values are intact
        table_data: tableData, // Include table data
      };

      // Send the data to your backend
      const response = await axios.post("http://localhost:5000/api/purchase", dataToSave, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Data saved successfully:", response.data);

      // Optionally reset after successful save
      setFormData({
        mobile: "",
        account_name: "",
        gst_in: "",
        terms: "Cash",
        invoice: "",
        bill_no: "",
        rate_cut: "",
        date: new Date().toISOString().split("T")[0],
        bill_date: new Date().toISOString().split("T")[0],
        due_date: "",
        category: "",
        rbarcode: "",
        pcs: "",
        gross_weight: "",
        stone_weight: "",
        net_weight: "",
        hm_charges: "",
        other_charges: "",
        charges: "",
        purity: "",
        pure_weight: "",
        rate: "",
        total_amount: "",
      });

      setTableData([]); // Reset table data if needed
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };



  const [editingIndex, setEditingIndex] = useState(null);

  // Handle Edit button click
  const handleEdit = (index) => {
    const rowToEdit = tableData[index];
    setFormData(rowToEdit); // Set formData to row data
    setEditingIndex(index); // Set the index for editing
  };

  const handleDelete = (index) => {
    setTableData(tableData.filter((_, i) => i !== index));
  };

  return (
    <div className="main-container">
      <div className="purchase-form-container">
        <Form>
          <div className="purchase-form">
            <div className="purchase-form-left">
              <Col className="urd-form1-section">
                <h4 className="mb-4">Supplier Details</h4>
                <Row>
                  <Col xs={12} md={4} className="d-flex align-items-center">
                    <div style={{ flex: 1 }}>
                      <InputField
                        label="Mobile"
                        name="mobile"
                        type="select"
                        value={formData.mobile || ""} // Use customer_id to match selected value
                        onChange={handleChange}
                      />
                    </div>
                    <AiOutlinePlus
                      size={20}
                      color="black"
                      style={{
                        marginLeft: "10px",
                        cursor: "pointer",
                        marginBottom: "20px",
                      }}
                    />
                  </Col>
                  <Col xs={12} md={4}>
                    <InputField
                      label="Supplier Name"
                      name="account_name"
                      type="text"
                      value={formData.account_name}
                      onChange={handleChange}
                    />
                  </Col>

                  <Col xs={12} md={4}>
                    <InputField label="GSTIN" value={formData.gst_in} name="gst_in" onChange={handleChange}
                    />
                  </Col>
                </Row>
              </Col>
            </div>
            <div className="purchase-form-right">
              <Col className="urd-form2-section">
                <Row>
                  <Col xs={12} md={3}>
                    <InputField label="Terms" type="select" name="terms" value={formData.terms}
                      onChange={handleChange}
                      options={[
                        { value: "Cash", label: "Cash" },
                        { value: "Credit", label: "Credit" },
                      ]}
                    />
                  </Col>
                  <Col xs={12} md={3} >
                    <InputField label="Invoice" value={formData.invoice} name="invoice" onChange={handleChange}
                    />
                  </Col>
                  <Col xs={12} md={3} >
                    <InputField label="Bill No" value={formData.bill_no} name="bill_no" onChange={handleChange}
                    />
                  </Col>

                  <Col xs={12} md={3} >
                    <InputField label="Rate-Cut" value={formData.rate_cut} name="rate_cut" onChange={handleChange}
                    />
                  </Col>

                  <Col xs={12} md={3} >
                    <InputField label="Bill Date" type="date" value={formData.bill_date} name="bill_date" onChange={handleChange}
                    />
                  </Col>
                  <Col xs={12} md={3} >
                    <InputField label="Due Date" type="date" value={formData.due_date} name="due_date" onChange={handleChange}
                    />
                  </Col>
                </Row>
              </Col>
            </div>
          </div>
          <div className="urd-form-section">
            <Row>
              <Col xs={12} md={2}>
                <InputField
                  label="Category:"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Rbarcode"
                  name="rbarcode"
                  value={formData.rbarcode}
                  onChange={handleChange}
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField label="PCs" type="text" value={formData.pcs} name="pcs" onChange={handleChange}
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField label="Gross" type="number" value={formData.gross_weight} name="gross_weight" onChange={handleChange}
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField label="Stone" type="number" value={formData.stone_weight} name="stone_weight" onChange={handleChange}
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField
                  label="Net"
                  type="number"
                  name="net_weight"
                  value={formData.net_weight}
                  onChange={handleChange}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField label="HM Charges" type="number" value={formData.hm_charges} name="hm_charges" onChange={handleChange}
                />
              </Col>

              <Col xs={12} md={2}>
                <InputField
                  label="Other Charges:"
                  type="select"
                  name="other_charges"
                  value={formData.other_charges}
                  onChange={handleChange}
                  options={[
                    { value: "cargo", label: "cargo" },
                    { value: "transport", label: "transport" },
                  ]}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField label="Charges" type="number" value={formData.charges} name="charges" onChange={handleChange}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Purity"
                  type="select"
                  name="purity"
                  value={formData.purity}
                  onChange={handleChange}
                  options={[
                    { value: "22k", label: "22k" },
                    { value: "24k", label: "24k" },
                  ]}
                />
              </Col>
              <Col xs={12} md={1}>

                <InputField
                  label="Pure Wt"
                  type="number"
                  name="pure_weight"
                  value={formData.pure_weight}
                  onChange={handleChange}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Rate"
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                />

              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Total Amount"
                  type="number"
                  name="total_amount"
                  value={formData.total_amount}
                  onChange={handleChange}
                />
              </Col>
              <Col xs={12} md={1}>
                <Button onClick={handleAddOrEdit}>{editingIndex === null ? "Add" : "Update"}</Button>
              </Col>
            </Row>
            <Row>
            </Row>
            <div style={{ overflowX: "scroll", marginTop: '-27px' }}>
              <Table striped bordered hover className="mt-4">
                <thead>
                  <tr>
                    <th>Rbarcode</th>
                    <th>Category</th>
                    <th>Pieces</th>
                    <th>Gross</th>
                    <th>Stone</th>
                    <th>Net</th>
                    <th>HM Charges</th>
                    <th>Other Charges</th>
                    <th>Charges</th>
                    <th>Purity</th>
                    <th>Pure Wt</th>
                    <th>Rate</th>
                    <th>Total Amount</th>
                    <th>Actions</th> {/* New Action column */}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.rbarcode}</td>
                      <td>{row.category}</td>
                      <td>{row.pcs}</td>
                      <td>{row.gross_weight}</td>
                      <td>{row.stone_weight}</td>
                      <td>{row.net_weight}</td>
                      <td>{row.hm_charges}</td>
                      <td>{row.other_charges}</td>
                      <td>{row.charges}</td>
                      <td>{row.purity}</td>
                      <td>{row.pure_weight}</td>
                      <td>{row.rate}</td>
                      <td>{row.total_amount}</td>
                      <td>
                        <Button onClick={() => handleEdit(index)}>Edit</Button>
                        <Button onClick={() => handleDelete(index)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
          <div className="form-buttons">
            <Button type="button" variant="success" style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }} onClick={handleSave}>
              Save
            </Button>
            <Button
              variant="secondary"
              style={{ backgroundColor: 'gray', marginRight: '10px' }}
            >
              cancel
            </Button>
          </div>
        </Form>
      </div>

    </div>
  );
};



export default URDPurchase;
