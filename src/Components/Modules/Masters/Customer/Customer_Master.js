import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import InputField from '../../../Pages/InputField/InputField';
import './Customer_Master.css';
import axios from "axios";
import { Row, Col, Button } from 'react-bootstrap';
import baseURL from '../../../../Url/NodeBaseURL';
import baseURL2 from '../../../../Url/NodeBaseURL2';
import { FaUpload, FaTrash } from 'react-icons/fa';
import Webcam from 'react-webcam';

function Customer_Master() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    account_name: '',
    print_name: '',
    account_group: 'CUSTOMERS',
    address1: '',
    address2: '',
    city: '',
    pincode: '',
    state: '',
    state_code: '',
    phone: '',
    religion: '',
    mobile: location.state?.mobile || '',
    email: '',
    birthday: '',
    anniversary: '',
    bank_account_no: '',
    bank_name: '',
    ifsc_code: '',
    branch: '',
    gst_in: '',
    aadhar_card: '',
    pan_card: '',
  });
  const [existingMobiles, setExistingMobiles] = useState([]);
  const [tcsApplicable, setTcsApplicable] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [states, setStates] = useState([]);

  // Image upload state
  const [showWebcam, setShowWebcam] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${baseURL}/get/account-details`);
        if (response.ok) {
          const result = await response.json();
          const mobiles = result
            .filter((item) => item.account_group === 'CUSTOMERS')
            .map((item) => item.mobile);
          setExistingMobiles(mobiles);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    const fetchCustomer = async () => {
      if (id) {
        try {
          const response = await fetch(`${baseURL}/get/account-details/${id}`);
          if (response.ok) {
            const result = await response.json();
            const parseDate = (dateString) => {
              if (!dateString) return '';
              const date = new Date(dateString);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            };

            const customerData = {
              ...result,
              birthday: parseDate(result.birthday),
              anniversary: parseDate(result.anniversary),
            };

            setFormData(customerData);

            if (result.images) {
              const imagesArray = Array.isArray(result.images) ? result.images : [result.images];
              const imageUrls = imagesArray.map(img => img.url);
              const imageFilenames = imagesArray.map(img => img.filename);
              setImagePreviews(imageUrls);
              setExistingImages(imageFilenames);
            }
          }
        } catch (error) {
          console.error('Error fetching customer:', error);
        }
      }
    };

    fetchCustomers();
    fetchCustomer();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    switch (name) {
      case "account_name":
      case "print_name":
        updatedValue = value.toUpperCase();
        if (/^\d+$/.test(updatedValue)) {
          return;
        }
        setFormData((prevData) => ({
          ...prevData,
          [name]: updatedValue,
          ...(name === "account_name" &&
            prevData.print_name === prevData.account_name && {
            print_name: updatedValue,
          }),
        }));
        return;

      case "print_name":
        updatedValue = value.charAt(0).toUpperCase() + value.slice(1);
        break;

      case "mobile":
      case "phone":
        updatedValue = value.replace(/\D/g, "").slice(0, 10);
        break;

      case "aadhar_card":
        updatedValue = value.replace(/\D/g, "").slice(0, 12);
        break;

      case "pincode":
        updatedValue = value.replace(/\D/g, "").slice(0, 6);
        break;

      case "gst_in":
        updatedValue = value.toUpperCase().slice(0, 15);
        break;

      case "pan_card":
        updatedValue = value.toUpperCase().slice(0, 10);
        break;

      case "ifsc_code":
        updatedValue = value.toUpperCase().slice(0, 11);
        break;

      case "bank_account_no":
        updatedValue = value.replace(/\D/g, "").slice(0, 18);
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
    if (!formData.account_name || !formData.account_name.trim()) {
      alert("Customer Name is required.");
      return false;
    }
    if (!formData.mobile || !formData.mobile.trim()) {
      alert("Mobile number is required.");
      return false;
    }
    if (formData.mobile && formData.mobile.length !== 10) {
      alert("Mobile number must be exactly 10 digits.");
      return false;
    }
    if (formData.pincode && formData.pincode.trim() && formData.pincode.length !== 6) {
      alert("PinCode must be exactly 6 digits.");
      return false;
    }
    if (formData.aadhar_card && formData.aadhar_card.trim() && formData.aadhar_card.length !== 12) {
      alert("Aadhar Card must be exactly 12 digits.");
      return false;
    }
    if (formData.pan_card && formData.pan_card.trim() && formData.pan_card.length !== 10) {
      alert("PAN Card must be exactly 10 characters.");
      return false;
    }
    if (formData.gst_in && formData.gst_in.trim() && formData.gst_in.length !== 15) {
      alert("GSTIN must be exactly 15 characters.");
      return false;
    }
    if (formData.ifsc_code && formData.ifsc_code.trim() && formData.ifsc_code.length !== 11) {
      alert("IFSC Code must be exactly 11 characters.");
      return false;
    }
    return true;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setNewImages([...newImages, ...files]);
  };

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      const byteString = atob(imageSrc.split(",")[1]);
      const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], `webcam-${Date.now()}.jpg`, { type: mimeString });

      setImagePreviews([...imagePreviews, URL.createObjectURL(file)]);
      setNewImages([...newImages, file]);
      setShowWebcam(false);
    }
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      const updatedExisting = [...existingImages];
      updatedExisting.splice(index, 1);
      setExistingImages(updatedExisting);
    } else {
      const adjustedIndex = index - existingImages.length;
      const updatedNew = [...newImages];
      updatedNew.splice(adjustedIndex, 1);
      setNewImages(updatedNew);
    }

    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);
  };

  // Function to store customer in users database
  const storeInUsersDB = async (customerData, customerId) => {
    try {
      // Generate a random password if not provided
      const randomPassword = Math.random().toString(36).slice(-8) + "@123";
      
      const usersData = {
        full_name: customerData.account_name,
        email_id: customerData.email || "",
        phone: customerData.mobile || null,
        date_of_birth: customerData.birthday || null,
        gender: customerData.gender || "",
        designation: "Customer",
        date_of_anniversary: customerData.anniversary || null,
        country: "India",
        state: customerData.state || "",
        city: customerData.city || "",
        district: customerData.district || "",
        company_name: customerData.company_name || "",
        role: "customer",
        status: "pending",
        pincode: customerData.pincode || "",
        password: randomPassword,
        confirm_password: randomPassword,
        customer_id: customerId,
        latitude: customerData.latitude || null,
        longitude: customerData.longitude || null
      };

      console.log("Sending to users API:", usersData);

      const response = await fetch(`${baseURL2}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usersData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("User stored successfully in users DB:", result);
        return { success: true, customerId: result.customer_id };
      } else {
        const errorData = await response.json();
        console.error("Failed to store user in users DB:", errorData);
        return { success: false, error: errorData };
      }
    } catch (error) {
      console.error("Error storing in users DB:", error);
      return { success: false, error: error.message };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      // Duplicate check
      if (!id) {
        const response = await fetch(`${baseURL}/get/account-details`);
        if (!response.ok) {
          throw new Error("Failed to fetch data for duplicate check.");
        }

        const result = await response.json();
        const isDuplicateMobile = result.some(
          (item) => item.mobile === formData.mobile && item.account_id !== id 
        );

        if (isDuplicateMobile) {
          alert("This mobile number is already associated with another entry.");
          setIsSaving(false);
          return;
        }
      }

      // Prepare FormData for main DB (with images)
      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      newImages.forEach(image => {
        formDataToSend.append("images", image);
      });

      if (existingImages.length > 0) {
        formDataToSend.append(
          "imagesToKeep",
          JSON.stringify(existingImages)
        );
      }

      // Main API call (only baseURL)
      const endpoint = id
        ? `${baseURL}/edit/account-details/${id}`
        : `${baseURL}/account-details`;

      const method = id ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method: method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save customer");
      }

      const result = await response.json();
      console.log("Customer saved in main DB:", result);
      
      // Get the customer_id from response
      const generatedCustomerId = result.customer_id;

      // Second API call - Store in users database (only for new customers, not for edits)
      if (!id) {
        const customerDataForUsers = {
          account_name: formData.account_name,
          email: formData.email,
          mobile: formData.mobile,
          birthday: formData.birthday,
          anniversary: formData.anniversary,
          state: formData.state,
          city: formData.city,
          district: formData.city,
          pincode: formData.pincode,
          company_name: formData.company_name,
          gender: "",
          latitude: null,
          longitude: null
        };

        const userStoreResult = await storeInUsersDB(customerDataForUsers, generatedCustomerId);
        
        if (userStoreResult.success) {
          alert(`Customer created successfully! Customer ID: ${generatedCustomerId}\nUser account also created in the system.`);
        } else {
          alert(`Customer created successfully with ID: ${generatedCustomerId}, but there was an issue creating the user account. Please check logs.`);
        }
      } else {
        alert(`Customer updated successfully!`);
      }
      
      // Navigate on success
      navigate(location.state?.from || "/customerstable", {
        state: { mobile: formData.mobile },
      });

    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "An error occurred while processing the request.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    const from = location.state?.from || "/customerstable";
    navigate(from);
  };

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

  return (
    <div className="main-container">
      <div className="customer-master-container">
        <h2>{id ? 'Edit Customer' : 'Add Customer'}</h2>
        <form className="customer-master-form" onSubmit={handleSubmit}>
          <Row>
            <Col md={3}>
              <InputField
                label="Trade / Customer Name"
                name="account_name"
                value={formData.account_name}
                onChange={handleChange}
                required
                autoFocus
              />
            </Col>
            <Col md={3}>
              <InputField
                label="Print Name"
                name="print_name"
                value={formData.print_name}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={2}>
              <InputField
                label="Religion"
                name="religion"
                type="select"
                value={formData.religion}
                onChange={handleChange}
                options={[
                  { value: "Hinduism", label: "Hinduism" },
                  { value: "Islam", label: "Islam" },
                  { value: "Christianity", label: "Christianity" },
                  { value: "Sikhism", label: "Sikhism" },
                  { value: "Others", label: "Others" },
                ]}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Address1"
                name="address1"
                value={formData.address1}
                onChange={handleChange}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Address2"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
              />
            </Col>
            <Col md={3}>
              <InputField
                label="State"
                name="state"
                type="select"
                value={formData.state}
                onChange={handleStateChange}
                options={states.map((state) => ({
                  value: state.state_name,
                  label: state.state_name,
                }))}
              />
            </Col>
            <Col md={3}>
              <InputField label="State Code:" name="state_code" value={formData.state_code} onChange={handleChange} readOnly />
            </Col>
            <Col md={3}>
              <InputField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Col>
            <Col md={3}>
              <InputField
                label="Mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Col>
            <Col md={2}>
              <InputField
                label="Birthday"
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleChange}
              />
            </Col>
            <Col md={2}>
              <InputField
                label="Anniversary"
                name="anniversary"
                type="date"
                value={formData.anniversary}
                onChange={handleChange}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Bank Account No"
                name="bank_account_no"
                value={formData.bank_account_no}
                onChange={handleChange}
              />
            </Col>
            <Col md={3}>
              <InputField
                label="Bank Name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
              />
            </Col>
            <Col md={3}>
              <InputField
                label="IFSC Code"
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={handleChange}
              />
            </Col>
            <Col md={3}>
              <InputField
                label="Branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
              />
            </Col>
            <Col md={3}>
              <InputField
                label="GSTIN"
                name="gst_in"
                value={formData.gst_in}
                onChange={handleChange}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Aadhar Card"
                name="aadhar_card"
                value={formData.aadhar_card}
                onChange={handleChange}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="PAN Card"
                name="pan_card"
                value={formData.pan_card}
                onChange={handleChange}
              />
            </Col>

            <Col md={12}>
              <div className="image-upload-section">
                <h5>Upload Customer Documents/Photos</h5>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                />
                <Button
                  variant="primary"
                  onClick={() => fileInputRef.current.click()}
                  className="me-2"
                >
                  <FaUpload /> Choose Images
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowWebcam(!showWebcam)}
                >
                  <FaUpload /> Capture Photo
                </Button>

                {showWebcam && (
                  <div className="webcam-container mt-3">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      width={320}
                      height={240}
                    />
                    <div className="mt-2">
                      <Button variant="success" onClick={captureImage} className="me-2">
                        Capture
                      </Button>
                      <Button variant="danger" onClick={() => setShowWebcam(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {imagePreviews.length > 0 && (
                  <div className="image-previews mt-3">
                    <h6>Uploaded Images:</h6>
                    <div className="d-flex flex-wrap">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="position-relative me-2 mb-2" style={{ width: '100px', height: '100px' }}>
                          <img
                            src={preview}
                            alt={`Preview ${index}`}
                            className="img-thumbnail h-100 w-100"
                            style={{ objectFit: 'cover' }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0"
                            onClick={() => removeImage(index)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <div className="sup-button-container">
            <button
              type="button"
              className="cus-back-btn"
              onClick={handleBack}
            >
              Close
            </button>
            <button
              type="submit"
              className="cus-submit-btn"
              disabled={isSaving}
            >
              {isSaving ? (id ? "Updating..." : "Saving...") : (id ? "Update" : "Save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Customer_Master;