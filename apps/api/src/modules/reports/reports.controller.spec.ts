import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  let reportsService: ReportsService;

  const mockReportsService = {
    getDashboardAnalytics: jest.fn(),
    getDataQualityMetrics: jest.fn(),
    getUserActivityReports: jest.fn(),
    getExportHistoryReports: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    reportsService = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboardAnalytics', () => {
    it('should return dashboard analytics with all metrics', async () => {
      const mockAnalytics = {
        totalCompanies: 100,
        totalLists: 10,
        totalExports: 5,
        totalImports: 3,
        activeUsers: 20,
        dataQualityScore: 0.85,
        monthlyGrowth: {
          companies: 10,
          exports: 2,
          users: 5,
        },
        recentActivity: [
          {
            type: 'company_created',
            description: 'New company added',
            timestamp: new Date(),
          },
        ],
      };

      mockReportsService.getDashboardAnalytics.mockResolvedValue(
        mockAnalytics,
      );

      const result = await controller.getDashboardAnalytics();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalCompanies');
      expect(result).toHaveProperty('totalLists');
      expect(result).toHaveProperty('totalExports');
      expect(result).toHaveProperty('totalImports');
      expect(result).toHaveProperty('activeUsers');
      expect(result).toHaveProperty('dataQualityScore');
      expect(result).toHaveProperty('monthlyGrowth');
      expect(result).toHaveProperty('recentActivity');

      expect(typeof result.totalCompanies).toBe('number');
      expect(typeof result.dataQualityScore).toBe('number');
      expect(Array.isArray(result.recentActivity)).toBe(true);
    });

    it('should return monthly growth data', async () => {
      const mockAnalytics = {
        totalCompanies: 100,
        totalLists: 10,
        monthlyGrowth: {
          companies: 10,
          exports: 2,
          users: 5,
        },
        recentActivity: [],
      };

      mockReportsService.getDashboardAnalytics.mockResolvedValue(
        mockAnalytics,
      );

      const result = await controller.getDashboardAnalytics();

      expect(result.monthlyGrowth).toBeDefined();
      expect(result.monthlyGrowth).toHaveProperty('companies');
      expect(result.monthlyGrowth).toHaveProperty('exports');
      expect(result.monthlyGrowth).toHaveProperty('users');
    });

    it('should return recent activity list', async () => {
      const mockAnalytics = {
        totalCompanies: 100,
        recentActivity: [
          {
            type: 'company_created',
            description: 'New company added',
            timestamp: new Date(),
          },
        ],
      };

      mockReportsService.getDashboardAnalytics.mockResolvedValue(
        mockAnalytics,
      );

      const result = await controller.getDashboardAnalytics();

      expect(Array.isArray(result.recentActivity)).toBe(true);
      if (result.recentActivity.length > 0) {
        const activity = result.recentActivity[0];
        expect(activity).toHaveProperty('type');
        expect(activity).toHaveProperty('description');
        expect(activity).toHaveProperty('timestamp');
      }
    });
  });

  describe('getDataQualityMetrics', () => {
    it('should return data quality metrics', async () => {
      const mockMetrics = {
        overallScore: 0.85,
        metrics: {
          completeness: 0.9,
          accuracy: 0.85,
          consistency: 0.8,
          timeliness: 0.85,
        },
        issues: [],
        trends: {
          thisMonth: 0.85,
          lastMonth: 0.80,
          improvement: 0.05,
        },
      };

      mockReportsService.getDataQualityMetrics.mockResolvedValue(mockMetrics);

      const result = await controller.getDataQualityMetrics();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('trends');

      expect(typeof result.overallScore).toBe('number');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(1);
    });

    it('should return quality metrics breakdown', async () => {
      const mockMetrics = {
        overallScore: 0.85,
        metrics: {
          completeness: 0.9,
          accuracy: 0.85,
          consistency: 0.8,
          timeliness: 0.85,
        },
        issues: [],
        trends: {},
      };

      mockReportsService.getDataQualityMetrics.mockResolvedValue(mockMetrics);

      const result = await controller.getDataQualityMetrics();

      expect(result.metrics).toBeDefined();
      expect(result.metrics).toHaveProperty('completeness');
      expect(result.metrics).toHaveProperty('accuracy');
      expect(result.metrics).toHaveProperty('consistency');
      expect(result.metrics).toHaveProperty('timeliness');
    });

    it('should return quality issues list', async () => {
      const mockMetrics = {
        overallScore: 0.85,
        metrics: {},
        issues: [
          {
            field: 'email',
            count: 5,
            severity: 'high',
          },
        ],
        trends: {},
      };

      mockReportsService.getDataQualityMetrics.mockResolvedValue(mockMetrics);

      const result = await controller.getDataQualityMetrics();

      expect(Array.isArray(result.issues)).toBe(true);
      if (result.issues.length > 0) {
        const issue = result.issues[0];
        expect(issue).toHaveProperty('field');
        expect(issue).toHaveProperty('count');
        expect(issue).toHaveProperty('severity');
      }
    });

    it('should return trend data', async () => {
      const mockMetrics = {
        overallScore: 0.85,
        metrics: {},
        issues: [],
        trends: {
          thisMonth: 0.85,
          lastMonth: 0.80,
          improvement: 0.05,
        },
      };

      mockReportsService.getDataQualityMetrics.mockResolvedValue(mockMetrics);

      const result = await controller.getDataQualityMetrics();

      expect(result.trends).toBeDefined();
      expect(result.trends).toHaveProperty('thisMonth');
      expect(result.trends).toHaveProperty('lastMonth');
      expect(result.trends).toHaveProperty('improvement');
    });
  });

  describe('getUserActivityReports', () => {
    it('should return user activity reports', async () => {
      const mockReports = {
        period: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
        totalSessions: 100,
        uniqueUsers: 20,
        topActions: [],
        userBreakdown: [],
      };

      mockReportsService.getUserActivityReports.mockResolvedValue(mockReports);

      const result = await controller.getUserActivityReports();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('totalSessions');
      expect(result).toHaveProperty('uniqueUsers');
      expect(result).toHaveProperty('topActions');
      expect(result).toHaveProperty('userBreakdown');
    });

    it('should accept custom date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const mockReports = {
        period: { startDate, endDate },
        totalSessions: 100,
        uniqueUsers: 20,
        topActions: [],
        userBreakdown: [],
      };

      mockReportsService.getUserActivityReports.mockResolvedValue(mockReports);

      const result = await controller.getUserActivityReports(
        startDate,
        endDate,
      );

      expect(result.period.startDate).toBe(startDate);
      expect(result.period.endDate).toBe(endDate);
    });

    it('should return top actions list', async () => {
      const mockReports = {
        period: {},
        totalSessions: 100,
        uniqueUsers: 20,
        topActions: [
          {
            action: 'login',
            count: 50,
          },
        ],
        userBreakdown: [],
      };

      mockReportsService.getUserActivityReports.mockResolvedValue(mockReports);

      const result = await controller.getUserActivityReports();

      expect(Array.isArray(result.topActions)).toBe(true);
      if (result.topActions.length > 0) {
        const action = result.topActions[0];
        expect(action).toHaveProperty('action');
        expect(action).toHaveProperty('count');
      }
    });

    it('should return user breakdown', async () => {
      const mockReports = {
        period: {},
        totalSessions: 100,
        uniqueUsers: 20,
        topActions: [],
        userBreakdown: [
          {
            user: 'John Doe',
            sessions: 10,
            actions: 50,
          },
        ],
      };

      mockReportsService.getUserActivityReports.mockResolvedValue(mockReports);

      const result = await controller.getUserActivityReports();

      expect(Array.isArray(result.userBreakdown)).toBe(true);
      if (result.userBreakdown.length > 0) {
        const user = result.userBreakdown[0];
        expect(user).toHaveProperty('user');
        expect(user).toHaveProperty('sessions');
        expect(user).toHaveProperty('actions');
      }
    });
  });

  describe('getExportHistoryReports', () => {
    it('should return export history reports', async () => {
      const mockReports = {
        period: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
        totalExports: 50,
        totalRecords: 1000,
        formatBreakdown: {
          csv: 30,
          excel: 15,
          json: 5,
        },
        statusBreakdown: {
          completed: 45,
          processing: 3,
          failed: 2,
        },
        topExporters: [],
      };

      mockReportsService.getExportHistoryReports.mockResolvedValue(
        mockReports,
      );

      const result = await controller.getExportHistoryReports();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('totalExports');
      expect(result).toHaveProperty('totalRecords');
      expect(result).toHaveProperty('formatBreakdown');
      expect(result).toHaveProperty('statusBreakdown');
      expect(result).toHaveProperty('topExporters');
    });

    it('should accept custom date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const mockReports = {
        period: { startDate, endDate },
        totalExports: 50,
        totalRecords: 1000,
        formatBreakdown: {},
        statusBreakdown: {},
        topExporters: [],
      };

      mockReportsService.getExportHistoryReports.mockResolvedValue(
        mockReports,
      );

      const result = await controller.getExportHistoryReports(
        startDate,
        endDate,
      );

      expect(result.period.startDate).toBe(startDate);
      expect(result.period.endDate).toBe(endDate);
    });

    it('should return format breakdown', async () => {
      const mockReports = {
        period: {},
        totalExports: 50,
        totalRecords: 1000,
        formatBreakdown: {
          csv: 30,
          excel: 15,
          json: 5,
        },
        statusBreakdown: {},
        topExporters: [],
      };

      mockReportsService.getExportHistoryReports.mockResolvedValue(
        mockReports,
      );

      const result = await controller.getExportHistoryReports();

      expect(result.formatBreakdown).toBeDefined();
      expect(result.formatBreakdown).toHaveProperty('csv');
      expect(result.formatBreakdown).toHaveProperty('excel');
      expect(result.formatBreakdown).toHaveProperty('json');
    });

    it('should return status breakdown', async () => {
      const mockReports = {
        period: {},
        totalExports: 50,
        totalRecords: 1000,
        formatBreakdown: {},
        statusBreakdown: {
          completed: 45,
          processing: 3,
          failed: 2,
        },
        topExporters: [],
      };

      mockReportsService.getExportHistoryReports.mockResolvedValue(
        mockReports,
      );

      const result = await controller.getExportHistoryReports();

      expect(result.statusBreakdown).toBeDefined();
      expect(result.statusBreakdown).toHaveProperty('completed');
      expect(result.statusBreakdown).toHaveProperty('processing');
      expect(result.statusBreakdown).toHaveProperty('failed');
    });

    it('should return top exporters list', async () => {
      const mockReports = {
        period: {},
        totalExports: 50,
        totalRecords: 1000,
        formatBreakdown: {},
        statusBreakdown: {},
        topExporters: [
          {
            user: 'John Doe',
            exports: 10,
          },
        ],
      };

      mockReportsService.getExportHistoryReports.mockResolvedValue(
        mockReports,
      );

      const result = await controller.getExportHistoryReports();

      expect(Array.isArray(result.topExporters)).toBe(true);
      if (result.topExporters.length > 0) {
        const exporter = result.topExporters[0];
        expect(exporter).toHaveProperty('user');
        expect(exporter).toHaveProperty('exports');
      }
    });
  });
});
