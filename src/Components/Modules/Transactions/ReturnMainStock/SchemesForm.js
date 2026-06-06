import React, { useState, useEffect } from "react";
import { Col, Row, Button, Table } from "react-bootstrap";
import InputField from "./InputfieldSales";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";

const SchemeSalesForm = ({ setSchemeSalesData, selectedMobile, tabId }) => {
  const [schemeDetails, setSchemeDetails] = useState({
    member_name: "",
    member_number: selectedMobile || "", // Pre-fill member_number
    scheme_name: "",
    installments_paid: "",
    duration_months: "",
    paid_months: "",
    pending_months: "",
    paid_amount: "",
    pending_amount: "",
    schemes_total_amount: "",
  });

  useEffect(() => {
    if (selectedMobile && selectedMobile.length === 10) {
      fetchSchemeDetails(selectedMobile);
    }
  }, [selectedMobile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSchemeDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));

    if (name === "member_number" && value.length === 10) {
      fetchSchemeDetails(value);
    }
  };

  // const fetchSchemeDetails = async (mobileNumber) => {
  //   try {
  //     const response = await axios.get(
  //       `https://rahul455.pythonanywhere.com/api/member/phone_number/${mobileNumber}/`
  //     );
  //     const memberData = response.data[0];
  //     setSchemeDetails({
  //       member_name: memberData.name,
  //       member_number: mobileNumber,
  //       scheme_name: memberData.scheme.scheme_name,
  //       installments_paid: memberData.paid_installments,
  //       duration_months: memberData.scheme.scheme_maturity_period,
  //       paid_months: memberData.paid_installments,
  //       pending_months: memberData.due_installments,
  //       paid_amount: memberData.total_paid_amount,
  //       pending_amount: memberData.pending_amount,
  //       schemes_total_amount: memberData.scheme.scheme_installment_amount,
  //     });
  //   } catch (error) {
  //     console.error("Error fetching scheme details:", error);
  //     alert("Failed to fetch scheme details. Please check the mobile number.");
  //   }
  // };


  const [schemeTableData, setSchemeTableData] = useState(() => {
    const savedData = localStorage.getItem(`schemeTableData_${tabId}`);
    return savedData ? JSON.parse(savedData) : [];
  });

  const [editingRow, setEditingRow] = useState(null);

  useEffect(() => {
    localStorage.setItem(`schemeTableData_${tabId}`, JSON.stringify(schemeTableData));
    setSchemeSalesData(schemeTableData); // Update parent component's state
  }, [schemeTableData, setSchemeSalesData]);

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   if (name === "member_number" && value.length === 10) {
  //     fetchSchemeDetails(value);
  //   }
  //   setSchemeDetails((prevDetails) => ({
  //     ...prevDetails,
  //     [name]: value,
  //   }));

  //   if (name === "member_number" && value.length === 10) {
  //     fetchSchemeDetails(value);
  //   }
  // };

  const fetchSchemeDetails = async (mobileNumber) => {
    try {
      const response = await axios.get(
        `https://rahul455.pythonanywhere.com/api/member/phone_number/${mobileNumber}/`
      );
      const memberData = response.data[0];

      setSchemeDetails({
        member_name: memberData.name,
        member_number: mobileNumber,
        scheme_name: memberData.scheme.scheme_name,
        installments_paid: memberData.paid_installments,
        duration_months: memberData.scheme.scheme_maturity_period,
        paid_months: memberData.paid_installments,
        pending_months: memberData.due_installments,
        paid_amount: memberData.total_paid_amount,
        pending_amount: memberData.pending_amount,
        schemes_total_amount: memberData.scheme.scheme_installment_amount,
      });
    } catch (error) {
      console.error("Error fetching scheme details:", error);
      alert("There are no schemes available for this mobile number.");
    }
  };


  const handleAddButtonClick = () => {
    if (editingRow) {
      setSchemeTableData((prevData) =>
        prevData.map((data) =>
          data.member_number === editingRow ? schemeDetails : data
        )
      );
      setEditingRow(null);
    } else {
      if (schemeDetails.member_name && schemeDetails.member_number) {
        const newData = [...schemeTableData, schemeDetails];
        setSchemeTableData(newData);
        setSchemeDetails({
          member_name: "",
          member_number: "",
          scheme_name: "",
          installments_paid: "",
          duration_months: "",
          paid_months: "",
          pending_months: "",
          paid_amount: "",
          pending_amount: "",
          schemes_total_amount: "",
        });
      } else {
        alert("Please fill in all required fields.");
      }
    }
  };

  const handleEdit = (data) => {
    setSchemeDetails(data);
    setEditingRow(data.member_number);
  };

  const handleDelete = (memberNumber) => {
    setSchemeTableData((prevData) =>
      prevData.filter((data) => data.member_number !== memberNumber)
    );
  };

  const calculateTotalSum = () => {
    return schemeTableData
      .reduce((sum, item) => sum + parseFloat(item.paid_amount || 0), 0)
      .toFixed(2);
  };

  return (
    <>
      <Row>
        {/* <h4 className="mb-3">Schemes</h4> */}
        <Col xs={12} md={3}>
          <InputField
            label="Member Name"
            name="member_name"
            value={schemeDetails.member_name}
            onChange={handleInputChange}
            disabled
          />
        </Col>
        <Col xs={12} md={3}>
          <InputField
            label="Member Number"
            name="member_number"
            value={schemeDetails.member_number}
            onChange={handleInputChange}
          />
        </Col>
        <Col xs={12} md={3}>
          <InputField
            label="Scheme Name"
            name="scheme_name"
            value={schemeDetails.scheme_name}
            onChange={handleInputChange}
            disabled
          />
        </Col>
        <Col xs={12} md={3}>
          <InputField
            label="Installments Paid"
            name="installments_paid"
            value={schemeDetails.installments_paid}
            onChange={handleInputChange}
            disabled
          />
        </Col>
        <Col xs={12} md={3}>
          <InputField
            label="Duration (Months)"
            name="duration_months"
            value={schemeDetails.duration_months}
            onChange={handleInputChange}
            disabled
          />
        </Col>
        <Col xs={12} md={3}>
          <InputField
            label="Paid Months"
            name="paid_months"
            value={schemeDetails.paid_months}
            onChange={handleInputChange}
            disabled
          />
        </Col>
        <Col xs={12} md={3}>
          <InputField
            label="Pending Months"
            name="pending_months"
            value={schemeDetails.pending_months}
            onChange={handleInputChange}
            disabled
          />
        </Col>
        <Col xs={12} md={3}>
          <InputField
            label="Paid Amount"
            name="paid_amount"
            value={schemeDetails.paid_amount}
            onChange={handleInputChange}
            disabled
          />
        </Col>
        <Col xs={12} md={3}>
          <InputField
            label="Pending Amount"
            name="pending_amount"
            value={schemeDetails.pending_amount}
            onChange={handleInputChange}
            disabled
          />
        </Col>
        <Col xs={12} md={2}>
          <Button onClick={handleAddButtonClick}
            style={{
              backgroundColor: 'rgb(163, 110, 41)', borderColor: 'rgb(163, 110, 41)', marginTop: "4px",
              padding: "3px 8px",
              fontSize: "15px",
            }}
          >
            {editingRow ? "Update" : "Add"}
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover className="mt-4">
        <thead style={{ fontSize: "13px" }}>
          <tr>
            <th>Member Name</th>
            <th>Member Number</th>
            <th>Scheme Name</th>
            <th>Installments Paid</th>
            <th>Duration Months</th>
            <th>Paid Months</th>
            <th>Pending Months</th>
            <th>Paid Amount</th>
            <th>Pending Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody style={{ fontSize: "13px" }}>
          {schemeTableData.map((data, index) => (
            <tr key={index}>
              <td>{data.member_name}</td>
              <td>{data.member_number}</td>
              <td>{data.scheme_name}</td>
              <td>{data.installments_paid}</td>
              <td>{data.duration_months}</td>
              <td>{data.paid_months}</td>
              <td>{data.pending_months}</td>
              <td>{data.paid_amount}</td>
              <td>{data.pending_amount}</td>
              <td>
                {/* <Button
                  variant="warning"
                  size="sm"
                  className="mr-2"
                  onClick={() => handleEdit(data)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(data.member_number)}
                >
                  Delete
                </Button> */}
                <FaEdit
                  style={{ cursor: "pointer", marginLeft: "10px", color: "blue" }}
                  onClick={() => handleEdit(data)}
                // disabled={editingIndex !== null}
                />
                <FaTrash
                  style={{ cursor: "pointer", marginLeft: "10px", color: "red" }}
                  onClick={() => handleDelete(data.member_number)}
                // disabled={editingIndex !== null}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between px-2 mt-2 mb-1">
        <h7>Total Amount:</h7>
        <h7>₹ {calculateTotalSum()}</h7>
      </div>
    </>
  );
};

export default SchemeSalesForm;
