import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Repairs from "./Components/Modules/Transactions/Repairs/Repairs";
import RepairsView from "./Components/Modules/Transactions/Repairs/RepairsView";
import URDPurchase from "./Components/Modules/Transactions/URDPurchase/URDPurchase";
import ItemMaster from "./Components/Modules/Masters/ItemMaster/ItemMaster";
import Supplier_Table from './Components/Modules/Masters/Supplier/Supplier_Table';
import Customers_Table from './Components/Modules/Masters/Customer/Customers_Table';
import RepairsTable from './Components/Modules/Transactions/Repairs/RepairsTable';
import ItemMasterTable from './Components/Modules/Masters/ItemMaster/ItemMasterTable';
import Navbar from './Navbar/Navbar';
import StockNavbar from "./Navbar/StockNavbar";
import Dashboard from './Components/Pages/Dashboard/Dashboard';
import Estimate from './Components/Modules/Transactions/Estimate/EstimateForm';
import Customer_Master from './Components/Modules/Masters/Customer/Customer_Master';
import Supplier_Master from './Components/Modules/Masters/Supplier/Supplier_Master';
import StockEntry from './Components/Modules/Transactions/StockEntry/StockEntry';
import StockEntryTable from './Components/Modules/Transactions/StockEntry/StockEntryTable';
import EstimateTable from './Components/Modules/Transactions/Estimate/EstimateTable';
import Purchase from './Components/Modules/Transactions/Purchase/Purchase';
import PurchaseTable from './Components/Modules/Transactions/Purchase/PurchaseTable';
import PurchaseTable1 from './Components/Modules/Transactions/Purchase/PurchaseTable1';
import Receipts from './Components/Modules/Transactions/Receipts/Receipts';
import OrderReceipts from './Components/Modules/Transactions/Receipts/OrderReceipts';
import ReceiptsTable from './Components/Modules/Transactions/Receipts/ReceiptsTable';
import PurchaseReport from './Components/Modules/Reports/PurchaseReport/PurchaseReport'
import PurchaseBalanceReport from './Components/Modules/Reports/PurchaseBalanceReport/PurchaseBalanceReport'
import SalesReport from './Components/Modules/Reports/SalesReport/SalesReport'
import SalesBalanceReport from './Components/Modules/Reports/SalesBalanceReport/SalesBalanceReport'
import EstimateReport from './Components/Modules/Reports/EstimateReport/EstimateReport'
import RepairsReport from './Components/Modules/Reports/RepairsReport/RepairsReport'
import URDPurchaseReport from './Components/Modules/Reports/URDPurchaseReport/URDPurchase'
import Payments from './Components/Modules/Transactions/Payments/Payments';
// import PaymentsTable from './Components/Modules/Transactions/Payments/PaymentsTable';
import PaymentsTable from './Components/Modules/Transactions/Purchase/PurchasePaymentTable';
import Accounts from './Components/Modules/Masters/Accounts/Accounts';
import AccountsTable from './Components/Modules/Masters/Accounts/AccountsTable';
// import Sales from './Components/Modules/Transactions/Sales/SalesForm';
import Sales from './Components/Modules/Transactions/SalesForm/SalesForm';
import MetalType from './Components/Modules/Masters/MetalType/MetalType';
import DesignMaster from './Components/Modules/Masters/DesignMaster/DesignMaster';
import Purity from './Components/Modules/Masters/Purity/Purity';
import Rates from './Components/Modules/Masters/Rates/Rates';
import RatesData from './Components/Modules/Masters/RatesData/RatesData';
import Company_Info from './Components/Modules/Masters/CompanyInfo/CompanyInfo';
import SalesTable from './Components/Modules/Transactions/Sales/SalesTable';
import URDPurchasetable from './Components/Modules/Transactions/URDPurchase/URDPurchasetable';
import PurityTable from './Components/Modules/Masters/Purity/PurityTable';
import OrdersTable from './Components/Modules/Transactions/Orders/OrdersTable';
// import Orders from './Components/Modules/Transactions/Orders/Orders';
import Orders from './Components/Modules/Transactions/OrderSection/OrderForm';
import BarCodePrinting from './Components/Modules/Reports/BarcodePrinting/BarCodePrinting';
import SalesNew from './Components/Modules/Transactions/Sales/SalesNew';
import RepairDetails from "./Components/Modules/Transactions/Sales/SalesDetailsModules";
import Worker_Master from './Components/Modules/Masters/Worker/Worker';
import Worker_Table from './Components/Modules/Masters/Worker/WorkerTable';
import Login from './Components/Pages/Login/Login';
import SalesReturn from './Components/Modules/Transactions/SalesReturn/SalesForm';
import EstimateReceipt from './Components/Modules/Transactions/Estimate/EstimateReceipt';
import AccountDetails from './Components/Pages/Dashboard/AccountDetails';
import Receivables from "./Components/Pages/Dashboard/Payables";
import UserMaster from "./Components/Modules/Masters/UserMaster/UserMaster";
import UserMasterTable from "./Components/Modules/Masters/UserMaster/UserMasterTable";
import SubCategory from "./Components/Modules/Masters/SubCategory/SubCategory";
import SubCategoryTable from "./Components/Modules/Masters/SubCategory/SubCategoryTable";
import { AuthProvider } from "./Components/Pages/Login/Context";
import EstimateSales from './Components/Modules/Transactions/Sales/EstimateSales';
import QRScanner from "./Components/QRScanner ";
import RateCuts from './Components/Modules/Transactions/Purchase/RateCuts'
import PurchasePayment from './Components/Modules/Transactions/Purchase/PurchasePayment';
import Festoffers from './Components/Modules/Masters/FestivalOffers/FestOffers';
import Festofferstable from './Components/Modules/Masters/FestivalOffers/FestOffersTable';
import ItemSales from './Components/Modules/Reports/ItemSale/ItemSale';
import StockReport from "./Components/Modules/Reports/StockReport/StockReport";
import Ledger from "./Components/Modules/Transactions/Ledger/Ledger";
import SalesRateCut from "./Components/Modules/Transactions/Receipts/SalesRateCut";
import StockPoints from "./Components/Modules/Masters/Stockpoints/StockPoints";
import StockTransferTable from "./Components/Modules/Transactions/StockTransfer/StockTransferTable";
import StockTransferForm from "./Components/Modules/Transactions/StockTransfer/StockTransferForm"
import StockPointDashboard from "./Components/Pages/Dashboard/StockPointsDashboard";
import AssignSalesmanTable from "./Components/Modules/Transactions/AssignedSalesman/AssignedSalesManTable";
import AssignSalesmanForm from "./Components/Modules/Transactions/AssignedSalesman/AssignedSalesManForm";
import ReceivedSalesmanTable from "./Components/Modules/Transactions/ReceivedFromSalesman/ReceivedSalesmanTable";
import ReceivedSalesmanForm from "./Components/Modules/Transactions/ReceivedFromSalesman/ReceivedSalesmanForm"

import ReturnMainStockTable from "./Components/Modules/Transactions/ReturnMainStock/ReturnMainStockTable";
import ReturnMainStockForm from "./Components/Modules/Transactions/ReturnMainStock/ReturnMainStockForm";


import ReturnMainStockOldItemsTable from "./Components/Modules/Transactions/ReturnMainStockOldItems/ReturnMainStockOldItemsTable";
import ReturnMainStockOldItemsForm from "./Components/Modules/Transactions/ReturnMainStockOldItems/ReturnMainStockOldItemsForm";


import QRCodePrinting from "./Components/Modules/Masters/QRCodePrinting/QRCodePrinting";
import QRCodeNavbar from "./Navbar/QRCodeNavbar";
import StockInward from "./Components/Modules/Transactions/StockInward/StockInward"; // Adjust the import path
import Selections from "./Components/Modules/Transactions/Selections/Selections";
import VisitLogsWarehouseSchedule from './Components/Modules/Masters/VisitLogsWarehouse/VisitLogsWarehouseSchedule';
import VisitLogsSalesmanSchedule from "./Components/Modules/Transactions/VisitLogsSalesman/VisitLogsSalesman";
import WarehouseStockItems from './Components/Modules/Transactions/WarehouseStockItems/WarehouseStockItems';
import WarehouseRespectiveStock from "./Components/Modules/WarehouseRespectiveStock/WarehouseRespectiveStock";
import Footer from "./Footer/Footer"
import ReceivedStock from './Components/Modules/ReceivedStock/ReceivedStock';
import Warehousedaybook from "./Components/Modules/Warehousedaybook/Warehousedaybook";

import SalesmanTable from './Components/Modules/Masters/SalesManMaster/SalesmanTable';
import SalesmanMaster from './Components/Modules/Masters/SalesManMaster/SalesmanForm';
import ProtectedRoute from './Components/ProtectedRoute';



function App() {
  const location = useLocation();

  // Check if the current route is login or signup
  const isAuthPage = location.pathname === "/";

  const isStockModule = location.pathname === "/stock-dashboard" ||
    location.pathname === "/assign-to-salesman" ||
    location.pathname === "/receive-from-salesman" ||
    location.pathname === "/add-assign-salesmantransfer" ||
    location.pathname === "/add-receive-from-salesman" ||
    location.pathname === "/return-to-main-stock" ||
    location.pathname === "/add-return-to-main-stock" ||
    location.pathname === "/stock-inward" ||
     location.pathname === "/visit-logs-salesman-schedule" ||
     location.pathname === "/warehouse-stock-respective-items" ||
      location.pathname === "/day-book" ||
       location.pathname === "/return-to-main-stock-old-items" ||
    location.pathname === "/add-return-to-main-stock-old-items"


  const isERPModule = location.pathname === "/qrcodeprinting";

  return (
    <>
      <AuthProvider>
        
           {/* Show navbar only for protected routes and not on login page */}
        {!isAuthPage && (
          <>
            {!isStockModule && !isERPModule && <Navbar />}
            {isStockModule && <StockNavbar />}
            {isERPModule && <QRCodeNavbar />}
          </>
        )}

         <Routes>
          {/* Public Routes */}
          <Route path="/" exact element={<Login />} />
          
          {/* Protected Routes - Wrap with ProtectedRoute */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/ledger" element={
            <ProtectedRoute>
              <Ledger />
            </ProtectedRoute>
          } />
          
          <Route path="/stock-dashboard" element={
            <ProtectedRoute>
              <StockPointDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/itemmaster" element={
            <ProtectedRoute>
              <ItemMaster />
            </ProtectedRoute>
          } />
          
          <Route path="/repairs" element={
            <ProtectedRoute>
              <Repairs />
            </ProtectedRoute>
          } />
          
          <Route path="/repairs/:id" element={
            <ProtectedRoute>
              <Repairs />
            </ProtectedRoute>
          } />
          
          <Route path="/repairsview/:id" element={
            <ProtectedRoute>
              <RepairsView />
            </ProtectedRoute>
          } />
          
          <Route path="/repairstable" element={
            <ProtectedRoute>
              <RepairsTable />
            </ProtectedRoute>
          } />
          
          <Route path="/urd_purchase" element={
            <ProtectedRoute>
              <URDPurchase />
            </ProtectedRoute>
          } />
          
          <Route path="/itemmastertable" element={
            <ProtectedRoute>
              <ItemMasterTable />
            </ProtectedRoute>
          } />
          
          <Route path="/estimates/" element={
            <ProtectedRoute>
              <Estimate />
            </ProtectedRoute>
          } />
          
          <Route path="/estimatetable" element={
            <ProtectedRoute>
              <EstimateTable />
            </ProtectedRoute>
          } />
          
          <Route path="/suppliertable" element={
            <ProtectedRoute>
              <Supplier_Table />
            </ProtectedRoute>
          } />
          
          <Route path="/customerstable" element={
            <ProtectedRoute>
              <Customers_Table />
            </ProtectedRoute>
          } />
          
          <Route path="/customermaster" element={
            <ProtectedRoute>
              <Customer_Master />
            </ProtectedRoute>
          } />
          
          <Route path="/salesmantable" element={
            <ProtectedRoute>
              <SalesmanTable />
            </ProtectedRoute>
          } />
          
          <Route path="/salesmanmaster" element={
            <ProtectedRoute>
              <SalesmanMaster />
            </ProtectedRoute>
          } />
          
          <Route path="/salesmanmaster/:id" element={
            <ProtectedRoute>
              <SalesmanMaster />
            </ProtectedRoute>
          } />
          
          <Route path="/customermaster/:id" element={
            <ProtectedRoute>
              <Customer_Master />
            </ProtectedRoute>
          } />
          
          <Route path="/suppliermaster" element={
            <ProtectedRoute>
              <Supplier_Master />
            </ProtectedRoute>
          } />
          
          <Route path="/suppliermaster/:id" element={
            <ProtectedRoute>
              <Supplier_Master />
            </ProtectedRoute>
          } />
          
          <Route path="/workermaster" element={
            <ProtectedRoute>
              <Worker_Master />
            </ProtectedRoute>
          } />
          
          <Route path="/workermaster/:id" element={
            <ProtectedRoute>
              <Worker_Master />
            </ProtectedRoute>
          } />
          
          <Route path="/workerstable" element={
            <ProtectedRoute>
              <Worker_Table />
            </ProtectedRoute>
          } />
          
          <Route path="/stockEntry" element={
            <ProtectedRoute>
              <StockEntry />
            </ProtectedRoute>
          } />
          
          <Route path="/stockEntryTable" element={
            <ProtectedRoute>
              <StockEntryTable />
            </ProtectedRoute>
          } />
          
          <Route path="/estimates/:product_id" element={
            <ProtectedRoute>
              <Estimate />
            </ProtectedRoute>
          } />
          
          <Route path="/purchase" element={
            <ProtectedRoute>
              <Purchase />
            </ProtectedRoute>
          } />
          
          <Route path="/purchasetable" element={
            <ProtectedRoute>
              <PurchaseTable />
            </ProtectedRoute>
          } />
          
          <Route path="/purchasetableold" element={
            <ProtectedRoute>
              <PurchaseTable1 />
            </ProtectedRoute>
          } />
          
          <Route path="/receipts" element={
            <ProtectedRoute>
              <Receipts />
            </ProtectedRoute>
          } />
          
          <Route path="/receipts/:id" element={
            <ProtectedRoute>
              <Receipts />
            </ProtectedRoute>
          } />
          
          <Route path="/orderreceipts" element={
            <ProtectedRoute>
              <OrderReceipts />
            </ProtectedRoute>
          } />
          
          <Route path="/orderreceipts/:id" element={
            <ProtectedRoute>
              <OrderReceipts />
            </ProtectedRoute>
          } />
          
          <Route path="/receiptstable" element={
            <ProtectedRoute>
              <ReceiptsTable />
            </ProtectedRoute>
          } />
          
          <Route path="/purchaseReport" element={
            <ProtectedRoute>
              <PurchaseReport />
            </ProtectedRoute>
          } />
          
          <Route path="/purchaseBalanceReport" element={
            <ProtectedRoute>
              <PurchaseBalanceReport />
            </ProtectedRoute>
          } />
          
          <Route path="/salesReport" element={
            <ProtectedRoute>
              <SalesReport />
            </ProtectedRoute>
          } />
          
          <Route path="/salesBalanceReport" element={
            <ProtectedRoute>
              <SalesBalanceReport />
            </ProtectedRoute>
          } />
          
          <Route path="/estimateReport" element={
            <ProtectedRoute>
              <EstimateReport />
            </ProtectedRoute>
          } />
          
          <Route path="/repairsReport" element={
            <ProtectedRoute>
              <RepairsReport />
            </ProtectedRoute>
          } />
          
          <Route path="/urdPurchaseReport" element={
            <ProtectedRoute>
              <URDPurchaseReport />
            </ProtectedRoute>
          } />
          
          <Route path="/payments" element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          } />
          
          <Route path="/payments/:id" element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          } />
          
          <Route path="/paymentstable" element={
            <ProtectedRoute>
              <PaymentsTable />
            </ProtectedRoute>
          } />
          
          <Route path="/accounts" element={
            <ProtectedRoute>
              <Accounts />
            </ProtectedRoute>
          } />
          
          <Route path="/accounts/:id" element={
            <ProtectedRoute>
              <Accounts />
            </ProtectedRoute>
          } />
          
          <Route path="/accountstable" element={
            <ProtectedRoute>
              <AccountsTable />
            </ProtectedRoute>
          } />
          
          <Route path="/sales" element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          } />
          
          <Route path="/sales2" element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          } />
          
          <Route path="/metaltype" element={
            <ProtectedRoute>
              <MetalType />
            </ProtectedRoute>
          } />
          
          <Route path="/purity" element={
            <ProtectedRoute>
              <Purity />
            </ProtectedRoute>
          } />
          
          <Route path="/rates" element={
            <ProtectedRoute>
              <Rates />
            </ProtectedRoute>
          } />
          
          <Route path="/ratesdata" element={
            <ProtectedRoute>
              <RatesData />
            </ProtectedRoute>
          } />
          
          <Route path="/company_info" element={
            <ProtectedRoute>
              <Company_Info />
            </ProtectedRoute>
          } />
          
          <Route path="/designmaster" element={
            <ProtectedRoute>
              <DesignMaster />
            </ProtectedRoute>
          } />
          
          <Route path="/salestable" element={
            <ProtectedRoute>
              <SalesTable />
            </ProtectedRoute>
          } />
          
          <Route path="/urdpurchasetable" element={
            <ProtectedRoute>
              <URDPurchasetable />
            </ProtectedRoute>
          } />
          
          <Route path="/puritytable" element={
            <ProtectedRoute>
              <PurityTable />
            </ProtectedRoute>
          } />
          
          <Route path="/orderstable" element={
            <ProtectedRoute>
              <OrdersTable />
            </ProtectedRoute>
          } />
          
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          
          <Route path="/barcodeprinting" element={
            <ProtectedRoute>
              <BarCodePrinting />
            </ProtectedRoute>
          } />
          
          <Route path="/sales/details/:invoice_number" element={
            <ProtectedRoute>
              <RepairDetails />
            </ProtectedRoute>
          } />

          <Route path="/salesNew" element={
            <ProtectedRoute>
              <SalesNew />
            </ProtectedRoute>
          } />
          
          <Route path="/salesreturn" element={
            <ProtectedRoute>
              <SalesReturn />
            </ProtectedRoute>
          } />
          
          <Route path="/estimatereceipt" element={
            <ProtectedRoute>
              <EstimateReceipt />
            </ProtectedRoute>
          } />

          <Route path="/accountdetails" element={
            <ProtectedRoute>
              <AccountDetails />
            </ProtectedRoute>
          } />
          
          <Route path="/receivables" element={
            <ProtectedRoute>
              <Receivables />
            </ProtectedRoute>
          } />
          
          <Route path="/usermaster" element={
            <ProtectedRoute>
              <UserMaster />
            </ProtectedRoute>
          } />
          
          <Route path="/usertable" element={
            <ProtectedRoute>
              <UserMasterTable />
            </ProtectedRoute>
          } />
          
          <Route path="/usermaster/:id" element={
            <ProtectedRoute>
              <UserMaster />
            </ProtectedRoute>
          } />
          
          <Route path="/subcategory" element={
            <ProtectedRoute>
              <SubCategory />
            </ProtectedRoute>
          } />
          
          <Route path="/subcategorytable" element={
            <ProtectedRoute>
              <SubCategoryTable />
            </ProtectedRoute>
          } />
          
          <Route path="/festoffers" element={
            <ProtectedRoute>
              <Festoffers />
            </ProtectedRoute>
          } />
          
          <Route path="/festofferstable" element={
            <ProtectedRoute>
              <Festofferstable />
            </ProtectedRoute>
          } />
          
          <Route path="/subcategory/:id" element={
            <ProtectedRoute>
              <SubCategory />
            </ProtectedRoute>
          } />
          
          <Route path="/estimateSales" element={
            <ProtectedRoute>
              <EstimateSales />
            </ProtectedRoute>
          } />
          
          <Route path="/qrcode" element={
            <ProtectedRoute>
              <QRScanner />
            </ProtectedRoute>
          } />
          
          <Route path="/purchase-payment" element={
            <ProtectedRoute>
              <PurchasePayment />
            </ProtectedRoute>
          } />
          
          <Route path="/ratecuts" element={
            <ProtectedRoute>
              <RateCuts />
            </ProtectedRoute>
          } />
          
          <Route path="/itemsales" element={
            <ProtectedRoute>
              <ItemSales />
            </ProtectedRoute>
          } />
          
          <Route path="/stockReport" element={
            <ProtectedRoute>
              <StockReport />
            </ProtectedRoute>
          } />

          <Route path="/salesratecut" element={
            <ProtectedRoute>
              <SalesRateCut />
            </ProtectedRoute>
          } />

          <Route path="/stockpoints" element={
            <ProtectedRoute>
              <StockPoints />
            </ProtectedRoute>
          } />

          <Route path="/stock-transfer" element={
            <ProtectedRoute>
              <StockTransferTable />
            </ProtectedRoute>
          } />
          
          <Route path="/add-stocktransfer" element={
            <ProtectedRoute>
              <StockTransferForm />
            </ProtectedRoute>
          } />

          <Route path="/assign-to-salesman" element={
            <ProtectedRoute>
              <AssignSalesmanTable />
            </ProtectedRoute>
          } />
          
          <Route path="/add-assign-salesmantransfer" element={
            <ProtectedRoute>
              <AssignSalesmanForm />
            </ProtectedRoute>
          } />

          <Route path="/receive-from-salesman" element={
            <ProtectedRoute>
              <ReceivedSalesmanTable />
            </ProtectedRoute>
          } />
          
          <Route path="/add-receive-from-salesman" element={
            <ProtectedRoute>
              <ReceivedSalesmanForm />
            </ProtectedRoute>
          } />

          <Route path="/return-to-main-stock" element={
            <ProtectedRoute>
              <ReturnMainStockTable />
            </ProtectedRoute>
          } />
          
          <Route path="/add-return-to-main-stock" element={
            <ProtectedRoute>
              <ReturnMainStockForm />
            </ProtectedRoute>
          } />

          <Route path="/return-to-main-stock-old-items" element={
            <ProtectedRoute>
              <ReturnMainStockOldItemsTable />
            </ProtectedRoute>
          } />
          
          <Route path="/add-return-to-main-stock-old-items" element={
            <ProtectedRoute>
              <ReturnMainStockOldItemsForm />
            </ProtectedRoute>
          } />

          <Route path="/qrcodeprinting" element={
            <ProtectedRoute>
              <QRCodePrinting />
            </ProtectedRoute>
          } />

          <Route path="/stock-inward" element={
            <ProtectedRoute>
              <StockInward />
            </ProtectedRoute>
          } /> 
          
          <Route path="/selections" element={
            <ProtectedRoute>
              <Selections />
            </ProtectedRoute>
          } /> 
          
          <Route path="/visit-logs-warehouse-schedule" element={
            <ProtectedRoute>
              <VisitLogsWarehouseSchedule />
            </ProtectedRoute>
          } />

          <Route path="/visit-logs-salesman-schedule" element={
            <ProtectedRoute>
              <VisitLogsSalesmanSchedule />
            </ProtectedRoute>
          } />

          <Route path="/warehouse-stock-items" element={
            <ProtectedRoute>
              <WarehouseStockItems />
            </ProtectedRoute>
          } />

          <Route path="/warehouse-stock-respective-items" element={
            <ProtectedRoute>
              <WarehouseRespectiveStock />
            </ProtectedRoute>
          } />

          <Route path="/received-stock" element={
            <ProtectedRoute>
              <ReceivedStock />
            </ProtectedRoute>
          } /> 

          <Route path="/day-book" element={
            <ProtectedRoute>
              <Warehousedaybook />
            </ProtectedRoute>
          } /> 

        </Routes>
        
                {!isAuthPage && isStockModule &&   <Footer />}
      </AuthProvider>
    </>

  );
}

export default function MainApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
