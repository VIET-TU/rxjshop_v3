import { Inject, Injectable, OnModuleDestroy, OnModuleInit, forwardRef } from '@nestjs/common'
import { REDIS_CLIENT, RedisClient } from './redis-client.type'
import { RediSearchSchema, SearchOptions } from 'redis'
import { CreateOptions } from './redis.type'
import { PaginationDto } from '../bases'

export enum HeadKey {
	Register = 'register',
	Otp = 'OTP',
	AC_TOKEN = 'AC_TOKEN',
	RF_TOKEN = 'RF_TOKEN',
}

@Injectable()
export class RedisService implements OnModuleDestroy, OnModuleInit {
	public constructor(@Inject(forwardRef(() => REDIS_CLIENT)) private readonly redis: RedisClient) {}
	async onModuleInit() {}

	onModuleDestroy() {
		this.redis.quit()
	}

	ping() {
		return this.redis.ping()
	}

	async exists(key: string) {
		return await this.redis.exists(key)
	}

	async set(key: string, value: any) {
		return await this.redis.set(key, value)
	}

	async setEx(key: string, value: any, time: number) {
		return await this.redis.setEx(key, time, value)
	}

	async setNx(key: string, value: string) {
		return await this.redis.setNX(key, value)
	}

	async get(key: string) {
		return await this.redis.get(key)
	}

	async del(key: string) {
		return await this.redis.del(key)
	}

	async incr(key: string) {
		try {
			return await this.redis.incr(key)
		} catch (error) {
			throw new Error(error)
		}
	}

	async incrby(key: string, incr: number) {
		try {
			return await this.redis.incrBy(key, incr)
		} catch (error) {
			throw new Error(error)
		}
	}

	async expire(key: string, ttl: number) {
		try {
			return await this.redis.expire(key, ttl)
		} catch (error) {
			throw new Error(error)
		}
	}

	async ttl(key: string) {
		try {
			return await this.redis.ttl(key)
		} catch (error) {
			throw new Error(error)
		}
	}

	async setOnKey(headKey: HeadKey, taliKey: string, value: any, expired?: number) {
		const key = `${headKey}:${taliKey}`
		if (expired) {
			return this.setEx(key, value, expired)
		} else {
			return this.redis.set(key, value)
		}
	}

	async getOnKey(headKey: HeadKey, taliKey: string) {
		const key = `${headKey}:${taliKey}`
		console.log(key)
		return this.get(key)
	}

	async delOnKey(headKey: HeadKey, taliKey: string) {
		const key = `${headKey}:${taliKey}`
		return this.del(key)
	}

	async scan(pattern, page, limit) {
		let _keys = []
		const recursiveScan = async (_cursor = 0, count) => {
			const { cursor, keys } = await this.redis.scan(_cursor, { MATCH: pattern, COUNT: count })
			_cursor = cursor

			count -= keys.length
			_keys = _keys.concat(keys)

			if (_cursor === 0 || count <= 0) {
				return _keys
			} else {
				return await recursiveScan(_cursor, count)
			}
		}

		return await recursiveScan(page, limit)
	}

	async hgetall(key) {
		return await this.redis.hGetAll(key)
	}

	async hset(key, field, value) {
		return await this.redis.hSet(key, field, value)
	}

	async hsetNX(key, field, value) {
		return await this.redis.hSetNX(key, field, value)
	}

	async hget(key, field) {
		return await this.redis.hGet(key, field)
	}

	async hdel(key, field) {
		return await this.redis.hDel(key, field)
	}

	async hincrby(key, field, incr) {
		return await this.redis.hIncrBy(key, field, incr)
	}

	async jsonGet(key) {
		return await this.redis.json.get(key)
	}

	async jsonSet(key, path, json) {
		return await this.redis.json.set(key, path, json)
	}
	async jsonDel(key) {
		return await this.redis.json.del(key)
	}

	async jsonIncrby(key: string, path: string, incr: number) {
		return await this.redis.json.numIncrBy(key, path, incr)
	}

	async sendCommand(cmd: string[]) {
		return await this.redis.sendCommand(cmd)
	}

	async ftCreate(idx: string, schema: RediSearchSchema, options?: CreateOptions) {
		try {
			return await this.redis.ft.create(idx, schema, options)
		} catch (error) {
			console.log('error ftcreate :>> ', error)
		}
	}

	async ftInfo(rawReply: string) {
		try {
			return await this.redis.ft.info(rawReply)
		} catch (error) {
			console.log('error ftinfo :>> ', error)
			return null
		}
	}

	async ftSearh(
		idx: string,
		query: string,
		{ limit, page }: PaginationDto,
		options?: SearchOptions
	) {
		console.log('skip,take', page, query)
		limit = limit ? limit : '10'
		page = page !== '0' && page ? page : '1'
		const skip = parseInt(limit) * (parseInt(page) - 1)
		const take = parseInt(limit)

		const result = await this.redis.ft.search(idx, query, {
			...options,
			LIMIT: {
				from: skip,
				size: take,
			},
		})

		const values = result.documents.map(({ id, value }) => value)

		return {
			documents: {
				...values,
			},
			total: result.total,
		}
	}

	async filter(idx: string, query: string, pagination: PaginationDto, options?: SearchOptions) {
		const result = await this.ftSearh(idx, query, pagination, options)
		return result
	}

	async watch(key: string) {
		return await this.redis.watch(key)
	}
	async unwatch() {
		await this.redis.unwatch()
	}

	async multi() {
		return await this.redis.multi()
	}

	async discard() {
		await this.redis.discard()
	}
}
