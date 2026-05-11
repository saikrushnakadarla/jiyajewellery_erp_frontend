import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../../Pages/InputField/TableLayout";
import { Button, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import baseURL from "../../../../Url/NodeBaseURL";

const FestOffersTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/offers`);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching offers:", error);
      setLoading(false);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Sr. No.",
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: "Offer Name",
        accessor: "offer_name",
      },
      {
        Header: "Discount On Rate",
        accessor: "discount_on_rate",
      },
      {
        Header: "Discount % on MC",
        accessor: "discount_percentage",
      },
      {
        Header: "Discount % for Fixed",
        accessor: "discount_percent_fixed",
      },
      {
        Header: "Valid From",
        accessor: "valid_from",
        Cell: ({ value }) => {
          const date = new Date(value);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        },
      },
      {
        Header: "Valid To",
        accessor: "valid_to",
        Cell: ({ value }) => {
          const date = new Date(value);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        },
      },
      {
        Header: "Fest Offers Status",
        accessor: "offer_status",
      },
      {
        Header: "Actions",
        Cell: ({ row }) => {
          const offer = row.original;

          const handleToggleStatus = async () => {
            try {
              const newStatus = offer.offer_status === "Applied" ? "Unapplied" : "Applied";
              
              // Use the new status-specific API endpoint
              await axios.put(`${baseURL}/api/offers/${offer.offer_id}/status`, {
                offer_status: newStatus
              });
              
              // Update local state
              setData(prevData => 
                prevData.map(item => 
                  item.offer_id === offer.offer_id 
                    ? {...item, offer_status: newStatus} 
                    : item
                )
              );
              
              Swal.fire(
                "Success!",
                `Offer status changed to ${newStatus}`,
                "success"
              );
            } catch (error) {
              console.error("Error updating offer status:", error);
              Swal.fire("Error!", "Failed to update offer status", "error");
            }
          };

          return (
            <div>
              <FaEdit
                style={{ cursor: "pointer", color: "blue", marginRight: "10px" }}
                onClick={() => handleEdit(offer.offer_id)}
              />
              {/* <FaTrash
                style={{ cursor: "pointer", color: "red", marginRight: "10px" }}
                onClick={() => handleDelete(offer)}
              /> */}
              <Button
                variant={offer.offer_status === "Applied" ? "danger" : "success"}
                size="sm"
                onClick={handleToggleStatus}
                style={{               
                  fontSize: '0.875rem', 
                  padding: '0.25rem 0.5rem', 
                }}
              >
                {offer.offer_status === "Applied" ? "Unapply" : "Apply"}
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  const handleEdit = async (id) => {
    try {
      const res = await axios.get(`${baseURL}/api/offers/${id}`);
      const offerData = res.data;

      navigate("/festoffers", {
        state: {
          offer_id: id,
          location: offerData,
        },
      });
    } catch (err) {
      console.error("Error fetching offer by ID:", err);
      Swal.fire("Error", "Failed to fetch offer data for editing", "error");
    }
  };

  const handleDelete = async (offer) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this offer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${baseURL}/api/offers/${offer.offer_id}`, {
          data: offer,
        });

        // Update state to remove the deleted offer
        setData((prev) => prev.filter((item) => item.offer_id !== offer.offer_id));
        Swal.fire("Deleted!", "The offer has been deleted.", "success");
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("Error!", "Failed to delete offer.", "error");
      }
    }
  };

  const handleCreate = () => {
    navigate("/festoffers");
  };

  return (
    <div className="main-container">
      <div className="customers-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Fest Offers</h3>
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

export default FestOffersTable;