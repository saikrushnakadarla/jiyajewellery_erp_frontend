import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout'; // Import the reusable DataTable component
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Row, Col } from 'react-bootstrap';
//  import './Supplier_Table.css';

const RepairsTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // State to store table data
  const [loading, setLoading] = useState(true); // State for loading indicator

  const columns = React.useMemo(
    () => [
      {
        Header: 'Sr. No.',
        Cell: ({ row }) => row.index + 1, // Generate a sequential number based on the row index
      },
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Metal',
        accessor: 'metal',
      },
      {
        Header: 'Purity Percentage',
        accessor: 'purity_percentage',
      },
      {
        Header: 'Purity',
        accessor: 'purity',
      },
      {
        Header: 'URD Purity',
        accessor: 'urd_purity',
      },
      {
        Header: 'DESC',
        accessor: 'desc',
      },
      {
        Header: 'Old Purity Desc',
        accessor: 'old_purity_desc',
      },
      {
        Header: 'Cut Issue',
        accessor: 'cut_issue',
      },
      {
        Header: 'Skin Print',
        accessor: 'skin_print',
      },
     
      {
        Header: 'Action',
        Cell: ({ row }) => (
          <div>
            <button
              className="edit-btn edit-button"
            
            >
              <FaEdit />
            </button>
            <button
              className="delete-btn delete-button"
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    []
  );
 
  return (
    <div className="main-container">
      <div className="customers-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Suppliers</h3>
          
          </Col>
        </Row>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </div>
    </div>
  );
};

export default RepairsTable;
