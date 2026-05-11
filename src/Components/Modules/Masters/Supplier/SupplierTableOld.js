import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout'; // Import the reusable DataTable component
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Row, Col } from 'react-bootstrap';
 import './Supplier_Table.css';

 import baseURL from "../../../../Url/NodeBaseURL";


const SupplierTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // State to store table data
  const [loading, setLoading] = useState(true); // State for loading indicator

  const columns = React.useMemo(
    () => [
      {
        Header: 'Sr. No.',
        Cell: ({ row }) => row.index + 1, 
      },
      {
        Header: 'Trade Name',
        accessor: 'account_name',
      },
      {
        Header: 'Print Name',
        accessor: 'print_name',
      },
      {
        Header: 'Account Group',
        accessor: 'account_group',
      },
      {
        Header: 'Pincode',
        accessor: 'pincode',
      },
      {
        Header: 'State',
        accessor: 'state',
      },
      {
        Header: 'State Code',
        accessor: 'state_code',
      },
      {
        Header: 'Phone',
        accessor: 'phone',
      },
      {
        Header: 'Mobile',
        accessor: 'mobile',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Birthday',
        accessor: 'birthday',
      },
      {
        Header: 'Anniversary',
        accessor: 'anniversary',
      },
      {
        Header: 'Bank Account No',
        accessor: 'bank_account_no',
      },
      {
        Header: 'Bank Name',
        accessor: 'bank_name',
      },
      {
        Header: 'IFSC Code',
        accessor: 'ifsc_code',
      },
      {
        Header: 'Branch',
        accessor: 'branch',
      },
      {
        Header: 'GSTIN',
        accessor: 'gst_in',
      },
      {
        Header: 'Aadhar Card',
        accessor: 'aadhar_card',
      },
      {
        Header: 'PAN Card',
        accessor: 'pan_card',
      },
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

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

 // Fetch data and filter where account_group = "supplier"
 useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(`${baseURL}/get/account-details`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();

      // Filter only suppliers
       // Filter only customers and format dates
        const suppliers = result
          .filter((item) => item.account_group === 'SUPPLIERS')
          .map((item) => ({
            ...item,
            birthday: formatDate(item.birthday),
            anniversary: formatDate(item.anniversary),
          }));

      setData(suppliers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  fetchData();
}, []);




const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this customer?')) {
    try {
      const response = await fetch(`${baseURL}/delete/account-details/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Supplier deleted successfully!');
        setData((prevData) => prevData.filter((customer) => customer.id !== id));
      } else {
        console.error('Failed to delete customer');
        alert('Failed to delete customer.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while deleting.');
    }
  }
};

  // Navigate to edit form
  const handleEdit = (id) => {
    navigate(`/suppliermaster/${id}`);
  };

  const handleCreate = () => {
    navigate('/suppliermaster'); // Navigate to the /customers page
  };
  

  return (
    <div className="main-container">
      <div className="customers-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Suppliers</h3>
            <Button className='create_but'  onClick={handleCreate}  style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>
              + Create
            </Button>
          </Col>
        </Row>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <DataTable columns={columns} data={[...data].reverse()} />
        )}
      </div>
    </div>
  );
};

export default SupplierTable;
