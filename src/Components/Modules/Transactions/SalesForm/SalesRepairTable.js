import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Table, Form } from 'react-bootstrap';
import axios from 'axios';
import baseURL from "../../../../Url/NodeBaseURL";

const RepairsTable = ({ selectedMobile, tabId, setRepairDetails }) => {
    const [repairs, setRepairs] = useState([]);
    const [selectedRepairs, setSelectedRepairs] = useState({});

    const fetchRepairs = async () => {
        try {
            const response = await axios.get(`${baseURL}/get/repairs`);
            setRepairs(response.data);
            console.log("Repairs=", response.data);
        } catch (error) {
            console.error('Error fetching repairs:', error);
        }
    };

    useEffect(() => {
        fetchRepairs();
    }, []);

    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Filter repairs based on selectedMobile and status
    const filteredRepairs = repairs.filter(
        (repair) =>
            repair.mobile === selectedMobile &&
            repair.status === 'Receive from Workshop'
    );

    const handleCheckboxChange = (repair, isChecked) => {
        const storageKey = `repairDetails_${tabId}`;
        const existingData = JSON.parse(localStorage.getItem(storageKey)) || [];

        if (isChecked) {
            // Create complete repair object with all required fields
            const filteredRepair = {
                sub_category: repair.item,
                product_name: repair.item,
                customer_id: repair.customer_id,
                account_name: repair.account_name,
                mobile: repair.mobile,
                email: repair.email,
                address1: repair.address1,
                address2: repair.address2,
                city: repair.city,
                metal_type: repair.metal_type,
                purity: repair.purity,
                category: repair.category,
                gross_weight: 1,
                total_weight_av: 1,
                printing_purity: repair.purity,
                selling_purity: repair.purity,
                qty: repair.qty,
                total_price: repair.total_amt,
                repair_no: repair.repair_no,
                // Additional fields needed for payment calculations
                rate: repair.total_amt || 0,
                hm_charges: 0,
                rate_amt: repair.total_amt || 0,
                making_charges: 0,
                stone_price: 0,
                tax_amt: 0,
                tax_percent: 0,
                pricing: 'By Weight',
                sale_status: 'Not Delivered',
                order_number: `${repair.repair_no}`,
                date: new Date().toISOString().split("T")[0],
                invoice:'Converted',
                transaction_status:"ConvertedRepairInvoice"
                // Add any other required fields
            };

            // Add only if not already present
            const alreadyExists = existingData.some(item => item.repair_no === repair.repair_no);
            if (!alreadyExists) {
                const updatedData = [...existingData, filteredRepair];
                localStorage.setItem(storageKey, JSON.stringify(updatedData));
                setRepairDetails(updatedData);
            }

            setSelectedRepairs(prev => ({
                ...prev,
                [repair.repair_no]: true
            }));
        } else {
            // Remove item by repair_no
            const updatedData = existingData.filter(item => item.repair_no !== repair.repair_no);
            localStorage.setItem(storageKey, JSON.stringify(updatedData));
            setRepairDetails(updatedData);

            setSelectedRepairs(prev => {
                const newState = {...prev};
                delete newState[repair.repair_no];
                return newState;
            });
        }
    };

    const navigate = useNavigate();
    const handleNavigate = (e) => {
        e.preventDefault();
        console.log("Selected Mobile being passed:", selectedMobile);
        navigate('/repairs', { state: { mobile: selectedMobile } });
    };

    return (
        <div style={{ paddingBottom: "15px" }}>
            <div className="table-responsive">
                <button 
                    className="btn btn-primary" 
                    onClick={handleNavigate} 
                    style={{
                        backgroundColor: "rgb(163, 110, 41)",
                        borderColor: "rgb(163, 110, 41)",
                        color: "white", 
                        fontSize: '13px', 
                        padding: '5px', 
                        marginBottom: "10px"
                    }}
                >
                    New
                </button>

                <Table bordered hover style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>SI</th>
                            <th>Date</th>
                            <th>Mobile</th>
                            <th>Account</th>
                            <th>Repair No</th>
                            <th>Item Name</th>
                            <th>Metal Type</th>
                            <th>Purity</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRepairs.length > 0 ? (
                            filteredRepairs.map((repair, index) => (
                                <tr key={index}>
                                    <td>
                                        <Form.Check
                                            type="checkbox"
                                            checked={!!selectedRepairs[repair.repair_no]}
                                            onChange={(e) => handleCheckboxChange(repair, e.target.checked)}
                                        />
                                    </td>
                                    <td>{index + 1}</td>
                                    <td>{formatDate(repair.date)}</td>
                                    <td>{repair.mobile}</td>
                                    <td>{repair.account_name}</td>
                                    <td>{repair.repair_no || '-'}</td>
                                    <td>{repair.item || '-'}</td>
                                    <td>{repair.metal_type || '-'}</td>
                                    <td>{repair.purity || '-'}</td>
                                    <td>{repair.total_amt || '-'}</td>
                                    <td>{repair.status || '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="11" className="text-center">No Repairs found</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default RepairsTable;