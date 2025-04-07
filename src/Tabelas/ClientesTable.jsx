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
import { useCallback } from "react";

export default function ClientesTable() {
  const [clientes, setClientes] = useState([]);
  const [enableResizing, setEnableResizing] = useState(false);
  const [columnSizes, setColumnSizes] = useState({});
  const [filters, setFilters] = useState({
    status: [],
    tipo: [],
  });
  const filterConfig = useMemo(
    () => [
      {
        key: "status",
        label: "Status",
        options: ["Ativo", "Inativo"],
      },
      {
        key: "Tipo",
        label: "Tipo",
        options: ["PessoaFisica", "PessoaJuridica", "Empresa"],
      },
    ],
    []
  );

  const toggleFilterValue = (filterKey, value) => {
    setFilters((prev) => {
      const current = prev[filterKey] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [filterKey]: updated };
    });
  };
  const popupKeys = filterConfig.map((f) => f.key);
  const { popupStates, popupRefs, togglePopup } = usePopupManager(popupKeys);

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

  const renderFilterHeader = useCallback(
    (key) => {
      const config = filterConfig.find((f) => f.key === key);
      const selected = filters[key] || [];
      const isSelected = selected.length > 0;

      return (
        <div className="relative gap-3 flex items-center">
          <span>{config.label}</span>
          <div
            className={`filter-icon p-1 rounded-[4px] ${
              isSelected ? "bg-blue-200" : "bg-gray-100 hover:bg-gray-300"
            }`}
          >
            <LuListFilter
              className={`cursor-pointer ${
                isSelected ? "text-blue-900" : "text-black"
              }`}
              onClick={() => togglePopup(key)}
            />
          </div>
          {popupStates[key] && (
            <div
              ref={popupRefs[key]}
              className="absolute top-9 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-4"
            >
              <h2 className="text-sm font-semibold mb-2">
                Filtrar por {config.label}
              </h2>
              <div className="flex flex-col gap-2 text-sm">
                {config.options.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(option)}
                      onChange={() => toggleFilterValue(key, option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    },
    [filters, popupStates, popupRefs, togglePopup, filterConfig]
  );

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

        enableSorting: true,
        enableResizing: true,
        size: columnSizes["CPF/CPNJ"] || 150,
      },
      // COLUNA TIPO
      {
        id: "Tipo",
        accessorKey: "Tipo",
        header: () => renderFilterHeader("Tipo"),
        enableSorting: true,
        enableResizing: true,
        size: columnSizes["Tipo"] || 150,
      },
      // COLUNA STATUS
      {
        id: "status",
        accessorKey: "status",
        header: () => renderFilterHeader("status"),
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
  }, [columnOrder, enableResizing, columnSizes, renderFilterHeader]);

  const initiallyHiddenColumns = [
    "Email",
    "Inscricao Estadual",
    "Data de Cadastro",
  ];

  const filteredClientes = useMemo(() => {
    return clientes.filter((cliente) => {
      return filterConfig.every(({ key }) => {
        const selectedValues = filters[key];
        return (
          !selectedValues ||
          selectedValues.length === 0 ||
          selectedValues.includes(cliente[key])
        );
      });
    });
  }, [clientes, filters, filterConfig]);

  return (
    <div>
      <CustomTable
        title="Lista de Clientes"
        data={filteredClientes}
        columns={columns}
        setColumnOrder={setColumnOrder}
        enableResizing={enableResizing}
        setEnableResizing={setEnableResizing}
        initiallyHiddenColumns={initiallyHiddenColumns}
      />
    </div>
  );
}
