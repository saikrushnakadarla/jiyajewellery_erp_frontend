import React, { useEffect, useState } from "react";
import "./BarCodePrinting.css";
import InputField from "../../../Pages/InputField/InputField";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import baseURL from '../../../../Url/NodeBaseURL';

const RepairForm = () => {
  const [staticEntries, setStaticEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]); // Initially empty
  const [selectedDate, setSelectedDate] = useState(""); // State for the selected date
  const [selectedRows, setSelectedRows] = useState([]); // To track selected rows
  const [selectAll, setSelectAll] = useState(false); // "Select All" state

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get/opening-tags-entry`);
        const data = await response.json();
        console.log("API Response:", data);

        if (data && Array.isArray(data.result)) {
          const formattedData = data.result.map((item, index) => ({
            id: index, // Unique ID for tracking selection
            opentag_id:item.opentag_id,
            pCode: item.PCode_BarCode,
            nameValue: item.sub_category,
            weight: item.Gross_Weight,
            date: item.added_at.split("T")[0], // Extract date part from ISO string
          }));

          console.log("Formatted Data:", formattedData);
          setStaticEntries(formattedData);
        } else {
          console.error("Unexpected data structure:", data);
        }
      } catch (error) {
        console.error("Error fetching purchases:", error);
      }
    };

    fetchData();
  }, []);

  // Handle date selection change
  const handleDateChange = (event) => {
    const selectedDate = event.target.value;
    setSelectedDate(selectedDate);

    if (selectedDate) {
      // Filter entries based on the selected date
      const filteredData = staticEntries.filter((entry) => entry.date === selectedDate);
      setFilteredEntries(filteredData);
      setSelectedRows([]); // Reset selected rows
      setSelectAll(false); // Reset "Select All" state
    } else {
      setFilteredEntries([]);
      setSelectedRows([]);
      setSelectAll(false);
    }
  };

  // Handle individual row selection
  const handleRowSelection = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Handle "Select All" functionality
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredEntries.map((entry) => entry.id));
    }
    setSelectAll(!selectAll);
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    let yPosition = 10;
  
    // Filter only selected entries for PDF generation
    const entriesToDownload = filteredEntries.filter((entry) =>
      selectedRows.includes(entry.id)
    );
  
    if (entriesToDownload.length === 0) {
      alert("No rows selected!");
      return;
    }
  
    for (const entry of entriesToDownload) {
      const qrContent = `PCode: ${entry.pCode}, Name Value: ${entry.nameValue}, Weight: ${entry.weight}`;
  
      try {
        // Update qr_status to "yes"
        const response = await fetch(
          `${baseURL}/update/opening-tags-entry/${entry.opentag_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              qr_status: "yes", // Update qr_status
            }),
          }
        );
  
        if (!response.ok) {
          console.error(`Failed to update qr_status for ID ${entry.opentag_id}`);
          alert(`Error updating status for PCode: ${entry.pCode}`);
          continue; // Skip QR code generation for this entry
        }
  
        console.log(`Successfully updated qr_status for ID ${entry.opentag_id}`);
  
        // Generate QR code and add to PDF
        const qrImageData = await QRCode.toDataURL(qrContent);
  
        doc.addImage(qrImageData, "PNG", 10, yPosition, 40, 40);
        doc.text(
          `PCode: ${entry.pCode}\nName: ${entry.nameValue}\nWeight: ${entry.weight}`,
          60,
          yPosition + 20
        );
  
        yPosition += 50;
  
        if (yPosition > doc.internal.pageSize.height - 50) {
          doc.addPage();
          yPosition = 10;
        }
      } catch (error) {
        console.error("Error updating qr_status or generating QR:", error);
        alert(`Error processing entry with PCode: ${entry.pCode}`);
      }
    }
  
    doc.save("Selected_QR_Codes.pdf");
  };
  

  return (
    <div className="main-container">
      <Container className="barcode-form-container">
        <form className="barcode-form">
          <div className="barcode-form-left">
            <Col className="form-section">
              <Row>
                <InputField
                  label="Date"
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </Row>
              <Row>
                <InputField label="Product Name" />
              </Row>
              <Row>
                <InputField label="Weight" />
              </Row>
              <Row>
                <div className="form-buttons">
                  <Button type="submit" variant="primary">
                    ADD
                  </Button>
                </div>
              </Row>
            </Col>
          </div>
          <div className="barcode-form-right">
            <Col className="form-section">
              <Table bordered hover responsive>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>BarCode</th>
                    <th>Product Name</th>
                    <th>Gross Weight</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(entry.id)}
                          onChange={() => handleRowSelection(entry.id)}
                        />
                      </td>
                      <td>{entry.pCode}</td>
                      <td>{entry.nameValue}</td>
                      <td>{entry.weight}</td>
                      <td>{entry.date}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </div>
        </form>

      </Container>
      <div className="qr-button-container">
        <Button variant="success" onClick={generatePDF}>
          Generate QR PDF
        </Button>
      </div>
    </div>
  );
};

export default RepairForm;
