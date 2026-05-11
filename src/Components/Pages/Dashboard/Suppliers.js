import React, { useState, useEffect } from "react";
import baseURL from "../../../Url/NodeBaseURL";

function Customers() {
  const [data, setData] = useState([]);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get/account-details`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();

        // Filter only customers and format dates
        const customers = result
          .filter((item) => item.account_group === 'SUPPLIERS')
          .map((item) => ({
            ...item,
            birthday: formatDate(item.birthday),
            anniversary: formatDate(item.anniversary),
          }));

        setData(customers);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
     <div>
     <h3>SUPPLIERS</h3>
     <p style={{fontSize:'25px', marginTop:'20px'}}>
       <strong>
       {data.length}
       </strong>
     </p>
   </div>
  );
}

export default Customers;
