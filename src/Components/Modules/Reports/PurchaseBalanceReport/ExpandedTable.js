import React, { useState, useEffect } from 'react';
import { useTable, usePagination, useGlobalFilter, useSortBy, useExpanded } from 'react-table';
import 'bootstrap/dist/css/bootstrap.min.css';

function GlobalFilter({ globalFilter, setGlobalFilter, handleDateFilter }) {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const applyDateFilter = () => {
        handleDateFilter(fromDate, toDate);
    };

    return (
        <div className="dataTable_search mb-3 d-flex align-items-center gap-2">
            <input
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
            </button>
        </div>
    );
}

export default function DataTable({ columns, data, renderRowSubComponent }) {
    const [filteredData, setFilteredData] = useState(data);

    useEffect(() => {
        setFilteredData(data);
    }, [data]);

    const handleDateFilter = (fromDate, toDate) => {
        if (fromDate || toDate) {
            const filtered = data.filter((item) => {
                const itemDates = item.invoices.map(inv => new Date(inv.date).setHours(0, 0, 0, 0));
                const from = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
                const to = toDate ? new Date(toDate).setHours(0, 0, 0, 0) : null;

                return itemDates.some(date =>
                    (!from || date >= from) && (!to || date <= to)
                );
            });
            setFilteredData(filtered);
        } else {
            setFilteredData(data);
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
        setGlobalFilter,
        state: { pageIndex, pageSize, globalFilter, expanded },
    } = useTable(
        {
            columns,
            data: filteredData,
            initialState: { pageIndex: 0 },
        },
        useGlobalFilter,
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
            />

            <div className="table-responsive">
                <table {...getTableProps()} className="table table-striped" style={{ fontSize:'14px' }}>
                    <thead>
                        {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()} className="dataTable_headerRow">
                                <th></th> {/* Expand arrow column */}
                                {headerGroup.headers.map((column) => (
                                    <th {...column.getHeaderProps(column.getSortByToggleProps())}  className="dataTable_headerCell">
                                        {column.render('Header')}
                                        <span>
                                            {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {page.map((row) => {
                            prepareRow(row);
                            return (
                                <React.Fragment key={row.id}>
                                    <tr {...row.getRowProps()}>
                                        <td
                                            {...row.getToggleRowExpandedProps()}
                                            style={{ cursor: 'pointer', textAlign: 'center' }}
                                        >
                                            {row.isExpanded ? '🔽' : '▶️'}

                                        </td>
                                        {row.cells.map((cell) => (
                                            <td {...cell.getCellProps()}>
                                                {cell.render('Cell')}
                                            </td>
                                        ))}
                                    </tr>
                                    {row.isExpanded && (
                                        <tr>
                                            <td colSpan={columns.length + 1}>
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