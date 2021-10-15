import 'fastify';
import { File } from './utils';

declare module 'fastify' {
  interface FastifySchema {
    produces?: readonly string[]; // see https://github.com/fastify/fastify-swagger/issues/468
    files?: readonly string[];
  }

  interface RouteGenericInterface {
    Files?: string[]
  }

  type MappedFiles<T extends readonly string[]> = {
    [x in T[keyof T]]: File;
  };

  interface FastifyRequest<
    RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
  > {
    files: RouteGeneric['Files'] extends readonly string[] ? MappedFiles<RouteGeneric['Files']> : (Partial<Record<string, File>> | null)
  }

  interface FastifyContext {
    schema?: FastifySchema;
  }
}
