/**
 * API Configuration
 * Centraliza todos los endpoints y configuraciones de la API
 */

export const API_CONFIG = {
  // Base URLs por ambiente
  baseURL: process.env.API_BASE_URL || 'https://automationexercise.com/api',
  
  // Timeouts
  timeout: {
    default: 30000,
    long: 60000,
    short: 10000
  },

  // Headers comunes
  headers: {
    common: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    formData: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
};

/**
 * Endpoints de la API
 * Organizado por módulos de negocio
 */
export const ENDPOINTS = {
  // Productos
  products: {
    list: '/productsList',
    search: '/searchProduct',
    brands: '/brandsList'
  },

  // Autenticación y Usuarios
  auth: {
    login: '/verifyLogin',
    createAccount: '/createAccount',
    deleteAccount: '/deleteAccount',
    updateAccount: '/updateAccount',
    getUserDetail: '/getUserDetailByEmail'
  },

  // Otros endpoints según la API
  // Agrega aquí los que necesites
};

/**
 * Códigos de respuesta esperados
 */
export const RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
};

/**
 * Mensajes de respuesta esperados de la API
 */
export const RESPONSE_MESSAGES = {
  USER_EXISTS: 'User exists!',
  USER_CREATED: 'User created!',
  USER_DELETED: 'Account deleted!',
  USER_NOT_FOUND: 'User not found!',
  MISSING_PARAMETERS: 'Bad request, parameters missing!',
  INVALID_EMAIL_PASSWORD: 'User not found!'
};

/**
 * Helper para construir URLs completas
 */
export class APIEndpoints {
  private baseURL: string;

  constructor(baseURL: string = API_CONFIG.baseURL) {
    this.baseURL = baseURL;
  }

  /**
   * Construye URL completa para un endpoint
   */
  build(endpoint: string): string {
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Construye URL con parámetros de query
   */
  buildWithParams(endpoint: string, params: Record<string, string>): string {
    const url = new URL(this.build(endpoint));
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    return url.toString();
  }
}

/**
 * Configuración de reintentos para requests
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // ms
  retryOn: [500, 502, 503, 504] // Códigos de error para reintentar
};

/**
 * Validación de respuestas
 */
export const VALIDATION = {
  // Schemas JSON esperados (puedes usar con ajv o zod)
  schemas: {
    productsList: {
      type: 'object',
      required: ['responseCode', 'products'],
      properties: {
        responseCode: { type: 'number' },
        products: { type: 'array' }
      }
    },
    userResponse: {
      type: 'object',
      required: ['responseCode', 'message'],
      properties: {
        responseCode: { type: 'number' },
        message: { type: 'string' }
      }
    }
  }
};