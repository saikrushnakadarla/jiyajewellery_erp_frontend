import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/DataTable';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Button, Row, Col, Modal, Table } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../../Url/NodeBaseURL';
// import './SalesReport.css';

const ItemSale = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [repairDetails, setRepairDetails] = useState(null);

  // Columns for the DataTable
const columns = React.useMemo(
  () => [
    {
      Header: 'Sr. No.',
      Cell: ({ row }) => row.index + 1,
    },
    {
      Header: 'Category',
      accessor: 'category',
    },
    {
      Header: 'Sub Category',
      accessor: 'sub_category',
    },
    {
      Header: 'Metal Type',
      accessor: 'metal_type',
    },
    {
      Header: 'Design Name',
      accessor: 'design_name',
    },
    // {
    //   Header: 'Date',
    //   accessor: 'date',
    //   Cell: ({ value }) => formatDate(value),
    // },
    // {
    //   Header: 'Mobile Number',
    //   accessor: 'mobile',
    // },
    {
      Header: 'Invoice No.',
      accessor: 'invoice_number',
    },
    {
      Header: 'Account Name',
      accessor: 'account_name',
    },
    {
      Header: 'Total Amt',
      accessor: 'net_amount',
      Cell: ({ value }) => value || 0
    },
    {
      Header: 'Old Amt',
      accessor: 'old_exchange_amt',
      Cell: ({ value }) => value || 0
    },
    {
      Header: 'Scheme Amt',
      accessor: 'scheme_amt',
      Cell: ({ value }) => value || 0
    },
    {
      Header: 'Net Amt',
      accessor: 'net_bill_amount',
      Cell: ({ value }) => value || 0
    },
    {
      Header: 'Paid Amt',
      accessor: 'paid_amt',
      Cell: ({ row }) => {
        const paid_amt = Number(row.original.paid_amt) || 0;
        const receipts_amt = Number(row.original.receipts_amt) || 0;
        return (paid_amt + receipts_amt).toFixed(2);
      },
    },
    {
      Header: 'Bal Amt',
      accessor: 'bal_amt',
      Cell: ({ row }) => {
        const bal_amt = Number(row.original.bal_amt) || 0;
        const bal_after_receipts = Number(row.original.bal_after_receipts) || 0;
        const receipts_amt = Number(row.original.receipts_amt) || 0;
        let finalBalance = bal_amt === receipts_amt
          ? bal_after_receipts || 0
          : bal_after_receipts ? bal_after_receipts : bal_amt || 0;
        return finalBalance.toFixed(2);
      },
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <div>
          <FaEye
            style={{ cursor: 'pointer', marginLeft: '10px', color: 'green' }}
            onClick={() => handleViewDetails(row.original.invoice_number)}
          />
        </div>
      ),
    },
  ],
  []
);


  // Function to format date in Indian format (DD-MM-YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${date.getFullYear()}`;
  };

  // Fetch unique repair details from the API
  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await axios.get(`${baseURL}/get-unique-repair-details`);

        // Filter the data based on the 'transaction_status' column
        const filteredData = response.data.filter(
           (item) => item.transaction_status === 'Sales' || item.transaction_status === "ConvertedInvoice"
        );

        setData(filteredData); // Set the filtered data
        setLoading(false);
      } catch (error) {
        console.error('Error fetching repair details:', error);
        setLoading(false);
      }
    };

    fetchRepairs();
  }, []);

  const handleEdit = (id) => {
    navigate(`/repairs/edit/${id}`);
  };

  const handleDelete = (id) => {
    console.log('Delete record with id:', id);
  };

  const handleCreate = () => {
    navigate('/sales');
  };

  // Fetch and show repair details in modal
  const handleViewDetails = async (invoice_number) => {
    try {
      const response = await axios.get(`${baseURL}/get-repair-details/${invoice_number}`);
      setRepairDetails(response.data);
      setShowModal(true); // Show the modal with repair details
    } catch (error) {
      console.error('Error fetching repair details:', error);
    }
  };

  // Close the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setRepairDetails(null); // Clear repair details on modal close
  };

  return (
    <div className="main-container">
      <div className="payments-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Item Sales Report</h3>
            {/* <Button
              className="create_but"
              onClick={handleCreate}
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
            >
              + Create
            </Button> */}
          </Col>
        </Row>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <DataTable columns={columns} data={[...data].reverse()} />
        )}
      </div>

      {/* Modal to display repair details */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" className='m-auto'>
        <Modal.Header closeButton>
          <Modal.Title>Sales Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize:'13px' }}>
          {repairDetails && (
            <>
              <h5>Customer Info</h5>
              <Table bordered>
                <tbody>
                  <tr>
                    <td>Customer ID</td>
                    <td>{repairDetails.uniqueData.customer_id}</td>
                  </tr>
                  <tr>
                    <td>Mobile</td>
                    <td>{repairDetails.uniqueData.mobile}</td>
                  </tr>
                  <tr>
                    <td>Account Name</td>
                    <td>{repairDetails.uniqueData.account_name}</td>
                  </tr>
                  <tr>
                    <td>Email</td>
                    <td>{repairDetails.uniqueData.email}</td>
                  </tr>
                  <tr>
                    <td>Address</td>
                    <td>{repairDetails.uniqueData.address1}</td>
                  </tr>
                  <tr>
                    <td>Invoice Number</td>
                    <td>{repairDetails.uniqueData.invoice_number}</td>
                  </tr>
                  <tr>
                    <td>Total Amount</td>
                    <td>{repairDetails.uniqueData.net_amount}</td>
                  </tr>
                </tbody>
              </Table>

              <h5>Products</h5>
              <div className="table-responsive">
                <Table bordered>
                  <thead style={{ whiteSpace: 'nowrap', fontSize:'13px' }}>
                    <tr>
                      <th>BarCode</th>
                      <th>Product Name</th>
                      <th>Metal</th>
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
                  <tbody style={{ whiteSpace: 'nowrap', fontSize:'13px' }}>
                    {repairDetails.repeatedData.map((product, index) => (
                      <tr key={index}>
                        <td>{product.code}</td>
                        <td>{product.product_name}</td>
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
                    <tr style={{ fontWeight: 'bold' }}>
                      <td colSpan="11" className="text-end">
                        Total Amount
                      </td>
                      <td>{repairDetails.uniqueData.net_amount}</td>
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

export default ItemSale;
