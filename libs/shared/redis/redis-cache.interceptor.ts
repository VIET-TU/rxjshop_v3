import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable, of } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { RedisService } from './redis.service'

// @Injectable()
// export class RedisCacheInterceptor implements NestInterceptor {
// 	constructor(private readonly redisService: RedisService) {}

// 	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
// 		const productKeys = await this.redisService.scan('product:*')
// 		const productList: object[] = []
// 		console.log('redis cache')
// 		for (const key of productKeys) {
// 			if (productKeys.Length) {
// 				const product = (await this.redisService.jsonGet(key)) as unknown as string

// 				productList.push(JSON.parse(product))
// 			}

// 			return of(productKeys)
// 		}

// 		return next.handle().pipe(
// 			map(async (data: ProudctEntity[]) => {
// 				for (const product of data) {
// 					const { id } = product

// 					await this.redisService.jsonSet(`product:${id}`, '.', JSON.stringify(product))

// 					productList.push(product)
// 				}
// 			})
// 		)
// 	}
// }
