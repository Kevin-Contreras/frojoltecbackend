import { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';

const RESULTADOS = ['hay_basura', 'no_hay_basura', 'no_pude_entrar'] as const;
type Resultado = (typeof RESULTADOS)[number];

const RESULTADO_ALIASES: Record<string, Resultado> = {
  hay_basura: 'hay_basura',
  'sí, hay basura': 'hay_basura',
  'si, hay basura': 'hay_basura',
  no_hay_basura: 'no_hay_basura',
  'no, no hay basura': 'no_hay_basura',
  no_pude_entrar: 'no_pude_entrar',
  'no pude entrar': 'no_pude_entrar',
};

const MAX_COMENTARIO = 2000;
const MAX_CONTACTO = 200;
const MAX_FOTO = 2_000_000;

function optionalText(value: unknown, max: number): { ok: true; value: string | null } | { ok: false } {
  if (value === undefined || value === null) return { ok: true, value: null };
  if (typeof value !== 'string') return { ok: false };
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  if (trimmed.length > max) return { ok: false };
  return { ok: true, value: trimmed };
}

function parseFechaVisita(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  const local = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  const match = iso
    ? { year: Number(iso[1]), month: Number(iso[2]), day: Number(iso[3]) }
    : local
      ? { year: Number(local[3]), month: Number(local[2]), day: Number(local[1]) }
      : null;
  if (!match) return null;
  const date = new Date(Date.UTC(match.year, match.month - 1, match.day));
  if (
    date.getUTCFullYear() !== match.year ||
    date.getUTCMonth() !== match.month - 1 ||
    date.getUTCDate() !== match.day
  ) {
    return null;
  }
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const visit = `${match.year}-${String(match.month).padStart(2, '0')}-${String(match.day).padStart(2, '0')}`;
  if (visit > today) return null;
  return date;
}

function validFoto(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') return null;
  const foto = value.trim();
  if (!foto || foto.length > MAX_FOTO) return null;
  if (/^https:\/\/\S+$/i.test(foto)) return foto;
  if (/^data:image\/(jpeg|jpg|png|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(foto)) {
    return foto.replace(/\s/g, '');
  }
  return null;
}

export const createReporte = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sitioId = typeof req.body?.sitioId === 'string' ? req.body.sitioId.trim() : '';
    const resultadoKey = typeof req.body?.resultado === 'string' ? req.body.resultado.trim().toLocaleLowerCase('es') : '';
    const resultado = RESULTADO_ALIASES[resultadoKey];
    const fechaVisita = parseFechaVisita(req.body?.fechaVisita);
    const comentario = optionalText(req.body?.comentario, MAX_COMENTARIO);
    const contacto = optionalText(req.body?.contacto, MAX_CONTACTO);
    const fotoProvided = req.body?.foto !== undefined && req.body?.foto !== null && req.body?.foto !== '';
    const foto = validFoto(req.body?.foto);

    if (!sitioId) {
      res.status(400).json({ success: false, message: 'Elige el lugar que visitaste' });
      return;
    }
    if (!resultado) {
      res.status(400).json({ success: false, message: 'Elige qué encontraste' });
      return;
    }
    if (!fechaVisita) {
      res.status(400).json({ success: false, message: 'Indica una fecha de visita válida' });
      return;
    }
    if (!comentario.ok) {
      res.status(400).json({ success: false, message: 'El comentario admite como máximo 2000 caracteres' });
      return;
    }
    if (!contacto.ok) {
      res.status(400).json({ success: false, message: 'El contacto admite como máximo 200 caracteres' });
      return;
    }
    if (fotoProvided && !foto) {
      res.status(400).json({ success: false, message: 'La foto debe ser una imagen en base64 o una URL https' });
      return;
    }

    const sitio = await prisma.sitio.findUnique({ where: { id: sitioId }, select: { id: true } });
    if (!sitio) {
      res.status(404).json({ success: false, message: 'Sitio no encontrado' });
      return;
    }

    const reporte = await prisma.reporte.create({
      data: {
        sitioId,
        resultado,
        fechaVisita,
        comentario: comentario.value,
        contacto: contacto.value,
        ...(foto ? { fotos: { create: { url: foto } } } : {}),
      },
      include: reporteInclude,
    });

    res.status(201).json({
      success: true,
      data: presentReporte(reporte),
    });
  } catch (error) {
    next(error);
  }
};

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

function presentReporte<T extends { fechaVisita: Date }>(reporte: T) {
  return {
    ...reporte,
    fechaVisita: reporte.fechaVisita.toISOString().slice(0, 10),
  };
}

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
      data: reportes.map(presentReporte),
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
      data: presentReporte(reporte),
    });
  } catch (error) {
    next(error);
  }
};
