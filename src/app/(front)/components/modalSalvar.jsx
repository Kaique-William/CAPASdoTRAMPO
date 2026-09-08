"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Swal from "sweetalert2";

// Caminho offline pra testes
// import { db } from "@/app/lib/api"

import { api } from "@/app/lib/api";

const LINHA_VAZIA = {
  nome: "",
  codigo: "",
  estilo: 1,
};

export default function ModalSalvar({
  isOpen,
  onClose,
  onSaved,
  mode = "create",
  registroInicial = null,
}) {
  const [linhas, setLinhas] = useState([LINHA_VAZIA]);

  useEffect(() => {
    if (!isOpen) return;

    // Quando abre o modal, ele já vem arrumadinho pra não deixar lixo antigo passeando por aí
    if (mode === "update" && registroInicial) {
      setLinhas([
        {
          nome: registroInicial.nome,
          codigo: registroInicial.codigo || "",
          estilo: 1,
        },
      ]);
      return;
    }

    // Modo create: sempre começa limpinho
    setLinhas([LINHA_VAZIA]);

  }, [isOpen, mode, registroInicial]);

  if (!isOpen) return null;

  function handleChange(index, field, value) {
    setLinhas((prev) =>
      prev.map((linha, i) =>
        i === index ? { ...linha, [field]: value } : linha,
      ),
    );
  }

  function addLinha() {
    setLinhas((prev) => [...prev, LINHA_VAZIA]);
  }

  function removeLinha(index) {
    setLinhas((prev) => prev.filter((_, i) => i !== index));
  }

  function getMensagemErro(err, fallback) {
    return (
      err?.response?.data?.message ||
      err?.response?.data ||
      err?.message ||
      fallback
    );
  }

  async function handleSave() {
    try {
      if (mode === "create") {
        const validas = linhas.filter(
          (linha) => linha.nome.trim() && linha.codigo.toString().trim(),
        );

        if (validas.length === 0) {
          Swal.fire({
            icon: "warning",
            title: "Nada para salvar",
            text: "Preenche pelo menos uma linha direito aí, meu nobre.",
          });
          return;
        }

        // ===== Caminho online =====
        await api.post("", {
          registros: validas.map((linha) => ({
            nome: linha.nome.trim(),
            codigo: linha.codigo.toString().trim(),
            estilo: Number(linha.estilo),
          })),
        });

        /* ===== Caminho offline =====
    // Aqui entra a versão local depois, sem mexer na lógica visual
    // await db.layouts.bulkAdd(validas)
    */

        Swal.fire({
          icon: "success",
          title: "Salvo com sucesso!",
          text: "Os registros foram cadastrados.",
          timer: 1500,
          showConfirmButton: false,
        });

        onSaved?.();
        onClose();
        return;
      }

      if (mode === "update") {
        const { nome, codigo } = linhas[0] || {};

        if (!codigo?.toString().trim()) {
          Swal.fire({
            icon: "warning",
            title: "Código vazio",
            text: "Não dá pra atualizar com código em branco, né parceiro.",
          });
          return;
        }

        /* ===== Caminho offline =====
    // const registro = await db.layouts
    //   .where("nome")
    //   .equals(nome)
    //   .first()
    //
    // if (!registro) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "Não encontrado",
    //     text: "Registro não encontrado no banco local",
    //   })
    //   return
    // }
    //
    // await db.layouts.update(registro.id, { codigo })
    */

        // ===== Caminho online =====
        await api.put("", {
          nome,
          novoCodigo: codigo.toString().trim(),
        });

        Swal.fire({
          icon: "success",
          title: "Código atualizado!",
          text: `Novo código salvo para ${nome}`,
          timer: 1500,
          showConfirmButton: false,
        });

        onSaved?.();
        onClose();
      }

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Erro",
        text: getMensagemErro(err, "Erro inesperado ao salvar no servidor"),
      });
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-gray-50 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          {mode === "create"
            ? "Salvar nomes e códigos"
            : "Atualizar código"}{" "}
        </h3>

        <div className="flex flex-col gap-4">
          {linhas.map((linha, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_160px_120px_40px] items-center gap-3"
            >
              <input
                type="text"
                placeholder="Nome"
                value={linha.nome}
                disabled={mode === "update"}
                onChange={(e) => handleChange(index, "nome", e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2"
              />

              <input
                type="number"
                placeholder={mode === "update" ? "Novo código" : "Código"}
                value={linha.codigo}
                onChange={(e) => handleChange(index, "codigo", e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2"
              />

              <select
                value={linha.estilo}
                onChange={(e) =>
                  handleChange(index, "estilo", Number(e.target.value))
                }
                className="rounded-md border border-gray-300 px-2 py-2"
              >
                <option value={1}>Estilo 1</option>
                <option value={2}>Estilo 2</option>
              </select>

              {mode === "create" && linhas.length > 1 && (
                <button
                  onClick={() => removeLinha(index)}
                  className="rounded-md bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                  title="Remover linha"
                  type="button"
                >
                  -
                </button>
              )}
            </div>
          ))}
        </div>

        {mode === "create" && (
          <button
            onClick={addLinha}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-sm text-white hover:bg-emerald-600"
            type="button"
          >
            <Plus size={16} />
            Adicionar linha
          </button>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleSave}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            type="button"
          >
            {mode === "create" ? "Salvar tudo" : "Atualizar"}
          </button>

          <button
            onClick={onClose}
            className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
            type="button"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
