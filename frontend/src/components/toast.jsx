// src/components/Toast.jsx
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Vote, X } from "lucide-react";

export default function Toast({ mensaje, tipo, onClose }) {
  const estilos = {
    ok: {
      bg: "bg-green-600",
      icon: <CheckCircle className="w-5 h-5 text-white" />,
    },
    error: {
      bg: "bg-red-600",
      icon: <XCircle className="w-5 h-5 text-white" />,
    },
    voto: {
      bg: "bg-blue-600",
      icon: <Vote className="w-5 h-5 text-white" />,
    },
  };

  const estilo = estilos[tipo] || estilos.ok;

  return (
    <AnimatePresence>
      {mensaje && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className={`${estilo.bg} fixed top-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium`}
        >
          <div className="animate-pop">{estilo.icon}</div>
          <span>{mensaje}</span>
          <button
            onClick={onClose}
            className="ml-2 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
