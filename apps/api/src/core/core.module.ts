import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { CqrsModule } from './infrastructure/cqrs/cqrs.module.js';
import { DomainExceptionFilter } from './infrastructure/filters/domain-exception.filter.js';

@Module({
  imports: [CqrsModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
  exports: [CqrsModule],
})
export class CoreModule {}
