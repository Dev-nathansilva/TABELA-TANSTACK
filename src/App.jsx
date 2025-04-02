import React, { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { FiMail, FiEdit, FiTrash2, FiSearch, FiFilter } from "react-icons/fi";

export default function App() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const data = useMemo(
    () =>
      [...Array(50).keys()].map((i) => ({
        id: i + 1,
        name: `Usuário ${i + 1}`,
        cpf: `00.000.000/0001-0${i % 9}`,
        city: "Fortaleza",
        status: i % 2 === 0 ? "Ativo" : "Inativo",
      })),
    []
  );

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => {
              if (column.getIsSorted() === "desc") {
                column.clearSorting();
              } else {
                column.toggleSorting(column.getIsSorted() === "asc");
              }
            }}
          >
            Nome{" "}
            {column.getIsSorted() === "asc"
              ? "▲"
              : column.getIsSorted() === "desc"
              ? "▼"
              : "↕"}
          </button>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "cpf",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => {
              if (column.getIsSorted() === "desc") {
                column.clearSorting();
              } else {
                column.toggleSorting(column.getIsSorted() === "asc");
              }
            }}
          >
            CPF / CNPJ{" "}
            {column.getIsSorted() === "asc"
              ? "▲"
              : column.getIsSorted() === "desc"
              ? "▼"
              : "↕"}
          </button>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "city",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => {
              if (column.getIsSorted() === "desc") {
                column.clearSorting();
              } else {
                column.toggleSorting(column.getIsSorted() === "asc");
              }
            }}
          >
            Cidade{" "}
            {column.getIsSorted() === "asc"
              ? "▲"
              : column.getIsSorted() === "desc"
              ? "▼"
              : "↕"}
          </button>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: ({ getValue }) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              getValue() === "Ativo"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {getValue()}
          </span>
        ),
      },
      {
        header: "Ações",
        cell: () => (
          <div className="flex gap-2 text-lg">
            <FiMail className="cursor-pointer text-black" />
            <FiEdit className="cursor-pointer text-orange-500" />
            <FiTrash2 className="cursor-pointer text-red-500" />
          </div>
        ),
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    return selectedStatus
      ? data.filter((row) => row.status === selectedStatus)
      : data;
  }, [data, selectedStatus]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(), // Confirma que a ordenação está ativada
    state: {
      globalFilter,
      columnFilters,
      pagination,
    },
    onPaginationChange: setPagination,
  });

  const totalPages = Math.ceil(filteredData.length / pagination.pageSize);
  const currentPage = pagination.pageIndex + 1;
  const maxPagesToShow = 5;

  const startPage = Math.max(
    1,
    Math.min(
      currentPage - Math.floor(maxPagesToShow / 2),
      totalPages - maxPagesToShow + 1
    )
  );
  const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-lg relative">
      <div className="flex items-center bg-white rounded-md shadow p-3 mb-4">
        <FiSearch className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Pesquisar..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full focus:outline-none"
        />
        <FiFilter
          className="text-gray-400 ml-2 cursor-pointer"
          onClick={() => setIsFilterOpen(true)}
        />
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Filtrar por Status</h2>
            <select
              className="w-full p-2 border rounded"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
            <button
              className="mt-4 w-full bg-blue-500 text-white p-2 rounded"
              onClick={() => setIsFilterOpen(false)}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      <div className="mb-2">
        <label>Itens por página: </label>
        <select
          value={pagination.pageSize}
          onChange={(e) =>
            setPagination((prev) => ({
              ...prev,
              pageSize: Number(e.target.value),
              pageIndex: 0,
            }))
          }
          className="border p-1 rounded"
        >
          {[5, 10, 15].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full border-separate border-spacing-y-3">
        <thead className="bg-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-3 text-left font-semibold">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="p-4 text-center text-gray-500"
              >
                Nenhum item encontrado
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={` rounded-[100px] shadow-md ${
                  row.getIsSelected() ? "bg-blue-100" : "bg-white"
                }`}
              >
                {row.getVisibleCells().map((cell, index, array) => (
                  <td
                    key={cell.id}
                    className={`p-4 text-left ${
                      index === 0 ? "rounded-l-[100px]" : ""
                    } ${index === array.length - 1 ? "rounded-r-[100px]" : ""}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex justify-between mt-4 items-center">
        <span>Total: {filteredData.length}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
            disabled={pagination.pageIndex === 0}
            className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
          >
            «
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
          >
            ←
          </button>
          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ).map((page) => (
            <button
              key={page}
              onClick={() =>
                setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))
              }
              className={`px-3 py-1 rounded-md ${
                currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
          >
            →
          </button>
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, pageIndex: totalPages - 1 }))
            }
            disabled={pagination.pageIndex === totalPages - 1}
            className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
