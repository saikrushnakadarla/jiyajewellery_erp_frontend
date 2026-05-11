import React from 'react';
import { Button } from 'react-bootstrap';

const FormButtons = ({ handleBack }) => {
  return (
    <div className="form-buttons">
      <Button type="submit" variant="success" style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>Save</Button>
      <Button variant="secondary" onClick={handleBack} style={{ backgroundColor: 'gray', marginRight: '10px' }}>
        Cancel
      </Button>
    </div>
  );
};

export default FormButtons;