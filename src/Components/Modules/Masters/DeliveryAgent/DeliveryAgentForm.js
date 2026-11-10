// DeliveryAgentForm.js  (Logistic Partner Form)
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { FaUpload, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import InputField from '../../../Pages/InputField/InputField';
import './DeliveryAgent.css';
import baseURL from '../../../../Url/NodeBaseURL';

const SERVICE_TYPES = ['Express', 'Standard', 'Same Day'];

const initialForm = {
  full_name: '',
  partner_type: '',
  contact_person: '',
  mobile_number: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  serviceable_areas: '',
  service_type: [],            // array in UI, comma-joined on save
  tracking_url_template: '',
  insurance_available: 'No',
  max_declared_value: '',
  status: 'Active',
};

function DeliveryAgentForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState(initialForm);
  const [partnerCode, setPartnerCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);
  const [newLogo, setNewLogo] = useState(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const fileInputRef = useRef(null);

  // Load partner when editing
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await fetch(`${baseURL}/get/delivery-agents/${id}`);
        if (!res.ok) throw new Error('Not found');
        const r = await res.json();
        setPartnerCode(r.agent_code);
        setFormData({
          full_name: r.full_name || '',
          partner_type: r.partner_type || '',
          contact_person: r.contact_person || '',
          mobile_number: r.mobile_number || '',
          email: r.email || '',
          address: r.address || '',
          city: r.city || '',
          state: r.state || '',
          pincode: r.pincode || '',
          serviceable_areas: r.serviceable_areas || '',
          service_type: r.service_type ? r.service_type.split(',') : [],
          tracking_url_template: r.tracking_url_template || '',
          insurance_available: r.insurance_available || 'No',
          max_declared_value: r.max_declared_value ?? '',
          status: r.status || 'Active',
        });
        if (r.profile_photo) setImagePreview(`${baseURL}${r.profile_photo}`);
      } catch (err) {
        console.error('Error fetching logistic partner:', err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not load logistic partner.', confirmButtonColor: '#a36e29' })
          .then(() => navigate('/deliveryagenttable'));
      }
    };
    load();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;

    switch (name) {
      case 'full_name':
        v = value.toUpperCase();
        break;
      case 'mobile_number':
        v = value.replace(/\D/g, '').slice(0, 10);
        break;
      case 'pincode':
        v = value.replace(/\D/g, '').slice(0, 6);
        break;
      case 'max_declared_value':
        v = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        break;
      default:
        break;
    }
    setFormData((prev) => ({ ...prev, [name]: v }));
  };

  const toggleServiceType = (type) => {
    setFormData((prev) => ({
      ...prev,
      service_type: prev.service_type.includes(type)
        ? prev.service_type.filter((t) => t !== type)
        : [...prev.service_type, type],
    }));
  };

  const fail = (text) => {
    Swal.fire({ icon: 'error', title: 'Validation Error', text, confirmButtonColor: '#a36e29' });
    return false;
  };

  const validateForm = () => {
    const f = formData;
    if (!f.full_name.trim()) return fail('Partner name is required.');
    if (!f.partner_type) return fail('Select a partner type.');
    if (!f.contact_person.trim()) return fail('Contact person is required.');
    if (!f.mobile_number) return fail('Mobile number is required.');
    if (f.mobile_number.length !== 10) return fail('Mobile number must be exactly 10 digits.');
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return fail('Email is not valid.');
    if (!f.address.trim()) return fail('Address is required.');
    if (!f.city.trim()) return fail('City is required.');
    if (!f.state.trim()) return fail('State is required.');
    if (!f.pincode || f.pincode.length !== 6) return fail('Pincode must be exactly 6 digits.');
    if (!f.serviceable_areas.trim()) return fail('Serviceable areas are required.');
    if (f.service_type.length === 0) return fail('Select at least one service type.');
    if (f.tracking_url_template) {
      if (!/^https?:\/\/\S+$/i.test(f.tracking_url_template)) return fail('Tracking URL must start with http:// or https://');
      if (!f.tracking_url_template.includes('{awb}')) return fail('Tracking URL must contain the {awb} placeholder.');
    }
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
    setNewLogo(file);
    setLogoRemoved(false);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setNewLogo(null);
    setLogoRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const body = new FormData();
      Object.keys(formData).forEach((key) => {
        const val = key === 'service_type' ? formData.service_type.join(',') : formData[key];
        body.append(key, val ?? '');
      });
      if (newLogo) body.append('profile_photo', newLogo);
      if (id && logoRemoved && !newLogo) body.append('remove_photo', 'true');
      if (!id) body.append('created_by', localStorage.getItem('userId') || '');

      const res = await fetch(
        id ? `${baseURL}/edit/delivery-agents/${id}` : `${baseURL}/delivery-agents`,
        { method: id ? 'PUT' : 'POST', body }
      );
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || 'Failed to save logistic partner');

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: id
          ? 'Logistic partner updated successfully!'
          : `Logistic partner created successfully! Partner code: ${result.agent_code}`,
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

  return (
    <div className="main-container">
      <div className="da-master-container">
        <h2>{id ? `Edit Logistic Partner${partnerCode ? ` (${partnerCode})` : ''}` : 'Add Logistic Partner'}</h2>

        <form className="da-master-form" onSubmit={handleSubmit}>
          {/* Basic information */}
          <div className="da-section-title">Basic information</div>
          <Row>
            <Col md={6}>
              <InputField label="Partner Name *" name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="e.g. BLUE DART" />
            </Col>
            <Col md={3}>
              <InputField
                label="Partner Type *"
                name="partner_type"
                type="select"
                value={formData.partner_type}
                onChange={handleChange}
                required
                options={[
                  { value: '', label: 'Select type' },
                  { value: 'Courier', label: 'Courier' },
                  { value: 'Transport', label: 'Transport' },
                  { value: '3PL', label: '3PL' },
                  { value: 'Local Delivery', label: 'Local Delivery' },
                ]}
              />
            </Col>
            <Col md={3}>
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

          {/* Contact */}
          <div className="da-section-title">Contact details</div>
          <Row>
            <Col md={4}>
              <InputField label="Contact Person *" name="contact_person" value={formData.contact_person} onChange={handleChange} required placeholder="Primary contact name" />
            </Col>
            <Col md={4}>
              <InputField label="Mobile *" name="mobile_number" value={formData.mobile_number} onChange={handleChange} required placeholder="10-digit mobile number" />
            </Col>
            <Col md={4}>
              <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter email" />
            </Col>
          </Row>

          {/* Address */}
          <div className="da-section-title">Address</div>
          <Row>
            <Col md={12}>
              <label className="input-label">Address *</label>
              <textarea
                className="form-control da-textarea"
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="Office address"
                required
              />
            </Col>
            <Col md={4} className="mt-3">
              <InputField label="City *" name="city" value={formData.city} onChange={handleChange} required placeholder="Enter city" />
            </Col>
            <Col md={4} className="mt-3">
              <InputField label="State *" name="state" value={formData.state} onChange={handleChange} required placeholder="Enter state" />
            </Col>
            <Col md={4} className="mt-3">
              <InputField label="Pincode *" name="pincode" value={formData.pincode} onChange={handleChange} required placeholder="6-digit pincode" />
            </Col>
          </Row>

          {/* Service coverage */}
          <div className="da-section-title">Service coverage</div>
          <Row>
            <Col md={6}>
              <InputField
                label="Serviceable Areas *"
                name="serviceable_areas"
                value={formData.serviceable_areas}
                onChange={handleChange}
                required
                placeholder="Comma separated, e.g. Hyderabad, Andhra Pradesh, Pan India"
              />
            </Col>
            <Col md={6}>
              <label className="input-label">Service Type *</label>
              <div className="da-checkbox-group">
                {SERVICE_TYPES.map((t) => (
                  <label key={t} className="da-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.service_type.includes(t)}
                      onChange={() => toggleServiceType(t)}
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </Col>
            <Col md={12} className="mt-3">
              <InputField
                label="Tracking URL Template"
                name="tracking_url_template"
                value={formData.tracking_url_template}
                onChange={handleChange}
                placeholder="https://track.example.com/?awb={awb}"
              />
            </Col>
          </Row>

          {/* Insurance (jewellery) */}
          <div className="da-section-title">Insurance</div>
          <Row>
            <Col md={6}>
              <InputField
                label="Insurance Available"
                name="insurance_available"
                type="select"
                value={formData.insurance_available}
                onChange={handleChange}
                options={[
                  { value: 'No', label: 'No' },
                  { value: 'Yes', label: 'Yes' },
                ]}
              />
            </Col>
            <Col md={6}>
              <InputField
                label="Max Declared Value (₹)"
                name="max_declared_value"
                value={formData.max_declared_value}
                onChange={handleChange}
                placeholder="Maximum insured value per shipment"
              />
            </Col>
          </Row>

          {/* Logo */}
          <div className="da-section-title">Partner logo</div>
          <div className="da-photo-section">
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} accept="image/*" />
            <button type="button" className="da-upload-btn" onClick={() => fileInputRef.current.click()}>
              <FaUpload /> Upload logo
            </button>
            <span className="da-optional-text">Optional, up to 5 MB</span>

            {imagePreview && (
              <div className="da-photo-preview">
                <img src={imagePreview} alt="Logo preview" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                <button type="button" className="da-remove-photo-btn" onClick={removeImage} aria-label="Remove logo">
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