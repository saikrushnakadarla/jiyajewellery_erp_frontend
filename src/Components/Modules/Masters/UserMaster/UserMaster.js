import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InputField from "../../../Pages/InputField/InputField";
import { Row, Col } from "react-bootstrap";
import axios from "axios";
import baseURL from "../../../../Url/NodeBaseURL"; // Ensure this is correctly set

function UserMaster() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL

  // Form state
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    phone_number: "",
    role: "",
    password: "",
    retype_password: "",
    full_name: "",
  });

  // Fetch user data for editing
 // Fetch user data for editing
useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        try {
          console.log(`Fetching user with ID: ${id}`);
          const response = await axios.get(`${baseURL}/users/${id}`);
          console.log("Fetched user data:", response.data);
  
          if (response.data) {
            setFormData((prevData) => ({
              ...prevData,
              user_name: response.data.user_name || "",
              email: response.data.email || "",
              phone_number: response.data.phone_number || "",
              role: response.data.role || "",
              password: response.data.password || "", // Blank for security
              retype_password: response.data.retype_password || "", // Blank for security
              full_name: response.data.full_name || "",
            }));
          } else {
            console.warn("User data is empty. Please verify the API response.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error.response?.data || error.message);
          alert("Failed to fetch user data. Please try again later.");
        }
      }
    };
  
    fetchUser();
  }, [id]);
  
  

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Capitalize first letter of username
    let updatedValue = value;
    if (name === "user_name") {
      updatedValue =  value.toUpperCase();
    }

    // Ensure phone number contains only digits and is limited to 10 characters
    if (name === "phone_number") {
        updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prevData) => ({
        ...prevData,
        [name]: updatedValue,
    }));
};


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.retype_password) {
      alert("Passwords do not match!");
      return;
    }

        // Validate phone number is exactly 10 digits
        if (!/^\d{10}$/.test(formData.phone_number)) {
            alert("Phone number must be exactly 10 digits.");
            return;
          }

    try {
      if (id) {
        // Update user
        await axios.put(`${baseURL}/users/${id}`, formData);
        alert("User updated successfully");
      } else {
        // Create new user
        await axios.post(`${baseURL}/users`, formData);
        alert("User created successfully");
      }
      navigate("/usertable"); // Redirect after success
    } catch (error) {
      console.error("Error saving user:", error.message);
      alert("An error occurred while saving the user.");
    }
  };

  // Handle back/close button
  const handleBack = () => {
    navigate("/usertable");
  };

  return (
    <div className="main-container">
      <div className="customer-master-container">
        <h2>{id ? "Edit User" : "Add User"}</h2>
        <form className="customer-master-form" onSubmit={handleSubmit}>
          {/* Row 1 */}
          <Row>
            <Col md={4}>
              <InputField
                label="User Name"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                required
                autoFocus
              />
            </Col>

            <Col md={4}>
              <InputField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={4}>
              <InputField
                label="User Type"
                name="role"
                type="select"
                value={formData.role}
                onChange={handleChange}
                required
                options={[
                  { value: "super admin", label: "super admin" },
                  { value: "admin", label: "admin" },
                  { value: "Operator", label: "Operator" },
                ]}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Retype Password"
                name="retype_password"
                value={formData.retype_password}
                onChange={handleChange}
                required
              />
            </Col>
          </Row>
          {/* Buttons */}
          <div className="sup-button-container">
            <button
              type="button"
              className="cus-back-btn"
              onClick={handleBack}
            >
              Close
            </button>
            <button type="submit" className="cus-submit-btn">
              {id ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserMaster;
