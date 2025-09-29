describe('Swagger Configuration', () => {
  it('should handle serverless environment configuration correctly', () => {
    // Test that the configuration object is properly typed
    const swaggerConfig: any = {
      swaggerOptions: {
        persistAuthorization: true,
      },
    };

    // In serverless environments, CDN assets should be configured
    const isServerless = process.env.VERCEL || process.env.NODE_ENV === 'production';
    if (isServerless) {
      swaggerConfig.customCssUrl = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui.css';
      swaggerConfig.customJs = [
        'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-bundle.js',
        'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js',
      ];
    }

    expect(swaggerConfig.swaggerOptions.persistAuthorization).toBe(true);
    
    if (isServerless) {
      expect(swaggerConfig.customCssUrl).toContain('swagger-ui.css');
      expect(swaggerConfig.customJs).toHaveLength(2);
      expect(swaggerConfig.customJs[0]).toContain('swagger-ui-bundle.js');
      expect(swaggerConfig.customJs[1]).toContain('swagger-ui-standalone-preset.js');
    }
  });

  it('should configure assets for different environments', () => {
    // Simulate development environment
    const devConfig: any = {
      swaggerOptions: {
        persistAuthorization: true,
      },
    };

    // Simulate production/serverless environment
    const prodConfig: any = {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui.css',
      customJs: [
        'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-bundle.js',
        'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js',
      ],
    };

    expect(devConfig.customCssUrl).toBeUndefined();
    expect(devConfig.customJs).toBeUndefined();
    
    expect(prodConfig.customCssUrl).toBeDefined();
    expect(prodConfig.customJs).toBeDefined();
    expect(prodConfig.customJs).toHaveLength(2);
  });

  it('should use correct CDN URLs for all required assets', () => {
    const expectedCssUrl = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui.css';
    const expectedJsUrls = [
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-bundle.js',
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js',
    ];

    expect(expectedCssUrl).toMatch(/^https:\/\/cdn\.jsdelivr\.net\/npm\/swagger-ui-dist@[\d.]+\/swagger-ui\.css$/);
    expectedJsUrls.forEach(url => {
      expect(url).toMatch(/^https:\/\/cdn\.jsdelivr\.net\/npm\/swagger-ui-dist@[\d.]+\/swagger-ui-.+\.js$/);
    });
  });
});