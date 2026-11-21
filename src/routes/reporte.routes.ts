import { Router } from 'express';
import { createReporte, getReporteById, getReportes } from '../controllers/reporte.controller';

const router = Router();

router.get('/', getReportes);
router.post('/', createReporte);
router.get('/:id', getReporteById);

export default router;
