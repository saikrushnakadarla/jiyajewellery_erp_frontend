import React, { useState, useEffect } from "react";
import axios from "axios";
import baseURL from '../../../Url/NodeBaseURL';

const URDPurchases = ({ selectedCustomerMobile }) => {
  const [purchaseCounts, setPurchaseCounts] = useState({
    total: 0,
    today: 0,
    thisMonth: 0,
  });

  const fetchPurchases = async () => {
    try {
      const response = await axios.get(`${baseURL}/get-purchases`);
      const data = response.data;
      
      const filteredPurchases = selectedCustomerMobile
        ? data.filter((purchase) => purchase.mobile === selectedCustomerMobile)
        : data;

      const todayDate = new Date().toISOString().slice(0, 10);
      const todayCount = filteredPurchases.filter(
        (purchase) => purchase.date.slice(0, 10) === todayDate
      ).length;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthCount = filteredPurchases.filter((purchase) => {
        const purchaseDate = new Date(purchase.date);
        return (
          purchaseDate.getMonth() === currentMonth &&
          purchaseDate.getFullYear() === currentYear
        );
      }).length;

      setPurchaseCounts({
        total: filteredPurchases.length,
        today: todayCount,
        thisMonth: monthCount,
      });
    } catch (error) {
      console.error("Error fetching URD purchases:", error);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [selectedCustomerMobile]);

  return (
    <div>
      <h3>URD Purchases</h3>
      {/* <p>Total URD Purchases: {purchaseCounts.total }</p> */}
      <p>Today: {purchaseCounts.today }</p>
      <p>Month: {purchaseCounts.thisMonth }</p>
    </div>
  );
};

export default URDPurchases;
