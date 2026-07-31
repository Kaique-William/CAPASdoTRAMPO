import { NextResponse } from "next/server";
import { connectMongo } from "../../lib/mongo";
import Reg from "../../model/reg";


// Constantes e helpers
const ESTILOS_VALIDOS = [1, 2];

function errorResponse(message, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

function isRegistroValido(registro) {
  const nome = registro?.nome?.trim();
  const codigo = registro?.codigo?.toString().trim();
  const estilo = Number(registro?.estilo);

  return Boolean(nome && codigo && ESTILOS_VALIDOS.includes(estilo));
}


// GET - Buscar registros
export async function GET() {
  try {
    await connectMongo();

    // Busca todos os registros sem os campos internos do Mongo
    const registros = await Reg.find({}, "-_id -__v");

    return NextResponse.json(registros, { status: 200 });

  } catch (error) {
    console.error("Erro no GET /api/registros:", error);
    return errorResponse("Erro ao buscar registros");
  }
}


// POST - Salvar registros em lote
export async function POST(req) {
  try {
    // Acorda o Mongo (e nem é o Kaique em)
    await connectMongo();

    const body = await req.json().catch(() => null);
    const registros = body?.registros;

    // Validação básica do payload
    if (!Array.isArray(registros) || registros.length === 0) {
      return errorResponse("Nenhum registro enviado!", 400);
    }

    // Validação de conteúdo obrigatório
    const possuiInvalido = registros.some(
      (registro) => !isRegistroValido(registro),
    );

    if (possuiInvalido) {
      return errorResponse("Nome, código e estilo são obrigatórios!", 400);
    }

    // Normaliza os valores para checagem de duplicidade
    const nomes = [...new Set(registros.map((r) => r.nome.trim()))];

    const codigos = [
      ...new Set(registros.map((r) => r.codigo.toString().trim())),
    ];

    // Verifica se já existe nome ou código cadastrado
    const existente = await Reg.findOne({
      $or: [{ nome: { $in: nomes } }, { codigo: { $in: codigos } }],
    });

    if (existente) {
      return errorResponse(
        `Já existe um registro com esse nome ou código.`,
        409,
      );
    }

    // Insere tudo de uma vez
    await Reg.insertMany(registros, { ordered: false });

    return NextResponse.json(
      { message: "Registros salvos com sucesso!" },
      { status: 200 },
    );

  } catch (error) {
    console.error("Erro no POST /api/registros:", error);

    // Caso de índice único no Mongo
    if (error?.code === 11000) {
      return errorResponse(
        "Já existe um registro com esse nome ou código.",
        409,
      );
    }

    return errorResponse("Erro interno do servidor");
  }
}


// PUT - Atualizar registro
export async function PUT(req) {
  try {
    await connectMongo();

    const body = await req.json().catch(() => null);
    const nome = body?.nome?.trim();
    const novoCodigo = body?.novoCodigo;
    const novoEstilo = body?.novoEstilo;

    if (!nome) {
      return errorResponse("Nome do registro é obrigatório!", 400);
    }

    // Monta o update só com os campos enviados
    const update = {};

    if (novoCodigo !== undefined && novoCodigo !== null && novoCodigo !== "") {
      update.codigo = novoCodigo;
    }

    if (novoEstilo !== undefined && novoEstilo !== null && novoEstilo !== "") {
      const estiloNumerico = Number(novoEstilo);

      if (!ESTILOS_VALIDOS.includes(estiloNumerico)) {
        return errorResponse("Estilo inválido! Use 1 ou 2.", 400);
      }

      update.estilo = estiloNumerico;
    }

    if (Object.keys(update).length === 0) {
      return errorResponse("Nenhum campo foi enviado para atualizar!", 400);
    }

    // Atualiza buscando pelo nome
    const resultado = await Reg.findOneAndUpdate(
      { nome },
      { $set: update },
      { new: true },
    );

    if (!resultado) {
      return errorResponse("Registro não encontrado!", 404);
    }

    return NextResponse.json(
      { message: `Registro '${nome}' atualizado com sucesso!` },
      { status: 200 },
    );
    
  } catch (error) {
    console.error("Erro no PUT /api/registros:", error);
    return errorResponse("Erro interno do servidor");
  }
}
