import { Router } from 'express';
import { createComentario, getComentarios } from '../controllers/comentario.controller';

const router = Router();

router.get('/', getComentarios);
router.post('/', createComentario);

export default router;
