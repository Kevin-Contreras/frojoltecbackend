import { Router } from 'express';
import healthRoutes from './health.routes';
import reporteRoutes from './reporte.routes';
import sitioRoutes from './sitio.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/sitios', sitioRoutes);
router.use('/reportes', reporteRoutes);

export default router;
