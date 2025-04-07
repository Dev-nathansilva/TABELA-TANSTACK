import React, { useEffect, useMemo, useState } from "react";
import CustomTable from "../components/CustomTable";
import {
  BsChevronExpand,
  BsFillCaretUpFill,
  BsFillCaretDownFill,
} from "react-icons/bs";
import { LuListFilter } from "react-icons/lu";
import { FiMail, FiEdit, FiTrash2 } from "react-icons/fi";
import usePopupManager from "../hooks/popupmanager";

export default function UsuariosTable() {
  const [enableResizing, setEnableResizing] = useState(false);
  const [columnSizes, setColumnSizes] = useState({});
  const [selectedStatus, setSelectedStatus] = useState([]);
  const isAnyStatusSelected = selectedStatus.length > 0;
  const popupKeys = ["filter"];
  const { popupStates, popupRefs, togglePopup } = usePopupManager(popupKeys);

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
          status: 180,
          actions: 130,
        });
      } else {
        setColumnSizes({
          name: 480,
          cpf: 300,
          city: 280,
          status: 180,
          actions: 150,
        });
      }
    };

    updateSizes(); // chama uma vez ao montar
    window.addEventListener("resize", updateSizes); // escuta alterações
    return () => window.removeEventListener("resize", updateSizes); // limpa
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

  const handleStatusChange = (status) => {
    setSelectedStatus(
      (prev) =>
        prev.includes(status)
          ? prev.filter((s) => s !== status) // remove
          : [...prev, status] // adiciona
    );
  };
  const [columnOrder, setColumnOrder] = useState([
    "select",
    "name",
    "cpf",
    "city",
    "status",
    "teste",
    "actions",
  ]);

  // Componente reutilizável para cabeçalhos ordenáveis
  function SortableHeaderButton({ label, column }) {
    return (
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
        {label}{" "}
        {column.getIsSorted() === "asc" ? (
          <BsFillCaretUpFill />
        ) : column.getIsSorted() === "desc" ? (
          <BsFillCaretDownFill />
        ) : (
          <BsChevronExpand />
        )}
      </button>
    );
  }

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
          <SortableHeaderButton label="Nome" column={column} />
        ),
        enableSorting: true,
        enableResizing: true,
        size: columnSizes["name"] || 150,
      },
      {
        id: "cpf",
        accessorKey: "cpf",
        header: ({ column }) => (
          <SortableHeaderButton label="CPF" column={column} />
        ),
        enableSorting: true,
        enableResizing: true,
        size: columnSizes["cpf"] || 150,
      },
      {
        id: "city",
        accessorKey: "city",
        header: ({ column }) => (
          <SortableHeaderButton label="Cidade" column={column} />
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
                onClick={() => togglePopup("filter")}
              />
            </div>
            {popupStates.filter && (
              <div
                ref={popupRefs.filter}
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
      {
        id: "teste",
        header: "Teste",
        accessorKey: "teste",
        enableHiding: true,
      },
    ];

    return columnOrder
      .map((colId) => baseColumns.find((col) => col.id === colId))
      .filter(Boolean);
  }, [
    columnOrder,
    enableResizing,
    selectedStatus,
    isAnyStatusSelected,
    columnSizes,
    popupRefs,
    popupStates,
    togglePopup,
  ]);

  const initiallyHiddenColumns = ["teste"];

  return (
    <div className="p-4">
      <CustomTable
        title="Lista de Usuários"
        data={data}
        columns={columns}
        setColumnOrder={setColumnOrder}
        enableResizing={enableResizing}
        setEnableResizing={setEnableResizing}
        selectedStatus={selectedStatus}
        initiallyHiddenColumns={initiallyHiddenColumns}
      />
    </div>
  );
}
