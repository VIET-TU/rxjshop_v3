import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const transormInput = createParamDecorator(async (_, ctx: ExecutionContext) => {
	const request: Request = ctx.switchToHttp().getRequest()
	const payload = request.body
	Object.keys(payload).forEach((x) => x.trim().replace(/\s+/g, ' '))
	return payload
})
