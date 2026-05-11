import React, { useState, useEffect } from "react";
import "./Purchase.css";
import { Container, Row, Col, Form } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import baseURL from "../../../../Url/NodeBaseURL";
import CustomerDetails from './CustomerDetails';
import PurchaseDetails from './PurchaseDetails';
import ProductDetails from './ProductDetails';
import StoneDetails from './StoneDetails';
import FormButtons from './FormButtons';


const URDPurchase = () => {
    const [metal, setMetal] = useState("");
     const [loading, setLoading] = useState(true);
    const [purity, setPurity] = useState("");
    const [product, setProduct] = useState("");
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({
      name: "",
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
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: value
        }));
      };
    
  
      useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetch(`${baseURL}/get/account-details`);
            if (!response.ok) {
              throw new Error('Failed to fetch data');
            }
            const result = await response.json();
      
            // Filter only suppliers
            const customers = result.filter(
              (item) => item.account_group === 'CUSTOMERS'
            );
      
            setCustomers(customers);
            // setLoading(false);
            console.log("Customers=",customers)
          } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
          }
        };
      
        fetchData();
      }, []);
    
      const handleCustomerChange = (customerId) => {
        setFormData((prevData) => ({
          ...prevData,
          customer_id: customerId, // Ensure customer_id is correctly updated
        }));
      
        const customer = customers.find((cust) => String(cust.account_id) === String(customerId));
        console.log("Customer Id=",customer)
      
        if (customer) {
          setFormData({
            ...formData,
            customer_id: customerId, // Ensure this is correctly set
            name: customer.account_name, // Set the name field to the selected customer
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
    
          });
        } else {
          setFormData({
            ...formData,
            customer_id: "",
            name: "",
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
          });
        }
      };

      const handleBack = () => {
        navigate('/urdpurchasetable');
    };

    const handleAddCustomer = () => {
      navigate("/customermaster", { state: { from: "/purchase" } });
    };


    return (
      <div className="main-container">
        <div className="purchase-form-container">
          <Form>
            <div className="purchase-form">
              <div className="purchase-form-left">
                <CustomerDetails 
                  formData={formData} 
                  handleCustomerChange={handleCustomerChange} 
                  customers={customers} 
                  handleAddCustomer={handleAddCustomer} 
                />
               
              </div>
              <div className="purchase-form-right">
              <PurchaseDetails />
                
              </div>
            </div>

            <div className="urd-form-section">
            <ProductDetails 
                  product={product} 
                  setProduct={setProduct} 
                  metal={metal} 
                  setMetal={setMetal} 
                  purity={purity} 
                  setPurity={setPurity} 
                />
                 <StoneDetails />
                </div>
           
            <FormButtons handleBack={handleBack} />
          </Form>
        </div>
      </div>
    );
};

export default URDPurchase;