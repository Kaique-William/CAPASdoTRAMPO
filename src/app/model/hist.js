import mongoose from "mongoose";

const HistSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
  },

  itens: [
    {
      nome: {
        type: String,
        required: true,
      },

      codigo: {
        type: String,
        required: true,
      },

      vencimento: String,
      cheque: String,
      estilo: Number,
    },
  ],

  data: {
    type: String,
    required: true,
  },
});

export default mongoose.models.Hist ||
  mongoose.model("Hist", HistSchema);