// import React from "react";
// import InputField from "../../Masters/ItemMaster/Inputfield";
// import DataTable from "../../../Pages/InputField/TableLayout"; // Adjust the path as needed
// import { FaEdit, FaTrash } from "react-icons/fa";

// const StoneDetailsForm = () => {
//   // Define columns for the DataTable
//   const columns = React.useMemo(
//     () => [
//       { Header: "P Code", accessor: "pCode" },
//       { Header: "Product Name", accessor: "productName" },
//       { Header: "Stone Name", accessor: "stoneName" },
//       { Header: "Weight", accessor: "weight" },
//       { Header: "Rate/Gram", accessor: "ratePerGram" },
//       { Header: "Total Weight", accessor: "totalWeight" },
//       { Header: "Total Price", accessor: "totalPrice" },
//       {
//         Header: "Actions",
//         accessor: "actions",
//         Cell: ({ row }) => (
//           <>
//            <button
//             className="btn btn-primary btn-sm me-2"
//             onClick={() => handleEdit(row.original)}
//           >
//             <FaEdit />
//           </button>
//           <button
//             className="btn btn-danger btn-sm"
//             onClick={() => handleDelete(row.original.id)}
//           >
//             <FaTrash />
//           </button>
//           </>
//         ),
//       },
//     ],
//     []
//   );

//   // Define data for the DataTable
//   const data = React.useMemo(
//     () => [
//       {
//         id: 1,
//         pCode: "P001",
//         productName: "Product A",
//         stoneName: "Diamond",
//         weight: "5g",
//         ratePerGram: "$500",
//         totalWeight: "5g",
//         totalPrice: "$2500",
//       },
//       {
//         id: 2,
//         pCode: "P002",
//         productName: "Product B",
//         stoneName: "Ruby",
//         weight: "3g",
//         ratePerGram: "$300",
//         totalWeight: "3g",
//         totalPrice: "$900",
//       },
//     ],
//     []
//   );

//   // Edit and Delete handlers
//   const handleEdit = (rowData) => {
//     console.log("Edit:", rowData);
//   };

//   const handleDelete = (id) => {
//     console.log("Delete ID:", id);
//   };

//   return (
//     <div className="modal-body" style={{ backgroundColor: "rgba(163, 110, 41, 0.08)" }}>
//       <div className="row g-3">
//         {/* <div className="col-md-4">
//           <InputField label="P Code:" />
//         </div> */}
//         <div className="col-md-4">
//           <InputField label="Sub Product Name:" />
//         </div>
//         {/* <div className="col-md-4">
//           <InputField label="Stone Name:" />
//         </div> */}
//         <div className="col-md-4">
//           <InputField label="Weight:" />
//         </div>
//         <div className="col-md-4">
//           <InputField label="Rate per Gram:" />
//         </div>
//         <div className="col-md-4">
//           <InputField label="Amount:" />
//         </div>
//         {/* <div className="col-md-4">
//           <InputField label="Total Price:" />
//         </div> */}
//         <div className="col-md-4">
//           <button type="button" className="btn btn-primary">
//             add
//           </button>
//         </div>
//       </div>
//       {/* Table Section */}
//       <div className="mt-4">
//         <h6 className="fw-bold">Stone List</h6>
//         <DataTable columns={columns} data={data} />
//       </div>
//       <div className="col-md-4">
//           <InputField label="Total Weight:" />
//         </div>
//         <div className="col-md-4">
//           <InputField label="Total Amount:" />
//         </div>

        
//     </div>
//   );
// };

// export default StoneDetailsForm;
