import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import DataTable from './ExpandedTable';
import baseURL from "../../../../Url/NodeBaseURL";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "react-bootstrap";
import { FaFileExcel } from "react-icons/fa";


const RepairsTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [purchasesRes, rateCutsRes] = await Promise.all([
          fetch(`${baseURL}/get/purchases`),
          fetch(`${baseURL}/rateCuts`)
        ]);

        if (!purchasesRes.ok || !rateCutsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const purchases = await purchasesRes.json();
        const rateCuts = await rateCutsRes.json();

        // Group purchases by account_name + mobile
        const grouped = purchases.reduce((acc, curr) => {
          const key = `${curr.account_name}-${curr.mobile}`;
          if (!acc[key]) {
            acc[key] = {
              account_name: curr.account_name,
              mobile: curr.mobile,
              invoices: [],
              invoiceSet: new Set(),
              totalRateCut: 0,
              totalBalance: 0,
            };
          }

          if (!acc[key].invoiceSet.has(curr.invoice)) {
            acc[key].invoiceSet.add(curr.invoice);

            const matchingCuts = rateCuts.filter(rc => rc.invoice === curr.invoice);
            const totalRateCut = matchingCuts.reduce((sum, item) => sum + Number(item.rate_cut_amt || 0), 0);
            const totalBalance = matchingCuts.reduce((sum, item) => sum + Number(item.balance_amount || 0), 0);

            acc[key].totalRateCut += totalRateCut;
            acc[key].totalBalance += totalBalance;

            acc[key].invoices.push({
              ...curr,
              totalRateCut,
              totalBalance,
            });
          }

          return acc;
        }, {});


        const groupedData = Object.values(grouped).map(({ invoiceSet, ...rest }) => rest);
        groupedData.sort((a, b) => b.totalBalance - a.totalBalance);

        setData(groupedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownloadExcel = () => {
    if (!data.length) return;

    /* =========================
       SHEET 1: SUMMARY (Grouped)
    ========================= */
    const summaryData = data.map((item, index) => ({
      "S No": index + 1,
      "Mobile": item.mobile,
      "Account Name": item.account_name,
      "Total Invoices": item.invoices.length,
      "Total Amount": item.totalRateCut.toFixed(2),
      "Balance Amount": item.totalBalance.toFixed(2),
    }));

    /* =========================
       SHEET 2: INVOICE DETAILS
    ========================= */
    const invoiceDetails = [];

    data.forEach((item) => {
      item.invoices.forEach((inv) => {
        invoiceDetails.push({
          "Account Name": item.account_name,
          "Mobile": item.mobile,
          "Invoice No": inv.invoice,
          "Date": inv.date ? formatDate(inv.date) : "",
          "Total Amount": Number(inv.totalRateCut || 0).toFixed(2),
          "Balance Amount": Number(inv.totalBalance || 0).toFixed(2),
        });
      });
    });

    const workbook = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Supplier Summary");

    const invoiceSheet = XLSX.utils.json_to_sheet(invoiceDetails);
    XLSX.utils.book_append_sheet(workbook, invoiceSheet, "Invoice Details");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    /* ===== File name yyyy-mm-dd ===== */
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    saveAs(blob, `Purchase_Supplier_Balance_${yyyy}-${mm}-${dd}.xlsx`);
  };


  const columns = React.useMemo(() => [
    {
      Header: 'S No.',
      Cell: ({ row }) => row.index + 1,
    },
    {
      Header: 'Mobile',
      accessor: 'mobile',
    },
    {
      Header: 'Account Name',
      accessor: 'account_name',
    },
    {
      Header: 'Total Invoices',
      accessor: (row) => row.invoices.length,
    },
    {
      Header: 'Total Amount',
      accessor: 'totalRateCut',
    },
    {
      Header: 'Balance Amount',
      accessor: 'totalBalance',
    },
  ], []);


  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${date.getFullYear()}`;
  };


  const renderRowSubComponent = ({ row }) => {
    const calculateDaysDifference = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const today = new Date();

      date.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const diffTime = today - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + 1;
    };

    return (
      <div className="p-3">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Days</th>
              <th>Date</th>
              <th>Invoice No.</th>
              <th>Total Amount</th>
              <th>Balance Amount</th>
            </tr>
          </thead>
          <tbody>
            {row.original.invoices.map((inv, index) => (
              <tr key={index}>
                <td>{calculateDaysDifference(inv.date)}</td>
                <td>{formatDate(inv.date)}</td>
                <td>{inv.invoice}</td>
                <td>{inv.totalRateCut}</td>
                <td>{inv.totalBalance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };



  return (
    <div className="main-container">
      <div className="payments-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Purchase / Supplier Balance</h3>

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
          <div>Loading...</div>
        ) : (
          <DataTable
            columns={columns}
            data={data}

            renderRowSubComponent={renderRowSubComponent}
          />
        )}
      </div>
    </div>
  );
};

export default RepairsTable;
