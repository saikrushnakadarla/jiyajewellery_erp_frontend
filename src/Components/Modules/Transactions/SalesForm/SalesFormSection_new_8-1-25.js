import React, { useState, useEffect } from "react";
import axios from "axios";
import baseURL from "../../../../Url/NodeBaseURL";
import { Col, Row, Button, Table } from "react-bootstrap";
import InputField from "../../../Pages/InputField/InputField"; // Adjust the path as per your project structure.

const SalesFormSection = () => {
  const [activeForm, setActiveForm] = useState("old"); // "old" or "schemes"
  const [metalOptions, setMetalOptions] = useState([]);
  const [purityOptions, setPurityOptions] = useState([]);
  const [oldDetails, setOldDetails] = useState({
    metal: "",
    purity: "",
    hsn_code: "",
    gross: 0,
    dust: 0,
    ml_percent: 0,
    net_wt: 0,
    remarks: "",
    rate: 0,
    total_amount: 0,
  });

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
    pending_amount: ''
  });


  const [isEditing, setIsEditing] = useState(false); // To track if we're in edit mode
  const [editIndex, setEditIndex] = useState(null);



  const [oldTableData, setOldTableData] = useState([]);
  const [schemeTableData, setSchemeTableData] = useState([]);
  const [rates, setRates] = useState({
    rate_24crt: "",
    rate_22crt: "",
    rate_18crt: "",
    rate_16crt: "",
  });


  useEffect(() => {
    const fetchPurity = async () => {
      try {
        const response = await axios.get(`${baseURL}/purity`);
        setPurityOptions(response.data); // Populate purity options dynamically
      } catch (error) {
        console.error("Error fetching purity options:", error);
      }
    };

    fetchPurity();
  }, []);


  useEffect(() => {
    if (oldDetails.metal === 'Gold') {
      setOldDetails((prevState) => ({
        ...prevState,
        ml_percent: 1, // Set default value for Gold
      }));
    } else if (oldDetails.metal === 'Silver') {
      setOldDetails((prevState) => ({
        ...prevState,
        ml_percent: 3, // Set default value for Silver
      }));
    } else if (!oldDetails.metal) {
      setOldDetails((prevState) => ({
        ...prevState,
        ml_percent: '', // Clear ml_percent if metal is cleared
      }));
    }
  }, [oldDetails.metal]);

  useEffect(() => {
    const fetchMetalTypes = async () => {
      try {
        const response = await axios.get(`${baseURL}/metaltype`);
        const metalTypes = response.data.map((item) => ({
          value: item.metal_name,
          label: item.metal_name,
          hsn_code: item.hsn_code,
        }));
        setMetalOptions(metalTypes);
      } catch (error) {
        console.error("Error fetching metal types:", error);
      }
    };

    fetchMetalTypes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If the input is a number, convert it, otherwise keep it as a string
    setSchemeDetails((prevDetails) => ({
      ...prevDetails,
      [name]: isNaN(value) ? value : Number(value),
    }));

    setOldDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails, [name]: value };

      // Recalculate net weight
      updatedDetails.net_wt = calculateNetWeight(updatedDetails);
      updatedDetails.total_amount = calculateTotalAmount(updatedDetails);
      // Dynamically fetch HSN code if metal is selected
      if (name === "metal") {
        const selectedMetal = metalOptions.find((option) => option.value === value);
        updatedDetails.hsn_code = selectedMetal?.hsn_code || "";
      }

      return updatedDetails;
    });
  };


  // useEffect(() => {
  //   const fetchCurrentRates = async () => {
  //     try {
  //       const response = await axios.get(`${baseURL}/get/current-rates`);
  //       setRates({
  //         rate_24crt: response.data.rate_24crt || "",
  //         rate_22crt: response.data.rate_22crt || "",
  //         rate_18crt: response.data.rate_18crt || "",
  //         rate_16crt: response.data.rate_16crt || "",
  //       });
  //     } catch (error) {
  //       console.error("Error fetching current rates:", error);
  //     }
  //   };

  //   fetchCurrentRates();
  // }, []);


  const parsePurityToPercentage = (purity) => {
    if (!purity) return null;

    const match = purity.match(/(\d+)(k|K)/); // Match formats like "22K", "24k", etc.
    if (match) {
      const caratValue = parseInt(match[1], 10);
      return (caratValue / 24) * 100;
    }

    if (purity.toLowerCase() === "916hm") return 91.6;

    return null;
  };

  const calculateNetWeight = ({ gross, dust, purity, ml_percent }) => {
    const purityPercentage = parsePurityToPercentage(purity) || 0;
    const grossWeight = parseFloat(gross) || 0;
    const dustWeight = parseFloat(dust) || 0;
    const mlPercentValue = parseFloat(ml_percent) || 0;

    return ((grossWeight - dustWeight) * (purityPercentage - mlPercentValue)) / 100;
  };

  const calculateTotalAmount = ({ net_wt, rate }) => {
    const netWeight = parseFloat(net_wt) || 0;
    const rateAmount = parseFloat(rate) || 0;
    return ((netWeight) * (rateAmount));
  };

  const currentRate =
    oldDetails.purity === "24K" ? rates.rate_24crt :
      oldDetails.purity === "22K" ? rates.rate_22crt :
        oldDetails.purity === "18K" ? rates.rate_18crt :
          oldDetails.purity === "16K" ? rates.rate_16crt :
            "";

  useEffect(() => {
    if (oldDetails.metal === 'Gold') {
      setOldDetails((prevState) => ({
        ...prevState,
        ml_percent: 1, // Set default value for Gold
      }));
    } else if (oldDetails.metal === 'Silver') {
      setOldDetails((prevState) => ({
        ...prevState,
        ml_percent: 3, // Set default value for Silver
      }));
    } else if (!oldDetails.metal) {
      setOldDetails((prevState) => ({
        ...prevState,
        ml_percent: '', // Clear ml_percent if metal is cleared
      }));
    }
  }, [oldDetails.metal]);


  // const handleAddButtonClick = (isOldForm) => {
  //   if (isOldForm) {
  //     setOldTableData((prevData) => [...prevData, oldDetails]);
  //     setOldDetails({
  //       metal: "",
  //       purity: "",
  //       hsn_code: "",
  //       gross: 0,
  //       dust: 0,
  //       ml_percent: 0,
  //       net_wt: 0,
  //       remarks: "",
  //       rate: 0,
  //       total_amount: 0,
  //     });
  //   } else {
  //     setSchemeTableData((prevData) => [...prevData, schemeDetails]);
  //     // Clear the form after adding
  //     setSchemeDetails({
  //       scheme: "",
  //       member_name: "",
  //       member_number: "",
  //       scheme_name: "",
  //       installments_paid: 0,
  //       duration_months: 0,
  //       paid_months: 0,
  //       pending_months: 0,
  //       paid_amount: 0,
  //       pending_amount: 0,
  //     });
  //   }
  // };
  const [editingRow, setEditingRow] = useState(null); // Track the row being edited

  // const handleEdit = (data) => {
  //   // Pre-fill the form with the data to be edited
  //   setSchemeDetails(data);
  //   setEditingRow(data.member_number); // Set the editing row
  // };

  // const handleDelete = (memberNumber) => {
  //   // Filter out the deleted record based on member_number
  //   setSchemeTableData((prevData) =>
  //     prevData.filter((data) => data.member_number !== memberNumber)
  //   );
  // };

  const handleAddButtonClick = (isOldForm) => {
    if (editingRow) {
      // If we're in edit mode, update the row
      if (isOldForm) {
        setOldTableData((prevData) =>
          prevData.map((data) =>
            data.hsn_code === editingRow ? oldDetails : data // Editing row check based on hsn_code
          )
        );
        // Reset after update
        setOldDetails({
          product: "",
          metal: "",
          purity: "",
          hsn_code: "",
          gross: 0,
          dust: 0,
          ml_percent: 0,
          net_wt: 0,
          remarks: "",
          rate: 0,
          total_amount: 0,
        });
      } else {
        // If we're in scheme form edit mode, update the row
        setSchemeTableData((prevData) =>
          prevData.map((data) =>
            data.member_number === editingRow ? schemeDetails : data // Editing row check based on member_number
          )
        );
        // Reset after update
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
        });
      }
      setEditingRow(null); // Reset editing row state
    } else {
      // Add new entry
      if (isOldForm) {
        if (oldDetails.metal && oldDetails.purity && oldDetails.hsn_code) {
          setOldTableData((prevData) => [...prevData, oldDetails]);
          setOldDetails({
            product: "",
            metal: "",
            purity: "",
            hsn_code: "",
            gross: "",
            dust: "",
            ml_percent: 0,
            net_wt: 0,
            remarks: "",
            rate: "",
            total_amount: 0,
            total_old_amount:""
          });
        } else {
          alert("Please fill in all required fields.");
        }
      } else {
        if (schemeDetails.scheme && schemeDetails.member_name && schemeDetails.member_number) {
          setSchemeTableData((prevData) => [...prevData, schemeDetails]);
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
            schemes_total_amount: "",
          });
        } else {
          alert("Please fill in all required fields.");
        }
      }
    }
  };

  // Handle Edit for Old Table
  const handleEditOld = (data) => {
    setOldDetails(data);
    setEditingRow(data.hsn_code); // Set the row to edit
  };

  // Handle Edit for Scheme Table
  const handleEditScheme = (data) => {
    setSchemeDetails(data);
    setEditingRow(data.member_number); // Set the row to edit
  };

  // Handle Delete for Old Table
  const handleDeleteOld = (hsnCode) => {
    setOldTableData((prevData) => prevData.filter((data) => data.hsn_code !== hsnCode));
  };

  // Handle Delete for Scheme Table
  const handleDeleteScheme = (memberNumber) => {
    setSchemeTableData((prevData) => prevData.filter((data) => data.member_number !== memberNumber));
  };

  const calculateOldTotalSum = () => {
    return oldTableData.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0).toFixed(2);
  };

  const calculateSchemeTotalSum = () => {
    return schemeTableData.reduce((sum, item) => sum + parseFloat(item.paid_amount || 0), 0).toFixed(2);
  };

  const handleSubmitOldData = async () => {
    try {
      // Calculate the total amount once
      const totalOldAmount = calculateOldTotalSum();
  
      // Iterate over oldTableData and send POST request for each entry
      for (const data of oldTableData) {
        const payload = {
          ...data,
          total_old_amount: totalOldAmount, // Add the total amount to each request
        };
  
        const response = await fetch('http://localhost:5000/olditems', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) {
          throw new Error(`Failed to save data for HSN Code ${data.hsn_code}`);
        }
      }
      alert('Data submitted successfully!');
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Error occurred while submitting data. Please try again.');
    }
  };
  
  const handleSubmitSchemeData = async () => {
    try {
      // Calculate the total amount once
      const schemesTotalAmount = calculateSchemeTotalSum();
  
      // Iterate over schemeTableData and send POST request for each entry
      for (const data of schemeTableData) {
        const payload = {
          ...data,
          schemes_total_amount: schemesTotalAmount, // Add the total amount to each request
        };
  
        const response = await fetch('http://localhost:5000/member-schemes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) {
          throw new Error(`Failed to save data for Member Number ${data.member_number}`);
        }
      }
      alert('Data submitted successfully!');
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Error occurred while submitting data. Please try again.');
    }
  };
  

  return (
    <Col className="sales-form-section">
      <Row>
        <Col xs={12} className="mb-3">
          <Button
            variant={activeForm === "old" ? "primary" : "secondary"}
            onClick={() => setActiveForm("old")}
          >
            Old
          </Button>
          <Button
            variant={activeForm === "schemes" ? "primary" : "secondary"}
            onClick={() => setActiveForm("schemes")}
            className="ms-2"
          >
            Schemes
          </Button>
        </Col>
      </Row>

      {activeForm === "old" && (
  <>
    <Row>
      <h4 className="mb-3">Old</h4>
      {/* Input Fields */}
      <Col xs={12} md={4}>
        <InputField label="Product" name="product" value={oldDetails.product} onChange={(e) => handleInputChange(e, true)}/>
      </Col>
      <Col xs={12} md={3}>
        <InputField
          label="Metal"
          name="metal"
          type="select"
          value={oldDetails.metal}
          onChange={handleInputChange}
          options={metalOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />
      </Col>
      <Col xs={12} md={3}>
        <InputField
          label="Purity"
          type="select"
          name="purity"
          value={oldDetails.purity}
          onChange={handleInputChange}
          options={purityOptions.map((purity) => ({
            value: purity.name,
            label: purity.name,
          }))}
        />
      </Col>
      <Col xs={12} md={2}>
        <InputField label="HSN Code" name="hsn_code" value={oldDetails.hsn_code} readOnly />
      </Col>
      <Col xs={12} md={3}>
        <InputField label="Gross" name="gross" value={oldDetails.gross} onChange={(e) => handleInputChange(e, true)} />
      </Col>
      <Col xs={12} md={3}>
        <InputField label="Dust" name="dust" value={oldDetails.dust} onChange={(e) => handleInputChange(e, true)} />
      </Col>
      <Col xs={12} md={3}>
        <InputField label="ML Percent" name="ml_percent" value={oldDetails.ml_percent} onChange={(e) => handleInputChange(e, true)} />
      </Col>
      <Col xs={12} md={3}>
        <InputField label="Net Weight" name="net_wt" value={Number.isNaN(oldDetails.net_wt) ? "" : oldDetails.net_wt.toFixed(2)} onChange={(e) => handleInputChange(e, true)} />
      </Col>
      <Col xs={12} md={3}>
        <InputField label="Remarks" name="remarks" value={oldDetails.remarks} onChange={(e) => handleInputChange(e, true)} />
      </Col>
      <Col xs={12} md={3}>
        <InputField label="Rate" name="rate" value={oldDetails.rate || currentRate} onChange={(e) => handleInputChange(e, true)} />
      </Col>
      <Col xs={12} md={3}>
        <InputField label="Total Amount" name="total_amount" value={oldDetails.total_amount.toFixed(2)} onChange={(e) => handleInputChange(e, true)} />
      </Col>
      <Col xs={12} md={2}>
        <Button onClick={() => handleAddButtonClick(true)}>
          {editingRow ? "Update" : "Add"}
        </Button>
      </Col>
    </Row>

    {/* Table */}
    <Table bordered hover responsive>
      <thead>
        <tr>
          <th>Product</th>
          <th>Metal</th>
          <th>Purity</th>
          <th>Gross</th>
          <th>Dust</th>
          <th>HSN Code</th>
          <th>ML Percent</th>
          <th>Net Weight</th>
          <th>Remarks</th>
          <th>Rate</th>
          <th>Total Amount</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {oldTableData.map((data, index) => (
          <tr key={index}>
            <td>{data.product}</td>
            <td>{data.metal}</td>
            <td>{data.purity}</td>
            <td>{data.gross}</td>
            <td>{data.dust}</td>
            <td>{data.hsn_code}</td>
            <td>{data.ml_percent}</td>
            <td>{data.net_wt}</td>
            <td>{data.remarks}</td>
            <td>{data.rate}</td>
            <td>{data.total_amount}</td>
            <td>
              <Button variant="warning" size="sm" className="mr-2" onClick={() => handleEditOld(data)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDeleteOld(data.hsn_code)}>
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
     </Table>

    {/* Total Amount Section */}
    <div className="d-flex justify-content-between px-2 mt-2">
      <h5>Total Amount for Old:</h5>
      <h5>₹ {calculateOldTotalSum()}</h5>
    </div>

    {/* Submit Button */}
    <div className="text-right mt-3">
      <Button variant="primary" onClick={handleSubmitOldData}>
        Submit
      </Button>
    </div>
  </>
)}


{activeForm === "schemes" && (
  <>
    <Row>
      <h4 className="mb-3">Schemes</h4>
      <Col xs={12} md={3}>
        <InputField label="Scheme" name="scheme" value={schemeDetails.scheme} onChange={(e) => handleInputChange(e, false)} />
      </Col>
      <Col xs={12} md={3}>
        <InputField label="Member Name" name="member_name" value={schemeDetails.member_name} onChange={(e) => handleInputChange(e, false)} />
      </Col>
      <Col xs={12} md={3}>
        <InputField label="Member Number" name="member_number" value={schemeDetails.member_number} onChange={(e) => handleInputChange(e, false)} />
      </Col>
      <Col xs={12} md={3}>
        <InputField label="Scheme Name" name="scheme_name" value={schemeDetails.scheme_name} onChange={(e) => handleInputChange(e, false)} />
      </Col>
      <Col xs={12} md={3}>
        <InputField label="Installments Paid" name="installments_paid" value={schemeDetails.installments_paid} onChange={(e) => handleInputChange(e, true)} />
      </Col>
      <Col xs={12} md={3}>
        <InputField label="Duration (Months)" name="duration_months" value={schemeDetails.duration_months} onChange={(e) => handleInputChange(e, true)} />
      </Col>
      <Col xs={12} md={3}>
        <InputField label="Paid Months" name="paid_months" value={schemeDetails.paid_months} onChange={(e) => handleInputChange(e, true)} />
      </Col>
      <Col xs={12} md={3}>
        <InputField label="Pending Months" name="pending_months" value={schemeDetails.pending_months} onChange={(e) => handleInputChange(e, true)} />
      </Col>
      <Col xs={12} md={3}>
        <InputField label="Paid Amount" name="paid_amount" value={schemeDetails.paid_amount} onChange={(e) => handleInputChange(e, true)} />
      </Col>
      <Col xs={12} md={3}>
        <InputField label="Pending Amount" name="pending_amount" value={schemeDetails.pending_amount} onChange={(e) => handleInputChange(e, true)} />
      </Col>
      <Col xs={12} md={2}>
        <Button onClick={() => handleAddButtonClick(false)}>
          {editingRow ? "Update" : "Add"}
        </Button>
      </Col>
    </Row>

    {/* Table */}
    <Table bordered hover responsive>
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
              <Button variant="warning" size="sm" className="mr-2" onClick={() => handleEditScheme(data)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDeleteScheme(data.member_number)}>
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
     </Table>

    {/* Total Amount Section */}
    <div className="d-flex justify-content-between px-2 mt-2">
      <h5>Total Amount for Schemes:</h5>
      <h5>₹ {calculateSchemeTotalSum()}</h5>
    </div>

    {/* Submit Button */}
    <div className="text-right mt-3">
      <Button variant="primary" onClick={handleSubmitSchemeData}>
        Submit
      </Button>
    </div>
  </>
)}

    </Col>
  );
};

export default SalesFormSection;
