// import React, { useEffect, useState } from "react";
// import { Col, Row } from "react-bootstrap";
// import InputField from "./InputfieldSales";
// import axios from "axios";
// import baseURL from "./../../../../Url/NodeBaseURL";

// const InvoiceDetails = ({ formData, setFormData }) => {

//   const [isLoading, setIsLoading] = useState(false);

//   const generateReceivedNumber = () => {
//     // This is now just a fallback, but we'll primarily use the API
//     const lastReceivedNumber = localStorage.getItem("lastReceivedNumber");
//     let lastNumber = 0;

//     if (lastReceivedNumber) {
//       const match = lastReceivedNumber.match(/RCN(\d+)/);
//       if (match) {
//         lastNumber = parseInt(match[1], 10);
//       }
//     }

//     const nextNumber = lastNumber + 1;
//     const newReceivedNumber = `RCN${String(nextNumber).padStart(3, "0")}`;
    
//     localStorage.setItem("lastReceivedNumber", newReceivedNumber);
//     console.log("Generated Received Number (fallback):", newReceivedNumber);
    
//     return newReceivedNumber;
//   };

//   // Fetch next received number from backend API
//   const fetchNextReceivedNumber = async () => {
//     setIsLoading(true);
//     try {
//       const response = await axios.get(`${baseURL}/api/received-salesman/lastReceivedNumber`);
//       const nextNumber = response.data.lastReceivedNumber;
//       console.log("Next Received Number from API:", nextNumber);
      
//       // Update localStorage for consistency
//       localStorage.setItem("lastReceivedNumber", nextNumber);
      
//       return nextNumber;
//     } catch (error) {
//       console.error("Error fetching next received number:", error);
//       // Fallback to localStorage method if API fails
//       const fallbackNumber = generateReceivedNumber();
//       console.log("Using fallback number:", fallbackNumber);
//       return fallbackNumber;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     const initializeReceivedNumber = async () => {
//       // Only set if not already set in formData
//       if (!formData.received_number) {
//         const nextNumber = await fetchNextReceivedNumber();
//         setFormData((prev) => ({
//           ...prev,
//           received_number: nextNumber,
//         }));
//       }
//     };

//     initializeReceivedNumber();
//   }, []); // Run only once on mount

//   // Set default date if not set
//   useEffect(() => {
//     if (!formData.date) {
//       setFormData((prev) => ({
//         ...prev,
//         date: new Date().toISOString().split("T")[0],
//       }));
//     }
//   }, []);

//   return (
//     <Col className="sales-form-section">
//       <Row>
//         <Col xs={12} md={12}>
//           <InputField
//             label="Date:"
//             name="date"
//             type="date"
//             value={formData.date || ""}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 date: e.target.value,
//               }))
//             }
//             max={new Date().toISOString().split("T")[0]}
//           />
//         </Col>
//       </Row>

//       <Row>
//         <Col xs={12}>
//           <InputField
//             label="Received Number"
//             name="received_number"
//             value={formData.received_number || (isLoading ? "Loading..." : "")}
//             placeholder="RCN001"
//             readOnly
//           />
//         </Col>
//       </Row>
//     </Col>
//   );
// };

// export default InvoiceDetails;