import React, { useState, useEffect } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import 'bootstrap/dist/css/bootstrap.min.css';

// Global Search Filter Component
function GlobalFilter({ globalFilter, setGlobalFilter, handleDateFilter }) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

//   const applyDateFilter = () => {
//     handleDateFilter(fromDate, toDate);
//   };

  return (
    <div className="dataTable_search mb-3 d-flex align-items-center gap-2">
      {/* <input
        value={globalFilter || ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="form-control"
        placeholder="Search..."
        style={{ maxWidth: '200px' }}
      />
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="form-control"
        style={{ maxWidth: '150px' }}
      />
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="form-control"
        style={{ maxWidth: '150px' }}
      />
      <button onClick={applyDateFilter} className="btn btn-primary">
        OK
      </button> */}
    </div>
  );
}

// Reusable DataTable Component
export default function DataTable({ columns, data }) {
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    setFilteredData(data); // Sync filteredData with data whenever data changes
  }, [data]);

//   const handleDateFilter = (fromDate, toDate) => {
//     if (fromDate || toDate) {
//       const filtered = data.filter((item) => {
//         const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
//         const from = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
//         const to = toDate ? new Date(toDate).setHours(0, 0, 0, 0) : null;

//         return (!from || itemDate >= from) && (!to || itemDate <= to);
//       });
//       setFilteredData(filtered);
//     } else {
//       setFilteredData(data);
//     }
//   };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter,
    state: { globalFilter },
  } = useTable(
    {
      columns,
      data: filteredData,
    },
    useGlobalFilter,
    useSortBy
  );

  return (
    <div className="dataTable_wrapper container-fluid">
      <GlobalFilter
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        // handleDateFilter={handleDateFilter}
      />

      <div className="table-responsive">
        <table {...getTableProps()} className="table table-striped">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} className="dataTable_headerRow">
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="dataTable_headerCell"
                  >
                    {column.render('Header')}
                    <span>
                      {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="dataTable_body">
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="dataTable_row">
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="dataTable_cell">
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
