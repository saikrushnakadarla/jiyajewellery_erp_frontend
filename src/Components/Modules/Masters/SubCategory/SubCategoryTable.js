import React, { useEffect, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import DataTable from "../../../Pages/InputField/TableLayout"; // Import the reusable DataTable component
import { Button, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2"; // Import SweetAlert2
import { FaEdit, FaTrash } from "react-icons/fa";
import baseURL from '../../../../Url/NodeBaseURL';

const SubCategoryTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // State to store table data
  const [loading, setLoading] = useState(true); // State for loading indicator

  // Table columns configuration
  const columns = React.useMemo(
    () => [
      {
        Header: "Sr. No.",
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: "Metal Type",
        accessor: "metal_type",
      },
      {
        Header: "Category",
        accessor: "category",
      },
      {
        Header: "Sub Category",
        accessor: "sub_category_name", 
      },
      {
        Header: "Prefix",
        accessor: "prefix", 
      },
      {
        Header: "Purity",
        accessor: "purity", 
      },
      {
        Header: "Selling Purity",
        accessor: "selling_purity", 
      },
      {
        Header: "Printing Purity",
        accessor: "printing_purity", 
      },
      {
        Header: "Actions",
        Cell: ({ row }) => {
          const handleDelete = async (subcategory_id) => {
            try {
              // Confirm the deletion using SweetAlert2
              const result = await Swal.fire({
                title: "Are you sure?",
                text: "Do you want to delete this subcategory!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, cancel!",
              });

              if (result.isConfirmed) {
                // Send DELETE request to the server
                const response = await fetch(`${baseURL}/subcategory/${subcategory_id}`, {
                  method: "DELETE", // HTTP DELETE method
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ subcategory_id }), // Send subcategory_id in the body
                });

                if (!response.ok) {
                  throw new Error("Failed to delete subcategory");
                }

                // Show success message
                Swal.fire("Deleted!", "Your subcategory has been deleted.", "success");

                // Remove deleted item from state
                setData(data.filter(item => item.subcategory_id !== subcategory_id));
              }
            } catch (error) {
              console.error("Error deleting subcategory:", error);
              Swal.fire("Error", "Failed to delete the subcategory.", "error");
            }
          };

          return (
            <div>
               <FaEdit
                style={{ cursor: "pointer", color: "blue", marginRight: "10px" }}
                onClick={() => handleEdit(row.original.subcategory_id)} // Navigate to edit page
              />
              <FaTrash
                style={{ cursor: "pointer", color: "red" }}
                onClick={() => handleDelete(row.original.subcategory_id)} // Call handleDelete function
              />
            </div>
          );
        },
      },
    ],
    [data] // Add 'data' to dependencies to ensure the data is updated after deletion
  );

  // Navigate to the edit page with the selected subcategory ID
  const handleEdit = (subcategory_id) => {
    const userLocation = "User's Location"; // Replace this with actual logic to fetch the user's location
    navigate(`/subcategory/${subcategory_id}`, { state: { subcategory_id, location: userLocation } });
  };

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/subcategory`); // Use the correct API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        console.log("API Response:", result);
  
        // Ensure the data is an array and sort it by `created_at` in descending order
        let sortedData = [];
        if (Array.isArray(result)) {
          sortedData = result.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
        } else if (result && Array.isArray(result.data)) {
          sortedData = result.data.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
        } else {
          throw new Error("Unexpected API response format");
        }
  
        setData(sortedData); 
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to load data from the server.", "error");
      } finally {
        setLoading(false); 
      }
    };
  
    fetchData();
  }, []);

  // Navigate to create subcategory page
  const handleCreate = () => {
    navigate("/subcategory");
  };

  return (
    <div className="main-container">
      <div className="customers-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Sub Category</h3>
            <Button
              className="create_but"
              onClick={handleCreate}
              style={{ backgroundColor: "#a36e29", borderColor: "#a36e29" }}
            >
              + Create
            </Button>
          </Col>
        </Row>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <DataTable columns={columns} data={[...data].reverse()} /> // Render DataTable with columns and data
        )}
      </div>
    </div>
  );
};

export default SubCategoryTable;
