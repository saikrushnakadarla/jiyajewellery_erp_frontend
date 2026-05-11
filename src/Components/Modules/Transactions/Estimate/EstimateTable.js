import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Button, Row, Col, Modal, Table } from 'react-bootstrap';
import DataTable from '../../../Pages/InputField/TableLayout'; // Import the DataTable component
import baseURL from "../../../../Url/NodeBaseURL";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const RepairsTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // State to store table data
  const [loading, setLoading] = useState(true); // Loading state
  const [repairDetails, setRepairDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);


  const fetchData = async () => {
    try {
      const response = await axios.get(`${baseURL}/get-unique-estimates`);

      // Filter the data based on the 'transaction_status' column
      const filteredData = response.data

      setData(filteredData); // Set the filtered data
      setLoading(false);
    } catch (error) {
      console.error('Error fetching estimate details:', error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (date) => {
    if (!date) return ''; // Return an empty string if no date is provided

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');  // Pad single digit days with 0
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Pad months with 0
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };


  const columns = React.useMemo(
    () => [
      {
        Header: 'Sr. No.',
        Cell: ({ row }) => row.index + 1, // Generate a sequential number based on the row index
      },
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }) => {
          const date = new Date(value);
          return date.toLocaleDateString('en-GB'); // en-GB for dd/mm/yyyy format
        },
      },
      {
        Header: 'Estimate Number',
        accessor: 'estimate_number',
      },
      {
        Header: 'Product Name',
        accessor: 'sub_category',
      },
      {
        Header: 'Total Amount',
        accessor: 'net_amount',
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => (
          <div style={{ display: 'flex', gap: '10px' }}>
            <FaEye
              style={{ cursor: 'pointer', color: 'green' }}
              onClick={() => handleViewDetails(row.original.estimate_number)} // Pass estimate_number
            />
            <FaEdit
              style={{
                cursor: 'pointer',
                marginLeft: '10px',
                color: 'blue',
              }}
              onClick={() => handleEdit(row.original.estimate_number,
                row.original.mobile,
              )}
            />
            <FaTrash
              style={{ cursor: 'pointer', color: 'red' }}
              onClick={() => handleDelete(row.original.estimate_number)} // Pass estimate_number
            />
          </div>
        ),
      },
    ],
    []
  );

  const handleEdit = async (
    estimate_number,
    mobile,
  ) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to edit this record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, go ahead!',
      cancelButtonText: 'No, cancel',
    });

    if (result.isConfirmed) {
      try {
        // Fetch estimate details
        const response = await axios.get(`${baseURL}/get-estimates/${estimate_number}`);
        const details = response.data;

        // Verify if the API returned data
        if (!details || !details.repeatedData) {
          console.error('No repeatedData found in response:', details);
          Swal.fire('Error', 'No estimate details found for the provided estimate number.', 'error');
          return;
        }

        // Retrieve existing estimate details from localStorage or set to an empty array if not available
        const existingDetails = JSON.parse(localStorage.getItem('estimateDetails')) || [];


        // Get today's date in yyyy-mm-dd format
        const today = new Date().toISOString().split('T')[0];

        // Update repeatedData with today's date
        const formattedDetails = details.repeatedData.map((item) => ({
          ...item,
          date: today,
          estimate_number, // Ensure the estimate_number is explicitly included
        }));
        // Combine existing details with the new ones
        const updatedDetails = [...existingDetails, ...formattedDetails];

        // Save updated details back to localStorage
        localStorage.setItem('estimateDetails', JSON.stringify(updatedDetails));

        console.log('Updated estimate details added to localStorage:', updatedDetails);

        if (updatedDetails.length > 0 && updatedDetails[0].disscount_percentage) {
          localStorage.setItem('estimateDiscount', updatedDetails[0].disscount_percentage);
         
        }

        // Navigate to the sales page with state
        navigate('/estimates', {
          state: {
            estimate_number,
            mobile,
            entries: details,
          },
        });

        // Call handleDelete without confirmation
        // await handleDelete(estimate_number, true, true);
      } catch (error) {
        console.error('Error fetching estimate details:', error);
        Swal.fire('Error', 'Unable to fetch estimate details. Please try again.', 'error');
      }
    } else {
      Swal.fire('Cancelled', 'Edit operation was cancelled.', 'info');
    }
  };

  const handleDelete = async (estimateNumber) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete order ${estimateNumber}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${baseURL}/delete/estimate/${estimateNumber}`, {
            method: 'DELETE',
          });
  
          if (!response.ok) {
            throw new Error('Failed to delete estimate');
          }
          fetchData();
          Swal.fire('Deleted!','The estimate has been deleted.', 'success');
        } catch (error) {
          console.error('Error deleting estimate:', error.message);
          Swal.fire('Error!','Failed to delete the estimate.','error');
        }
      }
    });
  };
  
  const handleViewDetails = async (estimate_number) => {
    try {
      const response = await axios.get(`${baseURL}/get-estimates/${estimate_number}`);
      setRepairDetails(response.data);
      setShowModal(true); // Show the modal with estimate details
    } catch (error) {
      console.error('Error fetching estimate details:', error);
    }
  };

  // Close the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setRepairDetails(null); // Clear estimate details on modal close
  };

  const handleCreate = () => {
    navigate('/estimates'); // Navigate to the /suppliers page
  };

  return (
    <div className="main-container">
      <div className="sales-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Estimates</h3>
            <Button className='create_but' onClick={handleCreate} style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>
              + Create
            </Button>
          </Col>
        </Row>
        {loading ? (
          <p>Loading...</p> // Show loading message while fetching data
        ) : (
          <DataTable columns={columns} data={[...data].reverse()} /> // Render the table
        )}
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="xl" className="m-auto">
        <Modal.Header closeButton>
          <Modal.Title>Estimate Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {repairDetails && (
            <>
              <Table bordered>
                <tbody>
                  <tr>
                    <td>Date</td>
                    <td>{formatDate(repairDetails.uniqueData.date)}</td>
                  </tr>
                  <tr>
                    <td>Invoice Number</td>
                    <td>{repairDetails.uniqueData.estimate_number}</td>
                  </tr>
                  <tr>
                    <td>Total Amount</td>
                    <td>{repairDetails.uniqueData.total_amount}</td>
                  </tr>
                </tbody>
              </Table>

              <h5>Products</h5>

              {/* Make table scrollable when columns are too many */}
              <div className="table-responsive">
                <Table bordered>
                  <thead style={{ whiteSpace: 'nowrap' }}>
                    <tr>
                      <th>BarCode</th>
                      <th>Product Name</th>
                      <th>Metal Type</th>
                      <th>Purity</th>
                      <th>Gross Wt</th>
                      <th>Stone Wt</th>
                      <th>W.Wt</th>
                      <th>Total Wt</th>
                      <th>MC</th>
                      <th>Rate</th>
                      <th>Tax Amt</th>
                      <th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody style={{ whiteSpace: 'nowrap' }}>
                    {repairDetails.repeatedData.map((product, index) => (
                      <tr key={index}>
                        <td>{product.code}</td>
                        <td>{product.sub_category}</td>
                        <td>{product.metal_type}</td>
                        <td>{product.purity}</td>
                        <td>{product.gross_weight}</td>
                        <td>{product.stone_weight}</td>
                        <td>{product.wastage_weight}</td>
                        <td>{product.total_weight_av}</td>
                        <td>{product.making_charges}</td>
                        <td>{product.rate}</td>
                        <td>{product.tax_amt}</td>
                        <td>{product.total_price}</td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: "bold" }}>
                      <td colSpan="11" className="text-end">
                        Total Amount
                      </td>
                      <td>{repairDetails.uniqueData.total_amount}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default RepairsTable;
