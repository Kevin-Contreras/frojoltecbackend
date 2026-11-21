import { Router } from 'express';
import { getSitioById, getSitios, getSitiosResumen } from '../controllers/sitio.controller';

const router = Router();

router.get('/', getSitios);
router.get('/resumen', getSitiosResumen);
router.get('/:id', getSitioById);

export default router;
