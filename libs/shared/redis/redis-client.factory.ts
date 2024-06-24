import { FactoryProvider } from '@nestjs/common'
import * as redis from 'redis'
import { RedisClient, REDIS_CLIENT } from './redis-client.type'

export const redisClientFactory: FactoryProvider<Promise<RedisClient>> = {
	provide: REDIS_CLIENT,
	useFactory: async () => {
		const client = await redis.createClient({ url: process.env.URL_REDIS_DOCKER })
		await client.connect()
		return client
	},
}
