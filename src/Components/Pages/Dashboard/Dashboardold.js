
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Repairs from './Repairs';
import Sales from './Sales';
import Orders from './Orders';
import Purchases from './Purchases';
import URDPurchase from './URDPurchase';
import Customers from './Customers';
import Suppliers from './Suppliers'
import CustomerDashboard from './CustomerDashboard';
import Receivables from './Receivables';
import Payables from './Payables';
import Estimate from './Estimate';
import AmountBilledToday from './AmountBilledToday';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { AuthContext } from "../Login/Context";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function Dashboard() {
  const { authToken, userId, userName } = useContext(AuthContext);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedMobile, setSelectedMobile] = useState(null);
  const navigate = useNavigate();

  const barData = {
    labels: ['Sales', 'Repairs', 'Orders'],
    datasets: [
      {
        label: 'Amount',
        data: [3000, 2500, 2000],
        backgroundColor: ['#cd853f', '#8b4513', '#ffa500'],
      },
    ],
  };

  const pieDataReceivablesPayables = {
    labels: ['Receivables', 'Payables'],
    datasets: [
      {
        data: [60, 40],
        backgroundColor: ['#cd853f', '#8b4513'],
      },
    ],
  };

  // const lineDataRevenue = {
  //   labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  //   datasets: [
  //     {
  //       label: 'Revenue',
  //       data: [10000, 15000, 12000, 20000],
  //       borderColor: '#cd853f',
  //       borderWidth: 2,
  //       fill: false,
  //     },
  //   ],
  // };

  const pieDataOrderStatus = {
    labels: ['Completed', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [50, 30, 20],
        backgroundColor: ['#cd853f', '#8b4513', '#ffa500'],
      },
    ],
  };

  const handleNewSalesTab = () => {
    const newTabId = crypto.randomUUID();
    const url = selectedMobile 
      ? `/sales?tabId=${newTabId}&mobile=${selectedMobile}`
      : `/sales?tabId=${newTabId}`;
    
    window.open(url, "_blank");
  };


  return (
    <div className="main-container" style={{ backgroundColor: '#b7721834' }}>
      <div className="dashboard-header">
        <h2 style={{ marginTop: "25px", marginLeft: "15px" }}>Dashboard</h2>
        <CustomerDashboard onSelectCustomer={setSelectedMobile} />
      </div>
      <div className="dashboard-container">
        <div className="row-cards" >
          <div className="metric-card">
            <Estimate selectedCustomerMobile={selectedMobile} />
            <a style={{ marginRight: '100px' }}
              href="#"
              className="btn-link"
              onClick={(e) => {
                e.preventDefault();
                console.log("Selected Customer Mobile:", selectedMobile);
                navigate("/estimatetable", { state: { mobile: selectedMobile } });
              }}
            >
              Details
            </a>
            <a
              href="#"
              className="btn-link"
              onClick={(e) => {
                e.preventDefault();
                navigate('/estimates', { state: { mobile: selectedMobile } });
              }}
            >
              New
            </a>
          </div>
          <div className="metric-card">
            <Sales selectedCustomerMobile={selectedMobile} />
            <a style={{ marginRight: '100px' }}
              href="#"
              className="btn-link"
              onClick={(e) => {
                e.preventDefault();
                console.log("Selected Customer Mobile:", selectedMobile);
                navigate("/salestable", { state: { mobile: selectedMobile } });
              }}
            >
              Details
            </a>
            {/* <a

              href="#"
              className="btn-link"
              onClick={(e) => {
                e.preventDefault();
                navigate("/sales", { state: { mobile: selectedMobile } });
              }}
            >
              New
            </a> */}
            <a
          href="#"
          className="btn-link"
          onClick={(e) => {
            e.preventDefault();
            handleNewSalesTab();
          }}
        >
          New
        </a>
          </div>
          <div className="metric-card">
            <Purchases selectedCustomerMobile={selectedMobile} />
            <a style={{ marginRight: '100px' }}
              href="#"
              className="btn-link"
              onClick={(e) => {
                e.preventDefault();
                console.log("Selected Customer Mobile:", selectedMobile);
                navigate("/purchasetable", { state: { mobile: selectedMobile } });
              }}
            >
              Details
            </a>
            <a
              href="#"
              className="btn-link"
              onClick={(e) => {
                e.preventDefault();
                navigate('/purchase', { state: { mobile: selectedMobile } });
              }}
            >
              New
            </a>
          </div>
          <div className="metric-card">
            <Customers selectedCustomerMobile={selectedMobile} />
          </div>
          <div className="metric-card">
            <Suppliers selectedCustomerMobile={selectedMobile} />
          </div>
        </div>
        <div className="row-cards" style={{ marginTop: '15px' }}>
          <div className="metric-card" >
            <Repairs selectedCustomerMobile={selectedMobile} />
            <a style={{ marginRight: '100px' }}
              href="#"
              className="btn-link"
              onClick={(e) => {
                e.preventDefault();
                console.log("Selected Customer Mobile:", selectedMobile);
                navigate("/repairstable", { state: { mobile: selectedMobile } });
              }}
            >
              Details
            </a>
            <a

              href="#"
              className="btn-link"
              onClick={(e) => {
                e.preventDefault();
                navigate('/repairs', { state: { mobile: selectedMobile } });
              }}
            >
              New
            </a>
          </div>
          <div className="metric-card">
            <Orders selectedCustomerMobile={selectedMobile} />
            <a style={{ marginRight: '100px' }}
              href="#"
              className="btn-link"
              onClick={(e) => {
                e.preventDefault();
                console.log("Selected Customer Mobile:", selectedMobile);
                navigate("/orderstable", { state: { mobile: selectedMobile } });
              }}
            >
              Details
            </a>
            <a
              href="#"
              className="btn-link"
              onClick={(e) => {
                e.preventDefault();
                console.log("Selected Customer Mobile:", selectedMobile);
                navigate('/orders', { state: { mobile: selectedMobile } });
              }}
            >
              New
            </a>
          </div>
          <div className="metric-card">
            <URDPurchase selectedCustomerMobile={selectedMobile} />
            <a style={{ marginRight: '100px' }}
              href="#"
              className="btn-link"
              onClick={(e) => {
                e.preventDefault();
                console.log("Selected Customer Mobile:", selectedMobile);
                navigate("/urdpurchasetable", { state: { mobile: selectedMobile } });
              }}
            >
              Details
            </a>
            <a
              href="#"
              className="btn-link"
              onClick={(e) => {
                e.preventDefault();
                navigate('/urd_purchase', { state: { mobile: selectedMobile } });
              }}
            >
              New
            </a>
          </div>
          <div className="metric-card">
            <Receivables selectedCustomerMobile={selectedMobile} />
          </div>
          <div className="metric-card">
            <Payables selectedCustomerMobile={selectedMobile} />
          </div>
        </div>
        <div className="row-cards" style={{ marginTop: '15px', marginBottom: '15px' }}>
          <div className="metric-card">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <div className="metric-card">
            <Pie data={pieDataReceivablesPayables} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          {/* <div className="metric-card">
            <Line data={lineDataRevenue} options={{ responsive: true, maintainAspectRatio: false }} />
          </div> */}
          <div className="metric-card">
            <Pie data={pieDataOrderStatus} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;