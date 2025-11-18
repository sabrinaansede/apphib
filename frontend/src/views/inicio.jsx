{vistaActiva === "inicio" && (
  <section
    id="inicio"
    className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-b from-blue-50 to-white"
  >
    {/* Título principal */}
    <h1 className="text-5xl font-bold mb-4 text-blue-700">
      🧩 Bienvenid@ a Lugares Seguros APADEA
    </h1>

    {/* Subtítulo */}
    <p className="text-lg text-gray-700 max-w-3xl mb-6">
      Descubrí lugares certificados por APADEA, agregá tus propios lugares desde la comunidad y ayudá a construir un mapa inclusivo y seguro para todos.
    </p>

    {/* Botones de acción rápidos */}
    <div className="flex flex-col sm:flex-row gap-4 mb-10">
      <button
        onClick={() => setVistaActiva("mapa")}
        className="bg-blue-700 text-white px-6 py-3 rounded shadow hover:bg-blue-600 transition"
      >
        Ver Mapa
      </button>
      <button
        onClick={() => setVistaActiva("agregar")}
        className="bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-500 transition"
      >
        Agregar Lugar
      </button>
    </div>

    {/* Destacados de lugares */}
    <h2 className="text-2xl font-semibold text-blue-600 mb-6">
      Algunos lugares destacados
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full px-4">
      {lugares.slice(0, 6).map((lugar) => (
        <div
          key={lugar._id}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-2">{lugar.nombre}</h3>
          <p className="text-gray-600 mb-1">{lugar.direccion}</p>
          <p className="text-sm text-gray-500 mb-1">
            Tipo: {lugar.tipo} | Provincia: {lugar.provincia}
          </p>
          <p className="text-sm text-gray-400">
            Certificado por: {lugar.certificadoPor}
          </p>
        </div>
      ))}
    </div>
  </section>
)}
