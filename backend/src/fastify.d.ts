import 'fastify';
import { File } from './utils';

declare module 'fastify' {
  interface FastifySchema {
    produces?: string[]; // see https://github.com/fastify/fastify-swagger/issues/468
    files?: string[];
  }

  interface RouteGenericInterface {
    Files?: string[]
  }

  type MappedFiles<T extends string[]> = {
    [x in T[keyof T]]: File;
  };

  interface FastifyRequest<
    RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
  > {
    files: RouteGeneric['Files'] extends string[] ? MappedFiles<RouteGeneric['Files']> : (Partial<Record<string, File>> | null)
  }

  interface FastifyContext {
    schema?: FastifySchema;
  }
}
