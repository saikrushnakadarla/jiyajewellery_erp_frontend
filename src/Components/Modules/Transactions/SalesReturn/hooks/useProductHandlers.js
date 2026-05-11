import { useState, useEffect } from 'react';
import axios from 'axios';
import baseURL from './../../../../../Url/NodeBaseURL';

const useProductHandlers = () => {
  const [products, setProducts] = useState([]);
  const [data, setData] = useState([]);
  const [isQtyEditable, setIsQtyEditable] = useState(false);

  const [rates, setRates] = useState({
    rate_24crt: "",
    rate_22crt: "",
    rate_18crt: "",
    rate_16crt: ""
  });

  const [formData, setFormData] = useState({
    customer_id: "value001",
    mobile: "",
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
    terms: "",
    date: "",
    invoice_number: "",
    code: "",
    product_id: "",
    metal: "",
    product_name: "",
    metal_type: "",
    design_name: "",
    purity: "",
    gross_weight: "",
    stone_weight: "",
    weight_bw: "",
    stone_price: "",
    va_on: "",
    va_percent: "",
    wastage_weight: "",
    total_weight_av: "",
    mc_on: "",
    mc_per_gram: "",
    making_charges: "",
    rate: "",
    rate_amt: "",
    tax_percent: "",
    tax_amt: "",
    total_price: "",
    transaction_status: "Sales",
    qty: "",
    opentag_id: "",
    product_image: null,
  });

  const [uniqueProducts, setUniqueProducts] = useState([]); 
    const [metalTypes, setMetalTypes] = useState([]);
    const [purity, setPurity] = useState([]);
    const [filteredMetalTypes, setFilteredMetalTypes] = useState([]);
    const [designOptions, setDesignOptions] = useState([]); 
    const [filteredDesignOptions, setFilteredDesignOptions] = useState([]); 
    const [filteredPurityOptions, setFilteredPurityOptions] = useState([]);
  

  // Determine the current rate based on purity
  useEffect(() => {
    const currentRate = 
      formData.purity === "24K" ? rates.rate_24crt :
      formData.purity === "22K" ? rates.rate_22crt :
      formData.purity === "18K" ? rates.rate_18crt :
      formData.purity === "16K" ? rates.rate_16crt :
      "";

    setFormData((prevData) => ({
      ...prevData,
      rate: currentRate
    }));
  }, [formData.purity, rates]);

  // Fetch rates on mount
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
  
      // Filter tags where Status === 'Sold'
      const soldTags = result.result.filter((prod) => prod.Status === 'Sold');
  
      // Remove duplicate product_Name entries
      const uniqueProductNames = Array.from(
        new Map(soldTags.map((prod) => [prod.product_Name, prod])).values()
      );
  
      // Extract unique metal types
      const uniqueMetalTypes = Array.from(
        new Set(soldTags.map((prod) => prod.metal_type))
      ).map((metalType) => ({ metal_type: metalType }));
  
      // Extract unique design names
      const uniqueDesigns = Array.from(
        new Set(soldTags.map((prod) => prod.design_master))
      ).map((designMaster) => ({ design_master: designMaster }));
  
      // Extract unique purity options
      const uniquePurity = Array.from(
        new Set(soldTags.map((prod) => prod.Purity))
      ).map((Purity) => ({ Purity: Purity }));
  
      setData(soldTags); // Set the filtered data
      setUniqueProducts(uniqueProductNames); // Set unique product_Name options
      setMetalTypes(uniqueMetalTypes); // Set all unique metal types
      setFilteredMetalTypes(uniqueMetalTypes); // Initially, show all metal types
      setDesignOptions(uniqueDesigns); // Set all unique designs
      setFilteredDesignOptions(uniqueDesigns); // Initially, show all designs
      setPurity(uniquePurity); // Set all unique purity options
      setFilteredPurityOptions(uniquePurity); // Initially, show all purity options
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };
  
    
useEffect(() => {
  fetchProducts();
  fetchTags();
}, []);

const handleProductNameChange = (productName) => {
  const product = data.find((prod) => String(prod.product_Name) === String(productName));

  if (product) {
    setFormData((prevData) => ({
      ...prevData,
      code: product.rbarcode,
      product_id: product.product_id || "",
      product_name: product.product_Name || "",
      
    }));

    // Filter metal types based on the selected product's metal type
    const filteredMetalTypes = metalTypes.filter(
      (metalType) => metalType.metal_type === product.metal_type
    );
    setFilteredMetalTypes(filteredMetalTypes); // Update filtered metal types

    // Filter and deduplicate design_master options for the selected product
    const filteredDesignOptions = Array.from(
      new Set(
        data
          .filter((prod) => prod.product_Name === productName)
          .map((prod) => prod.design_master)
      )
    ).map((designMaster) => ({ design_master: designMaster }));
    setFilteredDesignOptions(filteredDesignOptions); // Update filtered design options

    // Filter and deduplicate purity options for the selected product
    const filteredPurityOptions = Array.from(
      new Set(
        data
          .filter((prod) => prod.product_Name === productName)
          .map((prod) => prod.Purity)
      )
    ).map((Purity) => ({ Purity }));
    setFilteredPurityOptions(filteredPurityOptions); // Update filtered purity options
  } else {
    setFormData((prevData) => ({
      ...prevData,
      code: "",
      product_id: "",
      product_name: "",
      metal_type: "",
      design_name: "",
      purity: "",
      category:"",
      sub_category:"",
      gross_weight: "",
      stone_weight: "",
      stone_price: "",
      weight_bw: "",
      va_on: "",
      va_percent: "",
      wastage_weight: "",
      total_weight_aw: "",
      mc_on: "",
      mc_per_gram: "",
      making_charges: "",
      rate: "",
      rate_amt: "",
      tax_percent: "",
      tax_amt: "",
      total_price: "",
      qty: "",
    }));

    setFilteredMetalTypes(metalTypes); // Reset to all metal types
    setFilteredDesignOptions(designOptions); // Clear design_master options
    setFilteredPurityOptions(purity); // Clear purity options
  }
};

const handleChange = (e) => {
  const { name, value } = e.target;

  // Preserve the current barcode
  const currentBarcode = formData.code;

  // Update the specific field in formData
  const updatedFormData = { ...formData, [name]: value };

  setFormData(updatedFormData);

  // Destructure relevant fields
  const { product_name, metal_type, design_name, purity } = updatedFormData;

  if (product_name && metal_type && design_name && purity) {
    // Filter matching entries
    const matchingEntries = data.filter(
      (prod) =>
        prod.product_Name === product_name &&
        prod.metal_type === metal_type &&
        prod.design_master === design_name &&
        prod.Purity === purity
    );

    console.log("Matching Entries:", matchingEntries);

    if (matchingEntries.length > 0) {
      if (matchingEntries.length > 1) {
        // Handle multiple matching entries
        setFormData((prevData) => ({
          ...prevData,
          code: currentBarcode, // Preserve the selected barcode
          barcodeOptions: matchingEntries.map((entry) => ({
            value: entry.PCode_BarCode,
            label: entry.PCode_BarCode,
          })),
        }));
      } else if (matchingEntries.length === 1) {
        const matchingEntry = matchingEntries[0];
        const productId = matchingEntry.product_id;

        const productDetails = products.find(
          (prod) => String(prod.product_id) === String(productId)
        );

        // Set the selected form data based on the matching entry
        setFormData((prevData) => ({
          ...prevData,
          code: currentBarcode || matchingEntry.PCode_BarCode, // Use existing barcode or set the new one
          category: matchingEntry.category,
          sub_category: matchingEntry.sub_category,
          gross_weight: matchingEntry.Gross_Weight,
          stone_weight: matchingEntry.Stones_Weight || "",
          stone_price: matchingEntry.Stones_Price || "",
          weight_bw: matchingEntry.Weight_BW || "",
          va_on: matchingEntry.Wastage_On || "",
          va_percent: matchingEntry.Wastage_Percentage || "",
          wastage_weight: matchingEntry.WastageWeight || "",
          total_weight_aw: matchingEntry.TotalWeight_AW || "",
          mc_on: matchingEntry.Making_Charges_On || "",
          mc_per_gram: matchingEntry.MC_Per_Gram || "",
          making_charges: matchingEntry.Making_Charges || "",
          tax_percent: productDetails?.tax_slab || "",
          qty: 1,
          barcodeOptions: [], // Clear barcode options after setting the data
        }));
      }
    } else {
      console.log("No matching entries found. No updates made.");
    }
  } else {
    console.log("Required fields are missing or incomplete. No updates made.");
  }
};

const [isBarcodeSelected, setIsBarcodeSelected] = useState(false);

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
        va_on: "",
        va_percent: "",
        wastage_weight: "",
        total_weight_aw: "",
        mc_on: "",
        mc_per_gram: "",
        making_charges: "",
        rate: "",
        rate_amt: "",
        tax_percent: "",
        tax_amt: "",
        total_price: "",
        qty: "", // Reset qty
      }));
      setIsQtyEditable(true); // Default to editable if barcode is cleared
      return; // Exit early
    }

    // Check for product by code
    const product = products.find((prod) => String(prod.rbarcode) === String(code));
    if (product) {
      // If product found by code, populate the form and make fields editable
      setIsBarcodeSelected(true);  // Set the barcode as selected
      setFormData((prevData) => ({
        ...prevData,
        code: product.rbarcode,  // Retain the selected barcode
        product_id: product.product_id,
        product_name: "", // Make editable
        metal_type: product.Category,
        design_name: "", // Make editable
        purity: product.purity,
        category: product.product_name,
        sub_category: "",
        gross_weight: "",
        stone_weight: "",
        stone_price: "",
        weight_bw: "",
        va_on: "",
        va_percent: "",
        wastage_weight: "",
        total_weight_aw: "",
        mc_on: "",
        mc_per_gram: "",
        making_charges: "",
        tax_percent: product.tax_slab,
        qty: 1, // Set qty to 1 for product
      }));
      setIsQtyEditable(false); // Set qty as read-only
    } else {
      // Check if tag exists by code
      const tag = data.find((tag) => String(tag.PCode_BarCode) === String(code));
      if (tag) {
        setIsBarcodeSelected(true);  // Set the barcode as selected
        const productId = tag.product_id;
        const productDetails = products.find((prod) => String(prod.product_id) === String(productId));

        setFormData((prevData) => ({
          ...prevData,
          code: tag.PCode_BarCode || "", // Retain the barcode
          product_id: tag.product_id || "",
          opentag_id: tag.opentag_id || "",
          product_name: tag.product_Name || "", // Make editable
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
        }));
        setIsQtyEditable(true); // Allow editing of qty
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
          va_on: "",
          va_percent: "",
          wastage_weight: "",
          total_weight_aw: "",
          mc_on: "",
          mc_per_gram: "",
          making_charges: "",
          rate: "",
          rate_amt: "",
          tax_percent: "",
          tax_amt: "",
          total_price: "",
          qty: "", // Reset qty
        }));
        setIsQtyEditable(true); // Default to editable
      }
    }
  } catch (error) {
    console.error("Error handling code change:", error);
  }
};

return {
  formData,
  data,
  setFormData,
  products,
  isQtyEditable,
  handleChange,
  handleBarcodeChange,
  handleProductNameChange,
  filteredDesignOptions,
  filteredPurityOptions,
  filteredMetalTypes,
  uniqueProducts,
  isBarcodeSelected,
};

};

export default useProductHandlers;