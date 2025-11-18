// Importar routers
import usuarioRouter from './UsuarioRouter.js';
import lugarRouter from './lugar.router.js';
import resenaRouter from './resenas.router.js';

// Función para registrar todas las rutas
const routerAPI = (app) => {
  app.use('/api/usuarios', usuarioRouter);
  app.use('/api/lugares', lugarRouter);
  app.use('/api/resenas', resenaRouter);
};

export default routerAPI;
