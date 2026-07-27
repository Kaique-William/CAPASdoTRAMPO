"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import ModalSalvar from "./components/modalSalvar";
import ModalAdicionarCapas from "./components/modalAddCapas";

import { saveHist } from "../lib/hist";
import { api } from "@/app/lib/api";

import logo from "@/public/LogoPaz.jpeg";

export default function Page() {
  const [modalSalvarOpen, setModalSalvarOpen] = useState(false);
  const [modalUpdateOpen, setModalUpdateOpen] = useState(false);
  const [modalCapasOpen, setModalCapasOpen] = useState(false);

  const [filaCapas, setFilaCapas] = useState([]);
  const [layouts, setLayouts] = useState([]);

  const [form, setForm] = useState({
    nome: "",
    vencimento: "2001-09-11",
    cheque: "",
    codigo: "",
    estilo: 0,
  });

  function formatarDataBR(dataISO) {
    if (!dataISO || typeof dataISO !== "string") return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  async function carregarLayouts() {
    try {
      const response = await api.get("");
      const dados = response.data || [];

      const ordenados = [...dados]
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map((r, index) => ({
          id: index + 1,
          nome: r.nome,
          codigo: r.codigo,
          estilo: r.estilo,
        }));

      setLayouts(ordenados);
    } catch (error) {
      console.error("Erro ao carregar layouts:", error);
    }
  }

  useEffect(() => {
    carregarLayouts();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleNomeChange(e) {
    const valorDigitado = e.target.value;
    const layoutEncontrado = layouts.find((l) => l.nome === valorDigitado);

    setForm((prev) => ({
      ...prev,
      nome: valorDigitado,
      codigo: layoutEncontrado ? layoutEncontrado.codigo : prev.codigo,
      estilo: layoutEncontrado ? layoutEncontrado.estilo : prev.estilo,
    }));
  }

  function handleSave() {
    if (!form.nome) return;

    setFilaCapas((prev) => [
      ...prev,
      {
        ...form,
        id: Date.now(),
        estilo: Number(form.estilo),
      },
    ]);

    setForm((prev) => ({
      ...prev,
      nome: "",
      codigo: "",
    }));
  }

  function handleRemove(id) {
    setFilaCapas((prev) => prev.filter((c) => c.id !== id));
  }

  async function handlePrintScreen() {
    try {
      await saveHist({
        tipo: "IMPRESSAO",
        itens: filaCapas,
      });
    } catch (error) {
      console.error(error);
    }

    window.onafterprint = () => setFilaCapas([]);
    window.print();
  }

  return (
    <>
      {" "}
      <button className="fixed top-6 right-6 rounded-lg bg-slate-800 px-5 py-2.5 font-medium text-white shadow-lg transition-all hover:bg-slate-900 hover:shadow-xl active:scale-95 print:hidden">
        {" "}
        <Link href="/historico">Histórico</Link>{" "}
      </button>
      {/* FORMULÁRIO */}
      <div className="mx-auto max-w-3xl p-6 print:hidden">
        <div className="rounded-2xl border bg-white p-8 shadow-lg">
          <div className="mb-6 text-center">
            <Image src={logo} alt="logo" width={220} className="mx-auto mb-3" />
            <h1 className="text-2xl font-bold">Comprovante de Pagamento</h1>
            <p className="text-sm text-gray-500">
              Preencha os dados e adicione à fila de impressão
            </p>
          </div>

          <div className="mb-4">
            <input
              list="nomes-options"
              name="nome"
              value={form.nome}
              onChange={handleNomeChange}
              placeholder="Digite ou selecione..."
              className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
            />

            <datalist id="nomes-options">
              {layouts.map((l) => (
                <option key={l.id} value={l.nome} />
              ))}
            </datalist>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Vencimento
              </label>
              <input
                type="date"
                name="vencimento"
                value={form.vencimento}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Cheque
              </label>
              <input
                type="text"
                name="cheque"
                placeholder="Número do cheque"
                value={form.cheque}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Código
              </label>
              <input
                type="number"
                name="codigo"
                placeholder="Código"
                value={form.codigo}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 border-t pt-4">
            <button
              onClick={handleSave}
              className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
            >
              Salvar
            </button>

            <button
              onClick={handlePrintScreen}
              className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
              Imprimir
            </button>

            <button
              onClick={() => setModalSalvarOpen(true)}
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Novo registro
            </button>

            <button
              onClick={() => setModalUpdateOpen(true)}
              disabled={!form.nome}
              className="rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 disabled:opacity-40"
            >
              Atualizar registro
            </button>

            <button
              onClick={() => setModalCapasOpen(true)}
              className="rounded-md bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
            >
              Adicionar várias
            </button>
          </div>
        </div>
      </div>
      {/* ÁREA DE IMPRESSÃO */}
      <div className="hidden print:block">
        {filaCapas.map((capa) => (
          <div key={capa.id} className="capa print-page">
            <div className="logo-print">
              <Image src={logo} alt="logo" width={180} />
            </div>

            <h1 className="titulo-print">COMPROVANTE DE PAGAMENTO</h1>
            <p className="text-3xl text-center">
              {Number(capa.estilo) === 1 ? `ALUGUEL: ${capa.nome}` : capa.nome}
            </p>
            <p className="text-3xl text-center">
              VENC.: {formatarDataBR(capa.vencimento)}
            </p>
            <p className="text-3xl text-center">CHEQUE: {capa.cheque}</p>
            <p className="codigo-print">{capa.codigo}</p>
          </div>
        ))}
      </div>
      {/* LISTA DA FILA */}
      <div className="mx-auto mt-8 max-w-5xl print:hidden">
        <div className="rounded-2xl border bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold">Fila de capas</h2>

          {filaCapas.length === 0 && (
            <p className="text-gray-500">Nenhuma capa na fila</p>
          )}

          <ul className="space-y-2">
            {filaCapas.map((capa) => (
              <li
                key={capa.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div className="text-left">
                  <p className="font-semibold">{capa.nome}</p>
                  <p className="text-sm text-gray-600">
                    Venc.: {formatarDataBR(capa.vencimento)} | Cheque:{" "}
                    {capa.cheque} | Código: {capa.codigo}
                  </p>
                  <p className="text-sm text-gray-600">{capa.estilo}</p>
                </div>

                <button
                  onClick={() => handleRemove(capa.id)}
                  className="rounded bg-red-200 px-3 py-1 hover:bg-red-300"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ModalSalvar
        isOpen={modalSalvarOpen}
        onClose={() => setModalSalvarOpen(false)}
      />
      <ModalSalvar
        isOpen={modalUpdateOpen}
        onClose={() => setModalUpdateOpen(false)}
        onSaved={carregarLayouts}
        mode="update"
        registroInicial={{
          nome: form.nome,
          codigo: form.codigo,
        }}
      />
      <ModalAdicionarCapas
        isOpen={modalCapasOpen}
        onClose={() => setModalCapasOpen(false)}
        layouts={layouts}
        onAddCapas={(novas) =>
          setFilaCapas((prev) => [
            ...prev,
            ...novas.map((c) => ({ ...c, id: Date.now() + Math.random() })),
          ])
        }
      />
    </>
  );
}
