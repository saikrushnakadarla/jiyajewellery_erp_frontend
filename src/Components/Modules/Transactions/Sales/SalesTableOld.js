import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Row, Col, Modal, Table } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../../Url/NodeBaseURL';
import { AuthContext } from "../../../Pages/Login/Context";
import Swal from 'sweetalert2';

const RepairsTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [repairDetails, setRepairDetails] = useState(null);
  const { authToken, userId, userName, role } = useContext(AuthContext);
  // Extract mobile from location state
  const { mobile } = location.state || {};
  const initialSearchValue = location.state?.mobile || '';

  const getTabId = () => {
    // First try to get from URL
    const urlParams = new URLSearchParams(window.location.search);
    let tabId = urlParams.get('tabId');

    // If not in URL, try sessionStorage
    if (!tabId) {
      tabId = sessionStorage.getItem('tabId');
    }

    // If still not found, generate new ID
    if (!tabId) {
      tabId = crypto.randomUUID();
      sessionStorage.setItem('tabId', tabId);

      // Update URL without page reload
      const newUrl = `${window.location.pathname}?tabId=${tabId}`;
      window.history.replaceState({}, '', newUrl);
    }

    return tabId;
  };

  const tabId = getTabId();

  useEffect(() => {
    if (mobile) {
      console.log('Selected Mobile from Dashboard:', mobile);
    }
  }, [mobile]);

  const columns = React.useMemo(
    () => [
      {
        Header: 'SI',
        Cell: ({ row }) => row.index + 1, // Generate a sequential number based on the row index
      },
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }) => formatDate(value), // Format date value
      },
      {
        Header: 'Mobile',
        accessor: 'mobile',
      },
      {
        Header: 'Account',
        accessor: 'account_name',
      },
      {
        Header: 'Invoice No',
        accessor: 'invoice_number',
      },
      {
        Header: 'Order No',
        accessor: 'order_number',
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
        Header: 'SaleReturn Amt',
        accessor: 'sale_return_amt',
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
          const totalPaid = (paid_amt + receipts_amt).toFixed(2);
          return totalPaid;
        },
      },
      {
        Header: 'Bal Amt',
        accessor: 'bal_amt',
        Cell: ({ row }) => {
          const bal_amt = Number(row.original.bal_amt) || 0;
          const bal_after_receipts = Number(row.original.bal_after_receipts) || 0;
          const receipts_amt = Number(row.original.receipts_amt) || 0;
          let finalBalance;
          if (bal_amt === receipts_amt) {
            finalBalance = bal_after_receipts || 0;
          } else {
            finalBalance = bal_after_receipts ? bal_after_receipts : bal_amt || 0;
          }
          return finalBalance.toFixed(2);
        },
      },

      {
        Header: "Invoice",
        Cell: ({ row }) =>
          // row.original.invoice_generated === "Yes" && row.original.invoice_number ? (
          <a
            href={`${baseURL}/invoices/${row.original.invoice_number}.pdf`} // Fetch from backend
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            📝 View
          </a>
        //   ) : (
        //     "Not Available"
        //   ),
        // id: "invoice",
      },
      // {
      //   Header: 'Status',
      //   accessor: 'status',
      //   Cell: ({ row }) => {
      //     const { net_bill_amount, paid_amt, receipts_amt } = row.original;

      //     const totalPaid = Number(paid_amt) + Number(receipts_amt);
      //     const netBill = Number(net_bill_amount);

      //     return (
      //       <span style={{  color: netBill === totalPaid ? 'green' : 'red' }}>
      //         {netBill === totalPaid ? 'Delivered' : 'Not Delivered'}
      //       </span>
      //     );
      //   },
      // },
      {
        Header: 'Receipts',
        accessor: 'receipts',
        Cell: ({ row }) => {
          const { net_bill_amount, paid_amt, receipts_amt, transaction_status } = row.original;

          // Ensure numerical calculations are performed correctly
          const totalPaid = Number(paid_amt) + Number(receipts_amt);
          const netBill = Number(net_bill_amount);

          return (
            <Button
              style={{
                backgroundColor: '#28a745',
                borderColor: '#28a745',
                fontSize: '0.800rem', // Smaller font size
                padding: '0.10rem 0.5rem', // Reduced padding
              }}
              onClick={() => handleAddReceipt(row.original)} // Pass row data to handle receipt creation
              disabled={netBill === totalPaid} // Disable if transaction_status is ConvertedInvoice or netBill equals totalPaid
            >
              Add Receipt
            </Button>
          );
        },
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => {
          const isDisabled = row.original.invoice === "Converted";
          const isAdmin = userName === "ADMIN"; // Check if user is ADMIN
          const isToday = isCurrentDate(row.original.date);

          return (
            <div>
              <FaEye
                style={{ cursor: 'pointer', marginLeft: '10px', color: 'green' }}
                onClick={() => handleViewDetails(row.original.invoice_number)}
              />
              {/* Edit icon (only for ADMIN) */}
              {isAdmin && (
                <FaEdit
                  style={{
                    cursor: 'pointer',
                    marginLeft: '10px',
                    color: 'blue',
                    color: isToday ? 'blue' : 'gray',
                  }}
                  onClick={() => {
                    if (isToday) {
                      handleEdit(
                        row.original.invoice_number,
                        row.original.mobile,
                        row.original.cash_amount,
                        row.original.card_amt,
                        row.original.chq_amt,
                        row.original.online_amt
                      );
                    }
                  }}
                />
              )}
              {/* <FaEdit
                style={{
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  marginLeft: '10px',
                  color: isDisabled ? 'gray' : 'blue',
                }}
                onClick={() => {
                  if (!isDisabled) {
                    handleEdit(
                      row.original.invoice_number,
                      row.original.mobile,
                      row.original.old_exchange_amt,
                      row.original.scheme_amt,
                      row.original.cash_amount,
                      row.original.card_amt,
                      row.original.chq_amt,
                      row.original.online_amt
                    );
                  }
                }}
              /> */}
              {/* Delete Icon - Disabled if isDisabled is true */}
              {/* <FaTrash
                style={{
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  marginLeft: '10px',
                  color: isDisabled ? 'gray' : 'red',
                }}
                onClick={() => {
                  if (!isDisabled) {
                    handleDelete(row.original.invoice_number);
                  }
                }}
              /> */}
              {/* Delete icon (only for ADMIN) */}
              {isAdmin && (
                <FaTrash
                  style={{
                    cursor: 'pointer',
                    marginLeft: '10px',
                    color: 'red',
                    color: isToday ? 'red' : 'gray',
                  }}
                  onClick={() => {
                    if (isToday) {
                      handleDelete(row.original.invoice_number);
                    }
                  }}
                />
              )}
            </div>
          );
        },
      },

    ],
    []
  );

  function isCurrentDate(dateString) {
    const today = new Date();
    const date = new Date(dateString);

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  const handleEdit = async (
    invoice_number,
    mobile,
    cash_amount,
    card_amt,
    chq_amt,
    online_amt
  ) => {

    console.log("cash_amount=", cash_amount)
    console.log("card_amt=", card_amt)
    console.log("chq_amt=", chq_amt)
    console.log("online_amt=", online_amt)
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

    const tabId = crypto.randomUUID();

    if (result.isConfirmed) {
      try {
        // Fetch repair details
        const repairResponse = await axios.get(`${baseURL}/get-repair-details/${invoice_number}`);
        const repairDetails = repairResponse.data;

        if (!repairDetails || !repairDetails.repeatedData) {
          console.error('No repeatedData found in response:', repairDetails);
          Swal.fire('Error', 'No repair details found for the provided invoice number.', 'error');
          return;
        }

        // Filter repeatedData to include only items with specific transaction statuses
        const filteredRepairData = repairDetails.repeatedData.filter(
          (item) => item.transaction_status === "Sales" || item.transaction_status === "ConvertedInvoice" || item.transaction_status === "ConvertedRepairInvoice"
        );

        if (filteredRepairData.length === 0) {
          Swal.fire('No data', 'No records found with the required transaction status.', 'info');
          return;
        }

        // Check if order_number exists; otherwise, use invoice_number
        const order_number = filteredRepairData[0]?.order_number || invoice_number;

        // Fetch old items details using order_number if available; otherwise, use invoice_number
        const oldItemsResponse = await axios.get(`${baseURL}/get/olditems/${order_number}`);
        const oldItemsDetails = oldItemsResponse.data;

        // Retrieve existing data from localStorage
        const existingDetails = JSON.parse(localStorage.getItem(`repairDetails_${tabId}`)) || [];
        const existingOldItems = JSON.parse(localStorage.getItem(`oldTableData_${tabId}`)) || [];

        // Get today's date in yyyy-mm-dd format
        const today = new Date().toISOString().split('T')[0];

        // Update repair and old items details with today's date
        const formattedRepairDetails = filteredRepairData.map((item) => ({
          ...item,
          date: today,
          invoice_number,
        }));

        const formattedOldItems = oldItemsDetails.map((item) => ({
          ...item,
          date: today,
          invoice_number,
        }));

        // Combine and store updated details
        const updatedRepairDetails = [...existingDetails, ...formattedRepairDetails];
        const updatedOldItems = [...existingOldItems, ...formattedOldItems];

        localStorage.setItem(`repairDetails_${tabId}`, JSON.stringify(updatedRepairDetails));
        localStorage.setItem(`oldTableData_${tabId}`, JSON.stringify(updatedOldItems));

        const paymentDetails = {
          cash_amount: parseFloat(cash_amount) || 0,
          card_amt: parseFloat(card_amt) || 0,
          chq_amt: parseFloat(chq_amt) || 0,
          online_amt: parseFloat(online_amt) || 0,
        };

        console.log("Storing paymentDetails to localStorage:", paymentDetails);

        localStorage.setItem(`paymentDetails_${tabId}`, JSON.stringify(paymentDetails));


        // **Set discount percentage in localStorage**
        if (updatedRepairDetails.length > 0 && updatedRepairDetails[0].disscount_percentage) {
          localStorage.setItem(`discount_${tabId}`, updatedRepairDetails[0].disscount_percentage);

        }

        // Navigate to the sales page
        navigate(`/sales?tabId=${tabId}`, {
          state: {
            invoice_number,
            mobile,
            cash_amount,
            card_amt,
            chq_amt,
            online_amt,
            repairDetails: updatedRepairDetails, // Ensure the repair details are passed
          },
        });

        // Call handleDelete without confirmation
        // await handleDelete(invoice_number, true, true);
      } catch (error) {
        console.error('Error fetching details:', error);
        Swal.fire('Error', 'Unable to fetch repair or old item details. Please try again.', 'error');
      }
    } else {
      Swal.fire('Cancelled', 'Edit operation was cancelled.', 'info');
    }
  };

  const handleDelete = async (invoiceNumber, skipConfirmation = false, skipMessage = false) => {
    if (skipConfirmation) {
      try {
        const response = await axios.delete(
          `${baseURL}/repair-details/${invoiceNumber}`,
          { params: { skipMessage } } // Pass skipMessage as a query parameter
        );
        if (response.status === 200 || response.status === 204) {
          if (!skipMessage) {
            Swal.fire('Deleted!', response.data.message, 'success');
          }
          setData((prevData) => prevData.filter((item) => item.invoice_number !== invoiceNumber));
        }
      } catch (error) {
        console.error('Error deleting repair details:', error);
        Swal.fire('Error!', 'Failed to delete repair details. Please try again.', 'error');
      }
    } else {
      // Show the confirmation alert
      Swal.fire({
        title: 'Are you sure?',
        text: `Do you really want to delete invoice ${invoiceNumber}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await axios.delete(`${baseURL}/repair-details/${invoiceNumber}`);
            if (response.status === 200) {
              Swal.fire('Deleted!', response.data.message, 'success');
              // Update the table data by removing the deleted record
              setData((prevData) => prevData.filter((item) => item.invoice_number !== invoiceNumber));
            }
          } catch (error) {
            console.error('Error deleting repair details:', error);
            Swal.fire('Error!', 'Failed to delete repair details. Please try again.', 'error');
          }
        }
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${date.getFullYear()}`;
  };
  const handleCreate = () => {
    // Generate a new tab ID or use existing one if available
    const tabId = crypto.randomUUID();

    // Navigate to sales page with the tabId
    navigate(`/sales?tabId=${tabId}`);
  };

  const fetchRepairs = async () => {
    try {
      const response = await axios.get(`${baseURL}/get-unique-repair-details`);
      console.log("Full response data: ", response.data);

      // Filter out only 'Sales' items
      const filteredData = response.data.filter(
        (item) => item.transaction_status === 'Sales' || item.transaction_status === "ConvertedInvoice" || item.transaction_status === "ConvertedRepairInvoice"
      );
      console.log("Filtered Orders: ", filteredData);

      // Set the filtered data
      setData(filteredData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching repair details:', error);
      setLoading(false);
    }
  };

  const handleViewDetails = async (invoice_number) => {
    try {
      const response = await axios.get(`${baseURL}/get-repair-details/${invoice_number}`);
      console.log("Fetched order details: ", response.data);

      // Filter repeatedData to include only 'Sales' or 'ConvertedInvoice'
      const filteredData = response.data.repeatedData.filter(
        (item) => item.transaction_status === "Sales" || item.transaction_status === "ConvertedInvoice" || item.transaction_status === "ConvertedRepairInvoice"
      );

      // Check if any item in repeatedData has invoice === "Converted"
      const isInvoiceConverted = filteredData.some(item => item.invoice === "Converted");
      console.log("isInvoiceConverted=", isInvoiceConverted)

      // Set repair details with filtered data and conversion status
      setRepairDetails({
        ...response.data,
        repeatedData: filteredData,
        isInvoiceConverted,
      });

      setShowModal(true);
    } catch (error) {
      console.error("Error fetching repair details:", error);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  // const handleAddReceipt = (invoiceData) => {
  //   navigate("/receipts", { state: { from: "/salestable", invoiceData } });
  // };
  const handleAddReceipt = (invoiceData) => {
    navigate("/receipts", {
      state: {
        from: "/salestable",
        invoiceData: {
          ...invoiceData, // Spread all existing invoice data
          mobile: invoiceData.mobile // Ensure mobile is included
        }
      }
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setRepairDetails(null); // Clear repair details on modal close
  };

  return (
    <div className="main-container">
      <div className="sales-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Sales</h3>
            <Button
              className="create_but"
              onClick={handleCreate}
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
            >
              + Create
            </Button>
          </Col>
        </Row>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <DataTable columns={columns} data={[...data].reverse()} initialSearchValue={initialSearchValue} />
        )}
      </div>

      {/* Modal to display repair details */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" className="m-auto">
        <Modal.Header closeButton>
          <Modal.Title>Sales Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: '13px' }}>
          {repairDetails && (
            <>
              <h5>Customer Info</h5>
              <Table bordered>
                <tbody>
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
                  <thead style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                    <tr>
                      <th>Bar Code</th>
                      <th>Product Name</th>
                      <th>Metal</th>
                      <th>Purity</th>
                      <th>Gross Wt</th>
                      <th>Stone Wt</th>
                      <th>W.Wt</th>
                      <th>Total Wt</th>
                      <th>MC</th>
                      <th>Rate / Piece Cost</th>
                      <th>Tax Amt</th>
                      {/* <th>Status</th> */}
                      <th>Sale Status</th>
                      <th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                    {repairDetails.repeatedData.map((product, index) => (
                      <tr key={index}>
                        <td>{product.code}</td>
                        <td>{product.product_name}</td>
                        <td>{product.metal_type}</td>
                        <td>{product.selling_purity}</td>
                        <td>{product.gross_weight}</td>
                        <td>{product.stone_weight}</td>
                        <td>{product.wastage_weight}</td>
                        <td>{product.total_weight_av}</td>
                        <td>{product.making_charges}</td>
                        <td>{product.pieace_cost ? product.pieace_cost : product.rate}</td>
                        <td>{product.tax_amt}</td>
                        {/* <td>{product.transaction_status}</td> */}
                        <td>{product.sale_status}</td>
                        <td>{product.total_price}</td>

                      </tr>
                    ))}
                    <tr style={{ fontWeight: 'bold' }}>
                      <td colSpan="12" className="text-end">
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

export default RepairsTable;
