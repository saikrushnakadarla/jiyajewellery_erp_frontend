import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/ExpandedTable';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Row, Col, Modal, Table, Form } from 'react-bootstrap';
import axios from 'axios';
import TagEntry from "./TagEntry";
import baseURL from '../../../../Url/NodeBaseURL';
import Swal from 'sweetalert2';

const RepairsTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [tagEntry, setTagEntry] = useState([]);
  const [rateCuts, setRateCuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState(null);
  const { mobile } = location.state || {};
  const initialSearchValue = location.state?.mobile || '';

  useEffect(() => {
    fetchPurchases();
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Sr. No.',
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: 'Mobile Number',
        accessor: 'mobile',
      },
      {
        Header: 'Invoice No.',
        accessor: 'invoice',
      },
      {
        Header: 'Account Name',
        accessor: 'account_name',
      },
      {
        Header: 'Taxable Amt',
        accessor: 'overall_taxableAmt',
      },
      {
        Header: 'Tax Amt',
        accessor: 'overall_taxAmt',
      },
      {
        Header: 'HM Charges',
        accessor: 'overall_hmCharges',
      },
      {
        Header: 'Final Amount',
        accessor: 'overall_netAmt',
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => {
          return (
            <div>
              <FaEye
                style={{ cursor: 'pointer', marginLeft: '10px', color: 'green' }}
                onClick={() => handleViewDetails(row.original.invoice)}
              />
              <FaEdit
                style={{
                  cursor: 'pointer',
                  marginLeft: '10px',
                  color: 'blue',
                }}
                onClick={() => handleEdit(row.original.invoice, row.original.mobile)}
              />
              <FaTrash
                style={{
                  cursor: 'pointer',
                  marginLeft: '10px',
                  color: 'red',
                }}
                onClick={() => handleDelete(row.original.invoice)}
              />
            </div>
          );
        },
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
  const handleCreate = () => {
    navigate('/purchase');
  };

  const fetchPurchases = async () => {
    try {
      const response = await axios.get(`${baseURL}/get-unique-purchase-details`);
      setData(response.data.reverse()); // Reverse data to show latest first
      setLoading(false);
    } catch (error) {
      console.error('Error fetching repair details:', error);
      setLoading(false);
    }
  };

  const handleAddPayment = (product) => {
    navigate("/purchase-payment", {
      state: {
        account_name: product.account_name,
        invoice: product.invoice,
        category: product.category,
        Pricing: product.Pricing,
        purchase_id: product.id,
      }
    });
  };

  const handleAddRateCut = (product) => {
    const total_pure_wt =
      (Number(product.total_pure_wt) || 0) -
      ((Number(product.paid_pure_weight) || 0) + (Number(product.paid_wt) || 0));

    const formatted_total_pure_wt = total_pure_wt.toFixed(3);
    navigate("/ratecuts", {
      state: {
        invoice: product.invoice,
        category: product.category,
        purchase_id: product.id,
        total_pure_wt: formatted_total_pure_wt,
      },
    });
  };

  const fetchBalance = async (product_id, tag_id) => {
    try {
      const response = await axios.get(`${baseURL}/get-balance/${product_id}/${tag_id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching balance:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchStockEntries = async () => {
      try {
        const response = await fetch(`${baseURL}/get/opening-tags-entry`);
        const data = await response.json();
        console.log("Stock Entries:", data.result);
        if (data?.result) {
          setTagEntry(data.result);
        } else {
          console.warn("No stock entries found.");
        }
      } catch (error) {
        console.error("Error fetching stock entries:", error.message);
      }
    };

    fetchStockEntries();
  }, []);

  useEffect(() => {
    const fetchRateCuts = async () => {
      try {
        const response = await axios.get(`${baseURL}/rateCuts`);
        console.log("RateCuts Data:", response.data);

        setRateCuts(response.data);
      } catch (error) {
        console.error("Error fetching rateCuts:", error);
      }
    };

    fetchRateCuts();
  }, []);

  const toggleRowExpansion = async (rowId, rowIndex, invoice) => {
    setExpandedRows((prev) => {
      const isExpanding = !prev[rowId];

      if (isExpanding) {
        // Store only the new expanded invoice
        localStorage.setItem("expandedInvoice", JSON.stringify({ invoice, rowIndex }));
        handleExpandedDetails(rowIndex, invoice);
      } else {
        // Remove from localStorage when collapsing
        localStorage.removeItem("expandedInvoice");
        setData((prevData) =>
          prevData.map((item) =>
            item.invoice === invoice ? { ...item, expandedContent: null } : item
          )
        );
      }

      // Ensure only one row is expanded at a time
      return { [rowId]: isExpanding };
    });
  };

  useEffect(() => {
    const storedData = localStorage.getItem("expandedInvoice");
    if (storedData) {
      const { invoice, rowIndex } = JSON.parse(storedData);
      if (invoice) {
        // Expand the row stored in localStorage
        handleExpandedDetails(rowIndex, invoice);
        setExpandedRows({ [invoice]: true });
      }
    }
  }, []);

  const handleExpandedDetails = async (rowIndex, invoice) => {
    try {
      // Fetch latest rateCuts data
      const rateCutsResponse = await axios.get(`${baseURL}/rateCuts`);
      const latestRateCuts = rateCutsResponse.data;

      // Fetch product details
      const response = await axios.get(`${baseURL}/get-purchase-details/${invoice}`);
      const productData = response.data.repeatedData;

      // Fetch balance for each product
      const productBalances = await Promise.all(
        productData.map(async (product) => {
          const balance = await fetchBalance(product.product_id, product.tag_id);
          return { ...product, balance };
        })
      );

      // Fetch Tag Entries to calculate tag totals
      const tagResponse = await fetch(`${baseURL}/get/opening-tags-entry`);
      const tagData = await tagResponse.json();

      // Calculate total Gross Weight for each tag_id
      const tagTotals = {};
      const taggedPcs = {};
      if (tagData?.result) {
        tagData.result.forEach((entry) => {
          if (!tagTotals[entry.tag_id]) {
            tagTotals[entry.tag_id] = 0;
          }
          tagTotals[entry.tag_id] += parseFloat(entry.Gross_Weight) || 0;
        });
      }
      if (tagData?.result) {
        tagData.result.forEach((entry) => {
          if (!taggedPcs[entry.tag_id]) {
            taggedPcs[entry.tag_id] = 0;
          }
          taggedPcs[entry.tag_id] += parseFloat(entry.pcs) || 0;
        });
      }

      // Function to get balance amount for each product from fresh rateCuts data
      const getBalanceAmountForProduct = (productId) => {
        const filteredRateCuts = latestRateCuts.filter(rateCut => rateCut.purchase_id === productId);
        const totalBalance = filteredRateCuts.reduce((sum, rateCut) => sum + parseFloat(rateCut.balance_amount || 0), 0);
        return totalBalance.toFixed(2);
      };

      const expandedContent = (
        <div style={{ overflowX: "auto", maxWidth: "100%" }}>
          <Table bordered style={{ whiteSpace: "nowrap", fontSize: "13px" }}>
            <thead style={{ fontSize: "13px", fontWeight: "bold", }}>
              <tr>
                {/* <th>Id</th> */}
                <th>Category</th>
                <th>Purity</th>
                <th>Pcs</th>
                <th>Gross Wt</th>
                <th>Stone Wt</th>
                <th>Net Wt</th>
                <th>W.Wt</th>
                <th>MC</th>
                <th>Total Wt</th>
                <th>Paid Wt</th>
                <th>Bal Wt</th>
                <th>Bal Amt</th>
                <th>Rate/Piece Cost</th>
                <th>Tag Pcs</th>
                <th>Tags Total</th>
                <th>Diff</th>
                <th>Excess/Short</th>
                <th>Claim</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "13px" }}>
              {productBalances.map((product, idx) => {
                const balPcs = product.balance?.bal_pcs || 0;
                const balGrossWeight = product.balance?.bal_gross_weight || 0;
                const tagTotal = tagTotals[product.tag_id] || 0;
                const taggedPieces = taggedPcs[product.tag_id] || 0;
                const diff = parseFloat(product.gross_weight) - tagTotal;

                const isTagEntryDisabled =
                  product.Pricing === "By Weight"
                    ? balPcs <= 0 || balGrossWeight <= 0
                    : product.Pricing === "By Fixed"
                      ? balPcs <= 0
                      : false;

                return (
                  <tr key={idx}>
                    {/* <td>{product.id}</td> */}
                    <td>{product.category}</td>
                    <td>{product.purityPercentage} %</td>
                    <td>{product.pcs}</td>
                    <td>{product.gross_weight}</td>
                    <td>{product.stone_weight}</td>
                    <td>{product.net_weight}</td>
                    <td>{product.wastage_wt}</td>
                    <td>{product.Making_Charges_Value}</td>
                    <td>{product.total_pure_wt}</td>
                    <td>
                      {((parseFloat(product.paid_pure_weight) || 0) + (parseFloat(product.paid_wt) || 0)).toFixed(3)}
                    </td>
                    <td>
                      {((Number(product.total_pure_wt) || 0) -
                        ((Number(product.paid_pure_weight) || 0) + (Number(product.paid_wt) || 0)))
                        .toFixed(3)}
                    </td>
                    <td>{getBalanceAmountForProduct(product.id)}</td>
                    <td>{product.rate}</td>
                    <td>{taggedPieces}</td>
                    <td>{tagTotal.toFixed(3)}</td> {/* Display Tags Total */}
                    <td>{diff.toFixed(3)}</td> {/* Display Difference */}
                    <td>
                      {parseFloat(product.gross_weight) > tagTotal ? "Short" : "Excess"}
                    </td>
                    <td onClick={() => handleClaim(product)} style={{ cursor: "pointer" }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{
                          backgroundColor: product.claim_remark ? "#a36e29" : "#a36e29", // Gray if claimed
                          borderColor: product.claim_remark ? "#a36e29" : "#a36e29",
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.75rem",
                          marginRight: "5px",
                          cursor: "pointer",
                          opacity: product.claim_remark ? 0.6 : 1, // Reduce opacity if claimed
                        }}
                        disabled={!!product.claim_remark} // Disable button if claim_remark exists
                      >
                        {product.claim_remark ? "Claimed" : "Claim"}
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{
                          backgroundColor: "#a36e29",
                          borderColor: "#a36e29",
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.75rem",
                          marginRight: "5px",
                        }}
                        onClick={() => handleOpenTagModal(product)}
                        disabled={isTagEntryDisabled}
                      >
                        Tag Entry
                      </button>

                      <Button
                        style={{
                          backgroundColor: "#28a745",
                          borderColor: "#28a745",
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                          marginRight: "5px",
                          opacity: product.Pricing === "By fixed" ? 0.6 : 1, // Reduce opacity when disabled
                          cursor: product.Pricing === "By fixed" ? "not-allowed" : "pointer", // Change cursor style
                        }}
                        onClick={() => handleAddRateCut(product)}
                        disabled={product.Pricing === "By fixed"}
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
                        onClick={() => handleAddPayment(product)}
                      >
                        {/* Add  */}
                        Payment
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      );

      setData((prevData) =>
        prevData.map((item, index) =>
          index === rowIndex ? { ...item, expandedContent } : item
        )
      );
    } catch (error) {
      console.error("Error fetching purchase details:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPurchaseDetails(null);
  };

  const handleViewDetails = async (invoice) => {
    try {
      const response = await axios.get(`${baseURL}/get-purchase-details/${invoice}`);
      console.log("Fetched order details: ", response.data);

      // Set repair details directly without filtering or checking conversion status
      setPurchaseDetails(response.data);

      setShowModal(true);
    } catch (error) {
      console.error("Error fetching repair details:", error);
    }
  };

  const handleEdit = async (
    invoice,
    mobile,
  ) => {
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

    if (result.isConfirmed) {
      try {
        // Fetch repair details
        const response = await axios.get(`${baseURL}/get-purchase-details/${invoice}`);
        const details = response.data;

        if (!details || !details.repeatedData) {
          console.error('No repeatedData found in response:', details);
          Swal.fire('Error', 'No repair details found for the provided order number.', 'error');
          return;
        }

        // Retrieve existing repair details from localStorage or set to an empty array if not available
        const existingDetails = JSON.parse(localStorage.getItem('tableData')) || [];

        // Get today's date in yyyy-mm-dd format
        const today = new Date().toISOString().split('T')[0];

        // Update repeatedData with today's date
        const formattedDetails = details.repeatedData.map((item) => ({
          ...item,
          date: today,
          invoice,
        }));

        const updatedDetails = [...existingDetails, ...formattedDetails];

        localStorage.setItem('tableData', JSON.stringify(updatedDetails));

        console.log('Updated repair details added to localStorage:', updatedDetails);

        // Navigate to the sales page with state
        navigate('/purchase', {
          state: {
            invoice,
            mobile,
            tableData: details,
          },
        });

        // Call handleDelete without confirmation
        // await handleDelete(invoice, true, true);
      } catch (error) {
        console.error('Error fetching repair details:', error);
        Swal.fire('Error', 'Unable to fetch repair details. Please try again.', 'error');
      }
    } else {
      Swal.fire('Cancelled', 'Edit operation was cancelled.', 'info');
    }
  };

  const handleDelete = async (invoice) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this purchase?');
    if (!confirmDelete) return;

    setLoading(true);

    try {
      const response = await fetch(`${baseURL}/deletepurchases/${invoice}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || 'Purchase deleted successfully');
        // Remove the deleted item from the state
        setData((prevData) => prevData.filter((item) => item.invoice !== invoice));
      } else {
        console.error('Error deleting purchase:', result.message);
        alert(result.message || 'Failed to delete purchase');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong while deleting the purchase');
    } finally {
      setLoading(false);
    }
  };

  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleOpenTagModal = (data) => {
    console.log("Opening Modal with Data:", data); // Log data when opening modal
    setSelectedProduct(data);
    setShowTagModal(true);
  };

  const handleCloseTagModal = () => {
    console.log("Closing Modal, Resetting Data:", selectedProduct); // Log data before closing
    setSelectedProduct(null);
    setShowTagModal(false);
  };

  const [show, setShow] = useState(false);
  const [remark, setRemark] = useState("");
  const handleClaim = (product) => {
    setSelectedProduct(product);  // Store product in state
    setShow(true);  // Show modal
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          remark: remark,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Remark Updated:", data);
        alert("Remark updated successfully!");
        setShow(false);
        setRemark("");

        // Update localStorage with new values
        const storedData = localStorage.getItem("expandedInvoice");
        if (storedData) {
          let parsedData = JSON.parse(storedData);
          parsedData.remark = remark; // Update remark in localStorage
          localStorage.setItem("expandedInvoice", JSON.stringify(parsedData));
        }

        // Fetch updated localStorage data and re-expand the row
        setTimeout(() => {
          const updatedData = localStorage.getItem("expandedInvoice");
          if (updatedData) {
            const { invoice, rowIndex } = JSON.parse(updatedData);
            if (invoice) {
              handleExpandedDetails(rowIndex, invoice);
              setExpandedRows({ [invoice]: true });
            }
          }
        }, 500);
      } else {
        console.error("Error updating remark:", data.message);
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  };



  return (
    <div className="main-container">
      <div className="sales-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Purchases</h3>
            <Button
              className="create_but"
              onClick={handleCreate}
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
            >
              + Create
            </Button>
          </Col>
        </Row>
        <DataTable columns={columns} data={data} initialSearchValue={initialSearchValue} expandedRows={expandedRows} toggleRowExpansion={toggleRowExpansion} />
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="xl" className="m-auto">
        <Modal.Header closeButton>
          <Modal.Title>Purchase Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize:'13px' }}>
          {purchaseDetails && (
            <>
              <h5>Customer Info</h5>
              <Table bordered>
                <tbody>
                  <tr>
                    <td>Bill Date</td>
                    <td>{new Date(purchaseDetails.uniqueData.date).toLocaleDateString('en-GB')}</td>
                  </tr>
                  <tr>
                    <td>Mobile</td>
                    <td>{purchaseDetails.uniqueData.mobile}</td>
                  </tr>
                  <tr>
                    <td>Account Name</td>
                    <td>{purchaseDetails.uniqueData.account_name}</td>
                  </tr>
                  <tr>
                    <td>GST Number</td>
                    <td>{purchaseDetails.uniqueData.gst_in}</td>
                  </tr>
                  <tr>
                    <td>Invoice Number</td>
                    <td>{purchaseDetails.uniqueData.invoice}</td>
                  </tr>
                </tbody>
              </Table>

              <h5>Products</h5>
              <div className="table-responsive">
                <Table bordered>
                  <thead style={{ whiteSpace: 'nowrap' }}>
                    <tr>
                      <th>Category</th>
                      <th>Purity</th>
                      <th>Pcs</th>
                      <th>Gross Wt</th>
                      <th>Stone Wt</th>
                      <th>W.Wt</th>
                      <th>Total Wt</th>
                      <th>Paid Wt</th>
                      <th>Bal Wt</th>
                    </tr>
                  </thead>
                  <tbody style={{ whiteSpace: 'nowrap' }}>
                    {purchaseDetails.repeatedData.map((product, index) => (
                      <tr key={index}>
                        <td>{product.category}</td>
                        <td>{product.purity}</td>
                        <td>{product.pcs}</td>
                        <td>{product.gross_weight}</td>
                        <td>{product.stone_weight}</td>
                        <td>{product.wastage_wt}</td>
                        <td>{product.total_pure_wt}</td>
                        <td>{product.paid_pure_weight}</td>
                        <td>{product.balance_pure_weight}</td>
                      </tr>
                    ))}
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

      <Modal
        show={showTagModal}
        onHide={handleCloseTagModal}
        size="lg"
        backdrop="static"
        keyboard={false}
        dialogClassName="custom-tagentrymodal-width"
      >
        <Modal.Header closeButton>
          <Modal.Title>Tag Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <TagEntry
              handleCloseTagModal={handleCloseTagModal}
              selectedProduct={selectedProduct}
              fetchBalance={fetchBalance}
            />
          )}
        </Modal.Body>
      </Modal>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter Remark</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Show existing remark if available */}
            {selectedProduct?.claim_remark && (
              <div className="mb-2" style={{ fontWeight: "bold", }}>
                Previous Remark: {selectedProduct.claim_remark}
              </div>
            )}

            <Form.Group controlId="remarkInput">
              <Form.Label>New Remark</Form.Label>
              <Form.Control
                type="text"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} style={{ backgroundColor: 'gray', marginRight: '10px' }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>
            {selectedProduct?.claim_remark ? "Update" : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default RepairsTable;
