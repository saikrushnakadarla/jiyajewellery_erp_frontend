import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/DataTable'; // Import the reusable DataTable component
import { Row, Col } from 'react-bootstrap';
import { format } from 'date-fns'; // Import date-fns for date formatting
import baseURL from "../../../../Url/NodeBaseURL";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "react-bootstrap";
import { FaFileExcel } from "react-icons/fa";


const RepairsTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // State to store table data
  const [loading, setLoading] = useState(true); // State to handle loading

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get/rates`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        // Map rate_date to date before passing to DataTable
        const modifiedData = result.map(item => ({
          ...item,
          date: item.rate_date, // Rename rate_date to date
        }));

        setData(modifiedData); // Set the modified data
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

    const excelData = data.map((row, index) => ({
      "S No": index + 1,
      "Date": row.date ? new Date(row.date).toLocaleDateString("en-GB") : "",
      "16 Crt": row.rate_16crt,
      "18 Crt": row.rate_18crt,
      "22 Crt": row.rate_22crt,
      "24 Crt": row.rate_24crt,
      "Silver": row.silver_rate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rates Report");

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

    saveAs(blob, `Rates_Report_${yyyy}-${mm}-${dd}.xlsx`);
  };


  const columns = React.useMemo(
    () => [
      {
        Header: 'S No.',
        Cell: ({ row }) => row.index + 1, // Generate a sequential number based on the row index
      },
      {
        Header: 'Date',
        accessor: 'date', // Access the renamed date field
        Cell: ({ value }) => {
          const date = new Date(value);
          return date.toLocaleDateString('en-GB'); // en-GB for dd/mm/yyyy format
        },
      },
      {
        Header: '16 Crt',
        accessor: 'rate_16crt',
      },
      {
        Header: '18 Crt',
        accessor: 'rate_18crt',
      },
      {
        Header: '22 Crt',
        accessor: 'rate_22crt',
      },
      {
        Header: '24 Crt',
        accessor: 'rate_24crt',
      },
      {
        Header: 'Silver',
        accessor: 'silver_rate',
      },
    ],
    []
  );

  return (
    <div className="main-container">
      <div className="sales-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Rates</h3>

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
          <div>Loading...</div> // Loading indicator
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </div>
    </div>
  );
};

export default RepairsTable;
