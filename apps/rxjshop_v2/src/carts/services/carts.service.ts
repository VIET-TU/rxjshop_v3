import { session } from 'express-session'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { AddCartDto } from '../dtos/add-cart.dto'
import { CartEntity } from '../entities/cart.entity'
import { CartItemRepository } from '../repositories/cart-item.repository'
import { CartRepository } from '../repositories/cart.repository'
import { CartStatus } from '../enums/cart-status.enum'
import { DeleteCartItem } from '../dtos/delete-cartItem.dto'
import { RedisService } from 'libs/shared/redis/redis.service'
import { UserEntity } from '../../user/entities/user.entity'
import { ProductEnitty } from '../../products/entities/product.entity'

@Injectable()
export class CartsService {
	constructor(
		private readonly cartRepo: CartRepository,
		private readonly cartItemRepo: CartItemRepository,
		private readonly redisService: RedisService
	) {}

	async getCartProductCount(user: UserEntity) {
		console.log('debug')

		const itemsCart = await this.redisService.hgetall(`cart:${user.id}`)
		let count = 0
		Object.entries(itemsCart).forEach(async (item) => {
			count += parseInt(item[item.length - 1]) || 0
		})

		return {
			count,
		}
	}

	async addToCart(user: UserEntity, productId: string, { quantity, incrementBy }: AddCartDto) {
		const cartId = user.id

		// begin transaction

		// Watch necessary keys for optimistic locking
		await this.redisService.watch(`cart:${cartId}`)
		await this.redisService.watch(`product:${productId}`)

		const productInStore = (await this.redisService.jsonGet(
			`product:${productId}`
		)) as unknown as ProductEnitty
		if (!productInStore)
			throw new HttpException("Product with this id doesn't exist", HttpStatus.NOT_FOUND)
		const quantityInCart =
			parseInt(await this.redisService.hget(`cart:${cartId}`, `product:${productId}`)) || 0

		const multiExce = await this.redisService.multi()

		// check cart exists

		if (quantity === 0) {
			;(await multiExce).hSetNX(`cart:${cartId}`, `product:${productId}`, '0')
		}

		const { product_quantity: stock } = productInStore

		if (!(await this.redisService.exists(`product:${productId}`))) {
			await this.redisService.setNx(`product:${productId}_`, stock.toString())
		}

		try {
			if (quantity) {
				if (quantity <= 0)
					throw new HttpException('Quantity should be greater than 0', HttpStatus.BAD_REQUEST)

				const newStock = await this.redisService.incrby(`product:${productId}_`, -quantity)

				if (newStock < 0)
					throw new HttpException('Not enough products in stock', HttpStatus.BAD_REQUEST)

				await multiExce.hIncrBy(`cart:${cartId}`, `product:${productId}`, quantity)

				await multiExce.json.numIncrBy(`product:${productId}`, 'product_quantity', -quantity)

				return await multiExce.exec()
			}

			if (incrementBy) {
				if (incrementBy !== 1 && incrementBy !== -1)
					throw new HttpException('Value of incrementBy should be 1 or -1', HttpStatus.BAD_REQUEST)

				const quantityAfterIncrement = quantityInCart + incrementBy

				const newStock = await this.redisService.incrby(`product:${productId}_`, incrementBy)

				if (quantityAfterIncrement <= 0 || newStock < 0)
					throw new HttpException("Can't decrement stock to 0", HttpStatus.BAD_REQUEST)

				if (newStock - incrementBy < 0)
					throw new HttpException('Not enough products in stock', HttpStatus.BAD_REQUEST)

				await multiExce.hIncrBy(`cart:${cartId}`, `product:${productId}`, incrementBy)

				productInStore.product_quantity -= incrementBy

				await this.redisService.jsonSet(`product:${productId}`, '.', productInStore)

				return await multiExce.exec()
			}
		} catch (error: unknown) {
			await multiExce.discard()
			this.redisService.unwatch()
			throw new HttpException(error.toString(), HttpStatus.BAD_REQUEST)
		}

		throw new HttpException('Add to cart false', HttpStatus.BAD_REQUEST)
	}

	async getCartItems(user: UserEntity) {
		const productList = []
		const cartList = await this.redisService.hgetall(`cart:${user.id}`)

		if (!cartList) return cartList

		for (const itemKey of Object.keys(cartList)) {
			const product = await this.redisService.jsonGet(itemKey)
			productList.push({ product, quantity: cartList[itemKey] })
		}

		return productList
	}

	async emptyCart({ user }: Request) {
		const { id: cartId } = await this.cartRepo.getOneOrFail({
			where: {
				user,
				cart_state: CartStatus.ACTIVE,
			},
		})

		const cartList = await this.redisService.hgetall(`cart:${cartId}`)

		if (!cartList) throw new HttpException('My cart is not exits', HttpStatus.NO_CONTENT)

		for (const key of Object.keys(cartList)) {
			await this.redisService.hdel(`cart:${cartId}`, key)

			const productInStore = (await this.redisService.jsonGet(key)) as unknown as ProductEnitty

			productInStore.product_quantity += parseInt(cartList[key])

			return await this.redisService.jsonSet(key, '.', JSON.stringify(productInStore))
		}
	}

	async deleteCartItem({ user }: Request, productId: string) {
		const { id: cartId } = await this.cartRepo.getOneOrFail({
			where: {
				user,
				cart_state: CartStatus.ACTIVE,
			},
		})

		const quantityInCart =
			parseInt(await this.redisService.hget(`cart:${cartId}`, `product:${productId}`)) || 0

		if (quantityInCart) {
			await this.redisService.hdel(`cart:${cartId}`, `product:${productId}`)

			const productInStore = (await this.redisService.jsonGet(
				`product:${productId}`
			)) as unknown as ProductEnitty

			productInStore.product_quantity += quantityInCart

			return await this.redisService.jsonSet(
				`product:${productId}`,
				'.',
				JSON.stringify(productInStore)
			)
		}
		throw new HttpException('Delete cart item false', HttpStatus.NOT_FOUND)
	}
}
