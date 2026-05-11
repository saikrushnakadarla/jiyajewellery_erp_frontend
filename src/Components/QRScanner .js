import React, { useState, useRef, useEffect } from 'react';

const AutoFocusForm = () => {
  const [formData, setFormData] = useState({
    field1: '',
    field2Option: '',
    field3: '',
    field4Option: '',
    field5: '',
    field6Option: '',
    field7: ''
  });

  // Refs for each input field
  const field1Ref = useRef(null);
  const field4Ref = useRef(null);
  const field7Ref = useRef(null);

  // Initially focus the first field
  useEffect(() => {
    field1Ref.current.focus();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check if a dropdown was changed and focus next field accordingly
    if (name === 'field2Option' && value) {
      setTimeout(() => field4Ref.current.focus(), 0);
    } else if (name === 'field4Option' && value) {
      setTimeout(() => field7Ref.current.focus(), 0);
    }
  };

  return (
    <div className="form-container">
      <h2>Conditional Autofocus Form</h2>
      <form>
        {/* First section */}
        <div className="form-group">
          <label>Field 1:</label>
          <input
            type="text"
            name="field1"
            value={formData.field1}
            onChange={handleChange}
            ref={field1Ref}
          />
        </div>

        <div className="form-group">
          <label>Field 2 (Dropdown):</label>
          <select
            name="field2Option"
            value={formData.field2Option}
            onChange={handleChange}
          >
            <option value="">Select an option</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </div>

        <div className="form-group">
          <label>Field 3:</label>
          <input
            type="text"
            name="field3"
            value={formData.field3}
            onChange={handleChange}
          />
        </div>

        {/* Second section (fields 4-6) */}
        <div className="form-group">
          <label>Field 4:</label>
          <input
            type="text"
            name="field4"
            value={formData.field4}
            onChange={handleChange}
            ref={field4Ref}
          />
        </div>

        <div className="form-group">
          <label>Field 5 (Dropdown):</label>
          <select
            name="field4Option"
            value={formData.field4Option}
            onChange={handleChange}
          >
            <option value="">Select an option</option>
            <option value="optionA">Option A</option>
            <option value="optionB">Option B</option>
            <option value="optionC">Option C</option>
          </select>
        </div>

        <div className="form-group">
          <label>Field 6:</label>
          <input
            type="text"
            name="field6"
            value={formData.field6}
            onChange={handleChange}
          />
        </div>

        {/* Third section (field 7) */}
        <div className="form-group">
          <label>Field 7:</label>
          <input
            type="text"
            name="field7"
            value={formData.field7}
            onChange={handleChange}
            ref={field7Ref}
          />
        </div>
      </form>
    </div>
  );
};

export default AutoFocusForm;