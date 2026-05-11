import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Button, Row, Col, Modal, Table } from 'react-bootstrap';
import DataTable from '../../../Pages/InputField/TableLayout';
import baseURL from "../../../../Url/NodeBaseURL";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Ledger.css';

function Ledger() {
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState([]);
  const [receiptsData, setReceiptsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [accountDetails, setAccountDetails] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  // Function to fetch account details for a specific account ID
  const fetchAccountDetails = async (accountId) => {
    if (!accountId || accountDetails[accountId]) return accountDetails[accountId];
    
    try {
      const response = await axios.get(`${baseURL}/get/account-details/${accountId}`);
      console.log(`Account details for ID ${accountId}:`, response.data);
      
      if (response.data && response.data.account_name) {
        const accountName = response.data.account_name;
        setAccountDetails(prev => ({
          ...prev,
          [accountId]: accountName
        }));
        return accountName;
      }
      return `Account ${accountId}`;
    } catch (error) {
      console.error(`Error fetching account details for ID ${accountId}:`, error);
      return `Account ${accountId}`;
    }
  };

  // Function to fetch all account details in parallel
  const fetchAllAccountDetails = async (accountIds) => {
    const uniqueIds = [...new Set(accountIds.filter(id => id && !accountDetails[id]))];
    
    if (uniqueIds.length === 0) return;
    
    try {
      const promises = uniqueIds.map(id => 
        axios.get(`${baseURL}/get/account-details/${id}`)
          .then(response => ({ id, name: response.data?.account_name || `Account ${id}` }))
          .catch(error => {
            console.error(`Error fetching account ${id}:`, error);
            return { id, name: `Account ${id}` };
          })
      );
      
      const results = await Promise.all(promises);
      
      const newAccountDetails = {};
      results.forEach(result => {
        newAccountDetails[result.id] = result.name;
      });
      
      setAccountDetails(prev => ({
        ...prev,
        ...newAccountDetails
      }));
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
  };

const fetchData = async () => {
  setLoading(true);
  try {
    // Fetch ledger data
    const response = await axios.get(`${baseURL}/ledger/`);
    console.log('Ledger response:', response.data);
    
    // Fetch all account details in one API call
    const accountResponse = await axios.get(`${baseURL}/get/account-details`);
    const accountsList = accountResponse.data;
    console.log('All accounts:', accountsList);
    
    // Create a mapping object for account_id to account_name
    const accountNameMap = {};
    accountsList.forEach(account => {
      accountNameMap[account.account_id] = account.account_name;
    });
    console.log('Account name mapping:', accountNameMap);
    
    // Filter data for Sales table - only transaction_type === 'SALE'
    const saleData = response.data.filter(item => item.transaction_type === 'SALE');
    console.log('Sales data (transaction_type = SALE):', saleData);
    
    // Filter data for Receipts table - transaction_type === 'RECEIPT' or 'PAYMENT' or 'CREDIT'
    const receiptData = response.data.filter(item => 
      item.transaction_type === 'RECEIPT' || 
      item.transaction_type === 'PAYMENT' || 
      item.transaction_type === 'CREDIT'
    );
    console.log('Receipts data:', receiptData);
    
    // Map the Sales data to include account_name
    const mappedSaleData = saleData.map(item => ({
      ...item,
      credit: parseFloat(item.credit) || 0,
      debit: parseFloat(item.debit) || 0,
      balance: parseFloat(item.balance) || 0,
      net_wt: parseFloat(item.net_wt) || 0,
      gross_wt: parseFloat(item.gross_wt) || 0,
      amount: parseFloat(item.amount) || 0,
      account_name: accountNameMap[item.account_id] || `Account ${item.account_id}`
    }));
    
    // Map the Receipts data to include account_name
    const mappedReceiptData = receiptData.map(item => ({
      ...item,
      credit: parseFloat(item.credit) || 0,
      debit: parseFloat(item.debit) || 0,
      balance: parseFloat(item.balance) || 0,
      net_wt: parseFloat(item.net_wt) || 0,
      gross_wt: parseFloat(item.gross_wt) || 0,
      amount: parseFloat(item.amount) || 0,
      account_name: accountNameMap[item.account_id] || `Account ${item.account_id}`
    }));
    
    console.log('Mapped sales data:', mappedSaleData);
    console.log('Mapped receipts data:', mappedReceiptData);
    
    setInvoiceData(mappedSaleData);
    setReceiptsData(mappedReceiptData);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching ledger data:', error);
    Swal.fire('Error!', 'Failed to fetch ledger data. Please check your API connection.', 'error');
    setLoading(false);
  }
};

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

// Columns for Sales table (with Credit column showing '-' instead of 0)
const salesColumns = React.useMemo(() => [
  {
    Header: 'Sr. No.',
    Cell: ({ row }) => row.index + 1,
  },
  {
    Header: 'Date',
    accessor: 'transaction_date',
    Cell: ({ value }) => formatDate(value),
  },
  {
    Header: 'Invoice',
    accessor: 'invoice_number',
  },
  {
    Header: 'Name',
    accessor: 'account_name',
  },
  {
    Header: 'Credit (₹)',
    accessor: 'credit',
    Cell: ({ value }) => {
      const numValue = parseFloat(value) || 0;
      return numValue === 0 ? '-' : `₹ ${numValue.toLocaleString('en-IN')}`;
    },
  },
  {
    Header: 'Debit (₹)',
    accessor: 'debit',
    Cell: ({ value }) => `₹ ${(parseFloat(value) || 0).toLocaleString('en-IN')}`,
  },
  {
    Header: 'Balance (₹)',
    accessor: 'balance',
    Cell: ({ value }) => `₹ ${(parseFloat(value) || 0).toLocaleString('en-IN')}`,
  },
], [accountDetails]);

// Columns for Receipts table (with Debit column showing '-' instead of 0)
const receiptsColumns = React.useMemo(() => [
  {
    Header: 'Sr. No.',
    Cell: ({ row }) => row.index + 1,
  },
  {
    Header: 'Date',
    accessor: 'transaction_date',
    Cell: ({ value }) => formatDate(value),
  },
  {
    Header: 'Receipt',
    accessor: 'invoice_number',
  },
  {
    Header: 'Name',
    accessor: 'account_name',
  },
  {
    Header: 'Transaction Type',
    accessor: 'transaction_type',
  },
  {
    Header: 'Credit (₹)',
    accessor: 'credit',
    Cell: ({ value }) => `₹ ${(parseFloat(value) || 0).toLocaleString('en-IN')}`,
  },
  {
    Header: 'Debit (₹)',
    accessor: 'debit',
    Cell: ({ value }) => {
      const numValue = parseFloat(value) || 0;
      return numValue === 0 ? '-' : `₹ ${numValue.toLocaleString('en-IN')}`;
    },
  },
  {
    Header: 'Balance (₹)',
    accessor: 'balance',
    Cell: ({ value }) => `₹ ${(parseFloat(value) || 0).toLocaleString('en-IN')}`,
  },
], [accountDetails]);

  const handleViewDetails = async (item, type) => {
    let accountName = item.account_name;
    if (item.account_id && (!accountName || accountName === `Account ${item.account_id}`)) {
      accountName = await fetchAccountDetails(item.account_id);
      item.account_name = accountName;
    }
    setSelectedDetails(item);
    setModalType(type);
    setShowModal(true);
  };

  const handleEdit = async (item, type) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to edit this ${type}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, go ahead!',
      cancelButtonText: 'No, cancel',
    });

    if (result.isConfirmed) {
      navigate(`/${type}/edit/${item.id}`, {
        state: { data: item }
      });
    }
  };

  const handleDelete = async (item, type) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete this ${type}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (type === 'sales') {
            // Call delete API for sales
            // await axios.delete(`${baseURL}/ledger/${item.id}`);
            setInvoiceData(invoiceData.filter(i => i.id !== item.id));
          } else {
            // Call delete API for receipts
            // await axios.delete(`${baseURL}/ledger/${item.id}`);
            setReceiptsData(receiptsData.filter(i => i.id !== item.id));
          }
          
          Swal.fire('Deleted!', `The ${type} entry has been deleted.`, 'success');
        } catch (error) {
          console.error('Error deleting:', error.message);
          Swal.fire('Error!', 'Failed to delete.', 'error');
        }
      }
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDetails(null);
  };

  return (
    <div className="main-container">
      <div className="ledger-container">
        <Row className="mb-4">
          <Col>
            <h2 className="page-title">Ledger Management</h2>
          </Col>
        </Row>

        <Row>
          {/* Sales Table - Left Side (transaction_type = 'SALE') */}
          <Col md={6}>
            <div className="table-section">
              <div className="table-header">
                <h3>Sales/purchases</h3>
                {/* <small className="text-muted">Transaction Type: SALE</small> */}
              </div>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <DataTable columns={salesColumns} data={[...invoiceData].reverse()} />
              )}
            </div>
          </Col>

          {/* Receipts Table - Right Side (transaction_type = 'RECEIPT', 'PAYMENT', or 'CREDIT') */}
          <Col md={6}>
            <div className="table-section">
              <div className="table-header">
                <h3>Receipts/Payments</h3>
                {/* <small className="text-muted">Transaction Types: RECEIPT, PAYMENT, CREDIT</small> */}
              </div>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <DataTable columns={receiptsColumns} data={[...receiptsData].reverse()} />
              )}
            </div>
          </Col>
        </Row>
      </div>

      {/* Modal for Details View */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" className="m-auto">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'sales' ? 'Sales Invoice Details' : 'Receipt/Payment Details'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDetails && (
            <>
              <Table bordered>
                <tbody>
                  <tr>
                    <th width="30%">Transaction Date</th>
                    <td>{formatDate(selectedDetails.transaction_date)}</td>
                  </tr>
                  <tr>
                    <th>Transaction Type</th>
                    <td>{selectedDetails.transaction_type}</td>
                  </tr>
                  <tr>
                    <th>{modalType === 'sales' ? 'Invoice Number' : 'Receipt Number'}</th>
                    <td>{selectedDetails.invoice_number}</td>
                  </tr>
                  <tr>
                    <th>Account Name</th>
                    <td>{selectedDetails.account_name}</td>
                  </tr>
                  <tr>
                    <th>Credit Amount</th>
                    <td>₹ {selectedDetails.credit?.toLocaleString('en-IN') || '0'}</td>
                  </tr>
                  <tr>
                    <th>Debit Amount</th>
                    <td>₹ {selectedDetails.debit?.toLocaleString('en-IN') || '0'}</td>
                  </tr>
                  {modalType === 'sales' && (
                    <>
                      <tr>
                        <th>Net Weight (g)</th>
                        <td>{selectedDetails.net_wt?.toFixed(3) || '0.000'}</td>
                      </tr>
                      <tr>
                        <th>Gross Weight (g)</th>
                        <td>{selectedDetails.gross_wt?.toFixed(3) || '0.000'}</td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <th>Amount</th>
                    <td>₹ {selectedDetails.amount?.toLocaleString('en-IN') || '0'}</td>
                  </tr>
                  <tr>
                    <th>Balance</th>
                    <td>₹ {selectedDetails.balance?.toLocaleString('en-IN') || '0'}</td>
                  </tr>
                </tbody>
              </Table>
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
}

export default Ledger;