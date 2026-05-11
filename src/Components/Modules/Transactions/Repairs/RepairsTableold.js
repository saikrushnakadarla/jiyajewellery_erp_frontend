import React, { useEffect, useState } from 'react';
import { Row, Col, Modal, Button, Form, Table } from 'react-bootstrap';
import DataTable from '../../../Pages/InputField/TableLayout'; // Import the reusable DataTable component
import baseURL from "../../../../Url/NodeBaseURL";
import axios from 'axios';
import { FaTrash, FaEdit } from 'react-icons/fa';

import './RepairsTable.css';
import { useLocation, useNavigate } from 'react-router-dom';

const RepairsTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [repairs, setRepairs] = useState([]);
  const [assignedRepairDetails, setAssignedRepairDetails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const { mobile } = location.state || {};
  const initialSearchValue = location.state?.mobile || '';
  const [assignedData, setAssignedData] = useState({
    item_name: '',
    purity: '',
    qty: '',
    weight: '',
    rate_type: '',
    rate: '',
    amount: '',
  });
  const [tempTableData, setTempTableData] = useState([]);

  const [receivedData, setReceivedData] = useState({
    gross_wt_after_repair: '',
    total_amt: '',
  });
  const [isEditing, setIsEditing] = useState(false); // Track if editing
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    if (mobile) {
      console.log("Selected Mobile from Dashboard:", mobile);
    }
  }, [mobile]);

  const fetchRepairs = async () => {
    try {
      const response = await axios.get(`${baseURL}/get/repairs`);
      setRepairs(response.data);
      console.log("Repairs=",response.data)
    } catch (error) {
      console.error('Error fetching repairs:', error);
    }
  };

  const fetchAssignedRepairDetails = async () => {
    try {
      const response = await axios.get(`${baseURL}/assigned-repairdetails`);
      setAssignedRepairDetails(response.data);
      console.log("assigned Details=", response.data)
    } catch (error) {
      console.error('Error fetching repairs:', error);
    }
  };
  useEffect(() => {
    fetchRepairs();
    fetchAssignedRepairDetails();
  }, []);

  const handleActionChange = async (repairId, action) => {
    if (action === 'Assign to Workshop') {
      const repair = repairs.find((repair) => repair.repair_id === repairId);
      setSelectedRepair(repair);
      setShowModal(true);
    } else if (action === 'Receive from Workshop') {
      const repair = repairs.find((repair) => repair.repair_id === repairId);
      setSelectedRepair(repair);
      setShowReceiveModal(true);
    } else if (action === 'Delivery to Customer') {
      await updateRepairStatus(repairId, 'Delivery to Customer');
      fetchRepairs();
    }
  };

  const updateRepairStatus = async (repairId, status) => {
    try {
      const response = await fetch(`${baseURL}/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repairId, status }),
      });

      if (response.ok) {
        console.log('Repair status updated successfully');
      } else {
        console.error('Failed to update repair status');
      }
    } catch (error) {
      console.error('Error updating repair status:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...assignedData, [name]: value };

    // If the rate_type is selected, calculate the amount based on the rate type
    if (name === 'qty' || name === 'weight' || name === 'rate_type' || name === 'rate') {
      if (newData.rate_type === 'Rate per Qty' && newData.qty && newData.rate) {
        newData.amount = newData.qty * newData.rate;
      } else if (newData.rate_type === 'Rate for Weight' && newData.weight && newData.rate) {
        newData.amount = newData.weight * newData.rate;
      } else {
        newData.amount = ''; // Reset amount if no calculation is possible
      }
    }

    setAssignedData(newData);
  };

  const handleAddToTable = () => {
    const updatedData = [...tempTableData, assignedData];
    setTempTableData(updatedData);
    setAssignedData({ item_name: '', purity: '', qty: '', weight: '', rate_type: '', rate: '', amount: '', });

    // Save to local storage
    localStorage.setItem('tempTableData', JSON.stringify(updatedData));
  };

  const handleEdit = (index) => {
    const selectedData = tempTableData[index];
    setAssignedData(selectedData);
    setIsEditing(true);
    setEditIndex(index);
  };

  const handleUpdate = () => {
    const updatedData = [...tempTableData];
    updatedData[editIndex] = assignedData; // Replace the row with the updated data
    setTempTableData(updatedData);
    setAssignedData({ item_name: '', purity: '', qty: '', weight: '', rate_type: '', rate: '', amount: '' });
    setIsEditing(false);
    setEditIndex(null);
    localStorage.setItem('tempTableData', JSON.stringify(updatedData));
  };

  // Handle Delete action
  const handleDeleteTempData = (index) => {
    const updatedData = tempTableData.filter((_, i) => i !== index);
    setTempTableData(updatedData);
    localStorage.setItem('tempTableData', JSON.stringify(updatedData));
  };

  useEffect(() => {
    const storedData = localStorage.getItem('tempTableData');
    if (storedData) {
      setTempTableData(JSON.parse(storedData));
    }
  }, []);

  const handleSubmit = async () => {
    try {
      const requestData = tempTableData.map((data) => ({
        ...data,
        repair_id: selectedRepair.repair_id, // Ensure the key matches backend
      }));
      await axios.post(`${baseURL}/assign/repairdetails`, requestData);
      alert('Repair Details assigned successfully!');
      setTempTableData([]);
      localStorage.removeItem('tempTableData'); // Clear local storage
      setShowModal(false);
      fetchRepairs();
      fetchAssignedRepairDetails();
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this item?`);
    if (confirmDelete) {
      // Call your delete API or function here to delete the record using the `id`
      deleteRepairRecord(id);
    }
  };

  const deleteRepairRecord = (id) => {
    // Call API to delete the record by its `id` from the database
    axios
      .delete(`${baseURL}/assigned-repairdetails/${id}`) // Replace with your actual API endpoint
      .then((response) => {
        // Handle success
        console.log('Repair deleted:', response.data);
        // Optionally, you can update the UI by removing the record from the state
        setAssignedRepairDetails((prevDetails) =>
          prevDetails.filter((repair) => repair.id !== id) // Remove deleted record from the state
        );
        fetchRepairs();
        fetchAssignedRepairDetails();
      })

      .catch((error) => {
        // Handle error
        console.error('Error deleting repair:', error);
      });
  };

  const handleReceiveInputChange = (e) => {
    const { name, value } = e.target;
    setReceivedData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleReceiveSubmit = () => {
    if (!selectedRepair) return;

    const grossWtAfterRepair =
      selectedRepair.gross_weight -
      selectedRepair.estimated_dust +
      assignedRepairDetails
        .filter((repair) => repair.repair_id === selectedRepair.repair_id)
        .reduce((total, repair) => total + (repair.weight || 0), 0);

    const totalAmt = assignedRepairDetails
      .filter((repair) => repair.repair_id === selectedRepair.repair_id)
      .reduce((total, repair) => total + (repair.amount || 0), 0);

    // Prepare the payload
    const payload = {
      repair_id: selectedRepair.repair_id,
      gross_wt_after_repair: grossWtAfterRepair,
      total_amt: totalAmt,
    };

    // API call to update the repair details
    axios
      .put(`${baseURL}/repairs/${selectedRepair.repair_id}`, payload)
      .then((response) => {
        alert('Received from Workshop successfully!');
        setShowReceiveModal(false); // Close the modal
        fetchRepairs();
        fetchAssignedRepairDetails();
      })
      .catch((error) => {
        console.error('Error updating repair:', error);
      });
  };

  const handleRepairEdit = (id) => {
    navigate(`/repairs/${id}`);
  };

  const handleDeleteRepair = async (repairId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this repair?");
    if (!isConfirmed) {
      return; // Exit if the user cancels
    }

    try {
      const response = await axios.delete(`${baseURL}/delete/repairs/${repairId}`);
      if (response.status === 200) {
        alert(response.data.message);

        // Update the state to remove the deleted repair
        setRepairs((prevRepairs) => prevRepairs.filter((repair) => repair.repair_id !== repairId));
      }
    } catch (error) {
      console.error('Error deleting repair:', error.message);
      alert('Failed to delete repair entry. Please try again.');
    }
  };

  const columns = React.useMemo(
    () => [
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
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }) => {
          const date = new Date(value);
          return date.toLocaleDateString('en-GB');
        },
      },
      {
        Header: 'Total',
        accessor: 'total_amt',
        Cell: ({ value }) => (value !== null ? value : 0), // Display 0 if value is null
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
      {
        Header: 'Image',
        accessor: 'image',
        Cell: ({ value }) => {
          if (!value) return "No Image"; 
          const handleImageClick = () => {
            const newWindow = window.open();
            newWindow.document.write(`<img src="${value}" alt="Repair Image" style="width: 100%; height: auto;" />`);
          };
      
          return (
            <img
              src={value}
              alt="Repair Image"
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
                borderRadius: "5px",
                cursor: "pointer", 
              }}
              onClick={handleImageClick} 
              onError={(e) => e.target.src = "/placeholder.png"} 
            />
          );
        },
      },

      // {
      //   Header: 'Image',
      //   accessor: 'image',
      //   Cell: ({ value }) => {
      //     if (!value) return "No Image"; 
      //     const handleImageClick = () => {
      //       const newWindow = window.open();
      //       newWindow.document.write(`<img src="${value}" alt="Repair Image" style="width: 100%; height: auto;" />`);
      //     };
      
      //     return (
      //       <div>
      //         <span
      //           style={{
      //             color: "blue",
      //             textDecoration: "none",
      //             cursor: "pointer",
      //           }}
      //           onClick={handleImageClick} 
      //         >
      //           View
      //         </span>
      //       </div>
      //     );
      //   },
      // },
      
      
      {
        Header: 'Update Status',
        accessor: 'update_status',
        Cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div className="d-flex align-items-center">
              <select
                className="form-select custom-select"
                onChange={(e) => handleActionChange(row.original.repair_id, e.target.value)}
                defaultValue=""
                disabled={status === 'Delivery to Customer'} // Disable the dropdown if status is "Delivery to Customer"
              >
                <option value="" disabled>
                  Select Status
                </option>
                <option value="Assign to Workshop"
                  disabled={status === 'Assign to Workshop' || status === 'Receive from Workshop'}
                >
                  Assign to Workshop
                </option>
                <option value="Receive from Workshop"
                  disabled={status === 'Pending' || status === 'Receive from Workshop'}
                >
                  Receive from Workshop
                </option>
                <option value="Delivery to Customer"
                  disabled={status === 'Pending' || status === 'Assign to Workshop'}
                >
                  Delivery to Customer
                </option>
              </select>
            </div>
          );
        },
      },
      {
        Header: 'ACTION',
        Cell: ({ row }) => (
          <div className="d-flex align-items-center">
            <FaEdit
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue', }}
              onClick={() => handleRepairEdit(row.original.repair_id)}
            />
            <FaTrash
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'red', }}
              onClick={() => handleDeleteRepair(row.original.repair_id)}
            />
          </div>
        ),
      },
    ],
    [repairs]
  );

  return (
    <div className="main-container">
      <div className="repairs-table-container">
        <Row className="mb-4">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Repairs</h3>
            <Button
              className="create_but"
              onClick={() => navigate('/repairs')}
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
            >
              + Create
            </Button>
          </Col>
        </Row>
        <DataTable columns={columns} data={[...repairs].reverse()} initialSearchValue={initialSearchValue} />

        <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Assign to Workshop</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedRepair && (
              <div className="mb-3">
                <Row>
                  <Col md="4">
                    <strong>Item:</strong> {selectedRepair.item}
                  </Col>
                  <Col md="4">
                    <strong>Gross Weight:</strong> {selectedRepair.gross_weight}
                  </Col>
                  <Col md="2">
                    <strong>Pcs:</strong> {selectedRepair.pcs}
                  </Col>
                </Row>
              </div>
            )}
            <Form>
              <Row>
                <Col md={3}>
                  <Form.Group controlId="item_name">
                    <Form.Label><b>Item Name</b></Form.Label>
                    <Form.Control
                      type="text"
                      name="item_name"
                      value={assignedData.item_name}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="purity">
                    <Form.Label><b>Purity</b></Form.Label>
                    <Form.Control
                      type="text"
                      name="purity"
                      value={assignedData.purity}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="qty">
                    <Form.Label><b>Quantity</b></Form.Label>
                    <Form.Control
                      type="number"
                      name="qty"
                      value={assignedData.qty}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="weight">
                    <Form.Label><b>Weight</b></Form.Label>
                    <Form.Control
                      type="number"
                      name="weight"
                      value={assignedData.weight}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="rate_type">
                    <Form.Label><b>Rate Type</b></Form.Label>
                    <Form.Select
                      name="rate_type"
                      value={assignedData.rate_type || ''}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>Select</option>
                      <option value="Rate per Qty">Rate per Qty</option>
                      <option value="Rate for Weight">Rate for Weight</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group controlId="rate">
                    <Form.Label><b>Rate</b></Form.Label>
                    <Form.Control
                      type="number"
                      name="rate"
                      value={assignedData.rate}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="amount">
                    <Form.Label><b>Amount</b></Form.Label>
                    <Form.Control
                      type="number"
                      name="amount"
                      value={assignedData.amount}
                      onChange={handleInputChange}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
            <Button
              style={{ backgroundColor: "#a36e29", borderColor: "#a36e29" }}
              onClick={isEditing ? handleUpdate : handleAddToTable}
              className="mt-3"
            >
              {isEditing ? 'Update' : 'Add'}
            </Button>
            <Table striped bordered hover className="mt-3">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Purity</th>
                  <th>Quantity</th>
                  <th>Weight</th>
                  <th>Rate Type</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tempTableData.map((data, index) => (
                  <tr key={index}>
                    <td>{data.item_name}</td>
                    <td>{data.purity}</td>
                    <td>{data.qty}</td>
                    <td>{data.weight}</td>
                    <td>{data.rate_type}</td>
                    <td>{data.rate}</td>
                    <td>{data.amount}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaEdit
                          style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue', }}
                          onClick={() => handleEdit(index)}
                        />
                        <FaTrash
                          style={{ cursor: 'pointer', marginLeft: '10px', color: 'red', }}
                          onClick={() => handleDeleteTempData(index)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button style={{ backgroundColor: "#a36e29", borderColor: "#a36e29" }} onClick={handleSubmit}>
              Submit
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showReceiveModal} onHide={() => setShowReceiveModal(false)} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Receive from Workshop</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedRepair && (
              <div className="mb-3">
                <h5 style={{ fontWeight: 'bold' }}>Repair Item Details</h5>
                <Row className="mb-2">
                  <Col md="2">
                    <Form.Group controlId="category">
                      <Form.Label><strong>Category</strong></Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedRepair.category}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md="2">
                    <Form.Group controlId="sub_category">
                      <Form.Label><strong>Sub Category</strong></Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedRepair.sub_category}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md="2">
                    <Form.Group controlId="item">
                      <Form.Label><strong>Item</strong></Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedRepair.item}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md="2">
                    <Form.Group controlId="metal_type">
                      <Form.Label><strong>Metal Type</strong></Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedRepair.metal_type}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md="2">
                    <Form.Group controlId="purity">
                      <Form.Label><strong>Purity</strong></Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedRepair.purity}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md="2">
                    <Form.Group controlId="gross_weight">
                      <Form.Label><strong>Gross Wt</strong></Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedRepair.gross_weight}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col md="1">
                    <Form.Group controlId="pcs">
                      <Form.Label><strong>Pcs</strong></Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedRepair.pcs}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md="2">
                    <Form.Group controlId="estimated_dust">
                      <Form.Label><strong>Estimated Dust</strong></Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedRepair.estimated_dust}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md="2">
                    <Form.Group controlId="estimated_amt">
                      <Form.Label><strong>Estimated Amt</strong></Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedRepair.estimated_amt}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>
                {assignedRepairDetails
                  .filter((repair) => repair.repair_id === selectedRepair.repair_id)
                  .length > 0 ? (
                  <>
                    <h5 style={{ fontWeight: 'bold' }}>Assigned Details</h5>
                    <Table size="sm">
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Purity</th>
                          <th>Quantity</th>
                          <th>Weight</th>
                          <th>Rate Type</th>
                          <th>Rate</th>
                          <th>Amount</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedRepairDetails
                          .filter((repair) => repair.repair_id === selectedRepair.repair_id)
                          .map((repair, index) => (
                            <tr key={index}>
                              <td>{repair.item_name}</td>
                              <td>{repair.purity}</td>
                              <td>{repair.qty}</td>
                              <td>{repair.weight}</td>
                              <td>{repair.rate_type}</td>
                              <td>{repair.rate}</td>
                              <td>{repair.amount}</td>
                              <td>
                                <FaTrash
                                  style={{ cursor: 'pointer', color: 'red' }}
                                  onClick={() => handleDelete(repair.id)} // Use `id` for deletion
                                />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </>
                ) : (
                  <div>No assigned details available</div>
                )}
              </div>
            )}
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="gross_wt_after_repair">
                    <Form.Label><strong>Gross Weight after Repair</strong></Form.Label>
                    <Form.Control
                      type="text"
                      name="gross_wt_after_repair"
                      value={
                        selectedRepair ? // Check if selectedRepair is not null
                          (selectedRepair.gross_weight - selectedRepair.estimated_dust) +
                          assignedRepairDetails
                            .filter((repair) => repair.repair_id === selectedRepair.repair_id)
                            .reduce((total, repair) => total + (repair.weight || 0), 0)
                          : ''
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="total_amt">
                    <Form.Label><strong>Total Amount</strong></Form.Label>
                    <Form.Control
                      type="text"
                      name="total_amt"
                      value={
                        selectedRepair ?
                          assignedRepairDetails
                            .filter((repair) => repair.repair_id === selectedRepair.repair_id)
                            .reduce((total, repair) => total + (repair.amount || 0), 0)
                          : ''
                      }
                      onChange={handleReceiveInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReceiveModal(false)}>
              Close
            </Button>
            <Button style={{ backgroundColor: "#a36e29", borderColor: "#a36e29" }} onClick={handleReceiveSubmit}>
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default RepairsTable;
