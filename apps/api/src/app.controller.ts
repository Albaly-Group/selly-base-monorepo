import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): string {
    return this.appService.getHealth();
  }

  @Get('companies')
  getCompanies() {
    return this.appService.getCompanies();
  }
}
