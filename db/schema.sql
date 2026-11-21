-- GPW Guatemala sitios
-- Source: gpw_guatemala_sitios(1).geojson
-- One row per point. Coordinates are stored as numbers, without PostGIS.

CREATE TABLE sitios (
    id                   text PRIMARY KEY,
    gpw_id               text NOT NULL UNIQUE,
    lugar                text NOT NULL,
    departamento         text NOT NULL,
    longitud             numeric NOT NULL,
    latitud              numeric NOT NULL,
    distancia_agua_m     numeric,
    tipo_agua_cercana    text NOT NULL,
    poblacion_1km        integer NOT NULL,
    poblacion_5km        integer NOT NULL,
    elevacion_m          numeric NOT NULL,
    pendiente_grados     numeric,
    tipo                 text NOT NULL,
    verificado_en_campo  boolean NOT NULL,
    licencia             text NOT NULL,
    fuentes              text NOT NULL,

    CONSTRAINT sitios_longitud_rango
        CHECK (longitud BETWEEN -180 AND 180),
    CONSTRAINT sitios_latitud_rango
        CHECK (latitud BETWEEN -90 AND 90),
    CONSTRAINT sitios_tipo_agua_cercana_valida
        CHECK (tipo_agua_cercana IN (
            'river',
            'stream',
            'pond',
            'ditch',
            'water',
            'coastline',
            '-1'
        ))
);

COMMENT ON TABLE sitios IS
    'Sitios de detección satelital de Global Plastic Watch en Guatemala.';

COMMENT ON COLUMN sitios.id IS
    'Identificador del archivo, por ejemplo GPW-GT-001.';
COMMENT ON COLUMN sitios.gpw_id IS
    'Identificador hex de Global Plastic Watch.';
COMMENT ON COLUMN sitios.longitud IS
    'Longitud WGS84, primera coordenada del GeoJSON.';
COMMENT ON COLUMN sitios.latitud IS
    'Latitud WGS84, segunda coordenada del GeoJSON.';
COMMENT ON COLUMN sitios.distancia_agua_m IS
    'Distancia al agua más cercana, en metros. NULL cuando el archivo no trae distancia.';
COMMENT ON COLUMN sitios.tipo_agua_cercana IS
    'Tipo de agua cercana. -1 significa desconocido y se conserva tal cual.';
COMMENT ON COLUMN sitios.fuentes IS
    'Lista de fuentes separadas por punto y coma, guardada como un solo texto.';

-- Field reports from "Contar lo que vi", step 1.
-- A site can have many reports. The place name stays on sitios.

CREATE TABLE reportes (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sitio_id    text NOT NULL REFERENCES sitios (id),
    resultado   text NOT NULL,
    creado_en   timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT reportes_resultado_valido
        CHECK (resultado IN (
            'hay_basura',
            'no_hay_basura',
            'no_pude_entrar'
        ))
);

CREATE INDEX reportes_sitio_id_idx ON reportes (sitio_id);

COMMENT ON TABLE reportes IS
    'Reportes anónimos de una visita a un sitio. Varios reportes pueden apuntar al mismo sitio.';
COMMENT ON COLUMN reportes.sitio_id IS
    'Sitio que estaba abierto en el formulario.';
COMMENT ON COLUMN reportes.resultado IS
    'hay_basura, no_hay_basura o no_pude_entrar.';

CREATE TABLE fotos (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reporte_id  uuid NOT NULL REFERENCES reportes (id) ON DELETE CASCADE,
    url         text NOT NULL,
    creado_en   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX fotos_reporte_id_idx ON fotos (reporte_id);

COMMENT ON TABLE fotos IS
    'Fotos de un reporte. El archivo vive fuera de Postgres; aquí solo se guarda la URL.';
COMMENT ON COLUMN fotos.url IS
    'Dirección del archivo en el almacenamiento de objetos.';
