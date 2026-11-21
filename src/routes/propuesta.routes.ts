import { Router } from 'express';
import { createPropuesta, getPropuestas, likePropuesta } from '../controllers/propuesta.controller';

const router = Router();

router.get('/', getPropuestas);
router.post('/', createPropuesta);
router.post('/:id/me-gusta', likePropuesta);

export default router;
