import React, { useState, useEffect } from 'react';
import { useTable, usePagination, useGlobalFilter, useSortBy, useExpanded } from 'react-table';
import 'bootstrap/dist/css/bootstrap.min.css';

function GlobalFilter({ globalFilter, setGlobalFilter, handleDateFilter, onFilter }) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const applyDateFilter = () => {
    handleDateFilter(fromDate, toDate);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setGlobalFilter(value);
    if (onFilter) {
      onFilter(value);
    }
  };

  const clearSearch = () => {
    setGlobalFilter('');
    if (onFilter) {
      onFilter('');
    }
  };

  return (
    <div className="dataTable_search mb-3 d-flex align-items-center gap-2">
      <div className="position-relative" style={{ maxWidth: '250px' }}>
        <input
          value={globalFilter || ''}
          onChange={handleSearchChange}
          className="form-control pe-4"
          placeholder="Search all data..."
        />
        {globalFilter && (
          <span 
            className="position-absolute end-0 top-50 translate-middle-y me-2"
            style={{ cursor: 'pointer', size: "20px" }}
            onClick={clearSearch}
          >
            ×
          </span>
        )}
      </div>
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
        Ok
      </button>
    </div>
  );
}

export default function DataTable({ columns, data, renderRowSubComponent, globalFilter, setGlobalFilter, onFilter }) {
  const [filteredData, setFilteredData] = useState(data);
  const [originalData, setOriginalData] = useState(data);

  useEffect(() => {
    setFilteredData(data);
    setOriginalData(data);
  }, [data]);

  const handleDateFilter = (fromDate, toDate) => {
    if (fromDate || toDate) {
      const filtered = originalData.filter((item) => {
        const itemDates = item.invoices.map(inv => new Date(inv.date).setHours(0, 0, 0, 0));
        const from = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
        const to = toDate ? new Date(toDate).setHours(0, 0, 0, 0) : null;

        return itemDates.some(date => 
          (!from || date >= from) && (!to || date <= to)
        );
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(originalData);
    }
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, expanded },
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: { pageIndex: 0 },
    },
    useSortBy,
    useExpanded,
    usePagination
  );

  return (
    <div className="dataTable_wrapper container-fluid">
      <GlobalFilter 
        globalFilter={globalFilter} 
        setGlobalFilter={setGlobalFilter} 
        handleDateFilter={handleDateFilter}
        onFilter={onFilter}
      />

      <div className="table-responsive">
        <table {...getTableProps()} className="table table-striped" style={{ fontSize:'13px' }}>
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
            {page.map((row) => {
              prepareRow(row);
              return (
                <React.Fragment key={row.id}>
                  <tr {...row.getRowProps()} className="dataTable_row">
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} className="dataTable_cell">
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                  {row.isExpanded && (
                    <tr>
                      <td colSpan={columns.length}>
                        {renderRowSubComponent({ row })}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="d-flex align-items-center justify-content-between mt-3">
        <div className="dataTable_pageInfo">
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </div>
        <div className="pagebuttons">
          <button
            className="btn btn-primary me-2 btn1"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            Prev
          </button>
          <button
            className="btn btn-primary btn1"
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            Next
          </button>
        </div>
        <div>
          <select
            className="form-select form-select-sm"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}