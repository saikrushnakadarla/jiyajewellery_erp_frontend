import React, { useEffect, useState, useRef } from "react";
import { Col, Row, Button } from "react-bootstrap";
import InputField from "./../../Transactions/SalesForm/InputfieldSales";
import { AiOutlinePlus } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import baseURL from './../../../../Url/NodeBaseURL';

const CustomerDetails = ({
  formData,
  setFormData,
  handleCustomerChange,
  handleAddCustomer,
  customers,
  setSelectedMobile,
  mobileRef,
  tabId
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [balance, setBalance] = useState(0); // State to store balance
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedMobile, setSelectedMobileState] = useState(""); // Added state to hold selected mobile

  useEffect(() => {
    if (location.state?.mobile) {
      console.log("Received Mobile from navigation:", location.state.mobile);
      const customer = customers.find(
        (cust) => cust.mobile === location.state.mobile
      );
      if (customer) {
        handleCustomerChange(customer.account_id); // Update formData
        setSelectedMobileState(location.state.mobile); // Pass the mobile number
        fetchBalance(location.state.mobile); // Fetch balance for the selected mobile
      }
    }
  }, [location.state?.mobile, customers]);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await axios.get(`${baseURL}/get-unique-repair-details`);
        // Filter only the records where transaction_status is 'Sales'
        const filteredData = response.data.filter(
          (item) =>
            item.transaction_status === "Sales" || item.transaction_status === "ConvertedInvoice"
        );
        setData(filteredData);
      } catch (error) {
        console.error("Error fetching repair details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepairs();
  }, []);

  // Function to fetch balance based on mobile
  const fetchBalance = (mobile) => {
    if (!mobile) return setBalance("0.00");

    setLoading(true);

    const customerData = data.filter((item) => item.mobile === mobile);

    const totalBalance = customerData.reduce((sum, item) => {
      const bal_amt = Number(item.bal_amt) || 0;
      const bal_after_receipts = Number(item.bal_after_receipts) || 0;
      const receipts_amt = Number(item.receipts_amt) || 0;

      const balance = bal_amt === receipts_amt
        ? bal_after_receipts
        : bal_after_receipts || bal_amt;

      return sum + balance;
    }, 0);

    setBalance(totalBalance.toFixed(2));
    setLoading(false);
  };



  // useEffect(() => {
  //   const savedData = JSON.parse(localStorage.getItem("saleFormData"));
  //   if (savedData?.mobile) {
  //     setFormData((prev) => ({ ...prev, mobile: savedData.mobile }));
  //   }
  // }, []);



  useEffect(() => {
    if (formData.mobile && data.length > 0) {
      fetchBalance(formData.mobile);
    }
    if (!formData.mobile) {
      setBalance("0.00");
    }
  }, [formData.mobile, data]);



  const handleNewTab = () => {
    const newTabId = crypto.randomUUID();
    // Open new tab with the new tabId in URL
    window.open(`/sales?tabId=${newTabId}`, "_blank");
  };



  // Trigger balance fetch when selectedMobile changes
  useEffect(() => {
    if (selectedMobile) {
      fetchBalance(selectedMobile);
    }
  }, [selectedMobile]);

  const handleAddReceipt = () => {
    const selectedCustomer = customers.find(
      cust => cust.account_id === formData.customer_id
    );

    if (selectedCustomer) {
      navigate("/receipts", {
        state: {
          // from: "/sales",
          from: `/sales?tabId=${tabId}`,
          invoiceData: {
            account_name: selectedCustomer.account_name,
            mobile: selectedCustomer.mobile,
            // total_amt: balance 
          }
        }
      });
    } else {
      alert("Please select a customer first");
    }
  };

  // Add this useEffect to your sales form component
  useEffect(() => {
    if (location.state?.selectedMobile) {
      setFormData(prev => ({
        ...prev,
        mobile: location.state.selectedMobile
      }));

      // Also trigger the customer lookup if needed
      const existing = customers.find(c => c.mobile === location.state.selectedMobile);
      if (existing) {
        handleCustomerChange(existing.account_id);
        fetchBalance(existing.mobile);
      }

      // Clear the state to prevent re-selection on re-renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.selectedMobile, customers]);

  return (
    <Col className="sales-form-section">
      <Row>
        <Col xs={12} md={3} className="d-flex align-items-center">
          <div style={{ flex: 1 }}>
            <InputField
              label="Mobile"
              name="mobile"
              type="select"
              value={formData.mobile || ""}
              onChange={(e) => {
                const inputMobile = e.target.value;
                if (!inputMobile) {
                  setFormData((prev) => ({
                    ...prev,
                    customer_id: "",
                    account_name: "",
                    mobile: "",
                    email: "",
                    address1: "",
                    address2: "",
                    city: "",
                    pincode: "",
                    state: "",
                    state_code: "",
                    aadhar_card: "",
                    gst_in: "",
                    pan_card: "",
                  }));
                  return;
                }

                const isValidMobile = /^\d{10}$/.test(inputMobile);
                if (!isValidMobile) {
                  alert("Please enter a valid 10-digit mobile number.");
                  return;
                }

                setFormData((prev) => ({ ...prev, mobile: inputMobile }));

                const existing = customers.find((c) => c.mobile === inputMobile);
                if (existing) {
                  handleCustomerChange(existing.account_id);
                  fetchBalance(existing.mobile);
                }
              }}
              onKeyDown={({ key, value }) => {
                if (key === "Enter") {
                  const isValidMobile = /^\d{10}$/.test(value);
                  const exists = customers.some((c) => c.mobile === value);
                  if (isValidMobile && !exists) {
                    handleAddCustomer(value);
                  }
                }
              }}
              options={customers.map((c) => ({ value: c.mobile, label: c.mobile }))}
              allowCustomInput
            />


          </div>
          <AiOutlinePlus
            size={20}
            color="black"
            // onClick={handleAddCustomer}
            onClick={() => {
              console.log("Mobile passed to handleAddCustomer:", formData.mobile);
              handleAddCustomer(formData.mobile); // This should be passing the correct mobile number
            }}
            style={{
              marginLeft: "10px",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          />
        </Col>

        <Col xs={12} md={3}>
          <InputField
            label="Customer Name"
            name="account_name"
            type="select"
            value={formData.account_name.toUpperCase() || ""}
            onChange={(e) => {
              const inputName = (e.target.value || "").toUpperCase();

              if (!inputName) {
                // Clear all dependent fields
                setFormData((prev) => ({
                  ...prev,
                  customer_id: "",
                  account_name: "",
                  mobile: "",
                  email: "",
                  address1: "",
                  address2: "",
                  city: "",
                  pincode: "",
                  state: "",
                  state_code: "",
                  aadhar_card: "",
                  gst_in: "",
                  pan_card: "",
                }));
                return;
              }

              setFormData((prev) => ({ ...prev, account_name: inputName }));

              const existing = customers.find((c) => c.account_name.toUpperCase() === inputName);
              if (existing) {
                handleCustomerChange(existing.account_id);
                fetchBalance(existing.mobile);
              }
            }}
            options={customers.map((c) => ({
              value: c.account_name.toUpperCase(),
              label: c.account_name.toUpperCase(),
            }))}
            allowCustomInput
          />
        </Col>

        <Col xs={12} md={2}>
          <InputField
            label="Email:"
            name="email"
            type="email"
            value={formData.email || ""}
            readOnly
          />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="Address1:"
            name="address1"
            value={formData.address1 || ""}
            readOnly
          />
        </Col>
        {/* <Col xs={12} md={2}>
          <InputField
            label="Address2:"
            name="address2"
            value={formData.address2 || ""}
            readOnly
          />
        </Col> */}
        <Col xs={12} md={2}>
          <InputField
            label="City"
            name="city"
            value={formData.city || ""}
            readOnly
          />
        </Col>
        <Col xs={12} md={1}>
          <InputField
            label="PIN"
            name="pincode"
            value={formData.pincode || ""}
            readOnly
          />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="State:"
            name="state"
            value={formData.state || ""}
            readOnly
          />
        </Col>
        {/* <Col xs={12} md={1}>
          <InputField
            label="St Code:"
            name="state_code"
            value={formData.state_code || ""}
            readOnly
          />
        </Col> */}
        <Col xs={12} md={2}>
          <InputField
            label="Aadhar"
            name="aadhar_card"
            value={formData.aadhar_card || ""}
            readOnly
          />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="GSTIN"
            name="gst_in"
            value={formData.gst_in || ""}
            readOnly
          />
        </Col>
        {/* <Col xs={12} md={2}>
          <InputField
            label="PAN"
            name="pan_card"
            value={formData.pan_card || ""}
            readOnly
          />
        </Col> */}
        <Col xs={12} md={2}>
          <InputField
            label="Balance Amount:"
            name="balance"
            value={loading ? "Loading..." : `₹ ${balance}`}
            readOnly
          />
        </Col>
        <Col xs={12} md={2}>
          <Button
            style={{
              backgroundColor: '#28a745',
              borderColor: '#28a745',
              fontSize: '0.952rem',
              padding: '0.35rem 0.35rem', fontSize: "13px",
              padding: "5px",
              marginTop: "2px",
            }}
            onClick={handleAddReceipt}
          >
            Add Receipt
          </Button>
        </Col>
        <Col xs={12} md={1}>
          <Button
            onClick={handleNewTab}
            style={{
              backgroundColor: '#28a745',
              borderColor: '#28a745',
              fontSize: '0.952rem',
              padding: '0.35rem 0.35rem', fontSize: "13px",
              padding: "5px",
              marginTop: "2px",
              marginLeft: "-100px"
            }}
          >
            + New
          </Button>
        </Col>


      </Row>
    </Col>
  );
};

export default CustomerDetails;
