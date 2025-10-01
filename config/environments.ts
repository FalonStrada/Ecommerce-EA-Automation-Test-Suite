export interface Environment {
  name: string;
  baseURL: string;
  timeout: number;
  retries: number;
  firefoxTimeout?: number; // Extra timeout for Firefox due to ads
}

export const environments: Record<string, Environment> = {
  dev: {
    name: 'Development',
    baseURL: 'https://dev.automationexercise.com',
    timeout: 30_000,
    retries: 1,
    firefoxTimeout: 45_000
  },
  staging: {
    name: 'Staging',
    baseURL: 'https://staging.automationexercise.com',
    timeout: 25_000,
    retries: 1,
    firefoxTimeout: 35_000
  },
  prod: {
    name: 'Production',
    baseURL: 'https://www.automationexercise.com',
    timeout: 20_000,
    retries: 0,
    firefoxTimeout: 30_000
  }
};

export function getEnvironment(): Environment {
  const env = process.env.TEST_ENV || 'prod';
  const environment = environments[env];
  
  if (!environment) {
    throw new Error(`Environment '${env}' not found. Available: ${Object.keys(environments).join(', ')}`);
  }
  
  return environment;
}
