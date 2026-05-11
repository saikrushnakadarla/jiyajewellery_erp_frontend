import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import DataTable from '../../../Pages/InputField/TableLayout'; // Import the reusable DataTable component
import { FaTrash, FaEdit } from 'react-icons/fa';
import { Button, Row, Col } from 'react-bootstrap';
import '../Payments/PaymentsTable.css';
import baseURL from "../../../../Url/NodeBaseURL";

const RepairsTable = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const [data, setData] = useState([]); // State to hold fetched data
  

  // Define table columns
  const columns = React.useMemo(
    () => [
      {
        Header: 'Sr. No.',
        Cell: ({ row }) => row.index + 1, 
      },
      {
        Header: 'Date',
        accessor: 'date', 
        Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN'), // Format date
      },
      {
        Header: 'Mode',
        accessor: 'mode',
      },
      {
        Header: 'Payment No',
        accessor: 'payment_no',
      },
      {
        Header: 'Account Name',
        accessor: 'account_name',
      },
      {
        Header: 'Reference Number',
        accessor: 'cheque_number',
        Cell: ({ value }) => (value ? value : 'N/A'), // Display 'N/A' if null
      },
      {
        Header: 'Total Wt / Amt',
        accessor: row => ` ${row.total_wt} / ${row.total_amt}`
      },
      {
        Header: 'Paid Wt / Amt',
        accessor: row => ` ${row.paid_wt} / ${row.paid_amt}`
      },
      {
        Header: 'Bal Wt / Amt',
        accessor: row => ` ${row.bal_wt} / ${row.bal_amt}`
      },
      {
        Header: 'Paid By',
        accessor: 'paid_by',
      },
    //   {
    //     Header: 'Actions',
    //     accessor: 'actions',
    //     Cell: ({ row }) => (
    //       <div>
    //       <FaEdit
    //        style={{
    //         cursor: 'pointer',
    //         marginLeft: '10px',
    //         color: 'blue',
    //       }}
    //         onClick={() => handleEdit(row.original.id)}
    //       />
    //       <FaTrash
    //          style={{
    //           cursor: 'pointer',
    //           marginLeft: '10px',
    //           color: 'red',
    //         }}
    //         onClick={() => handleDelete(row.original.id)}
    //       />
    //     </div>
    //     ),
    //   },
    ],
    [data]
  );

  // Fetch payments data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/purchase-payments`); // Fetch data from the endpoint
        const result = await response.json();
          setData(result); 
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };
    fetchData();
  }, []);
  
  const handleCreate = () => {
    navigate('/purchase-payment'); // Navigate to the payments creation page
  };

  return (
    <div className="main-container">
      <div className="payments-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Payments</h3>
            <Button
              className="create_but"
              onClick={handleCreate}
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
            >
              + Create
            </Button>
          </Col>
        </Row>
        <DataTable columns={columns} data={[...data].reverse()}/>
      </div>
    </div>
  );
};

export default RepairsTable;
