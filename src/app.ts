import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { notFoundHandler } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

// Middlewares globales de seguridad y utilidades
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Ruta base
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '🚀 API Backend de Frojoltec en Vercel',
    status: 'online',
    endpoints: {
      health: '/health (o /api/health)',
      users: '/users (o /api/users)',
      sitios: '/sitios (o /api/sitios)',
      sitiosMapa: '/sitios/mapa (o /api/sitios/mapa)',
      sitiosResumen: '/sitios/resumen (o /api/sitios/resumen)',
      reportes: '/reportes (o /api/reportes)',
      comentarios: '/comentarios (o /api/comentarios)',
    },
  });
});

// Registrar rutas con y sin prefijo /api para compatibilidad en Vercel y local
app.use('/api', routes);
app.use('/', routes);

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
