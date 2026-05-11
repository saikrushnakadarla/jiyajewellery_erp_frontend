import React, { useState, useEffect} from "react";
import { Col, Row, Button, Table } from "react-bootstrap";
import InputField from "./../../Masters/ItemMaster/Inputfield";
import baseURL from "../../../../Url/NodeBaseURL";


const SchemeSalesForm = ({ setSchemeSalesData }) => {

   
  const [schemeDetails, setSchemeDetails] = useState({
    scheme: '',
    member_name: '',
    member_number: '',
    scheme_name: '',
    installments_paid: '',
    duration_months: '',
    paid_months: '',
    pending_months: '',
    paid_amount: '',
    pending_amount: '',
    schemes_total_amount: "",
  });

  const [schemeTableData, setSchemeTableData] = useState(() => {
    const savedData = localStorage.getItem('schemeTableData');
    return savedData ? JSON.parse(savedData) : [];
  });

  // Save to localStorage whenever table data changes
  useEffect(() => {
    localStorage.setItem('schemeTableData', JSON.stringify(schemeTableData));
    setSchemeSalesData(schemeTableData); // Update parent component's state
  }, [schemeTableData, setSchemeSalesData]);
  const [editingRow, setEditingRow] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSchemeDetails((prevDetails) => ({
      ...prevDetails,
      [name]: isNaN(value) ? value : Number(value),
    }));
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
          scheme: "",
          member_name: "",
          member_number: "",
          scheme_name: "",
          installments_paid: "",
          duration_months: "",
          paid_months: "",
          pending_months: "",
          paid_amount: "",
          pending_amount: "",
          schemes_total_amount:"",
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
    setSchemeTableData((prevData) => prevData.filter((data) => data.member_number !== memberNumber));
  };

  const calculateTotalSum = () => {
    return schemeTableData.reduce((sum, item) => sum + parseFloat(item.paid_amount || 0), 0).toFixed(2);
  };

  

  return (
    <>
      <Row>
        <h4 className="mb-3">Schemes</h4>
        {/* <Col xs={12} md={3}>
          <InputField label="Scheme" name="scheme" value={schemeDetails.scheme} onChange={handleInputChange} />
        </Col> */}
        <Col xs={12} md={3}>
          <InputField label="Member Name" name="member_name" value={schemeDetails.member_name} onChange={handleInputChange} />
        </Col>
        <Col xs={12} md={3}>
          <InputField label="Member Number" name="member_number" value={schemeDetails.member_number} onChange={handleInputChange} />
        </Col>
        <Col xs={12} md={3}>
          <InputField label="Scheme Name" name="scheme_name" value={schemeDetails.scheme_name} onChange={handleInputChange} />
        </Col>
        <Col xs={12} md={3}>
          <InputField label="Installments Paid" name="installments_paid" value={schemeDetails.installments_paid} onChange={handleInputChange} />
        </Col>
        <Col xs={12} md={3}>
          <InputField label="Duration (Months)" name="duration_months" value={schemeDetails.duration_months} onChange={handleInputChange} />
        </Col>
        <Col xs={12} md={3}>
          <InputField label="Paid Months" name="paid_months" value={schemeDetails.paid_months} onChange={handleInputChange} />
        </Col>
        <Col xs={12} md={3}>
          <InputField label="Pending Months" name="pending_months" value={schemeDetails.pending_months} onChange={handleInputChange} />
        </Col>
        <Col xs={12} md={3}>
          <InputField label="Paid Amount" name="paid_amount" value={schemeDetails.paid_amount} onChange={handleInputChange} />
        </Col>
        <Col xs={12} md={3}>
          <InputField label="Pending Amount" name="pending_amount" value={schemeDetails.pending_amount} onChange={handleInputChange} />
        </Col>
        <Col xs={12} md={2}>
          <Button onClick={handleAddButtonClick}>
            {editingRow ? "Update" : "Add"}
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover className="mt-4">
        <thead>
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
        <tbody>
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
                <Button variant="warning" size="sm" className="mr-2" onClick={() => handleEdit(data)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(data.member_number)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between px-2 mt-2">
        <h5>Total Amount for Schemes:</h5>
        <h5>₹ {calculateTotalSum()}</h5>
      </div>

     
    </>
  );
};

export default SchemeSalesForm;