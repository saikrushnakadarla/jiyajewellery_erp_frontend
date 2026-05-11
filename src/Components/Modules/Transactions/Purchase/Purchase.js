import React, { useState, useEffect } from "react";
import "./Purchase.css";
import InputField from "./InputField";
import { Container, Row, Col, Button, Table, Form } from "react-bootstrap";
import { renderMatches, useNavigate, useLocation } from 'react-router-dom';
import baseURL from "../../../../Url/NodeBaseURL";
import axios from "axios";
import { AiOutlinePlus } from "react-icons/ai";
import TagEntry from "./TagEntry";
import { Modal } from "react-bootstrap";
import { FaEdit, FaTrash } from 'react-icons/fa';
import StoneDetailsModal from './StoneDetailsModal';
import io from 'socket.io-client';

const URDPurchase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const { state } = useLocation();
  const { mobile } = location.state || {};
  const { invoice } = location.state || {};
  console.log("Invoice=", invoice)
  const initialSearchValue = location.state?.mobile || '';

  const [showWeightSimulator, setShowWeightSimulator] = useState(false);
  const [simulatorWeight, setSimulatorWeight] = useState("");

  const [socketConnected, setSocketConnected] = useState(false);
  const [simulatorStatus, setSimulatorStatus] = useState('Disconnected');

  const [formData, setFormData] = useState({
    id: "",
    customer_id: "",
    mobile: mobile || "",
    account_name: "",
    gst_in: "",
    terms: "Cash",
    invoice: invoice || "",
    bill_no: "",
    date: new Date().toISOString().split("T")[0],
    bill_date: new Date().toISOString().split("T")[0],
    due_date: "",
    Pricing: 'By Weight',
    product_id: "",
    category: "",
    metal_type: "",
    rbarcode: "",
    hsn_code: "",
    pcs: "",
    gross_weight: "",
    stone_weight: "",
    deduct_st_Wt: "No",
    net_weight: "",
    purity: "Manual",
    pure_weight: "",
    wastage_on: "Pure Wt",
    wastage: "",
    wastage_wt: "0.000",
    Making_Charges_On: "MC %",
    Making_Charges_Value: "",
    total_mc: "",
    total_pure_wt: "",
    paid_pure_weight: "",
    balance_pure_weight: "0",
    rate: "",
    total_amount: "",
    tax_slab: "",
    tax_amt: "",
    net_amt: "",
    rate_cut: "",
    rate_cut_wt: "",
    rate_cut_amt: "",
    paid_amount: "",
    balance_amount: "",
    hm_charges: "",
    charges: "",
    remarks: "",
    cut: "",
    color: "",
    clarity: "",
    carat_wt: "",
    stone_price: "",
    final_stone_amount: "",
    balance_after_receipt: "0",
    balWt_after_payment: "0",
    other_charges: "",
    purityPercentage: "100",
    tag_id: "",
    discount_amt: "",
    final_amt: "",
  });

  useEffect(() => {
    if (invoice) {
      setFormData((prev) => ({ ...prev, invoice }));
    }
  }, [invoice]);

  const fetchTagId = async () => {
    try {
      const response = await axios.get(`${baseURL}/max-tag-id`);
      const nextTagId = response.data.nextTagId || 1;
      console.log("Fetched tag_id from API:", nextTagId);

      setFormData((prevData) => ({ ...prevData, tag_id: nextTagId }));

      return nextTagId; // Return the fetched tag_id
    } catch (error) {
      console.error("Error fetching tag_id:", error);
      setFormData((prevData) => ({ ...prevData, tag_id: 1 }));
      return 1; // Return default tag_id
    }
  };

  useEffect(() => {
    fetchTagId();
  }, []);

  useEffect(() => {
    const calculateTotalWeight = () => {
      const storedStoneDetails = JSON.parse(localStorage.getItem("stoneDetails")) || [];

      const totalStoneWeight = storedStoneDetails.reduce(
        (sum, item) => sum + (parseFloat(item.stoneWt) || 0),
        0
      );
      const totalStoneValue = storedStoneDetails.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0
      );

      setFormData((prevData) => ({
        ...prevData,
        stone_weight: totalStoneWeight.toFixed(3),
        final_stone_amount: totalStoneValue.toFixed(2),
      }));
    };

    calculateTotalWeight();

    const handleStorageChange = () => calculateTotalWeight();
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const [rates, setRates] = useState({ rate_24crt: "", rate_22crt: "", rate_18crt: "", rate_16crt: "" });
  const [purityOptions, setPurityOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  const [tableData, setTableData] = useState(() => {
    const savedData = localStorage.getItem("tableData");
    return savedData ? JSON.parse(savedData) : [];
  });

  const [show, setShow] = useState(false);
  const [stoneDetails, setStoneDetails] = useState({
    stoneName: "",
    cut: "",
    color: "",
    clarity: "",
    stoneWt: "",
    caratWt: "",
    stonePrice: "",
    amount: "",
  });

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const [stoneList, setStoneList] = useState([]);
  const [editingStoneIndex, setEditingStoneIndex] = useState(null);

  useEffect(() => {
    const fetchCurrentRates = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/current-rates`);
        setRates({
          rate_24crt: response.data.rate_24crt || "",
          rate_22crt: response.data.rate_22crt || "",
          rate_18crt: response.data.rate_18crt || "",
          rate_16crt: response.data.rate_16crt || "",
          silver_rate: response.data.silver_rate || "",
        });
      } catch (error) {
        console.error('Error fetching current rates:', error);
      }
    };
    fetchCurrentRates();
  }, []);

  const [taxOptions, setTaxOptions] = useState([]);

  useEffect(() => {
    const fetchProductIds = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/taxslabs`);
        const Data = response.data; // Ensure the response structure matches this
        const options = Data.map((tax) => ({
          value: tax.TaxSlabName,
          label: tax.TaxSlabName,
          id: tax.TaxSlabID, // Ensure you have the TaxSlabID
        }));
        setTaxOptions(options);
        console.log("Names=", options)
      } catch (error) {
        console.error("Error fetching product IDs:", error);
      }
    };

    fetchProductIds();
  }, []);

  const handleWeightFromSimulator = () => {
    if (simulatorWeight && !isNaN(simulatorWeight)) {
      handleChange("gross_weight", simulatorWeight);
      setShowWeightSimulator(false);
      setSimulatorWeight("");
    } else {
      alert("Please enter a valid weight");
    }
  };

  // Socket.io connection for weight simulator
  // useEffect(() => {
  //   console.log('Attempting to connect to weight simulator...');

  //   // Connect to the simulator app with explicit configuration
  //   const socket = io('http://localhost:3001', {
  //     transports: ['websocket', 'polling'], // Try both connection methods
  //     reconnection: true,
  //     reconnectionAttempts: 10,
  //     reconnectionDelay: 1000,
  //     timeout: 10000
  //   });

  //   socket.on('connect', () => {
  //     console.log('✅ Connected to weight simulator');
  //     setSocketConnected(true);
  //     setSimulatorStatus('Connected to Simulator');
  //   });

  //   socket.on('connect_error', (error) => {
  //     console.log('❌ Connection error:', error.message);
  //     setSocketConnected(false);
  //     setSimulatorStatus('Connection Error');
  //   });

  //   socket.on('disconnect', (reason) => {
  //     console.log('❌ Disconnected from weight simulator:', reason);
  //     setSocketConnected(false);
  //     setSimulatorStatus('Disconnected from Simulator');
  //   });

  //   socket.on('weight-update', (weight) => {
  //     console.log('📊 Received weight from simulator:', weight);
  //     handleChange('gross_weight', weight);

  //     // Show notification
  //     const notification = document.createElement('div');
  //     notification.style.position = 'fixed';
  //     notification.style.top = '20px';
  //     notification.style.right = '20px';
  //     notification.style.backgroundColor = '#4CAF50';
  //     notification.style.color = 'white';
  //     notification.style.padding = '15px 20px';
  //     notification.style.borderRadius = '5px';
  //     notification.style.zIndex = '9999';
  //     notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  //     notification.style.fontWeight = 'bold';
  //     notification.textContent = `⚖️ Weight received: ${weight}g`;
  //     document.body.appendChild(notification);
  //     setTimeout(() => notification.remove(), 3000);
  //   });

  //   return () => {
  //     console.log('Cleaning up socket connection');
  //     socket.disconnect();
  //   };
  // }, []);

  useEffect(() => {
    if (mobile) {
      console.log("Selected Mobile from New Link:", mobile);

      // Find the customer with the matching mobile
      const matchedCustomer = customers.find((cust) => cust.mobile === mobile);

      if (matchedCustomer) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          customer_id: matchedCustomer.account_id, // Set customer_id to match the dropdown
          account_name: matchedCustomer.account_name,
          mobile: matchedCustomer.mobile || "",
          email: matchedCustomer.email || "",
          address1: matchedCustomer.address1 || "",
          address2: matchedCustomer.address2 || "",
          city: matchedCustomer.city || "",
          pincode: matchedCustomer.pincode || "",
          state: matchedCustomer.state || "",
          state_code: matchedCustomer.state_code || "",
          aadhar_card: matchedCustomer.aadhar_card || "",
          gst_in: matchedCustomer.gst_in || "",
          pan_card: matchedCustomer.pan_card || "",
        }));
      } else {
        // If no customer matches, just set the mobile
        setFormData((prevFormData) => ({
          ...prevFormData,
          mobile: mobile,
        }));
      }
    }
  }, [mobile, customers]);
  const [lastUpdatedField, setLastUpdatedField] = useState(null);
  const [isNetAmtManual, setIsNetAmtManual] = useState(false);
  const [mcOnType, setMcOnType] = useState("MC %");

  const handleChange = (field, value) => {
    setFormData((prevFormData) => {
      let updatedFormData = { ...prevFormData, [field]: value };
      const isFixedPricing = updatedFormData.Pricing === "By fixed";

      if (field === "rate_cut_wt") {
        setLastUpdatedField("rate_cut_wt");
      }
      if (field === "paid_pure_weight") {
        setLastUpdatedField("paid_pure_weight");
      }

      if (field === "gross_weight") {
        // Reset paid_pure_weight and rate_cut when gross_weight is changed
        updatedFormData.paid_pure_weight = "";
        updatedFormData.rate_cut_wt = "";
      }

      if (field === "category") {
        const selectedCategory = categories.find(
          (category) => category.value === value
        );

        if (selectedCategory) {
          const matchedTaxSlab = taxOptions.find(
            (tax) => tax.value === selectedCategory.tax_slab
          );

          if (matchedTaxSlab) {
            updatedFormData.tax_slab = matchedTaxSlab.value;
          } else {
            updatedFormData.tax_slab = "";
          }
        } else {
          updatedFormData.tax_slab = "";
        }

        // Reset paid_amount if it has a value
        if (updatedFormData.paid_amount) {
          updatedFormData.paid_amount = "";
        }
      }
      if (field === "category" && value === "") {
        updatedFormData.rbarcode = "";
        updatedFormData.hsn_code = "";
        updatedFormData.pcs = "";
        updatedFormData.gross_weight = "";
        updatedFormData.stone_weight = "";
        updatedFormData.deduct_st_Wt = "No";
        updatedFormData.stone_price = "";
        updatedFormData.wastage_on = "Pure Wt";
        updatedFormData.wastage = "";
        updatedFormData.wastage_wt = "0.000";
        updatedFormData.total_pure_wt = "";
        updatedFormData.net_weight = "";
        updatedFormData.hm_charges = "";
        updatedFormData.other_charges = "";
        updatedFormData.charges = "";
        updatedFormData.Making_Charges_On = "MC %";
        updatedFormData.Making_Charges_Value = "";
        updatedFormData.total_mc = "";
        updatedFormData.product_id = "";
        updatedFormData.metal_type = "";
        updatedFormData.pure_weight = "";
        updatedFormData.paid_pure_weight = "";
        updatedFormData.balance_pure_weight = "0";
        updatedFormData.rate = "";
        updatedFormData.rate_cut = "";
        updatedFormData.tax_slab = "";
        updatedFormData.tax_amt = "";
        updatedFormData.total_amount = "";
        updatedFormData.rate_cut_amt = "";
        updatedFormData.paid_amount = "";
        updatedFormData.balance_amount = "";
        updatedFormData.balance_after_receipt = "0";
        updatedFormData.balWt_after_payment = "0";
        updatedFormData.Pricing = "By Weight";
        updatedFormData.purityPercentage = "100";
        updatedFormData.remarks = "";
        updatedFormData.rate_cut_wt = "";
        updatedFormData.net_amt = "";
        updatedFormData.diamond_wt = "";
        updatedFormData.discount_amt = "";
        updatedFormData.final_amt = "";
      }

      if (field === "Making_Charges_On") {
        setMcOnType(value); // Track MC On selection
        updatedFormData.Making_Charges_Value = ""; // Reset Making Charges Value
        updatedFormData.total_mc = ""; // Reset Total MC
      }

      if ((field === "purity" || field === "metal_type") && !isFixedPricing) {
        if (updatedFormData.metal_type?.toLowerCase() === "gold" || updatedFormData.metal_type?.toLowerCase() === "diamond" || updatedFormData.metal_type?.toLowerCase() === "others") {

          const normalizedValue = value.toLowerCase().replace(/\s+/g, "");

          if (normalizedValue === "manual") {
            updatedFormData.rate = rates.rate_22crt;
            updatedFormData.rate_cut = rates.rate_22crt;
          } else if (normalizedValue.includes("22")) {
            updatedFormData.rate = rates.rate_22crt;
            updatedFormData.rate_cut = rates.rate_22crt;
          } else if (normalizedValue.includes("24")) {
            updatedFormData.rate = rates.rate_24crt;
            updatedFormData.rate_cut = rates.rate_24crt;
          } else if (normalizedValue.includes("18")) {
            updatedFormData.rate = rates.rate_18crt;
            updatedFormData.rate_cut = rates.rate_18crt;
          } else if (normalizedValue.includes("16")) {
            updatedFormData.rate = rates.rate_16crt;
            updatedFormData.rate_cut = rates.rate_16crt;
          } else {
            updatedFormData.rate = rates.rate_22crt;
            updatedFormData.rate_cut = rates.rate_22crt;
          }
        }
      }

      if (field === "paid_amount") {
        const totalAmount =
          updatedFormData.Pricing === "By fixed"
            ? parseFloat(updatedFormData.final_amt) || 0
            : parseFloat(updatedFormData.rate_cut_amt) || 0;

        const paidAmount = parseFloat(value) || 0;

        if (paidAmount > totalAmount) {
          alert("Paid amount cannot exceed the allowable amount.");
          return prevFormData;
        }
      }


      if (field === "rate_cut_wt") {
        const totalWeight = parseFloat(updatedFormData.total_pure_wt) || "";
        const paidWeight = parseFloat(value) || 0;
        if (paidWeight > totalWeight) {
          alert("Paid Weight cannot exceed the total Weight.");
          return prevFormData;
        }
      }

      if (field === "paid_pure_weight") {
        const totalWeight = parseFloat(updatedFormData.total_pure_wt) || "";
        const paidWeight = parseFloat(value) || 0;
        if (paidWeight > totalWeight) {
          alert("Paid Weight cannot exceed the total Weight.");
          return prevFormData;
        }
      }

      if (field === "net_amt") {
        // Mark net_amt as manually entered
        setIsNetAmtManual(value !== "");

        if (value !== "") {
          // Perform reverse calculations
          const hmCharges = parseFloat(updatedFormData.hm_charges) || 0;
          const otherCharges = parseFloat(updatedFormData.charges) || 0;
          const totalStoneValue = parseFloat(updatedFormData.final_stone_amount) || 0;
          const totalPureWeight = parseFloat(updatedFormData.total_pure_wt) || 0;
          const makingChargesValue = parseFloat(updatedFormData.Making_Charges_Value) || 0;
          const taxSlab = parseFloat(updatedFormData.tax_slab) || 0;
          const makingChargesOn = updatedFormData.Making_Charges_On;

          const firstValue = parseFloat(value) - hmCharges - otherCharges;
          const secondValue = (firstValue / (taxSlab + 100)) * 100;

          let calculatedRate = 0;
          let totalMC = 0;

          if (makingChargesOn === "MC %") {
            const thirdValue = secondValue - totalStoneValue;
            calculatedRate = (thirdValue / (makingChargesValue + 100)) * 100 / totalPureWeight;
            totalMC = (makingChargesValue * calculatedRate * totalPureWeight) / 100;
          } else if (makingChargesOn === "MC / Gram") {
            const thirdValue = secondValue - totalStoneValue - (parseFloat(updatedFormData.total_mc) || 0);
            calculatedRate = thirdValue / totalPureWeight;
            totalMC = makingChargesValue * totalPureWeight;
          }

          updatedFormData.rate = calculatedRate.toFixed(2);
          updatedFormData.total_amount = (calculatedRate * totalPureWeight).toFixed(2);
          updatedFormData.total_mc = totalMC.toFixed(2);
          updatedFormData.tax_amt = (
            ((totalStoneValue + totalMC + parseFloat(updatedFormData.total_amount)) * taxSlab) / 100
          ).toFixed(2);
          updatedFormData.final_amt = (
            parseFloat(updatedFormData.net_amt || 0) + parseFloat(updatedFormData.discount_amt || 0)
          ).toFixed(2);
        } else {
          // Reset all calculated fields if net_amt is cleared
          updatedFormData.rate = "0.00";
          updatedFormData.total_amount = "0.00";
          updatedFormData.total_mc = "0.00";
          updatedFormData.tax_amt = "0.00";
          updatedFormData.final_amt = "0.00";
        }
      } else {
        // If any other field is updated, recalculate from scratch
        setIsNetAmtManual(false);
      }
      return updatedFormData;
    });
  };

  useEffect(() => {
    localStorage.setItem("tableData", JSON.stringify(tableData));
  }, [tableData]);

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!formData.invoice || formData.invoice.trim() === "") {
      alert("Please fill the invoice field.");
      return;
    }

    const latestTagId = editingIndex !== null ? tableData[editingIndex].tag_id : await fetchTagId();

    const apiData = {
      tag_id: latestTagId,
      product_id: formData.product_id,
      pcs: formData.pcs || "0",
      gross_weight: formData.gross_weight || "0",
      bal_pcs: formData.pcs || "0",
      bal_gross_weight: formData.gross_weight || "0",
    };

    try {
      const response = await fetch(`${baseURL}/add-entry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);

        // Update the local state
        const storedStones = JSON.parse(localStorage.getItem("stoneDetails")) || [];
        const newEntry = { ...formData, tag_id: latestTagId, stoneDetails: storedStones };

        let updatedTableData;
        if (editingIndex !== null) {
          updatedTableData = tableData.map((row, index) =>
            index === editingIndex ? newEntry : row
          );
        } else {
          updatedTableData = [...tableData, newEntry];
        }

        setTableData(updatedTableData);
        localStorage.setItem("tableData", JSON.stringify(updatedTableData));
        localStorage.removeItem("stoneDetails");
        window.dispatchEvent(new Event("storage"));
        setStoneList([]);
        setEditingIndex(null);

        setFormData({
          ...formData,
          Pricing: "By Weight",
          product_id: "",
          category: "",
          metal_type: "",
          rbarcode: "",
          hsn_code: "",
          pcs: "",
          gross_weight: "",
          stone_weight: "",
          deduct_st_Wt: "No",
          net_weight: "",
          purity: "Manual",
          pure_weight: "",
          wastage_on: "Pure Wt",
          wastage: "",
          wastage_wt: "0.000",
          Making_Charges_On: "MC %",
          Making_Charges_Value: "",
          total_mc: "",
          total_pure_wt: "",
          paid_pure_weight: "",
          balance_pure_weight: "0",
          rate: "",
          total_amount: "",
          tax_slab: "",
          tax_amt: "",
          net_amt: "",
          rate_cut: "",
          rate_cut_wt: "",
          rate_cut_amt: "",
          paid_amount: "",
          balance_amount: "",
          hm_charges: "",
          charges: "",
          remarks: "",
          cut: "",
          color: "",
          clarity: "",
          carat_wt: "",
          stone_price: "",
          // final_stone_amount: "",
          balance_after_receipt: "0",
          balWt_after_payment: "0",
          other_charges: "",
          purityPercentage: "100",
          discount_amt: "",
          final_amt: "",
        });
      } else {
        console.error("Failed to add/update entry:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding/updating entry:", error);
    }
  };

  const handleEdit = (index) => {
    const selectedData = { ...tableData[index] }; // Clone the selected row data
    const { stoneDetails, customer_id, rate_cut } = selectedData;

    if (stoneDetails) {
      localStorage.setItem("stoneDetails", JSON.stringify(stoneDetails));
      setStoneList(stoneDetails);
    } else {
      localStorage.removeItem("stoneDetails");
      setStoneList([]);
    }

    delete selectedData.stoneDetails;

    setFormData((prevFormData) => ({
      ...prevFormData,
      ...selectedData,  // Always take the latest data from selectedData
      customer_id: prevFormData.customer_id || customer_id,
      rate_cut: rate_cut, // Ensure rate_cut is updated
    }));

    setEditingIndex(index); // Track the index being edited
  };

  const handleDelete = async (tag_id, product_id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      const response = await fetch(`${baseURL}/delete/updatedvalues/${tag_id}/${product_id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove from localStorage and update state
        const updatedData = tableData.filter(
          (entry) => !(entry.tag_id === tag_id && entry.product_id === product_id)
        );

        setTableData(updatedData);
        localStorage.setItem("tableData", JSON.stringify(updatedData));

        alert("Entry deleted successfully!");
      } else {
        alert("Failed to delete entry.");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Error deleting entry. Please try again.");
    }
  };

  const getTabId = () => {
    // First try to get from URL
    const urlParams = new URLSearchParams(window.location.search);
    let tabId = urlParams.get('tabId');

    // If not in URL, try sessionStorage
    if (!tabId) {
      tabId = sessionStorage.getItem('tabId');
    }

    // If still not found, generate new ID
    if (!tabId) {
      tabId = crypto.randomUUID();
      sessionStorage.setItem('tabId', tabId);

      // Update URL without page reload
      const newUrl = `${window.location.pathname}?tabId=${tabId}`;
      window.history.replaceState({}, '', newUrl);
    }

    return tabId;
  };

  const tabId = getTabId();

  const handleClose1 = () => {
    // navigate(`/sales?tabId=${tabId}`);
    navigate(-1);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Check if the customer's mobile number is provided
    if (!formData.mobile || formData.mobile.trim() === "") {
      alert("Please select or enter customer's mobile number");
      return;
    }

    if (!formData.invoice) {
      alert("Please enter Invoice number");
      return;
    }

    console.log("Product ID before submission:", formData.product_id);

    try {
      // Prepare data for saving
      const dataToSave = {
        formData: { ...formData, }, // Include form data as it is
        table_data: tableData.map((row) => ({
          ...row,
        })),
      };

      console.log("Data to save:", dataToSave);

      // Send data to the backend
      const response = await axios.post(`${baseURL}/post/purchase`, dataToSave, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Purchase saved successfully:", response.data);
      alert("Purchase saved successfully");

      // Reset formData and tableData
      setFormData({
        mobile: "",
        account_name: "",
        gst_in: "",
        terms: "Cash",
        bill_no: "",
        date: new Date().toISOString().split("T")[0],
        bill_date: new Date().toISOString().split("T")[0],
        due_date: "",
        Pricing: 'By Weight',
        product_id: "",
        category: "",
        metal_type: "",
        rbarcode: "",
        hsn_code: "",
        pcs: "",
        gross_weight: "",
        stone_weight: "",
        deduct_st_Wt: "No",
        net_weight: "",
        purity: "Manual",
        pure_weight: "",
        wastage_on: "Pure Wt",
        wastage: "",
        wastage_wt: "0.000",
        Making_Charges_On: "MC %",
        Making_Charges_Value: "",
        total_mc: "",
        total_pure_wt: "",
        paid_pure_weight: "",
        balance_pure_weight: "0",
        rate: "",
        total_amount: "",
        tax_slab: "",
        tax_amt: "",
        net_amt: "",
        rate_cut: "",
        rate_cut_wt: "",
        rate_cut_amt: "",
        paid_amount: "",
        balance_amount: "",
        hm_charges: "",
        charges: "",
        remarks: "",
        cut: "",
        color: "",
        clarity: "",
        carat_wt: "",
        stone_price: "",
        // final_stone_amount: "",
        balance_after_receipt: "0",
        balWt_after_payment: "0",
        other_charges: "",
        purityPercentage: "100",
        discount_amt: "",
        final_amt: "",
      });
      setTableData([]);
      localStorage.removeItem("purchaseFormData");
      localStorage.removeItem("tableData");
      // window.location.reload();
      navigate("/purchasetable");
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get/account-details`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();

        // Filter only suppliers or customers
        const filteredCustomers = result.filter(
          (item) => item.account_group === 'SUPPLIERS' || item.account_group === 'CUSTOMERS'
        );
        setCustomers(filteredCustomers);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCustomerChange = (customerId) => {
    setFormData((prevData) => ({
      ...prevData,
      customer_id: customerId, // Ensure customer_id is correctly updated
    }));

    const customer = customers.find((cust) => String(cust.account_id) === String(customerId));
    console.log("Customer Id=", customer)

    if (customer) {
      setFormData({
        ...formData,
        customer_id: customerId, // Ensure this is correctly set
        account_name: customer.account_name, // Set the name field to the selected customer
        mobile: customer.mobile || "",
        email: customer.email || "",
        address1: customer.address1 || "",
        address2: customer.address2 || "",
        city: customer.city || "",
        pincode: customer.pincode || "",
        state: customer.state || "",
        state_code: customer.state_code || "",
        aadhar_card: customer.aadhar_card || "",
        gst_in: customer.gst_in || "",
        pan_card: customer.pan_card || "",

      });
    } else {
      setFormData({
        ...formData,
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
      });
    }
  };

  const handleBack = () => {
    navigate('/purchasetable');
  };

  const handleAddCustomer = () => {
    navigate("/suppliermaster", { state: { from: "/purchase" } });
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (showModal) {
        e.preventDefault();
        e.returnValue = ""; // This triggers the confirmation dialog in some browsers.
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [showModal]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  // useEffect(() => {
  //   const fetchLastInvoice = async () => {
  //     try {
  //       const response = await axios.get(`${baseURL}/lastInvoice`);
  //       console.log("API Response:", response.data); // Log API response

  //       setFormData((prev) => ({
  //         ...prev,
  //         invoice: response.data.lastInvoiceNumber,
  //       }));
  //     } catch (error) {
  //       console.error("Error fetching invoice number:", error);
  //     }
  //   };

  //   fetchLastInvoice();
  // }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${baseURL}/get/products`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();

        // Extract unique categories and map them into the required format with purity and hsn_code
        const categorizedData = data.map((item) => ({
          value: item.product_name,
          label: item.product_name,
          categoryType: item.Category, // Assuming "category" column indicates Gold/Silver
          purity: item.purity,
          hsn_code: item.hsn_code,
          product_id: item.product_id,
          tax_slab: item.tax_slab,
        }));

        // Remove duplicates
        const uniqueCategories = [
          ...new Map(categorizedData.map((item) => [item.value, item])).values(),
        ];

        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.category) {
      axios
        .get(`${baseURL}/get/products`)
        .then((response) => {
          const products = response.data;

          const matchingProduct = products.find(
            (product) =>
              product.product_name === formData.category
          );

          if (matchingProduct) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              product_id: matchingProduct.product_id, // Update product_id
              rbarcode: matchingProduct.rbarcode,    // Update rbarcode
              metal_type: matchingProduct.Category,
              hsn_code: matchingProduct.hsn_code,
            }));
          } else {
            // Reset product_id and rbarcode if no match
            setFormData((prevFormData) => ({
              ...prevFormData,
              product_id: '',
              rbarcode: '',
              hsn_code: '',
              purity: 'Manual',
              rate: '',
              rate_cut: '',
            }));
          }
        })
        .catch((error) => {
          console.error("Error fetching product details:", error);
        });
    } else {
      // Reset if category or purity is not selected
      setFormData((prevFormData) => ({
        ...prevFormData,
        Pricing: 'By Weight',
        product_id: "",
        category: "",
        metal_type: "",
        rbarcode: "",
        hsn_code: "",
        pcs: "",
        gross_weight: "",
        stone_weight: "",
        deduct_st_Wt: "No",
        net_weight: "",
        purity: "Manual",
        pure_weight: "",
        wastage_on: "Pure Wt",
        wastage: "",
        wastage_wt: "0.000",
        Making_Charges_On: "MC %",
        Making_Charges_Value: "",
        total_mc: "",
        total_pure_wt: "",
        paid_pure_weight: "",
        balance_pure_weight: "0",
        rate: "",
        total_amount: "",
        tax_slab: "",
        tax_amt: "",
        net_amt: "",
        rate_cut: "",
        rate_cut_wt: "",
        rate_cut_amt: "",
        paid_amount: "",
        balance_amount: "",
        hm_charges: "",
        charges: "",
        remarks: "",
        cut: "",
        color: "",
        clarity: "",
        carat_wt: "",
        stone_price: "",
        // final_stone_amount: "",
        balance_after_receipt: "0",
        balWt_after_payment: "0",
        other_charges: "",
        purityPercentage: "100",
        discount_amt: "",
        final_amt: "",
      }));
    }
  }, [formData.category]);

  useEffect(() => {
    const fetchPurity = async () => {
      if (!formData.category) {
        setFormData((prev) => ({
          ...prev,
          purity: "Manual",
          rate: "",  // Preserve existing rate if available
          rate_cut: "",  // Preserve existing rate_cut if available
          Making_Charges_On: "MC %", // Reset Making Charges
        }));
        setPurityOptions([]);
        setMcOnType("MC %"); // Reset mcOnType
        return;
      }

      if (!formData.metal_type) {
        setPurityOptions([]);
        return;
      }

      try {
        const response = await axios.get(`${baseURL}/purity`);

        // Determine if metal is gold or diamond
        const isGoldOrDiamond =
          formData.metal_type.toLowerCase() === "gold" ||
          formData.metal_type.toLowerCase() === "diamond" ||
          formData.metal_type.toLowerCase() === "others";

        // Filter purities based on metal type
        const filteredPurity = response.data.filter((item) =>
          isGoldOrDiamond
            ? item.metal.toLowerCase() === "gold" // Show gold purities for both gold and diamond
            : item.metal.toLowerCase() === formData.metal_type.toLowerCase()
        );

        setPurityOptions(filteredPurity);
        console.log("Purity Options:", filteredPurity);

        let defaultOption = null;
        let mcType = "";

        if (isGoldOrDiamond) {
          defaultOption = filteredPurity.find((option) =>
            option.name.toLowerCase().includes("22") // Prefer 22k gold if available
          );

          mcType = "MC %"; // Gold/Diamond => MC %

          if (defaultOption) {
            setFormData((prev) => ({
              ...prev,
              rate: rates.rate_22crt, // Preserve existing rate if available
              rate_cut: rates.rate_22crt, // Preserve existing rate_cut if available
              Making_Charges_On: mcType,
            }));
          }
        }

        if (formData.metal_type.toLowerCase() === "silver") {
          const silver22 = filteredPurity.find((option) =>
            option.name.toLowerCase().includes("22")
          );

          const silver24 = filteredPurity.find((option) =>
            option.name.toLowerCase().includes("24")
          );

          const silver925 = filteredPurity.find((option) =>
            option.name.toLowerCase().includes("92.5")
          );

          defaultOption = silver925 || silver24 || silver22;
          mcType = "MC / Gram"; // Silver => MC / Gram

          if (defaultOption) {
            setFormData((prev) => ({
              ...prev,
              rate: rates.silver_rate, // Preserve existing rate if available
              rate_cut: rates.silver_rate, // Preserve existing rate_cut if available
              Making_Charges_On: mcType,
            }));
          }
        }

        setMcOnType(mcType); // Update mcOnType state

        // Reset last updated field so future changes are not ignored
        setLastUpdatedField(null);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchPurity();
  }, [formData.metal_type, formData.category]);


  const extractPurityPercentage = (purityValue) => {
    if (!purityValue || purityOptions.length === 0) return 0;

    if (purityValue.toLowerCase() === "manual") {
      return parseFloat(formData.purityPercentage) || 0; // Use custom purity input
    }

    const matchedPurity = purityOptions.find((option) =>
      purityValue.includes(option.name)
    );

    return matchedPurity ? parseFloat(matchedPurity.purity_percentage) || 0 : 0;
  };

  useEffect(() => {
    if (!isNetAmtManual) {
      setFormData((prevData) => {
        let updatedFormData = { ...prevData };
        const netWeight = parseFloat(updatedFormData.net_weight) || "";
        const purityPercentage = extractPurityPercentage(updatedFormData.purity) || parseFloat(updatedFormData.purityPercentage) || 0;
        const wastagePercentage = parseFloat(updatedFormData.wastage) || "";
        const grossWeight = parseFloat(updatedFormData.gross_weight) || 0;
        const stoneWeight = parseFloat(updatedFormData.stone_weight) || 0;
        const stonePrice = parseFloat(updatedFormData.stone_price) || 0;
        const DiamondWt = parseFloat(updatedFormData.diamond_wt) || 0;
        const makingChargesValue = parseFloat(updatedFormData.Making_Charges_Value) || 0;
        const totalMC = parseFloat(updatedFormData.total_mc) || 0;
        const totalAmount = parseFloat(updatedFormData.total_amount) || 0;
        const rate = parseFloat(updatedFormData.rate) || 0;
        const taxSlab = parseFloat(updatedFormData.tax_slab) || 0;
        let rateCut = parseFloat(updatedFormData.rate_cut) || 0;
        const rateCuttedWt = parseFloat(updatedFormData.rate_cut_wt) || 0;
        const hmCharges = parseFloat(updatedFormData.hm_charges) || 0;
        const otherCharges = parseFloat(updatedFormData.charges) || 0;
        const totalStoneValue = parseFloat(updatedFormData.final_stone_amount) || 0;
        const totalPureWeight = parseFloat(updatedFormData.total_pure_wt) || 0;
        const discountAmt = parseFloat(updatedFormData.discount_amt) || 0;

        let paidPureWeight = parseFloat(updatedFormData.paid_pure_weight) || "";
        let paidAmount = parseFloat(updatedFormData.rate_cut_amt) || 0;

        // Net Weight Calculation
        if (grossWeight || stoneWeight) {
          if (updatedFormData.deduct_st_Wt === "Yes") {
            updatedFormData.net_weight = (grossWeight - stoneWeight).toFixed(3);
          } else {
            updatedFormData.net_weight = grossWeight.toFixed(3);
          }
        } else {
          updatedFormData.net_weight = "";
        }

        // Pure Weight Calculation
        updatedFormData.pure_weight = ((netWeight * purityPercentage) / 100).toFixed(3);

        // Wastage Calculation
        let baseWeight = 0;
        if (updatedFormData.wastage_on === "Gross Wt") {
          baseWeight = grossWeight;
        } else if (updatedFormData.wastage_on === "Net Wt") {
          baseWeight = netWeight;
        } else if (updatedFormData.wastage_on === "Pure Wt") {
          baseWeight = parseFloat(updatedFormData.pure_weight) || "";
        }
        updatedFormData.wastage_wt = ((wastagePercentage * baseWeight) / 100).toFixed(3);

        // Total Pure Weight
        updatedFormData.total_pure_wt = (parseFloat(updatedFormData.pure_weight) + parseFloat(updatedFormData.wastage_wt)).toFixed(3);

        // Carat Weight Calculation
        updatedFormData.carat_wt = (stoneWeight * 5).toFixed(3);

        // Pricing Calculation
        if (updatedFormData.Pricing === "By fixed") {
          updatedFormData.total_amount = ((parseFloat(updatedFormData.pcs) || 0) * rate).toFixed(2);
        } else if (updatedFormData.Pricing === "By Weight") {
          updatedFormData.total_amount = ((parseFloat(updatedFormData.total_pure_wt) || 0) * rate).toFixed(2);
        }

        // Making Charges Calculation
        if (updatedFormData.Making_Charges_On === "MC / Gram") {
          updatedFormData.total_mc = (makingChargesValue * updatedFormData.total_pure_wt).toFixed(2);
        } else if (updatedFormData.Making_Charges_On === "MC / Piece" && updatedFormData.total_pure_wt > 0) {
          updatedFormData.Making_Charges_Value = (totalMC / updatedFormData.total_pure_wt).toFixed(2);
        } else if (updatedFormData.Making_Charges_On === "MC %") {
          updatedFormData.total_mc = ((makingChargesValue * updatedFormData.total_amount) / 100).toFixed(2);
        }

        // Tax Amount Calculation
        updatedFormData.tax_amt = (((totalStoneValue + totalAmount + totalMC) * taxSlab) / 100).toFixed(2);

        // Net Amount Calculation
        updatedFormData.net_amt = (totalStoneValue + totalAmount + totalMC + parseFloat(updatedFormData.tax_amt) + hmCharges + otherCharges).toFixed(2);

        // Final Amount Calculation
        updatedFormData.final_amt = (
          parseFloat(updatedFormData.net_amt) + discountAmt
        ).toFixed(2);


        // Store previous rate_cut value before updating
        if (!updatedFormData.previousRateCut) {
          updatedFormData.previousRateCut = updatedFormData.rate_cut;
        }

        // Handling `lastUpdatedField`
        if (lastUpdatedField === "paid_pure_weight") {
          if (!paidPureWeight || paidPureWeight === 0) {
            updatedFormData.balance_pure_weight = totalPureWeight.toFixed(3);
          } else {
            updatedFormData.balance_pure_weight = (totalPureWeight - paidPureWeight).toFixed(3);
          }

          // Only set rate_cut to 0 if it's greater than 0
          if (updatedFormData.rate_cut > 0) {
            updatedFormData.rate_cut = 0;
          }
        }

        if (lastUpdatedField === "rate_cut_wt") {
          updatedFormData.paid_pure_weight = rateCuttedWt;
          updatedFormData.balance_pure_weight = (totalPureWeight - rateCuttedWt).toFixed(3);
          updatedFormData.rate_cut_amt = (rateCuttedWt * rateCut).toFixed(2);
        }

        // Restore previous rate_cut if paid_pure_weight is cleared
        if (lastUpdatedField === "paid_pure_weight" && paidPureWeight === "") {
          updatedFormData.rate_cut = updatedFormData.previousRateCut || 0;
        }

        // Handle rate_cut and rate_cut_amt
        if (rateCut > 0 || rateCuttedWt > 0) {
          updatedFormData.rate_cut_amt = (rateCuttedWt * rateCut).toFixed(2);
        } else {
          updatedFormData.rate_cut_amt = "0.00";
        }

        // Balance Calculations
        updatedFormData.balance_pure_weight =
          !updatedFormData.paid_pure_weight || parseFloat(updatedFormData.paid_pure_weight) === 0
            ? parseFloat(updatedFormData.total_pure_wt).toFixed(3)
            : (parseFloat(updatedFormData.total_pure_wt) - parseFloat(updatedFormData.paid_pure_weight)).toFixed(3);

        // updatedFormData.balance_amount = (totalAmount - parseFloat(updatedFormData.rate_cut_amt) || 0).toFixed(2);

        // Balance Amount Calculation
        if (updatedFormData.Pricing === "By fixed") {
          updatedFormData.balance_amount = (
            parseFloat(updatedFormData.final_amt || 0) - parseFloat(updatedFormData.paid_amount || 0)
          ).toFixed(2);
        } else {
          updatedFormData.balance_amount = (
            parseFloat(updatedFormData.rate_cut_amt || 0) - parseFloat(updatedFormData.paid_amount || 0)
          ).toFixed(2);
        }



        return updatedFormData;
      });
    }
  }, [
    formData.purity,
    formData.purityPercentage,
    formData.net_weight,
    formData.rate,
    formData.total_amount,
    formData.rate_cut_amt,
    formData.paid_amount,
    formData.paid_pure_weight,
    formData.wastage,
    formData.wastage_on,
    formData.gross_weight,
    formData.stone_weight,
    formData.deduct_st_Wt,
    formData.stone_price,
    formData.Pricing,
    formData.pcs,
    formData.Making_Charges_On,
    formData.Making_Charges_Value,
    formData.total_mc,
    formData.tax_slab,
    formData.rate_cut,
    formData.diamond_wt,
    formData.carat_wt,
    formData.rate_cut_wt,
    formData.tax_amt,
    formData.hm_charges,
    formData.charges,
    formData.net_amt,
    formData.discount_amt,
    formData.final_amt,
    formData.category,
    isNetAmtManual
  ]);

  const handleOpenModal = (data) => {
    setSelectedProduct(data);
    setShowModal(true);
  };

  const handleAddCategory = () => {
    console.log("Add Category button clicked");
    navigate("/itemmaster", { state: { from: "/purchase" } });
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prevState) => ({
      ...prevState,
      bill_date: today,
    }));
  }, []);

  useEffect(() => {
    const storedStones = JSON.parse(localStorage.getItem("stoneDetails")) || [];
    setStoneList(storedStones);
  }, []);

  const handleAddStone = () => {
    let newStoneList = [...stoneList];

    if (editingStoneIndex !== null) {
      newStoneList[editingStoneIndex] = stoneDetails;
      setEditingStoneIndex(null);
    } else {
      newStoneList.push(stoneDetails);
    }

    setStoneList(newStoneList);
    localStorage.setItem("stoneDetails", JSON.stringify(newStoneList));
    window.dispatchEvent(new Event("storage"));
    setStoneDetails({
      stoneName: "",
      cut: "",
      color: "",
      clarity: "",
      stoneWt: "",
      caratWt: "",
      stonePrice: "",
      amount: "",
    });
  };

  const handleEditStone = (index) => {
    const selectedStone = stoneList[index];
    setStoneDetails(selectedStone);
    setEditingStoneIndex(index);
    handleShow();
  };

  const handleDeleteStone = (index) => {
    const updatedList = stoneList.filter((_, i) => i !== index);
    setStoneList(updatedList);
    localStorage.setItem("stoneDetails", JSON.stringify(updatedList));
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="main-container">
      <div className="purchase-form-container">
        <Form onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <div className="purchase-form" style={{ marginTop: "-10px" }}>
            <div className="purchase-form-left">
              <Col className="urd-form1-section">
                <h4 className="mb-4">Supplier Details</h4>
                <Row>
                  <Col xs={12} md={4} className="d-flex align-items-center">
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
                              mobile: "",
                              account_name: "",
                              email: "",
                              address1: "",
                              city: "",
                              pincode: "",
                              state: "",
                              aadhar_card: "",
                              gst_in: "",
                            }));
                            return;
                          }

                          // Check for exactly 10 digits
                          const isValidMobile = /^\d{10}$/.test(inputMobile);
                          if (!isValidMobile) {
                            alert("Please enter a valid 10-digit mobile number.");
                            return;
                          }

                          setFormData((prev) => ({ ...prev, mobile: inputMobile }));
                          const existing = customers.find((c) => c.mobile === inputMobile);
                          if (existing) {
                            handleCustomerChange(existing.account_id);

                          }
                        }}
                        options={customers.map((c) => ({ value: c.mobile, label: c.mobile }))}
                        allowCustomInput
                      />
                    </div>
                    <AiOutlinePlus
                      size={20}
                      color="black"
                      onClick={handleAddCustomer}
                      style={{
                        marginLeft: "10px",
                        cursor: "pointer",
                        marginBottom: "20px",
                      }}
                    />
                  </Col>

                  <Col xs={12} md={4}>
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
                            mobile: "",
                            account_name: "",
                            email: "",
                            address1: "",
                            city: "",
                            pincode: "",
                            state: "",
                            aadhar_card: "",
                            gst_in: "",
                          }));
                          return;
                        }

                        setFormData((prev) => ({ ...prev, account_name: inputName }));

                        const existing = customers.find((c) => c.account_name.toUpperCase() === inputName);
                        if (existing) {
                          handleCustomerChange(existing.account_id);

                        }
                      }}
                      options={customers.map((c) => ({
                        value: c.account_name.toUpperCase(),
                        label: c.account_name.toUpperCase(),
                      }))}
                      allowCustomInput
                    />
                  </Col>

                  <Col xs={12} md={4}>
                    <InputField label="GSTIN" value={formData.gst_in}
                      onChange={(e) => handleChange("gst_in", e.target.value)} />
                  </Col>
                </Row>
              </Col>
            </div>
            <div className="purchase-form-right">
              <Col className="urd-form2-section">
                <h4 className="mb-4">Invoice Details</h4>
                <Row>
                  {/* <Col xs={12} md={4}>
                    <InputField
                      label="Invoice"
                      value={formData.invoice || ""}  // Prevents undefined issue
                      onChange={(e) => handleChange("invoice", e.target.value)}
                    />
                  </Col> */}
                  <Col xs={12} md={4}>
                    <InputField
                      label="Invoice"
                      value={formData.invoice || ""} // Ensures no undefined issue
                      onChange={(e) => {
                        const input = e.target;
                        const start = input.selectionStart; // Capture cursor position
                        const transformedValue = input.value.toUpperCase();

                        setFormData((prevState) => ({
                          ...prevState,
                          invoice: transformedValue,
                        }));

                        // Restore cursor position after transformation
                        requestAnimationFrame(() => {
                          input.setSelectionRange(start, start);
                        });
                      }}
                    />
                  </Col>



                  <Col xs={12} md={4}>
                    <InputField
                      label="Bill Date"
                      type="date"
                      value={formData.bill_date}
                      onChange={(e) => handleChange("bill_date", e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={4} >
                    <InputField label="Due Date" type="date" value={formData.due_date}
                      onChange={(e) => handleChange("due_date", e.target.value)} />
                  </Col>
                </Row>
              </Col>
            </div>
          </div>
          <div className="urd-form-section">
            <Row>
              {/* <Col xs={12} md={2}>
                <InputField
                  label="Pricing"
                  name="Pricing"
                  type="select"
                  value={formData.Pricing || ""}
                  onChange={(e) => handleChange("Pricing", e.target.value)}
                  options={[
                    { value: "By Weight", label: "By Weight" },
                    { value: "By fixed", label: "By fixed" },
                  ]}
                />
              </Col> */}
              <Col style={{ width: "350px" }} xs={12} md={2} className="d-flex align-items-center gap-2">
                {/* Label */}
                <label style={{ marginTop: "-24px", color: "#A26D2B" }} className="fw-bold mb-0 me-2">Pricing :</label>

                {/* By Weight Option */}
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="Pricing"
                    value="By Weight"
                    checked={formData.Pricing === "By Weight"} style={{ marginBottom: "20px" }}
                    onChange={(e) => handleChange("Pricing", e.target.value)}
                  />
                  <label style={{ width: "80px", marginTop: "5px", color: "#A26D2B" }} className="form-check-label ms-1">By Weight</label>
                </div>

                {/* By Fixed Option */}
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="Pricing"
                    value="By fixed"
                    checked={formData.Pricing === "By fixed"} style={{ marginBottom: "20px" }}
                    onChange={(e) => handleChange("Pricing", e.target.value)}
                  />
                  <label style={{ width: "80px", marginTop: "5px", color: "#A26D2B" }} className="form-check-label ms-1">By Fixed</label>
                </div>
              </Col>
              <Col xs={12} md={3} className="d-flex align-items-center">
                <div style={{ flex: 1 }}>
                  <InputField
                    label="Category"
                    name="category"
                    type="select"
                    value={formData.category}
                    onChange={(e) => {
                      handleChange("category", e.target.value);
                    }}
                    options={categories.map((category) => ({
                      value: category.value,
                      label: category.label,
                    }))}
                  />
                </div>
                <AiOutlinePlus
                  size={20}
                  color="black"
                  onClick={handleAddCategory}
                  style={{
                    marginLeft: "10px",
                    cursor: "pointer",
                    marginBottom: "20px",
                  }}
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField
                  label="Rbarcode"
                  name="rbarcode"
                  value={formData.rbarcode}
                  onChange={(e) => handleChange("rbarcode", e.target.value)}
                  readOnly
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="HSN Code"
                  name="hsn_code"
                  value={formData.hsn_code}
                  onChange={handleChange}
                  readOnly
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField label="PCs" type="text" value={formData.pcs}
                  onChange={(e) => handleChange("pcs", e.target.value)} />
              </Col>
              {formData.Pricing !== "By fixed" && (
                <>
                  <Col xs={12} md={1}>
                    <InputField label="Gross Wt" type="number" value={formData.gross_weight}
                      onChange={(e) => handleChange("gross_weight", e.target.value)} />
                  </Col>
                  {/* <Col xs={12} md={2} className="d-flex align-items-center">
                    <Button
                      variant={socketConnected ? "success" : "outline-secondary"}
                      size="sm"
                      onClick={() => {
                        if (!socketConnected) {
                          alert('Please open the Weight Simulator app first');
                        }
                      }}
                      style={{
                        height: "32px",
                        marginRight: "5px",
                        marginBottom: "20px",
                        backgroundColor: socketConnected ? '#28a745' : '#f0f0f0',
                        borderColor: socketConnected ? '#28a745' : '#a36e29',
                        color: socketConnected ? 'white' : '#a36e29',
                        fontSize: '12px',
                        padding: '2px 8px',
                        cursor: 'default'
                      }}
                      title={socketConnected ? "Connected to Simulator" : "Run Weight Simulator app"}
                    >
                      {socketConnected ? "🔌 Online" : "⚖️ Offline"}
                    </Button>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <InputField
                        label="Gross Wt"
                        type="number"
                        value={formData.gross_weight}
                        onChange={(e) => handleChange("gross_weight", e.target.value)}
                      />
                      {socketConnected && (
                        <small style={{
                          position: 'absolute',
                          bottom: '-18px',
                          left: '0',
                          color: '#28a745',
                          fontSize: '10px'
                        }}>
                          Auto-update from simulator
                        </small>
                      )}
                    </div>
                  </Col> */}
                  <Col xs={12} md={1}>
                    <InputField label="Stone Wt" type="number" value={formData.stone_weight}
                      onChange={(e) => handleChange("stone_weight", e.target.value)} />
                  </Col>
                  <Col xs={12} md={1}>
                    <InputField
                      label="Carat Wt"
                      name="carat_wt"
                      value={formData.carat_wt}
                      onChange={(e) => handleChange("carat_wt", e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md="1">
                    <Button variant="primary"
                      onClick={handleShow}
                      style={{
                        backgroundColor: '#a36e29',
                        borderColor: '#a36e29',
                        fontSize: '0.9rem',
                        marginLeft: "-8px",
                        marginTop: "1px",
                        padding: "5px 10px",
                        height: "32px",
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Stone Details
                    </Button>
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField
                      label="Deduct St Wt"
                      name="deduct_st_Wt"
                      type="select"
                      value={formData.deduct_st_Wt || ""}
                      onChange={(e) => handleChange("deduct_st_Wt", e.target.value)}
                      options={[
                        { value: "Yes", label: "Yes" },
                        { value: "No", label: "No" },
                      ]}
                    />
                  </Col>
                  {/* <Col xs={12} md={2}>
                    <InputField label="Stone Price" type="number" value={formData.stone_price}
                      onChange={(e) => handleChange("stone_price", e.target.value)} />
                  </Col> */}

                  <Col xs={12} md={1}>
                    <InputField
                      label="Net Wt"
                      type="number"
                      value={formData.net_weight}
                      onChange={(e) => handleChange("net_weight", e.target.value)}
                      readOnly
                    />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField
                      label="Purity"
                      type="select"
                      name="purity"
                      value={formData.purity}
                      onChange={(e) => handleChange("purity", e.target.value)}
                      options={[
                        ...purityOptions.map((option) => ({
                          value: `${option.name} | ${option.purity_percentage}`, // Combined name and purity
                          label: `${option.name} | ${option.purity_percentage}`,
                        })),
                        { value: "Manual", label: "Manual" }, // Added inside the array
                      ]}
                    />
                  </Col>
                  {formData.purity === "Manual" && (
                    <Col xs={12} md={2}>
                      <InputField
                        label="Custom Purity %"
                        type="number"
                        name="purityPercentage"
                        value={formData.purityPercentage || ""}

                        onChange={(e) => handleChange("purityPercentage", e.target.value)}
                      />
                    </Col>
                  )}
                  <Col xs={12} md={2}>
                    <InputField
                      label="Pure Wt"
                      type="number"
                      value={formData.pure_weight}
                      onChange={(e) => handleChange("pure_weight", e.target.value)}
                      readOnly
                    />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField
                      label="Wastage On"
                      name="wastage_on"
                      type="select"
                      value={formData.wastage_on}
                      onChange={(e) => handleChange("wastage_on", e.target.value)} // ✅ Ensure correct update
                      options={[
                        { value: "Gross Wt", label: "Gross Wt" },
                        { value: "Net Wt", label: "Net Wt" },
                        { value: "Pure Wt", label: "Pure Wt" },
                      ]}
                    />
                  </Col>
                  <Col xs={12} md={1}>
                    <InputField label="Wastage%" type="number" value={formData.wastage}
                      onChange={(e) => handleChange("wastage", e.target.value)} />
                  </Col>
                  <Col xs={12} md={1}>
                    <InputField label="W.Wt" type="number" value={formData.wastage_wt}
                      onChange={(e) => handleChange("wastage_wt", e.target.value)} readOnly />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField
                      label="MC On"
                      name="Making_Charges_On"
                      type="select"
                      value={formData.Making_Charges_On}
                      onChange={(e) => handleChange("Making_Charges_On", e.target.value)}
                      options={[
                        { value: "MC / Gram", label: "MC / Gram" },
                        { value: "MC / Piece", label: "MC / Piece" },
                        { value: "MC %", label: "MC %" },
                      ]}
                    />
                  </Col>
                  {mcOnType && (
                    <Col xs={12} md={1}>
                      <InputField
                        label={mcOnType} // Change label dynamically
                        name="Making_Charges_Value"
                        type="number"
                        value={formData.Making_Charges_Value}
                        onChange={(e) => handleChange("Making_Charges_Value", e.target.value)}
                      />
                    </Col>
                  )}
                  <Col xs={12} md={2}>
                    <InputField
                      label="Total MC"
                      name="total_mc"
                      type="number"
                      value={formData.total_mc || ""}
                      onChange={(e) => handleChange("total_mc", e.target.value)}
                      disabled={formData.Making_Charges_On === "MC / Gram"} // Disable only for "MC / Gram"
                    />
                  </Col>
                  <Col xs={12} md={1}>
                    <InputField label="Total Wt" type="number" value={formData.total_pure_wt}
                      onChange={(e) => handleChange("total_pure_wt", e.target.value)} readOnly />
                  </Col>
                  <Col xs={12} md={1}>
                    <InputField
                      label="Paid Wt"
                      type="number"
                      value={formData.paid_pure_weight}
                      onChange={(e) => handleChange("paid_pure_weight", e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={1}>
                    <InputField
                      label="Bal Wt"
                      type="number"
                      value={formData.balance_pure_weight}
                      onChange={(e) => handleChange("balance_pure_weight", e.target.value)}
                    />
                  </Col>
                </>
              )}
              <Col xs={12} md={2}>
                <InputField
                  label={formData.Pricing === "By fixed" ? "Piece Rate" : "Rate"}
                  type="number"
                  value={formData.rate}
                  onChange={(e) => handleChange("rate", e.target.value)}
                />
              </Col>

              <Col xs={12} md={2}>
                <InputField
                  label="Metal Amount"
                  type="number"
                  value={formData.total_amount}
                  onChange={(e) => handleChange("total_amount", e.target.value)}
                  readOnly={formData.Pricing !== "By fixed"}
                />
              </Col>

              {formData.Pricing !== "By fixed" && (
                <>
                  <Col xs={12} md={2}>
                    <InputField
                      label="Stone Value"
                      name="final_stone_amount"
                      value={formData.final_stone_amount}
                      onChange={(e) => handleChange("final_stone_amount", e.target.value)}
                      readOnly
                    />
                  </Col>
                </>
              )}
              <Col xs={12} md={2}>
                <InputField
                  label="GST"
                  name="tax_slab"
                  type="select"
                  value={formData.tax_slab}
                  onChange={(e) => handleChange("tax_slab", e.target.value)}
                  options={taxOptions}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Tax Amt"
                  name="tax_amt"
                  value={formData.tax_amt}
                  onChange={(e) => handleChange("tax_amt", e.target.value)}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Total Amt"
                  name="net_amt"
                  value={formData.net_amt}
                  onChange={(e) => handleChange("net_amt", e.target.value)}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Discount Amt"
                  name="discount_amt"
                  value={formData.discount_amt}
                  onChange={(e) => handleChange("discount_amt", e.target.value)}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Net Amt"
                  name="final_amt"
                  value={formData.final_amt}
                  onChange={(e) => handleChange("final_amt", e.target.value)}
                />
              </Col>
              {formData.Pricing !== "By fixed" && (
                <>
                  <Col xs={12} md={2}>
                    <InputField
                      label="Rate Cut"
                      type="number"
                      value={formData.rate_cut}
                      onChange={(e) => handleChange("rate_cut", e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField
                      label="Rate Cutted Wt"
                      type="number"
                      value={formData.rate_cut_wt}
                      onChange={(e) => handleChange("rate_cut_wt", e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField
                      label="Rate Cut Amt"
                      type="number"
                      value={formData.rate_cut_amt}
                      onChange={(e) => handleChange("rate_cut_amt", e.target.value)}
                    />
                  </Col>
                </>
              )}
              <Col xs={12} md={2}>
                <InputField
                  label="Paid Amt"
                  type="number"
                  value={formData.paid_amount}
                  onChange={(e) => handleChange("paid_amount", e.target.value)}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Balance Amt"
                  type="number"
                  value={formData.balance_amount}
                  onChange={(e) => handleChange("balance_amount", e.target.value)}
                />
              </Col>
              {formData.Pricing !== "By fixed" && (
                <>
                  <Col xs={12} md={2}>
                    <InputField label="HM Charges" type="number" value={formData.hm_charges}
                      onChange={(e) => handleChange("hm_charges", e.target.value)} />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField label="Other Charges" type="number" value={formData.charges}
                      onChange={(e) => handleChange("charges", e.target.value)} />
                  </Col>
                </>
              )}
              <Col xs={12} md={2}>
                <InputField
                  label="Remarks"
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => handleChange("remarks", e.target.value)}
                />
              </Col>
              <Col xs={12} md={1}>
                <Button onClick={handleAdd} style={{
                  backgroundColor: '#a36e29', borderColor: '#a36e29', marginTop: "2px",
                  marginLeft: "-1px",
                  padding: "5px 13px",
                  height: "32px",
                  fontSize: "13px"
                }}>
                  {editingIndex !== null ? "Update" : "Add"}
                </Button>
              </Col>
            </Row>
            <Row>
            </Row>
            <div style={{ marginTop: '-20px' }}>
              <Table striped bordered hover className="mt-4">
                <thead style={{ fontSize: "13px" }}>
                  <tr>
                    <th>Category</th>
                    <th>Pcs</th>
                    <th>Gross</th>
                    <th>Stone</th>
                    <th>Net</th>
                    <th>Purity</th>
                    <th>Total Wt</th>
                    <th>Paid wt</th>
                    <th>Bal wt</th>
                    <th>RateCut Amt</th>
                    <th>Paid Amt</th>
                    <th>Bal Amt</th>
                    <th>Net Amt</th>
                    <th>Actions</th> {/* New Action column */}
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {tableData.map((data, index) => (
                    <tr key={index}>
                      <td>{data.category}</td>
                      <td>{data.pcs}</td>
                      <td>{data.gross_weight}</td>
                      <td>{data.stone_weight}</td>
                      <td>{data.net_weight}</td>
                      <td>{data.purityPercentage}</td>
                      <td>{data.total_pure_wt}</td>
                      <td>{data.paid_pure_weight}</td>
                      <td>{data.balance_pure_weight}</td>
                      <td>{data.rate_cut_amt}</td>
                      <td>{data.paid_amount}</td>
                      <td>{data.balance_amount}</td>
                      <td>{data.final_amt}</td>
                      <td style={{ display: 'flex', alignItems: 'center' }}>
                        {/* <button
                          type="button"
                          className="btn btn-primary"
                          style={{ backgroundColor: '#a36e29', borderColor: '#a36e29', padding: '0.25rem 0.5rem', fontSize: '0.875rem', }}
                          onClick={() => handleOpenModal(data)} // Pass entire row data
                        >
                          Tag Entry
                        </button> */}
                        <FaEdit
                          style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue' }}
                          onClick={() => {
                            handleEdit(index);
                            setTimeout(() => handleEdit(index), 1); // Triggers again after 100ms
                          }}
                          disabled={editingIndex !== null}
                        />
                        <FaTrash
                          style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
                          onClick={() => handleDelete(data.tag_id, data.product_id)}
                          disabled={editingIndex !== null}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>

              </Table>
            </div>
          </div>
          <div className="form-buttons">
            <Button
              onClick={handleClose1}
              style={{ backgroundColor: "gray", borderColor: "gray", marginLeft: "5px" }}
            // disabled={!isSubmitEnabled}
            >
              Close
            </Button>
            <Button
              variant="secondary"
              onClick={handleBack} style={{ backgroundColor: 'gray', marginRight: '10px' }}
            >
              cancel
            </Button>
            <Button type="submit" variant="success" style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }} onClick={handleSave}>Save</Button>
          </div>
        </Form>
      </div>

      {/* <StoneDetailsModal
        showModal={showStoneModal}
        handleCloseModal={handleCloseStoneModal}
        handleUpdateStoneDetails={handleUpdateStoneDetails}
      /> */}

      {/* Weight Simulator Modal */}
      <Modal
        show={showWeightSimulator}
        onHide={() => {
          setShowWeightSimulator(false);
          setSimulatorWeight("");
        }}
        size="sm"
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: '#a36e29', color: 'white' }}>
          <Modal.Title>Weight Simulator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Enter Weight (grams)</Form.Label>
            <Form.Control
              type="number"
              step="0.001"
              value={simulatorWeight}
              onChange={(e) => setSimulatorWeight(e.target.value)}
              placeholder="e.g., 25.500"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleWeightFromSimulator();
                }
              }}
            />
          </Form.Group>

          {/* Quick weight presets for testing */}
          <div className="mt-3">
            <small className="text-muted">Quick presets:</small>
            <div className="d-flex gap-2 mt-1">
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => setSimulatorWeight("10.500")}
              >
                10.5g
              </Button>
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => setSimulatorWeight("25.000")}
              >
                25g
              </Button>
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => setSimulatorWeight("50.750")}
              >
                50.75g
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowWeightSimulator(false);
              setSimulatorWeight("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleWeightFromSimulator}
            style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
          >
            Set Weight
          </Button>
        </Modal.Footer>
      </Modal>

      <StoneDetailsModal
        show={show}
        handleClose={handleClose}
        stoneDetails={stoneDetails}
        setStoneDetails={setStoneDetails}
        handleAddStone={handleAddStone}
        stoneList={stoneList}
        handleEditStone={handleEditStone}
        handleDeleteStone={handleDeleteStone}
        editingStoneIndex={editingStoneIndex}
      />

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        backdrop="static"
        keyboard={false}
        dialogClassName="custom-tagentrymodal-width"
      >
        <Modal.Header closeButton>
          <Modal.Title>Tag Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <TagEntry
              handleCloseTagModal={handleCloseModal}
              selectedProduct={selectedProduct}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default URDPurchase;
