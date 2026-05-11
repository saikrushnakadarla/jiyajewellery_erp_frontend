// import React, { useState, useEffect } from "react";
// import baseURL from "../../../Url/NodeBaseURL";
// import InputField from "../../Pages/InputField/InputField";

// function Customers({ onSelectCustomer }) {
//   const [customers, setCustomers] = useState([]);
//   const [formData, setFormData] = useState({ customer_id: "" });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`${baseURL}/get/account-details`);
//         if (!response.ok) {
//           throw new Error("Failed to fetch customers");
//         }
//         const result = await response.json();
//         const filteredCustomers = result.filter(
//           (item) => item.account_group === "CUSTOMERS"
//         );
//         setCustomers(filteredCustomers);
//       } catch (error) {
//         console.error("Error fetching customers:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleCustomerChange = (selectedCustomerId) => {
//     const selectedCustomer = customers.find(
//       (customer) => customer.account_id === selectedCustomerId
//     );
//     setFormData({ customer_id: selectedCustomerId });
//     onSelectCustomer(selectedCustomer?.mobile); // Pass selected mobile to parent
//   };

//   const selectedCustomer = customers.find(
//     (customer) => customer.account_id === formData.customer_id
//   );

//   return (
//     <div className="container mt-4">
//       <div className="row">
//         <div className="col-3" style={{ marginLeft: '-80px' }}>Dashboard</div>
//         <div className="col-3"></div>
//         <div className="col-3"></div>
//         <div className="col-3" style={{ marginLeft: '80px' }}>
//           <InputField
//             label="Mobile"
//             name="mobile"
//             type="select"
//             value={formData.customer_id || ""}
//             onChange={(e) => handleCustomerChange(e.target.value)}
//             options={customers.map((customer) => ({
//               value: customer.account_id,
//               label: customer.mobile,
//             }))}
//           />
//         </div>
//       </div>
//     </div>

//   );
// }

// export default Customers;


import React, { useState, useEffect, useRef } from "react";
import baseURL from "../../../Url/NodeBaseURL";

function Customers({ onSelectCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get/account-details`);
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        const result = await response.json();
        const filteredCustomers = result.filter(
          (item) => item.account_group === "CUSTOMERS" || item.account_group === "SUPPLIERS"
        );
        setCustomers(filteredCustomers);
        setFilteredCustomers(filteredCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      // Reset to all customers if the query is empty
      setFilteredCustomers(customers);
      setIsDropdownVisible(false);
      onSelectCustomer(null); // Clear the filter in parent component
    } else {
      const filtered = customers.filter(
        (customer) =>
          customer.mobile.toLowerCase().includes(query) ||
          (customer.account_name && customer.account_name.toLowerCase().includes(query))
      );
      setFilteredCustomers(filtered);
      setIsDropdownVisible(true);
    }
  };

  const handleCustomerSelect = (customer) => {
    setSearchQuery(customer.mobile);
    setIsDropdownVisible(false);
    onSelectCustomer(customer.mobile);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredCustomers(customers); // Reset the filtered list
    setIsDropdownVisible(false);
    onSelectCustomer(null); // Clear the filter in parent component
  };

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsDropdownVisible(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && filteredCustomers.length > 0) {
      handleCustomerSelect(filteredCustomers[0]); // Automatically select the first customer
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ padding: "20px", fontFamily: "Arial, sans-serif", marginRight: "100px" }}
    >
      <div style={{ position: "relative", width: "100%" }}>
        {/* Search Bar */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyPress}
            onFocus={() => setIsDropdownVisible(true)}
            placeholder="Search customers by mobile or name"
            style={{
              width: "140%",
              padding: "10px 40px",
              border: "1px solid #ccc",
              borderRadius: "25px",
              fontSize: "14px",
              outline: "none",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          />
          {/* Search Icon */}
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "15px",
              transform: "translateY(-50%)",
              color: "#888",
              fontSize: "16px",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          {/* Clear (Cross) Icon */}
          {searchQuery && (
            <span
              onClick={clearSearch}
              style={{
                position: "absolute",
                top: "50%",
                right: "-80px",
                transform: "translateY(-50%)",
                color: "#888",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              ✖
            </span>
          )}
        </div>

        {/* Dropdown */}
        {isDropdownVisible && (
          <div
            style={{
              position: "absolute",
              top: "50px",
              left: "0",
              width: "140%",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              zIndex: "1000",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.account_id}
                  onClick={() => handleCustomerSelect(customer)}
                  style={{
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <img
                    src="https://png.pngtree.com/png-clipart/20231019/original/pngtree-user-profile-avatar-png-image_13369991.png"
                    alt="Customer"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      marginRight: "10px",
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                      {customer.mobile}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {customer.account_name || "No name available"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "10px",
                  textAlign: "center",
                  color: "#999",
                  fontSize: "14px",
                }}
              >
                No customers found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Customers;


