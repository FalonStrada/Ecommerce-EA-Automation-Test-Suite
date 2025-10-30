import { JSONSchemaType } from 'ajv';

/**
 * JSON Schema definitions for API responses
 * Used for automated validation of API response structures
 */

// Product Schema
export interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: {
    usertype: {
      usertype: string;
    };
    category: string;
  };
}

export const productSchema: JSONSchemaType<Product> = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    price: { type: 'string' },
    brand: { type: 'string' },
    category: {
      type: 'object',
      properties: {
        usertype: {
          type: 'object',
          properties: {
            usertype: { type: 'string' }
          },
          required: ['usertype']
        },
        category: { type: 'string' }
      },
      required: ['usertype', 'category']
    }
  },
  required: ['id', 'name', 'price', 'brand', 'category']
};

// Products List Response Schema
export interface ProductsListResponse {
  responseCode: number;
  products: Product[];
}

export const productsListSchema: JSONSchemaType<ProductsListResponse> = {
  type: 'object',
  properties: {
    responseCode: { type: 'number' },
    products: {
      type: 'array',
      items: productSchema
    }
  },
  required: ['responseCode', 'products']
};

// Brand Schema
export interface Brand {
  id: number;
  brand: string;
}

export const brandSchema: JSONSchemaType<Brand> = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    brand: { type: 'string' }
  },
  required: ['id', 'brand']
};

// Brands List Response Schema
export interface BrandsListResponse {
  responseCode: number;
  brands: Brand[];
}

export const brandsListSchema: JSONSchemaType<BrandsListResponse> = {
  type: 'object',
  properties: {
    responseCode: { type: 'number' },
    brands: {
      type: 'array',
      items: brandSchema
    }
  },
  required: ['responseCode', 'brands']
};

// User Response Schema (for auth operations)
export interface UserResponse {
  responseCode: number;
  message: string;
}

export const userResponseSchema: JSONSchemaType<UserResponse> = {
  type: 'object',
  properties: {
    responseCode: { type: 'number' },
    message: { type: 'string' }
  },
  required: ['responseCode', 'message']
};

// User Detail Response Schema
export interface UserDetail {
  id: number;
  name: string;
  email: string;
  title: string;
  birth_day: string;
  birth_month: string;
  birth_year: string;
  first_name: string;
  last_name: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
}

export interface UserDetailResponse {
  responseCode: number;
  user: UserDetail;
}

export const userDetailSchema: JSONSchemaType<UserDetailResponse> = {
  type: 'object',
  properties: {
    responseCode: { type: 'number' },
    user: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        email: { type: 'string' },
        title: { type: 'string' },
        birth_day: { type: 'string' },
        birth_month: { type: 'string' },
        birth_year: { type: 'string' },
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        company: { type: 'string' },
        address1: { type: 'string' },
        address2: { type: 'string' },
        country: { type: 'string' },
        state: { type: 'string' },
        city: { type: 'string' },
        zipcode: { type: 'string' }
      },
      required: ['id', 'name', 'email', 'title', 'birth_day', 'birth_month', 'birth_year', 
                 'first_name', 'last_name', 'company', 'address1', 'address2', 
                 'country', 'state', 'city', 'zipcode']
    }
  },
  required: ['responseCode', 'user']
};

// Search Product Response Schema
export interface SearchProductResponse {
  responseCode: number;
  products: Product[];
}

export const searchProductSchema: JSONSchemaType<SearchProductResponse> = {
  type: 'object',
  properties: {
    responseCode: { type: 'number' },
    products: {
      type: 'array',
      items: productSchema
    }
  },
  required: ['responseCode', 'products']
};

// Error Response Schema
export interface ErrorResponse {
  responseCode: number;
  message: string;
}

export const errorResponseSchema: JSONSchemaType<ErrorResponse> = {
  type: 'object',
  properties: {
    responseCode: { type: 'number' },
    message: { type: 'string' }
  },
  required: ['responseCode', 'message']
};

// Generic API Response Schema (flexible)
export interface GenericAPIResponse {
  responseCode: number;
  message?: string;
  [key: string]: any;
}

export const genericAPIResponseSchema = {
  type: 'object',
  properties: {
    responseCode: { type: 'number' },
    message: { type: 'string', nullable: true }
  },
  required: ['responseCode'],
  additionalProperties: true
} as const;

/**
 * Schema Registry
 * Centralized access to all schemas
 */
export const SchemaRegistry = {
  product: productSchema,
  productsList: productsListSchema,
  brand: brandSchema,
  brandsList: brandsListSchema,
  userResponse: userResponseSchema,
  userDetail: userDetailSchema,
  searchProduct: searchProductSchema,
  error: errorResponseSchema,
  generic: genericAPIResponseSchema,
};

