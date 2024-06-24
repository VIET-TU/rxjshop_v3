import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	HttpStatus,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Response {
	message: string
	success: boolean
	data: any
	error: null
	timestamps: Date
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
	constructor(private readonly message?: string) {}
	intercept(context: ExecutionContext, next: CallHandler): Observable<Response> {
		return next.handle().pipe(
			map((data) => {
				const response = context.switchToHttp().getResponse()
				const status = response.statusCode || HttpStatus.OK
				const path = context.switchToHttp().getRequest().url
				return {
					status,
					message: this.message,
					success: true,
					data,
					timestamps: new Date(),
					path,
					error: null,
				}
			})
		)
	}
}
