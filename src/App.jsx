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
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function App() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [enableResizing, setEnableResizing] = useState(false);
  const [enableDragging, setEnableDragging] = useState(false);

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

  const [columns, setColumns] = useState([
    {
      id: "select",
      enableResizing,
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
      size: 50,
    },
    {
      id: "name",
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
      enableResizing: true,
      size: 150,
    },
    {
      id: "cpf",
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
      enableResizing: true,
      size: 200,
    },
    {
      id: "city",
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
      enableResizing: true,
      size: 140,
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      enableResizing: true,
      size: 140,
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
      id: "actions",
      accessorKey: "Ações",
      header: "Ações",
      cell: () => (
        <div className="flex gap-2 text-lg">
          <FiMail className="cursor-pointer text-black" />
          <FiEdit className="cursor-pointer text-orange-500" />
          <FiTrash2 className="cursor-pointer text-red-500" />
        </div>
      ),
      enableResizing,
      size: 150,
    },
  ]);

  const onDragEnd = (event) => {
    if (!enableDragging) return; // Impede a reordenação quando desativado

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setColumns((prev) => {
      const oldIndex = prev.findIndex((col) => col.id === active.id);
      const newIndex = prev.findIndex((col) => col.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  function DraggableHeader({ column }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: column.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...(enableDragging ? { ...attributes, ...listeners } : {})} // Aplica listeners somente se enableDragging for true
        className={`p-3 text-left font-semibold ${
          enableDragging ? "cursor-move" : "cursor-default"
        } bg-gray-100`}
      >
        {enableDragging ? "⠿ " : ""} {column.columnDef?.accessorKey}
      </div>
    );
  }

  const filteredData = useMemo(() => {
    return selectedStatus
      ? data.filter((row) => row.status === selectedStatus)
      : data;
  }, [data, selectedStatus]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
  );

  const filteredColumns = useMemo(
    () => columns.filter((col) => visibleColumns[col.id]),
    [columns, visibleColumns]
  );

  const table = useReactTable({
    data: filteredData,
    columns: filteredColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      columnFilters,
      pagination,
    },
    onPaginationChange: setPagination,
    enableColumnResizing: enableResizing,
    columnResizeMode: "onChange",
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

  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (resizeHandler) => (event) => {
    setIsResizing(true);
    resizeHandler(event);

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mouseup", handleMouseUp);
  };

  const toggleColumnVisibility = (columnId) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

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

      {/* Contêiner de tabela com overflow-x-auto */}
      <div className="overflow-x-auto">
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={enableResizing}
            onChange={() => setEnableResizing((prev) => !prev)}
          />
          Ativar Redimensionamento
        </label>

        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={enableDragging}
            onChange={() => setEnableDragging((prev) => !prev)}
          />
          Ativar Reordenação de Colunas
        </label>

        <div className="mb-4">
          <h3 className="font-semibold">Ocultar/Exibir Colunas</h3>
          {columns.map((col) => (
            <label key={col.id} className="block">
              <input
                type="checkbox"
                checked={visibleColumns[col.id]}
                onChange={() => toggleColumnVisibility(col.id)}
                className="mr-2"
              />
              {col.id}
            </label>
          ))}
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={columns.map((col) => col.id)}>
            <table className="w-max border-separate border-spacing-y-3">
              <thead className="bg-white">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`${
                          enableDragging ? "" : "p-3"
                        } text-left font-semibold relative`}
                        style={{ width: header.getSize() }}
                      >
                        {enableDragging ? (
                          <DraggableHeader column={header.column}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </DraggableHeader>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                        {/* Div para arrastar e redimensionar */}
                        {header.column.getCanResize() && (
                          <div
                            onMouseDown={handleMouseDown(
                              header.getResizeHandler()
                            )}
                            onTouchStart={handleMouseDown(
                              header.getResizeHandler()
                            )}
                            className="absolute right-0 top-0 h-full w-3 cursor-ew-resize bg-gray-50"
                          ></div>
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
                      className={`rounded-[100px] shadow-md ${
                        row.getIsSelected() ? "bg-blue-100" : "bg-white"
                      }`}
                    >
                      {row.getVisibleCells().map((cell, index, array) => (
                        <td
                          key={cell.id}
                          className={`p-4 text-left ${
                            index === 0 ? "rounded-l-[100px]" : ""
                          } ${
                            index === array.length - 1
                              ? "rounded-r-[100px]"
                              : ""
                          }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>

      {/* Paginador */}
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

      {isResizing && <div className="fixed inset-0 cursor-ew-resize z-50" />}
    </div>
  );
}
