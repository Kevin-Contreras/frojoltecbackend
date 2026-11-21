import { Router } from 'express';
import { getReporteById, getReportes } from '../controllers/reporte.controller';

const router = Router();

router.get('/', getReportes);
router.get('/:id', getReporteById);

export default router;
