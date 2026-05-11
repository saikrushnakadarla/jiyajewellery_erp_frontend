import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout'; // Reusable DataTable component
import { Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import './PurchaseTable.css';
import baseURL from '../../../../Url/NodeBaseURL'; // Update with your base URL setup
import TagEntry from "./TagEntry";
import UpdatePurchaseForm from "./UpdatePurchaseForm";
import { Modal } from "react-bootstrap";

const PurchaseTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // State to store fetched table data
  const [loading, setLoading] = useState(false); // Loading state for delete actions
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openUpdateShow, setOpenUpdateShow] = useState(false); // State for the update modal
  const [selectedRow, setSelectedRow] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false); // State for update modal
  const location = useLocation();
  const { mobile } = location.state || {};
  const initialSearchValue = location.state?.mobile || '';

  useEffect(() => {
    if (mobile) {
      console.log("Selected Mobile from Dashboard:", mobile);
    }
  }, [mobile]);

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

  // Separate function to open the update modal
  const handleOpenUpdateModal = (data) => {
    setSelectedProduct(data);
    setShowUpdateModal(true); // Show update modal
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedProduct(null);
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Sr. No.',
        Cell: ({ row }) => row.index + 1, // Generate a sequential number based on the row index
      },
      { Header: 'Name', accessor: 'account_name' },
      { Header: 'Mobile', accessor: 'mobile' },
      { Header: 'Invoice', accessor: 'invoice' },
      { Header: 'Date', accessor: 'date', Cell: ({ value }) => <span>{formatDate(value)}</span> },
      { Header: 'Category', accessor: 'category' },
      { Header: 'Pcs', accessor: 'pcs' },
      { Header: 'Gross Wt', accessor: 'gross_weight' },
      { Header: 'Purity', accessor: 'purity' },
      { Header: 'Pure Wt', accessor: 'pure_weight' },
      { Header: 'Rate', accessor: 'rate' },
      {
        Header: 'Tot Wt / Amt',
        accessor: row => ` ${row.total_pure_wt} / ${row.total_amount}`
      },
      // { 
      //   Header: 'Paid Wt / Amt', 
      //   accessor: row => ` ${row.paid_pure_weight} / ${row.paid_amount}`
      // }, 
      // { 
      //   Header: 'Bal Wt / Amt', 
      //   accessor: row => ` ${row.balance_pure_weight} / ${row.balance_amount}`
      // }, 

      {
        Header: 'Paid Wt / Amt',
        accessor: 'paid_amount',
        Cell: ({ row }) => {
          const paid_amount = Number(row.original.paid_amount) || 0;
          const paid_amt = Number(row.original.paid_amt) || 0;
          const paid_pure_weight = Number(row.original.paid_pure_weight) || 0;
          const paid_wt = Number(row.original.paid_wt) || 0;

          const final_paid_wt = (paid_pure_weight + paid_wt).toFixed(3);
          return `${final_paid_wt} / ${paid_amount + paid_amt}`;
        },
      },

      {
        Header: 'Bal Wt / Amt',
        accessor: 'balance_amount',
        Cell: ({ row }) => {
          const balance_amount = Number(row.original.balance_amount) || 0;
          const balance_after_receipt = Number(row.original.balance_after_receipt) || 0;
          const paid_amt = Number(row.original.paid_amt) || 0;
          const balance_pure_weight = Number(row.original.balance_pure_weight) || 0;
          const balWt_after_payment = Number(row.original.balWt_after_payment) || 0;
          const paid_wt = Number(row.original.paid_wt) || 0;

          const final_balance_amount =
            balance_amount === paid_amt ? balance_after_receipt : balance_after_receipt || balance_amount || '-';

          const final_balance_wt =
            (balance_pure_weight === paid_wt ? balWt_after_payment : balWt_after_payment || balance_pure_weight || 0).toFixed(3);

          return `${final_balance_wt} / ${final_balance_amount}`;
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
                fontSize: '0.875rem', // Smaller font size
                padding: '0.25rem 0.5rem', // Reduced padding
              }}
              onClick={() => handleOpenModal(row.original)} // Pass entire row data
            >
              Tag Entry
            </button>
            <FaEdit
              style={{ cursor: 'pointer', color: 'blue' }}
              onClick={() => handleOpenUpdateModal(row.original)} // Use the new function for update
            />
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
        Header: "Payments",
        accessor: "payment",
        Cell: ({ row }) => {
          const { total_amount, paid_amount, paid_amt, total_pure_wt, paid_pure_weight, paid_wt } = row.original;
      
          // Ensure all values are treated as numbers
          const totalPaid = (Number(paid_amount) || 0) + (Number(paid_amt) || 0);
          const totalAmount = Number(total_amount) || 0;
          const totalPaidWt = (Number(paid_pure_weight) || 0) + (Number(paid_wt) || 0);
          const totalWt = Number(total_pure_wt) || 0;
      
          return (
            <Button
              style={{
                backgroundColor: "#28a745",
                borderColor: "#28a745",
                fontSize: "0.875rem",
                padding: "0.25rem 0.5rem",
              }}
              onClick={() => handleAddReceipt(row.original)}
              disabled={totalWt === totalPaidWt} // Disable if both amounts or weights are fully paid
            >
              Add Payment
            </Button>
          );
        },
      }
      

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
        <DataTable columns={columns} data={[...data].reverse()} initialSearchValue={initialSearchValue} />
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
      {/* Separate modal for update */}
      <Modal show={showUpdateModal} onHide={handleCloseUpdateModal} size="lg" backdrop="static" keyboard={false} dialogClassName="custom-tagentrymodal-width">
        <Modal.Header closeButton>
          <Modal.Title>Update Purchase</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ marginTop: '-90px' }}>
          {selectedProduct && (
            <UpdatePurchaseForm selectedProduct={selectedProduct} handleCloseModal={handleCloseUpdateModal} />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PurchaseTable;
