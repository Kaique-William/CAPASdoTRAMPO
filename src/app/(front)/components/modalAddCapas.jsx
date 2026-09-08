"use client";

import { useState } from "react";

const CAPA_VAZIA = {
  nome: "",
  vencimento: "2001-09-11",
  cheque: "",
  codigo: "",
  estilo: 0,
};

export default function ModalAdicionarCapas({
  isOpen,
  onClose,
  layouts,
  onAddCapas,
}) {

  const [capas, setCapas] = useState([CAPA_VAZIA]);

  if (!isOpen) return null;

  function handleChange(index, field, value) {
    setCapas((prev) =>
      prev.map((capa, i) => (i === index ? { ...capa, [field]: value } : capa)),
    );
  }

  function handleSelectNome(index, nome) {
    // Aqui o nome escolhido puxa o restante da ficha
    const layout = layouts.find((l) => l.nome === nome);

    setCapas((prev) =>
      prev.map((capa, i) =>
        i === index
          ? {
              ...capa,
              nome,
              codigo: layout ? layout.codigo : "",
              estilo: layout ? layout.estilo : capa.estilo,
            }
          : capa,
      ),
    );
  }

  function addLinha() {
    // Mais uma linha pra fila crescer
    setCapas((prev) => [...prev, CAPA_VAZIA]);
  }

  function removeLinha(index) {
    // Tirar a linha errada antes que ela vá pro baile
    setCapas((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddFila() {
    const validas = capas.filter((capa) => capa.nome && capa.codigo);

    if (!validas.length) return;

    const comId = validas.map((capa) => ({
      ...capa,
      id: Date.now() + Math.random(),
    }));

    onAddCapas(comId);
    setCapas([CAPA_VAZIA]);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-xl bg-gray-50 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Adicionar capas à fila{" "}
        </h3>

        <div className="flex flex-col gap-3">
          {capas.map((capa, index) => (
            <div
              key={index}
              className="grid grid-cols-[1.2fr_140px_1fr_120px_90px_40px] items-center gap-3"
            >
              <select
                value={capa.nome}
                onChange={(e) => handleSelectNome(index, e.target.value)}
                className="rounded-md border border-gray-300 px-2 py-2"
              >
                <option value="">Nome</option>
                {layouts.map((l) => (
                  <option key={l.id} value={l.nome}>
                    {l.nome}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={capa.vencimento}
                onChange={(e) =>
                  handleChange(index, "vencimento", e.target.value)
                }
                className="rounded-md border border-gray-300 px-2 py-2"
              />

              <input
                type="text"
                placeholder="Cheque"
                value={capa.cheque}
                onChange={(e) => handleChange(index, "cheque", e.target.value)}
                className="rounded-md border border-gray-300 px-2 py-2"
              />

              <input
                type="number"
                placeholder="Código"
                value={capa.codigo}
                onChange={(e) => handleChange(index, "codigo", e.target.value)}
                className="rounded-md border border-gray-300 px-2 py-2"
              />

              <span className="text-sm text-gray-500">
                Estilo {capa.estilo}
              </span>

              {capas.length > 1 && (
                <button
                  onClick={() => removeLinha(index)}
                  className="flex h-9 w-9 items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600"
                  type="button"
                >
                  –
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addLinha}
          className="mt-4 rounded-md bg-emerald-500 px-3 py-2 text-sm text-white hover:bg-emerald-600"
          type="button"
        >
          + Nova capa
        </button>
        
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleAddFila}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            type="button"
          >
            Adicionar à fila
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
