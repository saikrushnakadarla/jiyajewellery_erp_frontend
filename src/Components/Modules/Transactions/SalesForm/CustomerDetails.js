import React, { useEffect, useState, useRef } from "react";
import { Col, Row, Button, Modal } from "react-bootstrap";
import InputField from "./../../Transactions/SalesForm/InputfieldSales";
import { AiOutlinePlus } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import baseURL from './../../../../Url/NodeBaseURL';
import baseURL2 from './../../../../Url/NodeBaseURL2';
import Swal from 'sweetalert2';

const CustomerDetails = ({
  formData,
  setFormData,
  handleCustomerChange,
  handleAddCustomer,
  customers,
  setSelectedMobile,
  mobileRef,
  tabId,
  onPacketSelect,
  onProductsFetched
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedMobile, setSelectedMobileState] = useState("");
  const [uniqueInvoice, setUniqueInvoice] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  
  // Packet modal states
  const [showPacketModal, setShowPacketModal] = useState(false);
  const [packetData, setPacketData] = useState([]);
  const [selectedPacketBarcode, setSelectedPacketBarcode] = useState(null);
  const [loadingPackets, setLoadingPackets] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const handleCustomerChangeWrapper = (customerId) => {
    console.log("🔄 handleCustomerChange called with:", customerId);
    
    const customer = customers.find(
      (cust) => String(cust.customer_id) === String(customerId) || 
                 String(cust.account_id) === String(customerId)
    );

    if (customer) {
      console.log("✅ Customer found:", customer);
      console.log("   Customer ID:", customer.customer_id);
      console.log("   Customer Name:", customer.account_name);
      console.log("   Mobile:", customer.mobile);
      
      setFormData((prevData) => ({
        ...prevData,
        customer_id: customer.customer_id,
        cust_id: customer.customer_id,
        account_name: customer.account_name || "",
        mobile: customer.mobile || "",
        email: customer.email || "",
        address1: customer.address1 || "",
        address2: customer.address2 || "",
        city: customer.city || "",
        pincode: customer.pincode || "",
        state: customer.state || "",
        state_code: customer.state_code || "",
        aadhar_card: customer.aadhar_card || "",
        gst_in: customer.gst_in || "",
        pan_card: customer.pan_card || "",
        invoice_number: prevData.invoice_number || "",
      }));
      
      setSelectedMobileState(customer.mobile || "");
      if (setSelectedMobile) {
        setSelectedMobile(customer.mobile || "");
      }

      const filtered = uniqueInvoice.filter(
        (invoice) =>
          invoice.customer_name === customer.account_name ||
          invoice.mobile === customer.mobile,
      );
      setFilteredInvoices(filtered);
      
      if (customer.mobile) {
        fetchBalance(customer.mobile);
      }
    } else {
      console.log("❌ No customer found with ID:", customerId);
      setFormData((prevData) => ({
        ...prevData,
        customer_id: "",
        cust_id: "",
        account_name: "",
        mobile: "",
        email: "",
        address1: "",
        address2: "",
        city: "",
        pincode: "",
        state: "",
        state_code: "",
        aadhar_card: "",
        gst_in: "",
        pan_card: "",
        invoice_number: prevData.invoice_number || "",
      }));
      setSelectedMobileState("");
      setFilteredInvoices(uniqueInvoice);
      setBalance("0.00");
    }
  };

  useEffect(() => {
    if (location.state?.mobile) {
      console.log("Received Mobile from navigation:", location.state.mobile);
      const customer = customers.find(
        (cust) => cust.mobile === location.state.mobile
      );
      if (customer) {
        handleCustomerChangeWrapper(customer.customer_id);
        setSelectedMobileState(location.state.mobile);
        fetchBalance(location.state.mobile);
      }
    }
  }, [location.state?.mobile, customers]);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await axios.get(`${baseURL}/get-unique-repair-details`);
        const filteredData = response.data.filter(
          (item) =>
            item.transaction_status === "Sales" || item.transaction_status === "ConvertedInvoice"
        );
        setData(filteredData);
      } catch (error) {
        console.error("Error fetching repair details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepairs();
  }, []);

  const fetchBalance = (mobile) => {
    if (!mobile) {
      setBalance("0.00");
      return;
    }

    setLoading(true);

    const customerData = data.filter((item) => item.mobile === mobile);

    const totalBalance = customerData.reduce((sum, item) => {
      const bal_amt = Number(item.bal_amt) || 0;
      const bal_after_receipts = Number(item.bal_after_receipts) || 0;
      const receipts_amt = Number(item.receipts_amt) || 0;

      const balance = bal_amt === receipts_amt
        ? bal_after_receipts
        : bal_after_receipts || bal_amt;

      return sum + balance;
    }, 0);

    setBalance(totalBalance.toFixed(2));
    setLoading(false);
  };

  useEffect(() => {
    if (formData.mobile && data.length > 0) {
      fetchBalance(formData.mobile);
    }
    if (!formData.mobile) {
      setBalance("0.00");
    }
  }, [formData.mobile, data]);

  useEffect(() => {
    if (selectedMobile) {
      fetchBalance(selectedMobile);
    }
  }, [selectedMobile]);

  const handleAddReceipt = () => {
    const selectedCustomer = customers.find(
      cust => cust.mobile === formData.mobile
    );

    if (selectedCustomer) {
      navigate("/receipts", {
        state: {
          from: `/sales?tabId=${tabId}`,
          invoiceData: {
            account_name: selectedCustomer.account_name,
            mobile: selectedCustomer.mobile,
          }
        }
      });
    } else {
      alert("Please select a customer first");
    }
  };

  useEffect(() => {
    if (location.state?.selectedMobile) {
      setFormData(prev => ({
        ...prev,
        mobile: location.state.selectedMobile
      }));

      const existing = customers.find(c => c.mobile === location.state.selectedMobile);
      if (existing) {
        handleCustomerChangeWrapper(existing.customer_id);
        fetchBalance(existing.mobile);
      }

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.selectedMobile, customers]);

  // Fetch customer packets
  const fetchCustomerPackets = async () => {
    console.log("========== FETCHING CUSTOMER PACKETS ==========");
    
    const selectedCustomerId = formData.customer_id || formData.cust_id;
    console.log("Selected Customer ID from formData:", selectedCustomerId);
    
    if (!selectedCustomerId) {
      console.log("❌ No customer selected");
      alert("Please select a customer first");
      return;
    }

    setLoadingPackets(true);
    try {
      console.log("📡 Fetching all estimates from API...");
      const response = await axios.get(`${baseURL2}/get/estimates`);
      const allEstimates = Array.isArray(response.data) ? response.data : [];
      
      console.log("✅ Total estimates fetched:", allEstimates.length);
      
      const filteredPackets = allEstimates.filter(estimate => {
        const estimateCustId = estimate.cust_id;
        const hasPacketBarcode = estimate.packet_barcode && 
                                 estimate.packet_barcode !== null && 
                                 estimate.packet_barcode !== 'null' &&
                                 estimate.packet_barcode !== '';
        
        const isMatch = estimateCustId === selectedCustomerId;
        
        if (isMatch && hasPacketBarcode) {
          console.log(`✅ MATCH FOUND!`);
          console.log(`   Estimate: ${estimate.estimate_number}`);
          console.log(`   Cust ID: ${estimateCustId}`);
          console.log(`   Packet Barcode: ${estimate.packet_barcode}`);
        }
        
        return isMatch && hasPacketBarcode;
      });
      
      console.log(`✅ Filtered packets count: ${filteredPackets.length}`);
      setPacketData(filteredPackets);
      setShowPacketModal(true);
    } catch (error) {
      console.error("❌ Error fetching estimates:", error);
      alert("Failed to fetch packet details");
    } finally {
      setLoadingPackets(false);
    }
  };

// Fetch products for selected packet
const fetchProductsForPacket = async (packetBarcode) => {
  console.log("========== FETCHING PRODUCTS FOR PACKET ==========");
  console.log("Selected Packet Barcode:", packetBarcode);
  
  setLoadingProducts(true);
  try {
    // Step 1: Get all estimates to find code for this packet
    const estimatesResponse = await axios.get(`${baseURL2}/get/estimates`);
    const allEstimates = Array.isArray(estimatesResponse.data) ? estimatesResponse.data : [];
    
    // Find estimates with this packet_barcode
    const matchedEstimates = allEstimates.filter(
      estimate => estimate.packet_barcode === packetBarcode
    );
    
    console.log(`✅ Found ${matchedEstimates.length} estimates with packet: ${packetBarcode}`);
    
    if (matchedEstimates.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Products',
        text: 'No products found for this packet'
      });
      setLoadingProducts(false);
      return;
    }
    
    // Step 2: Get all opening tags (stock entries)
    const stockResponse = await axios.get(`${baseURL}/get/opening-tags-entry`);
    const stockData = stockResponse.data.result || [];
    
    console.log(`✅ Total stock entries fetched: ${stockData.length}`);
    
    // Step 3: Get codes from matched estimates and find matching stock entries
    const matchedProducts = [];
    const codesNotFound = [];
    
    matchedEstimates.forEach(estimate => {
      const code = estimate.code;
      console.log(`🔍 Searching for code: ${code}`);
      
      // Find matching stock entry with Status 'Selected'
      const stockEntry = stockData.find(
        item => item.PCode_BarCode === code && item.Status === 'Selected'
      );
      
      if (stockEntry) {
        console.log(`✅ Found stock entry for code ${code}:`, stockEntry);
        console.log(`   Status: ${stockEntry.Status}`);
        
        // Map stock entry to product format
        const product = {
          code: stockEntry.PCode_BarCode,
          product_id: stockEntry.product_id,
          product_name: stockEntry.sub_category || stockEntry.product_Name || '',
          metal_type: stockEntry.metal_type || '',
          design_name: stockEntry.design_master || '',
          purity: stockEntry.Purity || '',
          category: stockEntry.category || '',
          sub_category: stockEntry.sub_category || '',
          gross_weight: stockEntry.Gross_Weight || '0',
          stone_weight: stockEntry.Stones_Weight || '0',
          stone_price: stockEntry.Stones_Price || '0',
          weight_bw: stockEntry.Weight_BW || '0',
          va_on: stockEntry.Wastage_On || "Gross Weight",
          va_percent: stockEntry.Wastage_Percentage || '0',
          wastage_weight: stockEntry.WastageWeight || '0',
          total_weight_av: stockEntry.TotalWeight_AW || '0',
          mc_on: stockEntry.Making_Charges_On || "MC %",
          mc_per_gram: stockEntry.MC_Per_Gram || '0',
          making_charges: stockEntry.Making_Charges || '0',
          rate: stockEntry.rate || '0',
          rate_amt: '0',
          tax_percent: stockEntry.tax || '03% GST',
          tax_amt: stockEntry.tax_amt || '0',
          total_price: stockEntry.total_price || '0',
          pricing: stockEntry.Pricing || 'By Weight',
          qty: stockEntry.pcs || 1,
          hm_charges: '60.00',
          opentag_id: stockEntry.opentag_id,
          imagePreview: stockEntry.image || null,
          Status: stockEntry.Status,
          Stock_Point: stockEntry.Stock_Point
        };
        
        matchedProducts.push(product);
      } else {
        console.log(`❌ No stock found with Status 'Selected' for code: ${code}`);
        codesNotFound.push(code);
      }
    });
    
    console.log(`✅ Total products matched: ${matchedProducts.length}`);
    console.log(`❌ Codes not found: ${codesNotFound.length}`, codesNotFound);
    
    // Step 4: Close packet modal
    setShowPacketModal(false);
    setSelectedPacketBarcode(null);
    
    if (matchedProducts.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Products Available',
        text: `No products found with Status 'Selected' for this packet.\n\nCodes not found: ${codesNotFound.join(', ')}`,
        confirmButtonText: 'OK'
      });
    } else {
      // Step 5: Pass products to parent component
      if (onProductsFetched) {
        onProductsFetched(matchedProducts);
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Products Added!',
        html: `
          <div style="text-align: left;">
            <p><strong>Added Products:</strong> ${matchedProducts.length}</p>
            ${codesNotFound.length > 0 ? `<p class="text-warning"><strong>Products not found with Status 'Selected':</strong> ${codesNotFound.join(', ')}</p>` : ''}
          </div>
        `,
        confirmButtonText: 'OK'
      });
    }
    
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to fetch products for this packet'
    });
  } finally {
    setLoadingProducts(false);
  }
};
  const handlePacketSelect = (packetBarcode) => {
    console.log("🎯 Packet selected:", packetBarcode);
    setSelectedPacketBarcode(packetBarcode);
    if (onPacketSelect) {
      onPacketSelect(packetBarcode);
    }
  };

  const confirmPacketSelection = () => {
    if (selectedPacketBarcode) {
      console.log("✅ Confirmed Packet Selection:", selectedPacketBarcode);
      // Fetch products for the selected packet
      fetchProductsForPacket(selectedPacketBarcode);
    }
  };

  return (
    <Col className="sales-form-section">
      <Row>
        <Col xs={12} md={3} className="d-flex align-items-center">
          <div style={{ flex: 1 }}>
            <InputField
              label="Mobile"
              name="mobile"
              type="select"
              value={formData.mobile || ""}
              onChange={(e) => {
                const inputMobile = e.target.value;
                console.log("📱 Mobile input changed:", inputMobile);
                
                if (!inputMobile) {
                  setFormData((prev) => ({
                    ...prev,
                    customer_id: "",
                    cust_id: "",
                    account_name: "",
                    mobile: "",
                    email: "",
                    address1: "",
                    address2: "",
                    city: "",
                    pincode: "",
                    state: "",
                    state_code: "",
                    aadhar_card: "",
                    gst_in: "",
                    pan_card: "",
                  }));
                  setBalance("0.00");
                  return;
                }

                const isValidMobile = /^\d{10}$/.test(inputMobile);
                if (!isValidMobile) {
                  alert("Please enter a valid 10-digit mobile number.");
                  return;
                }

                setFormData((prev) => ({ ...prev, mobile: inputMobile }));

                const existing = customers.find((c) => c.mobile === inputMobile);
                if (existing) {
                  console.log("✅ Customer found with mobile:", inputMobile);
                  console.log("   Customer ID:", existing.customer_id);
                  console.log("   Customer Name:", existing.account_name);
                  handleCustomerChangeWrapper(existing.customer_id);
                  fetchBalance(existing.mobile);
                } else {
                  console.log("❌ No customer found with mobile:", inputMobile);
                  setFormData((prev) => ({
                    ...prev,
                    customer_id: "",
                    cust_id: "",
                    account_name: "",
                    email: "",
                    address1: "",
                    address2: "",
                    city: "",
                    pincode: "",
                    state: "",
                    state_code: "",
                    aadhar_card: "",
                    gst_in: "",
                    pan_card: "",
                  }));
                  setBalance("0.00");
                }
              }}
              onKeyDown={({ key, value }) => {
                if (key === "Enter") {
                  const isValidMobile = /^\d{10}$/.test(value);
                  const exists = customers.some((c) => c.mobile === value);
                  if (isValidMobile && !exists) {
                    handleAddCustomer(value);
                  }
                }
              }}
              options={customers.map((c) => ({ 
                value: c.mobile, 
                label: `${c.mobile} - ${c.account_name}` 
              }))}
              allowCustomInput
            />
          </div>
          <AiOutlinePlus
            size={20}
            color="black"
            onClick={() => {
              console.log("➕ Add Customer clicked. Mobile:", formData.mobile);
              handleAddCustomer(formData.mobile);
            }}
            style={{
              marginLeft: "10px",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          />
        </Col>

        <Col xs={12} md={3}>
          <InputField
            label="Customer Name"
            name="account_name"
            type="select"
            value={formData.account_name || ""}
            onChange={(e) => {
              const inputName = e.target.value;
              console.log("👤 Customer name input changed:", inputName);

              if (!inputName) {
                setFormData((prev) => ({
                  ...prev,
                  customer_id: "",
                  cust_id: "",
                  account_name: "",
                  mobile: "",
                  email: "",
                  address1: "",
                  address2: "",
                  city: "",
                  pincode: "",
                  state: "",
                  state_code: "",
                  aadhar_card: "",
                  gst_in: "",
                  pan_card: "",
                }));
                setBalance("0.00");
                return;
              }

              setFormData((prev) => ({ ...prev, account_name: inputName }));

              const existing = customers.find((c) => c.account_name === inputName);
              if (existing) {
                console.log("✅ Customer found with name:", inputName);
                console.log("   Customer ID:", existing.customer_id);
                console.log("   Mobile:", existing.mobile);
                handleCustomerChangeWrapper(existing.customer_id);
                fetchBalance(existing.mobile);
              } else {
                console.log("❌ No customer found with name:", inputName);
                setFormData((prev) => ({
                  ...prev,
                  customer_id: "",
                  cust_id: "",
                  mobile: "",
                  email: "",
                  address1: "",
                  address2: "",
                  city: "",
                  pincode: "",
                  state: "",
                  state_code: "",
                  aadhar_card: "",
                  gst_in: "",
                  pan_card: "",
                }));
                setBalance("0.00");
              }
            }}
            options={customers.map((c) => ({ 
              value: c.account_name || "", 
              label: c.account_name || "" 
            }))}
            allowCustomInput
          />
        </Col>

        <Col xs={12} md={2}>
          <InputField
            label="Email:"
            name="email"
            type="email"
            value={formData.email || ""}
            readOnly
          />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="Address1:"
            name="address1"
            value={formData.address1 || ""}
            readOnly
          />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="City"
            name="city"
            value={formData.city || ""}
            readOnly
          />
        </Col>
        <Col xs={12} md={1}>
          <InputField
            label="PIN"
            name="pincode"
            value={formData.pincode || ""}
            readOnly
          />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="State:"
            name="state"
            value={formData.state || ""}
            readOnly
          />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="Aadhar"
            name="aadhar_card"
            value={formData.aadhar_card || ""}
            readOnly
          />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="GSTIN"
            name="gst_in"
            value={formData.gst_in || ""}
            readOnly
          />
        </Col>
        <Col xs={12} md={2}>
          <InputField
            label="Balance Amount:"
            name="balance"
            value={loading ? "Loading..." : `₹ ${balance}`}
            readOnly
          />
        </Col>
        <Col xs={12} md={2}>
          <Button
            style={{
              backgroundColor: '#28a745',
              borderColor: '#28a745',
              fontSize: '0.875rem',
              padding: '0.35rem 0.75rem',
              marginTop: '2px',
              width: '100%'
            }}
            onClick={handleAddReceipt}
          >
            + Add Receipt
          </Button>
        </Col>
        <Col xs={12} md={2}>
          <Button
            style={{
              backgroundColor: '#17a2b8',
              borderColor: '#17a2b8',
              fontSize: '0.875rem',
              padding: '0.35rem 0.75rem',
              marginTop: '2px',
              width: '100%'
            }}
            onClick={fetchCustomerPackets}
            disabled={!formData.customer_id && !formData.cust_id}
          >
            View Packets
          </Button>
        </Col>
      </Row>

      {/* Packet Selection Modal */}
      <Modal show={showPacketModal} onHide={() => setShowPacketModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select Packet Barcode</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingPackets ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading packet details...</p>
            </div>
          ) : packetData.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No packet barcodes found for this customer</p>
              <p className="text-muted small">
                Customer ID: {formData.customer_id || 'Not selected'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '40px' }}>Select</th>
                    <th>Estimate Number</th>
                    <th>Packet Barcode</th>
                    <th>Packet Weight</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Cust ID</th>
                  </tr>
                </thead>
                <tbody>
                  {packetData.map((estimate, index) => (
                    <tr key={estimate.estimate_id || index}>
                      <td>
                        <input
                          type="radio"
                          name="packetBarcode"
                          value={estimate.packet_barcode}
                          onChange={() => handlePacketSelect(estimate.packet_barcode)}
                          className="form-check-input"
                        />
                      </td>
                      <td>{estimate.estimate_number}</td>
                      <td>
                        <span className="badge bg-info text-dark">
                          {estimate.packet_barcode}
                        </span>
                      </td>
                      <td>{estimate.packet_wt || 'N/A'}</td>
                      <td>{new Date(estimate.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${
                          estimate.estimate_status === 'Pending' 
                            ? 'bg-warning' 
                            : estimate.estimate_status === 'Ordered' 
                              ? 'bg-success' 
                              : 'bg-secondary'
                        }`}>
                          {estimate.estimate_status || 'N/A'}
                        </span>
                      </td>
                      <td>{estimate.cust_id || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {loadingProducts && (
            <div className="text-center py-3">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading products...</span>
              </div>
              <p className="mt-2">Loading products for selected packet...</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPacketModal(false)}>
            Cancel
          </Button>
          {selectedPacketBarcode && !loadingProducts && (
            <Button 
              variant="primary" 
              onClick={confirmPacketSelection}
              disabled={loadingProducts}
            >
              {loadingProducts ? 'Loading...' : 'Confirm Selection'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Col>
  );
};

export default CustomerDetails;