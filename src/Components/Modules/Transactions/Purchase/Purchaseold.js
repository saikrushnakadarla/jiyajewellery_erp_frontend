import React, { useState, useEffect } from "react";
import "./Purchase.css";
import InputField from "../../../Pages/InputField/InputField";
import { Container, Row, Col, Button, Table, Form } from "react-bootstrap";
import { renderMatches, useNavigate, useLocation } from 'react-router-dom';
import baseURL from "../../../../Url/NodeBaseURL";
import axios from "axios";
import { AiOutlinePlus } from "react-icons/ai";
import TagEntry from "./TagEntry";
import { Modal } from "react-bootstrap";
import { FaEdit, FaTrash } from 'react-icons/fa';

const URDPurchase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const { state } = useLocation();
  const { mobile } = location.state || {};
  const initialSearchValue = location.state?.mobile || '';
  const [productIdAndRbarcode, setProductIdAndRbarcode] = useState({});
  // const [formData, setFormData] = useState(() => {
  //   const savedData = localStorage.getItem("purchaseFormData");
  //   return savedData
  //     ? JSON.parse(savedData)
  //     : 
  //     {
  //       mobile: "",
  //       account_name: "",
  //       gst_in: "",
  //       terms: "Cash",
  //       invoice: "",
  //       bill_no: "",
  //       rate_cut: "",
  //       date: new Date().toISOString().split("T")[0],
  //       bill_date: new Date().toISOString().split("T")[0],
  //       due_date: "",
  //       category: "",
  //       cut: "",
  //       color: "",
  //       clarity: "",
  //       hsn_code: "",
  //       rbarcode: "",
  //       pcs: "",
  //       gross_weight: "",
  //       stone_weight: "",
  //       net_weight: "",
  //       hm_charges: "",
  //       other_charges: "",
  //       charges: "",
  //       product_id: "",
  //       metal_type: "",
  //       pure_weight: "",
  //       paid_pure_weight: "",
  //       balance_pure_weight: "0",
  //       rate: "",
  //       total_amount: "",
  //       paid_amount: "",
  //       balance_amount: "",
  //       balance_after_receipt: "0",
  //     };
  // });

  const [formData, setFormData] = useState({
    customer_id: "",
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
    cut: "",
    color: "",
    clarity: "",
    hsn_code: "",
    rbarcode: "",
    pcs: "",
    gross_weight: "",
    stone_weight: "",
    wastage_on: "Pure Wt",
    wastage: "0",
    wastage_wt: "0.000",
    total_pure_wt: "",
    net_weight: "",
    hm_charges: "",
    other_charges: "",
    charges: "",
    product_id: "",
    metal_type: "",
    pure_weight: "",
    paid_pure_weight: "",
    balance_pure_weight: "0",
    rate: "",
    total_amount: "",
    paid_amount: "",
    balance_amount: "",
    balance_after_receipt: "0",
    balWt_after_payment:"0",
    Pricing: 'By Weight',
    purityPercentage: "",
    remarks:"",
  });

  // const [tableData, setTableData] = useState([]);
  const [rates, setRates] = useState({ rate_24crt: "", rate_22crt: "", rate_18crt: "", rate_16crt: "" });
  const [purityOptions, setPurityOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  const [tableData, setTableData] = useState(() => {
    const savedData = localStorage.getItem("tableData");
    return savedData ? JSON.parse(savedData) : []; // Load saved data or initialize as empty array
  });

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

  const handleChange = (field, value) => {
    setFormData((prevFormData) => {
      const updatedFormData = { ...prevFormData, [field]: value };

      const isFixedPricing = updatedFormData.Pricing === "By fixed";
      // Reset fields when "By fixed" is selected
      if (field === "Pricing" && value === "By fixed") {
        updatedFormData.gross_weight = "";
        updatedFormData.stone_weight = "";
        updatedFormData.net_weight = "";
        updatedFormData.purity = "";
        updatedFormData.pure_weight = "";
        updatedFormData.wastage_on = "";
        updatedFormData.wastage = "";
        updatedFormData.wastage_wt = "";
        updatedFormData.total_pure_wt = "";
        updatedFormData.paid_pure_weight = "";
        updatedFormData.balance_pure_weight = "";
        updatedFormData.hm_charges = "";
        updatedFormData.charges = "";
        updatedFormData.rate = "";
      }

      // When Pricing is "By Weight", fetch rate from the selected category
      if (!isFixedPricing && field === "category") {
        const selectedCategory = categories.find((cat) => cat.value === value);
        if (selectedCategory) {
          updatedFormData.rate = selectedCategory.rate || "";
        }
      }

      // For "By fixed", allow manual entry for the Piece Rate (stored in rate)
      if (isFixedPricing && field === "rate") {
        updatedFormData.rate = value;
      }

      // Update rate for gold based on purity or metal_type changes (only for "By Weight")
      if ((field === "purity" || field === "metal_type") && !isFixedPricing) {
        if (updatedFormData.metal_type?.toLowerCase() === "gold") {
          const normalizedValue = value.toLowerCase().replace(/\s+/g, "");

          if (normalizedValue === "manual") {
            updatedFormData.rate = rates.rate_22crt; // Set rate to 22K if purity is "Manual"
          } else if (normalizedValue.includes("22")) {
            updatedFormData.rate = rates.rate_22crt;
          } else if (normalizedValue.includes("24")) {
            updatedFormData.rate = rates.rate_24crt;
          } else if (normalizedValue.includes("18")) {
            updatedFormData.rate = rates.rate_18crt;
          } else if (normalizedValue.includes("16")) {
            updatedFormData.rate = rates.rate_16crt;
          } else {
            updatedFormData.rate = rates.rate_22crt;
          }
        }
      }

      // For silver, set rate automatically (again, only for "By Weight")
      if (field === "metal_type" && !isFixedPricing) {
        if (updatedFormData.metal_type?.toLowerCase() === "silver") {
          updatedFormData.rate = rates.silver_rate;
        }
      }

       // When paid_pure_weight is updated, update the rate accordingly
       if (field === "paid_pure_weight") {
        if (value) {
          updatedFormData.rate = "0"; // Reset rate when a value is entered
        } else {
          // Restore rate based on metal_type if paid_pure_weight is cleared
          if (updatedFormData.metal_type?.toLowerCase() === "gold") {
            updatedFormData.rate = rates.rate_22crt;
          } else if (updatedFormData.metal_type?.toLowerCase() === "silver") {
            updatedFormData.rate = rates.silver_rate;
          } else {
            updatedFormData.rate = "";
          }
        }
      }

      // Update net weight from gross and stone weight
      const grossWeight = parseFloat(updatedFormData.gross_weight) || 0;
      const stoneWeight = parseFloat(updatedFormData.stone_weight) || 0;
      updatedFormData.net_weight = (grossWeight - stoneWeight).toFixed(3);

      // Restrict paid_amount so it does not exceed total_amount
      if (field === "paid_amount") {
        const totalAmount = parseFloat(updatedFormData.total_amount) || 0;
        const paidAmount = parseFloat(value) || 0;
        if (paidAmount > totalAmount) {
          alert("Paid amount cannot exceed the total amount.");
          return prevFormData;
        }
      }

      // ***** Calculate Total Amount based on Pricing *****
      if (isFixedPricing) {
        // For "By fixed": Total Amt = pcs * Piece Rate (rate)
        const pcs = parseFloat(updatedFormData.pcs) || 0;
        const pieceRate = parseFloat(updatedFormData.rate) || 0;
        updatedFormData.total_amount = (pcs * pieceRate).toFixed(2);
      } else {
        // For "By Weight": Total Amt = Total Pure Weight * rate
        const pureWeight = parseFloat(updatedFormData.total_pure_wt) || 0;
        const rate = parseFloat(updatedFormData.rate) || 0;
        updatedFormData.total_amount = (pureWeight * rate).toFixed(2);
      }
      if (field === "paid_amount") {
        setLastUpdatedField("paid_amount");
        const rate = parseFloat(updatedFormData.rate) || 0;
        if (rate) {
          updatedFormData.paid_pure_weight = (value / rate).toFixed(3);
        } else {
          updatedFormData.paid_pure_weight = "0";
        }
      } 
      // else if (field === "paid_pure_weight") {
      //   setLastUpdatedField("paid_pure_weight");
      //   const rate = parseFloat(updatedFormData.rate) || 0;
      //   if (rate) {
      //     updatedFormData.paid_amount = (value * rate).toFixed(2);
      //   } else {
      //     updatedFormData.paid_amount = "0";
      //   }
      // }
  
      // Update balance calculations
      const totalAmount = parseFloat(updatedFormData.total_amount) || 0;
      const paidAmount = parseFloat(updatedFormData.paid_amount) || 0;
      const totalPureWeight = parseFloat(updatedFormData.total_pure_wt) || 0;
      const paidPureWeight = parseFloat(updatedFormData.paid_pure_weight) || 0;
  
      updatedFormData.balance_pure_weight = (totalPureWeight - paidPureWeight).toFixed(3);
      updatedFormData.balance_amount = (totalAmount - paidAmount).toFixed(2);
  
      return updatedFormData;
    });
  };

  useEffect(() => {
    localStorage.setItem("tableData", JSON.stringify(tableData));
  }, [tableData]);

  const handleAdd = async (e) => {
    e.preventDefault();

    // Prepare data to be sent to the API
    const apiData = {
      product_id: formData.product_id, // Assuming rbarcode maps to product_id
      pcs: formData.pcs || "0", // Allow pcs to be empty if not provided
      gross_weight: formData.gross_weight || "0", // Allow gross_weight to be empty if not provided
    };

    try {
      // Make a POST request to the API
      const response = await fetch(`${baseURL}/add-entry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Pcs and GrossWeight added to the database successfully:", result);

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
          ...formData, // Retain fields as necessary
          category: "",
          cut: "",
          color: "",
          clarity: "",
          hsn_code: "",
          rbarcode: "",
          pcs: "",
          gross_weight: "",
          stone_weight: "",
          wastage_on: "Pure Wt",
          wastage: "0",
          wastage_wt: "0.000",
          total_pure_wt: "",
          net_weight: "",
          hm_charges: "",
          other_charges: "",
          charges: "",
          purity: "",
          pure_weight: "",
          paid_pure_weight: "",
          balance_pure_weight: "",
          rate: "",
          total_amount: "",
          paid_amount: "",
          balance_amount: "",
          balance_after_receipt: "0",
          balWt_after_payment:"0",
          remarks:"",
        });
      } else {
        console.error("Failed to add entry to the database:", response.statusText);
      }
    } catch (error) {
      console.error("Error while adding entry to the database:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Check if the customer's mobile number is provided
    if (!formData.mobile || formData.mobile.trim() === "") {
      alert("Please select or enter customer's mobile number");
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
        invoice: "",
        bill_no: "",
        rate_cut: "",
        date: new Date().toISOString().split("T")[0],
        bill_date: new Date().toISOString().split("T")[0],
        due_date: "",
        category: "",
        hsn_code: "",
        rbarcode: "",
        pcs: "",
        gross_weight: "",
        stone_weight: "Pure Wt",
        wastage_on: "",
        wastage: "0",
        wastage_wt: "0.000",
        total_pure_wt: "",
        net_weight: "",
        hm_charges: "",
        other_charges: "",
        charges: "",
        purity: "",
        metal_type: "",
        pure_weight: "",
        rate: "",
        total_amount: "",
        product_id: "",
        remarks:"",
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
    localStorage.setItem("purchaseFormData", JSON.stringify(formData));
    localStorage.setItem("purchaseTableData", JSON.stringify(tableData));
  }, [formData, tableData]);

  const handleEdit = async (index) => {
    const selectedData = tableData[index]; // Get the data for the selected row
    const { product_id, pcs, gross_weight } = selectedData; // Extract product_id, pcs, and gross_weight
    const pcsToSend = pcs || 0;
    const grossWeightToSend = gross_weight || 0;
    try {
      // Send a request to the backend to update the product_id entry
      const response = await fetch(`${baseURL}/delete-updated-values/${product_id}`, {
        method: "PUT", // Change to PUT since we're updating, not deleting
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pcs: pcsToSend, gross_weight: grossWeightToSend }), // Pass pcs and gross_weight
      });

      if (!response.ok) {
        throw new Error("Failed to update entry in updated_values_table");
      }
      console.log("Entry updated successfully");
      setFormData(selectedData); // Populate the form with selected row data
      setEditingIndex(index); // Track the index being edited

    } catch (error) {
      console.error("Error updating entry:", error);
      alert("Failed to update the entry. Please try again.");
    }
  };

  const handleDelete = async (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmDelete) return; // Stop execution if user cancels

    const selectedData = tableData[index]; // Get the data for the selected row
    const { product_id, pcs, gross_weight } = selectedData; // Extract product_id, pcs, and gross_weight
    const pcsToSend = pcs || 0;
    const grossWeightToSend = gross_weight || 0;

    console.log("Sending to server for deletion:", { product_id, pcs: pcsToSend, gross_weight: grossWeightToSend });

    try {
      // Send a request to the backend to delete the product_id entry
      const response = await fetch(`${baseURL}/delete-updated-values/${product_id}`, {
        method: "PUT", // Assuming your API is updating records
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pcs: pcsToSend, gross_weight: grossWeightToSend }), // Pass pcs and gross_weight
      });

      if (!response.ok) {
        throw new Error("Failed to delete entry in updated_values_table");
      }

      console.log("Entry deleted successfully");

      // Remove the selected row from the table data
      const updatedTableData = tableData.filter((_, i) => i !== index);
      setTableData(updatedTableData);

      // Show success alert
      alert("Entry deleted successfully!");
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete the entry. Please try again.");
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

  useEffect(() => {
    const fetchLastInvoice = async () => {
      try {
        const response = await axios.get(`${baseURL}/lastInvoice`);
        setFormData((prev) => ({
          ...prev,
          invoice: response.data.lastInvoiceNumber,
        }));
      } catch (error) {
        console.error("Error fetching estimate number:", error);
      }
    };

    fetchLastInvoice();
  }, []);

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
              purity: '',
              rate: '',
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
        product_id: '',
        rbarcode: '',
        hsn_code: '',
        purity: '',
        rate: '',
      }));
    }
  }, [formData.category]);

useEffect(() => {
  const fetchPurity = async () => {
    if (!formData.category) {
      setFormData((prev) => ({
        ...prev,
        purity: "",
        rate: "",
      }));
      setPurityOptions([]);
      return;
    }

    if (!formData.metal_type) {
      setPurityOptions([]);
      return;
    }

    try {
      const response = await axios.get(`${baseURL}/purity`);
      const filteredPurity = response.data.filter(
        (item) => item.metal.toLowerCase() === formData.metal_type.toLowerCase()
      );

      setPurityOptions(filteredPurity);
      console.log("Purity Options:", filteredPurity);

      let defaultOption = null;

      if (formData.metal_type.toLowerCase() === "gold") {
        defaultOption = filteredPurity.find((option) =>
          option.name.toLowerCase().includes("22") // Check if "22" is included
        );

        if (defaultOption) {
          setFormData((prev) => ({
            ...prev,
            purity: `${defaultOption.name} | ${defaultOption.purity_percentage}`,
            rate: rates.rate_22crt,
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

        defaultOption = silver24 || silver22;

        if (defaultOption) {
          setFormData((prev) => ({
            ...prev,
            purity: `${defaultOption.name} | ${defaultOption.purity_percentage}`,
            rate: rates.silver_rate,
          }));
        }
      }
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
    const updatedFormData = { ...formData };
    const netWeight = parseFloat(updatedFormData.net_weight) || 0;
    const purityPercentage = extractPurityPercentage(updatedFormData.purity);
    updatedFormData.pure_weight = ((netWeight * purityPercentage) / 100).toFixed(2);

    const wastagePercentage = parseFloat(updatedFormData.wastage) || 0;
    let baseWeight = 0;
    if (updatedFormData.wastage_on === "Gross Wt") {
      baseWeight = parseFloat(updatedFormData.gross_weight) || 0;
    } else if (updatedFormData.wastage_on === "Net Wt") {
      baseWeight = parseFloat(updatedFormData.net_weight) || 0;
    } else if (updatedFormData.wastage_on === "Pure Wt") {
      baseWeight = parseFloat(updatedFormData.pure_weight) || 0;
    }
    updatedFormData.wastage_wt = ((wastagePercentage * baseWeight) / 100).toFixed(3);

    const wastageWeight = parseFloat(updatedFormData.wastage_wt) || 0;
    updatedFormData.total_pure_wt = (parseFloat(updatedFormData.pure_weight) + wastageWeight).toFixed(3);
  
    const rate = parseFloat(updatedFormData.rate) || 0;
    const totalAmount = parseFloat(updatedFormData.total_amount) || 0;
    let paidPureWeight = parseFloat(updatedFormData.paid_pure_weight) || 0;
    let paidAmount = parseFloat(updatedFormData.paid_amount) || 0;
    
    if (lastUpdatedField === "paid_amount" && rate) {
      paidPureWeight = (paidAmount / rate).toFixed(3);
    } else if (lastUpdatedField === "paid_pure_weight" && rate) {
      paidAmount = (paidPureWeight * rate).toFixed(2);
    }

    updatedFormData.paid_pure_weight = paidPureWeight;
    updatedFormData.paid_amount = paidAmount;

    updatedFormData.balance_pure_weight = (parseFloat(updatedFormData.total_pure_wt) - paidPureWeight).toFixed(3);
    updatedFormData.balance_amount = (totalAmount - paidAmount).toFixed(2);

    setFormData(updatedFormData);
  }, [
    formData.purity,
    formData.purityPercentage,
    formData.net_weight,
    formData.rate,
    formData.total_amount,
    formData.paid_amount 
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

  return (
    <div className="main-container">
      <div className="purchase-form-container">
        <Form onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
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
                        value={formData.customer_id || ""} // Use customer_id to match selected value
                        onChange={(e) => handleCustomerChange(e.target.value)}
                        options={[
                          ...customers.map((customer) => ({
                            value: customer.account_id, // Use account_id as the value
                            label: customer.mobile, // Display mobile as the label
                          })),
                        ]}
                        autoFocus
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
                      label="Suplier Name:"
                      name="account_name"
                      type="select"
                      value={formData.customer_id || ""} // Use customer_id to match selected value
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      options={[
                        ...customers.map((customer) => ({
                          value: customer.account_id, // Use account_id as the value
                          label: customer.account_name, // Display mobile as the label
                        })),
                      ]}

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
                  {/* <Col xs={12} md={3}>
                    <InputField label="Terms" type="select" value={formData.terms}
                      onChange={(e) => handleChange("terms", e.target.value)}
                      options={[
                        { value: "Cash", label: "Cash" },
                        { value: "Credit", label: "Credit" },
                      ]}
                    />
                  </Col> */}
                  <Col xs={12} md={4}>
                    <InputField
                      label="Invoice"
                      value={formData.invoice}
                      onChange={(e) => handleChange("invoice", e.target.value)} // Corrected key
                    />
                  </Col>
                  {/* <Col xs={12} md={3} >
                    <InputField label="Bill No" value={formData.bill_no}
                      onChange={(e) => handleChange("bill_no", e.target.value)} />
                  </Col> */}

                  {/* <Col xs={12} md={3} >
                    <InputField label="Rate-Cut" value={formData.rate_cut}
                      onChange={(e) => handleChange("rate_cut", e.target.value)} />
                  </Col> */}

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
              <Col xs={12} md={2}>
                <InputField
                  label="Pricing"
                  name="Pricing"
                  type="select"
                  value={formData.Pricing || ""} // Ensure it never becomes undefined
                  onChange={(e) => handleChange("Pricing", e.target.value)} // Correctly updates the field
                  options={[
                    { value: "By Weight", label: "By Weight" },
                    { value: "By fixed", label: "By fixed" },
                  ]}
                />
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
              <Col xs={12} md={2}>
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
              {/* Conditionally Hidden Fields */}
              {formData.Pricing !== "By fixed" && (
                <>
                  <Col xs={12} md={2}>
                    <InputField label="Gross" type="number" value={formData.gross_weight}
                      onChange={(e) => handleChange("gross_weight", e.target.value)} />
                  </Col>
                  <Col xs={12} md={1}>
                    <InputField label="Stone" type="number" value={formData.stone_weight}
                      onChange={(e) => handleChange("stone_weight", e.target.value)} />
                  </Col>

                  <Col xs={12} md={1}>
                    <InputField
                      label="Net"
                      type="number"
                      value={formData.net_weight}
                      onChange={(e) => handleChange("net_weight", e.target.value)}
                    />
                  </Col>
                  {formData.category === "Diamond" ? (
                    <>
                      <Col xs={12} md={2}>
                        <InputField
                          label="Cut"
                          name="cut"
                          type="text"
                          value={formData.cut || ""}
                          onChange={(e) => handleChange("cut", e.target.value)}
                        />
                      </Col>
                      <Col xs={12} md={2}>
                        <InputField
                          label="Color"
                          name="color"
                          type="text"
                          value={formData.color || ""}
                          onChange={(e) => handleChange("color", e.target.value)}
                        />
                      </Col>
                      <Col xs={12} md={2}>
                        <InputField
                          label="Clarity"
                          name="clarity"
                          type="text"
                          value={formData.clarity || ""}
                          onChange={(e) => handleChange("clarity", e.target.value)}
                        />
                      </Col>
                    </>
                  ) : (
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

                  )}
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

                  <Col xs={12} md={2}>
                    <InputField label="Wastage%" type="number" value={formData.wastage}
                      onChange={(e) => handleChange("wastage", e.target.value)} />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField label="Wastage Wt" type="number" value={formData.wastage_wt}
                      onChange={(e) => handleChange("wastage_wt", e.target.value)} />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField label="Total Pure Wt" type="number" value={formData.total_pure_wt}
                      onChange={(e) => handleChange("total_pure_wt", e.target.value)} />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField
                      label="Paid Wt"
                      type="number"
                      value={formData.paid_pure_weight}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        if (newValue > formData.total_pure_wt) {
                          alert("Paid Wt cannot be greater than Total Pure Wt!");
                        } else {
                          handleChange("paid_pure_weight", newValue);
                        }
                      }}
                    />
                  </Col>

                  <Col xs={12} md={2}>
                    <InputField
                      label="Balance Wt"
                      type="number"
                      value={formData.balance_pure_weight}
                      onChange={(e) => handleChange("balance_pure_weight", e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={2}>
                    <InputField label="HM Charges" type="number" value={formData.hm_charges}
                      onChange={(e) => handleChange("hm_charges", e.target.value)} />
                  </Col>
                </>
              )}
              <Col xs={12} md={2}>
                <InputField label="Charges" type="number" value={formData.charges}
                  onChange={(e) => handleChange("charges", e.target.value)} />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label={formData.Pricing === "By fixed" ? "Piece Rate" : "Rate-Cut"}
                  type="number"
                  value={formData.rate}
                  onChange={(e) => handleChange("rate", e.target.value)}
                />
              </Col>
              {/* <Col xs={12} md={2}>
                <InputField
                  label="Total Amt"
                  type="number"
                  value={formData.total_amount}
                  onChange={(e) => handleChange("total_amount", e.target.value)}
                  readOnly={formData.Pricing !== "By fixed"} 
                />
              </Col> */}
              <Col xs={12} md={2}>
                <InputField
                  label="Paid Amt"
                  type="number"
                  value={formData.paid_amount}
                  onChange={(e) => handleChange("paid_amount", e.target.value)}
                />
              </Col>
              {/* <Col xs={12} md={2}>
                <InputField
                  label="Balance Amt"
                  type="number"
                  value={formData.balance_amount}
                  onChange={(e) => handleChange("balance_amount", e.target.value)}
                />
              </Col> */}
              <Col xs={12} md={2}>
                <InputField
                  label="Remarks"
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => handleChange("remarks", e.target.value)}
                />
              </Col>
              <Col xs={12} md={1}>
                <Button onClick={handleAdd} style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>
                  {editingIndex !== null ? "Update" : "Add"}
                </Button>
              </Col>
            </Row>
            <Row>
            </Row>
            <div style={{ overflowX: "scroll", marginTop: '-27px' }}>
              <Table striped bordered hover className="mt-4">
                <thead>
                  <tr>
                    {/* <th>product_id</th> */}
                    {/* <th>Rbarcode</th> */}
                    <th>Category</th>
                    {/* <th>Cut</th>
                    <th>Color</th>
                    <th>Clarity</th> */}
                    <th>Pcs</th>
                    <th>Gross</th>
                    <th>Stone</th>
                    <th>Net</th>
                    {/* <th>HM Charges</th>
                    <th>Other Charges</th>
                    <th>Charges</th> */}
                    {/* <th>Metal</th> */}
                    <th>Purity</th>
                    <th>Total Wt</th>
                    <th>Paid wt</th>
                    <th>Bal wt</th>
                    <th>Rate</th>
                    <th>Total Amt</th>
                    <th>Paid Amt</th>
                    <th>Balance Amt</th>
                    <th>Actions</th> {/* New Action column */}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((data, index) => (
                    <tr key={index}>
                      {/* <td>{data.product_id}</td> */}
                      {/* <td>{data.rbarcode}</td> */}
                      <td>{data.category}</td>
                      {/* <td>{data.cut}</td>
                      <td>{data.color}</td>
                      <td>{data.clarity}</td> */}
                      <td>{data.pcs}</td>
                      <td>{data.gross_weight}</td>
                      <td>{data.stone_weight}</td>
                      <td>{data.net_weight}</td>
                      {/* <td>{data.hm_charges}</td>
                      <td>{data.other_charges}</td>
                      <td>{data.charges}</td> */}
                      {/* <td>{data.metal_type}</td> */}
                      <td>{data.purity}</td>
                      <td>{data.pure_weight}</td>
                      <td>{data.paid_pure_weight}</td>
                      <td>{data.balance_pure_weight}</td>
                      <td>{data.rate}</td>
                      <td>{data.total_amount}</td>
                      <td>{data.paid_amount}</td>
                      <td>{data.balance_amount}</td>
                      <td style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ backgroundColor: '#a36e29', borderColor: '#a36e29', width: '102px', fontSize: '0.875rem', }}
                          onClick={() => handleOpenModal(data)} // Pass entire row data
                        >
                          Tag Entry
                        </button>
                        <FaEdit
                          style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue' }}
                          onClick={() => handleEdit(index)}
                          disabled={editingIndex !== null}
                        />
                        <FaTrash
                          style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
                          onClick={() => handleDelete(index)}
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
              variant="secondary"
              onClick={handleBack} style={{ backgroundColor: 'gray', marginRight: '10px' }}
            >
              cancel
            </Button>
            <Button type="submit" variant="success" style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }} onClick={handleSave}>Save</Button>
          </div>
        </Form>
      </div>

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
