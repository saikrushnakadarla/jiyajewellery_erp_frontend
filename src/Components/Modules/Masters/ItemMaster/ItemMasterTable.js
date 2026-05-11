import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout'; // Import the reusable DataTable component
import { Button, Row, Col, Modal, Form } from 'react-bootstrap';
import './ItemMasterTable.css';
import baseURL from '../../../../Url/NodeBaseURL';
import InputField from "./Inputfield";
import { FaEdit, FaTrash } from 'react-icons/fa';

const ItemMasterTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // State to store table data
  const [loading, setLoading] = useState(true); // State for loading
  const [error, setError] = useState(null); // State for error handling
  const [showUpdateModal, setShowUpdateModal] = useState(false); // Modal visibility state
  const [selectedProduct, setSelectedProduct] = useState(null); // Selected product data
  const [formData, setFormData] = useState({}); // Form data for updating
 const [isMaintainTagsChecked, setIsMaintainTagsChecked] = useState(false);

 const maintainTagsStyle = !isMaintainTagsChecked

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${baseURL}/get/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const result = await response.json();
      setData(result); // Populate the data state with API response
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

     // Fetch metal types from the API
     useEffect(() => {
      const fetchMetalTypes = async () => {
        try {
          const response = await axios.get(`${baseURL}/metaltype`);
          const metalTypes = response.data.map(item => ({
            value: item.metal_name, // Assuming the column name is "metal_name"
            label: item.metal_name
          }));
          setmetalOptions(metalTypes);
        } catch (error) {
          console.error('Error fetching metal types:', error);
        }
      };
  
      fetchMetalTypes();
    }, []);
  
    // Fetch design master options from the API
    useEffect(() => {
      const fetchDesignMaster = async () => {
        try {
          const response = await axios.get(`${baseURL}/designmaster`);
          const designMasters = response.data.map((item) => ({
            value: item.design_name, // Assuming the column name is "design_name"
            label: item.design_name,
          }));
          setdesignOptions(designMasters);
        } catch (error) {
          console.error('Error fetching design masters:', error);
        }
      };
  
      fetchDesignMaster();
    }, []);
  
    // Fetch purity options from the API
    useEffect(() => {
      const fetchPurity = async () => {
        try {
          const response = await axios.get(`${baseURL}/purity`);
          const purityOptions = response.data.map((item) => ({
            value: item.name, // Assuming the column name is "name"
            label: item.name,
          }));
          setDropdownOptions(purityOptions);
        } catch (error) {
          console.error('Error fetching purity options:', error);
        }
      };
  
      fetchPurity();
    }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${baseURL}/delete/products/${productId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete product');
        }
        alert('Product deleted successfully');
        fetchProducts(); // Refresh the product list after deletion
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    const fetchProductIds = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/taxslabs`);
        const Data = response.data; // Ensure the response structure matches this
        const options = Data.map((tax) => ({
          value: tax.TaxSlabName,
          label: tax.TaxSlabName,
          id: tax.TaxSlabID, // Ensure you have the TaxSlabID
        }));
        setTaxOptions(options);
        console.log("Names=", options)
      } catch (error) {
        console.error("Error fetching product IDs:", error);
      }
    };

    fetchProductIds();
  }, []);

  const handleUpdate = (product) => {
    setSelectedProduct(product);
    setFormData(product); // Pre-fill form data with selected product
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${baseURL}/put/products/${selectedProduct.product_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Failed to update Category');
      }
      alert('Category updated successfully');
      setShowUpdateModal(false);
      fetchProducts(); // Refresh the product list after update
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleCheckboxChange = () => {
    setIsMaintainTagsChecked((prev) => {
      const newCheckedState = !prev;
      setFormData((prevFormData) => ({
        ...prevFormData,
        maintain_tags: newCheckedState, // Update maintain_tags in formData
      }));
      return newCheckedState;
    });
  };

   const [metalOptions, setmetalOptions] = useState([]);
    const [designOptions, setdesignOptions] = useState([]);
    const [dropdownOptions, setDropdownOptions] = useState([]);
const [taxOptions, setTaxOptions] = useState([]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const columns = React.useMemo(
    () => [
      // { Header: 'Category ID:', accessor: 'product_id' },
      { Header: 'Category Name', accessor: 'product_name' },
      { Header: 'Barcode', accessor: 'rbarcode' },
      { Header: 'Metal Type', accessor: 'Category' },
      // { Header: 'Design Master', accessor: 'design_master' },
      // { Header: 'Purity', accessor: 'purity' },
      // { Header: 'Item Prefix', accessor: 'item_prefix' },
      // { Header: 'Short Name:', accessor: 'short_name' },
      // { Header: 'Sale Account Head', accessor: 'sale_account_head' },
      // { Header: 'Purchase Account Head:', accessor: 'purchase_account_head' },
      { Header: 'Tax', accessor: 'tax_slab' },
      { Header: 'HSN Code', accessor: 'hsn_code' },
      // { Header: 'Maintain Tags', accessor: 'maintain_tags' },
      { Header: 'Pur Qty', accessor: 'pur_qty' },
      // { Header: 'OP. Value:', accessor: 'op_value' },
      { Header: 'Pur Weight', accessor: 'pur_weight' },
      { Header: 'Sale Qty', accessor: 'sale_qty' },
      { Header: 'Sale Weight', accessor: 'sale_weight' },
      // { Header: 'Sale Return Qty', accessor: 'salereturn_qty' },
      // { Header: 'Sale Return Weight', accessor: 'salereturn_weight' },
      { Header: 'Bal Qty', accessor: 'bal_qty' },
      { Header: 'Bal Weight', accessor: 'bal_weight' },
      // { Header: 'HUID No:', accessor: 'huid_no' },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => (
          <div >
            <FaEdit
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue', }}
              onClick={() => handleUpdate(row.original)}
            />
            <FaTrash
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'red', }}
              onClick={() => handleDelete(row.original.product_id)}
            />
          </div> 
        ),
      },
    ],
    []
  );

  const handleCreate = () => {
    navigate('/itemmaster'); // Navigate to the /itemmaster page
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

 

  return (
    <div className="main-container">
      <div className="itemmaster-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Categories</h3>
            <Button
              className="create_but"
              onClick={handleCreate}
              variant="success"
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
            >
              + Create
            </Button>
          </Col>
        </Row>
        <DataTable columns={columns} data={[...data].reverse()} /> {/* Render the table with fetched data */}
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
      <Modal
      show={showUpdateModal}
      onHide={() => setShowUpdateModal(false)}
      dialogClassName="custom-modal-width"
    >
      <Modal.Header closeButton>
        <Modal.Title>Update Category</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleUpdateSubmit} className="form-container">
          <h4 style={{ marginBottom: "15px" }}>Category Details</h4>
          <div className="form-row">
          <InputField
              label="Metal Type:"
              name="Category"
              type="select"
              value={formData.Category}
              onChange={handleChange}
              options={metalOptions}
            />
            <InputField
              label="Category:"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              // readOnly
            />
            <InputField
              label="Rbarcode:"
              name="rbarcode"
              value={formData.rbarcode}
              onChange={handleChange}
              readOnly
            />
            
            {/* <InputField
              label="Design Master:"
              name="design_master"
              type="select"
              value={formData.design_master}
              onChange={handleChange}
              options={designOptions}
            /> */}
            {/* <InputField
              label="Purity:"
              name="purity"
              type="select"
              value={formData.purity}
              onChange={handleChange}
              options={dropdownOptions}
            /> */}
            {/* <InputField
              label="Item Prefix:"
              name="item_prefix"
              value={formData.item_prefix}
              onChange={handleChange}
            /> */}
          </div>
          <div className="form-row">
            {/* <InputField
              label="Short Name:"
              name="short_name"
              value={formData.short_name}
              onChange={handleChange}
            /> */}
            <InputField
              label="Tax Slab:"
              name="tax_slab"
              type="select"
              value={formData.tax_slab}
              onChange={handleChange}
              options={taxOptions}
            />
            <InputField
              label="HSN Code:"
              name="hsn_code"
              value={formData.hsn_code}
              onChange={handleChange}
            />
          </div>
    
          {/* <div className="form-container" style={{ marginTop: "15px" }}>
            <div className="main-tags-row" style={{ display: "flex" }}>
              <input
                type="checkbox"
                id="main-tags"
                name="maintain_tags"
                style={{ width: "15px", marginTop: "-15px" }}
                checked={isMaintainTagsChecked}
                onChange={handleCheckboxChange}
                value={formData.maintain_tags}
              />
              <label htmlFor="main-tags" style={{ marginLeft: "10px" }}>
                <h4>Maintain Tags</h4>
              </label>
            </div>
            <div className="form-row" style={{ marginBottom: "-20px" }}>
              <InputField
                label="OP.Qty:"
                name="op_qty"
                value={formData.op_qty}
                onChange={handleChange}
                readOnly={isMaintainTagsChecked}
                style={maintainTagsStyle}
              />
              <InputField
                label="OP.Value:"
                name="op_value"
                value={formData.op_value}
                onChange={handleChange}
                readOnly={isMaintainTagsChecked}
                style={maintainTagsStyle}
              />
              <InputField
                label="OP.Weight:"
                name="op_weight"
                value={formData.op_weight}
                onChange={handleChange}
                readOnly={isMaintainTagsChecked}
                style={maintainTagsStyle}
              />
              <InputField
                label="HUID No:"
                name="huid_no"
                value={formData.huid_no}
                onChange={handleChange}
                readOnly={isMaintainTagsChecked}
                style={maintainTagsStyle}
              />
            </div>
          </div> */}
    
          <Button  className="create_but"  type="" variant="success"
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>
            update
          </Button>
         
        </Form>
      </Modal.Body>
    </Modal>
    
      
      )}
    </div>
  );
};

export default ItemMasterTable;
