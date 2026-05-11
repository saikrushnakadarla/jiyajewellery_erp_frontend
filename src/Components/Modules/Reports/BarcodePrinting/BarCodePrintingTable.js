import React, { useEffect, useState } from "react";
import "./BarCodePrinting.css";
import InputField from "../../../Pages/InputField/InputField";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import baseURL from '../../../../Url/NodeBaseURL';

const RepairForm = () => {
  const [staticEntries, setStaticEntries] = useState([]);
  const [selectedRows, setSelectedRows] = useState({}); // Object to track selected rows
  const [selectAll, setSelectAll] = useState(false); // State for "Select All" checkbox

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/get/opening-tags-entry`);
        const data = await response.json();
        console.log("API Response:", data);

        if (data && Array.isArray(data.result)) {
          const formattedData = data.result.map((item) => ({
            pCode: item.PCode_BarCode,
            nameValue: item.product_Name,
            weight: item.Gross_Weight,
            date: item.added_at,
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

  const handleRowSelect = (index) => {
    setSelectedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const updatedSelections = {};
    if (newSelectAll) {
      staticEntries.forEach((_, index) => {
        updatedSelections[index] = true;
      });
    }
    setSelectedRows(updatedSelections);
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    let yPosition = 10;

    const selectedEntries = staticEntries.filter((_, index) => selectedRows[index]);

    for (const entry of selectedEntries) {
      const qrContent = `PCode: ${entry.pCode}, Name Value: ${entry.nameValue}, Weight: ${entry.weight}`;

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
                <InputField label="Date" type="date" />
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
                  </tr>
                </thead>
                <tbody>
                  {staticEntries.map((entry, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="checkbox"
                          checked={!!selectedRows[index]}
                          onChange={() => handleRowSelect(index)}
                        />
                      </td>
                      <td>{entry.pCode}</td>
                      <td>{entry.nameValue}</td>
                      <td>{entry.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </div>
        </form>
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <Button variant="success" onClick={generatePDF}>
            Generate QR PDF for Selected Rows
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default RepairForm;
