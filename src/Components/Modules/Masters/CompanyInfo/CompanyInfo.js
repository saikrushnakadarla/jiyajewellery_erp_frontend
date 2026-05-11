
import React, { useState, useEffect, useRef } from "react";
import InputField from "../../../Pages/InputField/InputField";
import axios from "axios";
import baseURL from "../../../../Url/NodeBaseURL";
import { Row, Col } from "react-bootstrap";
import "./Company_info.css"

function CompanyInfo() {
  const [formData, setFormData] = useState({
    company_name: "",
    address: "",
    address2: "",
    city: "",
    pincode: "",
    state: "",
    state_code: "",
    country: "",
    email: "",
    mobile: "",
    phone: "",
    website: "",
    gst_no: "",
    pan_no: "",
    bank_name: "",
    bank_account_no: "",
    ifsc_code: "",
    branch: "",
    bank_url: "",
  });

  const [states, setStates] = useState([]);
  const formRef = useRef(null);
  const [submittedData, setSubmittedData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/companies`);
        setSubmittedData(response.data);
        setShowForm(response.data.length === 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/states`);
        setStates(response.data);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, []);

  const handleStateChange = (e) => {
    const selectedState = states.find((state) => state.state_name === e.target.value);
    setFormData({
      ...formData,
      state: selectedState?.state_name || "",
      state_code: selectedState?.state_code || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;
    switch (name) {
      case "mobile":
      case "phone":
        updatedValue = value.replace(/\D/g, "").slice(0, 10);
        break;
      case "pincode":
        updatedValue = value.replace(/\D/g, "").slice(0, 6);
        break;
      case "gst_no":
        updatedValue = value.toUpperCase().slice(0, 15);
        break;
      case "pan_no":
        updatedValue = value.toUpperCase().slice(0, 10);
        break;
      case "ifsc_code":
        updatedValue = value.toUpperCase().slice(0, 11);
        break;
      case "company_name":
        updatedValue = value.charAt(0).toUpperCase() + value.slice(1);
        break;
      default:
        break;
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: updatedValue,
    }));
  };

  const validateForm = () => {
    if (!formData.company_name.trim()) { alert("Company Name is required."); return false; }
    if (!formData.state.trim()) { alert("State is required."); return false; }
    if (formData.mobile.trim() && formData.mobile.length !== 10) { alert("Mobile must be 10 digits."); return false; }
    if (formData.email.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) { alert("Invalid email format."); return false; }
    }
    if (formData.pincode.trim() && formData.pincode.length !== 6) { alert("Pincode must be 6 digits."); return false; }
    if (formData.pan_no.trim() && formData.pan_no.length !== 10) { alert("PAN must be 10 chars."); return false; }
    if (formData.gst_no.trim() && formData.gst_no.length !== 15) { alert("GST must be 15 chars."); return false; }
    if (formData.ifsc_code.trim() && formData.ifsc_code.length !== 11) { alert("IFSC must be 11 chars."); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editMode) {
      try {
        await axios.put(`${baseURL}/edit/companies/${editId}`, formData);
        setSubmittedData(submittedData.map(item => item.id === editId ? { ...formData, id: editId } : item));
        resetForm();
        setShowForm(false);
        alert("Company Info updated successfully!");
      } catch (error) { console.error("Error updating data:", error); }
    } else {
      try {
        const response = await axios.post(`${baseURL}/post/companies`, formData);
        setSubmittedData([...submittedData, { ...formData, id: response.data.id }]);
        resetForm();
        setShowForm(false);
        alert("Company Info created successfully!");
      } catch (error) { console.error("Error submitting data:", error); }
    }
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setEditId(item.id);
    setFormData({ ...item });
    setShowForm(true);
    setTimeout(() => { formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 100);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`${baseURL}/delete/companies/${id}`);
      setSubmittedData(submittedData.filter(item => item.id !== id));
    } catch (error) { console.error("Error deleting record:", error); }
  };

  const resetForm = () => {
    setFormData({
      company_name: "", address: "", address2: "", city: "", pincode: "",
      state: "", state_code: "", country: "", email: "", mobile: "", phone: "",
      website: "", gst_no: "", pan_no: "", bank_name: "", bank_account_no: "",
      ifsc_code: "", branch: "", bank_url: ""
    });
    setEditMode(false);
    setEditId(null);
  };

  return (
    <div className="main-container">
      <div className="customer-master-container">
        <h3 style={{ textAlign: "center", marginBottom: "30px" }}>
          {editMode ? "Edit Company Info" : "Company Info"}
        </h3>

        {showForm ? (
          <form ref={formRef} className="customer-master-form" onSubmit={handleSubmit}>
            <Row>
              <Col md={3}><InputField label="Company Name" name="company_name" value={formData.company_name} onChange={handleChange} required autoFocus /></Col>
              <Col md={3}><InputField label="Address" name="address" value={formData.address} onChange={handleChange} /></Col>
              <Col md={2}><InputField label="Address 2" name="address2" value={formData.address2} onChange={handleChange} /></Col>
              <Col md={2}><InputField label="City" name="city" value={formData.city} onChange={handleChange} /></Col>
              <Col md={2}><InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} /></Col>
              <Col md={2}><InputField label="State" name="state" type="select" value={formData.state} onChange={handleStateChange} options={states.map(s => ({ value: s.state_name, label: s.state_name }))} required /></Col>
              <Col md={2}><InputField label="State Code" name="state_code" value={formData.state_code} onChange={handleChange} readOnly /></Col>
              <Col md={2}><InputField label="Country" name="country" value={formData.country} onChange={handleChange} /></Col>
              <Col md={2}><InputField label="Email" name="email" value={formData.email} onChange={handleChange} /></Col>
              <Col md={2}><InputField label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} /></Col>
              <Col md={2}><InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} /></Col>
              <Col md={2}><InputField label="GST No" name="gst_no" value={formData.gst_no} onChange={handleChange} /></Col>
              <Col md={2}><InputField label="Account No" name="bank_account_no" value={formData.bank_account_no} onChange={handleChange} /></Col>
              <Col md={2}><InputField label="Account Name" name="bank_name" value={formData.bank_name} onChange={handleChange} /></Col>
              <Col md={2}><InputField label="IFSC Code" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} /></Col>
              <Col md={2}><InputField label="Branch" name="branch" value={formData.branch} onChange={handleChange} /></Col>
              <Col md={2}><InputField label="Bank URL" name="bank_url" value={formData.bank_url} onChange={handleChange} /></Col>
              <Col md={2}><InputField label="PAN No" name="pan_no" value={formData.pan_no} onChange={handleChange} /></Col>
              <Col md={3}><InputField label="Website" name="website" value={formData.website} onChange={handleChange} /></Col>
            </Row>
            <div style={{ marginTop: "20px" }}>
              <button type="submit" className="cus-submit-btn">{editMode ? "Update" : "Save"}</button>
              <button
                type="button"
                className="cus-cancel-btn"
                style={{
                  marginLeft: "10px",
                  backgroundColor: "#f0f0f0",
                  color: "#333",
                  border: "1px solid #ccc",
                  padding: "6px 14px",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
                onClick={() => { resetForm(); setShowForm(false); }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          submittedData.slice().reverse().map(item => (
            <div
              key={item.id}
              className="customer-master-form"
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                marginBottom: "20px",
                borderRadius: "8px",
                backgroundColor: "#fff"
              }}
            >
              {[["Company Name", item.company_name], ["Address", item.address], ["Address 2", item.address2],
              ["City", item.city], ["Pincode", item.pincode], ["State", item.state],
              ["State Code", item.state_code], ["Country", item.country], ["Email", item.email],
              ["Mobile", item.mobile], ["Phone", item.phone], ["Website", item.website],
              ["GST No", item.gst_no], ["PAN No", item.pan_no], ["Bank Name", item.bank_name],
              ["Branch", item.branch], ["Bank URL", item.bank_url], ["Account No", item.bank_account_no],
              ["IFSC Code", item.ifsc_code]
              ].reduce((rows, field, index) => {
                if (index % 3 === 0) rows.push([]);
                rows[rows.length - 1].push(field);
                return rows;
              }, []).map((row, idx) => (
                <Row key={idx} style={{ marginBottom: "10px" }}>
                  {row.map(([label, value], i) => (
                    <Col md={4} key={i}><strong>{label}:</strong> <span>{value}</span></Col>
                  ))}
                </Row>
              ))}
              <div style={{ textAlign: "right" }}>
                <button
                  style={{
                    marginRight: "10px",
                    padding: "6px 14px",
                    borderRadius: "4px",
                    border: "1px solid blue",
                    backgroundColor: "blue",
                    color: "white",
                    cursor: "pointer"
                  }}
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>
                <button
                  style={{
                    padding: "6px 14px",
                    borderRadius: "4px",
                    border: "1px solid red",
                    backgroundColor: "red",
                    color: "white",
                    cursor: "pointer"
                  }}
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CompanyInfo;
