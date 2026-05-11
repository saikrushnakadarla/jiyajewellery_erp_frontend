import React, { useEffect, useState } from "react";
import axios from "axios";
import baseURL from '../../../Url/NodeBaseURL';

const OrdersData = ({ selectedCustomerMobile }) => {
  const [orderCounts, setOrderCounts] = useState({
    totalOrderCount: 0,
    todaysOrderCount: 0,
    monthOrderCount: 0,
  });

  const fetchOrderData = async () => {
    try {
      const response = await axios.get(`${baseURL}/get/repair-details`);
      const data = response.data;

      // Filter for all orders or specific customer orders
      const filteredOrders = selectedCustomerMobile
        ? data.filter(
            (item) =>
              item.transaction_status === "Orders" &&
              item.mobile === selectedCustomerMobile
          )
        : data.filter((item) => item.transaction_status === "Orders");

      const today = new Date();
      const counts = filteredOrders.reduce(
        (acc, order) => {
          const orderDate = new Date(order.date);

          acc.totalOrderCount += 1;

          if (
            orderDate.getDate() === today.getDate() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear()
          ) {
            acc.todaysOrderCount += 1;
          }

          if (
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear()
          ) {
            acc.monthOrderCount += 1;
          }

          return acc;
        },
        { totalOrderCount: 0, todaysOrderCount: 0, monthOrderCount: 0 }
      );

      setOrderCounts(counts);
    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [selectedCustomerMobile]);

  return (
    <div>
      <h3>Orders</h3>
      {/* <p>Total: {orderCounts.totalOrderCount }</p> */}
      <p>Today: {orderCounts.todaysOrderCount }</p>
      <p>Month: {orderCounts.monthOrderCount }</p>
    </div>
  );
};

export default OrdersData;
