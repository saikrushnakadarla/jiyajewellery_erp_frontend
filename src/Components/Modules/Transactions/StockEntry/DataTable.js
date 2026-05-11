import React, { useEffect, useState, useMemo } from "react";
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useSortBy,
  useExpanded,
} from "react-table";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

/* ---------------- GLOBAL FILTER ---------------- */

function GlobalFilter({
  globalFilter,
  setGlobalFilter,
  handleDateFilter,
  resetFilters,
}) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);

  const applyDateFilter = () => {
    handleDateFilter(fromDate, toDate);
    setIsFiltered(true);
  };

  const clearDateFilter = () => {
    setFromDate("");
    setToDate("");
    setIsFiltered(false);
    resetFilters();
  };

  return (
    <div className="dataTable_search mb-3">
      <div className="row g-2 align-items-end">
        <div className="col-md-auto position-relative">
          <input
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="form-control"
            placeholder="Search..."
          />

          {globalFilter && (
            <button
              className="btn btn-sm btn-light position-absolute end-0 top-50 translate-middle-y border-0"
              onClick={() => setGlobalFilter("")}
              style={{ color: "#999" }}
              title="Clear search"
            >
              ✖
            </button>
          )}
        </div>

        <div className="col-md-auto">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="form-control form-control-sm"
          />
        </div>

        <div className="col-md-auto">
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="form-control form-control-sm"
          />
        </div>

        <div className="col-md-auto">
          {!isFiltered ? (
            <button
              onClick={applyDateFilter}
              className="btn btn-primary btn-sm"
            >
              OK
            </button>
          ) : (
            <button
              onClick={clearDateFilter}
              className="btn btn-outline-danger btn-sm"
            >
              ❌
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- DATATABLE ---------------- */

export default function DataTable({
  columns,
  data,
  initialSearchValue,
  renderRowSubComponent,
  expandAll = false,
}) {
  const [expandedRows, setExpandedRows] = useState({});
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => setFilteredData(data), [data]);

  const handleDateFilter = (fromDate, toDate) => {
    if (!fromDate && !toDate) return setFilteredData(data);

    const filtered = data.filter((item) => {
      const date = new Date(item.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      return (!from || date >= from) && (!to || date <= to);
    });

    setFilteredData(filtered);
  };

  const resetFilters = () => setFilteredData(data);

  const filterAllColumns = (rows, id, filterValue) => {
    if (!filterValue) return rows;
    const val = filterValue.toLowerCase();
    return rows.filter((row) =>
      Object.values(row.original).some(
        (v) => v && v.toString().toLowerCase().includes(val),
      ),
    );
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    pageOptions,
    canPreviousPage,
    canNextPage,
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
        globalFilter: initialSearchValue,
      },
      globalFilter: filterAllColumns,
    },
    useGlobalFilter,
    useSortBy,
    useExpanded,
    usePagination,
  );

  /* ⭐ TOTAL CALCULATION (CURRENT PAGE ONLY) */
  const totals = useMemo(() => {
    return page.reduce(
      (acc, row) => {
        acc.gross += Number(row.original.Gross_Weight || 0);
        acc.net += Number(row.original.TotalWeight_AW || 0);
        return acc;
      },
      { gross: 0, net: 0 },
    );
  }, [page]);

  return (
    <div className="container-fluid">
      <GlobalFilter
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        handleDateFilter={handleDateFilter}
        resetFilters={resetFilters}
      />

      <div className="table-responsive">
        <table {...getTableProps()} className="table table-striped">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="dataTable_headerCell"
                  >
                    {column.render("Header")}
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔽"
                        : " 🔼"
                      : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()} className="dataTable_body">
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="dataTable_row">
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="dataTable_cell">
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>

          {/* ⭐ TOTAL ROW (ONLY ADDITION) */}
          <tfoot className="dataTable_cell">
            <tr className="fw-bold">
              <td colSpan={6} className="text-end">
                TOTAL
              </td>
              <td>{totals.gross.toFixed(3)}</td>
              <td></td>
              <td>{totals.net.toFixed(3)}</td>
              <td colSpan={columns.length - 9}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          Page <b>{pageIndex + 1}</b> of <b>{pageOptions.length}</b>
        </div>

        <div>
          <button
            className="btn btn-sm btn-primary me-2"
            onClick={previousPage}
            disabled={!canPreviousPage}
          >
            Prev
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={nextPage}
            disabled={!canNextPage}
          >
            Next
          </button>
        </div>

        <select
          className="form-select form-select-sm"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          style={{ width: 80 }}
        >
          {[5, 10, 20].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
