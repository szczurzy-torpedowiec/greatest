import { FastifyInstance } from 'fastify';
import FastifyHttpProxy from 'fastify-http-proxy';
import FastifyStatic from 'fastify-static';
import type { ConstraintStrategy, Handler, HTTPVersion } from 'find-my-way';
import fse from 'fs-extra';
import path from 'path';
import { config } from '../config';

export function getProxyConstraint(name: string, ignored: string[]) {
  const constraint: ConstraintStrategy<HTTPVersion.V1, boolean> = {
    name,
    deriveConstraint: (req) => ignored.some(
      (ignoredPrefix) => req.url?.startsWith(ignoredPrefix) ?? false,
    ),
    validate: () => true,
    storage: () => {
      let storeData = new Map<boolean, Handler<HTTPVersion.V1>>();
      return {
        get: (key) => storeData.get(key) ?? null,
        set: (key, store) => { storeData.set(key, store); },
        del: (key) => { storeData.delete(key); },
        empty: () => { storeData = new Map(); },
      };
    },
  };
  return constraint;
}

export async function WebsitePlugin(websiteInstance: FastifyInstance, opts: {
  constraintName: string;
}) {
  websiteInstance.log.info(`Running in ${config.development ? 'development' : 'production'} mode`);
  if (config.development) {
    websiteInstance.register(FastifyHttpProxy, {
      upstream: 'http://docker-host',
      constraints: {
        [opts.constraintName]: false,
      },
    });
  } else {
    const root = '/data/website';
    websiteInstance.register(FastifyStatic, {
      root,
      serve: false,
    });
    const serveDir = async (dir: string) => {
      const result = await fse.readdir(path.join(root, dir), {
        withFileTypes: true,
      });
      await Promise.all(result.map(async (x) => {
        if (x.isDirectory()) await serveDir(path.join(dir, x.name));
        else {
          const filePath = path.join(dir, x.name);
          websiteInstance.log.debug(`Website serving ${filePath}`);
          websiteInstance.get(`/${filePath}`, (request, reply) => {
            reply.sendFile(filePath);
          });
        }
      }));
    };
    await serveDir('');
    websiteInstance.get('/*', {
      constraints: {
        [opts.constraintName]: false,
      },
    }, (request, reply) => {
      reply.sendFile('index.html');
    });
  }
}
