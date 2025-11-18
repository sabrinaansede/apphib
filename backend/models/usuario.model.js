import mongoose from "mongoose";

const { Schema } = mongoose;

const usuarioSchema = new Schema({
  nombre: { 
    type: String, 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
  },
  password: { 
    type: String, 
    required: true,
  },
  telefono: { 
    type: String, 
  },
  tipoUsuario: { 
    type: String, 
    enum: ['padre', 'persona', 'local'], 
    default: 'persona' 
  },
}, { timestamps: true });

// Exportar modelo
const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario;
