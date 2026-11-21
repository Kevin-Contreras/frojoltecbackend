import { Router } from 'express';
import { getSecciones } from '../controllers/propuesta.controller';

const router = Router();

router.get('/', getSecciones);

export default router;
