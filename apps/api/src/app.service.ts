import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): string {
    return 'Selly Base API is running with full TypeORM entities and Companies API!';
  }
}
