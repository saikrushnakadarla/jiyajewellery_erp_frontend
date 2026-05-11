import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import baseURL from "../../../../Url/NodeBaseURL";

const RepairDetails = () => {
  const { invoice_number } = useParams(); // Get the invoice_number from the URL
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch repair details based on the invoice_number
  useEffect(() => {
    const fetchRepairDetails = async () => {
      try {
        const response = await axios.get(`${baseURL}/get-repair-details/${invoice_number}`);
        setRepair(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching repair details:', error);
        setLoading(false);
      }
    };

    fetchRepairDetails();
  }, [invoice_number]); // Re-run effect if invoice_number changes

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {repair && (
        <Modal show={true} onHide={() => window.history.back()}>
          <Modal.Header closeButton>
            <Modal.Title>Repair Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <p><strong>Date:</strong> {repair.date}</p>
              <p><strong>Invoice Number:</strong> {repair.invoice_number}</p>
              <p><strong>Account Name:</strong> {repair.account_name}</p>
              <p><strong>Total Amount:</strong> {repair.net_amount}</p>
              <p><strong>Paid Amount:</strong> {repair.paid_amount}</p>
              <p><strong>Description:</strong> {repair.description}</p>
              {/* Add other fields as needed */}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => window.history.back()}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default RepairDetails;
