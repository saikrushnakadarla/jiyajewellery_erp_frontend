import React, { useEffect, useState } from 'react';
import axios from 'axios';
import baseURL from '../../../Url/NodeBaseURL';

function Receivables({ selectedCustomerMobile }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);

//   useEffect(() => {
//     const fetchRepairs = async () => {
//       try {
//         const response = await fetch(`${baseURL}/get/purchases`);
//         const result = await response.json();
  
//         console.log('Fetched purchases:', result); // Log the data to the console
  
//         if (result) {
//           setData(result); // Assuming API returns an array of purchases
//         } else {
//           console.error('Unexpected data structure:', result);
//         }
//       } catch (error) {
//         console.error('Error fetching purchases:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchRepairs();
//   }, []);

//   const customerData = selectedCustomerMobile
//     ? data.filter(item => item.mobile === selectedCustomerMobile)
//     : data;

// const totalBalance = customerData.reduce((sum, item) => {
//   const balance_amount = Number(item.balance_amount) || 0;
//   const balance_after_receipt = Number(item.balance_after_receipt) || 0;
//   const paid_amt = Number(item.paid_amt) || 0;

//   // Use balance_after_receipt if balance_amount equals paid_amt, else fallback to valid values
//   const balance = balance_amount === paid_amt ? balance_after_receipt : balance_after_receipt || balance_amount;

//   return sum + balance;
// }, 0).toFixed(2);

// console.log("Total balance =", totalBalance);


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

      // Calculate the sum of all totalBalance values and update the state
      const totalBalanceSum = groupedData.reduce((sum, item) => sum + item.totalBalance, 0);
      setTotalBalance(totalBalanceSum); // Update the state

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);



  

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3>Payables</h3>
      <p style={{fontSize:'25px', color:'green', marginTop:'20px'}}>
      <strong>
          ₹ {totalBalance.toFixed(2)}  {/* Formats number with commas */}
        </strong>
      </p>
    </div>
  );
}

export default Receivables;
