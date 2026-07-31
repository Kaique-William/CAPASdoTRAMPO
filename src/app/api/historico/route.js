import { NextResponse } from "next/server";
import { connectMongo } from "../../lib/mongo";
import Hist from "../../model/hist";

// Helpers
function getDataBrasilia() {
  // Bora marcar o horário direito, bagulho é horario de brasilia
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return formatter.format(now).replace("T", " ");
}

function errorResponse(message, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

// POST - Salvar histórico
export async function POST(req) {
  try {
    await connectMongo();

    // Aqui é onde o corpo da requisição chega pra chapar ou salvar em paz
    const data = await req.json().catch(() => null);

    if (!data) {
      return errorResponse("Dados inválidos!", 400);
    }

    const time = getDataBrasilia();

    const saveData = {
      tipo: data.tipo,
      itens: data.itens,
      data: time,
    };

    // Histórico vazio não existe
    if (!Array.isArray(saveData.itens) || saveData.itens.length === 0) {
      return errorResponse("Não é possível salvar um histórico vazio!", 400);
    }

    await Hist.create(saveData);

    return NextResponse.json(
      { message: "Registros salvos com sucesso!" },
      { status: 200 },
    );

  } catch (error) {
    console.error("Erro no POST /api/historico:", error);
    return errorResponse("Erro ao salvar histórico");
  }
}

// GET - Buscar histórico
export async function GET() {
  try {
    await connectMongo();

    // Buscando os registros sem os enfeites internos do Mongo
    const registros = await Hist.find({}, "-_id -__v");

    return NextResponse.json(registros, { status: 200 });

  } catch (error) {
    
    console.error("Erro no GET /api/historico:", error);
    return errorResponse("Erro ao buscar histórico");
  }
}
