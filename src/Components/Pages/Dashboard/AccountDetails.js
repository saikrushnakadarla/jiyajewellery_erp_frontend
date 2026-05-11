import React, { useEffect, useState } from 'react';
import axios from 'axios';
import baseURL from '../../../Url/NodeBaseURL';


const AccountDetailsTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the backend API
    axios
      .get(`${baseURL}/api/data`) // Replace with your actual API URL
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Account Details</h1>
      <table border="1" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Account ID</th>
            <th>Account Name</th>
            <th>Print Name</th>
            <th>Account Group</th>
            <th>Opening Balance</th>
            <th>Metal Balance</th>
            <th>City</th>
            <th>State</th>
            <th>Phone</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {data.account_details && (
            <tr>
              <td>{data.account_details.account_id}</td>
              <td>{data.account_details.account_name}</td>
              <td>{data.account_details.print_name}</td>
              <td>{data.account_details.account_group}</td>
              <td>{data.account_details.op_bal}</td>
              <td>{data.account_details.metal_balance}</td>
              <td>{data.account_details.city}</td>
              <td>{data.account_details.state}</td>
              <td>{data.account_details.phone}</td>
              <td>{data.account_details.email}</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>URD Purchases</h2>
      <table border="1" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Purchase Number</th>
            <th>Product Name</th>
            <th>Metal</th>
            <th>Purity</th>
            <th>Gross</th>
            <th>Rate</th>
            <th>Total Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.urd_purchases?.map((purchase) => (
            <tr key={purchase.id}>
              <td>{purchase.urdpurchase_number}</td>
              <td>{purchase.product_name}</td>
              <td>{purchase.metal}</td>
              <td>{purchase.purity}</td>
              <td>{purchase.gross}</td>
              <td>{purchase.rate}</td>
              <td>{purchase.total_amount}</td>
              <td>{purchase.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Repair Details</h2>
      <table border="1" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Metal Type</th>
            <th>Gross Weight</th>
            <th>Making Charges</th>
            <th>Tax Amount</th>
            <th>Total Price</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.repairdetails?.map((repair) => (
            <tr key={repair.id}>
              <td>{repair.invoice_number}</td>
              <td>{repair.metal_type}</td>
              <td>{repair.gross_weight}</td>
              <td>{repair.making_charges}</td>
              <td>{repair.tax_amt}</td>
              <td>{repair.total_price}</td>
              <td>{repair.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccountDetailsTable;
