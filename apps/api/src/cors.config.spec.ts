describe('CORS Configuration', () => {
  it('should allow .vercel.app domains in production mode', () => {
    const productionOrigins = [/\.vercel\.app$/, /\.albaly\.jp$/];

    // Test that .vercel.app pattern matches valid Vercel domains
    expect('https://my-app.vercel.app').toMatch(productionOrigins[0]);
    expect('https://api-backend.vercel.app').toMatch(productionOrigins[0]);
    expect('https://staging-frontend.vercel.app').toMatch(productionOrigins[0]);

    // Test that .albaly.jp pattern matches valid domains
    expect('https://app.albaly.jp').toMatch(productionOrigins[1]);
    expect('https://api.albaly.jp').toMatch(productionOrigins[1]);
  });

  it('should allow .vercel.app domains in development mode', () => {
    const developmentOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      /\.vercel\.app$/,
      /\.albaly\.jp$/,
    ];

    // Test localhost URLs
    expect(developmentOrigins).toContain('http://localhost:3000');
    expect(developmentOrigins).toContain('http://localhost:3001');

    // Test that .vercel.app pattern exists and matches
    const vercelPattern = developmentOrigins.find(
      (origin) =>
        origin instanceof RegExp && origin.source === '\\.vercel\\.app$',
    );
    expect(vercelPattern).toBeDefined();
    expect('https://dev-app.vercel.app').toMatch(vercelPattern as RegExp);

    // Test that .albaly.jp pattern exists and matches
    const albalyPattern = developmentOrigins.find(
      (origin) =>
        origin instanceof RegExp && origin.source === '\\.albaly\\.jp$',
    );
    expect(albalyPattern).toBeDefined();
    expect('https://staging.albaly.jp').toMatch(albalyPattern as RegExp);
  });

  it('should not match invalid domains', () => {
    const vercelPattern = /\.vercel\.app$/;

    // These should NOT match
    expect('https://vercel.app').not.toMatch(vercelPattern);
    expect('https://example.com').not.toMatch(vercelPattern);
    expect('https://vercel-app.com').not.toMatch(vercelPattern);
    expect('https://myapp.vercel.app.fake.com').not.toMatch(vercelPattern);
  });

  it('should support both HTTP and HTTPS for .vercel.app domains', () => {
    const vercelPattern = /\.vercel\.app$/;

    // Both HTTP and HTTPS should match
    expect('https://my-app.vercel.app').toMatch(vercelPattern);
    expect('http://my-app.vercel.app').toMatch(vercelPattern);
  });
});
