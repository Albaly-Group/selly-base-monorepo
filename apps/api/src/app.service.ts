import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): string {
    return 'Selly Base API is running!';
  }

  getCompanies() {
    return {
      message: 'Companies endpoint - ready for implementation',
      data: [
        {
          id: '1',
          displayName: 'Sample Company',
          registrationId: 'REG123',
          dataSource: 'albaly_list',
          isSharedData: true,
        }
      ]
    };
  }
}
