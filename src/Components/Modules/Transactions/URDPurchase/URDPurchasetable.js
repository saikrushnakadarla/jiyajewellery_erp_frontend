import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout';
import { Button, Row, Col, Modal } from 'react-bootstrap';
import baseURL from '../../../../Url/NodeBaseURL';
import axios from "axios";
import InputField from "../../../Pages/InputField/InputField";
import { FaTrash, FaEdit } from 'react-icons/fa'; // Import icons
import './URDPurchasetable.css';

const RepairsTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const location = useLocation();
  const { mobile } = location.state || {};
  const initialSearchValue = location.state?.mobile || '';
  const [purityOptions, setPurityOptions] = useState([]);

  useEffect(() => {
    if (mobile) {
      console.log("Selected Mobile from Dashboard:", mobile);
    }
  }, [mobile]);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const [formData, setFormData] = useState({
    customer_id: "",
    account_name: "",
    mobile: "",
    email: "",
    address1: "",
    address2: "",
    address3: "",
    city: "",
    state: "",
    state_code: "",
    aadhar_card: "",
    gst_in: "",
    pan_card: "",
    // date: today,
    urdpurchase_number: "",


  });
  const [productDetails, setProductDetails] = useState({
    product_id: "",
    product_name: "",
    metal: "",
    purity: "",
    hsn_code: "",
    gross: 0,
    dust: 0,
    touch_percent: 0,
    ml_percent: 0,
    eqt_wt: 0,
    remarks: "",
    rate: 0,
    total_amount: 0,
  });
  const fetchUrdPurchases = async () => {
    try {
      const response = await fetch(`${baseURL}/get-purchases`);
      const result = await response.json();

      if (response.ok) {
        const formattedData = result.map((purchase) => ({
          customer_id: purchase.customer_id,
          account_name: purchase.account_name,
          mobile: purchase.mobile,
          email: purchase.email,
          address1: purchase.address1,
          address2: purchase.address2,
          city: purchase.city,
          state: purchase.state,
          state_code: purchase.state_code,
          aadhar_card: purchase.aadhar_card,
          gst_in: purchase.gst_in,
          pan_card: purchase.pan_card,
          date: formatDate(purchase.date),
          urdpurchase_number: purchase.urdpurchase_number,
          product_id: purchase.product_id,
          product_name: purchase.product_name,
          metal: purchase.metal,
          purity: purchase.purity,
          hsn_code: purchase.hsn_code,
          gross: purchase.gross,
          dust: purchase.dust,
          touch_percent: purchase.touch_percent,
          ml_percent: purchase.ml_percent,
          eqt_wt: purchase.eqt_wt,
          remarks: purchase.remarks,
          rate: purchase.rate,
          total_amount: purchase.total_amount,
        }));

        setData(formattedData);
      } else {
        console.error('Failed to fetch data:', result.message);
      }
    } catch (error) {
      console.error('Error fetching URD purchases:', error);
    }
  };

  useEffect(() => {
    fetchUrdPurchases();
  }, []);

  useEffect(() => {
    const fetchAndFilterPurity = async () => {
      try {
        const response = await axios.get(`${baseURL}/purity`);
        console.log("Fetched Purity Options:", response.data);

        const allPurityOptions = response.data;

        const filteredPurityOptions = allPurityOptions.filter(
          (option) => option.metal.toLowerCase() === productDetails.metal.toLowerCase()
        );

        console.log("Filtered Purity Options:", filteredPurityOptions);

        const defaultPurityOption = filteredPurityOptions.find(option =>
          option.name.toLowerCase().replace(/\s/g, "").includes("22k")
        );

        console.log("Default Selected Purity:", defaultPurityOption);

        setPurityOptions(filteredPurityOptions);

        setProductDetails((prevDetails) => ({
          ...prevDetails,
          purity: defaultPurityOption?.name || "",
          purityPercentage: defaultPurityOption?.purity_percentage || 0, // Store purity_percentage
        }));
      } catch (error) {
        console.error("Error fetching purity options:", error);
      }
    };

    if (productDetails.metal) {
      fetchAndFilterPurity();
    }
  }, [productDetails.metal]);

  const [metalOptions, setMetalOptions] = useState([]);

  useEffect(() => {
    const fetchMetalTypes = async () => {
      try {
        const response = await axios.get(`${baseURL}/metaltype`);
        const metalTypes = response.data.map(item => ({
          value: item.metal_name, // Metal name for dropdown
          label: item.metal_name, // Display value
          hsn_code: item.hsn_code, // Associated HSN Code
        }));
        setMetalOptions(metalTypes);
      } catch (error) {
        console.error('Error fetching metal types:', error);
      }
    };

    fetchMetalTypes();
  }, []);

  useEffect(() => {
    if (productDetails.metal?.toLowerCase() === 'gold') {
      setProductDetails((prevState) => ({
        ...prevState,
        ml_percent: 1, // Set default value for Gold
      }));
    } else if (productDetails.metal?.toLowerCase() === 'silver') {
      setProductDetails((prevState) => ({
        ...prevState,
        ml_percent: 3, // Set default value for Silver
      }));
    } else if (!productDetails.metal) {
      setProductDetails((prevState) => ({
        ...prevState,
        ml_percent: '', // Clear ml_percent if metal is cleared
      }));
    }
  }, [productDetails.metal]);


  useEffect(() => {
    const fetchLastURDPurchaseNumber = async () => {
      try {
        const response = await axios.get(`${baseURL}/lastURDPurchaseNumber`);
        setFormData((prev) => ({
          ...prev,
          urdpurchase_number: response.data.lastURDPurchaseNumber,
        }));
      } catch (error) {
        console.error("Error fetching estimate number:", error);
      }
    };

    fetchLastURDPurchaseNumber();
  }, []);

  const [rates, setRates] = useState({ rate_24crt: "", rate_22crt: "", rate_18crt: "", rate_16crt: "" });

  useEffect(() => {
    const fetchCurrentRates = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/current-rates`);
        console.log('API Response:', response.data);

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

  const normalizePurity = (purity) => purity.toLowerCase().replace(/\s+/g, "");

  useEffect(() => {
    const normalizedMetal = productDetails.metal.toLowerCase();
    const normalizedPurity = normalizePurity(productDetails.purity);

    // If metal is silver and purity is Manual, set rate_silver
    if (normalizedMetal === "silver" && normalizedPurity === "manual") {
      setProductDetails((prevDetails) => ({ ...prevDetails, rate: rates.rate_silver }));
      return;
    }

    // If metal is gold and purity is Manual, set rate_22crt
    if (normalizedMetal === "gold" && normalizedPurity === "manual") {
      setProductDetails((prevDetails) => ({ ...prevDetails, rate: rates.rate_22crt }));
      return;
    }

    // If metal is silver, always set rate_silver
    if (normalizedMetal === "silver") {
      setProductDetails((prevDetails) => ({ ...prevDetails, rate: rates.rate_silver }));
      return;
    }

    // Normal purity-based rate assignment for gold
    const currentRate =
      normalizedPurity.includes("24") ? rates.rate_24crt :
        normalizedPurity.includes("22") ? rates.rate_22crt :
          normalizedPurity.includes("18") ? rates.rate_18crt :
            normalizedPurity.includes("16") ? rates.rate_16crt :
              0;

    setProductDetails((prevDetails) => ({ ...prevDetails, rate: currentRate }));
  }, [productDetails.purity, productDetails.metal, rates]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setProductDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails, [name]: value };

      if (name === "metal") {
        updatedDetails.purity = ""; // Reset purity when metal changes
        updatedDetails.purityPercentage = ""; // Reset purity percentage
        // Set rate based on metal type selection
        if (value === "Silver") {
          updatedDetails.rate = rates.rate_silver || "0.00"; // Set silver rate if metal is silver
        } else {
          updatedDetails.rate = ""; // Reset rate for other metals
        }
      }

      if (name === "purity") {
        if (value !== "Manual") {
          const selectedOption = purityOptions.find(option => option.name === value);
          updatedDetails.purityPercentage = selectedOption ? selectedOption.purity_percentage : 0;
        } else {
          updatedDetails.purityPercentage = 0; // Directly set purityPercentage to 0
        }
      } else if (name === "purityPercentage") {
        updatedDetails.purityPercentage = parseFloat(value); // Handle custom purity percentage
      }

      // Update calculations with the latest purityPercentage
      updatedDetails.eqt_wt = calculateNetWeight({
        ...updatedDetails,
        purityPercentage: updatedDetails.purityPercentage,
      });

      updatedDetails.total_amount = calculateTotalAmount(updatedDetails);

      return updatedDetails;
    });
  };

  const calculateNetWeight = ({ gross, dust, purity, purityPercentage, ml_percent }) => {
    const purityPercentageValue = purity === "Manual"
      ? parseFloat(purityPercentage) || 0
      : parseFloat(purityPercentage) || 0;  // Ensure the correct purityPercentage is used

    const grossWeight = parseFloat(gross) || 0;
    const dustWeight = parseFloat(dust) || 0;
    const mlPercentValue = parseFloat(ml_percent) || 0;

    const netWeight = ((grossWeight - dustWeight) * (purityPercentageValue - mlPercentValue)) / 100;
    return parseFloat(netWeight.toFixed(2));
  };

  const calculateTotalAmount = ({ eqt_wt, rate }, currentRate) => {
    const netWeight = Number(eqt_wt) || 0;
    const rateAmount = Number(rate) || Number(currentRate) || 0;

    const totalAmount = netWeight * rateAmount;
    return Number(totalAmount.toFixed(2));
  };

  const handleEdit = (row) => {
    setFormData(row);
    setProductDetails({
      product_id: row.product_id,
      product_name: row.product_name,
      metal: row.metal,
      purity: row.purity,
      hsn_code: row.hsn_code,
      gross: row.gross,
      dust: row.dust,
      touch_percent: row.touch_percent,
      ml_percent: row.ml_percent,
      eqt_wt: row.eqt_wt,
      remarks: row.remarks,
      rate: row.rate,
      total_amount: row.total_amount,
    });
    setShowEditModal(true);
  };

  const handleDelete = async (urdpurchase_number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${baseURL}/delete/${urdpurchase_number}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setData((prevData) => prevData.filter((item) => item.urdpurchase_number !== urdpurchase_number));
        alert("Record deleted successfully.");
      } else {
        console.error('Failed to delete:', await response.json());
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(
        `${baseURL}/api/urd-purchase/${formData.urdpurchase_number}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setShowEditModal(false);
        alert('Record updated successfully.');
        fetchUrdPurchases(); // Refresh the table data
      } else {
        console.error('Failed to update:', await response.json());
      }
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Sr. No.',
        Cell: ({ row }) => row.index + 1, // Generate a sequential number based on the row index
      },
      { Header: 'Customer Name', accessor: 'account_name' },
      { Header: 'Mobile', accessor: 'mobile' },
      { Header: 'Date', accessor: 'date' },
      { Header: 'Purchase No', accessor: 'urdpurchase_number' },
      { Header: 'Gross Weight', accessor: 'gross' },
      { Header: 'Dust Weight', accessor: 'dust' },
      { Header: 'ML%', accessor: 'ml_percent' },
      { Header: 'Net Weight', accessor: 'eqt_wt' },
      { Header: 'Rate', accessor: 'rate' },
      { Header: 'Total Amount', accessor: 'total_amount' },
      {
        Header: 'Actions',
        Cell: ({ row }) => (
          <>
            <FaEdit
              style={{
                cursor: 'pointer',
                marginLeft: '10px',
                color: 'blue',
              }}
              onClick={() => handleEdit(row.original)}
            />

            <FaTrash
              style={{
                cursor: 'pointer',
                marginLeft: '10px',
                color: 'red',
              }}
              onClick={() => handleDelete(row.original.urdpurchase_number)}
            />

          </>
        ),
      },
    ],
    []
  );

  return (
    <div className="main-container">
      <div className="payments-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>URD Purchase</h3>
            <Button
              className="create_but"
              variant="success"
              onClick={() => navigate('/urd_purchase')}
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
            >
              + Create
            </Button>
          </Col>
        </Row>
        <DataTable columns={columns} data={data} initialSearchValue={initialSearchValue} />

        {/* Edit Modal */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          dialogClassName="custom-modal-width"
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Record</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: "rgba(163, 110, 41, 0.08)" }}>
            <Row>
              <Col xs={12} md={2}>
                <InputField
                  label="Product"
                  name="product_name"
                  value={productDetails.product_name}
                  onChange={handleInputChange}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Metal"
                  name="metal"
                  type="select"
                  value={formData.metal}
                  onChange={handleInputChange}
                  options={metalOptions.map(option => ({ value: option.value, label: option.label }))}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Purity"
                  type="select"
                  name="purity"
                  value={productDetails.purity}
                  onChange={handleInputChange}
                  options={purityOptions.map((purity) => ({
                    value: purity.name,
                    label: purity.name,
                  }))}
                />
              </Col>
              {/* <Col xs={12} md={2}>
                <InputField
                  label="HSN Code"
                  name="hsn_code"
                  type="text"
                  value={formData.hsn_code}
                  onChange={handleInputChange}
                  readOnly // Make it read-only
                />
              </Col> */}
              <Col xs={12} md={2}>
                <InputField
                  label="Gross"
                  type="number"
                  name="gross"
                  value={productDetails.gross}
                  onChange={handleInputChange}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Dust"
                  type="number"
                  name="dust"
                  value={productDetails.dust}
                  onChange={handleInputChange}
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField
                  label="ML %"
                  type="number"
                  name="ml_percent"
                  value={productDetails.ml_percent}
                  onChange={handleInputChange}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Net WT"
                  type="number"
                  name="eqt_wt"
                  value={productDetails.eqt_wt}
                  onChange={handleInputChange}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Rate"
                  name="rate"
                  value={productDetails.rate}
                  onChange={handleInputChange}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Amount"
                  type="number"
                  name="total_amount"
                  value={productDetails.total_amount}
                  onChange={handleInputChange}
                  readOnly
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Remarks"
                  type="text"
                  name="remarks"
                  value={productDetails.remarks}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>


      </div>
    </div>
  );
};

export default RepairsTable;
