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

function App() {
  const location = useLocation();

  // Check if the current route is login or signup
  const isAuthPage = location.pathname === "/" || location.pathname === "/";

  const isStockModule = location.pathname === "/stock-dashboard" || 
                        location.pathname === "/assign-to-salesman" || 
                        location.pathname === "/receive-from-salesman" ||
                        location.pathname === "/add-assign-salesmantransfer" ||
                        location.pathname === "/add-receive-from-salesman" ||
                        location.pathname === "/return-to-main-stock" ||
                        location.pathname === "/add-return-to-main-stock";

  return (
    <>
      <AuthProvider>
        {/* {!isAuthPage && <Navbar />} */}

        {!isAuthPage && !isStockModule && <Navbar />}
        {!isAuthPage && isStockModule && <StockNavbar />}
        
        <Routes>
          <Route path="/" exact element={<Login />} />
           <Route path="/ledger" exact element={<Ledger />} />
          <Route path="/dashboard" exact element={<Dashboard />} />
          <Route path="/stock-dashboard" exact element={<StockPointDashboard />} />
          <Route path="/itemmaster" exact element={<ItemMaster />} />
          <Route path="/repairs" element={<Repairs />} />
          <Route path="/repairs/:id" element={<Repairs />} />
          <Route path="/repairsview/:id" element={<RepairsView />} />
          <Route path="/repairstable" element={<RepairsTable />} />
          <Route path="/urd_purchase" element={<URDPurchase />} />
          <Route path="/itemmastertable" element={<ItemMasterTable />} />
          <Route path="/estimates/" element={<Estimate />} />
          <Route path="/estimatetable" element={<EstimateTable />} />
          <Route path="/suppliertable" element={<Supplier_Table />} />
          <Route path="/customerstable" element={<Customers_Table />} />
          <Route path="/customermaster" element={<Customer_Master />} />
          <Route path="/customermaster/:id" element={<Customer_Master />} />
          <Route path="/suppliermaster" element={<Supplier_Master />} />
          <Route path="/suppliermaster/:id" element={<Supplier_Master />} />
          <Route path="/workermaster" element={<Worker_Master />} />
          <Route path="/workermaster/:id" element={<Worker_Master />} />
          <Route path="/workerstable" element={<Worker_Table />} />
          <Route path="/stockEntry" element={<StockEntry />} />
          <Route path="/stockEntryTable" element={<StockEntryTable />} />
          <Route path="/estimates/:product_id" element={<Estimate />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/purchasetable" element={<PurchaseTable />} />
          <Route path="/purchasetableold" element={<PurchaseTable1 />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/receipts/:id" element={<Receipts />} />
          <Route path="/orderreceipts" element={<OrderReceipts />} />
          <Route path="/orderreceipts/:id" element={<OrderReceipts />} />
          <Route path="/receiptstable" element={<ReceiptsTable />} />
          <Route path="/purchaseReport" element={<PurchaseReport />} />
          <Route path="/purchaseBalanceReport" element={<PurchaseBalanceReport />} />
          <Route path="/salesReport" element={<SalesReport />} />
          <Route path="/salesBalanceReport" element={<SalesBalanceReport />} />
          <Route path="/estimateReport" element={<EstimateReport />} />
          <Route path="/repairsReport" element={<RepairsReport />} />
          <Route path="/urdPurchaseReport" element={<URDPurchaseReport />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/payments/:id" element={<Payments />} />
          <Route path="/paymentstable" element={<PaymentsTable />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/accounts/:id" element={<Accounts />} />
          <Route path="/accountstable" element={<AccountsTable />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales2" element={<Sales />} />
          <Route path="/metaltype" element={<MetalType />} />
          <Route path="/purity" element={<Purity />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="/ratesdata" element={<RatesData />} />
          <Route path="/company_info" element={<Company_Info />} />
          <Route path="/designmaster" element={<DesignMaster />} />
          {/* <Route path="/suppliereditform/:id" element={<SupplierEditForm />}/> */}
          <Route path="/salestable" element={<SalesTable />} />
          <Route path="/urdpurchasetable" element={<URDPurchasetable />} />
          <Route path="/puritytable" element={<PurityTable />} />
          <Route path="/orderstable" element={<OrdersTable />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/barcodeprinting" element={<BarCodePrinting />} />
          <Route path="/sales/details/:invoice_number" element={<RepairDetails />} />

          <Route path="/salesNew" element = {<SalesNew />} />
          <Route path="/salesreturn" element={<SalesReturn />} />
          <Route path="/estimatereceipt" element={<EstimateReceipt />} />

          <Route path="/accountdetails" element={<AccountDetails />} />
          <Route path="/receivables" element={<Receivables />} />
          <Route path="/usermaster" element={<UserMaster />} />
          <Route path="/usertable" element={<UserMasterTable />} />
          <Route path="/usermaster/:id" element={<UserMaster />} />
          <Route path="/subcategory" element={<SubCategory />} />
          <Route path="/subcategorytable" element={<SubCategoryTable />} />
          <Route path="/festoffers" element={<Festoffers />} />
          <Route path="/festofferstable" element={<Festofferstable />} />
          <Route path="/subcategory/:id" element={<SubCategory />} />
          <Route path="/estimateSales" element={<EstimateSales />} />
          <Route path="/qrcode" element={<QRScanner />} />
          <Route path="/purchase-payment" element={<PurchasePayment />} />
          <Route path="/ratecuts" element={<RateCuts />} />
          <Route path="/itemsales" element={<ItemSales />} />
          <Route path="/stockReport" element={<StockReport />} /> 

           <Route path="/salesratecut" element={<SalesRateCut />} />

              <Route path="/stockpoints" element={<StockPoints />} /> 
             
              <Route path="/stock-transfer" element={<StockTransferTable />} />
              <Route path="/add-stocktransfer" element={<StockTransferForm />} />


               <Route path="/assign-to-salesman" element={<AssignSalesmanTable />} />
              <Route path="/add-assign-salesmantransfer" element={<AssignSalesmanForm />} />


               <Route path="/receive-from-salesman" element={<ReceivedSalesmanTable />} />
              <Route path="/add-receive-from-salesman" element={<ReceivedSalesmanForm />} />


                 <Route path="/return-to-main-stock" element={<ReturnMainStockTable />} />
              <Route path="/add-return-to-main-stock" element={<ReturnMainStockForm />} />










        </Routes>
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
