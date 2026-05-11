import React, { useState } from 'react';
import InputField from "../../Masters/ItemMaster/Inputfield";
import DataTable from "./StoneTableLayout"; // Adjust the path as needed
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import baseURL from "../../../../Url/NodeBaseURL";

const StoneDetailsModal = ({ showModal, handleCloseModal, handleUpdateStoneDetails }) => {
  const [subproductname, setSubProductName] = useState("");
  const [weight, setWeight] = useState("");
  const [c_weight, setC_weight] = useState("");
  const [ratepergram, setRatePerGram] = useState("");
  const [amount, setAmount] = useState("");
  const [cut, setCut] = useState("");
  const [color, setColor] = useState("");
  const [clarity, setClarity] = useState("");
  const [totalweight, setTotalWeight] = useState(0);
  const [totalprice, setTotalPrice] = useState(0);
  const [data, setData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  

  const columns = React.useMemo(
    () => [
      { Header: "Stone Name", accessor: "subproductname" },
      // { Header: "Cut", accessor: "cut" },
      // { Header: "Color", accessor: "color" },
      // { Header: "Clarity", accessor: "clarity" },
      { Header: "Stone Wt", accessor: "weight" },
      { Header: "Carat Wt", accessor: "c_weight" },
      { Header: "Rate per Gram", accessor: "ratepergram" },
      { Header: "Amount", accessor: "amount" },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <>
            <FaEdit
              style={{
                cursor: 'pointer',
                marginLeft: '10px',
                color: 'blue',
              }}
              onClick={() => handleEdit(row.original)}

            />
            <FaTrash
              style={{
                cursor: 'pointer',
                marginLeft: '10px',
                color: 'red',
              }}
              onClick={() => handleDelete(row.original.id)}

            />
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
      id: isEditing ? editId : data.length + 1,
      subproductname,
      weight: parseFloat(weight),
      ratepergram: parseFloat(ratepergram),
      amount: parseFloat(amount),
      c_weight: parseFloat(c_weight),
      cut,
      color,
      clarity
    };

    let updatedData = [];

    if (isEditing) {
      updatedData = data.map((item) => {
        if (item.id === editId) {
          const weightDifference = payload.weight - item.weight;
          const amountDifference = payload.amount - item.amount;

          setTotalWeight((prevTotalWeight) => prevTotalWeight + weightDifference);
          setTotalPrice((prevTotalPrice) => prevTotalPrice + amountDifference);

          return { ...item, ...payload };
        }
        return item;
      });

      setIsEditing(false);
      setEditId(null);
    } else {
      updatedData = [...data, payload];

      setTotalWeight((prevTotalWeight) => prevTotalWeight + payload.weight);
      setTotalPrice((prevTotalPrice) => prevTotalPrice + payload.amount);
    }

    setData(updatedData);
    localStorage.setItem("stoneDetails", JSON.stringify(updatedData));
    window.dispatchEvent(new Event("storage"));
    setSubProductName("");
    setC_weight("");
    setWeight("");
    setRatePerGram("");
    setAmount("");
    setCut("");
    setColor("");
    setClarity("");
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
    setC_weight(rowData.c_weight);
    setWeight(rowData.weight);
    setRatePerGram(rowData.ratepergram);
    setAmount(rowData.amount);
    setCut(rowData.cut);
    setClarity(rowData.clarity);
    setColor(rowData.color);
  };

  const handleDelete = (id) => {
    let storedData = JSON.parse(localStorage.getItem("stoneDetails")) || [];
    const rowToDelete = storedData.find((item) => item.id === id);

    if (rowToDelete) {
      setTotalWeight((prevTotalWeight) => prevTotalWeight - rowToDelete.weight);
      setTotalPrice((prevTotalPrice) => prevTotalPrice - rowToDelete.amount);
    }
    const updatedData = storedData.filter((item) => item.id !== id);
    setData(updatedData);
    localStorage.setItem("stoneDetails", JSON.stringify(updatedData));
    window.dispatchEvent(new Event("storage"));
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
          totalweight: totalweight,
          totalprice: totalprice,
          cut: row.cut,
          color: row.color,
          clarity: row.clarity,
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
    const calculatedCWeight = (parseFloat(newWeight || 0) / 0.2).toFixed(2);
    setC_weight(calculatedCWeight);
    if (ratepergram) {
      const calculatedAmount = (parseFloat(calculatedCWeight) * parseFloat(ratepergram)).toFixed(2);
      setAmount(calculatedAmount);
    }
  };


  const handleRatePerGramChange = (e) => {
    const newRate = e.target.value;
    setRatePerGram(newRate);
    if (c_weight) {
      const calculatedAmount = (parseFloat(c_weight) * parseFloat(newRate)).toFixed(2);
      setAmount(calculatedAmount);
    }
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
                  <InputField label="Stone Name:" value={subproductname} onChange={(e) => setSubProductName(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <InputField label="Cut:" value={cut} onChange={(e) => setCut(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <InputField label="Color:" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <InputField label="Clarity:" value={clarity} onChange={(e) => setClarity(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <InputField label="Stone Wt:" value={weight} onChange={handleWeightChange} />
                </div>
                <div className="col-md-4">
                  <InputField label="Carat Wt:" value={c_weight} readOnly />
                </div>
                <div className="col-md-4">
                  <InputField label="Stone Price:" value={ratepergram} onChange={handleRatePerGramChange} />
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

                {/* <h6 className="fw-bold">Stone List</h6> */}
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

            {/* <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                Close
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSaveChanges}>
                Save Changes
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoneDetailsModal;
