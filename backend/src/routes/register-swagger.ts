import { FastifyInstance, FastifySchema } from 'fastify';
import FastifySwagger from 'fastify-swagger';
import { JSONSchema7 } from 'json-schema';
import { Type } from '@sinclair/typebox';

export default function registerSwagger(server: FastifyInstance) {
  server.register(FastifySwagger, {
    routePrefix: '/docs',
    exposeRoute: true,
    openapi: {
      info: {
        version: process.env.npm_package_version ?? 'unknown',
        license: {
          name: 'MIT',
          url: 'https://github.com/szczurzy-torpedowiec/greatest/blob/main/LICENSE',
        },
        title: 'Greatest',
        contact: {
          name: 'Dominik Korsa',
          url: 'https://github.com/szczurzy-torpedowiec',
          email: 'dominik.korsa@gmail.com',
        },
      },
      tags: [
        {
          name: 'internal',
          description: 'These endpoints don\'t accept x-api-token header authorization and have CORS enabled',
        },
      ],
      components: {
        securitySchemes: {
          apiTokenHeader: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-token',
          },
          sessionCookie: {
            type: 'apiKey',
            in: 'cookie',
            name: 'session',
          },
        },
      },
    },
    transform: (schema: FastifySchema = {}): FastifySchema | undefined => {
      let newBody: JSONSchema7 | undefined;
      if (typeof schema.body === 'object' && schema.body !== null) {
        newBody = { ...schema.body };
      }
      if (schema.files !== undefined) {
        if (newBody === undefined) newBody = Type.Object({});
        const newProperties = Object.fromEntries(schema.files.map(
          (fieldName) => [fieldName, Type.String({ format: 'binary' })],
        ));
        newBody.properties = {
          ...newBody.properties,
          ...newProperties,
        };
        newBody.required = [
          ...newBody.required ?? [],
          ...schema.files,
        ];
      }
      return {
        consumes: ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'],
        ...schema,
        body: newBody,
      };
    },
  });
}
