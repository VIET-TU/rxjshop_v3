import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { CartEntity } from './cart.entity'
import { BaseEntity } from 'libs/shared/bases'
import { ProductEnitty } from '../../products/entities/product.entity'

@Entity({
	name: 'cart_items',
})
export class CartItemEntity extends BaseEntity {
	@ManyToOne((_to) => CartEntity, (cart) => cart.cartItems)
	@JoinColumn({ name: 'cartId' })
	cart: CartEntity

	@ManyToOne((_to) => ProductEnitty, (product) => product.cartItem)
	@JoinColumn({ name: 'productId' })
	product: ProductEnitty

	@Column()
	quantity: number

	@Column()
	totalPrice: string
}
