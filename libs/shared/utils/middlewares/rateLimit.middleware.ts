import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { RedisService } from 'libs/shared/redis/redis.service'
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
	constructor(private readonly redisService: RedisService) {}
	async use(req: Request, res: Response, next: NextFunction) {
		// req.connection.remoteAddress if use proxy
		const getIpUser: string = req.headers['x-forwarded-for']
			? req.headers['x-forwarded-for'][0]
			: req.connection.remoteAddress

		const numRequst = await this.redisService.incr(getIpUser) //if not exit key then create
		let _ttl = 0
		if (numRequst === 1) await this.redisService.expire(getIpUser, 60)
		else {
			_ttl = await this.redisService.ttl(getIpUser)
			if (_ttl <= 0) await this.redisService.expire(getIpUser, 60)
		}

		console.log(getIpUser, numRequst, _ttl)
		if (numRequst > 20) throw new BadRequestException('Server is busy')

		next()
	}
}
