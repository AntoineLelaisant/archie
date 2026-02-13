import { Catch, type ArgumentsHost } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { AppError } from '../../domain/errors/app.error.js';

@Catch(AppError)
export class DomainExceptionFilter implements GqlExceptionFilter {
  catch(exception: AppError, _host: ArgumentsHost) {
    return new GraphQLError(exception.message, {
      extensions: {
        code: exception.code,
        httpStatus: exception.httpStatus,
      },
    });
  }
}
