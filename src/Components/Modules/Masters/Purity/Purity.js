import React, { useState, useEffect, useRef  } from "react";
import InputField from "../../../Pages/InputField/InputField";
import DataTable from "../../../Pages/InputField/TableLayout"; // Reusable table component
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import baseURL from "../../../../Url/NodeBaseURL";

function Purity() {
  const [formData, setFormData] = useState({
    "name": "",
    "metal": "",
    "purity_percentage": "",
    "purity": "",
    "urd_purity": "",
    "desc": "",
    "old_purity_desc": "",
    "cut_issue": "",
    "skin_print": ""
  });
  const formRef = useRef(null);
  const [submittedData, setSubmittedData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
 
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
    let updatedValue = value; 
    switch (name) {
      case "name":
        updatedValue = value.toUpperCase();
        break;
      case "metal":
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editMode) {
      // Edit functionality
      try {
        const response = await axios.put(`${baseURL}/purity/${editId}`, formData);
        console.log("Data updated:", response.data);

        // Update the table with the edited data
        setSubmittedData(
          submittedData.map((item) =>
            item.purity_id === editId ? { ...formData, purity_id: editId } : item
          )
        );

        // Reset the form and exit edit mode
        resetForm();
        alert(`Purity updated successfully!`);
      } catch (error) {
        console.error("Error updating data:", error);
      }
    } else {
      // Add functionality
      try {
        const response = await axios.post( `${baseURL}/purity`, formData);
        console.log("Data submitted:", response.data);

        // Update the table with the new data
        setSubmittedData([...submittedData, { ...formData, purity_id: response.data.id }]);

        // Reset the form
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
        Cell: ({ row }) => row.index + 1,
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
        Header: "Purity %",
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
          <div>
            <FaEdit
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue', }}
              onClick={() => handleEdit(row.original)}
            />
            <FaTrash
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'red', }}
              onClick={() => handleDelete(row.original.purity_id)}
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
          {editMode ? "Edit Purity" : "Add Purity"}
        </h3>
        <form className="customer-master-form" onSubmit={handleSubmit} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <div className="form-row">
            {/* <InputField
              label="Purity Percentage:"
              name="purity_percentage"
              value={formData.purity_percentage}
              onChange={handleChange}
              required={true}
              error={errors.purity_percentage}
            /> */}
            <InputField
              label="Purity Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required={true}
              error={errors.name}
              autoFocus
            />
            <InputField
              label="Metal"
              name="metal"
              value={formData.metal}
              onChange={handleChange}
              error={errors.metal} />
            {/* <InputField
              label="Item Name:"
              name="item_name"
              type="select"
              value={formData.item_name}
              onChange={handleChange}
              required={true}
              options={[
                { value: '', label: 'Select Item Name' },
                { value: 'ring', label: 'Ring' },
                { value: 'bracelet', label: 'Bracelet' },
                { value: 'necklace', label: 'Necklace' },
                { value: 'earring', label: 'Earring' },
              ]}
              error={errors.item_name}
            /> */}
            <InputField
              label="Purity %"
              name="purity_percentage"
              value={formData.purity_percentage}
              onChange={handleChange}
              error={errors.purity_percentage}
            />
            <InputField
              label="Purity"
              name="purity"
              value={formData.purity}
              onChange={handleChange}
              error={errors.purity}
            />
            <InputField
              label="URD Purity"
              name="urd_purity"
              value={formData.urd_purity}
              onChange={handleChange}
              error={errors.urd_purity}
            />
          </div>
          <div className="form-row">
            <InputField
              label="DESC"
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              error={errors.desc}
            />
            <InputField
              label="Old Purity Desc"
              name="old_purity_desc"
              value={formData.old_purity_desc}
              onChange={handleChange}
              error={errors.old_purity_desc}
            />
            <InputField
              label="Cut Issue"
              name="cut_issue"
              value={formData.cut_issue}
              onChange={handleChange}
              error={errors.cut_issue}
            />
            <InputField
              label="Skin Print"
              name="skin_print"
              value={formData.skin_print}
              onChange={handleChange}
              error={errors.skin_print}
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
        <div style={{ marginTop: "20px" }} className="purity-table-container">
          <DataTable columns={columns} data={[...submittedData].reverse()} />
        </div>
      </div>
    </div>
  );
}

export default Purity;
