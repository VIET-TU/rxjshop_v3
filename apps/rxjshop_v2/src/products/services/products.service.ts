import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { IProductService } from '../product.interface'
import { ProductEnitty } from '../entities/product.entity'
import { CreateProductDto } from '../dtos/create-product.dto'
import { ElectronicRepository, ProductRepository } from '../repositories/product.repository'
import { DataSource, EntityManager } from 'typeorm'
import { ElectronicEntity } from '../entities/electronic.entity'
import { UpdateProducttDto } from '../dtos/update-product.dto'

import { ProductCacheService } from './productCache.service'
import { isArray } from 'class-validator'
import { filterDto } from '../dtos/key-search.dto'
import { ClothingEntity } from '../entities/clothing.entity'
import { UserEntity } from '../../user/entities/user.entity'
import { removeUndefinedObject } from 'libs/shared/utils'
import { MediaService } from 'libs/shared/media/services/media.service'
import { ReponseGetProducts } from '../dtos/reponse-prodcuts.dto'

@Injectable()
export class ProductFactory {
	constructor(
		private readonly productRepo: ProductRepository,
		private readonly electronicRepo: ElectronicRepository,
		private dataSource: DataSource,
		private readonly mediaService: MediaService,
		private readonly productCacheSerice: ProductCacheService
	) {}
	getOneProduct(id: string): Promise<ProductEnitty> {
		return this.productCacheSerice.getProductById(id)
	}

	static productRegistry: { [key: string]: any } = {} // key - value

	static registerProductType(type, classRef) {
		ProductFactory.productRegistry[type] = classRef
	}

	async createProduct(type: string, payload: CreateProductDto): Promise<ProductEnitty> {
		const productClass = ProductFactory.productRegistry[type]

		if (!productClass)
			throw new HttpException(`Invalid Product Types ${type}`, HttpStatus.BAD_REQUEST)

		return await this.dataSource.transaction(async (manager) => {
			console.log('product', payload.product_thumbs)
			const product_thumbs = await this.mediaService.handlerFile(
				payload.product_thumbs as File[],
				manager
			)
			return await new productClass(
				{ ...payload, product_thumbs },
				this.productRepo,
				this.productCacheSerice,
				manager
			).createProduct()
		})
	}

	async updateProduct(
		type: string,
		productId: string,
		payload: UpdateProducttDto
	): Promise<ProductEnitty> {
		const productClass = ProductFactory.productRegistry[type]
		if (!productClass)
			throw new HttpException(`Invalid Product Types ${type}`, HttpStatus.BAD_REQUEST)
		return await this.dataSource.transaction(async (manager) => {
			let product_thumbs: string[] = []
			if (payload.product_thumbs?.length > 0) {
				product_thumbs = await this.mediaService.handlerFile(
					payload.product_thumbs as File[],
					manager
				)
			}
			// remove image
			const { product_thumbs: product_thumbs_current } =
				await this.productCacheSerice.getProductById(productId)

			console.log('product_thumb_remove', payload.product_thumbs_remove, product_thumbs_current)
			if (payload.product_thumbs_remove.length && product_thumbs_current) {
				product_thumbs_current.forEach((item) => {
					if (payload.product_thumbs_remove.includes(item)) {
						const parts = item.split('/')
						const key = parts[3] + '/' + parts[4].split('?')[0]
						this.mediaService.deleteMediaById(key, manager)
					} else {
						product_thumbs.push(item)
					}
				})
			} else if (product_thumbs_current) {
				product_thumbs = [...product_thumbs, ...product_thumbs_current]
			}

			//	payload = removeUndefinedObject({ ...payload, product_thumbs })

			return await new productClass(
				{ ...payload, product_thumbs },
				this.productRepo,
				this.productCacheSerice,
				manager
			).updateProduct(productId)
		})
	}

	// async updateProduct(
	// 	type: string,
	// 	productId: string,
	// 	payload: UpdateProducttDto
	// ): Promise<ProductEnitty> {
	// 	const productClass = ProductFactory.productRegistry[type]
	// 	if (!productClass)
	// 		throw new HttpException(`Invalid Product Types ${type}`, HttpStatus.BAD_REQUEST)
	// 	return await this.dataSource.transaction(async (manager) => {
	// 		let product_thumbs: string[] = []
	// 		const bucket = []
	// 		if (payload.product_thumbs?.length > 0) {
	// 			product_thumbs = await this.mediaService.handlerFile(
	// 				payload.product_thumbs as File[],
	// 				manager
	// 			)
	// 		}
	// 		// remove image
	// 		const { product_thumbs: product_thumbs_current } =
	// 			await this.productCacheSerice.getProducttById(productId)
	// 		if (
	// 			payload.product_thumbs_remove.length &&
	// 			isArray(payload.product_thumbs_remove) &&
	// 			product_thumbs_current
	// 		) {
	// 			// product_thumbs_current.forEach((item) => {
	// 			// 	if (payload.product_thumbs_remove.includes(item)) {
	// 			// 		const parts = item.split('/')
	// 			// 		const key = parts[3] + '/' + parts[4].split('?')[0]
	// 			// 		this.mediaService.deleteMediaById(key, manager)
	// 			// 	} else {
	// 			// 		product_thumbs.push(item)
	// 			// 	}
	// 			// })
	// 			payload.product_thumbs_remove.forEach((item) => {
	// 				if (product_thumbs_current.includes(item)) {
	// 					const parts = item.split('/')
	// 					const key = parts[3] + '/' + parts[4].split('?')[0]
	// 					this.mediaService.deleteMediaById(key, manager)
	// 					bucket.push(item)
	// 				}
	// 			})
	// 			//////////
	// 		}
	// 		if (product_thumbs)
	// 			// const { product_type, ...data } = removeUndefinedObject({ ...payload, product_thumbs })

	// 			// else if (product_thumbs_current) {
	// 			// 	product_thumbs = [...product_thumbs, ...product_thumbs_current]
	// 			// }

	// 			// if (!data) {
	// 			// 	throw new HttpException('Data update product missing', HttpStatus.BAD_REQUEST)
	// 			// }

	// 			return await new productClass(
	// 				{ ...payload, product_thumbs },
	// 				this.productRepo,
	// 				this.productCacheSerice,
	// 				manager
	// 			).updateProduct(productId)
	// 	})
	// }

	async productFilter(filter: filterDto): Promise<ReponseGetProducts> {
		const result = await this.productCacheSerice.productFilter(filter)
		if (result) {
			this.productCacheSerice.initProductCache()
			return await this.productCacheSerice.productFilter(filter)
		}
		return result
	}
}

// define base product class
class Product {
	protected payload: CreateProductDto | UpdateProducttDto
	protected productRepo: ProductRepository
	protected productCache: ProductCacheService
	// protected electronicRepo: ElectronicRepository
	protected manager: EntityManager
	constructor(
		payload: CreateProductDto | UpdateProducttDto,
		productRepo: ProductRepository,
		productCache: ProductCacheService,
		manager?: EntityManager
	) {
		this.payload = payload
		this.productRepo = productRepo
		this.productCache = productCache
		if (manager) this.manager = manager
	}

	protected async createProduct(prodcut_id: string) {
		const newProduct = await this.manager.create(ProductEnitty, {
			...this.payload,
			product_thumbs: this.payload.product_thumbs as unknown as string[],
			id: prodcut_id,
		})
		return this.manager.save(newProduct)
	}

	async updateProduct(productId: string, payload: UpdateProducttDto) {
		const product = await this.productRepo.getOneByIdOrFail(productId)
		const newProduct = {
			...product,
			...this.payload,
			product_attributes: { ...product.product_attributes, ...this.payload.product_attributes },
		} as ProductEnitty

		const _newProduct = this.manager.create(ProductEnitty, newProduct)

		return await this.manager.save(_newProduct)
	}
}

// define sub-class for diffrent product types electronic
class Electronic extends Product {
	async createProduct() {
		const newElectronic = await this.manager.create(ElectronicEntity, {
			...this.payload.product_attributes,
			product_shop: this.payload.product_shop,
		})
		if (!newElectronic)
			throw new HttpException('Error create new Electronic', HttpStatus.BAD_REQUEST)
		await this.manager.save(newElectronic)
		const newProduct = await super.createProduct(newElectronic.id)
		if (!newProduct) throw new HttpException('Error create new Product', HttpStatus.BAD_REQUEST)
		// set cache
		await this.productCache.setProduct(newProduct)
		return {
			...newProduct,
			product_shop: UserEntity.plainToInstance(this.payload.product_shop),
		} as ProductEnitty
	}

	async updateProduct(productId) {
		// 1. remove attr has null undifine
		const objetParams = removeUndefinedObject(this.payload)
		// 2. Check  update where
		if (objetParams.product_attributes) {
			await this.manager.update(
				ElectronicEntity,
				{ id: productId },
				{ ...this.payload.product_attributes }
			)
		}
		// 3. update image IMPORTANT!!! => Complete
		const updateProduct = await super.updateProduct(productId, objetParams)
		// update product
		// deelte reids product
		await this.productCache.deleteProduct(updateProduct.id)
		// set cache new product
		await this.productCache.setProduct(updateProduct)
		return updateProduct
	}
}

// define sub-class for diffrent product types electronic
class Clothing extends Product {
	async createProduct() {
		const newClothing = await this.manager.create(ClothingEntity, {
			...this.payload.product_attributes,
			product_shop: this.payload.product_shop,
		})
		if (!newClothing) throw new HttpException('Error create new Clothing', HttpStatus.BAD_REQUEST)
		await this.manager.save(newClothing)
		const newProduct = await super.createProduct(newClothing.id)
		if (!newProduct) throw new HttpException('Error create new Product', HttpStatus.BAD_REQUEST)
		// set cache
		await this.productCache.setProduct(newProduct)
		return {
			...newProduct,
			product_shop: UserEntity.plainToInstance(this.payload.product_shop),
		} as ProductEnitty
	}

	async updateProduct(productId) {
		// 1. remove attr has null undifine
		const objetParams = removeUndefinedObject(this.payload)
		// 2. Check  update where
		if (objetParams.product_attributes) {
			await this.manager.update(
				ElectronicEntity,
				{ id: productId },
				{ ...this.payload.product_attributes }
			)
		}
		// 3. update image IMPORTANT!!! => Complete
		const updateProduct = await super.updateProduct(productId, objetParams)
		// update product
		// deelte reids product
		await this.productCache.deleteProduct(updateProduct.id)
		// set cache new product
		await this.productCache.setProduct(updateProduct)
		return updateProduct
	}
}

ProductFactory.registerProductType('Electronics', Electronic)
ProductFactory.registerProductType('Clothing', Clothing)
