import { Global, Module } from '@nestjs/common'
import { redisClientFactory } from './redis-client.factory'
import { RedisService } from './redis.service'

@Global()
@Module({
	providers: [redisClientFactory, RedisService],
	exports: [RedisService, redisClientFactory],
})
export class RedisModule {}
