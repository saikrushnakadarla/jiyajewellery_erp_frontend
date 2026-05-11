import React, { useState, useEffect, useRef } from "react";
import InputField from "../../../Pages/InputField/InputField";
import DataTable from "../../../Pages/InputField/TableLayout"; // Reusable table component
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import baseURL from "../../../../Url/NodeBaseURL";

function MetalType() {
  const [formData, setFormData] = useState({
    "metal_name": "",
    "hsn_code":"",
    "description": "",
    "default_purity": "",
    "default_purity_for_rate_entry": "",
    "default_purity_for_old_metal": "",
    "default_issue_purity": ""
  });

  const [submittedData, setSubmittedData] = useState([]); // Store submitted form entries
  const [editing, setEditing] = useState(null); // Track whether we're editing a record
  const [errors, setErrors] = useState({}); // State for tracking validation errors
  const formRef = useRef(null); // Create a reference for the form
  const containerRef = useRef(null); // Create a reference for the container

  // Fetch data from the backend API when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}/metaltype`);
        setSubmittedData(response.data); // Populate table with fetched data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Validation functions
  const validateMetalName = (value) => /^[A-Za-z\s]+$/.test(value);
  //  const validateItemType = (value) => value.trim() !== ""; 
  const validateDescription = (value) => value.trim() !== "";
  const validatePurity = (value) => /^[0-9.]+$/.test(value);


  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value; 
    switch (name) {
      case "metal_name":
        updatedValue = value.toUpperCase();
        break;
      default:
        break;
    }
    setFormData({
      ...formData,
      [name]: updatedValue,
    });
  };


  const validateForm = () => {
    const formErrors = {};

    // Validate Metal Name
    if (!validateMetalName(formData.metal_name)) {
      formErrors.metal_name = "Metal Name should contain only alphabets.";
    }

    // if (!validateItemType(formData.item_type)) {
    //   formErrors.item_type = "Item Type should contain only alphabets.";
    // }

    // Validate Description
    if (!validateDescription(formData.description)) {
      formErrors.description = "Description is required.";
    }

    // Validate Purity Fields
    ["default_purity", "default_purity_for_rate_entry", "default_purity_for_old_metal", "default_issue_purity"].forEach((field) => {
      if (!validatePurity(formData[field])) {
        formErrors[field] = "Purity should be a valid number.";
      }
    });

    // Set errors in state
    setErrors(formErrors);

    // Return true if no errors, otherwise false
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        // Send update request with the existing ID
        const response = await axios.put(`${baseURL}/metaltype/${editing}`, formData);
        console.log("Data updated:", response.data);
        alert(`Metal Type updated successfully!`);
  
        // Update the existing row instead of adding a new one
        setSubmittedData(submittedData.map((item) =>
          item.metal_type_id === editing ? { ...item, ...formData } : item
        ));
      } else {
        // Create a new metal type
        const response = await axios.post(`${baseURL}/metaltype`, formData);
        console.log("Data submitted:", response.data);
        alert(`Metal Type created successfully!`);
  
        setSubmittedData([...submittedData, { ...formData, metal_type_id: response.data.id }]);
      }
  
      setFormData({
        metal_name: '',
        hsn_code: '',
        description: '',
        default_purity: '',
        default_purity_for_rate_entry: '',
        default_purity_for_old_metal: '',
        default_issue_purity: '',
      });
  
      setEditing(null); // Reset editing state
  
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };
  

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the record with ID ${id}?`);

    if (!isConfirmed) {
      return; // Do nothing if the user cancels the action
    }

    try {
      // Send DELETE request to the backend
      await axios.delete(`${baseURL}/metaltype/${id}`);
      // Update the frontend state after successful deletion
      setSubmittedData(submittedData.filter((item) => item.metal_type_id !== id));
      console.log(`Record with ID ${id} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const handleEdit = (id) => {
    const itemToEdit = submittedData.find((item) => item.metal_type_id === id);
    setFormData({ ...itemToEdit });
    setEditing(id); // Set the current ID to editing state

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Sr. No.",
        Cell: ({ row }) => row.index + 1, // Generate a sequential number
      },
      {
        Header: "Metal Name",
        accessor: "metal_name",
      },
      // {
      //   Header: "HSN Code",
      //   accessor: "hsn_code",
      // },
      // {
      //   Header: "Item Type",
      //   accessor: "item_type",
      // },
      // {
      //   Header: "Description",
      //   accessor: "description",
      // },
      {
        Header: "Default Purity",
        accessor: "default_purity",
      },
      {
        Header: "Default Purity for Rate Entry",
        accessor: "default_purity_for_rate_entry",
      },
      {
        Header: "Default Purity for Old Metal",
        accessor: "default_purity_for_old_metal",
      },
      {
        Header: "Default Issue Purity",
        accessor: "default_issue_purity",
      },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div className="d-flex align-items-center">
            <button className="action-button edit-button" onClick={() => handleEdit(row.original.metal_type_id)}>
              <FaEdit />
            </button>
            <button
              className="action-button delete-button"
              onClick={() => handleDelete(row.original.metal_type_id)}
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    [submittedData]
  );

  return (
    <div className="main-container">
      <div className="customer-master-container">
        <h3 style={{ textAlign: 'center', marginBottom: '30px' }}>Metal Type</h3>
        <form ref={formRef} className="customer-master-form" onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="form-row">
            <InputField
              label="Metal Name"
              name="metal_name"
              value={formData.metal_name}
              onChange={handleChange}
              required={true}
              error={errors.metal_name}
              autoFocus
            />

            {/* <InputField
              label="HSN Code"
              name="hsn_code"
              value={formData.hsn_code}
              onChange={handleChange}
              required={true}
              error={errors.hsn_code}
            /> */}


            {/* <InputField
              label="Item Type:"
              name="item_type"
              value={formData.item_type}
              onChange={handleChange}
              required={true}
              error={errors.item_type}
            /> */}
            {/* <InputField
              label="Description:"
              name="description"
              value={formData.description}
              onChange={handleChange}
              // required={true}
              error={errors.description}
            />
            {errors.description && <p style={{ color: 'red', fontSize: '15px' }} className="error-message">{errors.description}</p>} */}

            <InputField
              label="Default Purity"
              name="default_purity"
              type="select"
              value={formData.default_purity}
              onChange={handleChange}
              // required={true}
              options={[
                { value: '99.9', label: '99.9%' },
                { value: '99.5', label: '99.5%' },
                { value: '95.0', label: '95.0%' },
              ]}
              error={errors.default_purity}

            />
          </div>
          {errors.default_purity && <p style={{ color: 'red', fontSize: '15px' }} className="error-message">{errors.default_purity}</p>}


          {/* Row 2 */}
          <div className="form-row">
            <InputField
              label="Default Purity for Rate Entry"
              name="default_purity_for_rate_entry"
              type="select"
              value={formData.default_purity_for_rate_entry}
              onChange={handleChange}
              // required={true}
              options={[
                { value: '99.9', label: '99.9%' },
                { value: '99.5', label: '99.5%' },
                { value: '95.0', label: '95.0%' },
              ]}
              error={errors.default_purity_for_rate_entry}

            />
            {errors.default_purity_for_rate_entry && <p style={{ color: 'red', fontSize: '15px' }} className="error-message">{errors.default_purity_for_rate_entry}</p>}

            <InputField
              label="Default Purity for Old Metal"
              name="default_purity_for_old_metal"
              type="select"
              value={formData.default_purity_for_old_metal}
              onChange={handleChange}
              // required={true}
              options={[
                { value: '99.9', label: '99.9%' },
                { value: '99.5', label: '99.5%' },
                { value: '95.0', label: '95.0%' },
              ]}
            />
            <InputField
              label="Default Issue Purity"
              name="default_issue_purity"
              type="select"
              value={formData.default_issue_purity}
              onChange={handleChange}
              // required={true}
              options={[
                { value: '99.9', label: '99.9%' },
                { value: '99.5', label: '99.5%' },
                { value: '95.0', label: '95.0%' },
              ]}
              error={errors.default_purity_for_old_metal}

            />
            {errors.default_purity_for_old_metal && <p style={{ color: 'red', fontSize: '15px' }} className="error-message">{errors.default_purity_for_old_metal}</p>}

          </div>

          <div className="sup-button-container">
            {/* <button type="button" className="cus-back-btn">
              Back
            </button> */}
            <button type="submit" className="cus-submit-btn">
              {editing ? "Update" : "Save"}
            </button>
          </div>
        </form>

        {/* Purity Table */}
        <div style={{ marginTop: '20px' }} className="purity-table-container">
          <DataTable columns={columns} data={[...submittedData].reverse()}/>
        </div>
      </div>
    </div>
  );
}

export default MetalType;
