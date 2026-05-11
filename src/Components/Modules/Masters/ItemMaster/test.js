import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InputField from "./Inputfield"; // Assuming you have this component

const FormWithTable = () => {
  const [formData, setFormData] = useState({
    product_id: "",
    Pricing: "",
    Tag_ID: "",
    Prefix: "tag",
    Category: "Gold", // Set a default value for Category
    Purity: "",
    PCode_BarCode: "",
    Gross_Weight: "",
    Stones_Weight: "",
    Stones_Price: "",
    WastageWeight: "",
    HUID_No: "",
    Wastage_On: "",
    Wastage_Percentage: "",
    Status: "Available",
    Source: "Tags Entry",
    Stock_Point: "",
    Weight_BW: "",
    TotalWeight_AW: "",
    MC_Per_Gram: "",
    Making_Charges_On: "",
    Making_Charges: "",
    Design_Master: "gold",
    product_name: "",
  });

  const [openTagsEntries, setOpenTagsEntries] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddOpenTagEntry = (e) => {
    e.preventDefault();
    const newEntry = {
      Pricing: formData.Pricing,
      Wastage_On: formData.Wastage_On,
      Wastage_Percentage: formData.Wastage_Percentage,
      WastageWeight: formData.WastageWeight,
      Category: formData.Category, // Ensure Category is passed
    };

    // Add the new entry to the table
    setOpenTagsEntries((prev) => [...prev, newEntry]);
  };

  const handleSave = async () => {
    try {
      // Ensure Category and other fields are not empty
      const updatedFormData = { ...formData, Category: formData.Category || "Gold" };

      // Save product details
      const productResponse = await axios.post("http://localhost:5000/api/products", updatedFormData);
      const { product_id } = productResponse.data;

      // Append product_id to openTagsEntries
      const entriesWithProductId = openTagsEntries.map((entry) => ({
        ...entry,
        product_id, // Append product_id to entries
      }));

      // Save opening tag entries
      const saveEntriesPromises = entriesWithProductId.map((entry) =>
        axios.post("http://localhost:5000/api/opening-tags-entry", entry)
      );

      await Promise.all(saveEntriesPromises);
      alert("Data saved successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data. Please try again.");
    }
  };

  const handleBack = () => {
    navigate("/itemmastertable");
  };

  return (
    <div style={{ paddingTop: "90px" }}>
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <h4>Product Details</h4>
            <InputField
              label="P ID:"
              name="product_id"
              type="text"
              value={formData.product_id}
              onChange={handleChange}
              // readOnly={!isMaintainTagsChecked}
              // style={openingTagsStyle}
            />
            <InputField
              label="Product Name:"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
            />
            <InputField
              label="Category:"
              name="Category"
              value={formData.Category}
              onChange={handleChange}
            />
            {/* Add other fields as needed */}
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <h4>Open Tags Entry</h4>
            <form onSubmit={handleAddOpenTagEntry}>
              <InputField
                label="Pricing:"
                name="Pricing"
                value={formData.Pricing}
                onChange={handleChange}
              />
              <InputField
                label="Wastage On:"
                name="Wastage_On"
                value={formData.Wastage_On}
                onChange={handleChange}
              />
              <InputField
                label="Wastage %:"
                name="Wastage_Percentage"
                value={formData.Wastage_Percentage}
                onChange={handleChange}
              />
              <InputField
                label="Wastage Weight:"
                name="WastageWeight"
                value={formData.WastageWeight}
                onChange={handleChange}
              />
              <button type="submit" className="btn btn-primary">
                Add
              </button>
            </form>

            <table className="table mt-4">
              <thead>
                <tr>
                  <th>Pricing</th>
                  <th>Wastage On</th>
                  <th>Wastage %</th>
                  <th>Wastage Weight</th>
                </tr>
              </thead>
              <tbody>
                {openTagsEntries.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.Pricing}</td>
                    <td>{entry.Wastage_On}</td>
                    <td>{entry.Wastage_Percentage}</td>
                    <td>{entry.WastageWeight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormWithTable;
