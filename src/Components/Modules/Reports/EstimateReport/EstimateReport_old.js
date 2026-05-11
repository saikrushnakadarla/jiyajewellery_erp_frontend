import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import DataTable from '../../../Pages/InputField/DataTable'; // Import the DataTable component
import baseURL from "../../../../Url/NodeBaseURL";

const RepairsTable = () => {
  const [data, setData] = useState([]); // State to store table data
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get/estimates`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(Array.isArray(result) ? result : [result]); // Ensure the result is an array
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    fetchData();
  }, []);

  // Define columns for the table
  const columns = React.useMemo(
    () => [
      {
        Header: 'Estimate Number',
        accessor: 'estimate_number',
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
        Header: 'Product Name',
        accessor: 'product_name',
      },
      {
        Header: 'Gross Weight',
        accessor: 'gross_weight',
      },
      {
        Header: 'Stone Weight',
        accessor: 'stones_weight',
      },
      {
        Header: 'Stone Price',
        accessor: 'stones_price',
      },
      {
        Header: 'Wastage Percent',
        accessor: 'wastage_percent',
      },
      {
        Header: 'Wastage Weight',
        accessor: 'wastage_weight',
      },
      {
        Header: 'Net Weight',
        accessor: 'total_weight',
      },
      {
        Header: 'MC Per Gram',
        accessor: 'mc_per_gram',
      },
      {
        Header: 'Total MC',
        accessor: 'total_mc',
      },
      {
        Header: 'Tax Percent',
        accessor: 'tax_percent',
      },
      {
        Header: 'Tax VAT Amount',
        accessor: 'tax_vat_amount',
      },
      {
        Header: 'Total Rs',
        accessor: 'total_rs',
      },
    ],
    []
  );

  return (
    <div className="main-container">
      <div className="sales-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Estimate Report</h3>
          </Col>
        </Row>
        {loading ? (
          <p>Loading...</p> // Show loading message while fetching data
        ) : (
          <DataTable columns={columns} data={[...data].reverse()} /> // Render the table
        )}
      </div>
    </div>
  );
};

export default RepairsTable;
