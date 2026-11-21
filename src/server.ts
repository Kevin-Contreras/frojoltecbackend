import app from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${config.port}`);
  console.log(`📋 Health check: http://localhost:${config.port}/health`);
  console.log(`👥 Usuarios API: http://localhost:${config.port}/users`);
});
