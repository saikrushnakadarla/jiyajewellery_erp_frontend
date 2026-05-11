import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InputField from "../../../Pages/InputField/InputField";
import { Row, Col } from "react-bootstrap";
import axios from "axios";
import baseURL from "../../../../Url/NodeBaseURL";

function FestOffers() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { offer_id, location } = state || {};

  const [formData, setFormData] = useState({
    offer_name: "",
    discount_on: "",
    discount_on_rate:"",
    discount_percentage: "",
    discount_percent_fixed: "",
    valid_from: "",
    valid_to: "",
    offer_status: "",
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // Returns in local timezone
  };
  

  // Populate form for editing
  useEffect(() => {
    if (offer_id && location) {
      setFormData({
        offer_name: location.offer_name || "",
        discount_on: location.discount_on || "",
        discount_on_rate: location.discount_on_rate || "",
        discount_percentage: location.discount_percentage || "",
        discount_percent_fixed: location.discount_percent_fixed || "",
        valid_from: formatDate(location.valid_from),
        valid_to: formatDate(location.valid_to),
        offer_status: formatDate(location.offer_status),
      });
    }
  }, [offer_id, location]);
  
  
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const offerData = { ...formData, offer_id: 1 }; // Always use offer_id: 1
  
      if (offer_id) {
        // Update offer with offer_id = 1
        await axios.put(`${baseURL}/api/offers/1`, offerData);
        alert("Offer updated successfully!");
      } else {
        // Create or overwrite offer with offer_id = 1
        await axios.post(`${baseURL}/api/offers`, offerData);
        alert("Offer saved successfully!");
      }
  
      navigate("/festofferstable");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to save offer.");
    }
  };
  

  const handleBack = () => {
    navigate("/festofferstable");
  };

  return (
    <div className="main-container">
      <div className="customer-master-container">
        <h2>{offer_id ? "Edit Fest Offer" : "Add Fest Offer"}</h2>
        <form className="customer-master-form" onSubmit={handleSubmit}>
          <Row>
            <Col md={4}>
              <InputField
                label="Offer Name"
                name="offer_name"
                type="text"
                value={formData.offer_name}
                onChange={handleChange}
                required
              />
            </Col>
            {/* <Col md={4}>
              <InputField
                label="Discount On"
                name="discount_on"
                type="select"
                value={formData.discount_on}
                onChange={handleChange}
                options={[
                  { value: "Making Charge", label: "Making Charge" },
                  { value: "Total amount", label: "Total amount" },
                  { value: "Mobile Phones", label: "Mobile Phones" },
                ]}
                required
              />
            </Col> */}
             <Col md={4}>
              <InputField
                label="Discount on Rate"
                name="discount_on_rate"
                type="number"
                value={formData.discount_on_rate}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Discount % on MC"
                name="discount_percentage"
                // type="number"
                value={formData.discount_percentage}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={3}>
              <InputField
                label="Discount % for Fixed"
                name="discount_percent_fixed"
                // type="number"
                value={formData.discount_percent_fixed}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={3}>
              <InputField
                label="Valid From"
                name="valid_from"
                type="date"
                value={formData.valid_from}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={3}>
              <InputField
                label="Valid To"
                name="valid_to"
                type="date"
                value={formData.valid_to}
                onChange={handleChange}
                required
              />
            </Col>
            {/* <Col md={3}>
              <InputField
                label="Fest Offers Status"
                name="offer_status"
                type="text"
                value={formData.offer_status}
                onChange={handleChange}
                required
              />
            </Col> */}
          </Row>
          <div className="sup-button-container">
            <button type="button" className="cus-back-btn" onClick={handleBack}>
              Close
            </button>
            <button type="submit" className="cus-submit-btn">
              {offer_id ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FestOffers;
