import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      // Use the datasource URL from the environment variable
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Disable binary targets that require native libraries
      // This is a workaround for environments where we can't install system dependencies
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    try {
      // Ensure the database file exists
      const dbPath = process.env.DATABASE_URL?.replace('file:', '').trim();
      if (dbPath && dbPath.startsWith('./')) {
        const absolutePath = path.join(process.cwd(), dbPath.substring(2));
        const directory = path.dirname(absolutePath);
        
        // Ensure directory exists
        if (!fs.existsSync(directory)) {
          this.logger.log(`Creating database directory: ${directory}`);
          fs.mkdirSync(directory, { recursive: true });
        }
        
        // Ensure file exists
        if (!fs.existsSync(absolutePath)) {
          this.logger.log(`Creating empty database file: ${absolutePath}`);
          fs.writeFileSync(absolutePath, '');
        }
        
        this.logger.log(`Using database at: ${absolutePath}`);
      }
      
      await this.$connect();
      this.logger.log('Successfully connected to the database');
    } catch (error) {
      this.logger.error('Failed to connect to the database', error);
      
      if (error.message && error.message.includes('Unable to open the database file')) {
        this.logger.error(
          'This appears to be an issue with the database file access. ' +
          'Please check file permissions and path correctness.'
        );
      } else if (error.message && error.message.includes('libssl')) {
        this.logger.error(
          'This appears to be an issue with missing system libraries. ' +
          'Since we cannot install system dependencies in this environment, ' +
          'consider using a different database connection method or hosting provider.'
        );
      }
      
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
} 