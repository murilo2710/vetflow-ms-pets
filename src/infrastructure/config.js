// Configuração por variáveis de ambiente.
export function loadConfig(env = process.env) {
  const config = {
    serviceName: 'vetflow-ms-pets',
    port: Number(env.PORT || 3001),
    nodeEnv: env.NODE_ENV || 'development',
    mongoUri: env.MONGODB_URI || '',
    mongoDb: env.MONGODB_DB || 'vetflow_prontuario',
    corsOrigin: env.CORS_ORIGIN || '*'
  };
  config.dbMode = config.mongoUri ? 'mongo' : 'memory';

  // Em produção o serviço não sobe sem banco real: evita demonstrar "na nuvem" com dados em memória.
  if (config.nodeEnv === 'production' && config.dbMode !== 'mongo') {
    throw new Error('MONGODB_URI é obrigatório quando NODE_ENV=production');
  }
  return config;
}
