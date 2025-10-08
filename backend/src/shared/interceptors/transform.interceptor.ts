import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has success/error structure, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Otherwise wrap in standard response
        return {
          success: true,
          data,
          message: data?.message || 'Operation successful',
        };
      }),
    );
  }
}
