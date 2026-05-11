import React, { useState } from 'react';
import InputField from "../../Masters/ItemMaster/Inputfield";
import DataTable from "../StockEntry/StoneTableLayout";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import "../StockEntry/StockEntry.css";
import baseURL from "../../../../Url/NodeBaseURL";

const PurchaseStoneDetailsModal = ({ showModal, handleCloseModal, handleUpdateStoneDetails }) => {
  const [subproductname, setSubProductName] = useState("");
  const [weight, setWeight] = useState("");
  const [ratepergram, setRatePerGram] = useState("");
  const [amount, setAmount] = useState("");
  const [totalweight, setTotalWeight] = useState(0); // Initial total weight as 0
  const [totalprice, setTotalPrice] = useState(0); // Initial total price as 0

  const [data, setData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const columns = React.useMemo(
    () => [
      { Header: "Sub Product Name", accessor: "subproductname" },
      { Header: "Weight", accessor: "weight" },
      { Header: "Rate per Gram", accessor: "ratepergram" },
      { Header: "Amount", accessor: "amount" },

      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <>
            <button
              className="btn btn-primary btn-sm me-2"
              onClick={() => handleEdit(row.original)}
            >
              <FaEdit />
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleDelete(row.original.id)}
            >
              <FaTrash />
            </button>
          </>
        ),
      },
    ],
    []
  );

  const handleAddOrUpdate = () => {
    if (!validateForm()) {
      return;
    }
  
    const payload = {
      subproductname,
      weight: parseFloat(weight), // Ensure weight is treated as a number
      ratepergram: parseFloat(ratepergram),
      amount: parseFloat(amount),
    };
  
    if (isEditing) {
      // Update existing row
      setData((prevData) =>
        prevData.map((item) => {
          if (item.id === editId) {
            // Adjust total weight and total price
            const weightDifference = payload.weight - item.weight;
            const amountDifference = payload.amount - item.amount;
  
            setTotalWeight((prevTotalWeight) => prevTotalWeight + weightDifference);
            setTotalPrice((prevTotalPrice) => prevTotalPrice + amountDifference);
  
            return { ...item, ...payload };
          }
          return item;
        })
      );
      setIsEditing(false);
      setEditId(null);
    } else {
      // Add new row
      const newRow = {
        id: data.length + 1,
        ...payload,
      };
      setData((prevData) => [...prevData, newRow]);
  
      // Update total weight and total price
      setTotalWeight((prevTotalWeight) => prevTotalWeight + parseFloat(weight || 0));
      setTotalPrice((prevTotalPrice) => prevTotalPrice + parseFloat(amount || 0));
    }
  
    // Clear input fields after saving
    setSubProductName("");
    setWeight("");
    setRatePerGram("");
    setAmount("");
  };
  
  const validateForm = () => {
    if (!subproductname.trim()) {
      alert("Sub Product Name is required.");
      return false;
    }
    if (!weight || parseFloat(weight) <= 0) {
      alert("Weight must be greater than 0.");
      return false;
    }
    if (!ratepergram || parseFloat(ratepergram) <= 0) {
      alert("Rate per Gram must be greater than 0.");
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert("Amount must be greater than 0.");
      return false;
    }
    return true;
  };
  


  const handleEdit = (rowData) => {
    setIsEditing(true);
    setEditId(rowData.id);
    setSubProductName(rowData.subproductname);
    setWeight(rowData.weight);
    setRatePerGram(rowData.ratepergram);
    setAmount(rowData.amount);
  };

  const handleDelete = (id) => {
    const rowToDelete = data.find((item) => item.id === id);

    if (rowToDelete) {
      // Update total weight and total price after deletion
      setTotalWeight((prevTotalWeight) => prevTotalWeight - rowToDelete.weight);
      setTotalPrice((prevTotalPrice) => prevTotalPrice - rowToDelete.amount);
    }

    setData((prevData) => prevData.filter((item) => item.id !== id));
  };

  const handleSaveChanges = async () => {
    if (data.length === 0) {
      alert("No data to save. Please add stone details before saving.");
      return;
    }
  
    try {
      for (const row of data) {
        // Validate each row before sending it to the server
        if (!row.subproductname.trim()) {
          alert(`Row with Sub Product Name is required.`);
          return;
        }
        if (!row.weight || parseFloat(row.weight) <= 0) {
          alert(`Row with Weight must be greater than 0.`);
          return;
        }
        if (!row.ratepergram || parseFloat(row.ratepergram) <= 0) {
          alert(`Row with Rate per Gram must be greater than 0.`);
          return;
        }
        if (!row.amount || parseFloat(row.amount) <= 0) {
          alert(`Row with Amount must be greater than 0.`);
          return;
        }
  
        const payload = {
          subproductname: row.subproductname,
          weight: row.weight,
          ratepergram: row.ratepergram,
          amount: row.amount,
          totalweight: totalweight, // Send the total weight
          totalprice: totalprice,  // Send the total price
        };
  
        await axios.post(`${baseURL}/post/addProductstonedetails`, payload);
      }
      
      alert("Data saved successfully!");
      handleUpdateStoneDetails(totalweight, totalprice);
      // Clear table data and reset totals
      setData([]);
      setTotalWeight(0);
      setTotalPrice(0);
  
      // Close the modal
      handleCloseModal();
    } catch (error) {
      console.error("Error saving changes to DB", error);
      alert("Failed to save data. Please try again.");
    }
  };
  
  
  
  

  const handleWeightChange = (e) => {
    const newWeight = e.target.value;
    setWeight(newWeight);
    calculateAmount(newWeight, ratepergram);
  };

  const handleRatePerGramChange = (e) => {
    const newRate = e.target.value;
    setRatePerGram(newRate);
    calculateAmount(weight, newRate);
  };

  const calculateAmount = (weightValue, rateValue) => {
    const calculatedAmount = (parseFloat(weightValue || 0) * parseFloat(rateValue || 0)).toFixed(2);
    setAmount(calculatedAmount);
  };

  if (!showModal) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ marginTop: "-30px" }}>
      <div className="modal-dialog modal-lg" role="document">
        <div className="stockentrymodalformcontainer">
          <div className="modal-content bg-light">
            <div className="modal-header">
              <h5 className="modal-title">Stone Details</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body" style={{ backgroundColor: "rgba(163, 110, 41, 0.08)" }}>
              <div className="row g-3">
                <div className="col-md-4">
                  <InputField label="Sub Product Name:" value={subproductname} onChange={(e) => setSubProductName(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <InputField label="Weight:" value={weight} onChange={handleWeightChange} />
                </div>
                <div className="col-md-4">
                  <InputField label="Rate per Gram:" value={ratepergram} onChange={handleRatePerGramChange} />
                </div>
                <div className="col-md-4">
                  <InputField label="Amount:" value={amount} readOnly />
                </div>

                <div className="col-md-4">
                  <button type="button" className="btn btn-primary" onClick={handleAddOrUpdate}>
                    {isEditing ? "Update" : "Add"}
                  </button>
                </div>

              </div>

              <div className="mt-4">

                {/* <div className="col-md-12 d-flex justify-content-end" style={{ marginTop: '30px', marginLeft: '-15px' }}>
                  <div className="me-3">
                    <InputField label="Total Weight:" value={totalweight} readOnly />
                  </div>
                  <div>
                    <InputField label="Total Price:" value={totalprice} readOnly />
                  </div>
                </div> */}
                <h6 className="fw-bold">Stone List</h6>
                <DataTable columns={columns} data={data} />
                <div className="col-md-12 d-flex justify-content-end" style={{ marginTop: '30px', marginLeft: '-15px' }}>
                  <div className="me-3">
                    <InputField label="Total Weight:" value={totalweight} readOnly />
                  </div>
                  <div>
                    <InputField label="Total Price:" value={totalprice} readOnly />
                  </div>
                </div>
              </div>

            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                Close
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSaveChanges}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseStoneDetailsModal;
