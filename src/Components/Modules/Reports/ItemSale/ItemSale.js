import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaChevronDown, FaChevronRight, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { Button, Row, Col, Modal, Table } from 'react-bootstrap';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import baseURL from '../../../../Url/NodeBaseURL';
import DataTable from './DataTable';
import autoTable from 'jspdf-autotable';

const ItemSale = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [repairDetails, setRepairDetails] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');

  // Group data by category, sub_category, and design_name
  const groupByItem = (data) => {
    const grouped = data.reduce((acc, item) => {
      const key = `${item.category}-${item.sub_category}-${item.design_name}`;
      if (!acc[key]) {
        acc[key] = {
          category: item.category,
          sub_category: item.sub_category,
          design_name: item.design_name,
          metal_type: item.metal_type,
          invoices: []
        };
      }
      acc[key].invoices.push(item);
      return acc;
    }, {});

    return Object.values(grouped);
  };

  // Main columns for the grouped data
  const columns = React.useMemo(
    () => [
      {
        Header: '',
        id: 'expander',
        Cell: ({ row }) => (
          <span {...row.getToggleRowExpandedProps()}>
            {row.isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        ),
      },
      {
        Header: 'Sr. No.',
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: 'Category',
        accessor: 'category',
      },
      {
        Header: 'Sub Category',
        accessor: 'sub_category',
      },
      {
        Header: 'Metal Type',
        accessor: 'metal_type',
      },
      {
        Header: 'Design Name',
        accessor: 'design_name',
      },
      {
        Header: 'Total Qty',
        accessor: 'invoices',
        Cell: ({ value }) => value.length,
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

  // Columns for the expanded invoice rows
  const invoiceColumns = React.useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }) => formatDate(value) || 'N/A'
      },
      {
        Header: 'Invoice No.',
        accessor: 'invoice_number',
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
        Header: 'Sub Category',
        accessor: 'sub_category',
      },
      {
        Header: 'Gross Weight',
        accessor: 'gross_weight',
      },
      {
        Header: 'Net Weight',
        accessor: 'weight_bw',
      },
      {
        Header: 'Purity',
        accessor: 'purity',
      },
      {
        Header: 'Total Amt',
        accessor: 'total_price',
        Cell: ({ value }) => parseFloat(value || 0).toFixed(2)
      },
    ],
    []
  );

  // Fetch unique repair details from the API
  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/repair-details`);

        // Filter the data based on the 'transaction_status' column
        const filteredData = response.data.filter(
          (item) => item.transaction_status === 'Sales' || item.transaction_status === "ConvertedInvoice"
        );

        setData(filteredData);
        setFilteredData(filteredData);
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

  // Filter data based on search term
  const filterData = (searchTerm) => {
    if (!searchTerm) {
      setFilteredData(data);
      return;
    }

    const lowerFilter = searchTerm.toLowerCase();
    const filtered = data.filter(item => {
      // Search in main item properties
      const mainPropsMatch = 
        item.category?.toLowerCase().includes(lowerFilter) ||
        item.sub_category?.toLowerCase().includes(lowerFilter) ||
        item.design_name?.toLowerCase().includes(lowerFilter) ||
        item.metal_type?.toLowerCase().includes(lowerFilter);

      // Search in invoice details
      const invoiceMatch = item.invoices?.some(invoice => 
        Object.values(invoice).some(value => 
          String(value).toLowerCase().includes(lowerFilter)
        )
      );

      return mainPropsMatch || invoiceMatch;
    });

    setFilteredData(filtered);
  };

  // Export to Excel function with hierarchical structure
  const exportToExcel = () => {
    // Use the filtered data for export
    const exportData = [];
    const groupedData = groupByItem(filteredData);
    
    groupedData.forEach((group, groupIndex) => {
      // Add group header row
      exportData.push({
        'Sr. No.': groupIndex + 1,
        'Category': group.category,
        'Sub Category': group.sub_category,
        'Metal Type': group.metal_type,
        'Design Name': group.design_name,
        'Total Qty': group.invoices.length,
        'Date': '',
        'Invoice No.': '',
        'Account Name': '',
        'Mobile': '',
        'Gross Weight': '',
        'Net Weight': '',
        'Purity': '',
        'Total Amt': ''
      });
      
      // Add invoice details for this group
      group.invoices.forEach((invoice) => {
        exportData.push({
          'Sr. No.': '',
          'Category': '',
          'Sub Category': '',
          'Metal Type': '',
          'Design Name': '',
          'Total Qty': '',
          'Date': formatDate(invoice.date),
          'Invoice No.': invoice.invoice_number,
          'Account Name': invoice.account_name,
          'Mobile': invoice.mobile,
          'Gross Weight': invoice.gross_weight,
          'Net Weight': invoice.weight_bw,
          'Purity': invoice.purity,
          'Total Amt': parseFloat(invoice.total_price || 0).toFixed(2)
        });
      });
      
      // Add empty row between groups
      exportData.push({});
    });
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ItemSalesReport");
    
    // Generate a file name with current date
    const date = new Date();
    const fileName = `ItemSalesReport_${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  };

  // Export to PDF function with hierarchical structure
  const exportToPDF = () => {
    // Use the filtered data for export
    const groupedData = groupByItem(filteredData);
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Item Sales Report', 14, 15);
    
    // Add date
    doc.setFontSize(10);
    const date = new Date();
    doc.text(`Generated on: ${date.toLocaleDateString()}`, 14, 22);
    
    let startY = 30;
    
    groupedData.forEach((group, groupIndex) => {
      // Add group header
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Black color
      doc.setFont(undefined, 'bold');
      doc.text(
        `${groupIndex + 1}. ${group.category} - ${group.sub_category} - ${group.metal_type} - ${group.design_name} (Total Qty: ${group.invoices.length})`,
        14,
        startY
      );
      
      startY += 8;
      
      // Prepare invoice data for this group
      const invoiceData = group.invoices.map(invoice => [
        formatDate(invoice.date),
        invoice.invoice_number,
        invoice.account_name,
        invoice.mobile,
        invoice.gross_weight,
        invoice.weight_bw,
        invoice.purity,
        parseFloat(invoice.total_price || 0).toFixed(2)
      ]);
      
      // Add table for invoices
      autoTable(doc, {
        head: [
          ['Date', 'Invoice No.', 'Account Name', 'Mobile', 
           'Gross Weight', 'Net Weight', 'Purity', 'Total Amt']
        ],
        body: invoiceData,
        startY: startY,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [22, 160, 133],
          textColor: 255,
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });
      
      // Update startY position for next group
      startY = doc.lastAutoTable.finalY + 10;
      
      // Add page break if needed
      if (startY > 280 && groupIndex < groupedData.length - 1) {
        doc.addPage();
        startY = 20;
      }
    });
    
    // Generate a file name with current date
    const fileName = `ItemSalesReport_${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}.pdf`;
    
    doc.save(fileName);
  };

  // Group the data for display
  const groupedData = useMemo(() => groupByItem(filteredData), [filteredData]);

  // Render expanded row (sub-component)
  const renderRowSubComponent = React.useCallback(
    ({ row }) => {
      return (
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
          <Table striped bordered responsive style={{ fontSize: '14px' }}>
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
      );
    },
    [invoiceColumns]
  );

  return (
    <div className="main-container" style={{ fontSize: '14px' }}>
      <div className="payments-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Item Sales Report</h3>
            <div>
              <Button variant="success" onClick={exportToExcel} className="me-2" style={{ fontSize: '14px' }}>
                <FaFileExcel className="me-1" /> Export to Excel
              </Button>
              <Button variant="danger" onClick={exportToPDF} style={{ fontSize: '14px' }}>
                <FaFilePdf className="me-1" /> Export to PDF
              </Button>
            </div>
          </Col>
        </Row>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <DataTable
            columns={columns}
            data={groupedData}
            renderRowSubComponent={renderRowSubComponent}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            onFilter={filterData}
          />
        )}
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="xl" className='m-auto'>
        <Modal.Header closeButton style={{ fontSize: '14px' }}>
          <Modal.Title style={{ fontSize: '14px' }}>Sales Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: '14px' }}>
          {repairDetails && (
            <>
              <h5 style={{ fontSize: '14px' }}>Customer Info</h5>
              <Table bordered style={{ fontSize: '14px' }}>
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

              <h5 style={{ fontSize: '14px' }}>Products</h5>
              <div className="table-responsive">
                <Table bordered style={{ fontSize: '14px' }}>
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
        <Modal.Footer style={{ fontSize: '14px' }}>
          <Button variant="secondary" onClick={handleCloseModal} style={{ fontSize: '14px' }}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ItemSale;