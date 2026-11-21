import { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';

const RESULTADOS = ['hay_basura', 'no_hay_basura', 'no_pude_entrar'] as const;

const reporteInclude = {
  fotos: {
    orderBy: { creadoEn: 'desc' as const },
  },
  sitio: {
    select: {
      id: true,
      lugar: true,
      departamento: true,
    },
  },
};

export const getReportes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sitioId = typeof req.query.sitio_id === 'string' ? req.query.sitio_id : undefined;
    const resultado = typeof req.query.resultado === 'string' ? req.query.resultado : undefined;

    if (resultado && !RESULTADOS.includes(resultado as (typeof RESULTADOS)[number])) {
      res.status(400).json({
        success: false,
        message: 'resultado debe ser hay_basura, no_hay_basura o no_pude_entrar',
      });
      return;
    }

    const reportes = await prisma.reporte.findMany({
      where: {
        ...(sitioId && { sitioId }),
        ...(resultado && { resultado }),
      },
      include: reporteInclude,
      orderBy: { creadoEn: 'desc' },
    });

    res.json({
      success: true,
      data: reportes,
    });
  } catch (error) {
    next(error);
  }
};

export const getReporteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const reporte = await prisma.reporte.findUnique({
      where: { id },
      include: reporteInclude,
    });

    if (!reporte) {
      res.status(404).json({ success: false, message: 'Reporte no encontrado' });
      return;
    }

    res.json({
      success: true,
      data: reporte,
    });
  } catch (error) {
    next(error);
  }
};
