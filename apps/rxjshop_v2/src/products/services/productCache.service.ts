import { Length } from 'class-validator'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SchemaFieldTypes } from 'redis'

import { SearchParam, filterDto } from '../dtos/key-search.dto'
import { ProductEnitty } from '../entities/product.entity'
import { ProductRepository } from '../repositories/product.repository'
import { RedisService } from 'libs/shared/redis/redis.service'
import { converToQueryRedis } from 'libs/shared/utils'
import { ReponseGetProducts } from '../dtos/reponse-prodcuts.dto'

@Injectable()
export class ProductCacheService implements OnModuleInit {
	constructor(
		private readonly redisService: RedisService,
		private readonly productRepo: ProductRepository,
		private readonly ConfigService: ConfigService
	) {}

	// @overwrite
	async onModuleInit() {
		// init cache
		this.initProductCache()
	}

	async initProductCache() {
		const data = await this.redisService.scan('product:*', 0, 2)
		if (!data.length) {
			const products: ProductEnitty[] = await this.productRepo.getAll({
				relations: { product_shop: true },
				select: { product_shop: { id: true, firstName: true, lastName: true } },
			})
			for (const product of products as any) {
				const { id } = product
				const fullname = product.product_shop.firstName + ' ' + product.product_shop.lastName
				delete product.product_shop.firstName
				delete product.product_shop.lastName
				product.product_price = parseInt(product.product_price)
				await this.redisService.jsonSet(`product:${id}`, '.', {
					...product,
					product_shop: { ...product.product_shop, fullname },
				})
			}
		}
		if (true) {
			await this.redisService.ftCreate(
				'idx:product',
				{
					'$.product_name': { type: SchemaFieldTypes.TEXT, AS: 'name', SORTABLE: true },
					'$.product_description': { type: SchemaFieldTypes.TEXT, AS: 'description' },
					'$.product_price': { type: SchemaFieldTypes.NUMERIC, SORTABLE: true, AS: 'price' },
					'$.product_type': { type: SchemaFieldTypes.TAG, SORTABLE: true, AS: 'type' },
					'$.product_ratingsAverage': {
						type: SchemaFieldTypes.NUMERIC,
						AS: 'ratingsAverage',
						SORTABLE: true,
					},
					// '$.createdAt': { type: SchemaFieldTypes.TEXT, SORTABLE: true, AS: 'createdAt' },
					'$.product_shop.id': { type: SchemaFieldTypes.TEXT, AS: 'shopid' },
					'$.product_shop.fullname': { type: SchemaFieldTypes.TEXT, AS: 'shopname' },
					'$..size': { type: SchemaFieldTypes.TEXT, AS: 'size' },
					'$..color': { type: SchemaFieldTypes.TEXT, AS: 'color' },
					'$..category': { type: SchemaFieldTypes.TEXT, AS: 'category' },
				},
				{
					ON: 'JSON',
					PREFIX: 'product:',
				}
			)
		}
	}

	async productFilter(filter: filterDto): Promise<ReponseGetProducts> {
		const { limit, page, ...query } = filter
		let products
		if (!Object.keys(query).length) {
			products = await this.redisService.ftSearh('idx:product', '*', { limit, page }, {})
		} else {
			products = await this.redisService.ftSearh(
				'idx:product',
				`(${converToQueryRedis(query)})`,
				{
					limit,
					page,
				},
				{
					RETURN: ['name', 'price', 'size', 'color'],
					SORTBY: {
						BY: 'name',
						DIRECTION: 'ASC',
					},
				}
			)
		}
		if (products.total > 0) {
			const prodcut_ = Object.values(products.documents) as unknown as ProductEnitty[]
			return {
				totalPage: Math.ceil(products.total / parseInt(limit)),
				currentPage: parseInt(page),
				count: prodcut_.length,
				products: prodcut_,
			}
		}

		return null
	}

	async searchProduct(searchParam: SearchParam): Promise<ProductEnitty[]> {
		const { limit, page, KeySearch } = searchParam
		return (
			await this.redisService.ftSearh(
				'idx:product',
				KeySearch,
				{ limit, page },
				{
					RETURN: ['name', 'price'],
					SORTBY: {
						BY: 'createdAt',
						DIRECTION: 'DESC',
					},
				}
			)
		).documents as unknown as ProductEnitty[]
	}

	async deleteProduct(id: string) {
		return await this.redisService.jsonDel(`product:${id}`)
	}

	async setProduct(product: ProductEnitty) {
		const fullname = product.product_shop.firstName + ' ' + product.product_shop.lastName
		delete product.product_shop.firstName
		delete product.product_shop.lastName
		return await this.redisService.jsonSet(`product:${product.id}`, '.', {
			...product,
			product_shop: { id: product.product_shop.id, fullname },
		})
	}
	async getProductById(id: string): Promise<ProductEnitty | null> {
		return (await this.redisService.jsonGet(`product:${id}`)) as unknown as ProductEnitty
	}
}
