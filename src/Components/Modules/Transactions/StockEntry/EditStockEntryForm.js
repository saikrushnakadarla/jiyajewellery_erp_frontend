// import React, { useState } from 'react';
// // import './EditStockEntryForm.css';
// import baseURL from "../../../../Url/NodeBaseURL";

// const EditStockEntryForm = ({ editableData, onClose, onUpdate }) => {
//   const [formData, setFormData] = useState(editableData);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     fetch(`${baseURL}/update/opening-tags-entry/${formData.opentag_id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(formData),
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error('Failed to update the record');
//         }
//         return response.json();
//       })
//       .then((updatedData) => {
//         onUpdate(updatedData); // Update the parent state
//         alert('Record updated successfully!');
//       })
//       .catch((error) => {
//         console.error('Error updating record:', error);
//       });
//   };

//   return (
//     <div className="edit-stock-entry-form">
//       <form className="p-4 border rounded" onSubmit={handleSubmit}>
//         <h4>Edit Stock Entry</h4>
//         <div className="row g-3">
//           <div className="col-md-4">
//             <label>Pricing</label>
//             <input
//               type="text"
//               name="Pricing"
//               value={formData.Pricing}
//               onChange={handleChange}
//               className="form-control"
//             />
//           </div>
//           {/* Add more input fields as needed */}
//         </div>
//         <button type="submit" className="btn btn-primary mt-3">
//           Update
//         </button>
//         <button type="button" className="btn btn-secondary mt-3 ms-2" onClick={onClose}>
//           Cancel
//         </button>
//       </form>
//     </div>
//   );
// };

// export default EditStockEntryForm;
