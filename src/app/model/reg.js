import mongoose from "mongoose";

const RegSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    unique: true,
  },
  codigo: {
    type: String,
    required: true,
    unique: true,
  },
  estilo: {
    type: Number,
    enum: [1, 2],
    required: false,
  }
});

export default mongoose.models.Reg ||
  mongoose.model("Reg", RegSchema);
