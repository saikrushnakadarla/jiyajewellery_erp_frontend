
import React, { useState, useEffect, useRef } from "react";
import InputField from "../../../Pages/InputField/InputField";
import DataTable from "../../../Pages/InputField/TableLayout"; // Reusable table component
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import baseURL from "../../../../Url/NodeBaseURL";


// Custom validation functions
const validateName = (name) => /^[a-zA-Z0-9\s]+$/.test(name); // Allows alphabets, numbers, and spaces
const validateMetal = (metal) => /^[a-zA-Z\s]+$/.test(metal); // Only alphabets and spaces
const validatePurityPercentage = (purity_percentage) =>
  /^[0-9]*\.?[0-9]{0,2}$/.test(purity_percentage);
const validatePurity = (purity) => purity === "" || /^[a-zA-Z0-9\s]+$/.test(purity); // Allow empty string
const validateURDPurity = (urd_purity) => urd_purity === "" || /^[a-zA-Z0-9\s]+$/.test(urd_purity); // Allow empty string
const validateDescription = (desc) => desc === "" || desc.trim() !== ""; // Allow empty, but non-whitespace is required
const validateOldPurityDesc = (old_purity_desc) => old_purity_desc === "" || old_purity_desc.trim() !== ""; // Allow empty string
const validateCutIssue = (cut_issue) => cut_issue === "" || cut_issue.trim() !== ""; // Allow empty string
const validateSkinPrint = (skin_print) => skin_print === "" || skin_print.trim() !== ""; // Allow empty string

function Purity() {
  const [formData, setFormData] = useState({
    name: "",
    metal: "",
    purity_percentage: "",
    purity: "",
    urd_purity: "",
    desc: "",
    old_purity_desc: "",
    cut_issue: "",
    skin_print: "",
  });
  const formRef = useRef(null); // Create a reference for the form
  const containerRef = useRef(null); // Create a reference for the container

  const [submittedData, setSubmittedData] = useState([]); // Store fetched and submitted form entries
  const [editMode, setEditMode] = useState(false); // Toggle between add and edit modes
  const [editId, setEditId] = useState(null); // Store ID of the record being edited
  const [errors, setErrors] = useState({}); // Store validation errors

  // Fetch data from the backend API when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}/purity`);
        setSubmittedData(response.data); // Populate table with fetched data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const validateForm = () => {
        let formErrors = {};
    
        // Validations for each input field
        if (!validateName(formData.name)) {
          formErrors.name = "Name should contain only letters, numbers, and spaces.";
        }
        if (!validateMetal(formData.metal)) {
          formErrors.item_name = "Metal should contain only alphabets.";
        }
        if (!validatePurityPercentage(formData.purity_percentage)) {
          formErrors.purity_percentage = "Purity Percentage should be a number (up to 2 decimals).";
        }
        if (!validatePurity(formData.purity)) {
          formErrors.purity = "Purity should contain alphanumeric characters.";
        }
        if (!validateURDPurity(formData.urd_purity)) {
          formErrors.urd_purity = "URD Purity should contain alphanumeric characters.";
        }
        if (!validateDescription(formData.desc)) {
          formErrors.desc = "Description is required.";
        }
        if (!validateOldPurityDesc(formData.old_purity_desc)) {
          formErrors.old_purity_desc = "Old Purity Description is required.";
        }
        if (!validateCutIssue(formData.cut_issue)) {
          formErrors.cut_issue = "Cut Issue is required.";
        }
        if (!validateSkinPrint(formData.skin_print)) {
          formErrors.skin_print = "Skin Print is required.";
        }
    
        setErrors(formErrors);
        return Object.keys(formErrors).length === 0; // If no errors, return true
      };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editMode) {
      try {
        const response = await axios.put(`${baseURL}/purity/${editId}`, formData);
        console.log("Data updated:", response.data);
        setSubmittedData(
          submittedData.map((item) =>
            item.purity_id === editId ? { ...formData, purity_id: editId } : item
          )
        );

        resetForm();
        alert(`Purity updated successfully!`);
      } catch (error) {
        console.error("Error updating data:", error);
      }
    } else {
      try {
        const response = await axios.post(`${baseURL}/purity`, formData);
        console.log("Data submitted:", response.data);
        setSubmittedData([...submittedData, { ...formData, purity_id: response.data.id }]);
        resetForm();
        alert(`Purity created successfully!`);
      } catch (error) {
        console.error("Error submitting data:", error);
      }
    }
  };

  const handleEdit = (row) => {
    setEditMode(true);
    setEditId(row.purity_id); // Set the ID of the record being edited
    setFormData({ ...row }); // Pre-fill the form with the selected record's data
    setErrors({}); // Clear any previous errors

    // Scroll to the form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the record with ID ${id}?`);

    if (!isConfirmed) {
      return; // Do nothing if the user cancels the action
    }

    try {
      await axios.delete(`${baseURL}/purity/${id}`);
      setSubmittedData(submittedData.filter((item) => item.purity_id !== id));
      console.log(`Record with ID ${id} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      metal: "",
      purity_percentage: "",
      purity: "",
      urd_purity: "",
      desc: "",
      old_purity_desc: "",
      cut_issue: "",
      skin_print: "",
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
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Metal",
        accessor: "metal",
      },
      {
        Header: "Purity Percentage",
        accessor: "purity_percentage",
      },
      {
        Header: "Purity",
        accessor: "purity",
      },
      {
        Header: "URD Purity",
        accessor: "urd_purity",
      },
      {
        Header: "DESC",
        accessor: "desc",
      },
      {
        Header: "Old Purity Desc",
        accessor: "old_purity_desc",
      },
      {
        Header: "Cut Issue",
        accessor: "cut_issue",
      },
      {
        Header: "Skin Print",
        accessor: "skin_print",
      },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div className="d-flex align-items-center">
            <button
              className="action-button edit-button"
              onClick={() => handleEdit(row.original)}
            >
              <FaEdit />
            </button>
            <button
              className="action-button delete-button"
              onClick={() => handleDelete(row.original.purity_id)}
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
        <h3 style={{ textAlign: "center", marginBottom: "30px" }}>
          {editMode ? "Edit Purity" : "Add Purity"}
        </h3>
        <form ref={formRef} className="customer-master-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <InputField
              label="Name:"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required={true}
              error={errors.name}
            />
            <InputField
              label="Metal:"
              name="metal"
              value={formData.metal}
              onChange={handleChange}
              required={true}
              error={errors.metal}
            />
            <InputField
              label="Purity Percentage:"
              name="purity_percentage"
              value={formData.purity_percentage}
              onChange={handleChange}
              required={true}
              error={errors.purity_percentage}
            />
            <InputField
              label="Purity:"
              name="purity"
              value={formData.purity}
              onChange={handleChange}
              required={true}
              error={errors.purity}
            />
          </div>
          <div className="form-row">
            <InputField
              label="URD Purity:"
              name="urd_purity"
              value={formData.urd_purity}
              onChange={handleChange}
              required={true}
              error={errors.urd_purity}
            />
            <InputField
              label="DESC:"
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              required={true}
              error={errors.desc}
            />
            <InputField
              label="Old Purity Desc:"
              name="old_purity_desc"
              value={formData.old_purity_desc}
              onChange={handleChange}
              required={true}
              error={errors.old_purity_desc}
            />
            <InputField
              label="Cut Issue:"
              name="cut_issue"
              value={formData.cut_issue}
              onChange={handleChange}
              required={true}
              error={errors.cut_issue}
            />
            <InputField
              label="Skin Print:"
              name="skin_print"
              value={formData.skin_print}
              onChange={handleChange}
              required={true}
              error={errors.skin_print}
            />
          </div>
          <div className="sup-button-container">
            <button type="submit" className="cus-submit-btn">
              {editMode ? "Update" : "Save"}
            </button>
          </div>
        </form>
        <div style={{ marginTop: "20px" }} className="purity-table-container">
          <DataTable columns={columns} data={[...submittedData].reverse()} />
        </div>
      </div>
    </div>
  );
}

export default Purity;