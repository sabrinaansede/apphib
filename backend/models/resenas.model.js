
import mongoose from "mongoose";
const { Schema } = mongoose;

const resenaSchema = new Schema({
  lugar: { type: Schema.Types.ObjectId, ref: "Lugar", required: true },
  usuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
  puntuacion: { type: Number, required: true, min: 0, max: 5 },
  comentario: { type: String },
  fotoUrl: { type: String },
  creadoEn: { type: Date, default: Date.now }
});

export default mongoose.model("Resena", resenaSchema);
