# 🚀 Frojoltec Backend (Express + TypeScript + Prisma + Vercel Postgres)

Backend RESTful construido con **Express.js**, **TypeScript** y **Prisma ORM**, configurado específicamente para desplegarse como **Serverless Functions en Vercel** conectado a **Vercel Postgres (Neon)**.

---

## 📁 Estructura del Proyecto

```text
frojoltecbackend/
├── api/
│   └── index.ts                 # Handler serverless para Vercel
├── prisma/
│   ├── schema.prisma            # Esquema de modelos de base de datos
│   └── seed.ts                  # Datos de prueba iniciales
├── src/
│   ├── app.ts                   # Configuración de Express, middlewares y rutas
│   ├── server.ts                # Servidor para desarrollo local
│   ├── config/                  # Variables de entorno y configuración
│   ├── controllers/             # Lógica de controladores (User, etc.)
│   ├── lib/
│   │   └── prisma.ts            # Instancia singleton de PrismaClient para Serverless
│   ├── middlewares/             # Manejadores de 404 y errores
│   └── routes/                  # Definición de endpoints (/health, /users)
├── .env.example                 # Plantilla de variables de entorno
├── tsconfig.json                # Configuración de TypeScript
└── vercel.json                  # Reglas de enrutamiento para Vercel
```

---

## 🛠️ Instalación y Desarrollo Local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` a partir de `.env.example`:
```bash
cp .env.example .env
```

### 3. Generar cliente de Prisma
```bash
npm run prisma:generate
```

### 4. Iniciar en modo desarrollo
```bash
npm run dev
```
El servidor arrancará en: `http://localhost:3000`

---

## 🗄️ Configuración de Vercel Postgres

1. Entra a tu dashboard de [Vercel](https://vercel.com).
2. Ve a la pestaña **Storage** y crea una base de datos **Postgres** (desarrollada por Neon).
3. Selecciona tu región preferida y crea la base de datos.
4. En la pestaña **.env.local** de tu base de datos en Vercel, copia los valores o vincula tu proyecto:
   - `POSTGRES_PRISMA_URL` (para transacciones y pooling)
   - `POSTGRES_URL_NON_POOLING` (para migraciones directas)
5. Pégalos en tu archivo local `.env`.
6. Aplica las tablas a tu base de datos remota:
   ```bash
   npm run prisma:push
   ```
7. *(Opcional)* Si quieres insertar datos de prueba iniciales:
   ```bash
   npm run prisma:seed
   ```
8. Puedes visualizar y editar tus datos con Prisma Studio:
   ```bash
   npm run prisma:studio
   ```

---

## ☁️ Despliegue en Vercel

### Opción A: Despliegue con Vercel CLI
1. Si no tienes Vercel CLI instalado:
   ```bash
   npm i -g vercel
   ```
2. Inicia sesión y vincula el proyecto:
   ```bash
   vercel
   ```
3. Vincula la base de datos Vercel Postgres a este proyecto desde el dashboard de Vercel:
   - Ve a tu proyecto en Vercel > **Storage** > **Connect Store** > selecciona tu Postgres.
   - Vercel inyectará automáticamente `POSTGRES_PRISMA_URL` y `POSTGRES_URL_NON_POOLING` en tus variables de entorno de producción.
4. Para desplegar a producción:
   ```bash
   vercel --prod
   ```

### Opción B: Despliegue desde GitHub / GitLab
1. Sube este repositorio a tu GitHub:
   ```bash
   git add .
   git commit -m "feat: initial backend setup"
   git push origin main
   ```
2. Importa el repositorio en [Vercel](https://vercel.com/new).
3. En la sección **Storage**, conecta tu base de datos **Postgres**.
4. Haz clic en **Deploy**. ¡Listo!

---

## 🌐 Endpoints Disponibles

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/` o `/api` | Mensaje de bienvenida y estado |
| `GET` | `/health` o `/api/health` | Estado del backend y ping a Postgres |
| `GET` | `/users` o `/api/users` | Listar todos los usuarios y sus posts |
| `GET` | `/users/:id` o `/api/users/:id` | Obtener usuario por ID |
| `POST` | `/users` o `/api/users` | Crear un usuario (`{ "email": "...", "name": "..." }`) |
| `PUT` | `/users/:id` o `/api/users/:id` | Actualizar un usuario |
| `DELETE` | `/users/:id` o `/api/users/:id` | Eliminar un usuario |
