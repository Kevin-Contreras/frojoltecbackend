import { Router } from 'express';
import comentarioRoutes from './comentario.routes';
import healthRoutes from './health.routes';
import reporteRoutes from './reporte.routes';
import sitioRoutes from './sitio.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/sitios', sitioRoutes);
router.use('/reportes', reporteRoutes);
router.use('/comentarios', comentarioRoutes);

export default router;
