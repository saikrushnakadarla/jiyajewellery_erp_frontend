import React, { useEffect, useState } from 'react';
import { useTable, usePagination, useGlobalFilter, useSortBy, useExpanded } from 'react-table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Global Search Filter Component with Date Filter
function GlobalFilter({ globalFilter, setGlobalFilter, handleDateFilter, resetFilters }) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);

  const applyDateFilter = () => {
    handleDateFilter(fromDate, toDate);
    setIsFiltered(true);
  };

  const clearDateFilter = () => {
    setFromDate('');
    setToDate('');
    setIsFiltered(false);
    resetFilters();
  };

  return (
    <div className="dataTable_search mb-3">
      {/* Search and Date Filters Row */}
      <div className="row g-2 align-items-end">
        {/* Search Input */}
        <div className="col-12 col-md-auto">
          <div className="position-relative" style={{ maxWidth: '200px' }}>
            <input
              value={globalFilter || ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="form-control pe-4"
              placeholder="Search..."
            />
            {globalFilter && (
              <button
                className="btn btn-sm btn-light position-absolute end-0 top-50 translate-middle-y border-0"
                onClick={() => setGlobalFilter('')}
                style={{ color: '#999' }}
                title="Clear search"
              >
                ✖
              </button>
            )}
          </div>
        </div>

        {/* Date Filters - Stack on mobile, inline on desktop */}
        <div className="col-12 col-md-auto">
          <div className="row g-2">
            <div className="col-6 col-md-auto">
              <label className="form-label small mb-1 d-md-none">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="form-control form-control-sm"
                style={{ minWidth: '120px' }}
              />
            </div>
            <div className="col-6 col-md-auto">
              <label className="form-label small mb-1 d-md-none">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="form-control form-control-sm"
                style={{ minWidth: '120px' }}
              />
            </div>
          </div>
        </div>

        {/* Filter Button */}
        <div className="col-12 col-md-auto">
          {!isFiltered ? (
            <button onClick={applyDateFilter} className="btn btn-primary btn-sm">
              OK
            </button>
          ) : (
            <button onClick={clearDateFilter} className="btn btn-outline-danger btn-sm" title="Clear date filters">
              ❌
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable DataTable Component with Expandable Rows
export default function DataTable({
  columns,
  data,
  initialSearchValue,
  renderRowSubComponent,
  expandAll = false
}) {
  const [expandedRows, setExpandedRows] = useState({});
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const handleDateFilter = (fromDate, toDate) => {
    if (fromDate || toDate) {
      const filtered = data.filter((item) => {
        // Look for any date field in the row data
        const dateFields = Object.keys(item).filter(key => 
          typeof item[key] === 'string' && 
          (item[key].match(/\d{4}-\d{2}-\d{2}/) || new Date(item[key]).toString() !== 'Invalid Date')
        );

        // Check if any date field matches the filter criteria
        return dateFields.some(dateField => {
          const itemDate = new Date(item[dateField]).setHours(0, 0, 0, 0);
          const from = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
          const to = toDate ? new Date(toDate).setHours(0, 0, 0, 0) : null;
          
          return (!from || itemDate >= from) && (!to || itemDate <= to);
        });
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const resetFilters = () => {
    setFilteredData(data);
  };

  // Initialize all rows as expanded if expandAll is true
  useEffect(() => {
    if (expandAll && filteredData.length > 0) {
      const initialExpanded = {};
      filteredData.forEach((_, index) => {
        initialExpanded[index] = true;
      });
      setExpandedRows(initialExpanded);
    }
  }, [filteredData, expandAll]);

  const filterAllColumns = (rows, id, filterValue) => {
    if (!filterValue) return rows;
    const lowercasedFilter = filterValue.toLowerCase();

    return rows.filter((row) => {
      return Object.values(row.original).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(lowercasedFilter)
      );
    });
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
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: {
        pageIndex: 0,
        globalFilter: initialSearchValue,
        expanded: expandedRows
      },
      globalFilter: filterAllColumns,
      autoResetExpanded: false,
    },
    useGlobalFilter,
    useSortBy,
    useExpanded,
    usePagination
  );

  // Set the global filter to the initial value when the component mounts
  useEffect(() => {
    if (initialSearchValue) {
      setGlobalFilter(initialSearchValue);
    }
  }, [initialSearchValue, setGlobalFilter]);

  // Update expanded rows when filtered data changes
  useEffect(() => {
    if (expandAll && filteredData.length > 0) {
      const newExpanded = {};
      filteredData.forEach((_, index) => {
        newExpanded[index] = true;
      });
      setExpandedRows(newExpanded);
    }
  }, [filteredData, expandAll]);

  const toggleRowExpanded = (rowIndex) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowIndex]: !prev[rowIndex]
    }));
  };

  return (
    <div className="dataTable_wrapper container-fluid">
      {/* Global Search Filter with Date Filter */}
      <GlobalFilter 
        globalFilter={globalFilter} 
        setGlobalFilter={setGlobalFilter}
        handleDateFilter={handleDateFilter}
        resetFilters={resetFilters}
      />

      {/* Table */}
      <div className="table-responsive">
        <table {...getTableProps()} className="table table-striped">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} className="dataTable_headerRow">
                {renderRowSubComponent && <th className="dataTable_headerCell"></th>}
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
            {page.map((row, rowIndex) => {
              prepareRow(row);
              const isExpanded = expandedRows[rowIndex];

              return (
                <React.Fragment key={row.id}>
                  <tr {...row.getRowProps()} className="dataTable_row">
                    {renderRowSubComponent && (
                      <td className="dataTable_cell">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => toggleRowExpanded(rowIndex)}
                          style={{
                            padding: '2px 6px',
                            fontSize: '0.75rem'
                          }}
                        >
                          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </td>
                    )}
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} className="dataTable_cell">
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                  {renderRowSubComponent && isExpanded && (
                    <tr>
                      <td colSpan={columns.length + 1} className="p-0">
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

      {/* Improved Responsive Pagination */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-3">
        {/* Page Info */}
        <div className="text-center text-md-start">
          Page <strong>{pageIndex + 1}</strong> of <strong>{pageOptions.length}</strong>
        </div>
        
        {/* Pagination Buttons */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            Prev
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            Next
          </button>
        </div>
        
        {/* Page Size Selector */}
        <div className="d-flex align-items-center gap-2">
          <span className="d-none d-sm-inline">Show:</span>
          <select
            className="form-select form-select-sm"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            style={{ width: 'auto' }}
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}