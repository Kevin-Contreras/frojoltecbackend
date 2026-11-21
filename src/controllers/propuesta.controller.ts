import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';

const MAX_TEXTO = 250;

const propuestaSelect = {
  id: true,
  texto: true,
  meGusta: true,
  creadoEn: true,
  seccion: {
    select: {
      id: true,
      nombre: true,
    },
  },
} as const;

export const getSecciones = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const secciones = await prisma.seccion.findMany({
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true },
    });

    res.json({
      success: true,
      data: secciones,
    });
  } catch (error) {
    next(error);
  }
};

export const getPropuestas = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const propuestas = await prisma.propuesta.findMany({
      orderBy: { creadoEn: 'desc' },
      select: propuestaSelect,
    });

    res.json({
      success: true,
      data: propuestas,
    });
  } catch (error) {
    next(error);
  }
};

export const createPropuesta = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const texto = typeof req.body?.texto === 'string' ? req.body.texto.trim() : '';
    const seccionId = typeof req.body?.seccionId === 'string' ? req.body.seccionId.trim() : '';
    const categoria = typeof req.body?.categoria === 'string' ? req.body.categoria.trim() : '';

    if (!texto) {
      res.status(400).json({ success: false, message: 'La propuesta no puede estar vacía' });
      return;
    }

    if (texto.length > MAX_TEXTO) {
      res.status(400).json({ success: false, message: 'La propuesta admite como máximo 250 caracteres' });
      return;
    }

    if (!seccionId && !categoria) {
      res.status(400).json({ success: false, message: 'Elige una categoría' });
      return;
    }

    const seccion = await prisma.seccion.findFirst({
      where: seccionId ? { id: seccionId } : { nombre: categoria },
      select: { id: true },
    });

    if (!seccion) {
      res.status(400).json({ success: false, message: 'La categoría no existe' });
      return;
    }

    const propuesta = await prisma.propuesta.create({
      data: {
        texto,
        seccionId: seccion.id,
      },
      select: propuestaSelect,
    });

    res.status(201).json({
      success: true,
      data: propuesta,
    });
  } catch (error) {
    next(error);
  }
};

export const likePropuesta = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const propuesta = await prisma.propuesta.update({
      where: { id },
      data: { meGusta: { increment: 1 } },
      select: {
        id: true,
        meGusta: true,
      },
    });

    res.json({
      success: true,
      data: propuesta,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Propuesta no encontrada' });
      return;
    }
    next(error);
  }
};
