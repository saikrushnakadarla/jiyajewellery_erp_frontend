import React, { useState, useEffect } from "react";
import axios from "axios";
import { Col, Row, Button, Table } from "react-bootstrap";
import InputField from "./../../Masters/ItemMaster/Inputfield";
import baseURL from "../../../../Url/NodeBaseURL";

const OldSalesForm = ({ setOldSalesData }) => {

    
  const [metalOptions, setMetalOptions] = useState([]);
  const [purityOptions, setPurityOptions] = useState([]);
  const [oldDetails, setOldDetails] = useState({
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
    total_old_amount: "",
  });

  const [oldTableData, setOldTableData] = useState(() => {
    const savedData = localStorage.getItem('oldTableData');
    return savedData ? JSON.parse(savedData) : [];
  });

  // Save to localStorage whenever table data changes
  useEffect(() => {
    localStorage.setItem('oldTableData', JSON.stringify(oldTableData));
    setOldSalesData(oldTableData); // Update parent component's state
  }, [oldTableData, setOldSalesData]);

  const [editingRow, setEditingRow] = useState(null);


  useEffect(() => {
    const fetchPurity = async () => {
      try {
        const response = await axios.get(`${baseURL}/purity`);
        setPurityOptions(response.data);
      } catch (error) {
        console.error("Error fetching purity options:", error);
      }
    };

    fetchPurity();
  }, []);

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

  useEffect(() => {
    if (oldDetails.metal === 'Gold') {
      setOldDetails((prevState) => ({
        ...prevState,
        ml_percent: 1,
      }));
    } else if (oldDetails.metal === 'Silver') {
      setOldDetails((prevState) => ({
        ...prevState,
        ml_percent: 3,
      }));
    } else if (!oldDetails.metal) {
      setOldDetails((prevState) => ({
        ...prevState,
        ml_percent: '',
      }));
    }
  }, [oldDetails.metal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    setOldDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails, [name]: value };
  
      updatedDetails.net_wt = name === "net_wt" ? parseFloat(value) || 0 : parseFloat(updatedDetails.net_wt) || 0;
  
      // Use currentRate if no rate is provided
      updatedDetails.rate = name === "rate" ? parseFloat(value) || currentRate : parseFloat(updatedDetails.rate) || currentRate;
  
      // Recalculate total_amount using net_wt and rate (or currentRate)
      updatedDetails.total_amount = calculateTotalAmount(updatedDetails, currentRate);
  
      updatedDetails.net_wt = calculateNetWeight(updatedDetails);
      updatedDetails.total_amount = calculateTotalAmount(updatedDetails);
  
      if (name === "metal") {
        const selectedMetal = metalOptions.find((option) => option.value === value);
        updatedDetails.hsn_code = selectedMetal?.hsn_code || "";
      }
  
      if (name === "purity" && value !== "Other") {
        updatedDetails.purityPercentage = ""; // Clear custom purity if another option is selected
      }
  
      return updatedDetails;
    });
  };
  

  const parsePurityToPercentage = (purity) => {
    if (!purity) return null;

    const match = purity.match(/(\d+)(k|K)/);
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
  
    const netWeight = ((grossWeight - dustWeight) * (purityPercentage - mlPercentValue)) / 100;
    return parseFloat(netWeight.toFixed(2));
  };

  const calculateTotalAmount = ({ net_wt, rate }, currentRate) => {
    const netWeight = parseFloat(net_wt) || 0;
    const rateAmount = parseFloat(rate) || parseFloat(currentRate) || 0;
  
    const totalAmount = netWeight * rateAmount;
    return parseFloat(totalAmount.toFixed(2));
  };
  const handleAddButtonClick = () => {
    if (editingRow) {
      setOldTableData((prevData) =>
        prevData.map((data) =>
          data.hsn_code === editingRow ? oldDetails : data
        )
      );
      setEditingRow(null);
    } else {
      if (oldDetails.metal && oldDetails.purity && oldDetails.hsn_code) {
        const newData = [...oldTableData, oldDetails];
        setOldTableData(newData);
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
          total_old_amount:0,
        });
      } else {
        alert("Please fill in all required fields.");
      }
    }
  };

  const handleEdit = (data) => {
    setOldDetails(data);
    setEditingRow(data.hsn_code);
  };

  const handleDelete = (hsnCode) => {
    setOldTableData((prevData) => prevData.filter((data) => data.hsn_code !== hsnCode));
  };

  const calculateTotalSum = () => {
    return oldTableData.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0).toFixed(2);
  };

  const [rates, setRates] = useState({ rate_24crt: "", rate_22crt: "", rate_18crt: "", rate_16crt: "" });

  useEffect(() => {
    const fetchCurrentRates = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/current-rates`);
        console.log('API Response:', response.data);

        // Log the 24crt rate separately
        console.log('24crt Rate:', response.data.rate_24crt);

        // Dynamically set the rates based on response
        setRates({
          rate_24crt: response.data.rate_24crt || "",
          rate_22crt: response.data.rate_22crt || "",
          rate_18crt: response.data.rate_18crt || "",
          rate_16crt: response.data.rate_16crt || "",
        });
      } catch (error) {
        console.error('Error fetching current rates:', error);
      }
    };
    fetchCurrentRates();
  }, []);


  const currentRate =
  oldDetails.purity === "24K" ? rates.rate_24crt :
  oldDetails.purity === "22K" ? rates.rate_22crt :
  oldDetails.purity === "18K" ? rates.rate_18crt :
  oldDetails.purity === "16K" ? rates.rate_16crt :
            "";

  return (
    <>
      <Row>
        <h4 className="mb-3">URD Purchase</h4>
        <Col xs={12} md={4}>
          <InputField label="Product" name="product" value={oldDetails.product} onChange={handleInputChange}/>
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
    options={[
      ...purityOptions.map((purity) => ({
        value: purity.name,
        label: purity.name,
      })),
      { value: "Other", label: "Other" }, // Add static "Other" option
    ]}
  />
</Col>

{oldDetails.purity === "Other" && (
  <Col xs={12} md={3}>
    <InputField
      label="Custom Purity (%)"
      type="number"
      name="purityPercentage"
      value={oldDetails.purityPercentage || ""}
      onChange={handleInputChange}
    />
  </Col>
)}

        <Col xs={12} md={2}>
          <InputField label="HSN Code" name="hsn_code" value={oldDetails.hsn_code} readOnly />
        </Col>
        <Col xs={12} md={3}>
          <InputField label="Gross" name="gross" value={oldDetails.gross} onChange={handleInputChange} />
        </Col>
        <Col xs={12} md={3}>
          <InputField label="Dust" name="dust" value={oldDetails.dust} onChange={handleInputChange} />
        </Col>
        <Col xs={12} md={3}>
          <InputField label="ML Percent" name="ml_percent" value={oldDetails.ml_percent} onChange={handleInputChange} />
        </Col>
        <Col xs={12} md={3}>
        <InputField
      label="Net Weight"
      name="net_wt"
      value={oldDetails.net_wt?.toFixed(2) || "0.00"}
      onChange={handleInputChange}
    />
        </Col>
        <Col xs={12} md={3}>
          <InputField label="Remarks" name="remarks" value={oldDetails.remarks} onChange={handleInputChange} />
        </Col>
        <Col xs={12} md={3}>
        <InputField
      label="Rate"
      name="rate"
      value={oldDetails.rate || currentRate || "0.00"}
      onChange={handleInputChange}
    />
        </Col>
        <Col xs={12} md={3}>
        <InputField
      label="Total Amount"
      name="total_amount"
      value={oldDetails.total_amount?.toFixed(2) || "0.00"}
      readOnly
    />
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
                <Button variant="warning" size="sm" className="mr-2" onClick={() => handleEdit(data)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(data.hsn_code)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between px-2 mt-2">
        <h5>Total Amount for Old:</h5>
        <h5>₹ {calculateTotalSum()}</h5>
      </div>

     
    </>
  );
};

export default OldSalesForm;