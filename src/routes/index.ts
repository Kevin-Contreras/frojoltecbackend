import { Router } from 'express';
import comentarioRoutes from './comentario.routes';
import healthRoutes from './health.routes';
import propuestaRoutes from './propuesta.routes';
import reporteRoutes from './reporte.routes';
import seccionRoutes from './seccion.routes';
import sitioRoutes from './sitio.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/sitios', sitioRoutes);
router.use('/reportes', reporteRoutes);
router.use('/comentarios', comentarioRoutes);
router.use('/secciones', seccionRoutes);
router.use('/propuestas', propuestaRoutes);

export default router;
