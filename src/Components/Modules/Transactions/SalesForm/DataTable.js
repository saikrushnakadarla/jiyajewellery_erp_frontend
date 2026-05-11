import React, { useState, useEffect } from "react";
import { Table, Form } from "react-bootstrap";
import { useTable, useGlobalFilter } from "react-table";

const DataTable = ({ columns, data, initialSearchValue = "", tabId }) => {
  const [globalFilter, setGlobalFilter] = useState(initialSearchValue);
  const [selectedRows, setSelectedRows] = useState({});

  useEffect(() => {
    setGlobalFilter(initialSearchValue);
  }, [initialSearchValue]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter: setTableGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      initialState: { globalFilter },
    },
    useGlobalFilter
  );

  useEffect(() => {
    setTableGlobalFilter(globalFilter);
  }, [globalFilter, setTableGlobalFilter]);

  const getColumnWidth = (header) => {
    const length = header?.length || 10;
    const baseWidth = 10;
    return `${Math.max(baseWidth, length + 5)}ch`;
  };

  const handleRowSelect = (rowId, rowData) => {
    console.log("rowId=",rowId)
    setSelectedRows(prev => {
      const newSelected = {
        ...prev,
        [rowId]: !prev[rowId]
      };
      
      // Store selected row data in localStorage when checked
      if (!prev[rowId]) {
        const selectedData = data.find(item => item.order_number === rowId.order_number);
        console.log("selectedData=",selectedData)
        if (selectedData) {
          localStorage.setItem(`repairDetails_${tabId}`, JSON.stringify({
            ...selectedData,
            repeatedData: selectedData.repeatedData || [] // Ensure repeatedData exists
          }));
        }
      } else {
        // Remove from localStorage when unchecked
        localStorage.removeItem(`repairDetails_${tabId}`);
      }
      
      return newSelected;
    });
  };

  const handleSelectAll = (e) => {
    const isSelected = e.target.checked;
    const newSelected = {};
    if (isSelected) {
      rows.forEach(row => {
        newSelected[row.id] = true;
        // Store all rows data in localStorage
        localStorage.setItem(`repairDetails_${tabId}`, JSON.stringify({
          ...row.original,
          repeatedData: row.original.repeatedData || []
        }));
      });
    } else {
      // Clear all from localStorage when unchecking
      localStorage.removeItem(`repairDetails_${tabId}`);
    }
    setSelectedRows(newSelected);
  };

  return (
    <div>
      <Table striped bordered hover responsive {...getTableProps()} style={{ whiteSpace: "nowrap" }}>
        <thead>
          {headerGroups.map((headerGroup, i) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={i}>
              <th style={{ width: '3ch' }}>
                <Form.Check
                  type="checkbox"
                  custom
                  style={{
                    transform: "scale(0.7)",
                    margin: 0,
                    padding: 0
                  }}
                  onChange={handleSelectAll}
                  checked={rows.length > 0 && Object.keys(selectedRows).length === rows.length}
                />
              </th>
              {headerGroup.headers.map((column, j) => (
                <th
                  {...column.getHeaderProps()}
                  key={j}
                  style={{
                    width: getColumnWidth(column.render("Header")),
                    fontSize: "13px",
                  }}
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={i}>
                <td style={{ width: '3ch' }}>
                  <Form.Check
                    type="checkbox"
                    custom
                    style={{
                      transform: "scale(0.7)",
                      margin: 0,
                      padding: 0
                    }}
                    checked={!!selectedRows[row.id]}
                    onChange={() => handleRowSelect(row.id, row.original)}
                  />
                </td>
                {row.cells.map((cell, j) => (
                  <td
                    {...cell.getCellProps()}
                    key={j}
                    style={{
                      width: getColumnWidth(cell.column.render("Header")),
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "13px",
                    }}
                  >
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default DataTable;