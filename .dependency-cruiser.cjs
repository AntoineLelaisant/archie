/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-framework-in-domain',
      severity: 'error',
      comment: 'Domain layer must not depend on framework packages (except @nestjs/cqrs event types)',
      from: { path: 'modules/.+/domain/' },
      to: { path: ['@nestjs/(?!cqrs)', 'drizzle-orm', 'bullmq'] },
    },
    {
      name: 'no-infra-in-domain',
      severity: 'error',
      comment: 'Domain layer must not depend on infrastructure layer',
      from: { path: 'modules/.+/domain/' },
      to: { path: 'modules/.+/infrastructure/' },
    },
    {
      name: 'no-cross-module-imports',
      severity: 'error',
      comment: 'Modules must not import from other modules directly',
      from: { path: 'src/modules/([^/]+)/' },
      to: { path: 'src/modules/(?!\\1/)' },
    },
    {
      name: 'no-core-infra-in-domain',
      severity: 'error',
      comment: 'Domain layer must not depend on core infrastructure',
      from: { path: 'modules/.+/domain/' },
      to: { path: 'core/infrastructure/' },
    },
    {
      name: 'no-backend-only-in-shared',
      severity: 'error',
      comment: 'Shared package must not import from backend-only code',
      from: { path: 'packages/shared/' },
      to: { path: ['src/modules/', 'src/core/'] },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
  },
};
