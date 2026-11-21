import app from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${config.port}`);
  console.log(`📋 Health check: http://localhost:${config.port}/health`);
  console.log(`👥 Usuarios API: http://localhost:${config.port}/users`);
  console.log(`📍 Sitios API: http://localhost:${config.port}/sitios`);
  console.log(`📝 Reportes API: http://localhost:${config.port}/reportes`);
  console.log(`💬 Comentarios API: http://localhost:${config.port}/comentarios`);
});
