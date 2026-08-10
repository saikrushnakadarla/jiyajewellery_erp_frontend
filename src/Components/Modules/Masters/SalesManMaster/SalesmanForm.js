// Salesman_Master.js
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import InputField from '../../../Pages/InputField/InputField';
import './SalesmanForm.css';
import axios from "axios";
import { Row, Col, Button } from 'react-bootstrap';
import baseURL from '../../../../Url/NodeBaseURL';
import baseURL2 from '../../../../Url/NodeBaseURL2';
import { FaUpload, FaTrash, FaEye, FaEyeSlash, FaCamera } from 'react-icons/fa';
import Webcam from 'react-webcam';
import Swal from 'sweetalert2';

// Static data for Indian states, districts, and cities
const indiaStateDistrictCityData = {
  "Andhra Pradesh": {
    districts: {
      "Visakhapatnam": ["Visakhapatnam", "Anakapalli", "Bheemunipatnam"],
      "Vijayawada": ["Vijayawada", "Nuzvid", "Jaggayyapeta"],
      "Guntur": ["Guntur", "Tenali", "Bapatla"],
      "Nellore": ["Nellore", "Kavali", "Gudur"],
      "Kurnool": ["Kurnool", "Nandyal", "Adoni"],
      "Tirupati": ["Tirupati", "Srikalahasti", "Madanapalle"],
      "Rajahmundry": ["Rajahmundry", "Kakinada", "Amalapuram"],
      "Anantapur": ["Anantapur", "Dharmavaram", "Tadipatri"]
    }
  },
  "Telangana": {
    districts: {
      "Hyderabad": ["Hyderabad", "Secunderabad", "Charminar"],
      "Warangal": ["Warangal", "Hanamkonda", "Jangaon"],
      "Karimnagar": ["Karimnagar", "Jagtial", "Siricilla"],
      "Nizamabad": ["Nizamabad", "Bodhan", "Armoor"],
      "Khammam": ["Khammam", "Kothagudem", "Palwancha"],
      "Nalgonda": ["Nalgonda", "Miryalaguda", "Suryapet"],
      "Mahabubnagar": ["Mahabubnagar", "Wanaparthy", "Nagarkurnool"],
      "Adilabad": ["Adilabad", "Mancherial", "Nirmal"]
    }
  },
  "Karnataka": {
    districts: {
      "Bangalore": ["Bangalore Urban", "Bangalore Rural", "Ramanagara"],
      "Mysore": ["Mysore", "Nanjangud", "Tirumakudal Narsipur"],
      "Mangalore": ["Mangalore", "Bantwal", "Puttur"],
      "Hubli": ["Hubli", "Dharwad", "Kalghatgi"],
      "Belgaum": ["Belgaum", "Chikodi", "Bailhongal"],
      "Gulbarga": ["Gulbarga", "Sedam", "Chincholi"],
      "Davanagere": ["Davanagere", "Harihar", "Jagalur"],
      "Bellary": ["Bellary", "Hospet", "Sandur"]
    }
  },
  "Tamil Nadu": {
    districts: {
      "Chennai": ["Chennai", "Tambaram", "Avadi"],
      "Coimbatore": ["Coimbatore", "Pollachi", "Valparai"],
      "Madurai": ["Madurai", "Usilampatti", "Vadipatti"],
      "Tiruchirappalli": ["Tiruchirappalli", "Lalgudi", "Manapparai"],
      "Salem": ["Salem", "Mettur", "Omalur"],
      "Tirunelveli": ["Tirunelveli", "Palayamkottai", "Tenkasi"],
      "Vellore": ["Vellore", "Ranipet", "Tirupattur"],
      "Thoothukudi": ["Thoothukudi", "Tiruchendur", "Kovilpatti"]
    }
  },
  "Maharashtra": {
    districts: {
      "Mumbai": ["Mumbai City", "Mumbai Suburban", "Thane"],
      "Pune": ["Pune", "Pimpri-Chinchwad", "Baramati"],
      "Nagpur": ["Nagpur", "Umred", "Ramtek"],
      "Nashik": ["Nashik", "Malegaon", "Manmad"],
      "Aurangabad": ["Aurangabad", "Jalna", "Paithan"],
      "Solapur": ["Solapur", "Pandharpur", "Akkalkot"],
      "Kolhapur": ["Kolhapur", "Ichalkaranji", "Jaysingpur"],
      "Amravati": ["Amravati", "Achalpur", "Warud"]
    }
  },
  "Gujarat": {
    districts: {
      "Ahmedabad": ["Ahmedabad", "Gandhinagar", "Sanand"],
      "Surat": ["Surat", "Navsari", "Bardoli"],
      "Vadodara": ["Vadodara", "Anand", "Padra"],
      "Rajkot": ["Rajkot", "Morbi", "Gondal"],
      "Bhavnagar": ["Bhavnagar", "Palitana", "Mahuva"],
      "Jamnagar": ["Jamnagar", "Dwarka", "Khambhalia"],
      "Junagadh": ["Junagadh", "Veraval", "Keshod"],
      "Gandhinagar": ["Gandhinagar", "Mansa", "Dehgam"]
    }
  },
  "Rajasthan": {
    districts: {
      "Jaipur": ["Jaipur", "Amber", "Bassi"],
      "Jodhpur": ["Jodhpur", "Osian", "Bilara"],
      "Udaipur": ["Udaipur", "Nathdwara", "Salumbar"],
      "Kota": ["Kota", "Bundi", "Baran"],
      "Bikaner": ["Bikaner", "Nokha", "Lunkaransar"],
      "Ajmer": ["Ajmer", "Kishangarh", "Beawar"],
      "Bhilwara": ["Bhilwara", "Asind", "Mandal"],
      "Alwar": ["Alwar", "Tijara", "Rajgarh"]
    }
  },
  "Kerala": {
    districts: {
      "Thiruvananthapuram": ["Thiruvananthapuram", "Neyyattinkara", "Varkala"],
      "Kochi": ["Ernakulam", "Aluva", "Paravur"],
      "Kozhikode": ["Kozhikode", "Vadakara", "Koyilandy"],
      "Thrissur": ["Thrissur", "Chalakudy", "Kodungallur"],
      "Kollam": ["Kollam", "Karunagappally", "Punalur"],
      "Palakkad": ["Palakkad", "Ottappalam", "Mannarkkad"],
      "Alappuzha": ["Alappuzha", "Cherthala", "Kayamkulam"],
      "Kannur": ["Kannur", "Thalassery", "Payyannur"]
    }
  },
  "West Bengal": {
    districts: {
      "Kolkata": ["Kolkata", "Bidhannagar", "Howrah"],
      "Darjeeling": ["Darjeeling", "Siliguri", "Kurseong"],
      "Durgapur": ["Durgapur", "Asansol", "Raniganj"],
      "Haldia": ["Haldia", "Tamluk", "Contai"],
      "Malda": ["Malda", "English Bazar", "Kaliachak"],
      "Baharampur": ["Baharampur", "Jangipur", "Lalbag"],
      "Bardhaman": ["Bardhaman", "Kalna", "Katwa"],
      "Balurghat": ["Balurghat", "Gangarampur", "Buniadpur"]
    }
  },
  "Punjab": {
    districts: {
      "Amritsar": ["Amritsar", "Ajnala", "Baba Bakala"],
      "Ludhiana": ["Ludhiana", "Jagraon", "Khanna"],
      "Jalandhar": ["Jalandhar", "Phagwara", "Nakodar"],
      "Patiala": ["Patiala", "Rajpura", "Nabha"],
      "Bathinda": ["Bathinda", "Mansa", "Talwandi Sabo"],
      "Mohali": ["Mohali", "Kharar", "Dera Bassi"],
      "Pathankot": ["Pathankot", "Gurdaspur", "Batala"],
      "Hoshiarpur": ["Hoshiarpur", "Dasuya", "Mukerian"]
    }
  },
  "Haryana": {
    districts: {
      "Gurugram": ["Gurugram", "Manesar", "Sohna"],
      "Faridabad": ["Faridabad", "Ballabgarh", "Palwal"],
      "Chandigarh": ["Chandigarh", "Panchkula", "Mohali"],
      "Ambala": ["Ambala", "Jagadhri", "Naraingarh"],
      "Panipat": ["Panipat", "Samalkha", "Israna"],
      "Karnal": ["Karnal", "Assandh", "Indri"],
      "Hisar": ["Hisar", "Hansi", "Narnaund"],
      "Rohtak": ["Rohtak", "Meham", "Kalanaur"]
    }
  },
  "Uttar Pradesh": {
    districts: {
      "Lucknow": ["Lucknow", "Bakshi Ka Talab", "Malihabad"],
      "Kanpur": ["Kanpur", "Bithoor", "Ghatampur"],
      "Agra": ["Agra", "Fatehpur Sikri", "Kiraoli"],
      "Varanasi": ["Varanasi", "Ramnagar", "Mughalsarai"],
      "Prayagraj": ["Prayagraj", "Naini", "Soraon"],
      "Meerut": ["Meerut", "Mawana", "Sardhana"],
      "Bareilly": ["Bareilly", "Aonla", "Baheri"],
      "Gorakhpur": ["Gorakhpur", "Bansgaon", "Chauri Chaura"]
    }
  },
  "Madhya Pradesh": {
    districts: {
      "Bhopal": ["Bhopal", "Berasia", "Huzur"],
      "Indore": ["Indore", "Mhow", "Depalpur"],
      "Jabalpur": ["Jabalpur", "Sihora", "Patan"],
      "Gwalior": ["Gwalior", "Bhitarwar", "Dabra"],
      "Ujjain": ["Ujjain", "Nagda", "Tarana"],
      "Sagar": ["Sagar", "Banda", "Khurai"],
      "Rewa": ["Rewa", "Mauganj", "Teonthar"],
      "Satna": ["Satna", "Maihar", "Nagod"]
    }
  },
  "Bihar": {
    districts: {
      "Patna": ["Patna", "Danapur", "Patna Rural"],
      "Gaya": ["Gaya", "Bodh Gaya", "Sherghati"],
      "Bhagalpur": ["Bhagalpur", "Nathnagar", "Sultanganj"],
      "Muzaffarpur": ["Muzaffarpur", "Kanti", "Motipur"],
      "Purnia": ["Purnia", "Banmankhi", "Baisi"],
      "Darbhanga": ["Darbhanga", "Benipur", "Biraul"],
      "Chapra": ["Chapra", "Sonepur", "Dighwara"],
      "Hajipur": ["Hajipur", "Mahnar", "Bidupur"]
    }
  },
  "Odisha": {
    districts: {
      "Bhubaneswar": ["Khordha", "Balianta", "Balipatna"],
      "Cuttack": ["Cuttack", "Banki", "Athagad"],
      "Rourkela": ["Rourkela", "Rajgangpur", "Birmitrapur"],
      "Berhampur": ["Berhampur", "Gopalpur", "Chhatrapur"],
      "Sambalpur": ["Sambalpur", "Burla", "Hirakud"],
      "Puri": ["Puri", "Konark", "Brahmagiri"],
      "Balasore": ["Balasore", "Jaleswar", "Soro"],
      "Bhadrak": ["Bhadrak", "Chandbali", "Dhamnagar"]
    }
  }
};

function Salesman_Master() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    account_name: '',
    print_name: '',
    account_group: 'SALESMAN',
    address1: '',
    address2: '',
    city: '',
    district: '',
    pincode: '',
    state: '',
    state_code: '',
    phone: '',
    religion: '',
    mobile: '',
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
    password: '',
    confirm_password: '',
    gender: '',
    country: 'India',
    designation: 'Salesman',
    company_name: '',
    duty_start_time: '',
    duty_end_time: '',
  });

  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [existingMobiles, setExistingMobiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Image upload state
  const [showWebcam, setShowWebcam] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingProfilePhoto, setExistingProfilePhoto] = useState(null);
  const [newProfilePhoto, setNewProfilePhoto] = useState(null);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get all states for dropdown
  const allStates = Object.keys(indiaStateDistrictCityData);

  // Update districts when state changes
  useEffect(() => {
    if (formData.state && indiaStateDistrictCityData[formData.state]) {
      const districts = Object.keys(indiaStateDistrictCityData[formData.state].districts);
      setAvailableDistricts(districts);
      setFormData(prev => ({ ...prev, district: "", city: "" }));
      setAvailableCities([]);
    } else {
      setAvailableDistricts([]);
      setAvailableCities([]);
    }
  }, [formData.state]);

  // Update cities when district changes
  useEffect(() => {
    if (formData.state && formData.district &&
      indiaStateDistrictCityData[formData.state]?.districts[formData.district]) {
      const cities = indiaStateDistrictCityData[formData.state].districts[formData.district];
      setAvailableCities(cities);
      setFormData(prev => ({ ...prev, city: "" }));
    } else {
      setAvailableCities([]);
    }
  }, [formData.district, formData.state]);

  useEffect(() => {
    const fetchSalesmen = async () => {
      try {
        const response = await fetch(`${baseURL}/get/account-details`);
        if (response.ok) {
          const result = await response.json();
          const mobiles = result
            .filter((item) => item.account_group === 'SALESMAN')
            .map((item) => item.mobile);
          setExistingMobiles(mobiles);
        }
      } catch (error) {
        console.error('Error fetching salesmen:', error);
      }
    };

    const fetchSalesman = async () => {
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

            const formatDutyTime = (timeString) => {
              if (!timeString) return '';
              if (/^\d{2}:\d{2}$/.test(timeString)) return timeString;
              if (timeString.includes(':')) {
                const parts = timeString.split(' ');
                if (parts.length > 1) {
                  return parts[1].substring(0, 5);
                }
                return timeString.substring(0, 5);
              }
              return timeString;
            };

            const salesmanData = {
              ...result,
              birthday: parseDate(result.birthday),
              anniversary: parseDate(result.anniversary),
              duty_start_time: formatDutyTime(result.duty_start_time),
              duty_end_time: formatDutyTime(result.duty_end_time),
            };

            setFormData(salesmanData);

            if (result.profile_photo) {
              setExistingProfilePhoto(result.profile_photo);
              setImagePreview(`${baseURL}${result.profile_photo}`);
            }
          }
        } catch (error) {
          console.error('Error fetching salesman:', error);
        }
      }
    };

    fetchSalesmen();
    fetchSalesman();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    switch (name) {
      case "account_name":
        updatedValue = value.toUpperCase();
        if (/^\d+$/.test(updatedValue)) {
          return;
        }
        setFormData((prevData) => ({
          ...prevData,
          account_name: updatedValue,
          ...(prevData.print_name === prevData.account_name && {
            print_name: updatedValue,
          }),
        }));
        return;

      case "print_name":
        updatedValue = value.charAt(0).toUpperCase() + value.slice(1);
        break;

      case "birthday":
      case "anniversary":
        if (value) {
          const parts = value.split("-");
          if (parts.length > 0 && parts[0].length > 4) {
            return;
          }
        }
        updatedValue = value;
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
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Salesman Name is required.' });
      return false;
    }
    if (!formData.gender) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Gender is required.' });
      return false;
    }
    if (!formData.mobile || !formData.mobile.trim()) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Mobile number is required.' });
      return false;
    }
    if (formData.mobile && formData.mobile.length !== 10) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Mobile number must be exactly 10 digits.' });
      return false;
    }
    if (!formData.district) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'District is required.' });
      return false;
    }
    if (!formData.city) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'City is required.' });
      return false;
    }
    if (!formData.state) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'State is required.' });
      return false;
    }
    if (!formData.pincode) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Pincode is required.' });
      return false;
    }
    if (formData.pincode && formData.pincode.length !== 6) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Pincode must be exactly 6 digits.' });
      return false;
    }
    if (!formData.company_name) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Company Name is required.' });
      return false;
    }
    if (!formData.designation) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Designation is required.' });
      return false;
    }
    if (!formData.duty_start_time) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Duty Start Time is required.' });
      return false;
    }
    if (!formData.duty_end_time) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Duty End Time is required.' });
      return false;
    }
    if (formData.duty_start_time >= formData.duty_end_time) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Duty End Time must be after Duty Start Time.' });
      return false;
    }

    if (!id) {
      if (!formData.password || formData.password.length < 6) {
        Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Password must be at least 6 characters long.' });
        return false;
      }
      if (formData.password !== formData.confirm_password) {
        Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Password and Confirm Password do not match.' });
        return false;
      }
    }

    // Validate profile photo for new salesmen
    if (!id && !imagePreview) {
      Swal.fire({ 
        icon: 'warning', 
        title: 'Profile Photo Required', 
        text: 'Please upload or capture a profile photo. This is mandatory for salesman registration.' 
      });
      return false;
    }

    return true;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({ icon: 'error', title: 'File Too Large', text: 'File size must be under 5MB.' });
        return;
      }
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        Swal.fire({ icon: 'error', title: 'Invalid File Type', text: 'Please select a valid image file.' });
        return;
      }
      setNewProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowWebcam(true);
  };

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const byteString = atob(imageSrc.split(",")[1]);
        const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const file = new File([blob], `webcam-${Date.now()}.jpg`, { type: mimeString });

        setNewProfilePhoto(file);
        setImagePreview(URL.createObjectURL(file));
        setShowWebcam(false);

        Swal.fire({
          icon: 'success',
          title: 'Photo Captured!',
          text: 'Profile photo captured successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setNewProfilePhoto(null);
    setExistingProfilePhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const storeInUsersDB = async (salesmanData, userId) => {
    try {
      const passwordToUse = salesmanData.password || Math.random().toString(36).slice(-8) + "@123";
      
      const usersData = {
        full_name: salesmanData.account_name,
        email_id: salesmanData.email || "",
        phone: salesmanData.mobile || null,
        date_of_birth: salesmanData.birthday || null,
        gender: salesmanData.gender || "",
        designation: salesmanData.designation || "Salesman",
        date_of_anniversary: salesmanData.anniversary || null,
        country: salesmanData.country || "India",
        state: salesmanData.state || "",
        city: salesmanData.city || "",
        district: salesmanData.district || "",
        company_name: salesmanData.company_name || "",
        role: "salesman",
        status: "pending",
        pincode: salesmanData.pincode || "",
        password: passwordToUse,
        confirm_password: passwordToUse,
        duty_start_time: salesmanData.duty_start_time || null,
        duty_end_time: salesmanData.duty_end_time || null,
        latitude: salesmanData.latitude || null,
        longitude: salesmanData.longitude || null
      };

      const formDataToSend = new FormData();
      Object.keys(usersData).forEach(key => {
        if (usersData[key] !== undefined && usersData[key] !== null && usersData[key] !== '') {
          formDataToSend.append(key, usersData[key]);
        }
      });

      if (newProfilePhoto) {
        formDataToSend.append('profile_photo', newProfilePhoto);
      }

      const response = await fetch(`${baseURL2}/api/users`, {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, userId: result.id };
      } else {
        const errorData = await response.json();
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
          Swal.fire({ icon: 'error', title: 'Duplicate Entry', text: 'This mobile number is already associated with another entry.' });
          setIsSaving(false);
          return;
        }
      }

      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (newProfilePhoto) {
        formDataToSend.append("profile_photo", newProfilePhoto);
      }

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
        throw new Error(errorData.message || "Failed to save salesman");
      }

      const result = await response.json();
      const generatedAccountId = result.account_id || id;

      if (!id) {
        const salesmanDataForUsers = {
          account_name: formData.account_name,
          email: formData.email,
          mobile: formData.mobile,
          birthday: formData.birthday,
          anniversary: formData.anniversary,
          state: formData.state,
          city: formData.city,
          district: formData.district,
          pincode: formData.pincode,
          company_name: formData.company_name,
          password: formData.password,
          duty_start_time: formData.duty_start_time,
          duty_end_time: formData.duty_end_time,
          gender: formData.gender,
          designation: formData.designation,
          country: formData.country,
        };

        await storeInUsersDB(salesmanDataForUsers, generatedAccountId);
      }

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: id ? 'Salesman updated successfully!' : 'Salesman created successfully!',
        confirmButtonColor: '#a36e29',
      }).then(() => {
        navigate("/salesmantable");
      });

    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || "An error occurred while processing the request.",
        confirmButtonColor: '#a36e29',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate("/salesmantable");
  };

  return (
    <div className="main-container">
      <div className="salesman-master-container">
        <h2>{id ? 'Edit Salesman' : 'Add Salesman'}</h2>
        <form className="salesman-master-form" onSubmit={handleSubmit}>
          <Row>
            {/* Personal Information */}
            <Col md={6}>
              <InputField
                label="Salesman Name"
                name="account_name"
                value={formData.account_name}
                onChange={handleChange}
                required
                placeholder="Enter salesman name"
              />
            </Col>
            <Col md={6}>
              <InputField
                label="Print Name"
                name="print_name"
                value={formData.print_name}
                onChange={handleChange}
                required
                placeholder="Enter print name"
              />
            </Col>

            <Col md={4}>
              <InputField
                label="Date of Birth"
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleChange}
                placeholder="mm/dd/yyyy"
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Date of Anniversary"
                name="anniversary"
                type="date"
                value={formData.anniversary}
                onChange={handleChange}
                placeholder="mm/dd/yyyy"
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Religion"
                name="religion"
                type="select"
                value={formData.religion}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select" },
                  { value: "Hinduism", label: "Hinduism" },
                  { value: "Islam", label: "Islam" },
                  { value: "Christianity", label: "Christianity" },
                  { value: "Sikhism", label: "Sikhism" },
                  { value: "Others", label: "Others" },
                ]}
              />
            </Col>

            {/* Gender Field */}
            <Col md={12}>
              <div className="gender-field">
                <label className="input-label">Gender *</label>
                <div className="gender-options">
                  <label className="gender-option">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === "male"}
                      onChange={handleChange}
                    />
                    Male
                  </label>
                  <label className="gender-option">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === "female"}
                      onChange={handleChange}
                    />
                    Female
                  </label>
                </div>
              </div>
            </Col>

            <Col md={4}>
              <InputField
                label="Country *"
                name="country"
                type="select"
                value={formData.country}
                onChange={handleChange}
                required
                options={[
                  { value: "India", label: "India" },
                  { value: "Albania", label: "Albania" },
                  { value: "Algeria", label: "Algeria" },
                  { value: "American Samoa", label: "American Samoa" },
                  { value: "Andorra", label: "Andorra" },
                ]}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="State *"
                name="state"
                type="select"
                value={formData.state}
                onChange={handleChange}
                required
                options={[{ value: "", label: "Select state" }, ...allStates.map(state => ({
                  value: state,
                  label: state
                }))]}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="District *"
                name="district"
                type="select"
                value={formData.district}
                onChange={handleChange}
                required
                options={[{ value: "", label: "Select district" }, ...availableDistricts.map(district => ({
                  value: district,
                  label: district
                }))]}
              />
            </Col>

            <Col md={4}>
              <InputField
                label="City *"
                name="city"
                type="select"
                value={formData.city}
                onChange={handleChange}
                required
                options={[{ value: "", label: "Select city" }, ...availableCities.map(city => ({
                  value: city,
                  label: city
                }))]}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Pincode *"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                placeholder="Enter pincode"
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </Col>

            <Col md={6}>
              <InputField
                label="Mobile *"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
              />
            </Col>
            <Col md={6}>
              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </Col>

            <Col md={4}>
              <InputField
                label="Designation *"
                name="designation"
                type="select"
                value={formData.designation}
                onChange={handleChange}
                required
                options={[
                  { value: "", label: "Select Designation" },
                  { value: "Director", label: "Director" },
                  { value: "Managing Director", label: "Managing Director" },
                  { value: "CEO", label: "CEO" },
                  { value: "General Manager", label: "General Manager" },
                  { value: "Proprietor", label: "Proprietor" },
                  { value: "Partner", label: "Partner" },
                  { value: "CFO", label: "CFO" },
                  { value: "Purchase Manager", label: "Purchase Manager" },
                  { value: "Purchase Head", label: "Purchase Head" },
                  { value: "Salesman", label: "Salesman" },
                  { value: "Other", label: "Other" },
                ]}
              />
            </Col>

            <Col md={8}>
              <InputField
                label="Company Name *"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                placeholder="Enter Company Name"
              />
            </Col>

            {/* Password Fields */}
            <Col md={6}>
              <div className="password-field-wrapper">
                <InputField
                  label="Password *"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required={!id}
                  placeholder="********"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </Col>
            <Col md={6}>
              <div className="password-field-wrapper">
                <InputField
                  label="Confirm Password *"
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required={!id}
                  placeholder="Enter your confirm password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </Col>

            {/* Duty Hours */}
            <Col md={12}>
              <div className="duty-hours-section">
                <label className="input-label">Duty Hours *</label>
                <Row>
                  <Col md={6}>
                    <InputField
                      label="Start Time *"
                      name="duty_start_time"
                      type="time"
                      value={formData.duty_start_time}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <InputField
                      label="End Time *"
                      name="duty_end_time"
                      type="time"
                      value={formData.duty_end_time}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                </Row>
              </div>
            </Col>

            {/* Profile Photo Section */}
            <Col md={12}>
              <div className="profile-photo-section">
                <label className="input-label">
                  Profile Photo * <span className="required-star">*</span>
                  <span className="mandatory-text">(Mandatory)</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                  accept="image/*"
                />

                <div className="profile-photo-actions">
                  <button
                    type="button"
                    className="photo-upload-btn"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <FaUpload /> Upload Photo
                  </button>
                  <button
                    type="button"
                    className="photo-capture-btn"
                    onClick={startCamera}
                  >
                    <FaCamera /> Take Photo
                  </button>
                </div>

                {showWebcam && (
                  <div className="webcam-container">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      width={320}
                      height={240}
                      videoConstraints={{ facingMode: "user" }}
                    />
                    <div className="webcam-actions">
                      <Button variant="success" onClick={captureImage} className="me-2">
                        Capture
                      </Button>
                      <Button variant="danger" onClick={() => setShowWebcam(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {imagePreview && (
                  <div className="profile-photo-preview">
                    <div className="photo-preview-wrapper">
                      <img src={imagePreview} alt="Profile Preview" />
                      <button
                        type="button"
                        className="remove-photo-btn"
                        onClick={removeImage}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}

                {!imagePreview && !id && (
                  <div className="photo-required-text">
                    * Please upload or capture a profile photo
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <div className="form-actions">
            <button
              type="button"
              className="back-btn"
              onClick={handleBack}
            >
              Close
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Salesman_Master;