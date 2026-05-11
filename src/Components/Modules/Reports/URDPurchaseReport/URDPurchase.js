import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/DataTable'; // Import the reusable DataTable component
import { Button, Row, Col } from 'react-bootstrap';
import baseURL from "../../../../Url/NodeBaseURL";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFileExcel } from "react-icons/fa";


const RepairsTable = () => {
  const [data, setData] = useState([]); // State to store table data
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get-purchases`);
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

  const handleDownloadExcel = () => {
    if (!data.length) return;

    const excelData = [...data].reverse().map((row, index) => ({
      "Sr No": index + 1,
      "Name": row.account_name,
      "Mobile": row.mobile,
      "Date": row.date ? new Date(row.date).toLocaleDateString("en-GB") : "",
      "Purchase No": row.urdpurchase_number,
      "Product Name": row.product_name,
      "Metal": row.metal,
      "Gross Weight": row.gross,
      "Dust Weight": row.dust,
      "ML Percent": row.ml_percent,
      "Net Weight": row.eqt_wt,
      "Rate": row.rate,
      "Total Amount": row.total_amount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "URD Purchase Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    saveAs(blob, `URD_Purchase_Report_${yyyy}-${mm}-${dd}.xlsx`);
  };


  // Columns definition for the DataTable
  const columns = React.useMemo(
    () => [
      {
        Header: 'Sr. No.',
        Cell: ({ row }) => row.index + 1, // Generate a sequential number based on the row index
      },
      {
        Header: 'Name',
        accessor: 'account_name',
      },
      {
        Header: 'Mobile',
        accessor: 'mobile',
      },
      // {
      //   Header: 'Email',
      //   accessor: 'email',
      // },
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }) => {
          const date = new Date(value);
          return date.toLocaleDateString('en-GB'); // en-GB for dd/mm/yyyy format
        },
      },
      {
        Header: 'Purchase No',
        accessor: 'urdpurchase_number',
      },
      {
        Header: 'Product Name',
        accessor: 'product_name',
      },
      {
        Header: 'Metal',
        accessor: 'metal',
      },
      // {
      //   Header: 'Purity',
      //   accessor: 'purity',
      // },
      {
        Header: 'Gross Weight',
        accessor: 'gross',
      },
      {
        Header: 'Dust Weight',
        accessor: 'dust',
      },
      // {
      //   Header: 'Touch Percent',
      //   accessor: 'touch_percent',
      // },
      {
        Header: 'ML Percent',
        accessor: 'ml_percent',
      },
      {
        Header: 'Net Weight',
        accessor: 'eqt_wt',
      },
      {
        Header: 'Rate',
        accessor: 'rate',
      },
      {
        Header: 'Total Amount',
        accessor: 'total_amount',
      },
    ],
    []
  );


  return (
    <div className="main-container">
      <div className="payments-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>URD Purchase Report</h3>

            <Button
              variant="success"
              onClick={handleDownloadExcel}
              className="d-flex align-items-center gap-2"
            >
              <FaFileExcel />
              Download Excel
            </Button>
          </Col>
        </Row>

        {loading ? (
          <div>Loading...</div> // Show loading state while fetching
        ) : (
          <DataTable columns={columns} data={[...data].reverse()} /> // Display the table with fetched data
        )}
      </div>
    </div>
  );
};

export default RepairsTable;
