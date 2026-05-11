import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import DataTable from '../../../Pages/InputField/TableLayout'; // Import the reusable DataTable component
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Row, Col } from 'react-bootstrap'; 
import './AccountsTable.css';

import baseURL from "../../../../Url/NodeBaseURL";


const AccountsTable = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const [data, setData] = useState([]); // State to store accounts data
  const [loading, setLoading] = useState(true); // State to manage loading

  // Fetch accounts data from the API
  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${baseURL}/get/account-details`);
      if (!response.ok) {
        throw new Error('Failed to fetch accounts data');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching accounts data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts(); // Initial fetch when the component mounts
  }, []);

  const handleEdit = (id) => {
    navigate(`/accounts/${id}`); // Navigate to the edit form with account ID
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      try {
        const response = await fetch(`${baseURL}/delete/account-details/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error deleting account: ${errorText}`);
        }
        alert("Account deleted successfully!");
        // Refetch data after deletion
        fetchAccounts();
      } catch (err) {
        console.error("Error deleting account:", err.message);
        alert(`Error: ${err.message}`);
      }
    }
  };

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
      { Header: 'Sr. No.', Cell: ({ row }) => row.index + 1 },
      { Header: 'Account Name', accessor: 'account_name', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Print Name', accessor: 'print_name', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Group', accessor: 'account_group', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Op. Bal.', accessor: 'op_bal', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Dr/Cr', accessor: 'dr_cr', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Metal Balance', accessor: 'metal_balance', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Address', accessor: 'address1', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Address2', accessor: 'address2', Cell: ({ value }) => value || 'N/A' },
      { Header: 'City', accessor: 'city', Cell: ({ value }) => value || 'N/A' },
      { Header: 'GSTIN', accessor: 'gst_in', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Pincode', accessor: 'pincode', Cell: ({ value }) => value || 'N/A' },
      { Header: 'State', accessor: 'state', Cell: ({ value }) => value || 'N/A' },
      { Header: 'State Code', accessor: 'state_code', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Phone', accessor: 'phone', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Mobile', accessor: 'mobile', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Contact Person', accessor: 'contact_person', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Email', accessor: 'email', Cell: ({ value }) => value || 'N/A' },
      {
        Header: 'Birthday',
        accessor: 'birthday',
        Cell: ({ value }) => <span>{formatDate(value)}</span>, // Format birthday date
      },
      {
        Header: 'Anniversary',
        accessor: 'anniversary',
        Cell: ({ value }) => <span>{formatDate(value)}</span>, // Format anniversary date
      },
      { Header: 'Bank Account No.', accessor: 'bank_account_no', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Bank Name', accessor: 'bank_name', Cell: ({ value }) => value || 'N/A' },
      { Header: 'IFSC Code', accessor: 'ifsc_code', Cell: ({ value }) => value || 'N/A' },
      { Header: 'Branch', accessor: 'branch', Cell: ({ value }) => value || 'N/A' },
      
      {
              Header: 'Action',
              Cell: ({ row }) => (
                <div className="d-flex align-items-center">
                  <button
                    className="action-button edit-button"
                    onClick={() => handleEdit(row.original.account_id)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDelete(row.original.account_id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ),
            },
    ],
    []
  );
  

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleCreate = () => {
    navigate('/accounts'); // Navigate to the /repairs page
  };

  return (
    <div className="main-container">
      <div className="accounts-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Accounts</h3>
            <Button className='create_but' onClick={handleCreate} style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>
              + Create
            </Button>
          </Col>
        </Row>
        <DataTable columns={columns} data={[...data].reverse()} />
      </div>
    </div>
  );
};

export default AccountsTable;
