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
    scheme: "",
    member_name: "",
    member_number: "",
    scheme_name: "",
    installments_paid: 0,
    duration_months: 0,
    paid_months: 0,
    pending_months: 0,
    paid_amount: 0,
    pending_amount: 0,
  });

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


  const handleAddButtonClick = (isOldForm) => {
    if (isOldForm) {
      setOldTableData((prevData) => [...prevData, oldDetails]);
      setOldDetails({
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
      setSchemeTableData((prevData) => [...prevData, schemeDetails]);
      setSchemeDetails({
        scheme: "",
        member_name: "",
        member_number: "",
        scheme_name: "",
        installments_paid: 0,
        duration_months: 0,
        paid_months: 0,
        pending_months: 0,
        paid_amount: 0,
        pending_amount: 0,
      });
    }
  };

  const calculateOldTotalSum = () => {
    return oldTableData.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0).toFixed(2);
  };

  const calculateSchemeTotalSum = () => {
    return schemeTableData.reduce((sum, item) => sum + parseFloat(item.paid_amount || 0), 0).toFixed(2);
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

            <Col xs={12} md={4}>
              <InputField label="Product" />
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
              <InputField
                label="HSN Code"
                name="hsn_code"
                value={oldDetails.hsn_code}
                readOnly
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="Gross"
                name="gross"
                value={oldDetails.gross}
                onChange={(e) => handleInputChange(e, true)}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="dust"
                name="dust"
                value={oldDetails.dust}
                onChange={(e) => handleInputChange(e, true)}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="ml_percent"
                name="ml_percent"
                value={oldDetails.ml_percent}
                onChange={(e) => handleInputChange(e, true)}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="net_wt"
                name="net_wt"
                value={Number.isNaN(oldDetails.net_wt) ? "" : oldDetails.net_wt.toFixed(2)}
                onChange={(e) => handleInputChange(e, true)}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="remarks"
                name="remarks"
                value={oldDetails.remarks}
                onChange={(e) => handleInputChange(e, true)}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="rate"
                name="rate"
                value={oldDetails.rate || currentRate}
                onChange={(e) => handleInputChange(e, true)}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="total_amount"
                name="total_amount"
                value={oldDetails.total_amount.toFixed(2)}
                onChange={(e) => handleInputChange(e, true)}
              />
            </Col>
            <Col xs={12} md={2}>
              <Button

                onClick={() => handleAddButtonClick(true)}
              >
                Add
              </Button>
            </Col>
          </Row>

          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>Metal</th>
                <th>Purity</th>
                <th>Gross</th>
                <th>Dust</th>
                <th>HSN Code</th>
                <th>ml_percent</th>
                <th>net_wt</th>
                <th>remarks</th>
                <th>rate</th>
                <th>total_amount</th>
              </tr>
            </thead>
            <tbody>
              {oldTableData.map((data, index) => (
                <tr key={index}>
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
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="d-flex justify-content-between px-2 mt-2">
  <h5>Total Amount for Old:</h5>
  <h5>₹ {calculateOldTotalSum()}</h5>
</div>
        </>
      )}

      {activeForm === "schemes" && (
        <>
          <Row>
            <h4 className="mb-3">Schemes</h4>

            <Col xs={12} md={3}>
              <InputField
                label="Scheme"
                name="scheme"
                value={schemeDetails.scheme}
                onChange={(e) => handleInputChange(e, false)}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="Member Name"
                name="member_name"
                value={schemeDetails.member_name}
                onChange={(e) => handleInputChange(e, false)}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="Member Number"
                name="member_number"
                value={schemeDetails.member_number}
                onChange={(e) => handleInputChange(e, false)}
              />
            </Col>

            <Col xs={12} md={3}>
              <InputField
                label="scheme_name"
                name="scheme_name"
                value={schemeDetails.scheme_name}
                onChange={(e) => handleInputChange(e, false)}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="installments_paid"
                name="installments_paid"
                value={schemeDetails.installments_paid}
                onChange={(e) => handleInputChange(e, false)}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="duration_months"
                name="duration_months"
                value={schemeDetails.duration_months}
                onChange={(e) => handleInputChange(e, false)}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="paid_months"
                name="paid_months"
                value={schemeDetails.paid_months}
                onChange={(e) => handleInputChange(e, false)}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="pending_months"
                name="pending_months"
                value={schemeDetails.pending_months}
                onChange={(e) => handleInputChange(e, false)}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="paid_amount"
                name="paid_amount"
                value={schemeDetails.paid_amount}
                onChange={(e) => handleInputChange(e, false)}
              />
            </Col>
            <Col xs={12} md={3}>
              <InputField
                label="pending_amount"
                name="pending_amount"
                value={schemeDetails.pending_amount}
                onChange={(e) => handleInputChange(e, false)}
              />
            </Col>
            <Col xs={12} md={2}>
              <Button
                onClick={() => handleAddButtonClick(false)}
              >
                Add
              </Button>
            </Col>
          </Row>

          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>Scheme</th>
                <th>Member Name</th>
                <th>Member Number</th>
                <th>scheme name</th>
                <th>installments paid</th>
                <th>duration months</th>
                <th>paid months</th>
                <th>pending months</th>
                <th>paid amount</th>
                <th>pending amount</th>
              </tr>
            </thead>
            <tbody>
              {schemeTableData.map((data, index) => (
                <tr key={index}>
                  <td>{data.scheme}</td>
                  <td>{data.member_name}</td>
                  <td>{data.member_number}</td>
                  <td>{data.scheme_name}</td>
                  <td>{data.installments_paid}</td>
                  <td>{data.duration_months}</td>
                  <td>{data.paid_months}</td>
                  <td>{data.pending_months}</td>
                  <td>{data.paid_amount}</td>
                  <td>{data.pending_amount}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="d-flex justify-content-between px-2 mt-2">
  <h5>Total Amount for Schemes:</h5>
  <h5>₹ {calculateSchemeTotalSum()}</h5>
</div>
        </>
      )}
    </Col>
  );
};

export default SalesFormSection;
