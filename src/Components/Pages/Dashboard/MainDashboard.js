import React, { useContext } from 'react';
import { AuthContext } from "../Login/Context";
import AdminDashboard from './Dashboard';
import StockPointDashboard from '../StockPointsDashboard/StockPointsDashboard';

function Dashboard() {
  const { userType } = useContext(AuthContext);
  
  // Check user type and render appropriate dashboard
  if (userType === 'stock_point') {
    return <StockPointDashboard />;
  }
  
  // Default to admin dashboard
  return <AdminDashboard />;
}

export default Dashboard;