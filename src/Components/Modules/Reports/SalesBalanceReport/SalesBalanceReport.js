import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from './ExpandedTable';
import { FaEdit, FaTrash, FaEye, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { Button, Row, Col, Modal, Table } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../../Url/NodeBaseURL';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFileExcel } from "react-icons/fa";


const RepairsTable = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [repairDetails, setRepairDetails] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});

    const toggleRow = (customerId) => {
        setExpandedRows(prev => ({
            ...prev,
            [customerId]: !prev[customerId]
        }));
    };

    // Group data by customer_id
    const groupByCustomer = (data) => {
        const grouped = data.reduce((acc, item) => {
            const key = item.customer_id;
            if (!acc[key]) {
                acc[key] = {
                    customer_id: key,
                    account_name: item.account_name,
                    mobile: item.mobile,
                    email: item.email,
                    address1: item.address1,
                    invoices: []
                };
            }
            acc[key].invoices.push(item);
            return acc;
        }, {});

        // Sort invoices by balance within each customer group
        Object.values(grouped).forEach(customer => {
            customer.invoices.sort((a, b) => {
                const calculateInvoiceBalance = (invoice) => {
                    const bal_amt = Number(invoice.bal_amt) || 0;
                    const bal_after_receipts = Number(invoice.bal_after_receipts) || 0;
                    const receipts_amt = Number(invoice.receipts_amt) || 0;

                    if (bal_amt === receipts_amt) {
                        return bal_after_receipts || 0;
                    }
                    return bal_after_receipts ? bal_after_receipts : bal_amt || 0;
                };

                const balanceA = calculateInvoiceBalance(a);
                const balanceB = calculateInvoiceBalance(b);
                return balanceB - balanceA; // Descending order
            });
        });

        return grouped;
    };

    const handleDownloadExcel = () => {
        if (!groupedData.length) return;

        const excelData = [];

        groupedData.forEach((customer, cIndex) => {
            customer.invoices.forEach((invoice, iIndex) => {
                const bal_amt = Number(invoice.bal_amt) || 0;
                const bal_after_receipts = Number(invoice.bal_after_receipts) || 0;
                const receipts_amt = Number(invoice.receipts_amt) || 0;

                let finalBalance = 0;
                if (bal_amt === receipts_amt) {
                    finalBalance = bal_after_receipts || 0;
                } else {
                    finalBalance = bal_after_receipts ? bal_after_receipts : bal_amt || 0;
                }

                excelData.push({
                    "S No": excelData.length + 1,
                    "Account Name": customer.account_name,
                    "Mobile": customer.mobile,
                    "Email": customer.email,
                    "Invoice No": invoice.invoice_number,
                    "Invoice Date": invoice.date
                        ? new Date(invoice.date).toLocaleDateString("en-GB")
                        : "",
                    "Net Amount": invoice.net_bill_amount || 0,
                    "Paid Amount":
                        (Number(invoice.paid_amt) || 0) +
                        (Number(invoice.receipts_amt) || 0),
                    "Balance Amount": finalBalance.toFixed(2),
                });
            });
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

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

        saveAs(blob, `Sales_Report_${yyyy}-${mm}-${dd}.xlsx`);
    };


    const columns = React.useMemo(
        () => [
            {
                Header: '',
                accessor: 'expander',
                Cell: ({ row }) => (
                    <span {...row.getToggleRowExpandedProps()}>
                        {row.isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                ),
            },
            {
                Header: 'Account Name',
                accessor: 'account_name',
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
                Header: 'Total Invoices',
                accessor: 'invoices',
                Cell: ({ value }) => value.length,
            },
            {
                Header: 'Total Amount',
                accessor: 'total_amount',
                Cell: ({ row }) => {
                    const total = row.original.invoices.reduce((sum, invoice) =>
                        sum + (parseFloat(invoice.net_bill_amount) || 0), 0);
                    return total.toFixed(2);
                },
            },
            {
                Header: 'Balance Amount',
                accessor: 'final_balance',
                Cell: ({ row }) => {
                    const invoices = row.original.invoices || [];

                    const finalBalance = invoices.reduce((sum, invoice) => {
                        const bal_amt = Number(invoice.bal_amt) || 0;
                        const bal_after_receipts = Number(invoice.bal_after_receipts) || 0;
                        const receipts_amt = Number(invoice.receipts_amt) || 0;

                        let balance = 0;
                        if (bal_amt === receipts_amt) {
                            balance = bal_after_receipts || 0;
                        } else {
                            balance = bal_after_receipts ? bal_after_receipts : bal_amt || 0;
                        }

                        return sum + balance;
                    }, 0);

                    return finalBalance.toFixed(2);
                }
            }

        ],
        []
    );

    const invoiceColumns = React.useMemo(
        () => [
            {
                Header: 'Invoice No.',
                accessor: 'invoice_number',
                Cell: ({ value }) => value || 'N/A'
            },
            {
                Header: 'Date',
                accessor: 'date',
                Cell: ({ value }) => formatDate(value) || 'N/A'
            },
            {
                Header: 'Total Amt',
                accessor: 'net_amount',
                Cell: ({ value }) => (value ? parseFloat(value).toFixed(2) : '0.00')
            },
            {
                Header: 'Old Amt',
                accessor: 'old_exchange_amt',
                Cell: ({ value }) => (value ? parseFloat(value).toFixed(2) : '0.00')
            },
            {
                Header: 'Scheme Amt',
                accessor: 'scheme_amt',
                Cell: ({ value }) => (value ? parseFloat(value).toFixed(2) : '0.00')
            },
            {
                Header: 'Net Amt',
                accessor: 'net_bill_amount',
                Cell: ({ value }) => (value ? parseFloat(value).toFixed(2) : '0.00')
            },
            {
                Header: 'Paid Amt',
                accessor: 'paid_amt',
                Cell: ({ row }) => {
                    const paid_amt = Number(row.original.paid_amt) || 0;
                    const receipts_amt = Number(row.original.receipts_amt) || 0;
                    const totalPaid = (paid_amt + receipts_amt).toFixed(2);
                    return totalPaid;
                },
            },
            {
                Header: 'Bal Amt',
                accessor: 'bal_amt',
                Cell: ({ row }) => {
                    const bal_amt = Number(row.original.bal_amt) || 0;
                    const bal_after_receipts = Number(row.original.bal_after_receipts) || 0;
                    const receipts_amt = Number(row.original.receipts_amt) || 0;
                    let finalBalance;
                    if (bal_amt === receipts_amt) {
                        finalBalance = bal_after_receipts || 0;
                    } else {
                        finalBalance = bal_after_receipts ? bal_after_receipts : bal_amt || 0;
                    }
                    return finalBalance.toFixed(2);
                },
            },
            {
                Header: 'Receipts',
                accessor: 'receipts',
                Cell: ({ row }) => {
                    const { net_bill_amount, paid_amt, receipts_amt, transaction_status } = row.original;

                    // Ensure numerical calculations are performed correctly
                    const totalPaid = Number(paid_amt) + Number(receipts_amt);
                    const netBill = Number(net_bill_amount);

                    return (
                        <Button
                            style={{
                                backgroundColor: '#28a745',
                                borderColor: '#28a745',
                                fontSize: '0.800rem', // Smaller font size
                                padding: '0.10rem 0.5rem', // Reduced padding
                            }}
                            onClick={() => handleAddReceipt(row.original)} // Pass row data to handle receipt creation
                            disabled={netBill === totalPaid} // Disable if transaction_status is ConvertedInvoice or netBill equals totalPaid
                        >
                            Add Receipt
                        </Button>
                    );
                },
            },
            {
                Header: 'Actions',
                accessor: 'actions',
                Cell: ({ row }) => (
                    <FaEye
                        style={{ cursor: 'pointer', color: 'green' }}
                        onClick={() => handleViewDetails(row.original.invoice_number)}
                    />
                ),
            },
        ],
        []
    );

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}-${String(
            date.getMonth() + 1
        ).padStart(2, '0')}-${date.getFullYear()}`;
    };

    const handleAddReceipt = (invoiceData) => {
        navigate("/receipts", {
            state: {
                from: "/salesBalanceReport",
                invoiceData: {
                    ...invoiceData, // Spread all existing invoice data
                    mobile: invoiceData.mobile // Ensure mobile is included
                }
            }
        });
    };

    useEffect(() => {
        const fetchRepairs = async () => {
            try {
                const response = await axios.get(`${baseURL}/get-unique-repair-details`);
                const filteredData = response.data.filter(
                    (item) => item.transaction_status === 'Sales' || item.transaction_status === "ConvertedInvoice"
                );
                setData(filteredData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching repair details:', error);
                setLoading(false);
            }
        };

        fetchRepairs();
    }, []);

    const handleViewDetails = async (invoice_number) => {
        try {
            const response = await axios.get(`${baseURL}/get-repair-details/${invoice_number}`);
            setRepairDetails(response.data);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching repair details:', error);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setRepairDetails(null);
    };

    const groupedData = React.useMemo(() => {
        const grouped = groupByCustomer(data);
        return Object.values(grouped).sort((a, b) => {
            const calculateBalance = (invoices) => {
                return invoices.reduce((sum, invoice) => {
                    const bal_amt = Number(invoice.bal_amt) || 0;
                    const bal_after_receipts = Number(invoice.bal_after_receipts) || 0;
                    const receipts_amt = Number(invoice.receipts_amt) || 0;

                    let balance = 0;
                    if (bal_amt === receipts_amt) {
                        balance = bal_after_receipts || 0;
                    } else {
                        balance = bal_after_receipts ? bal_after_receipts : bal_amt || 0;
                    }

                    return sum + balance;
                }, 0);
            };

            const balanceA = calculateBalance(a.invoices || []);
            const balanceB = calculateBalance(b.invoices || []);

            return balanceB - balanceA; // For descending order
        });
    }, [data]);

    return (
        <div className="main-container">
            <div className="payments-table-container">
                <Row className="mb-3">
                    <Col className="d-flex justify-content-between align-items-center">
                        <h3>Sales Report</h3>

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
                    <p>Loading...</p>
                ) : (
                    <DataTable
                        columns={columns}
                        data={groupedData}
                        renderRowSubComponent={({ row }) => (
                            <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
                                <Table striped bordered responsive>
                                    <thead>
                                        <tr>
                                            {invoiceColumns.map((column, i) => (
                                                <th key={i}>{column.Header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {row.original.invoices.map((invoice, i) => (
                                            <tr key={i}>
                                                {invoiceColumns.map((column, j) => {
                                                    // For simple cells with accessor
                                                    if (column.accessor) {
                                                        return (
                                                            <td key={j}>
                                                                {column.Cell ?
                                                                    column.Cell({
                                                                        value: invoice[column.accessor],
                                                                        row: { original: invoice }
                                                                    }) :
                                                                    invoice[column.accessor]
                                                                }
                                                            </td>
                                                        );
                                                    }
                                                    // For complex cells without accessor but with id
                                                    if (column.id) {
                                                        return (
                                                            <td key={j}>
                                                                {column.Cell({ row: { original: invoice } })}
                                                            </td>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    />
                )}
            </div>

            <Modal show={showModal} onHide={handleCloseModal} size="xl" className='m-auto'>
                <Modal.Header closeButton>
                    <Modal.Title>Sales Details</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ fontSize: '13px' }}>
                    {repairDetails && (
                        <>
                            <h5>Customer Info</h5>
                            <Table bordered>
                                <tbody>
                                    <tr>
                                        <td>Customer ID</td>
                                        <td>{repairDetails.uniqueData.customer_id}</td>
                                    </tr>
                                    <tr>
                                        <td>Mobile</td>
                                        <td>{repairDetails.uniqueData.mobile}</td>
                                    </tr>
                                    <tr>
                                        <td>Account Name</td>
                                        <td>{repairDetails.uniqueData.account_name}</td>
                                    </tr>
                                    <tr>
                                        <td>Email</td>
                                        <td>{repairDetails.uniqueData.email}</td>
                                    </tr>
                                    <tr>
                                        <td>Address</td>
                                        <td>{repairDetails.uniqueData.address1}</td>
                                    </tr>
                                    <tr>
                                        <td>Invoice Number</td>
                                        <td>{repairDetails.uniqueData.invoice_number}</td>
                                    </tr>
                                    <tr>
                                        <td>Total Amount</td>
                                        <td>{repairDetails.uniqueData.net_amount}</td>
                                    </tr>
                                </tbody>
                            </Table>

                            <h5>Products</h5>
                            <div className="table-responsive">
                                <Table bordered>
                                    <thead style={{ whiteSpace: 'nowrap' }}>
                                        <tr>
                                            <th>BarCode</th>
                                            <th>Product Name</th>
                                            <th>Metal</th>
                                            <th>Purity</th>
                                            <th>Gross Wt</th>
                                            <th>Stone Wt</th>
                                            <th>W.Wt</th>
                                            <th>Total Wt</th>
                                            <th>MC</th>
                                            <th>Rate</th>
                                            <th>Tax Amt</th>
                                            <th>Total Price</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ whiteSpace: 'nowrap' }}>
                                        {repairDetails.repeatedData.map((product, index) => (
                                            <tr key={index}>
                                                <td>{product.code}</td>
                                                <td>{product.product_name}</td>
                                                <td>{product.metal_type}</td>
                                                <td>{product.purity}</td>
                                                <td>{product.gross_weight}</td>
                                                <td>{product.stone_weight}</td>
                                                <td>{product.wastage_weight}</td>
                                                <td>{product.total_weight_av}</td>
                                                <td>{product.making_charges}</td>
                                                <td>{product.rate}</td>
                                                <td>{product.tax_amt}</td>
                                                <td>{product.total_price}</td>
                                            </tr>
                                        ))}
                                        <tr style={{ fontWeight: 'bold' }}>
                                            <td colSpan="11" className="text-end">
                                                Total Amount
                                            </td>
                                            <td>{repairDetails.uniqueData.net_amount}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default RepairsTable;