import React, { useState, useEffect } from "react";
import axios from "axios";
import baseURL from "../../../Url/NodeBaseURL";

function Repairs({ selectedCustomerMobile }) {
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    assignToWorkshop: 0,
    receiveFromWorkshop: 0,
    deliverToCustomer: 0,
  });

  const fetchRepairs = async () => {
    try {
      const response = await axios.get(`${baseURL}/get/repairs`);
      const data = response.data;

      // Filter repairs by customer if `selectedCustomerId` is provided
      const filteredRepairs = selectedCustomerMobile
        ? data.filter((repair) => repair.mobile === selectedCustomerMobile)
        : data;

      // Calculate counts for each status
      const counts = filteredRepairs.reduce(
        (acc, repair) => {
          if (repair.status === "Pending") acc.pending += 1;
          if (repair.status === "Assign To Workshop") acc.assignToWorkshop += 1;
          if (repair.status === "Receive from Workshop") acc.receiveFromWorkshop += 1;
          if (repair.status === "Delivery to Customer") acc.deliverToCustomer += 1;
          return acc;
        },
        { pending: 0, assignToWorkshop: 0, receiveFromWorkshop: 0, deliverToCustomer: 0 }
      );

      setStatusCounts(counts);
    } catch (error) {
      console.error("Error fetching repairs:", error);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, [selectedCustomerMobile]);

  return (
    <div>
      <h3>Repairs</h3>
      {/* <p>Pending: {statusCounts.pending }</p> */}
      <p>Assign to Workshop: {statusCounts.assignToWorkshop }</p>
      <p>Receive from Workshop: {statusCounts.receiveFromWorkshop }</p>
      {/* <p>Delivery to Customer: {statusCounts.deliverToCustomer }</p> */}
    </div>
  );
}

export default Repairs;
