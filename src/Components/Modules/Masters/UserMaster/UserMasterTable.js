import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../../Pages/InputField/TableLayout"; // Import the reusable DataTable component
import { FaEdit, FaTrash } from "react-icons/fa"; // Import the delete icon
import { Button, Row, Col } from "react-bootstrap";
import baseURL from "../../../../Url/NodeBaseURL"; // Ensure you have the correct base URL for your API
import Swal from "sweetalert2"; // Import SweetAlert2
const UserMasterTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // State to store table data
  const [loading, setLoading] = useState(true); // State for loading indicator

  const columns = React.useMemo(
    () => [
      {
        Header: "Sr. No.",
        Cell: ({ row }) => row.index + 1, // Generate a sequential number based on the row index
      },
      {
        Header: "User Name",
        accessor: "user_name",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Phone Number",
        accessor: "phone_number",
      },
      {
        Header: "User Type",
        accessor: "role", // Assuming role corresponds to the "User Type"
      },
      {
        Header: "Password",
        accessor: "password", // Assuming role corresponds to the "User Type"
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <>
            <FaEdit
              style={{ cursor: "pointer", color: "blue", marginRight: "10px" }}
              onClick={() => handleEdit(row.original.id)}
            />
            <FaTrash
              style={{ cursor: "pointer", color: "red" }}
              onClick={() => handleDelete(row.original.id)}
            />
          </>
        ),
      },
    ],
    []
  );

  // Fetch the data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/users`);
        const result = await response.json();
        setData(result); // Assuming the response is an array of users
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (id) => {
    navigate(`/usermaster/${id}`);
  };

  const handleCreate = () => {
    navigate("/usermaster");
  };

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        const response = await fetch(`${baseURL}/users/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setData((prevData) => prevData.filter((user) => user.id !== id));
          Swal.fire("Deleted!", "User deleted successfully!", "success");
        } else {
          Swal.fire("Error", "Error deleting user.", "error");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire("Error", "Error deleting user.", "error");
      }
    }
  };

  return (
    <div className="main-container">
      <div className="customers-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Users</h3>
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
          <DataTable columns={columns} data={[...data].reverse()} />
        )}
      </div>
    </div>
  );
};

export default UserMasterTable;
