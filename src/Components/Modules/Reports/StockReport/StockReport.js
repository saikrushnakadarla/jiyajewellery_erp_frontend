import React, { useEffect, useState, useMemo } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import DataTable from '../../Transactions/StockEntry/DataTable';
import baseURL from "../../../../Url/NodeBaseURL";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFileExcel } from 'react-icons/fa';

const StockReport = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch(`${baseURL}/get/opening-tags-entry`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch stock entries');
                }
                return response.json();
            })
            .then((data) => {
                setData(data.result || []);
            })
            .catch((error) => {
                console.error('Error fetching stock entries:', error);
            });
    }, []);

    /* ===============================
       EXCEL DOWNLOAD FUNCTION
    =============================== */
    const handleDownloadExcel = () => {
        if (!data.length) return;

        const formattedData = data.map((item, index) => ({
            "S No": index + 1,
            "Date": item.date
                ? new Date(item.date).toLocaleDateString("en-GB")
                : "",
            "Category": item.category,
            "Sub Category": item.sub_category,
            "Product Design Name": item.design_master,
            "Barcode": item.PCode_BarCode,
            "Gross Wt": item.Gross_Weight,
            "Net Wt": item.TotalWeight_AW,
            "MC": item.Making_Charges,
            "Rate": item.rate,
            "Total Amount": item.total_price,
            "Status": item.Status
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Report");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        /* ===== FILE NAME FORMAT yyyy-mm-dd ===== */
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");

        const fileName = `Stock_Report_${yyyy}-${mm}-${dd}.xlsx`;

        saveAs(blob, fileName);
    };


    /* ===============================
       TABLE COLUMNS
    =============================== */
    const columns = useMemo(
        () => [
            {
                Header: 'S No.',
                Cell: ({ row }) => row.index + 1,
            },
            {
                Header: 'Date',
                accessor: 'date',
                Cell: ({ value }) => {
                    if (!value) return "";
                    const date = new Date(value);
                    return date.toLocaleDateString("en-GB");
                }
            },
            { Header: 'Category', accessor: 'category' },
            { Header: 'Sub Category', accessor: 'sub_category' },
            { Header: 'Product Design Name', accessor: 'design_master' },
            { Header: 'Barcode', accessor: 'PCode_BarCode' },
            { Header: 'Gross Wt', accessor: 'Gross_Weight' },
            { Header: 'Net Wt', accessor: 'TotalWeight_AW' },
            { Header: 'MC', accessor: 'Making_Charges' },
            { Header: 'Rate', accessor: 'rate' },
            { Header: 'Total Amt', accessor: 'total_price' },
            { Header: 'Status', accessor: 'Status' },
            {
                Header: "Barcode PDF",
                Cell: ({ row }) => (
                    <a
                        href={`${baseURL}/invoices/${row.original.PCode_BarCode}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                    >
                        📝 View
                    </a>
                )
            },
        ],
        []
    );

    return (
        <div className="main-container">
            <div className="sales-table-container">
                <Row className="mb-3">
                    <Col className="d-flex justify-content-between align-items-center">
                        <h3>Stock Report</h3>
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

                <DataTable columns={columns} data={[...data].reverse()} />
            </div>
        </div>
    );
};

export default StockReport;
