import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Table, Form, Badge } from "react-bootstrap";
import axios from "axios";
import { FaEdit, FaTrash, FaQrcode, FaPrint, FaPlus, FaSearch, FaDatabase } from "react-icons/fa";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import "./QRCodePrinting.css";
import baseURL from "../../../../Url/NodeBaseURL2";

const QRCodePrintingERP = () => {
  const [packetRecords, setPacketRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    prefix: "",
    qr_number: "",
    qr_code: "",
    packet_date: new Date().toISOString().split('T')[0],
    packet_wt: "",
    quantity: 1,
    status: "Active",
    source: "ERP"
  });
  
  // QR Code preview
  const [qrPreview, setQrPreview] = useState(null);
  const qrCanvasRef = useRef(null);

  // Fetch ERP packet records only
  const fetchPacketRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/api/qr-packets?source=ERP`);
      if (response.data.success) {
        setPacketRecords(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching packet records:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch packet records'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics (only ERP stats)
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/qr-packets/stats/summary`);
      if (response.data.success) {
        // Filter to show only ERP stats
        const erpStats = response.data.data.filter(stat => stat.source === 'ERP');
        setStats(erpStats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchPacketRecords();
    fetchStats();
  }, []);

  // Get next QR number for a prefix (only for ERP)
  const getNextQRNumber = async (prefix) => {
    if (!prefix) return "0001";
    
    try {
      const response = await axios.get(`${baseURL}/api/qr-packets/next-number/${prefix}?source=ERP`);
      if (response.data.success) {
        return response.data.next_number;
      }
      return "0001";
    } catch (error) {
      console.error("Error getting next QR number:", error);
      return "0001";
    }
  };

  // Generate QR Code preview
  const generateQRCodePreview = async (prefix, qrNumber, packetDate, packetWt) => {
    try {
      const fullQRString = `${prefix}${qrNumber}`;
      const qrData = {
        qr_code: fullQRString,
        prefix: prefix,
        qr_number: qrNumber,
        packet_date: packetDate,
        packet_wt: packetWt,
        source: "ERP",
        timestamp: Date.now()
      };
      
      const qrString = JSON.stringify(qrData);
      
      const qrImageDataUrl = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      setQrPreview(qrImageDataUrl);
      
      setFormData(prev => ({
        ...prev,
        qr_code: qrString
      }));
      
      return qrString;
    } catch (error) {
      console.error("Error generating QR code:", error);
      return null;
    }
  };

  // Handle prefix change
  const handlePrefixChange = async (e) => {
    const { value } = e.target;
    
    if (value) {
      const nextNumber = await getNextQRNumber(value);
      
      setFormData(prev => ({
        ...prev,
        prefix: value,
        qr_number: nextNumber
      }));
      
      await generateQRCodePreview(
        value, 
        nextNumber, 
        formData.packet_date, 
        formData.packet_wt
      );
    } else {
      setFormData(prev => ({
        ...prev,
        prefix: value,
        qr_number: ""
      }));
      setQrPreview(null);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if ((name === 'prefix' || name === 'qr_number' || name === 'packet_date' || name === 'packet_wt') && formData.prefix && formData.qr_number) {
      const updatedData = {
        ...formData,
        [name]: value
      };
      generateQRCodePreview(
        updatedData.prefix,
        updatedData.qr_number,
        updatedData.packet_date,
        updatedData.packet_wt
      );
    }
  };

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    if (value < 1) {
      setFormData(prev => ({ ...prev, quantity: 1 }));
    } else if (value > 100) {
      setFormData(prev => ({ ...prev, quantity: 100 }));
    } else {
      setFormData(prev => ({ ...prev, quantity: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.prefix || !formData.packet_date) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Prefix and Date are required fields'
      });
      return;
    }

    if (!formData.qr_number) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'QR Number is required'
      });
      return;
    }

    try {
      setLoading(true);
      
      let response;
      
      if (isEditing) {
        response = await axios.put(`${baseURL}/api/qr-packets/${editId}`, {
          ...formData,
          source: "ERP"
        });
      } else {
        response = await axios.post(`${baseURL}/api/qr-packets`, {
          prefix: formData.prefix,
          qr_number: formData.qr_number,
          qr_code: formData.qr_code,
          packet_date: formData.packet_date,
          packet_wt: formData.packet_wt,
          status: formData.status,
          quantity: formData.quantity,
          source: "ERP"
        });
      }
      
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: isEditing ? 'Updated!' : 'Generated!',
          text: response.data.message,
          timer: 3000,
          showConfirmButton: true
        });
        
        resetForm();
        fetchPacketRecords();
        fetchStats();
      }
    } catch (error) {
      console.error("Error saving packet record:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save packet record(s)'
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      prefix: "",
      qr_number: "",
      qr_code: "",
      packet_date: new Date().toISOString().split('T')[0],
      packet_wt: "",
      quantity: 1,
      status: "Active",
      source: "ERP"
    });
    setQrPreview(null);
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (record) => {
    setFormData({
      prefix: record.prefix || "",
      qr_number: record.qr_number || "",
      qr_code: record.qr_code || "",
      packet_date: record.packet_date ? record.packet_date.split('T')[0] : new Date().toISOString().split('T')[0],
      packet_wt: record.packet_wt || "",
      quantity: 1,
      status: record.status || "Active",
      source: "ERP"
    });
    
    if (record.qr_code) {
      QRCode.toDataURL(record.qr_code, {
        width: 300,
        margin: 2
      }).then(dataUrl => {
        setQrPreview(dataUrl);
      });
    }
    
    setIsEditing(true);
    setEditId(record.id);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${baseURL}/api/qr-packets/${id}`);
        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Packet record deleted successfully',
            timer: 1500,
            showConfirmButton: false
          });
          fetchPacketRecords();
          fetchStats();
        }
      } catch (error) {
        console.error("Error deleting packet record:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete packet record'
        });
      }
    }
  };

  // Handle print QR Code
  const handlePrintQR = async (record) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [75, 25]
      });

      const qrImageData = await QRCode.toDataURL(record.qr_code || JSON.stringify({
        qr_code: `${record.prefix}${record.qr_number}`,
        prefix: record.prefix,
        qr_number: record.qr_number,
        packet_date: record.packet_date,
        packet_wt: record.packet_wt,
        source: record.source
      }), {
        width: 400,
        margin: 0
      });

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 25, 75, "F");

      const leftMargin = 2;
      const qrSize = 21;
      const qrHeight = 13;
      const qrStartY = 1;
      doc.addImage(qrImageData, "PNG", leftMargin, qrStartY, qrSize, qrHeight);

      let textY = 16;
      const textX = 2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(4);
      doc.setTextColor(0, 0, 0);

      doc.text(`QR: ${record.prefix}${record.qr_number}`, textX, textY);
      textY += 2;
      doc.text(`Date: ${record.packet_date}`, textX, textY);
      textY += 2;
      
      if (record.packet_wt) {
        doc.text(`Weight: ${record.packet_wt}g`, textX, textY);
      }
      textY += 2;
      doc.text(`Source: ${record.source}`, textX, textY);

      doc.save(`QR_${record.prefix}${record.qr_number}_${record.source}.pdf`);
      
      Swal.fire({
        icon: 'success',
        title: 'Printed!',
        text: 'QR Code PDF generated successfully',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error printing QR code:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to generate QR Code PDF'
      });
    }
  };

  // Filter records based on search (only ERP records are already in packetRecords)
  const filteredRecords = packetRecords.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (record.prefix?.toLowerCase().includes(searchLower)) ||
      (record.qr_number?.toLowerCase().includes(searchLower)) ||
      (`${record.prefix}${record.qr_number}`?.toLowerCase().includes(searchLower)) ||
      (record.packet_date?.includes(searchTerm)) ||
      (record.packet_wt?.toString().includes(searchTerm))
    );
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const quantityPreview = (() => {
    if (!formData.prefix || !formData.qr_number || isEditing) return null;
    
    const startNum = parseInt(formData.qr_number);
    const qty = parseInt(formData.quantity) || 1;
    const endNum = startNum + qty - 1;
    
    const start = startNum.toString().padStart(4, '0');
    const end = endNum.toString().padStart(4, '0');
    
    return {
      start: `${formData.prefix}${start}`,
      end: `${formData.prefix}${end}`,
      count: qty
    };
  })();

  return (
    <div className="erp-qr-main-container">
      <Container className="erp-qr-container">
        {/* Header */}
        <Row className="erp-qr-header-row mb-4">
          <Col md={12}>
            <div className="erp-qr-header-card">
              <div className="erp-qr-header-content">
                <div className="erp-qr-header-icon-wrapper">
                  <FaQrcode className="erp-qr-header-icon" />
                </div>
                <div className="erp-qr-header-text">
                  <h1 className="erp-qr-header-title">ERP QR Code Management</h1>
                  <p className="erp-qr-header-subtitle">Generate and manage QR codes for ERP packet tracking</p>
                </div>
              </div>
              <Button 
                className="erp-qr-add-btn"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                <FaPlus /> Add New Packet
              </Button>
            </div>
          </Col>
        </Row>

        {/* Statistics Cards - Only ERP Stats */}
        {stats && stats.length > 0 && (
          <Row className="erp-stats-row mb-4">
            {stats.map((stat, index) => (
              <Col md={12} key={index}>
                <div className="erp-stat-card erp-stat-erp">
                  <div className="erp-stat-icon">
                    <FaDatabase />
                  </div>
                  <div className="erp-stat-info">
                    <h4>ERP System Statistics</h4>
                    <div className="erp-stat-details">
                      <span>Total QR Codes: <strong>{stat.total}</strong></span>
                      <span>Active: <strong className="text-success">{stat.active_count}</strong></span>
                      <span>Used: <strong className="text-danger">{stat.used_count}</strong></span>
                      <span>Unique Prefixes: <strong>{stat.unique_prefixes}</strong></span>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}

        {/* Search Row */}
        <Row className="erp-qr-search-row mb-4">
          <Col md={8}>
            <div className="erp-qr-search-wrapper">
              <FaSearch className="erp-search-icon" />
              <input
                type="text"
                placeholder="Search by prefix, QR number, weight..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="erp-qr-search-input"
              />
            </div>
          </Col>
          <Col md={4} className="text-end">
            <span className="erp-record-count">
              Total ERP Records: {filteredRecords.length}
            </span>
          </Col>
        </Row>

        {/* Form Section */}
        {showForm && (
          <Row className="erp-qr-form-section mb-4">
            <Col md={12}>
              <div className="erp-qr-form-card">
                <h4 className="erp-form-title">
                  {isEditing ? 'Edit ERP Packet Record' : 'Add New ERP Packet Record(s)'}
                </h4>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Prefix <span className="erp-required">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="prefix"
                          value={formData.prefix}
                          onChange={handlePrefixChange}
                          placeholder="Enter prefix (e.g., ERP, PKG)"
                          required
                          disabled={isEditing}
                        />
                        <Form.Text className="erp-text-muted">
                          QR Number will auto-increment based on prefix
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Starting QR Number <span className="erp-required">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="qr_number"
                          value={formData.qr_number}
                          onChange={handleInputChange}
                          placeholder="Auto-generated"
                          readOnly={!isEditing}
                          className={!isEditing ? "erp-bg-light" : ""}
                        />
                        <Form.Text className="erp-text-muted">
                          Format: {formData.prefix}{formData.qr_number}
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label>Quantity {!isEditing && <span className="erp-required">*</span>}</Form.Label>
                        <Form.Control
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleQuantityChange}
                          min="1"
                          max="100"
                          disabled={isEditing}
                          className={isEditing ? "erp-bg-light" : ""}
                        />
                        <Form.Text className="erp-text-muted">
                          {isEditing ? 'Disabled in edit mode' : 'Number of QR codes to generate'}
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label>Date <span className="erp-required">*</span></Form.Label>
                        <Form.Control
                          type="date"
                          name="packet_date"
                          value={formData.packet_date}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label>Packet Weight (grams)</Form.Label>
                        <Form.Control
                          type="number"
                          name="packet_wt"
                          value={formData.packet_wt}
                          onChange={handleInputChange}
                          placeholder="Weight"
                          step="0.001"
                          min="0"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  {quantityPreview && !isEditing && (
                    <Row>
                      <Col md={12}>
                        <div className="erp-quantity-preview-alert">
                          <strong>Generation Preview:</strong> {quantityPreview.count} QR code(s) will be generated
                          <br />
                          <strong>Range:</strong> {quantityPreview.start} to {quantityPreview.end}
                        </div>
                      </Col>
                    </Row>
                  )}

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full QR Code Value (Preview)</Form.Label>
                        <Form.Control
                          type="text"
                          value={`${formData.prefix}${formData.qr_number}`}
                          readOnly
                          className="erp-bg-light"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>QR Code Data (JSON) - Sample for first QR</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="qr_code"
                          value={formData.qr_code}
                          readOnly
                          className="erp-qr-code-data-textarea"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {qrPreview && (
                    <Row className="mb-3">
                      <Col md={12} className="text-center">
                        <div className="erp-qr-preview-container">
                          <h5>QR Code Preview (First in series)</h5>
                          <img 
                            src={qrPreview} 
                            alt="QR Code Preview" 
                            className="erp-qr-preview-image"
                          />
                          <p className="mt-2">
                            <strong>{formData.prefix}{formData.qr_number}</strong>
                          </p>
                          <canvas ref={qrCanvasRef} style={{ display: 'none' }} />
                        </div>
                      </Col>
                    </Row>
                  )}

                  <Row>
                    <Col md={12} className="d-flex gap-2 justify-content-end">
                      <Button 
                        variant="secondary" 
                        onClick={resetForm}
                        className="erp-cancel-btn"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="erp-save-btn"
                        disabled={loading}
                      >
                        {loading ? 'Generating...' : isEditing ? 'Update' : `Generate ${formData.quantity > 1 ? `${formData.quantity} QR Codes` : 'QR Code'}`}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Col>
          </Row>
        )}

        {/* Records Table */}
        <Row className="erp-qr-table-section">
          <Col md={12}>
            <div className="erp-qr-table-card">
              <h4 className="erp-table-title">
                <FaQrcode className="erp-table-icon" /> ERP Packet Records
              </h4>
              <div className="table-responsive">
                <Table bordered hover className="erp-qr-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>QR Code</th>
                      <th>Prefix</th>
                      <th>QR Number</th>
                      <th>Date</th>
                      <th>Weight</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record, index) => (
                        <tr key={record.id}>
                          <td>{index + 1}</td>
                          <td>
                            <span className="erp-qr-code-badge">
                              {record.prefix}{record.qr_number}
                            </span>
                          </td>
                          <td>
                            <span className="erp-prefix-badge">{record.prefix}</span>
                          </td>
                          <td>
                            <span className="erp-qr-number-badge">{record.qr_number}</span>
                          </td>
                          <td>{formatDate(record.packet_date)}</td>
                          <td>{record.packet_wt ? `${record.packet_wt} g` : '-'}</td>
                          <td>
                            <span className={`erp-status-badge erp-status-${record.status?.toLowerCase()}`}>
                              {record.status || 'Active'}
                            </span>
                          </td>
                          <td>{formatDate(record.created_at)}</td>
                          <td>
                            <div className="erp-action-buttons">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handlePrintQR(record)}
                                title="Print QR Code"
                                className="erp-action-btn"
                                disabled={record.status === 'Used'}
                              >
                                <FaPrint />
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleEdit(record)}
                                title="Edit"
                                className="erp-action-btn"
                                disabled={record.status === 'Used'}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(record.id)}
                                title="Delete"
                                className="erp-action-btn"
                                disabled={record.status === 'Used'}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center erp-no-records">
                          No ERP records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default QRCodePrintingERP;