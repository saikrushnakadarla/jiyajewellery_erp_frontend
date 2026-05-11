
import React, { useState, useEffect } from "react";
import InputField from "../../../Pages/InputField/InputField";
import DataTable from "../../../Pages/InputField/TableLayout"; // Reusable table component
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import baseURL from "../../../../Url/NodeBaseURL";

  // Example validation functions (These should match your actual validation logic)
  const validateMetal = (value) => /^[a-zA-Z]+$/.test(value); // Only alphabets
  const validateShortId = (value) => /^[a-zA-Z0-9]+$/.test(value); // Alphanumeric characters
  const validateItemType = (value) => value.trim() !== ""; // Not empty
  const validateDesignItem = (value) => /^[a-zA-Z]+$/.test(value); // Only alphabets
  const validateDesignName = (value) => /^[a-zA-Z]+$/.test(value); // Only alphabets
  const validateWastagePercentage = (value) => !isNaN(value) && value >= 0 && value <= 100; // Valid percentage
  const validateMakingCharge = (value) => !isNaN(value); // Valid number
  const validateDesignShortCode = (value) => /^[a-zA-Z0-9]+$/.test(value); // Alphanumeric characters
  const validateBrandCategory = (value) => value.trim() !== ""; // Not empty
  const validateMcType = (value) => value.trim() !== ""; // Not empty

function DesignMaster() {
  const [formData, setFormData] = useState({
    metal: '',
    short_id: '',
    item_type: '',
    design_item: '',
    design_name: '',
    wastage_percentage: '',
    making_charge: '',
    design_short_code: '',
    brand_category: '',
    mc_type: '',
  });

  const [submittedData, setSubmittedData] = useState([]); // Store fetched and submitted form entries
  const [editMode, setEditMode] = useState(false); // Toggle between add and edit modes
  const [editId, setEditId] = useState(null); // Store ID of the record being edited
  const [errors, setErrors] = useState({}); // Store validation errors


  // Fetch data from the backend API when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}/designmaster`);
        setSubmittedData(response.data); // Populate table with fetched data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Handle change function
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update formData state
    setFormData({
      ...formData,
      [name]: value,
    });

    // Initialize a variable to store error message for the field
    let error = "";

    // Validate field based on its name
    if (name === "metal" && !validateMetal(value)) {
      error = "Invalid Metal  (only alphabets allowed)";
    } else if (name === "short_id" && !validateShortId(value)) {
      error = "Invalid Short ID (only alphanumeric characters allowed)";
    } else if (name === "item_type" && !validateItemType(value)) {
      error = "Item Type is required";
    } else if (name === "design_item" && !validateDesignItem(value)) {
      error = "Invalid Design Item (only alphabets allowed)";
    } else if (name === "design_name" && !validateDesignName(value)) {
      error = "Invalid Design Name (only alphabets allowed)";
    } else if (name === "wastage_percentage" && !validateWastagePercentage(value)) {
      error = "Invalid Wastage Percentage (valid number required)";
    } else if (name === "making_charge" && !validateMakingCharge(value)) {
      error = "Invalid Making Charge (valid number required)";
    } else if (name === "design_short_code" && !validateDesignShortCode(value)) {
      error = "Invalid Design Short Code (only alphanumeric characters allowed)";
    } else if (name === "brand_category" && !validateBrandCategory(value)) {
      error = "Brand/Category is required";
    } else if (name === "mc_type" && !validateMcType(value)) {
      error = "MC Type is required";
    }

    // Update error state for the specific field
    setErrors({
      ...errors,
      [name]: error,
    });
  };


  const validateForm = () => {
    const newErrors = {};

    // Apply each validation function to the respective form fields
    if (!validateMetal(formData.metal)) newErrors.metal = "Invalid Metal (only alphabets allowed)";
    if (!validateShortId(formData.short_id)) newErrors.short_id = "Invalid Short ID (only alphanumeric characters allowed)";
    if (!validateItemType(formData.item_type)) newErrors.item_type = "Item Type is required";
    if (!validateDesignItem(formData.design_item)) newErrors.design_item = "Invalid Design Item (only alphabets allowed)";
    if (!validateDesignName(formData.design_name)) newErrors.design_name = "Invalid Design Name (only alphabets allowed)";
    if (!validateWastagePercentage(formData.wastage_percentage)) newErrors.wastage_percentage = "Invalid Wastage Percentage (valid number required)";
    if (!validateMakingCharge(formData.making_charge)) newErrors.making_charge = "Invalid Making Charge (valid number required)";
    if (!validateDesignShortCode(formData.design_short_code)) newErrors.design_short_code = "Invalid Design Short Code (only alphanumeric characters allowed)";
    if (!validateBrandCategory(formData.brand_category)) newErrors.brand_category = "Brand/Category is required";
    if (!validateMcType(formData.mc_type)) newErrors.mc_type = "MC Type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // If no errors, form is valid
  };

  const [metalOptions, setmetalOptions] = useState([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editMode) {
      // Edit functionality
      try {
        const response = await axios.put(`${baseURL}/designmaster/${editId}`, formData);
        console.log("Data updated:", response.data);

        // Update the table with the edited data
        setSubmittedData(
          submittedData.map((item) =>
            item.design_id === editId ? { ...formData, design_id: editId } : item
          )
        );
        alert(`Design Name updated successfully!`);
        resetForm();
      } catch (error) {
        console.error("Error updating data:", error);
      }
    } else {
      // Add functionality
      try {
        const response = await axios.post(`${baseURL}/designmaster`, formData);
        console.log("Data submitted:", response.data);

        // Update the table with the new data
        setSubmittedData([...submittedData, { ...formData, design_id: response.data.id }]);

        alert(`Design Name added successfully!`);
        resetForm();
      } catch (error) {
        console.error("Error submitting data:", error);
      }
    }
  };

  const handleEdit = (row) => {
    setEditMode(true);
    setEditId(row.design_id); // Set the ID of the record being edited
    setFormData({ ...row }); // Pre-fill the form with the selected record's data
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the record with ID ${id}?`);

    if (!isConfirmed) {
      return; // Do nothing if the user cancels the action
    }

    try {
      // Send DELETE request to the backend
      await axios.delete(`${baseURL}/designmaster/${id}`);
      // Update the frontend state after successful deletion
      setSubmittedData(submittedData.filter((item) => item.design_id !== id));
      console.log(`Record with ID ${id} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      metal: '',
      short_id: '',
      item_type: '',
      design_item: '',
      design_name: '',
      wastage_percentage: '',
      making_charge: '',
      design_short_code: '',
      brand_category: '',
      mc_type: '',
    });
    setEditMode(false);
    setEditId(null);
    setErrors({});

  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Sr. No.",
        Cell: ({ row }) => row.index + 1, // Generate a sequential number
      },
      {
        Header: "Metal ",
        accessor: "metal",
      },
      {
        Header: "Short Id",
        accessor: "short_id",
      },
      {
        Header: "Item Type",
        accessor: "item_type",
      },
      // {
      //   Header: "Design Item",
      //   accessor: "design_item",
      // },
      {
        Header: "Design Name",
        accessor: "design_name",
      },
     
      {
        Header: "Wastage Percentage",
        accessor: "wastage_percentage",
      },
      {
        Header: "Making Charge",
        accessor: "making_charge",
      },
      {
        Header: "Design Short Code",
        accessor: "design_short_code",
      },
      {
        Header: "Brand/Category",
        accessor: "brand_category",
      },
      {
        Header: "MC Type",
        accessor: "mc_type",
      },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div>
            <FaEdit
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue', }}
              onClick={() => handleEdit(row.original)}
            />
            <FaTrash
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'red', }}
              onClick={() => handleDelete(row.original.design_id)}
            />
          </div>
        ),
      },
    ],
    [submittedData]
  );

  return (
    <div className="main-container">
      <div className="customer-master-container">
        <h3 style={{ textAlign: "center", marginBottom: "30px" }}>
          {editMode ? " DesignMaster" : " DesignMaster"}
        </h3>
        <form className="customer-master-form" onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="form-row">
           
            <InputField
                  label="Metal Type"
                  name="metal"
                  type="select"
                  value={formData.metal}
                  onChange={handleChange}
                  options={metalOptions.map(option => ({ value: option.value, label: option.label }))}
                  error={errors.metal}
                  autoFocus
                />
            
            <InputField
              label="Short Id"
              name="short_id"
              value={formData.short_id}
              onChange={handleChange}
              // required={true}
              error={errors.short_id}

            />

         
            <InputField
              label="Item Type"
              name="item_type"
              value={formData.item_type}
              onChange={handleChange}
              // required={true}
            
              error={errors.item_type}

            />

            {/* <InputField
              label="Design Item"
              name="design_item"
              value={formData.design_item}
              onChange={handleChange}
              // required={true}
              error={errors.design_item}

            /> */}

            <InputField
              label="Design Name"
              name="design_name"
              value={formData.design_name}
              onChange={handleChange}
              required={true}
              error={errors.design_name}

            />

          </div>

          {/* Row 2 */}
          <div className="form-row">
            <InputField
              label="Wastage %"
              name="wastage_percentage"
              value={formData.wastage_percentage}
              onChange={handleChange}
              // required={true}
              error={errors.wastage_percentage}

            />

            <InputField
              label="Making Charge"
              name="making_charge"
              value={formData.making_charge}
              onChange={handleChange}
              // required={true}
              error={errors.making_charge}

            />

            <InputField
              label="Design Short Code"
              name="design_short_code"
              value={formData.design_short_code}
              onChange={handleChange}
              // required={true}
              error={errors.design_short_code}

            />

            <InputField
              label="Brand/Category"
              name="brand_category"
              value={formData.brand_category}
              onChange={handleChange}
              // required={true}
            
              error={errors.brand_category}

            />

            <InputField
              label="MC Type"
              name="mc_type"
              type="select"
              value={formData.mc_type}
              onChange={handleChange}
              // required={true}
              options={[
                { value: 'By Fixed', label: 'By Fixed' },
                { value: 'By Weight', label: 'By Weight' },
              ]}
              error={errors.mc_type}

            />

          </div>

          <div className="sup-button-container">
            {/* <button type="button" className="cus-back-btn" onClick={resetForm}>
              Cancel
            </button> */}
            <button type="submit" className="cus-submit-btn">
              {editMode ? "Update" : "Save"}
            </button>
          </div>
        </form>

        {/* Purity Table */}
        <div style={{ marginTop: "20px" }} className="purity-table-container">
          <DataTable columns={columns}  data={[...submittedData].reverse()} />
        </div>
      </div>
    </div>
  );
}

export default DesignMaster;
