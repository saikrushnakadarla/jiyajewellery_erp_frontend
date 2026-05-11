import React, { useEffect, useState } from 'react';
import axios from 'axios';
import baseURL from '../../../Url/NodeBaseURL';

function Receivables({ selectedCustomerMobile }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await axios.get(`${baseURL}/get-unique-repair-details`);
        // Filter only the records where transaction_status is 'Sales'
        const filteredData = response.data.filter(item => item.transaction_status === 'Sales' || item.transaction_status === "ConvertedInvoice" || item.transaction_status === "ConvertedRepairInvoice");
        setData(filteredData);
      } catch (error) {
        console.error('Error fetching repair details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepairs();
  }, []);

  // Filter the data based on selectedCustomerMobile if provided
  const customerData = selectedCustomerMobile
    ? data.filter(item => item.mobile === selectedCustomerMobile)
    : data;

  // Calculate the total balance amount
  const totalBalance = customerData.reduce((sum, item) => {
    const bal_amt = Number(item.bal_amt) || 0;
    const bal_after_receipts = Number(item.bal_after_receipts) || 0;
    const receipts_amt = Number(item.receipts_amt) || 0;
  
    // If bal_amt equals receipts_amt, use bal_after_receipts
    const balance = bal_amt === receipts_amt ? bal_after_receipts : bal_after_receipts || bal_amt;
  
    return sum + balance;
  }, 0).toFixed(2);
  

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3>Receivables</h3>
      <p style={{fontSize:'25px', color:'red', marginTop:'20px'}}>
        <strong>
        ₹ {totalBalance}
        </strong>
      </p>
    </div>
  );
}

export default Receivables;
