import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';

const sitioInclude = {
  reportes: {
    orderBy: { creadoEn: 'desc' as const },
    include: {
      fotos: {
        orderBy: { creadoEn: 'desc' as const },
      },
    },
  },
};

type SitioRecord = Prisma.SitioGetPayload<{ include: typeof sitioInclude }>;

function decimal(value: Prisma.Decimal | null): number | null {
  return value === null ? null : value.toNumber();
}

function serializeSitio(sitio: SitioRecord) {
  return {
    id: sitio.id,
    gpwId: sitio.gpwId,
    lugar: sitio.lugar,
    departamento: sitio.departamento,
    longitud: decimal(sitio.longitud),
    latitud: decimal(sitio.latitud),
    distanciaAguaM: decimal(sitio.distanciaAguaM),
    tipoAguaCercana: sitio.tipoAguaCercana,
    poblacion1km: sitio.poblacion1km,
    poblacion5km: sitio.poblacion5km,
    elevacionM: decimal(sitio.elevacionM),
    pendienteGrados: decimal(sitio.pendienteGrados),
    tipo: sitio.tipo,
    verificadoEnCampo: sitio.verificadoEnCampo,
    licencia: sitio.licencia,
    fuentes: sitio.fuentes,
    reportes: sitio.reportes.map((reporte) => ({
      id: reporte.id,
      sitioId: reporte.sitioId,
      resultado: reporte.resultado,
      creadoEn: reporte.creadoEn,
      fotos: reporte.fotos.map((foto) => ({
        id: foto.id,
        reporteId: foto.reporteId,
        url: foto.url,
        creadoEn: foto.creadoEn,
      })),
    })),
  };
}

export const getSitiosMapa = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sitios = await prisma.sitio.findMany({
      select: {
        id: true,
        lugar: true,
        departamento: true,
        longitud: true,
        latitud: true,
        poblacion5km: true,
      },
      orderBy: { id: 'asc' },
    });

    res.json({
      success: true,
      data: sitios.map((sitio) => ({
        id: sitio.id,
        lugar: sitio.lugar,
        departamento: sitio.departamento,
        longitud: decimal(sitio.longitud),
        latitud: decimal(sitio.latitud),
        poblacion5km: sitio.poblacion5km,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getSitiosLista = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    const sitios = await prisma.sitio.findMany({
      where: q
        ? {
            OR: [
              { departamento: { contains: q, mode: 'insensitive' } },
              { lugar: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        id: true,
        lugar: true,
        departamento: true,
        longitud: true,
        latitud: true,
        distanciaAguaM: true,
        _count: { select: { reportes: true } },
      },
      orderBy: { id: 'asc' },
    });

    const data = sitios.map((sitio) => ({
      id: sitio.id,
      lugar: sitio.lugar,
      departamento: sitio.departamento,
      longitud: decimal(sitio.longitud),
      latitud: decimal(sitio.latitud),
      distanciaAguaM: decimal(sitio.distanciaAguaM),
      revisado: sitio._count.reportes > 0,
    }));

    res.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getSitios = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const departamento = typeof req.query.departamento === 'string' ? req.query.departamento : undefined;
    const tipoAguaCercana = typeof req.query.tipo_agua_cercana === 'string' ? req.query.tipo_agua_cercana : undefined;

    const sitios = await prisma.sitio.findMany({
      where: {
        ...(departamento && { departamento }),
        ...(tipoAguaCercana && { tipoAguaCercana }),
      },
      include: sitioInclude,
      orderBy: { id: 'asc' },
    });

    res.json({
      success: true,
      data: sitios.map(serializeSitio),
    });
  } catch (error) {
    next(error);
  }
};

export const getSitiosResumen = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [lugares, cercaDelAgua, revisadosEnPersona, porDepartamento, porAgua] = await Promise.all([
      prisma.sitio.count(),
      prisma.sitio.count({
        where: { distanciaAguaM: { lt: 500 } },
      }),
      prisma.sitio.count({
        where: { verificadoEnCampo: true },
      }),
      prisma.sitio.groupBy({
        by: ['departamento'],
        _count: { _all: true },
      }),
      prisma.sitio.groupBy({
        by: ['tipoAguaCercana'],
        _count: { _all: true },
        orderBy: { _count: { tipoAguaCercana: 'desc' } },
      }),
    ]);

    const departamentos = porDepartamento
      .map((row) => ({
        departamento: row.departamento,
        sitios: row._count._all,
      }))
      .sort((a, b) => b.sitios - a.sitios || a.departamento.localeCompare(b.departamento, 'es'));

    res.json({
      success: true,
      data: {
        lugares,
        departamentos: departamentos.length,
        cercaDelAgua,
        revisadosEnPersona,
        total: lugares,
        porDepartamento: departamentos,
        porTipoAguaCercana: porAgua.map((row) => ({
          tipoAguaCercana: row.tipoAguaCercana,
          sitios: row._count._all,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSitioById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const sitio = await prisma.sitio.findUnique({
      where: { id },
      include: sitioInclude,
    });

    if (!sitio) {
      res.status(404).json({ success: false, message: 'Sitio no encontrado' });
      return;
    }

    res.json({
      success: true,
      data: serializeSitio(sitio),
    });
  } catch (error) {
    next(error);
  }
};
