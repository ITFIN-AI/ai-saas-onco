import { ApiRoute } from 'modules/api/infra/routes/types';
import {
  errorResponseSchema,
  failResponseSchema,
  successResponseSchema,
} from 'shared/core/ApiResponse';
import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { OpenAPIObject } from 'openapi3-ts/src/model/openapi30';
import { API_HOST } from '@akademiasaas/shared';

export default class OpenApi {
  private readonly openApiRegistry = new OpenAPIRegistry();
  private readonly auth = this.openApiRegistry.registerComponent('securitySchemes', 'Bearer', {
    type: 'apiKey',
    in: 'header',
    name: 'Authorization',
    description: 'Token with the `Bearer `&nbsp;prefix, e.g. `Bearer eyJhbGciOiJIUzI1...`',
  });
  private document: OpenAPIObject | null = null;

  getDocument(): OpenAPIObject {
    if (!this.document) {
      this.document = this.generateDocument();
    }

    return this.document;
  }

  registerPath(prefix: string, route: ApiRoute) {
    const { method, path } = route;
    const openApiPath = path.replace(/\/:(\w+)(\/|$)/g, '/{$1}$2');

    this.openApiRegistry.registerPath({
      method,
      summary: route.name,
      description: route.description,
      security: [{ [this.auth.name]: [] }],
      path: `${prefix}${openApiPath}`,
      request: {
        body: route.schema.request.shape.body
          ? {
              content: {
                'application/json': {
                  schema: route.schema.request.shape.body,
                },
              },
            }
          : undefined,
        params: route.schema.request.shape.params,
        query: route.schema.request.shape.query,
      },
      responses: {
        '2XX': {
          description: 'Success',
          content: {
            'application/json': {
              schema: successResponseSchema(route.schema.response),
            },
          },
        },
        '4XX': {
          description: 'Client Error',
          content: {
            'application/json': {
              schema: failResponseSchema,
            },
          },
        },
        '5XX': {
          description: 'Internal Error',
          content: {
            'application/json': {
              schema: errorResponseSchema,
            },
          },
        },
      },
    });
  }

  private generateDocument() {
    const generator = new OpenApiGeneratorV3(this.openApiRegistry.definitions);

    return generator.generateDocument({
      openapi: '3.0.0',
      info: {
        title: 'API',
        version: '1.0.0',
      },
      servers: [
        {
          description: 'API',
          url: API_HOST,
        },
      ],
    });
  }
}

export const typeDefinitions = {
  isoDateTime: {
    description: 'ISO 8601, time is optional.',
    format: 'date-time',
    example: new Date().toISOString(),
  },

  productId: {
    example: 'prod_J1j2k3l4m5n6o7p8',
  },

  priceId: {
    example: 'price_J1j2k3l4m5n6o7p8',
  },

  email: {
    example: 'john.doe@example.com',
  },

  firstName: {
    example: 'John',
  },

  lastName: {
    example: 'Doe',
  },

  phoneNumber: {
    example: '123456789',
  },
};
