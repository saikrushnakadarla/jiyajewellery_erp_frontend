import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/ExpandedTable';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Row, Col, Modal, Table, Form } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../../Url/NodeBaseURL';
import { AuthContext } from "../../../Pages/Login/Context";
import Swal from 'sweetalert2';

const RepairsTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [repairDetails, setRepairDetails] = useState(null);
  const [show, setShow] = useState(false);
  const [remark, setRemark] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { authToken, userId, userName, role } = useContext(AuthContext);

  const { mobile } = location.state || {};
  const initialSearchValue = location.state?.mobile || '';

  // ✅ FIX 1: Hide the Expand checkbox column just for this table via CSS injection
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .sales-table-container .dataTable_headerRow th:first-child,
      .sales-table-container .dataTable_row td:first-child {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const getTabId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let tabId = urlParams.get('tabId');
    if (!tabId) {
      tabId = sessionStorage.getItem('tabId');
    }
    if (!tabId) {
      tabId = crypto.randomUUID();
      sessionStorage.setItem('tabId', tabId);
      const newUrl = `${window.location.pathname}?tabId=${tabId}`;
      window.history.replaceState({}, '', newUrl);
    }
    return tabId;
  };

  const tabId = getTabId();

  useEffect(() => {
    fetchRepairs();
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: 'SI',
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: 'Mobile',
        accessor: 'mobile',
      },
      {
        Header: 'Account',
        accessor: 'account_name',
      },
      {
        Header: 'Invoice No',
        accessor: 'invoice_number',
      },
      {
        Header: 'Order No',
        accessor: 'order_number',
      },
      {
        Header: 'Total Amt',
        accessor: 'net_amount',
        Cell: ({ value }) => value || 0
      },
      {
        Header: 'Old Amt',
        accessor: 'old_exchange_amt',
        Cell: ({ value }) => value || 0
      },
      {
        Header: 'Scheme Amt',
        accessor: 'scheme_amt',
        Cell: ({ value }) => value || 0
      },
      {
        Header: 'SaleReturn Amt',
        accessor: 'sale_return_amt',
        Cell: ({ value }) => value || 0
      },
      {
        Header: 'Net Amt',
        accessor: 'net_bill_amount',
        Cell: ({ value }) => value || 0
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
        Header: "Invoice",
        Cell: ({ row }) =>
          <a
            href={`${baseURL}/invoices/${row.original.invoice_number}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            📝 View
          </a>
      },
      {
        Header: 'Receipts',
        accessor: 'receipts',
        Cell: ({ row }) => {
          const { net_bill_amount, paid_amt, receipts_amt } = row.original;
          const totalPaid = Number(paid_amt) + Number(receipts_amt);
          const netBill = Number(net_bill_amount);

          return (
            <Button
              style={{
                backgroundColor: '#28a745',
                borderColor: '#28a745',
                fontSize: '0.800rem',
                padding: '0.10rem 0.5rem',
              }}
              onClick={() => handleAddReceipt(row.original)}
              disabled={netBill === totalPaid}
            >
              Add Receipt
            </Button>
          );
        },
      },
      {
        Header: 'Rate Cut / Payment',
        Cell: ({ row }) => (
          <div style={{ display: 'flex', gap: '5px' }}>
            <Button
              style={{
                backgroundColor: "#28a745",
                borderColor: "#28a745",
                fontSize: "0.75rem",
                padding: "0.25rem 0.5rem",
                opacity: row.original.Pricing === "By fixed" ? 0.6 : 1,
                cursor: row.original.Pricing === "By fixed" ? "not-allowed" : "pointer",
              }}
              onClick={() => handleAddRateCut(row.original)}
              disabled={row.original.Pricing === "By fixed"}
            >
              RateCut
            </Button>
            <Button
              style={{
                backgroundColor: "#28a745",
                borderColor: "#28a745",
                fontSize: "0.75rem",
                padding: "0.25rem 0.5rem",
              }}
              onClick={() => handleAddPayment(row.original)}
            >
              Payment
            </Button>
          </div>
        ),
      },
      {
  Header: 'Actions',
  accessor: 'actions',
  Cell: ({ row }) => {
    return (
      <div>
        <FaEye
          style={{ cursor: 'pointer', marginLeft: '10px', color: 'green' }}
          onClick={() => handleViewDetails(row.original.invoice_number)}
        />
        <FaEdit
          style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue' }}
          onClick={() =>
            handleEdit(
              row.original.invoice_number,
              row.original.mobile,
              row.original.cash_amount,
              row.original.card_amt,
              row.original.chq_amt,
              row.original.online_amt
            )
          }
        />
        <FaTrash
          style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
          onClick={() => handleDelete(row.original.invoice_number)}
        />
      </div>
    );
  },
},
    ],
    [userName] // ✅ Added dependency so isAdmin updates properly
  );

  // ✅ FIX 2: Compare only the date part, ignoring time/timezone issues
  function isCurrentDate(dateString) {
    if (!dateString) return false;
    const today = new Date();
    const date = new Date(dateString);

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    return todayStr === dateStr;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${date.getFullYear()}`;
  };

  const handleCreate = () => {
    const newTabId = crypto.randomUUID();
    navigate(`/sales?tabId=${newTabId}`);
  };

  const fetchRepairs = async () => {
    try {
      const response = await axios.get(`${baseURL}/get-unique-repair-details`);
      const filteredData = response.data.filter(
        (item) =>
          item.transaction_status === 'Sales' ||
          item.transaction_status === "ConvertedInvoice" ||
          item.transaction_status === "ConvertedRepairInvoice"
      );

      const normalized = filteredData.map((item) => ({
        ...item,
        invoice: item.invoice_number,
      }));

      setData(normalized.reverse());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching repair details:', error);
      setLoading(false);
    }
  };

  const handleClaim = (product) => {
    setSelectedProduct(product);
    setShow(true);
  };

  const handleClose = () => setShow(false);

  const handleSubmit = async () => {
    if (!remark) {
      alert("Please enter a remark.");
      return;
    }
    try {
      const response = await fetch(`${baseURL}/update-remark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct.id, remark }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Remark updated successfully!");
        setShow(false);
        setRemark("");
      } else {
        console.error("Error updating remark:", data.message);
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  };

  const handleAddRateCut = (product) => {
    const total_pure_wt =
      (Number(product.total_weight_av) || 0) -
      ((Number(product.paid_pure_weight) || 0) + (Number(product.paid_wt) || 0));

    const formatted_total_pure_wt = total_pure_wt.toFixed(3);
    navigate("/sales-ratecuts", {
      state: {
        invoice: product.invoice_number,
        category: product.category || product.product_name,
        sales_id: product.id,
        total_pure_wt: formatted_total_pure_wt,
      },
    });
  };

  const handleAddPayment = (product) => {
    navigate("/sales-payment", {
      state: {
        account_name: product.account_name,
        invoice: product.invoice_number,
        category: product.category || product.product_name,
        Pricing: product.Pricing,
        sales_id: product.id,
      },
    });
  };

  const handleEdit = async (invoice_number, mobile, cash_amount, card_amt, chq_amt, online_amt) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to edit this record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, go ahead!',
      cancelButtonText: 'No, cancel',
    });

    const newTabId = crypto.randomUUID();

    if (result.isConfirmed) {
      try {
        const repairResponse = await axios.get(`${baseURL}/get-repair-details/${invoice_number}`);
        const repairDetails = repairResponse.data;

        const filteredRepairData = repairDetails.repeatedData.filter(
          (item) =>
            item.transaction_status === "Sales" ||
            item.transaction_status === "ConvertedInvoice" ||
            item.transaction_status === "ConvertedRepairInvoice"
        );

        const order_number = filteredRepairData[0]?.order_number || invoice_number;
        const oldItemsResponse = await axios.get(`${baseURL}/get/olditems/${order_number}`);
        const oldItemsDetails = oldItemsResponse.data;

        const existingDetails = JSON.parse(localStorage.getItem(`repairDetails_${newTabId}`)) || [];
        const existingOldItems = JSON.parse(localStorage.getItem(`oldTableData_${newTabId}`)) || [];

        const today = new Date().toISOString().split('T')[0];

        const formattedRepairDetails = filteredRepairData.map((item) => ({
          ...item, date: today, invoice_number,
        }));

        const formattedOldItems = oldItemsDetails.map((item) => ({
          ...item, date: today, invoice_number,
        }));

        localStorage.setItem(`repairDetails_${newTabId}`, JSON.stringify([...existingDetails, ...formattedRepairDetails]));
        localStorage.setItem(`oldTableData_${newTabId}`, JSON.stringify([...existingOldItems, ...formattedOldItems]));

        const paymentDetails = {
          cash_amount: parseFloat(cash_amount) || 0,
          card_amt: parseFloat(card_amt) || 0,
          chq_amt: parseFloat(chq_amt) || 0,
          online_amt: parseFloat(online_amt) || 0,
        };
        localStorage.setItem(`paymentDetails_${newTabId}`, JSON.stringify(paymentDetails));

        navigate(`/sales?tabId=${newTabId}`, {
          state: { invoice_number, mobile, cash_amount, card_amt, chq_amt, online_amt, repairDetails: [...existingDetails, ...formattedRepairDetails] },
        });
      } catch (error) {
        Swal.fire('Error', 'Unable to fetch repair or old item details.', 'error');
      }
    } else {
      Swal.fire('Cancelled', 'Edit operation was cancelled.', 'info');
    }
  };

  const handleDelete = async (invoiceNumber, skipConfirmation = false, skipMessage = false) => {
    if (skipConfirmation) {
      try {
        const response = await axios.delete(`${baseURL}/repair-details/${invoiceNumber}`, { params: { skipMessage } });
        if (response.status === 200 || response.status === 204) {
          setData((prevData) => prevData.filter((item) => item.invoice_number !== invoiceNumber));
        }
      } catch (error) { console.error(error); }
    } else {
      Swal.fire({
        title: 'Are you sure?',
        text: `Do you really want to delete invoice ${invoiceNumber}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await axios.delete(`${baseURL}/repair-details/${invoiceNumber}`);
            if (response.status === 200) {
              Swal.fire('Deleted!', response.data.message, 'success');
              setData((prevData) => prevData.filter((item) => item.invoice_number !== invoiceNumber));
            }
          } catch (error) { Swal.fire('Error!', 'Failed to delete repair details.', 'error'); }
        }
      });
    }
  };

  const handleViewDetails = async (invoice_number) => {
    try {
      const response = await axios.get(`${baseURL}/get-repair-details/${invoice_number}`);
      const filteredData = response.data.repeatedData.filter(
        (item) =>
          item.transaction_status === "Sales" ||
          item.transaction_status === "ConvertedInvoice" ||
          item.transaction_status === "ConvertedRepairInvoice"
      );
      setRepairDetails({ ...response.data, repeatedData: filteredData });
      setShowModal(true);
    } catch (error) { console.error(error); }
  };

  const handleAddReceipt = (invoiceData) => {
    navigate("/receipts", {
      state: { from: "/salestable", invoiceData: { ...invoiceData, mobile: invoiceData.mobile } },
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setRepairDetails(null);
  };

  return (
    <div className="main-container">
      <div className="sales-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Sales</h3>
            <Button className="create_but" onClick={handleCreate} style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>+ Create</Button>
          </Col>
        </Row>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            initialSearchValue={initialSearchValue}
            // ✅ Dummy props to satisfy DataTable. Since we hide the checkbox via CSS, these are never triggered.
            expandedRows={{}}
            toggleRowExpansion={() => {}}
          />
        )}
      </div>

      {/* Sales Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" className="m-auto">
        <Modal.Header closeButton><Modal.Title>Sales Details</Modal.Title></Modal.Header>
        <Modal.Body style={{ fontSize: '13px' }}>
          {repairDetails && (
            <>
              <h5>Customer Info</h5>
              <Table bordered>
                <tbody>
                  <tr><td>Mobile</td><td>{repairDetails.uniqueData.mobile}</td></tr>
                  <tr><td>Account Name</td><td>{repairDetails.uniqueData.account_name}</td></tr>
                  <tr><td>Email</td><td>{repairDetails.uniqueData.email}</td></tr>
                  <tr><td>Address</td><td>{repairDetails.uniqueData.address1}</td></tr>
                  <tr><td>Invoice Number</td><td>{repairDetails.uniqueData.invoice_number}</td></tr>
                  <tr><td>Total Amount</td><td>{repairDetails.uniqueData.net_amount}</td></tr>
                </tbody>
              </Table>
              <h5>Products</h5>
              <div className="table-responsive">
                <Table bordered>
                  <thead style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                    <tr>
                      <th>Bar Code</th><th>Product Name</th><th>Metal</th><th>Purity</th>
                      <th>Gross Wt</th><th>Stone Wt</th><th>W.Wt</th><th>Total Wt</th>
                      <th>MC</th><th>Rate / Piece Cost</th><th>Tax Amt</th><th>Sale Status</th><th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                    {repairDetails.repeatedData.map((product, index) => (
                      <tr key={index}>
                        <td>{product.code}</td><td>{product.product_name}</td><td>{product.metal_type}</td>
                        <td>{product.selling_purity}</td><td>{product.gross_weight}</td><td>{product.stone_weight}</td>
                        <td>{product.wastage_weight}</td><td>{product.total_weight_av}</td><td>{product.making_charges}</td>
                        <td>{product.pieace_cost ? product.pieace_cost : product.rate}</td><td>{product.tax_amt}</td>
                        <td>{product.sale_status}</td><td>{product.total_price}</td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: 'bold' }}>
                      <td colSpan="12" className="text-end">Total Amount</td>
                      <td>{repairDetails.uniqueData.net_amount}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={handleCloseModal}>Close</Button></Modal.Footer>
      </Modal>

      {/* Claim Remark Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton><Modal.Title>Enter Remark</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            {selectedProduct?.claim_remark && (
              <div className="mb-2" style={{ fontWeight: "bold" }}>Previous Remark: {selectedProduct.claim_remark}</div>
            )}
            <Form.Group controlId="remarkInput">
              <Form.Label>New Remark</Form.Label>
              <Form.Control type="text" value={remark} onChange={(e) => setRemark(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} style={{ backgroundColor: 'gray', marginRight: '10px' }}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>
            {selectedProduct?.claim_remark ? "Update" : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RepairsTable;