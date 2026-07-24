import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import baseURL from './../../../../../Url/NodeBaseURL';
import { useLocation } from "react-router-dom";
import Webcam from "react-webcam";

const useProductHandlers = () => {
  const [products, setProducts] = useState([]);
  const [data, setData] = useState([]);
  const [isQtyEditable, setIsQtyEditable] = useState(false);
  const location = useLocation();

  const { transfer_number = "", mobile = "" } = location.state || {};

  const [rates, setRates] = useState({
    rate_24crt: "",
    rate_22crt: "",
    rate_18crt: "",
    rate_16crt: ""
  });

  const getTabId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let tabId = urlParams.get('tabId');

    if (!tabId) {
      tabId = sessionStorage.getItem('tabId');
    }

    if (!tabId) {
      tabId = crypto.randomUUID();
      sessionStorage.setItem('tabId', tabId);
      const newUrl = `${window.location.pathname}?tabId=${tabId}`;
      window.history.replaceState({}, '', newUrl);
    }

    return tabId;
  };

  const tabId = getTabId();

  const getFreshFormData = (mobile) => ({
    id: '',
    customer_id: "",
    mobile: mobile,
    account_name: "",
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
    terms: "Cash",
    date: new Date().toISOString().split('T')[0],
    transfer_number: transfer_number,
    code: "",
    product_id: "",
    metal: "",
    product_name: "",
    metal_type: "",
    design_name: "",
    purity: "",
    selling_purity: "",
    printing_purity: "",
    pricing: "By Weight",
    category: "",
    sub_category: "",
    gross_weight: "",
    stone_weight: "",
    weight_bw: "",
    stone_price: "",
    va_on: "Gross Weight",
    va_percent: "",
    wastage_weight: "",
    total_weight_av: "",
    mc_on: "MC %",
    disscount_percentage: "",
    disscount: "",
    mc_per_gram: "",
    making_charges: "",
    rate: "",
    pieace_cost: "",
    mrp_price: "",
    rate_amt: "",
    tax_percent: "03% GST",
    tax_amt: "",
    total_price: "",
    transaction_status: "Stock Transfer",
    qty: "1",
    opentag_id: "",
    product_image: null,
    imagePreview: null,
    remarks: "",
    sale_status: "Delivered",
    piece_taxable_amt: "",
    festival_discount: "",
    custom_purity: "",
    manual_price_update: false,
    order_number: '',
    receipts_amt: "",
    bal_after_receipts: "",
    active_stock_point_id: "",
    other_stock_point_id: "",
    active_stock_point_details: null,
    other_stock_point_details: null,
    // NEW FIELDS for Stock Transfer
    cover_wt: "",
    card_wt: "",
    packing_wt: "",
  });

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem(`saleFormData_${tabId}`);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return getFreshFormData(mobile);
  });

  useEffect(() => {
    localStorage.setItem(`saleFormData_${tabId}`, JSON.stringify(formData));
  }, [formData, tabId]);

  const [uniqueProducts, setUniqueProducts] = useState([]);
  const [metalTypes, setMetalTypes] = useState([]);
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
  const [image, setImage] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCurrentRates = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/current-rates`);
        const newRates = {
          rate_24crt: response.data.rate_24crt || "",
          rate_22crt: response.data.rate_22crt || "",
          rate_18crt: response.data.rate_18crt || "",
          rate_16crt: response.data.rate_16crt || "",
          silver_rate: response.data.silver_rate || "",
        };
        setRates(newRates);

        setFormData((prev) => ({
          ...prev,
          rate_24k: newRates.rate_24crt,
        }));
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
      setData(result.result);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTags();
  }, []);

  const [isManualTotalPriceChange, setIsManualTotalPriceChange] = useState(false);
  const [isTotalPriceCleared, setIsTotalPriceCleared] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'total_price') {
      setIsManualTotalPriceChange(true);
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    let updatedFormData = { ...formData, [name]: value };

    if (name === "category") {
      const categoryProduct = products.find(prod =>
        prod.product_name === value
      );

      if (categoryProduct) {
        updatedFormData = {
          ...updatedFormData,
          code: categoryProduct.rbarcode || "",
          product_id: categoryProduct.product_id || "",
          metal_type: categoryProduct.Category || "",
          selling_purity: "",
          product_name: "",
          rate: "",
        };
      } else {
        updatedFormData = {
          ...updatedFormData,
          code: "",
          product_id: "",
          metal_type: ""
        };
      }
    }

    if (name === "selling_purity") {
      if (value === "") {
        setFormData(prev => ({
          ...prev,
          selling_purity: "",
          custom_purity: "",
          rate: ""
        }));
        return;
      } else if (value === "Manual") {
        updatedFormData.rate = "";
      } else {
        const purityValue = parseFloat(value);
        if (!isNaN(purityValue) && formData.rate_24k) {
          const baseRate = parseFloat(formData.rate_24k);
          updatedFormData.rate = ((purityValue / 100) * baseRate).toFixed(2);
        }
      }
    }

    if (name === "product_name") {
      if (value === "") {
        updatedFormData.selling_purity = "";
        updatedFormData.purity = "";
        updatedFormData.printing_purity = "";
        updatedFormData.pricing = "By Weight";
        updatedFormData.rate = "";
      } else {
        const selectedSubCategory = subcategoryOptions.find(
          (option) => option.value === value
        );

        if (selectedSubCategory) {
          updatedFormData.selling_purity = selectedSubCategory.selling_purity || "";
          updatedFormData.purity = selectedSubCategory.purity || "";
          updatedFormData.printing_purity = selectedSubCategory.printing_purity || "";
          updatedFormData.pricing = selectedSubCategory.pricing || "By Weight";

          const purityValue = parseFloat(selectedSubCategory.selling_purity);
          const baseRate = parseFloat(formData.rate_24k) || 0;
          if (!isNaN(purityValue)) {
            updatedFormData.rate = ((purityValue / 100) * baseRate).toFixed(2);
          }
        }
      }
    }

    if (name === "custom_purity" && formData.selling_purity === "Manual") {
      if (value === "") {
        updatedFormData.rate = "";
      } else {
        const purityValue = parseFloat(value);
        const baseRate = parseFloat(formData.rate_24k) || 0;
        if (!isNaN(purityValue)) {
          updatedFormData.rate = ((purityValue / 100) * baseRate).toFixed(2);
        }
      }
    }

    if (name === "metal_type") {
      const metal = value.toLowerCase();
      if (metal === "gold" || metal === "diamond" || metal === "other") {
        updatedFormData.mc_on = "MC %";
      } else if (metal === "silver") {
        updatedFormData.mc_on = "MC / Gram";
      }
    }

    if (name === "category" && value === "") {
      updatedFormData = {
        ...updatedFormData,
        code: "",
        product_id: "",
        metal: "",
        product_name: "",
        metal_type: "",
        design_name: "",
        purity: "",
        selling_purity: "",
        printing_purity: "",
        pricing: "By Weight",
        category: "",
        sub_category: "",
        gross_weight: "",
        stone_weight: "",
        weight_bw: "",
        stone_price: "",
        va_on: "Gross Weight",
        va_percent: "",
        wastage_weight: "",
        total_weight_av: "",
        mc_on: "MC %",
        disscount_percentage: "",
        disscount: "",
        mc_per_gram: "",
        making_charges: "",
        rate: "",
        pieace_cost: "",
        mrp_price: "",
        rate_amt: "",
        tax_percent: "03% GST",
        tax_amt: "",
        total_price: "",
        transaction_status: "Stock Transfer",
        qty: "1",
        opentag_id: "",
        product_image: null,
        imagePreview: null,
        remarks: "",
        sale_status: "Delivered",
        piece_taxable_amt: "",
        festival_discount: "",
        custom_purity: "",
      };
    }

    if (name === "mc_on") {
      if (value !== formData.mc_on) {
        if (!formData.isTagSelected) {
          updatedFormData.mc_per_gram = "0";
          updatedFormData.making_charges = "0";
        } else {
          updatedFormData.mc_per_gram = formData.mc_per_gram;
          updatedFormData.making_charges = formData.making_charges;
        }
      }
    }

    if (name === "disscount_percentage") {
      const discountPercentage = parseFloat(value) || 0;
      const makingCharges = parseFloat(formData.making_charges) || 0;
      const discountAmount = (discountPercentage / 100) * makingCharges;
      updatedFormData.disscount = discountAmount.toFixed(2);
    }

    if (name === "pricing" && value === "By fixed") {
      updatedFormData.gross_weight = "";
      updatedFormData.stone_weight = "";
      updatedFormData.weight_bw = "";
      updatedFormData.stone_price = "";
      updatedFormData.va_on = "Gross Weight";
      updatedFormData.va_percent = "";
      updatedFormData.wastage_weight = "";
      updatedFormData.total_weight_av = "";
      updatedFormData.mc_on = "MC %";
      updatedFormData.mc_per_gram = "";
      updatedFormData.making_charges = "";
      updatedFormData.disscount_percentage = "";
      updatedFormData.disscount = "";
      updatedFormData.rate = "";
      updatedFormData.custom_purity = ""
    }

    setFormData(updatedFormData);
  };

  const handleProductNameChange = (productName) => {
    const productEntries = data.filter((prod) => prod.sub_category === productName);

    if (productEntries.length > 0) {
      const uniqueMetalTypes = Array.from(
        new Set(productEntries.map((prod) => prod.metal_type))
      ).map((metalType) => ({ metal_type: metalType }));

      setFormData((prevData) => ({
        ...prevData,
        product_name: productName,
        metal_type: "",
        design_name: "",
      }));

      setFilteredMetalTypes(uniqueMetalTypes);
      setFilteredDesignOptions([]);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        code: "",
        product_name: "",
        metal_type: "",
        design_name: "",
        purity: "",
        selling_purity: "",
        printing_purity: "",
        pricing: "By Weight",
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
        disscount_percentage: "",
        disscount: "",
        rate: "",
        pieace_cost: "",
        mrp_price: "",
        rate_amt: "",
        tax_percent: "03% GST",
        tax_amt: "",
        total_price: "",
        qty: "",
        remarks: "",
        sale_status: "Delivered",
        piece_taxable_amt: "",
        festival_discount: "",
        custom_purity: "",
      }));

      setFilteredMetalTypes(metalTypes);
      setFilteredDesignOptions(designOptions);
    }
  };

  const handleMetalTypeChange = (metalType) => {
    const productEntries = data.filter(
      (prod) => prod.sub_category === formData.product_name && prod.metal_type === metalType
    );

    if (productEntries.length > 0) {
      const uniqueDesignOptions = Array.from(
        new Set(productEntries.map((prod) => prod.design_master))
      ).map((designMaster) => ({ design_master: designMaster }));

      setFormData((prevData) => ({
        ...prevData,
        metal_type: metalType,
        design_name: "",
      }));

      setFilteredDesignOptions(uniqueDesignOptions);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        metal_type: "",
        design_name: "",
      }));

      setFilteredDesignOptions([]);
    }
  };

  const handleDesignNameChange = (designName) => {
    const productEntries = data.filter(
      (prod) =>
        prod.sub_category === formData.product_name &&
        prod.metal_type === formData.metal_type &&
        prod.design_master === designName
    );

    if (productEntries.length > 0) {
      const uniquePurityOptions = Array.from(
        new Set(productEntries.map((prod) => prod.Purity))
      ).map((Purity) => ({ Purity }));

      setFormData((prevData) => ({
        ...prevData,
        design_name: designName,
        purity: "",
        selling_purity: "",
        printing_purity: "",
        pricing: "By Weight",
      }));

      setFilteredPurityOptions(uniquePurityOptions);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        design_name: "",
        purity: "",
        selling_purity: "",
        printing_purity: "",
        pricing: "By Weight",
      }));

      setFilteredPurityOptions([]);
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await fetch(`${baseURL}/get/products`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const result = await response.json();
      if (result && Array.isArray(result)) {
        const formattedOptions = result.map((item) => ({
          label: item.product_name,
          value: item.product_name,
        }));
        setCategoryOptions(formattedOptions);
      } else {
        console.error("Invalid API response format", result);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const hasProcessedNewSubCategory = useRef(false);

  const fetchSubCategory = async () => {
    try {
      const response = await fetch(`${baseURL}/subcategory`);
      const result = await response.json();
      if (result && result.data) {
        const filteredData = formData.product_id
          ? result.data.filter((item) => item.category_id === formData.product_id)
          : result.data;

        const formattedOptions = filteredData.map((item) => ({
          label: item.sub_category_name,
          value: item.sub_category_name,
          selling_purity: item.selling_purity,
          printing_purity: item.printing_purity,
          purity: item.purity,
          pricing: item.pricing,
        }));

        setSubcategoryOptions(formattedOptions);

        if (location.state?.newSubCategory && !hasProcessedNewSubCategory.current) {
          const found = formattedOptions.find(opt => opt.label === location.state.newSubCategory);
          if (found) {
            setFormData(prev => {
              const updatedData = {
                ...prev,
                product_name: found.value,
                selling_purity: found.selling_purity || "",
                purity: found.purity || "",
                printing_purity: found.printing_purity || "",
                pricing: found.pricing || "",
              };

              const purityValue = parseFloat(found.selling_purity);
              const baseRate = parseFloat(prev.rate_24k) || 0;
              if (!isNaN(purityValue)) {
                updatedData.rate = ((purityValue / 100) * baseRate).toFixed(2);
              }

              return updatedData;
            });

            hasProcessedNewSubCategory.current = true;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  useEffect(() => {
    fetchSubCategory();
  }, [formData.category, formData.rate_24k, rates]);

  const [allMetalTypes, setAllMetalTypes] = useState([]);

  useEffect(() => {
    const fetchMetalType = async () => {
      try {
        const response = await fetch(`${baseURL}/metaltype`);
        const data = await response.json();
        const allMetalTypes = Array.from(new Set(data.map((product) => product.metal_name)));
        setAllMetalTypes(allMetalTypes);
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

          if (formData.category && options.length > 0 && !formData.metal_type) {
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
            label: item.design_name,
            value: item.design_name,
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
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchPurity();
  }, [formData.metal_type]);

  const handleBarcodeChange = async (code) => {
  try {
    console.log("🔍 handleBarcodeChange called with code:", code);
    
    if (!code) {
      setIsBarcodeSelected(false);
      setFormData((prevData) => ({
        ...prevData,
        code: "",
        product_id: "",
          product_name: "",
          metal_type: "",
          design_name: "",
          purity: "",
          selling_purity: "",
          printing_purity: "",
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
          disscount_percentage: "",
          disscount: "",
          rate: "",
          pieace_cost: "",
          mrp_price: "",
          rate_amt: "",
          tax_percent: "03% GST",
          tax_amt: "",
          total_price: "",
          qty: "",
          remarks: "",
          sale_status: "Delivered",
          piece_taxable_amt: "",
          festival_discount: "",
          custom_purity: "",
           // Reset new fields
          cover_wt: "",
          card_wt: "",
          packing_wt: "",
      }));
      setIsQtyEditable(true);
      return;
    }

    // First check if it's a product from products table
    const product = products.find((prod) => String(prod.rbarcode) === String(code));
    console.log("📦 Product found in products table:", product ? "Yes" : "No");
    
    if (product) {
      console.log("✅ Found product:", product.product_name);
      setIsBarcodeSelected(true);
      const metalType = product.Category || "";
      const mcOnValue = metalType.toLowerCase() === "silver" ? "MC / Gram" : "MC %";
      setFormData((prevData) => ({
        ...prevData,
        code: product.rbarcode,
        product_id: product.product_id,
        product_name: "",
        metal_type: product.Category,
        design_name: "",
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
        pieace_cost: "",
        mrp_price: "",
        mc_on: mcOnValue,
        mc_per_gram: "",
        making_charges: "",
        disscount_percentage: "",
        disscount: "",
        tax_percent: product.tax_slab,
        qty: 1,
        festival_discount: "",
        custom_purity: "",
        // Reset new fields
        cover_wt: "",
        card_wt: "",
        packing_wt: "",
      }));
      setIsQtyEditable(true);
      return;
    }

    // Check if it's a tag from opening_tags_entry
    console.log("🔍 Searching in opening_tags_entry for code:", code);
    const tag = data.find((tag) => String(tag.PCode_BarCode) === String(code));
    console.log("📦 Tag found in opening_tags_entry:", tag ? "Yes" : "No");
    
    if (tag) {
      console.log("📦 Tag details:", {
        code: tag.PCode_BarCode,
        status: tag.Status,
        stockPoint: tag.Stock_Point,
        subCategory: tag.sub_category
      });

      // CHECK CONDITIONS: Status must be Available AND Stock_Point must be MAIN STOCK ROOM
      if (tag.Status !== "Available") {
        alert(`❌ Product "${code}" is not available. Status: ${tag.Status}`);
        setFormData((prevData) => ({
          ...prevData,
          code: "",
        }));
        setIsQtyEditable(true);
        return;
      }

      if (tag.Stock_Point !== "MAIN STOCK ROOM") {
        alert(`❌ Product "${code}" is not in MAIN STOCK ROOM. Current location: ${tag.Stock_Point}`);
        setFormData((prevData) => ({
          ...prevData,
          code: "",
        }));
        setIsQtyEditable(true);
        return;
      }

      console.log("✅ Tag passed all checks, loading into form...");
      
      const productId = tag.product_id;
      const productDetails = products.find((prod) => String(prod.product_id) === String(productId));

      let rateValue = "";
      const metalType = String(tag.metal_type || "").toLowerCase();
      const purity = tag.Purity || tag.pur_Purity || "";

      if (purity) {
        const baseRate = metalType === "silver" ? rates.silver_rate : formData.rate_24k;
        if (baseRate) {
          rateValue = (parseFloat(purity) * parseFloat(baseRate)) / 100;
        }
      } else if (metalType === "silver") {
        rateValue = rates.silver_rate || "";
      }

      setFormData((prevData) => ({
        ...prevData,
        code: tag.PCode_BarCode || "",
        product_id: tag.product_id || "",
        opentag_id: tag.opentag_id || "",
        product_name: tag.sub_category || "",
        metal_type: tag.metal_type || "",
        design_name: tag.design_master || "",
        purity: tag.pur_Purity || "",
        selling_purity: tag.Purity || "",
        printing_purity: tag.printing_purity || "",
        pricing: tag.Pricing || prevData.pricing || "By Weight",
        category: tag.category || "",
        sub_category: tag.sub_category || "",
        gross_weight: tag.Gross_Weight || "",
        stone_weight: tag.Stones_Weight || "",
        stone_price: tag.Stones_Price || "",
        weight_bw: tag.Weight_BW || "",
        va_on: tag.Wastage_On || "Gross Weight",
        va_percent: tag.Wastage_Percentage || "",
        wastage_weight: tag.WastageWeight || "",
        total_weight_av: tag.TotalWeight_AW || "",
        pieace_cost: tag.pieace_cost || "",
        mrp_price: tag.mrp_price || "",
        mc_on: tag.Making_Charges_On || "MC %",
        mc_per_gram: tag.MC_Per_Gram || "",
        making_charges: tag.Making_Charges || "",
        tax_percent: productDetails?.tax_slab || tag.tax_percent || "03% GST",
        qty: 1,
        rate: rateValue,
         // Load new fields from tag if they exist
        cover_wt: tag.Cover_Wt || "",
        card_wt: tag.Card_Wt || "",
        packing_wt: tag.Packing_Wt || "",
      }));
      setIsQtyEditable(false);
      console.log("✅ Form updated with tag data");
    } else {
      console.log("❌ Barcode not found in products or opening_tags_entry");
      alert(`❌ Barcode "${code}" not found in products or tags.`);
      setFormData((prevData) => ({
        ...prevData,
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
        total_weight_aw: "",
        mc_on: "MC %",
        mc_per_gram: "",
        making_charges: "",
        disscount_percentage: "",
        disscount: "",
        rate: "",
        pieace_cost: "",
        mrp_price: "",
        rate_amt: "",
        tax_percent: "03% GST",
        tax_amt: "",
        total_price: "",
        qty: "",
        remarks: "",
        sale_status: "Delivered",
        piece_taxable_amt: "",
        festival_discount: "",
          // Reset new fields
        cover_wt: "",
        card_wt: "",
        packing_wt: "",
      }));
      setIsQtyEditable(true);
    }
  } catch (error) {
    console.error("❌ Error handling code change:", error);
    alert("Error processing barcode. Please try again.");
  }
};

  // ============= IMAGE HANDLING FUNCTIONS =============

  /**
   * Handle image upload from file input
   * Converts image to base64 and stores in formData.imagePreview
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ 
          ...prev, 
          imagePreview: reader.result // Base64 encoded image
        }));
        setImage(reader.result); // Store image for potential use
      };
      reader.onerror = () => {
        alert("Error reading image file. Please try again.");
      };
      reader.readAsDataURL(file);
      setShowOptions(false);
    }
  };

  /**
   * Clear the current image preview
   * Resets both imagePreview and file input
   */
  const clearImage = () => {
    setFormData((prev) => ({ ...prev, imagePreview: null }));
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Capture image from webcam
   * Takes screenshot from webcam and stores in formData.imagePreview
   */
  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setFormData((prev) => ({ ...prev, imagePreview: imageSrc }));
        setImage(imageSrc);
        setShowWebcam(false);
        setShowOptions(false);
      } else {
        alert("Failed to capture image. Please try again.");
      }
    } else {
      alert("Camera not available. Please check your camera permissions.");
    }
  };

  /**
   * Trigger file input click to open file picker
   */
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ============= END IMAGE HANDLING FUNCTIONS =============

  return {
    formData,
    data,
    setFormData,
    products,
    isQtyEditable,
    handleChange,
    // Image handling functions
    handleImageChange,
    fileInputRef,
    clearImage,
    captureImage,
    setShowWebcam,
    showWebcam,
    webcamRef,
    setShowOptions,
    showOptions,
    image,
    triggerFileUpload, // Added for convenience
    // Other handlers
    handleBarcodeChange,
    handleProductNameChange,
    handleMetalTypeChange,
    handleDesignNameChange,
    filteredDesignOptions,
    filteredPurityOptions,
    filteredMetalTypes,
    categoryOptions,
    subcategoryOptions,
    designOptions,
    purityOptions,
    metaltypeOptions,
    uniqueProducts,
    isBarcodeSelected,
    fetchCategory,
    fetchSubCategory,
    tabId,
    isManualTotalPriceChange,
    setIsManualTotalPriceChange,
    isTotalPriceCleared,
    setIsTotalPriceCleared
  };
};

export default useProductHandlers;