// DeliveryAgentForm.js
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { FaUpload, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import InputField from '../../../Pages/InputField/InputField';
import './DeliveryAgent.css';
import baseURL from '../../../../Url/NodeBaseURL';

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

const isValidDateYear = (value) => {
  if (!value) return true;
  const [yearPart] = value.split('-');
  if (!/^\d{1,4}$/.test(yearPart)) return false;
  const yearNum = Number(yearPart);
  if (yearPart.length === 4 && (yearNum < MIN_YEAR || yearNum > MAX_YEAR)) return false;
  return true;
};

const initialForm = {
  full_name: '',
  mobile_number: '',
  alternate_number: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  joining_date: '',
  employee_type: 'Permanent',
  id_proof_type: '',
  id_proof_number: '',
  emergency_contact_name: '',
  emergency_contact_number: '',
  status: 'Active',
};

function DeliveryAgentForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState(initialForm);
  const [agentCode, setAgentCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);
  const [newProfilePhoto, setNewProfilePhoto] = useState(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const fileInputRef = useRef(null);

  // Load agent when editing
  useEffect(() => {
    if (!id) return;
    const loadAgent = async () => {
      try {
        const res = await fetch(`${baseURL}/get/delivery-agents/${id}`);
        if (!res.ok) throw new Error('Not found');
        const r = await res.json();
        setAgentCode(r.agent_code);
        setFormData({
          full_name: r.full_name || '',
          mobile_number: r.mobile_number || '',
          alternate_number: r.alternate_number || '',
          email: r.email || '',
          address: r.address || '',
          city: r.city || '',
          state: r.state || '',
          pincode: r.pincode || '',
          joining_date: r.joining_date || '',
          employee_type: r.employee_type || 'Permanent',
          id_proof_type: r.id_proof_type || '',
          id_proof_number: r.id_proof_number || '',
          emergency_contact_name: r.emergency_contact_name || '',
          emergency_contact_number: r.emergency_contact_number || '',
          status: r.status || 'Active',
        });
        if (r.profile_photo) setImagePreview(`${baseURL}${r.profile_photo}`);
      } catch (err) {
        console.error('Error fetching delivery agent:', err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not load delivery agent.', confirmButtonColor: '#a36e29' })
          .then(() => navigate('/deliveryagenttable'));
      }
    };
    loadAgent();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;

    switch (name) {
      case 'full_name':
        v = value.toUpperCase();
        break;
      case 'mobile_number':
      case 'alternate_number':
      case 'emergency_contact_number':
        v = value.replace(/\D/g, '').slice(0, 10);
        break;
      case 'pincode':
        v = value.replace(/\D/g, '').slice(0, 6);
        break;
      case 'joining_date':
        if (!isValidDateYear(value)) return;
        break;
      case 'id_proof_type':
        // changing the type invalidates the old number
        setFormData((prev) => ({ ...prev, id_proof_type: value, id_proof_number: '' }));
        return;
      case 'id_proof_number':
        if (formData.id_proof_type === 'Aadhaar') v = value.replace(/\D/g, '').slice(0, 12);
        else if (formData.id_proof_type === 'PAN') v = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
        else v = value.slice(0, 30);
        break;
      default:
        break;
    }
    setFormData((prev) => ({ ...prev, [name]: v }));
  };

  const fail = (text) => {
    Swal.fire({ icon: 'error', title: 'Validation Error', text, confirmButtonColor: '#a36e29' });
    return false;
  };

  const validateForm = () => {
    const f = formData;
    if (!f.full_name.trim()) return fail('Agent name is required.');
    if (!f.mobile_number) return fail('Mobile number is required.');
    if (f.mobile_number.length !== 10) return fail('Mobile number must be exactly 10 digits.');
    if (f.alternate_number && f.alternate_number.length !== 10) return fail('Alternate number must be exactly 10 digits.');
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return fail('Email is not valid.');
    if (f.pincode && f.pincode.length !== 6) return fail('Pincode must be exactly 6 digits.');
    if (!f.joining_date) return fail('Joining date is required.');
    if (!isValidDateYear(f.joining_date)) return fail('Joining date year must be between 1900 and 2100.');
    if (f.id_proof_number && !f.id_proof_type) return fail('Select an ID proof type.');
    if (f.id_proof_type === 'Aadhaar' && f.id_proof_number && f.id_proof_number.length !== 12) return fail('Aadhaar must be 12 digits.');
    if (f.id_proof_type === 'PAN' && f.id_proof_number && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(f.id_proof_number)) return fail('PAN format is invalid (e.g. ABCDE1234F).');
    if (f.emergency_contact_number && f.emergency_contact_number.length !== 10) return fail('Emergency contact must be exactly 10 digits.');
    return true;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'File Too Large', text: 'File size must be under 5MB.', confirmButtonColor: '#a36e29' });
      return;
    }
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      Swal.fire({ icon: 'error', title: 'Invalid File Type', text: 'Please select a valid image file.', confirmButtonColor: '#a36e29' });
      return;
    }
    setNewProfilePhoto(file);
    setPhotoRemoved(false);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setNewProfilePhoto(null);
    setPhotoRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const body = new FormData();
      Object.keys(formData).forEach((key) => body.append(key, formData[key] ?? ''));
      if (newProfilePhoto) body.append('profile_photo', newProfilePhoto);
      if (id && photoRemoved && !newProfilePhoto) body.append('remove_photo', 'true');
      if (!id) body.append('created_by', localStorage.getItem('userId') || '');

      const res = await fetch(
        id ? `${baseURL}/edit/delivery-agents/${id}` : `${baseURL}/delivery-agents`,
        { method: id ? 'PUT' : 'POST', body }
      );
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || 'Failed to save delivery agent');

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: id
          ? 'Delivery agent updated successfully!'
          : `Delivery agent created successfully! Agent code: ${result.agent_code}`,
        confirmButtonColor: '#a36e29',
      });
      navigate('/deliveryagenttable');
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'An error occurred.', confirmButtonColor: '#a36e29' });
    } finally {
      setIsSaving(false);
    }
  };

  const idProofPlaceholder =
    formData.id_proof_type === 'Aadhaar' ? '12-digit Aadhaar number'
    : formData.id_proof_type === 'PAN' ? 'e.g. ABCDE1234F'
    : 'Enter ID number';

  return (
    <div className="main-container">
      <div className="da-master-container">
        <h2>{id ? `Edit Delivery Agent${agentCode ? ` (${agentCode})` : ''}` : 'Add Delivery Agent'}</h2>

        <form className="da-master-form" onSubmit={handleSubmit}>
          {/* Basic information */}
          <div className="da-section-title">Basic information</div>
          <Row>
            <Col md={6}>
              <InputField label="Agent Name *" name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="Enter agent name" />
            </Col>
            <Col md={6}>
              <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter email" />
            </Col>
            <Col md={6}>
              <InputField label="Mobile *" name="mobile_number" value={formData.mobile_number} onChange={handleChange} required placeholder="10-digit mobile number" />
            </Col>
            <Col md={6}>
              <InputField label="Alternate Number" name="alternate_number" value={formData.alternate_number} onChange={handleChange} placeholder="Optional" />
            </Col>
            <Col md={12}>
              <label className="input-label">Address</label>
              <textarea
                className="form-control da-textarea"
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="Residential address"
              />
            </Col>
            <Col md={4} className="mt-3">
              <InputField label="City" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" />
            </Col>
            <Col md={4} className="mt-3">
              <InputField label="State" name="state" value={formData.state} onChange={handleChange} placeholder="Enter state" />
            </Col>
            <Col md={4} className="mt-3">
              <InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="6-digit pincode" />
            </Col>
          </Row>

          {/* Employment information */}
          <div className="da-section-title">Employment</div>
          <Row>
            <Col md={4}>
              <InputField
                label="Joining Date *"
                name="joining_date"
                type="date"
                value={formData.joining_date}
                onChange={handleChange}
                min={`${MIN_YEAR}-01-01`}
                max={`${MAX_YEAR}-12-31`}
                required
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Employee Type"
                name="employee_type"
                type="select"
                value={formData.employee_type}
                onChange={handleChange}
                options={[
                  { value: 'Permanent', label: 'Permanent' },
                  { value: 'Temporary', label: 'Temporary' },
                  { value: 'Contract', label: 'Contract' },
                ]}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="ID Proof Type"
                name="id_proof_type"
                type="select"
                value={formData.id_proof_type}
                onChange={handleChange}
                options={[
                  { value: '', label: 'None' },
                  { value: 'Aadhaar', label: 'Aadhaar' },
                  { value: 'PAN', label: 'PAN' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="ID Proof Number"
                name="id_proof_number"
                value={formData.id_proof_number}
                onChange={handleChange}
                placeholder={idProofPlaceholder}
              />
            </Col>
            <Col md={4}>
              <InputField
                label="Status"
                name="status"
                type="select"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
              />
            </Col>
          </Row>

          {/* Emergency contact */}
          <div className="da-section-title">Emergency contact</div>
          <Row>
            <Col md={6}>
              <InputField label="Contact Name" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} placeholder="Name of contact person" />
            </Col>
            <Col md={6}>
              <InputField label="Contact Number" name="emergency_contact_number" value={formData.emergency_contact_number} onChange={handleChange} placeholder="10-digit number" />
            </Col>
          </Row>

          {/* Profile photo */}
          <div className="da-section-title">Profile photo</div>
          <div className="da-photo-section">
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} accept="image/*" />
            <button type="button" className="da-upload-btn" onClick={() => fileInputRef.current.click()}>
              <FaUpload /> Upload photo
            </button>
            <span className="da-optional-text">Optional, up to 5 MB</span>

            {imagePreview && (
              <div className="da-photo-preview">
                <img src={imagePreview} alt="Profile preview" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                <button type="button" className="da-remove-photo-btn" onClick={removeImage} aria-label="Remove photo">
                  <FaTrash />
                </button>
              </div>
            )}
          </div>

          <div className="da-form-actions">
            <button type="button" className="da-back-btn" onClick={() => navigate('/deliveryagenttable')}>Close</button>
            <button type="submit" className="da-save-btn" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeliveryAgentForm;