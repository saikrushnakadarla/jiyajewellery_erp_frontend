import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout'; // Reusable DataTable component
import { Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import './PurchaseTable.css';
import baseURL from '../../../../Url/NodeBaseURL'; // Update with your base URL setup
import TagEntry from "./TagEntry";
import { Modal } from "react-bootstrap";

const PurchaseTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // State to store fetched table data
  const [loading, setLoading] = useState(false); // Loading state for delete actions
 const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Function to format date to DD/MM/YYYY
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

// Function to handle delete request
const handleDelete = async (id) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this purchase?');
  if (!confirmDelete) return;

  setLoading(true);

  try {
    const response = await fetch(`${baseURL}/delete-purchases/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message || 'Purchase deleted successfully');
      // Remove the deleted item from the state
      setData((prevData) => prevData.filter((item) => item.id !== id));
    } else {
      console.error('Error deleting purchase:', result.message);
      alert(result.message || 'Failed to delete purchase');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong while deleting the purchase');
  } finally {
    setLoading(false);
  }
};

const handleOpenModal = (data) => {
  setSelectedProduct(data);
  setShowModal(true);
};


  const columns = React.useMemo(
    () => [
      { Header: 'Sr.No', accessor: 'id' },
      { Header: 'Name', accessor: 'account_name' },
      { Header: 'Mobile', accessor: 'mobile' },
      { Header: 'Invoice', accessor: 'invoice' },
      { Header: 'Date', accessor: 'date', Cell: ({ value }) => <span>{formatDate(value)}</span> },
      { Header: 'Category', accessor: 'category' },
      { Header: 'Pcs', accessor: 'pcs' },
      { Header: 'Gross Wt', accessor: 'gross_weight' },
      { Header: 'Purity', accessor: 'purity' },
      { Header: 'Pure Wt', accessor: 'pure_weight' },
      { Header: 'Tot Amt / Wt', accessor: 'total_amount' },
      { 
        Header: 'Paid Amt / Wt', 
        accessor: 'paid_amount',
        Cell: ({ row }) => {
          const { paid_amount, paid_amt } = row.original;
          const totalPaid = (paid_amount || 0) + (paid_amt || 0);
          return totalPaid;
        },
      },
      { 
        Header: 'Bal Amt / Wt', 
        accessor: 'balance_amount',
        Cell: ({ row }) => {
          const { balance_amount, balance_after_receipt, paid_amt } = row.original;
          if (balance_amount === paid_amt) {
            return balance_after_receipt ;
          }
          return balance_after_receipt ? balance_after_receipt : balance_amount || '-';
        },
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                backgroundColor: '#a36e29',
                borderColor: '#a36e29',
                width: '102px',
                fontSize: '0.875rem',
              }}
              onClick={() => handleOpenModal(row.original)} // Pass entire row data
            >
              Tag Entry
            </button>
            <FaTrash
              style={{
                cursor: 'pointer',
                color: 'red',
              }}
              onClick={() => handleDelete(row.original.id)}
              disabled={loading}
            />
          </div>
        ),
      },
      
      {
        Header: 'Payments',
        accessor: 'payment',
        Cell: ({ row }) => {
          const { total_amount, paid_amount, paid_amt } = row.original;
          const totalPaid = (paid_amount || 0) + (paid_amt || 0);
  
          return (
            <Button
            style={{
              backgroundColor: '#28a745',
              borderColor: '#28a745',
              fontSize: '0.875rem', // Smaller font size
              padding: '0.25rem 0.5rem', // Reduced padding
            }}
              onClick={() => handleAddReceipt(row.original)}
              disabled={total_amount === totalPaid} // Disable button if total_amount equals totalPaid
            >
              Add Payment
            </Button>
          );
        },
      },
    ],
    [loading]
  );
  

  const handleAddReceipt = (invoiceData) => {
    console.log("Invoice Data:", invoiceData);
    navigate("/payments", { state: { from: "/purchasetable", invoiceData } });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get/purchases`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
  
        if (Array.isArray(result)) {
          setData(result); // Update state if the result is an array
        } else {
          console.error('API response is not an array:', result);
          alert('Unexpected data format from the server.');
        }
      } catch (error) {
        console.error('Error fetching purchases:', error);
        alert('Failed to fetch data. Please try again later.');
      }
    };
  
    fetchData();
  }, []);
  

  // Handle navigation to the Create Purchase page
  const handleCreate = () => {
    navigate('/purchase'); // Update with your correct route
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };


  return (
    <div className="main-container">
      <div className="purchase-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Purchases</h3>
            <Button
              className="create_but"
              onClick={handleCreate}
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
            >
              + Create
            </Button>
          </Col>
        </Row>
        <DataTable columns={columns} data={[...data].reverse()} />
      </div>
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        backdrop="static"
        keyboard={false}
        dialogClassName="custom-tagentrymodal-width"
      >
        <Modal.Header closeButton>
          <Modal.Title>Tag Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <TagEntry
              handleCloseTagModal={handleCloseModal}
              selectedProduct={selectedProduct}
            />
          )}
        </Modal.Body>

      </Modal>
    </div>
  );
};

export default PurchaseTable;
