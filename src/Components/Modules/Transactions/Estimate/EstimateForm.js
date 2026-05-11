import React, { useState, useEffect } from "react";
import "./Estimate.css";
import InputField from "../../Transactions/SalesForm/InputfieldSales";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import axios from "axios";
import baseURL from "../../../../Url/NodeBaseURL";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import PDFContent from "./EstimateReceipt";
import { useLocation } from "react-router-dom";

const RepairForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date().toISOString().split("T")[0];
  const initialFormData = {
    date: today,
    pcode: "",
    estimate_number: "",
    code: "",
    product_id: "",
    product_name: "",
    metal_type: "",
    design_name: "",
    purity: "",
    category: "",
    sub_category: "",
    gross_weight: "",
    stone_weight: "",
    stone_price: "",
    weight_bw: "",
    va_on: "Gross Weight",
    va_percent: "",
    wastage_weight: "",
    total_weight_av: "",
    mc_on: "MC %",
    mc_per_gram: "",
    making_charges: "",
    disscount_percentage: "",
    disscount: "",
    rate: "",
    rate_amt: "",
    tax_percent: "03% GST",
    tax_amt: "",
    hm_charges: "60.00",
    total_price: "",
    total_amount: "0.00",
    pricing: "By Weight",
    opentag_id: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [entries, setEntries] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [products, setProducts] = useState([]);
  const [data, setData] = useState([]);
  const [isQtyEditable, setIsQtyEditable] = useState(false);
  const [rates, setRates] = useState({
    rate_24crt: "",
    rate_22crt: "",
    rate_18crt: "",
    rate_16crt: ""
  });
  const [metalTypes, setMetalTypes] = useState([]);
  const [uniqueProducts, setUniqueProducts] = useState([]);
  const [purity, setPurity] = useState([]);
  const [filteredMetalTypes, setFilteredMetalTypes] = useState([]);

  const [filteredDesignOptions, setFilteredDesignOptions] = useState([]);
  const [filteredPurityOptions, setFilteredPurityOptions] = useState([]);
  const [isBarcodeSelected, setIsBarcodeSelected] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [metaltypeOptions, setMetaltypeOptions] = useState([]);
  const [purityOptions, setpurityOptions] = useState([]);
  const [designOptions, setDesignOptions] = useState([]);

  useEffect(() => {
    let currentRate = "";

    if (formData.metal_type?.toLowerCase() === "gold" && formData.purity) {
      // Check if the purity value includes specific numbers
      if (formData.purity.includes("24")) {
        currentRate = rates.rate_24crt;
      } else if (formData.purity.includes("22")) {
        currentRate = rates.rate_22crt;
      } else if (formData.purity.includes("18")) {
        currentRate = rates.rate_18crt;
      } else if (formData.purity.includes("16")) {
        currentRate = rates.rate_16crt;
      }
    } else if (formData.metal_type?.toLowerCase() === "silver" && formData.purity) {
      currentRate = rates.silver_rate;
    }

    setFormData((prevData) => ({
      ...prevData,
      rate: currentRate,
    }));
  }, [formData.purity, formData.metal_type, rates]);


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

  const handleClose = () => {
    // navigate(`/sales?tabId=${tabId}`);
    navigate(-1);
  };



  useEffect(() => {
    const fetchCurrentRates = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/current-rates`);
        // console.log('API Response:', response.data);

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

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${baseURL}/get/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const result = await response.json();
      setProducts(result);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`${baseURL}/get/opening-tags-entry`);
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }
      const result = await response.json();
      setData(result.result); // Set the full data

    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTags();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      let updatedData = {
        ...prevData,
        [name]: value,
      };

      if (name === "category" && value === "") {
        updatedData = {
          ...updatedData, // Keep other existing values
          code: "",
          product_id: "",
          product_name: "",
          metal_type: "",
          design_name: "",
          purity: "",
          category: "",
          sub_category: "",
          gross_weight: "",
          stone_weight: "",
          stone_price: "",
          weight_bw: "",
          va_on: "Gross Weight",
          va_percent: "",
          wastage_weight: "",
          total_weight_av: "",
          mc_on: "MC %",
          mc_per_gram: "",
          making_charges: "",
          rate: "",
          rate_amt: "",
          tax_percent: "03% GST",
          tax_amt: "",
          total_price: "",
          total_amount: "0.00",
          opentag_id: "",
          qty: 1,
        };
      }

      if (name === "disscount_percentage") {
        const discountPercentage = parseFloat(value) || 0;
        const makingCharges = parseFloat(formData.making_charges) || 0;
        const discountAmount = (discountPercentage / 100) * makingCharges;

        updatedData.disscount = discountAmount.toFixed(2);
      }

      // Reset `mc_per_gram` and `making_charges` when `mc_on` changes
      if (name === "mc_on") {
        updatedData.mc_per_gram = "";
        updatedData.making_charges = "";
      }

      // Trigger recalculation for Total MC when relevant fields are updated
      if (
        updatedData.metal_type?.toLowerCase() === "gold" &&
        (name === "mc_per_gram" || name === "rate_amt")
      ) {
        const updatedMcPercentage = parseFloat(
          name === "mc_per_gram" ? value : updatedData.mc_per_gram
        ) || 0;
        const updatedRateAmount = parseFloat(
          name === "rate_amt" ? value : updatedData.rate_amt
        ) || 0;

        const calculatedTotalMC = (updatedMcPercentage / 100) * updatedRateAmount;
        updatedData.making_charges = calculatedTotalMC.toFixed(2);
      }
      return updatedData;
    });
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`${baseURL}/get/products`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const result = await response.json();
        if (result && Array.isArray(result)) {
          const formattedOptions = result.map((item) => ({
            label: item.product_name, // Display name
            value: item.product_name, // Unique value
          }));
          setCategoryOptions(formattedOptions);
        } else {
          console.error("Invalid API response format", result);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchCategory();
  }, []);

  useEffect(() => {
    const fetchSubCategory = async () => {
      try {
        const response = await fetch(`${baseURL}/subcategory`); // Use the correct API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        if (result && result.data) {
          // If formData.metal_type is available, filter based on it, otherwise show all
          const filteredData = formData.category
            ? result.data.filter((item) => item.category === formData.category)
            : result.data;

          // Format the filtered options
          const formattedOptions = filteredData.map((item) => ({
            label: item.sub_category_name, // Display value
            value: item.sub_category_name, // Unique ID for value
          }));

          setSubcategoryOptions(formattedOptions);
        } else {
          console.error("Invalid API response format", result);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Run the function initially and when formData.metal_type changes
    fetchSubCategory();
  }, [formData.category]);

  const [allMetalTypes, setAllMetalTypes] = useState([]);

  useEffect(() => {
    const fetchMetalType = async () => {
      try {
        const response = await fetch(`${baseURL}/metaltype`);
        const data = await response.json();

        // Extract all metal types
        const allMetalTypes = Array.from(new Set(data.map((product) => product.metal_name)));

        // Store all metal types
        setAllMetalTypes(allMetalTypes);

        // Initially, show all metal types
        setMetaltypeOptions(allMetalTypes.map((category) => ({
          value: category,
          label: category,
        })));
      } catch (error) {
        console.error('Error fetching metal types:', error);
      }
    };

    fetchMetalType();
  }, []);

  useEffect(() => {
    if (!formData.category) {
      // Show all metal types if no category is selected
      setMetaltypeOptions(allMetalTypes.map((category) => ({
        value: category,
        label: category,
      })));
      return;
    }

    const fetchFilteredMetalTypes = async () => {
      try {
        const response = await fetch(`${baseURL}/get/products`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const result = await response.json();

        // Find selected category object
        const selectedProduct = result.find((item) => item.product_name === formData.category);

        if (selectedProduct) {
          const filteredMetals = allMetalTypes.filter(
            (metal) => metal === selectedProduct.Category
          );

          const options = filteredMetals.map((category) => ({
            value: category,
            label: category,
          }));

          setMetaltypeOptions(options);

          // Auto-select the first option only when a category is selected
          if (formData.category && options.length > 0) {
            setFormData((prev) => ({ ...prev, metal_type: options[0].value }));
          }
        }
      } catch (error) {
        console.error("Error fetching filtered metal types:", error);
      }
    };

    fetchFilteredMetalTypes();
  }, [formData.category, allMetalTypes]);

  useEffect(() => {
    const fetchDesignName = async () => {
      try {
        const response = await fetch(`${baseURL}/designmaster`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const result = await response.json();
        if (result && Array.isArray(result)) {
          const formattedOptions = result.map((item) => ({
            label: item.design_name, // Display name
            value: item.design_name, // Unique value
          }));
          setDesignOptions(formattedOptions);
        } else {
          console.error("Invalid API response format", result);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchDesignName();
  }, []);

  useEffect(() => {
    const fetchPurity = async () => {
      try {
        const response = await fetch(`${baseURL}/purity`);
        const data = await response.json();

        let filteredData = data;

        // If metal_type is set, filter based on it; otherwise, show all
        if (formData.metal_type) {
          filteredData = data.filter((product) =>
            product.metal?.toLowerCase() === formData.metal_type.toLowerCase()
          );
        }

        const purities = Array.from(
          new Set(filteredData.map((product) => `${product.name} | ${product.purity}`))
        );

        const purityOptions = purities.map((purity) => ({
          value: purity,
          label: purity,
        }));

        setpurityOptions(purityOptions);

        // Set default purity only if metal_type is available
        if (formData.metal_type && purityOptions.length > 0) {
          const defaultPurity = purityOptions.find((option) =>
            /22/i.test(option.value)
          )?.value;

          setFormData((prevData) => ({
            ...prevData,
            purity: defaultPurity || "",
          }));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchPurity();
  }, [formData.metal_type]);

  const handleBarcodeChange = async (code) => {
    try {
      if (!code) {
        // If barcode is cleared, reset all related fields and set code to ""
        setIsBarcodeSelected(false);  // Reset the barcode selection flag
        setFormData((prevData) => ({
          ...prevData,
          code: "",  // Reset code when barcode is cleared
          product_id: "",
          product_name: "",
          metal_type: "",
          design_name: "",
          purity: "",
          category: "",
          sub_category: "",
          gross_weight: "",
          stone_weight: "",
          stone_price: "",
          weight_bw: "",
          va_on: "Gross Weight",
          va_percent: "",
          wastage_weight: "",
          total_weight_aw: "",
          mc_on: "MC %",
          mc_per_gram: "",
          making_charges: "",
          rate: "",
          rate_amt: "",
          tax_percent: "03% GST",
          tax_amt: "",
          hm_charges: "60.00",
          total_price: "",
          qty: "", // Reset qty
          pricing: "By Weight"
        }));
        setIsQtyEditable(true); // Default to editable if barcode is cleared
        return; // Exit early
      }

      // Check for product by code
      const product = products.find((prod) => String(prod.rbarcode) === String(code));
      if (product) {
        setIsBarcodeSelected(true);

        // Find the default purity value that includes "22"
        const defaultPurity = purityOptions.find((option) =>
          /22/i.test(option.value)
        )?.value;  // Set the barcode as selected
        setFormData((prevData) => ({
          ...prevData,
          code: product.rbarcode,  // Retain the selected barcode
          product_id: product.product_id,
          product_name: "", // Make editable
          metal_type: product.Category,
          design_name: "", // Make editable
          purity: defaultPurity || "",
          category: product.product_name,
          sub_category: "",
          gross_weight: "",
          stone_weight: "",
          stone_price: "",
          weight_bw: "",
          va_on: "Gross Weight",
          va_percent: "",
          wastage_weight: "",
          total_weight_aw: "",
          mc_on: "MC %",
          mc_per_gram: "",
          making_charges: "",
          tax_percent: product.tax_slab,
          qty: 1, // Set qty to 1 for product
          pricing: "By Weight"
        }));
        setIsQtyEditable(true); // Set qty as read-only
      } else {
        // Check if tag exists by code
        const tag = data.find((tag) => String(tag.PCode_BarCode) === String(code));
        if (tag) {
          const productId = tag.product_id;
          const productDetails = products.find((prod) => String(prod.product_id) === String(productId));

          setFormData((prevData) => ({
            ...prevData,
            code: tag.PCode_BarCode || "", // Retain the barcode
            product_id: tag.product_id || "",
            opentag_id: tag.opentag_id || "",
            product_name: tag.sub_category || "", // Make editable
            metal_type: tag.metal_type || "",
            design_name: tag.design_master || "", // Make editable
            purity: tag.Purity || "",
            category: tag.category || "",
            sub_category: tag.sub_category || "",
            gross_weight: tag.Gross_Weight || "",
            stone_weight: tag.Stones_Weight || "",
            stone_price: tag.Stones_Price || "",
            weight_bw: tag.Weight_BW || "",
            va_on: tag.Wastage_On || "",
            va_percent: tag.Wastage_Percentage || "",
            wastage_weight: tag.WastageWeight || "",
            total_weight_aw: tag.TotalWeight_AW || "",
            mc_on: tag.Making_Charges_On || "",
            mc_per_gram: tag.MC_Per_Gram || "",
            making_charges: tag.Making_Charges || "",
            tax_percent: productDetails?.tax_slab || "",
            qty: 1, // Allow qty to be editable for tag
            pricing: tag.Pricing || ""
          }));
          setIsQtyEditable(false); // Allow editing of qty
        } else {
          // Reset form if no tag is found
          setFormData((prevData) => ({
            ...prevData,
            code: "", // Reset code
            product_id: "",
            product_name: "",
            metal_type: "",
            design_name: "",
            purity: "",
            category: "",
            sub_category: "",
            gross_weight: "",
            stone_weight: "",
            stone_price: "",
            weight_bw: "",
            va_on: "Gross Weight",
            va_percent: "",
            wastage_weight: "",
            total_weight_aw: "",
            mc_on: "MC %",
            mc_per_gram: "",
            making_charges: "",
            rate: "",
            rate_amt: "",
            tax_percent: "03% GST",
            tax_amt: "",
            hm_charges: "60.00",
            total_price: "",
            qty: "", // Reset qty
            pricing: "By Weight"
          }));
          setIsQtyEditable(true); // Default to editable
        }
      }
    } catch (error) {
      console.error("Error handling code change:", error);
    }
  };

  const handleAdd = () => {
    let updatedEntries;
    if (isEditing) {
      updatedEntries = entries.map((entry, index) =>
        index === editIndex ? formData : entry
      );
      setIsEditing(false);
      setEditIndex(null);
    } else {
      updatedEntries = [...entries, formData];
    }
    setEntries(updatedEntries);
    localStorage.setItem("estimateDetails", JSON.stringify(updatedEntries));
    setFormData((prev) => ({
      ...initialFormData,
      date: today,
      estimate_number: prev.estimate_number,
    }));
  };

  useEffect(() => {
    const storedEntries = JSON.parse(localStorage.getItem("estimateDetails")) || [];
    setEntries(storedEntries);
  }, []);


  const handleEdit = (index) => {
    setFormData(entries[index]);
    setIsEditing(true);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const updatedEntries = entries.filter((_, i) => i !== index);
      setEntries(updatedEntries);
      localStorage.setItem("estimateDetails", JSON.stringify(updatedEntries));
      alert("Entry deleted successfully!");
    }
  };

  const [discount, setDiscount] = useState(() => {
    return parseFloat(localStorage.getItem("estimateDiscount")) || 0; // Load discount from localStorage
  });

  useEffect(() => {
    localStorage.setItem("estimateDiscount", discount); // Save to localStorage when discount changes
  }, [discount]);

  const handleDiscountChange = (e) => {
    const discountValue = parseFloat(e.target.value) || 0; // Default to 0 if empty or NaN

    if (discountValue > 15) {
      alert("Discount cannot be greater than 15%");
      return; // Prevent further execution
    }

    setDiscount(discountValue);

    const storedEstimateDetails = JSON.parse(localStorage.getItem("estimateDetails")) || [];

    const updatedEstimateDetails = storedEstimateDetails.map((item) => {
      const makingCharges = parseFloat(item.making_charges) || 0;
      const calculatedDiscount = (makingCharges * discountValue) / 100;

      // Preserve original_total_price when applying discount for the first time
      const originalTotalPrice = item.original_total_price
        ? parseFloat(item.original_total_price) // Ensure we're using the correct stored original value
        : parseFloat(item.total_price) || 0;

      // If discount is cleared (0%), reset total_price to original_total_price
      const updatedTotalPrice = discountValue === 0 ? originalTotalPrice : originalTotalPrice - calculatedDiscount;

      return {
        ...item,
        original_total_price: originalTotalPrice.toFixed(2), // Ensure original value is stored
        disscount: calculatedDiscount.toFixed(2),
        disscount_percentage: discountValue,
        total_price: updatedTotalPrice.toFixed(2),
      };
    });

    setEntries(updatedEstimateDetails);
    localStorage.setItem("estimateDetails", JSON.stringify(updatedEstimateDetails));
  };



  const handlePrint = async () => {
    try {
      // Calculate total values
      const totalAmount = entries.reduce((sum, item) => {
        const stonePrice = parseFloat(item.stone_price) || 0;
        const makingCharges = parseFloat(item.making_charges) || 0;
        const rateAmt = parseFloat(item.rate_amt) || 0;
        const hmCharges = parseFloat(item.hm_charges) || 0;
        return sum + stonePrice + makingCharges + rateAmt + hmCharges;
      }, 0);

      const discountAmt = entries.reduce((sum, item) => sum + (parseFloat(item.disscount) || 0), 0);
      const taxableAmount = totalAmount - discountAmt;
      const taxAmount = entries.reduce((sum, item) => sum + (parseFloat(item.tax_amt) || 0), 0);
      const netAmount = taxableAmount + taxAmount;

      // Save to database
      await Promise.all(
        entries.map((entry) => {
          const requestData = {
            ...entry,
            total_amount: totalAmount.toFixed(2),
            taxable_amount: taxableAmount.toFixed(2),
            tax_amount: taxAmount.toFixed(2),
            net_amount: netAmount.toFixed(2),
          };
          return axios.post(`${baseURL}/add/estimate`, requestData);
        })
      );

      // Generate PDF
      const pdfDoc = pdf(
        <PDFContent
          entries={entries}
          totalAmount={totalAmount.toFixed(2)}
          taxableAmount={taxableAmount.toFixed(2)}
          taxAmount={taxAmount.toFixed(2)}
          netAmount={netAmount.toFixed(2)}
          date={today}
          estimateNumber="02" // Replace with dynamic estimate number
          sellerName="Sadashri Jewels"
        />
      );

      const blob = await pdfDoc.toBlob();
      saveAs(blob, `estimate_${formData.estimate_number}.pdf`);

      alert("Estimates saved successfully!");

      // Clear localStorage and reset state
      localStorage.removeItem("estimateDetails"); // <-- Remove from localStorage
      localStorage.removeItem("estimateDiscount"); // <-- Remove from localStorage
      setEntries([]);
      setFormData(initialFormData);

      navigate("/estimatetable");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save or generate PDF. Please try again.");
    }
  };



  useEffect(() => {
    const fetchLastEstimateNumber = async () => {
      try {
        const response = await axios.get(`${baseURL}/lastEstimateNumber`);
        setFormData((prev) => ({
          ...prev,
          estimate_number: response.data.lastEstimateNumber,
        }));
      } catch (error) {
        console.error("Error fetching estimate number:", error);
      }
    };

    fetchLastEstimateNumber();
  }, []);

  useEffect(() => {
    const grossWeight = parseFloat(formData.gross_weight) || 0;
    const stonesWeight = parseFloat(formData.stone_weight) || 0;
    const weightBW = grossWeight - stonesWeight;

    setFormData((prev) => ({
      ...prev,
      weight_bw: weightBW.toFixed(3),
    }));
  }, [formData.gross_weight, formData.stone_weight]);

  useEffect(() => {
    const wastagePercentage = parseFloat(formData.va_percent) || 0;
    const grossWeight = parseFloat(formData.gross_weight) || 0;
    const weightBW = parseFloat(formData.weight_bw) || 0;

    let wastageWeight = 0;
    let totalWeight = 0;

    if (formData.va_on === "Gross Weight") {
      wastageWeight = (grossWeight * wastagePercentage) / 100;
      totalWeight = weightBW + wastageWeight;
    } else if (formData.va_on === "Weight BW") {
      wastageWeight = (weightBW * wastagePercentage) / 100;
      totalWeight = weightBW + wastageWeight;
    }

    setFormData((prev) => ({
      ...prev,
      wastage_weight: wastageWeight.toFixed(3),
      total_weight_av: totalWeight.toFixed(3),
    }));
  }, [formData.va_on, formData.va_percent, formData.gross_weight, formData.weight_bw]);

  useEffect(() => {
    const totalWeight = parseFloat(formData.total_weight_av) || 0;
    const mcPerGram = parseFloat(formData.mc_per_gram) || 0;
    const makingCharges = parseFloat(formData.making_charges) || 0;
    const rateAmount = parseFloat(formData.rate_amt) || 0;

    if (formData.mc_on === "MC / Gram") {
      // Calculate making_charges as mcPerGram * totalWeight
      const calculatedMakingCharges = mcPerGram * totalWeight;
      setFormData((prev) => ({
        ...prev,
        making_charges: calculatedMakingCharges.toFixed(2),
      }));
    } else if (formData.mc_on === "MC %") {
      // Calculate making_charges as (mcPerGram * rateAmount) / 100
      const calculatedMakingCharges = (mcPerGram * rateAmount) / 100;
      setFormData((prev) => ({
        ...prev,
        making_charges: calculatedMakingCharges.toFixed(2),
      }));
    } else if (formData.mc_on === "MC / Piece") {
      // If making_charges is manually entered, calculate mc_per_gram
      if (makingCharges && totalWeight > 0) {
        const calculatedMcPerGram = makingCharges / totalWeight;
        setFormData((prev) => ({
          ...prev,
          mc_per_gram: calculatedMcPerGram.toFixed(2),
        }));
      }
    }
  }, [
    formData.mc_on,
    formData.mc_per_gram,
    formData.making_charges,
    formData.total_weight_av,
    formData.rate_amt,
  ]);

  useEffect(() => {
    const rate = parseFloat(formData.rate) || 0;
    const totalWeight = parseFloat(formData.total_weight_av) || 0;
    const qty = parseFloat(formData.qty) || 0;
    const pieceCost = parseFloat(formData.pieace_cost) || 0;
    let rateAmt = 0;

    if (formData.pricing === "By fixed") {
      rateAmt = pieceCost * qty;
    } else {
      rateAmt = rate * totalWeight;
    }

    setFormData((prev) => ({
      ...prev,
      rate_amt: rateAmt.toFixed(2),
    }));
  }, [formData.rate, formData.total_weight_av, formData.qty, formData.pricing, formData.pieace_cost]);

  useEffect(() => {
    const taxPercent = parseFloat(formData.tax_percent) || 0;
    const rateAmt = parseFloat(formData.rate_amt) || 0;
    const stonesPrice = parseFloat(formData.stone_price) || 0;
    const totalMC = parseFloat(formData.making_charges) || 0;
    const discountAmt = parseFloat(formData.disscount) || 0;
    const hmCharges = parseFloat(formData.hm_charges) || 0;

    // Ensure discount is subtracted before tax calculation
    const totalAmount = rateAmt + stonesPrice + totalMC + hmCharges;
    const taxableAmount = rateAmt + stonesPrice + totalMC + hmCharges - discountAmt;
    const taxAmt = (taxableAmount * taxPercent) / 100;

    // Calculate Total Price
    const totalPrice = taxableAmount + taxAmt;

    setFormData((prev) => ({
      ...prev,
      tax_amt: taxAmt.toFixed(2),
      total_price: totalPrice.toFixed(2),
    }));
  }, [formData.tax_percent, formData.rate_amt, formData.stone_price, formData.making_charges, formData.disscount]);

  useEffect(() => {
    const fetchLastEstimateNumber = async () => {
      try {
        const response = await axios.get(`${baseURL}/lastEstimateNumber`);
        setFormData((prev) => ({
          ...prev,
          estimate_number: response.data.lastEstimateNumber,
        }));
      } catch (error) {
        console.error("Error fetching estimate number:", error);
      }
    };

    fetchLastEstimateNumber();
  }, []);

  const handleBack = () => {
    navigate("/estimatetable");
  };

  const defaultBarcode = formData.category
    ? products.find((product) => product.product_name === formData.category)?.rbarcode || ""
    : "";

  // Generate options list for barcode selection
  const barcodeOptions = [
    ...products
      .filter((product) => (formData.category ? product.product_name === formData.category : true))
      .map((product) => ({
        value: product.rbarcode,
        label: product.rbarcode,
      })),
    ...data
      .filter((tag) => (formData.category ? tag.category === formData.category : true))
      .map((tag) => ({
        value: tag.PCode_BarCode,
        label: tag.PCode_BarCode,
      })),
  ];

  // Ensure default barcode is included in options
  if (defaultBarcode && !barcodeOptions.some((option) => option.value === defaultBarcode)) {
    barcodeOptions.unshift({ value: defaultBarcode, label: defaultBarcode });
  }

  // Set default barcode only if formData.code is empty
  useEffect(() => {
    if (!formData.code && defaultBarcode) {
      handleBarcodeChange(defaultBarcode);
    }
  }, [formData.category, defaultBarcode]);

  const isByFixed = formData.pricing === "By fixed";

  const totalAmount = entries.reduce((sum, item) => {
    const stonePrice = parseFloat(item.stone_price) || 0;
    const makingCharges = parseFloat(item.making_charges) || 0;
    const rateAmt = parseFloat(item.rate_amt) || 0;
    const hmCharges = parseFloat(item.hm_charges) || 0;
    return sum + stonePrice + makingCharges + rateAmt + hmCharges;
  }, 0);

  const discountAmt = entries.reduce((sum, item) => {
    const discountAmt = parseFloat(item.disscount) || 0;
    return sum + discountAmt;
  }, 0);

  const taxableAmount = totalAmount - discountAmt;
  const taxAmount = entries.reduce((sum, item) => sum + parseFloat(item.tax_amt || 0), 0);
  const netAmount = taxableAmount + taxAmount;


  // Update formData.estimate_number from location.state
  useEffect(() => {
    if (location.state?.estimate_number && formData.estimate_number !== location.state.estimate_number) {
      console.log("Received Estimate Number from navigation:", location.state.estimate_number);
      setFormData((prev) => ({
        ...prev,
        estimate_number: location.state.estimate_number,
      }));
    }
  }, [location.state, formData.estimate_number, setFormData]);



  return (
    <div className="main-container">
      <Container className="estimate-form-container">
        <Row className="estimate-form-section">
          <h2>Estimate</h2>
          <Row className="d-flex justify-content-end align-items-center mb-3" style={{ marginLeft: '9px', marginTop: '-60px' }}>
            <Col xs={12} md={2}>
              <InputField
                label="Date:"
                name="date"
                value={formData.date}
                type="date"
                max={new Date().toISOString().split("T")[0]}
                onChange={handleInputChange}
              />
            </Col>
            <Col xs={12} md={2}>
              <InputField
                label="Estimate Number:"
                name="estimate_number"
                value={formData.estimate_number}
                onChange={handleInputChange}
                readOnly
              />
            </Col>
          </Row>

          <Col xs={12} md={2}>
            <InputField
              label="Category"
              name="category"
              value={formData.category || ""}
              type="select"
              onChange={handleInputChange}
              options={categoryOptions}
            />
          </Col>

          <Col xs={12} md={2}>
            <InputField
              label="BarCode/Rbarcode"
              name="code"
              value={formData.code} // Maintains user selection
              onChange={(e) => handleBarcodeChange(e.target.value)}
              type="select"
              options={barcodeOptions} // Provide valid options list
            />
          </Col>

          <Col xs={12} md={2}>
            <InputField
              label="Metal Type"
              name="metal_type"
              value={formData.metal_type || ""}
              onChange={handleInputChange}
              type="select"
              options={metaltypeOptions}
            />
          </Col>

          <Col xs={12} md={2}>
            <InputField
              label="Sub Category"
              name="sub_category"
              value={formData.sub_category || ""}
              onChange={handleInputChange}
              type="select"
              options={subcategoryOptions}
            />
          </Col>

          <Col xs={12} md={2}>
            <InputField
              label="Product Design Name"
              name="design_name"
              value={formData.design_name}
              onChange={handleInputChange}
              type="select"
              options={designOptions}
            />
          </Col>

          <Col xs={12} md={2}>
            <InputField
              label="Pricing"
              name="pricing"
              type="select"
              value={formData.pricing || ""} // Default to "Gross Weight"
              onChange={handleInputChange}
              options={[
                { value: "By Weight", label: "By Weight" },
                { value: "By fixed", label: "By fixed" },
                ...(formData.pricing &&
                  !["By Weight", "By fixed"].includes(formData.pricing)
                  ? [{ value: formData.pricing, label: formData.pricing }]
                  : []),
              ]}
            />
          </Col>
          {isByFixed ? (
            <>
              <Col xs={12} md={1}>
                <InputField
                  label="Piece Cost"
                  name="pieace_cost"
                  value={formData.pieace_cost}
                  onChange={handleInputChange}
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField
                  label="Amount"
                  name="rate_amt"
                  value={formData.rate_amt || "0.00"}
                  onChange={handleInputChange}
                  readOnly={false}
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField
                  label="Qty"
                  name="qty"
                  value={formData.qty}
                  onChange={handleInputChange}
                  readOnly={!isQtyEditable}
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField label="Tax %" name="tax_percent" value={formData.tax_percent} onChange={handleInputChange} />
              </Col>
              <Col xs={12} md={1}>
                <InputField label="Tax Amt" name="tax_amt" value={formData.tax_amt} onChange={handleInputChange} />
              </Col>
              <Col xs={12} md={2}>
                <InputField label="Total Price" name="total_price" value={formData.total_price} onChange={handleInputChange} />
              </Col>
            </>
          ) : (
            // Otherwise (if Pricing is not "By fixed"), show all fields:
            <>
              <Col xs={12} md={2}>
                <InputField
                  label="Purity"
                  name="purity"
                  value={formData.purity || ""}
                  onChange={handleInputChange}
                  type="select"
                  options={purityOptions}
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField label="Gross Wt" name="gross_weight" value={formData.gross_weight} onChange={handleInputChange} />
              </Col>
              <Col xs={12} md={1}>
                <InputField label="Stones Wt" name="stone_weight" value={formData.stone_weight} onChange={handleInputChange} />
              </Col>
              <Col xs={12} md={1}>
                <InputField label="St Price" name="stone_price" value={formData.stone_price} onChange={handleInputChange} />
              </Col>
              <Col xs={12} md={1}>
                <InputField label="Wt BW:" name="weight_bw" value={formData.weight_bw} onChange={handleInputChange} />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Wastage On"
                  name="va_on"
                  type="select"
                  value={formData.va_on || ""} // Default to "Gross Weight"
                  onChange={handleInputChange}
                  options={[
                    { value: "Gross Weight", label: "Gross Weight" },
                    { value: "Weight BW", label: "Weight BW" },
                    ...(formData.va_on &&
                      !["Gross Weight", "Weight BW"].includes(formData.va_on)
                      ? [{ value: formData.va_on, label: formData.va_on }]
                      : []),
                  ]}
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField label="Wastage %" name="va_percent" value={formData.va_percent} onChange={handleInputChange} />
              </Col>
              <Col xs={12} md={1}>
                <InputField label="W.Wt" name="wastage_weight" value={formData.wastage_weight} onChange={handleInputChange} />
              </Col>
              <Col xs={12} md={2}>
                <InputField label="Total Weight AW" name="total_weight_av" value={formData.total_weight_av} onChange={handleInputChange} />
              </Col>
              <Col xs={12} md={1}>
                <InputField label="Rate" name="rate" value={formData.rate} onChange={handleInputChange} />
              </Col>
              <Col xs={12} md={1}>
                <InputField
                  label="Amount"
                  name="rate_amt"
                  value={formData.rate_amt || "0.00"} // Default to "0.00" if undefined
                  onChange={handleInputChange} // Trigger recalculation of Total MC
                  readOnly // Ensure it's editable
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="MC On"
                  name="mc_on"
                  type="select"
                  value={formData.mc_on || ""} // Default to "MC / Gram"
                  onChange={handleInputChange}
                  options={[
                    { value: "MC / Gram", label: "MC / Gram" },
                    { value: "MC / Piece", label: "MC / Piece" },
                    { value: "MC %", label: "MC %" },
                    ...(formData.mc_on &&
                      !["MC / Gram", "MC / Piece", "MC %"].includes(formData.mc_on)
                      ? [{ value: formData.mc_on, label: formData.mc_on }]
                      : []),
                  ]}
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField
                  label={
                    formData.mc_on === "MC %"
                      ? "MC %"
                      : "MC/Gm"
                  }
                  name="mc_per_gram"
                  value={formData.mc_per_gram || ""} // Default value handling
                  onChange={handleInputChange}
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField
                  label="Total MC"
                  name="making_charges"
                  value={formData.making_charges || ""} // Display calculated Total MC
                  onChange={handleInputChange}
                // readOnly // Make this field read-only, since it’s auto-calculated
                />
              </Col>
              {/* <Col xs={12} md={2}>
                <InputField
                  label="Disscount %"
                  name="disscount_percentage"
                  value={formData.disscount_percentage || ""} // Display calculated Total MC
                  onChange={handleInputChange}
                />
              </Col>
              <Col xs={12} md={2}>
                <InputField
                  label="Total Disscount"
                  name="disscount"
                  value={formData.disscount || ""} // Display calculated Total MC
                  onChange={handleInputChange}
                />
              </Col> */}
              <Col xs={12} md={1}>
                <InputField
                  label="HMCharge"
                  name="hm_charges"
                  value={formData.hm_charges || "0.00"} // Default to "0.00" if undefined
                  onChange={handleInputChange} // Optional, since it's auto-calculated
                />
              </Col>
              <Col xs={12} md={1}>
                <InputField label="Tax %" name="tax_percent" value={formData.tax_percent} onChange={handleInputChange} />
              </Col>
              <Col xs={12} md={1}>
                <InputField label="Tax Amt" name="tax_amt" value={formData.tax_amt} onChange={handleInputChange} />
              </Col>
              <Col xs={12} md={2}>
                <InputField label="Total Price" name="total_price" value={formData.total_price} onChange={handleInputChange} />
              </Col>
            </>
          )}
          <Col xs={12} md={1}>
            <Button
              style={{
                backgroundColor: "#a36e29", borderColor: "#a36e29", marginTop: "3px",
                marginLeft: "-1px",
                fontSize: "13px", padding: "5px 9px"
              }}
              onClick={handleAdd}
            >
              {isEditing ? "Update" : "Add"}
            </Button>
          </Col>

        </Row>
        <Row className="estimate-form-section2">
          <Table bordered hover responsive>
            <thead>
              <tr style={{ fontSize: "14px" }}>
                <th>S No</th>
                <th>Code</th>
                <th>Category</th>
                <th>Sub Category</th>
                <th>Gross Weight</th>
                <th>Stones Weight</th>
                <th>Total Weight</th>
                <th>Rate</th>
                <th>Total Rs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.length > 0 ? (
                entries.map((entry, index) => (
                  <tr key={index} style={{ fontSize: "14px" }}>
                    <td>{index + 1}</td>
                    <td>{entry.code}</td>
                    <td>{entry.category}</td>
                    <td>{entry.sub_category}</td>
                    <td>{entry.gross_weight}</td>
                    <td>{entry.stone_weight}</td>
                    <td>{entry.total_weight_av}</td>
                    <td>{entry.rate}</td>
                    <td>{entry.total_price}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaEdit
                          style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue' }}
                          onClick={() => handleEdit(index)}

                        />
                        <FaTrash
                          style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
                          onClick={() => handleDelete(index)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">
                    No entries added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Row>
        <Row className="estimate-form-section2">
          <Table bordered hover responsive>
            <>
              <tr style={{ fontSize: "14px" }}>
                <td colSpan="20" className="text-right">
                  Total Amount
                </td>
                <td colSpan="4">{totalAmount.toFixed(2)}</td>
              </tr>

              <tr style={{ fontSize: "14px" }}>
                <td colSpan="16" className="text-right">Discount Amount</td>
                <td colSpan="4">  @
                  <input
                    type="number"
                    value={discount}
                    onChange={handleDiscountChange}
                    style={{ width: '80px', padding: '1px' }}
                  />
                </td>
                <td colSpan="4">
                  {discountAmt.toFixed(2)}
                </td>
              </tr>
              <tr style={{ fontSize: "14px" }}>
                <td colSpan="20" className="text-right">
                  Taxable Amount
                </td>
                <td colSpan="4">{taxableAmount.toFixed(2)}</td>
              </tr>
              <tr style={{ fontSize: "14px" }}>
                <td colSpan="20" className="text-right">
                  Tax Amount
                </td>
                <td colSpan="4">{taxAmount.toFixed(2)}</td>
              </tr>
              <tr style={{ fontSize: "14px" }}>
                <td colSpan="20" className="text-right">
                  Net Amount
                </td>
                <td colSpan="4">{netAmount.toFixed(2)}</td>
              </tr>
              <tr style={{ fontSize: "14px" }}>
                <td colSpan="20" className="text-right">
                  Net Payable Amount
                </td>
                <td colSpan="4">{Math.round(netAmount).toFixed(2)}</td>
              </tr>
            </>
          </Table>
          <Col xs={12} md={12} className="d-flex justify-content-end" style={{ marginTop: "-10px" }}>
            <Button
              onClick={handleClose}
              style={{
                width: "60px", backgroundColor: "gray", borderColor: "gray", marginLeft: "5px", fontSize: "14px", marginTop: "1px",
                padding: "1px 8px", height: "33px"
              }}
            // disabled={!isSubmitEnabled}
            >
              Close
            </Button>
            <Button className="cus-back-btn" variant="secondary" onClick={handleBack} style={{
              width: "60px", marginLeft: '15px', fontSize: "14px",
              marginTop: "1px",
              padding: "1px 8px", height: "33px"
            }}>cancel</Button>
            <Button
              style={{
                backgroundColor: "#a36e29", borderColor: "#a36e29", marginLeft: '15px', fontSize: "14px",
                marginTop: "1px",
                padding: "1px 8px", height: "33px"
              }}
              onClick={handlePrint}
            >
              Print
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RepairForm;
