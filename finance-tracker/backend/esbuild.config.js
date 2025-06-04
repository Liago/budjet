// esbuild configuration for Netlify Functions
const esbuild = require('esbuild');

const externalModules = [
  '@nestjs/microservices',
  '@nestjs/websockets',
  '@nestjs/websockets/socket-module',
  '@nestjs/microservices/microservices-module',
  '@nestjs/platform-fastify',
  '@nestjs/platform-socket.io',
  '@nestjs/platform-ws',
  'class-transformer/storage',
  'cache-manager',
  'ioredis',
  'redis',
  'sqlite3',
  'mysql2',
  'mysql',
  'pg-native',
  'tedious',
  'oracledb',
  'better-sqlite3'
];

module.exports = {
  bundle: true,
  minify: true,
  platform: 'node',
  target: 'node18',
  external: externalModules,
  format: 'cjs',
  sourcemap: false,
  metafile: false,
  logLevel: 'error'
};
