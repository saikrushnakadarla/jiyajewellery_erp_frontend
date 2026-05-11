import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import DataTable from '../../../Pages/InputField/DataTable'; // Import the reusable DataTable component
import baseURL from "../../../../Url/NodeBaseURL";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "react-bootstrap";
import { FaFileExcel } from "react-icons/fa";


const RepairsTable = () => {
  const [data, setData] = useState([]); // State to store table data
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get/repairs`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        // If the result is not an array, wrap it in an array
        setData(Array.isArray(result) ? result : [result]);
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
      "Date": row.date ? new Date(row.date).toLocaleDateString("en-GB") : "",
      "Repair No": row.repair_no,
      "Customer Name": row.account_name,
      "Mobile": row.mobile,
      "Entry Type": row.entry_type,
      "Item Name": row.item,
      "Metal Type": row.metal_type,
      "Purity": row.purity,
      "Total Amount": row.total_amt ? Number(row.total_amt).toFixed(2) : "0.00",
      "Status": row.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Repairs Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    /* ===== yyyy-mm-dd filename ===== */
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    saveAs(blob, `Repairs_Report_${yyyy}-${mm}-${dd}.xlsx`);
  };


  // Define columns for the table
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
          return date.toLocaleDateString('en-GB'); // 'en-GB' formats as dd/mm/yyyy
        },
      },
      {
        Header: 'Repair No',
        accessor: 'repair_no',
      },
      {
        Header: 'Customer Name',
        accessor: 'account_name',
      },
      {
        Header: 'Mobile',
        accessor: 'mobile',
      },
      {
        Header: 'Entry Type',
        accessor: 'entry_type',
      },
      {
        Header: 'Item Name',
        accessor: 'item',
      },
      {
        Header: 'Metal Type',
        accessor: 'metal_type',
      },
      {
        Header: 'Purity',
        accessor: 'purity',
      },

      {
        Header: 'Total',
        accessor: row => row.total_amt ? row.total_amt : '0.00',
      },

      {
        Header: 'Status',
        accessor: 'status',
      },
    ],
    []
  );

  return (
    <div className="main-container">
      <div className="sales-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Repairs Report</h3>

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
          <p>Loading...</p> // Show loading message while fetching data
        ) : (
          <DataTable columns={columns} data={[...data].reverse()} /> // Render the table
        )}
      </div>
    </div>
  );
};

export default RepairsTable;
