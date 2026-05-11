import React, { useState, useEffect } from "react";
import axios from "axios";
import { Col, Row, Button, Table } from "react-bootstrap";
import InputField from "./../SalesForm/InputfieldSales";
import baseURL from "../../../../Url/NodeBaseURL";
import { FaEdit, FaTrash } from "react-icons/fa";
const OldSalesForm = ({ setOldSalesData, orderDetails }) => {
  const [metalOptions, setMetalOptions] = useState([]);
  const [purityOptions, setPurityOptions] = useState([]);
  const [oldDetails, setOldDetails] = useState({
    product: "",
    metal: "",
    purity: "",
    purityPercentage: "",
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
  const [rates, setRates] = useState({ rate_24crt: "", rate_22crt: "", rate_18crt: "", rate_16crt: "" });

  useEffect(() => {
    localStorage.setItem('oldTableData', JSON.stringify(oldTableData));
    setOldSalesData(oldTableData); // Update parent component's state
  }, [oldTableData, setOldSalesData]);

  const [editingRow, setEditingRow] = useState(null);

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

        // Set last metal_type from orderDetails
        if (orderDetails?.length > 0) {
          const lastMetalType = orderDetails[orderDetails.length - 1]?.metal_type;
          if (lastMetalType) {
            setOldDetails((prevDetails) => ({
              ...prevDetails,
              metal: lastMetalType,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching metal types:", error);
      }
    };

    fetchMetalTypes();
  }, [orderDetails]);

  useEffect(() => {
    if (oldDetails.metal?.toLowerCase() === 'gold') {
      setOldDetails((prevState) => ({
        ...prevState,
        ml_percent: 1, // Set default value for Gold
      }));
    } else if (oldDetails.metal?.toLowerCase() === 'silver') {
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
    const fetchCurrentRates = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/current-rates`);
        setRates({
          rate_24crt: response.data.rate_24crt || "",
          rate_22crt: response.data.rate_22crt || "",
          rate_18crt: response.data.rate_18crt || "",
          rate_16crt: response.data.rate_16crt || "",
          rate_silver: response.data.silver_rate || "", // Add rate_silver from the response
        });
      } catch (error) {
        console.error('Error fetching current rates:', error);
      }
    };

    fetchCurrentRates();
  }, []);

useEffect(() => {
  const fetchAndFilterPurity = async () => {
    try {
      const response = await axios.get(`${baseURL}/purity`);
      const allPurityOptions = response.data;

      const filteredPurityOptions = allPurityOptions.filter(
        (option) => option.metal.toLowerCase() === oldDetails.metal.toLowerCase()
      );

      const defaultPurityOption = filteredPurityOptions.find((option) =>
        option.name.toLowerCase().replace(/\s/g, "").includes("22k")
      );

      setPurityOptions(filteredPurityOptions);

      setOldDetails((prevDetails) => {
        const updatedDetails = {
          ...prevDetails,
          purity: defaultPurityOption?.name || "",
          purityPercentage: defaultPurityOption?.purity_percentage || 0,
        };

        // **Ensure calculations happen immediately after purity change**
        updatedDetails.net_wt = calculateNetWeight(updatedDetails);
        updatedDetails.total_amount = calculateTotalAmount(updatedDetails);

        return updatedDetails;
      });
    } catch (error) {
      console.error("Error fetching purity options:", error);
    }
  };

  if (oldDetails.metal) {
    fetchAndFilterPurity();
  }
}, [oldDetails.metal]);


  const normalizePurity = (purity) => purity.toLowerCase().replace(/\s+/g, "");

  useEffect(() => {
    const normalizedMetal = oldDetails.metal?.toLowerCase() || "";
    const normalizedPurity = normalizePurity(oldDetails.purity || "");
  
    let updatedRate = 0;
  
    if (normalizedMetal === "silver") {
      updatedRate = rates.rate_silver || 0;
    } else if (normalizedMetal === "gold" && normalizedPurity === "manual") {
      updatedRate = rates.rate_22crt || 0;
    } else {
      updatedRate =
        normalizedPurity.includes("24") ? rates.rate_24crt :
        normalizedPurity.includes("22") ? rates.rate_22crt :
        normalizedPurity.includes("18") ? rates.rate_18crt :
        normalizedPurity.includes("16") ? rates.rate_16crt :
        rates.rate_22crt; // Default to rate_22crt if no match
    }
    
  
    setOldDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails, rate: updatedRate };
  
      // Immediately update net weight and total amount after setting rate
      updatedDetails.net_wt = calculateNetWeight({
        ...updatedDetails,
        purityPercentage: updatedDetails.purityPercentage,
      });
  
      updatedDetails.total_amount = calculateTotalAmount(updatedDetails);
  
      return updatedDetails;
    });
  
  }, [oldDetails.purity, oldDetails.metal, rates]);
  

  const calculateNetWeight = ({ gross, dust, purityPercentage, ml_percent }) => {
    const purityPercentageValue = parseFloat(purityPercentage) || 0;
    const grossWeight = parseFloat(gross) || 0;
    const dustWeight = parseFloat(dust) || 0;
    const mlPercentValue = parseFloat(ml_percent) || 0;
  
    const netWeight = ((grossWeight - dustWeight) * (purityPercentageValue - mlPercentValue)) / 100;
    return parseFloat(netWeight.toFixed(3)); // Set to three decimal places
  };
  

  const calculateTotalAmount = ({ net_wt, rate }) => {
    const netWeight = Number(net_wt) || 0;
    const rateAmount = Number(rate) || 0;
  
    const totalAmount = netWeight * rateAmount;
    return Number(totalAmount.toFixed(2));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    setOldDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails, [name]: value };
  
      if (name === "metal") {
        updatedDetails.purity = "";
        updatedDetails.purityPercentage = "";
  
        if (value === "Silver") {
          updatedDetails.rate = rates.rate_silver || "0.00";
        } else {
          updatedDetails.rate = "";
        }
      }
  
      if (name === "purity") {
        if (value !== "Manual") {
          const selectedOption = purityOptions.find((option) => option.name === value);
          updatedDetails.purityPercentage = selectedOption ? selectedOption.purity_percentage : 0;
        } else {
          updatedDetails.purityPercentage = 0;
        }
      } else if (name === "purityPercentage") {
        updatedDetails.purityPercentage = parseFloat(value) || 0;
      }
  
      // **Update net weight and total amount immediately**
      updatedDetails.net_wt = calculateNetWeight(updatedDetails);
      updatedDetails.total_amount = calculateTotalAmount(updatedDetails);
  
      return updatedDetails;
    });
  };

  const handleEdit = (data, index) => {
    setOldDetails(data);  // Populate form fields with existing data
    setEditingRow(index); // Store index for updating
  };

  const handleAddButtonClick = () => {
    if (editingRow !== null) {
      // Update existing row
      setOldTableData((prevData) =>

        prevData.map((data, index) =>
          index === editingRow ? oldDetails : data
        )
      );
      setEditingRow(null); // Reset editing state
    } else {
      // Allow submission even if HSN Code is empty
      if (oldDetails.product && oldDetails.metal && oldDetails.purity) {
        setOldTableData([...oldTableData, oldDetails]);
      } else {
        alert("Please fill in all required fields (Product, Metal, Purity).");
        return;
      }
    }

    // Reset form fields
    setOldDetails({
      product: "",
      metal: "",
      purity: "",
      purityPercentage: "",
      hsn_code: "",  // Can be empty now
      gross: 0,
      dust: 0,
      ml_percent: 0,
      net_wt: 0,
      remarks: "",
      rate: 0,
      total_amount: 0,
      total_old_amount: 0,
    });
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setOldTableData((prevData) => prevData.filter((_, i) => i !== index));
      alert("Old Item deleted successfully");
    }
  };

  const calculateTotalSum = () => {
    return oldTableData.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0).toFixed(2);
  };

  return (
    <>
      <Row>
        {/* <h4 className="mb-3" style={{fontSize:"15px"}}>URD Purchase</h4> */}
        <Col xs={12} md={3}>
          <InputField label="Product" name="product" value={oldDetails.product} onChange={handleInputChange} />
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


        {/* <Col xs={12} md={3}>
          <InputField label="HSN Code" name="hsn_code" value={oldDetails.hsn_code} onChange={handleInputChange} />
        </Col> */}
        <Col xs={12} md={3}>
          <InputField label="Gross" name="gross" value={oldDetails.gross} onChange={handleInputChange} />
        </Col>
        <Col xs={12} md={3}>
          <InputField label="Dust" name="dust" value={oldDetails.dust} onChange={handleInputChange} />
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
              { value: "Manual", label: "Manual" },
            ]}
          />
        </Col>

        {oldDetails.purity === "Manual" && (
          <Col xs={12} md={3}>
            <InputField
              label="Custom Purity %"
              type="number"
              name="purityPercentage"
              value={oldDetails.purityPercentage || ""}
              onChange={handleInputChange}
            />
          </Col>
        )}
        <Col xs={12} md={3}>
          <InputField label="ML %" name="ml_percent" value={oldDetails.ml_percent} onChange={handleInputChange} />
        </Col>
        <Col xs={12} md={3}>
          <InputField
            label="Net Wt"
            name="net_wt"
            value={isNaN(oldDetails.net_wt) || oldDetails.net_wt === "" ? "0.00" : Number(oldDetails.net_wt).toFixed(3)}
            onChange={handleInputChange}
          />
        </Col>
        <Col xs={12} md={3}>
          <InputField
            label="Rate"
            name="rate"
            value={oldDetails.rate || "0.00"}
            onChange={handleInputChange}
          />
        </Col>
        <Col xs={12} md={3}>
          <InputField
            label="Total Amt"
            name="total_amount"
            value={(Number(oldDetails.total_amount) || 0).toFixed(2)}
            readOnly
          />
        </Col>
        <Col xs={12} md={3}>
          <InputField label="Remarks" name="remarks" value={oldDetails.remarks} onChange={handleInputChange} />
        </Col>
        <Col xs={12} md={2}>
          <Button onClick={handleAddButtonClick} style={{ backgroundColor: 'rgb(163, 110, 41)', borderColor: 'rgb(163, 110, 41)',     height: "29px",
    marginTop: "4px",
    fontSize: "14px",
    padding: "2px 9px" }}>
            {editingRow !== null ? "Update" : "Add"}
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover className="mt-4">
        <thead>
          <tr style={{fontSize:"13px"}}>
            <th>Product</th>
            <th>Metal</th>
            <th>Gross</th>
            <th>Dust</th>
            <th>Purity</th>
            <th>ML%</th>
            <th>Net Wt</th>
            <th>Rate</th>
            <th>Total Amt</th>
            <th>Remarks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {oldTableData.map((data, index) => (
            <tr key={index} style={{fontSize:"13px"}}>
              <td>{data.product}</td>
              <td>{data.metal}</td>
              <td>{data.gross}</td>
              <td>{data.dust}</td>
              <td>{data.purity}</td>
              <td>{data.ml_percent}</td>
              <td>{data.net_wt}</td>
              <td>{data.rate}</td>
              <td>{data.total_amount}</td>
              <td>{data.remarks}</td>
              <td>
                {/* <Button variant="warning" size="sm" className="mr-2" onClick={() => handleEdit(data, index)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleDelete(index)}>
              Delete
            </Button> */}
                <FaEdit
                  style={{ cursor: "pointer", marginLeft: "10px", color: "blue" }}
                  onClick={() => handleEdit(data, index)}
                // disabled={editingIndex !== null}
                />
                <FaTrash
                  style={{ cursor: "pointer", marginLeft: "10px", color: "red" }}
                  onClick={() => handleDelete(index)}
                // disabled={editingIndex !== null}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between px-2 mt-2" style={{marginTop:"-5px"}}> 
        <h7>Total Amount:</h7>
        <h7>₹ {calculateTotalSum()}</h7>
      </div>


    </>
  );
};

export default OldSalesForm;