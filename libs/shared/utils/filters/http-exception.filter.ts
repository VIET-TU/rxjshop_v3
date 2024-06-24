import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()

		const statusCode = exception.getStatus()
		const errors = exception.getResponse()
		const exceptionName = exception.name

		console.log('exception :>> ', exception)

		if (exceptionName === 'BadRequestException') {
			return response.status(400).json({
				statusCode: 400,
				success: false,
				errors,
			})
		}

		return response.status(statusCode).json({
			statusCode,
			success: false,
			errors: errors['message'] || (errors as errorTeyp) instanceof Object ? errors : errors,
		})
	}
}

type errorTeyp = {
	message: {
		errors: any
	}
}
