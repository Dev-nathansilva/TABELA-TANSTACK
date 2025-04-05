import React, { useState, useMemo, useRef } from "react";
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
import { useEffect } from "react";
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";

import {
  BsChevronExpand,
  BsFillCaretUpFill,
  BsFillCaretDownFill,
} from "react-icons/bs";
import { LuListFilter } from "react-icons/lu";
import { IoBrowsersOutline } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";

export default function App() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const isAnyStatusSelected = selectedStatus.length > 0;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [enableResizing, setEnableResizing] = useState(false);
  const [enableDragging, setEnableDragging] = useState(false);
  const filterRef = useRef(null);
  const [isFuncPopupOpen, setIsFuncPopupOpen] = useState(false);
  const funcPopupRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);

  const [columnSizes, setColumnSizes] = useState({});

  useEffect(() => {
    const updateSizes = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setColumnSizes({
          name: 100,
          cpf: 120,
          city: 100,
          status: 80,
          actions: 100,
        });
      } else if (width < 1550) {
        setColumnSizes({
          name: 250,
          cpf: 270,
          city: 240,
          status: 200,
          actions: 130,
        });
      } else {
        setColumnSizes({
          name: 480,
          cpf: 300,
          city: 300,
          status: 180,
          actions: 150,
        });
      }
    };

    updateSizes(); // chama uma vez ao montar
    window.addEventListener("resize", updateSizes); // escuta alterações
    return () => window.removeEventListener("resize", updateSizes); // limpa
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        funcPopupRef.current &&
        !funcPopupRef.current.contains(event.target)
      ) {
        setIsFuncPopupOpen(false);
      }
    }

    if (isFuncPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFuncPopupOpen]);

  // Fecha o popup se clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const [columnOrder, setColumnOrder] = useState([
    "select",
    "name",
    "cpf",
    "city",
    "status",
    "actions",
  ]);

  const columns = useMemo(() => {
    const baseColumns = [
      {
        id: "select",
        accessorKey: "⬜",
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
        size: 70,
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => {
              if (column.getIsSorted() === "desc") {
                column.clearSorting();
              } else {
                column.toggleSorting(column.getIsSorted() === "asc");
              }
            }}
          >
            Nome{" "}
            {column.getIsSorted() === "asc" ? (
              <BsFillCaretUpFill />
            ) : column.getIsSorted() === "desc" ? (
              <BsFillCaretDownFill />
            ) : (
              <BsChevronExpand />
            )}
          </button>
        ),
        enableSorting: true,
        enableResizing: true,
        size: columnSizes["name"] || 150,
      },
      {
        id: "cpf",
        accessorKey: "cpf",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => {
              if (column.getIsSorted() === "desc") {
                column.clearSorting();
              } else {
                column.toggleSorting(column.getIsSorted() === "asc");
              }
            }}
          >
            CPF / CNPJ{" "}
            {column.getIsSorted() === "asc" ? (
              <BsFillCaretUpFill />
            ) : column.getIsSorted() === "desc" ? (
              <BsFillCaretDownFill />
            ) : (
              <BsChevronExpand />
            )}
          </button>
        ),
        enableSorting: true,
        enableResizing: true,
        size: columnSizes["cpf"] || 150,
      },
      {
        id: "city",
        accessorKey: "city",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => {
              if (column.getIsSorted() === "desc") {
                column.clearSorting();
              } else {
                column.toggleSorting(column.getIsSorted() === "asc");
              }
            }}
          >
            Cidade{" "}
            {column.getIsSorted() === "asc" ? (
              <BsFillCaretUpFill />
            ) : column.getIsSorted() === "desc" ? (
              <BsFillCaretDownFill />
            ) : (
              <BsChevronExpand />
            )}
          </button>
        ),
        enableSorting: true,
        enableResizing: true,
        size: columnSizes["city"] || 150,
      },
      {
        id: "status",
        accessorKey: "status",
        header: () => (
          <div className="relative gap-3 flex items-center">
            <span>Status</span>
            <div
              className={`filter-icon p-1 rounded-[4px]  ${
                isAnyStatusSelected
                  ? "bg-blue-200"
                  : "bg-gray-100 hover:bg-gray-300"
              }`}
            >
              <LuListFilter
                className={`cursor-pointer ${
                  isAnyStatusSelected ? "text-blue-900" : "text-black"
                }`}
                onClick={() => setIsFilterOpen((prev) => !prev)}
              />
            </div>
            {isFilterOpen && (
              <div
                ref={filterRef}
                className="absolute top-9 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-4"
              >
                <h2 className="text-sm font-semibold mb-2">
                  Filtrar por Status
                </h2>
                <div className="flex flex-col gap-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedStatus.includes("Ativo")}
                      onChange={() => handleStatusChange("Ativo")}
                    />
                    Ativo
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedStatus.includes("Inativo")}
                      onChange={() => handleStatusChange("Inativo")}
                    />
                    Inativo
                  </label>
                </div>
              </div>
            )}
          </div>
        ),
        enableSorting: true,
        enableResizing: true,
        size: columnSizes["status"] || 150,
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
        size: columnSizes["actions"] || 150,
      },
    ];

    return columnOrder
      .map((colId) => baseColumns.find((col) => col.id === colId))
      .filter(Boolean);
  }, [
    columnOrder,
    enableResizing,
    selectedStatus,
    isFilterOpen,
    isAnyStatusSelected,
    columnSizes,
  ]);

  const onDragEnd = (event) => {
    if (!enableDragging) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setColumnOrder((prevOrder) => {
      const oldIndex = prevOrder.indexOf(active.id);
      const newIndex = prevOrder.indexOf(over.id);
      return arrayMove(prevOrder, oldIndex, newIndex);
    });
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(
      (prev) =>
        prev.includes(status)
          ? prev.filter((s) => s !== status) // remove
          : [...prev, status] // adiciona
    );
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
        className={`px-3 py-4  text-left font-semibold border border-gray-200  ${
          enableDragging ? "cursor-move" : "cursor-default"
        } bg-[#f9f9f9]`}
      >
        {enableDragging ? "⠿ " : ""} {column.columnDef?.accessorKey}
      </div>
    );
  }

  const filteredData = useMemo(() => {
    return selectedStatus.length > 0
      ? data.filter((row) => selectedStatus.includes(row.status))
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
    <div className="p-6 max-w-[80%] mx-auto bg-gray-50 rounded-lg shadow-lg relative">
      <div className="relative flex gap-3 items-center">
        {/* CAMPO DE PESQUISA */}
        <div className="w-[50%] flex items-center bg-white rounded-md shadow p-3">
          <FiSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full focus:outline-none"
          />
        </div>
        <button className="px-4 py-3 bg-black text-white rounded-md">
          Filtros
        </button>
        <button
          className="px-4 py-3 bg-black text-white rounded-md"
          onClick={() => setIsFuncPopupOpen((prev) => !prev)}
        >
          Funcionalidades
        </button>
      </div>

      <div className="mb-2 mr-4 flex items-center justify-end gap-2">
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

      {isFuncPopupOpen && (
        <div
          ref={funcPopupRef}
          className="absolute z-[1000] top-24 left-1/2 -translate-x-1/2 w-[500px] bg-white border border-gray-300 shadow-xl rounded-lg p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Funcionalidades</h2>
            <button onClick={() => setIsFuncPopupOpen(false)}>✖</button>
          </div>

          {/* Conteúdo de funcionalidades aqui */}
          <div className="flex flex-col gap-4">
            {/* Redimensionamento */}
            <div className="flex gap-2 items-center">
              <input
                className="switch"
                type="checkbox"
                checked={enableResizing}
                onChange={() => setEnableResizing((prev) => !prev)}
              />
              <span>Redimensionamento</span>
            </div>

            {/* Reordenação */}
            <div className="flex gap-2 items-center">
              <input
                className="switch"
                type="checkbox"
                checked={enableDragging}
                onChange={() => setEnableDragging((prev) => !prev)}
              />
              <span>Ativar Reordenação de Colunas</span>
            </div>

            {/* OCULTAR / EXIBIR */}
            <div className="relative inline-block">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-black text-white rounded-md"
              >
                Ocultar/Exibir Colunas <IoIosArrowForward />
              </button>

              {isOpen && (
                <div
                  ref={popupRef}
                  className="absolute z-[1000] mr-[-33px] right-0 top-0 w-64 bg-white border border-gray-300 shadow-lg rounded-md p-4"
                >
                  {/* Checkbox para selecionar/desmarcar todas as colunas */}
                  <label className="block font-medium mb-2">
                    <input
                      type="checkbox"
                      checked={Object.values(visibleColumns).every(Boolean)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const updatedColumns = {};
                        columns.forEach((col) => {
                          updatedColumns[col.id] = isChecked;
                        });
                        setVisibleColumns(updatedColumns);
                      }}
                      className="mr-2"
                    />
                    Selecionar/Desmarcar Tudo
                  </label>

                  {/* Checkboxes individuais para cada coluna */}
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contêiner de tabela com overflow-x-auto */}
      <div className="overflow-x-auto">
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={columns.map((col) => col.id)}>
            <table className=" table-fixed  border-separate border-spacing-y-3">
              <thead className="bg-white">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`${
                          enableDragging ? "" : "p-4"
                        } text-left font-semibold relative first:rounded-l-[10px] last:rounded-r-[10px]`}
                        style={{
                          minWidth: header.getSize(),
                          width: header.getSize(),
                          maxWidth: header.getSize(),
                        }}
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
                            className="absolute right-0 w-[3px] h-6 cursor-ew-resize bg-[#dcdcdc] rounded-4xl mr-1"
                            style={{
                              top: "50%",
                              transform: "translateY(-50%)",
                            }}
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
                      className={`rounded-[10px] shadow-xs  ${
                        row.getIsSelected()
                          ? "bg-blue-100"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      {row.getVisibleCells().map((cell, index, array) => (
                        <td
                          key={cell.id}
                          className={`p-4 text-left border border-gray-50 ${
                            index === 0 ? "rounded-l-[10px]" : ""
                          } ${
                            index === array.length - 1 ? "rounded-r-[10px]" : ""
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
        <span className="flex items-center gap-1.5 bg-gray-100 border border-gray-400 p-2 rounded-2xl">
          <IoBrowsersOutline />
          Total: {filteredData.length}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
            disabled={pagination.pageIndex === 0}
            className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
          >
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
          >
            <MdKeyboardArrowLeft />
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
                currentPage === page
                  ? "bg-black text-white"
                  : "bg-gray-100 border border-gray-300"
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
            <MdKeyboardArrowRight />
          </button>
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, pageIndex: totalPages - 1 }))
            }
            disabled={pagination.pageIndex === totalPages - 1}
            className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
          >
            <MdKeyboardDoubleArrowRight />
          </button>
        </div>
      </div>
      {isResizing && <div className="fixed inset-0 cursor-ew-resize z-50" />}
    </div>
  );
}
