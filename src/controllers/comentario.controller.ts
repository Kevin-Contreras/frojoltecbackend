import { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';

const MAX_TEXTO = 200;

export const getComentarios = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comentarios = await prisma.comentario.findMany({
      orderBy: { creadoEn: 'desc' },
      select: {
        id: true,
        texto: true,
        creadoEn: true,
      },
    });

    res.json({
      success: true,
      data: comentarios,
    });
  } catch (error) {
    next(error);
  }
};

export const createComentario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const texto = typeof req.body?.texto === 'string' ? req.body.texto.trim() : '';

    if (!texto) {
      res.status(400).json({ success: false, message: 'El comentario no puede estar vacío' });
      return;
    }

    if (texto.length > MAX_TEXTO) {
      res.status(400).json({ success: false, message: 'El comentario admite como máximo 200 caracteres' });
      return;
    }

    const comentario = await prisma.comentario.create({
      data: { texto },
      select: {
        id: true,
        texto: true,
        creadoEn: true,
      },
    });

    res.status(201).json({
      success: true,
      data: comentario,
    });
  } catch (error) {
    next(error);
  }
};
