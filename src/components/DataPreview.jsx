import React, { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
} from '@tanstack/react-table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Search } from 'lucide-react';

const DataPreview = ({ data = [], columns = [] }) => {
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    });

    const tableColumns = useMemo(() => {
        return columns.map((col) => ({
            ...col,
            cell: ({ getValue }) => {
                const value = getValue() ?? '';
                return (
                    <div className="max-w-xs truncate" title={String(value)}>
                        {String(value)}
                    </div>
                );
            },
        }));
    }, [columns]);

    const table = useReactTable({
        data,
        columns: tableColumns,
        state: {
            sorting,
            globalFilter,
            pagination,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No data to display. Upload a file to get started.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search and Info */}
            <div className="flex items-center justify-between">
                <div className="relative max-w-sm w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search data..."
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="text-sm text-gray-600">
                    Showing {table.getRowModel().rows.length} of {data.length} rows
                </div>
            </div>

            {/* Table */}
            <div className="table-container bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center space-x-2">
                        <span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                                            <div className="flex flex-col">
                                                <ChevronUp
                                                    className={`w-3 h-3 ${header.column.getIsSorted() === 'asc' ? 'text-blue-600' : 'text-gray-300'}`}
                                                />
                                                <ChevronDown
                                                    className={`w-3 h-3 -mt-1 ${header.column.getIsSorted() === 'desc' ? 'text-blue-600' : 'text-gray-300'}`}
                                                />
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                        {table.getRowModel().rows.map((row, index) => (
                            <tr
                                key={row.id}
                                className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-4 py-3 text-sm text-gray-900 border-r border-gray-100 last:border-r-0">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white border-t px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>

                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => {
                                table.setPageSize(Number(e.target.value));
                            }}
                            className="ml-4 px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                            {[10, 20, 50, 100].map((pageSize) => (
                                <option key={pageSize} value={pageSize}>
                                    Show {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataPreview;
