// app/lib/hist.ts

export async function saveHist(data) {
  const response = await fetch("/api/historico", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao salvar histórico");
  }

  return response.json();
}