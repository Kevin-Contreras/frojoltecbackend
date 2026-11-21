import { Router } from 'express';
import { getSitioById, getSitios, getSitiosLista, getSitiosMapa, getSitiosResumen } from '../controllers/sitio.controller';

const router = Router();

router.get('/', getSitios);
router.get('/mapa', getSitiosMapa);
router.get('/lista', getSitiosLista);
router.get('/resumen', getSitiosResumen);
router.get('/:id', getSitioById);

export default router;
