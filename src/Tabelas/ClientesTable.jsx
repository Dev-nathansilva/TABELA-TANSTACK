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

export default function ClientesTable() {
  const [clientes, setClientes] = useState([]);
  const [enableResizing, setEnableResizing] = useState(false);
  const [columnSizes, setColumnSizes] = useState({});
  const [selectedStatus, setSelectedStatus] = useState([]);
  const isAnyStatusSelected = selectedStatus.length > 0;
  const popupKeys = ["filter", "tipo"];
  const { popupStates, popupRefs, togglePopup } = usePopupManager(popupKeys);

  const [selectedTipos, setSelectedTipos] = useState([]);
  const isAnyTipoSelected = selectedTipos.length > 0;

  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    const updateSizes = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setColumnSizes({
          Nome: 100,
          "CPF/CPNJ": 120,
          Tipo: 100,
          status: 80,
          ações: 100,
        });
      } else if (width < 1550) {
        setColumnSizes({
          Nome: 250,
          "CPF/CPNJ": 200,
          Tipo: 230,
          status: 180,
          ações: 130,
        });
      } else {
        setColumnSizes({
          Nome: 360,
          "CPF/CPNJ": 300,
          Tipo: 280,
          status: 180,
          ações: 150,
        });
      }
    };

    updateSizes(); // chama uma vez ao montar
    window.addEventListener("resize", updateSizes); // escuta alterações
    return () => window.removeEventListener("resize", updateSizes); // limpa
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/clientes");
        const data = await response.json();
        const mappedData = data.map((cliente) => ({
          id: cliente.id,
          Nome: cliente.nome,
          "CPF/CPNJ": cliente.documento,
          Tipo: cliente.tipo,
          status: cliente.status,
          teste: "",
          Email: cliente.email,
          "Inscricao Estadual": cliente.inscricaoEstadual,
          "Data de Cadastro": formatarData(cliente.dataCadastro),
        }));
        setClientes(mappedData);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      }
    };

    fetchData();
  }, []);

  const handleTipoChange = (tipo) => {
    setSelectedTipos((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(
      (prev) =>
        prev.includes(status)
          ? prev.filter((s) => s !== status) // remove
          : [...prev, status] // adiciona
    );
  };
  const [columnOrder, setColumnOrder] = useState([
    "Selecionar",
    "Nome",
    "Tipo",
    "CPF/CPNJ",
    "status",
    "Email",
    "Inscricao Estadual",
    "Data de Cadastro",
    "ações",
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
      // COLUNA SELECIONAR
      {
        id: "Selecionar",
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
      // COLUNA NOME
      {
        id: "Nome",
        accessorKey: "Nome",
        header: ({ column }) => (
          <SortableHeaderButton label="Nome" column={column} />
        ),
        enableSorting: true,
        enableResizing: true,
        size: columnSizes["Nome"] || 150,
      },
      // COLUNA CPF/CPNJ
      {
        id: "CPF/CPNJ",
        accessorKey: "CPF/CPNJ",
        header: ({ column }) => (
          <SortableHeaderButton label="CPF/CPNJ" column={column} />
        ),
        enableSorting: true,
        enableResizing: true,
        size: columnSizes["CPF/CPNJ"] || 150,
      },
      // COLUNA TIPO
      {
        id: "Tipo",
        accessorKey: "Tipo",
        header: () => (
          <div className="relative gap-3 flex items-center">
            <span>Tipo</span>
            <div
              className={`filter-icon p-1 rounded-[4px]  ${
                isAnyTipoSelected
                  ? "bg-blue-200"
                  : "bg-gray-100 hover:bg-gray-300"
              }`}
            >
              <LuListFilter
                className={`cursor-pointer ${
                  isAnyTipoSelected ? "text-blue-900" : "text-black"
                }`}
                onClick={() => togglePopup("tipo")}
              />
            </div>
            {popupStates.tipo && (
              <div
                ref={popupRefs.tipo}
                className="absolute top-9 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-4"
              >
                <h2 className="text-sm font-semibold mb-2">Filtrar por Tipo</h2>
                <div className="flex flex-col gap-2 text-sm">
                  {["PessoaFisica", "PessoaJuridica", "Empresa"].map((tipo) => (
                    <label key={tipo} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTipos.includes(tipo)}
                        onChange={() => handleTipoChange(tipo)}
                      />
                      {tipo}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ),
        enableSorting: true,
        enableResizing: true,
        size: columnSizes["Tipo"] || 150,
      },
      // COLUNA STATUS
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
      // COLUNA AÇÕES
      {
        id: "ações",
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
        size: columnSizes["ações"] || 150,
      },
      // COLUNA EMAIL
      {
        id: "Email",
        header: "Email",
        accessorKey: "Email",
        enableHiding: true,
        size: 320,
      },
      // COLUNA INSCRIÇÃO ESTADUAL
      {
        id: "Inscricao Estadual",
        header: "Inscricao Estadual",
        accessorKey: "Inscricao Estadual",
        enableHiding: true,
        size: 200,
      },
      // COLUNA EMAIL
      {
        id: "Data de Cadastro",
        header: "Data de Cadastro",
        accessorKey: "Data de Cadastro",
        enableHiding: true,
        size: 200,
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
    isAnyTipoSelected,
    selectedTipos,
  ]);

  const initiallyHiddenColumns = [
    "Email",
    "Inscricao Estadual",
    "Data de Cadastro",
  ];

  const filteredClientes = useMemo(() => {
    return clientes.filter((cliente) => {
      const statusMatch =
        selectedStatus.length === 0 || selectedStatus.includes(cliente.status);
      const tipoMatch =
        selectedTipos.length === 0 || selectedTipos.includes(cliente.Tipo);
      return statusMatch && tipoMatch;
    });
  }, [clientes, selectedStatus, selectedTipos]);

  return (
    <div>
      <CustomTable
        title="Lista de Clientes"
        data={filteredClientes}
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
