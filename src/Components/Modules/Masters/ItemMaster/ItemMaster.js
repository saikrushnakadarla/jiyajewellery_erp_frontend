import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import InputField from "./Inputfield"; // Assuming you have this component
import StoneDetailsModal from "../../Transactions/StockEntry/StoneDetailsModal";
import "./ItemMaster.css";
import { BsCursor } from "react-icons/bs";
import baseURL from "../../../../Url/NodeBaseURL";

const FormWithTable = () => {
  const [formData, setFormData] = useState({
    product_id: "",
    metal_type_id: "",
    design_id: "",
    purity_id: "",
    Pricing: "By Weight",
    rbarcode: "",
    design_master: "",
    short_name: "",
    sale_account_head: "Sales",
    purchase_account_head: "Purchase",
    tax_slab: "03% GST",
    tax_slab_id: "",
    hsn_code: "",
    op_qty: 0,
    op_value: "",
    op_weight: 0,
    maintain_tags: false, // Default as false
    Tag_ID: "",
    Prefix: "Gold",
    item_prefix: "",
    Category: "Gold", // Set a default value for Category
    Purity: "24K",
    purity: "24K",
    PCode_BarCode: "",
    Gross_Weight: "",
    Stones_Weight: "",
    Stones_Price: "",
    WastageWeight: "",
    huid_no: "",
    HUID_No: "",
    Wastage_On: "",
    Wastage_Percentage: "",
    status: "Available",
    Source: "Tags Entry",
    Stock_Point: "",
    Weight_BW: "",
    TotalWeight_AW: "",
    MC_Per_Gram: "",
    Making_Charges_On: "",
    Making_Charges: "",
    Design_Master: "gold",
    product_name: "",
    selling_price: "",
    making_on: "",
    dropdown: ""
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const [openTagsEntries, setOpenTagsEntries] = useState([]);
  const navigate = useNavigate();
  const [isMaintainTagsChecked, setIsMaintainTagsChecked] = useState(false);
  const [isSellingPriceDisabled, setIsSellingPriceDisabled] = useState(false);
  const [areOtherFieldsDisabled, setAreOtherFieldsDisabled] = useState(false);

  const isByFixedSelected = formData.Pricing === "By Fixed";
  const handleUpdateStoneDetails = (totalWeight, totalPrice) => {
    setFormData({
      ...formData,
      Stones_Weight: totalWeight.toFixed(2),
      Stones_Price: totalPrice.toFixed(2),
    });
  };

  const handleCheckboxChange = () => {
    setIsMaintainTagsChecked((prev) => {
      const newCheckedState = !prev;
      setFormData((prevFormData) => ({
        ...prevFormData,
        maintain_tags: newCheckedState, // Update maintain_tags in formData
      }));
      return newCheckedState;
    });
  };

  const maintainTagsStyle = !isMaintainTagsChecked
    ? {}
    : { backgroundColor: "#f5f5f5", color: "#888", };

  const openingTagsStyle = isMaintainTagsChecked
    ? {}
    : { backgroundColor: "#f5f5f5", color: "#888", cursor: "not-allowed" };

    const handleChange = (e) => {
      const { name, value } = e.target;
  
      // Capitalize the first letter of 'hsn_code' specifically
      let updatedValue = value;
  
      if (name === 'hsn_code' && value) {
          updatedValue = value.charAt(0).toUpperCase() + value.slice(1); // Capitalize the first letter of hsn_code
      }
  
      // Automatically convert the value to uppercase for product_name and other fields if needed
      if (name === 'product_name') {
          updatedValue = value.toUpperCase();
      }
  
      setFormData(prevState => ({
          ...prevState,
          [name]: updatedValue, // Update the formData with the modified value
      }));
  
      // Handle logic for other fields
      if (name === "design_master") {
          const selectedOption = designOptions.find(option => option.value === updatedValue);
          setFormData({
              ...formData,
              [name]: updatedValue,
              design_id: selectedOption ? selectedOption.id : "" // Update design_id
          });
      } else if (name === "purity") {
          const selectedOption = dropdownOptions.find(option => option.value === updatedValue);
          setFormData({
              ...formData,
              [name]: updatedValue,
              purity_id: selectedOption ? selectedOption.id : "" // Update purity_id
          });
      } else if (name === "Category") {
          const selectedOption = metalOptions.find(option => option.value === updatedValue);
          setFormData({
              ...formData,
              [name]: updatedValue,
              metal_type_id: selectedOption ? selectedOption.id : "" // Update metal_type_id
          });
      }
  
      if (name === "Pricing") {
          if (updatedValue === "By Weight") {
              setIsSellingPriceDisabled(true);
              setAreOtherFieldsDisabled(false);
          } else if (updatedValue === "By Fixed") {
              setIsSellingPriceDisabled(false);
              setAreOtherFieldsDisabled(true);
          } else {
              setIsSellingPriceDisabled(false);
              setAreOtherFieldsDisabled(false);
          }
      }
  
      if (name === "tax_slab") {
          const selectedTaxSlab = taxOptions.find((option) => option.value === updatedValue);
          if (selectedTaxSlab) {
              setFormData((prevState) => ({
                  ...prevState,
                  [name]: updatedValue,
                  tax_slab_id: selectedTaxSlab.id, // Store the TaxSlabID
              }));
          }
      }
  
      // Automatically update PCode_BarCode when item_prefix changes
      if (name === "item_prefix") {
          setFormData((prev) => ({
              ...prev,
              [name]: updatedValue,
              PCode_BarCode: `${updatedValue}${prev.suffix || "001"}`,
          }));
  
          // Prevent "RB" or "rb" (case insensitive) as input for "item_prefix"
          if (updatedValue.toLowerCase() === "rb") {
              alert("The value 'RB' is not allowed for Item Prefix.");
              setFormData((prev) => ({ ...prev, item_prefix: "", PCode_BarCode: "" })); // Reset field value
              return;
          }
      }
  };
  
  



  const handleDeleteOpenTagEntry = (index) => {
    setOpenTagsEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditOpenTagEntry = (index) => {
    const entryToEdit = openTagsEntries[index];
    setFormData(entryToEdit); // Populate the form with the selected entry
    setEditingIndex(index); // Save the index for the update operation
  };


  const handleUpdateOpenTagEntry = (e) => {
    e.preventDefault();

    if (editingIndex !== null) {
      const updatedEntries = [...openTagsEntries];
      updatedEntries[editingIndex] = formData; // Update the selected entry
      setOpenTagsEntries(updatedEntries);
      setEditingIndex(null); // Reset editing index

      // Reset form fields
      setFormData({
        Pricing: "",
        Tag_ID: "",
        Prefix: "Gold",
        Category: "",
        Purity: "",
        PCode_BarCode: "",
        Gross_Weight: "",
        Stones_Weight: "",
        Stones_Price: "",
        WastageWeight: "",
        HUID_No: "",
        Wastage_On: "",
        Wastage_Percentage: "",
        status: "",
        Source: "",
        Stock_Point: "",
        Weight_BW: "",
        TotalWeight_AW: "",
        MC_Per_Gram: "",
        Making_Charges_On: "",
        Making_Charges: "",
        Design_Master: "",
      });
    }
  };

  useEffect(() => {
    const grossWeight = parseFloat(formData.Gross_Weight) || 0;
    const stonesWeight = parseFloat(formData.Stones_Weight) || 0;
    const weightBW = grossWeight - stonesWeight;

    setFormData((prev) => ({
      ...prev,
      Weight_BW: weightBW.toFixed(2), // Ensures two decimal places
    }));
  }, [formData.Gross_Weight, formData.Stones_Weight]);
  // Automatically calculate WastageWeight and TotalWeight_AW
  useEffect(() => {
    const wastagePercentage = parseFloat(formData.Wastage_Percentage) || 0;
    const grossWeight = parseFloat(formData.Gross_Weight) || 0;
    const weightBW = parseFloat(formData.Weight_BW) || 0;

    let wastageWeight = 0;
    let totalWeight = 0;

    if (formData.Wastage_On === "Gross Weight") {
      wastageWeight = (grossWeight * wastagePercentage) / 100;
      totalWeight = weightBW + wastageWeight;
    } else if (formData.Wastage_On === "Weight BW") {
      wastageWeight = (weightBW * wastagePercentage) / 100;
      totalWeight = weightBW + wastageWeight;
    }

    setFormData((prev) => ({
      ...prev,
      WastageWeight: wastageWeight.toFixed(2),
      TotalWeight_AW: totalWeight.toFixed(2),
    }));
  }, [formData.Wastage_On, formData.Wastage_Percentage, formData.Gross_Weight, formData.Weight_BW]);

  const handleMakingChargesCalculation = () => {
    const grossWeight = parseFloat(formData.Gross_Weight) || 0; // Use Gross Weight
    const mcPerGram = parseFloat(formData.MC_Per_Gram) || 0;
    const makingCharges = parseFloat(formData.Making_Charges) || 0;

    if (formData.Making_Charges_On === "By Weight") {
      const calculatedMakingCharges = grossWeight * mcPerGram;
      setFormData((prev) => ({
        ...prev,
        Making_Charges: calculatedMakingCharges.toFixed(2),
      }));
    } else if (formData.Making_Charges_On === "Fixed") {
      const calculatedMcPerGram = grossWeight > 0 ? makingCharges / grossWeight : 0; // Avoid division by zero
      setFormData((prev) => ({
        ...prev,
        MC_Per_Gram: calculatedMcPerGram.toFixed(2),
      }));
    }
  };


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

  useEffect(() => {
    handleMakingChargesCalculation();
  }, [formData.Making_Charges_On, formData.MC_Per_Gram, formData.Making_Charges, formData.TotalWeight_AW]);

  const handleAddOpenTagEntry = (e) => {
    e.preventDefault();

    // Extract current suffix and calculate the next one
    const currentSuffix = parseInt(formData.suffix || "001", 10);
    const nextSuffix = (currentSuffix + 1).toString().padStart(3, "0");

    const newEntry = {
      Pricing: formData.Pricing,
      PCode_BarCode: formData.PCode_BarCode,
      Gross_Weight: formData.Gross_Weight,
      Stones_Weight: formData.Stones_Weight,
      Stones_Price: formData.Stones_Price,
      WastageWeight: formData.WastageWeight,
      HUID_No: formData.HUID_No,
      Wastage_On: formData.Wastage_On,
      Wastage_Percentage: formData.Wastage_Percentage,
      status: formData.status || "Available",
      Source: formData.Source || "Tag Entry",
      Stock_Point: formData.Stock_Point,
      Weight_BW: formData.Weight_BW,
      TotalWeight_AW: formData.TotalWeight_AW,
      MC_Per_Gram: formData.MC_Per_Gram,
      Making_Charges_On: formData.Making_Charges_On,
      Making_Charges: formData.Making_Charges,
      dropdown: formData.dropdown,
      selling_price: formData.selling_price,
    };

    // Update the `op_qty` and `op_weight` fields
    setFormData((prev) => ({
      ...prev,
      op_qty: prev.op_qty + 1, // Increment op_qty
      op_weight: parseFloat(prev.op_weight || 0) + parseFloat(formData.Gross_Weight || 0), // Add Gross_Weight
    }));

    // Add the new entry to the table
    setOpenTagsEntries((prev) => [...prev, newEntry]);

    // Reset the form fields and update the suffix and PCode_BarCode
    setFormData((prev) => ({
      ...prev,
      Pricing: "",
      Tag_ID: "",
      Prefix: "Gold",
      Purity: "",
      PCode_BarCode: `${prev.item_prefix || ""}${nextSuffix}`,
      suffix: nextSuffix, // Update the suffix
      Gross_Weight: "",
      Stones_Weight: "",
      Stones_Price: "",
      WastageWeight: "",
      HUID_No: "",
      Wastage_On: "",
      Wastage_Percentage: "",
      status: "Available",
      Source: "",
      Stock_Point: "",
      Weight_BW: "",
      TotalWeight_AW: "",
      MC_Per_Gram: "",
      Making_Charges_On: "",
      Making_Charges: "",
      Design_Master: "",
    }));
  };

  // Save the product and related entries
  const handleSave = async () => {
    try {
      const { product_name, Category, purity, metal_type_id, design_id } = formData;

      // Check if the product exists
      const checkResponse = await axios.post(`${baseURL}/api/check-and-insert`, {
        product_name,
        Category,
        purity,
      });

      if (checkResponse.data.exists) {
        alert('This category already exists.');
        return;
      }

      // Debugging: Log purity and dropdownOptions
      console.log("Selected purity:", purity);
      console.log("Dropdown options:", dropdownOptions);

      // Ensure Category and other fields are not empty
      const updatedFormData = {
        ...formData,
        Category: formData.Category || "Gold",
        purity_id: purity ? dropdownOptions.find(option => option.value === purity)?.id || null : null, // Default to null if not found
      };

      // if (!updatedFormData.purity_id) {
      //   alert("Invalid purity selected. Please try again.");
      //   return;
      // }

      // Save product details, now including design_id and purity_id
      const productResponse = await axios.post(`${baseURL}/post/products`, updatedFormData);
      const { product_id } = productResponse.data;

      // Append product_id to openTagsEntries
      const entriesWithProductId = openTagsEntries.map((entry) => ({
        ...entry,
        product_id,
        product_Name: product_name,
      }));

      // Save opening tag entries
      const saveEntriesPromises = entriesWithProductId.map((entry) =>
        axios.post(`${baseURL}/post/opening-tags-entry`, entry)
      );

      await Promise.all(saveEntriesPromises);
      alert("Category added successfully!");
      const from = location.state?.from || "/itemmastertable";
      navigate(from);
      // Reset the form fields
      setFormData({
        product_name: "",
        rbarcode: "",
        Category: "",
        design_master: "",
        purity: "",
        design_id: "",
        purity_id: "",
        metal_type_id: "",
        item_prefix: "",
        short_name: "",
        sale_account_head: "Sale",
        purchase_account_head: "Purchase",
        status: "",
        tax_slab: "",
        tax_slab_id: "",
        hsn_code: "",
        op_qty: "0",
        op_value: "",
        op_weight: "0",
        huid_no: "",
      });

      // Clear the tag entries
      setOpenTagsEntries([]);
      // Refresh the window
      // window.location.reload();
      setIsMaintainTagsChecked(false); // Reset checkbox
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data. Please try again.");

    }
  };


  const location = useLocation();

  const handleBack = () => {
    const from = location.state?.from || "/itemmastertable";
    navigate(from);
  };

  const [metalOptions, setmetalOptions] = useState([]);
  const [designOptions, setdesignOptions] = useState([]);
  const [dropdownOptions, setDropdownOptions] = useState([]);
  useEffect(() => {
    const fetchMetalTypes = async () => {
      try {
        const response = await axios.get(`${baseURL}/metaltype`);
        const metalTypes = response.data.map(item => ({
          value: item.metal_name,
          label: item.metal_name,
          id: item.metal_type_id, // Add metal_type_id for reference
          hsn_code: item.hsn_code,
        }));
        setmetalOptions(metalTypes);
      } catch (error) {
        console.error('Error fetching metal types:', error);
      }
    };

    fetchMetalTypes();
  }, []);

  // Fetch design master options from the API
  useEffect(() => {
    const fetchDesignMaster = async () => {
      try {
        const response = await axios.get(`${baseURL}/designmaster`);
        const designMasters = response.data.map((item) => {
          console.log('Design ID:', item.design_id); // Log design_id
          return {
            value: item.design_name, // Assuming the column name is "design_name"
            label: item.design_name,
            id: item.design_id, // Assuming the column name is "design_id"
          };
        });
        setdesignOptions(designMasters);
      } catch (error) {
        console.error('Error fetching design masters:', error);
      }
    };

    fetchDesignMaster();
  }, []);

  // Fetch purity options from the API
  useEffect(() => {
    const fetchPurity = async () => {
      try {
        const response = await axios.get(`${baseURL}/purity`);
        const purityOptions = response.data.map(item => ({
          value: item.name, // Assuming the column name is "name"
          label: item.name,
          id: item.purity_id, // Assuming the column name is "purity_id"
          metal: item.metal, // Assuming "metal" is the column for related metal type
        }));
        setDropdownOptions(purityOptions);
      } catch (error) {
        console.error('Error fetching purity options:', error);
      }
    };

    fetchPurity();
  }, []);
  const [filteredPurityOptions, setFilteredPurityOptions] = useState([]);
  useEffect(() => {
    // Filter purity options based on selected metal type
    if (formData.Category) {
      const filteredPurityOptions = dropdownOptions.filter(
        option => option.metal === formData.Category
      );
      setFilteredPurityOptions(filteredPurityOptions); // Add a state for filtered purity options
    } else {
      setFilteredPurityOptions([]); // Reset if no metal type is selected
    }
  }, [formData.Category, dropdownOptions]);


  useEffect(() => {
    const fetchLastRbarcode = async () => {
      try {
        const response = await axios.get(`${baseURL}/last-rbarcode`);
        setFormData((prev) => ({
          ...prev,
          rbarcode: response.data.lastrbNumbers,
        }));
      } catch (error) {
        console.error("Error fetching estimate number:", error);
      }
    };

    fetchLastRbarcode();
  }, []);


  useEffect(() => {
    const getLastPcode = async () => {
      try {
        const response = await axios.get(`${baseURL}/last-pbarcode`);
        const suffix = response.data.lastPCode_BarCode || "001"; // Fallback to "001" if no value is fetched
        setFormData((prev) => ({
          ...prev,
          PCode_BarCode: `${prev.item_prefix || ""}${suffix}`,
          suffix, // Store the suffix for future use
        }));
      } catch (error) {
        console.error("Error fetching last PCode_BarCode:", error);
      }
    };

    getLastPcode();
  }, []);


  return (
    <div style={{ paddingTop: "100px" }}>
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            {/* Tab Navigation */}
          </div>
        </div>
        <div className="row mt-3 itemmaster-form-container">
          <div className="col-12" style={{ marginTop: '-55px' }}>

            {/* product details dection */}
            <div className="form-container">
              <h4 style={{ marginBottom: "15px" }}>Category Details</h4>
              <div className="form-row">
                <InputField
                  label="Metal Type:"
                  name="Category"
                  type="select"
                  value={formData.Category}
                  onChange={handleChange}
                  options={metalOptions.map(option => ({ value: option.value, label: option.label }))}
                  autoFocus
                />
                <InputField
                  label="Category:"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                />
                <InputField
                  label="Rbarcode:"
                  name="rbarcode"
                  value={formData.rbarcode}
                  onChange={handleChange}

                />

                {/* <InputField
                  label="Design Master:"
                  name="design_master"
                  type="select"
                  value={formData.design_master}
                  onChange={handleChange}
                  options={designOptions.map(option => ({ value: option.value, label: option.label }))}
                /> */}


                {/* <InputField
                  label="Purity:"
                  name="purity"
                  type="select"
                  value={formData.purity}
                  onChange={handleChange}
                  options={filteredPurityOptions.map(option => ({ value: option.value, label: option.label }))}
                /> */}
                {/* <InputField
                  label="Item Prefix:"
                  name="item_prefix"
                  value={formData.item_prefix}
                  onChange={handleChange}
                /> */}
              </div>
              <div className="form-row">
                {/* <InputField
                  label="Short Name:"
                  name="short_name"
                  value={formData.short_name}
                  onChange={handleChange}
                /> */}
                <InputField
                  label="Tax Slab:"
                  name="tax_slab"
                  type="select"
                  value={formData.tax_slab}
                  onChange={handleChange}
                  options={taxOptions}
                />
                <InputField
                  label="HSN Code:"
                  name="hsn_code"
                  value={formData.hsn_code}
                  onChange={handleChange}
                // readOnly
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  className="cus-back-btn"
                  variant="secondary"
                  onClick={handleBack}
                  style={{ backgroundColor: 'gray', marginRight: '10px' }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>

          </div>


        </div>
      </div>
    </div>
  );
};

export default FormWithTable;