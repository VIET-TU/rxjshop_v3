import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { CartStatus } from '../enums/cart-status.enum'
import { CartItemEntity } from './cart-item.entity'
import { UserEntity } from '../../user/entities/user.entity'
import { BaseEntity } from 'libs/shared/bases'

@Entity({ name: 'carts' })
export class CartEntity extends BaseEntity {
	@Column({
		type: 'enum',
		enum: CartStatus,
		default: CartStatus.ACTIVE,
	})
	cart_state: CartStatus

	@Column({
		default: 0,
	})
	cart_count_product: number

	@ManyToOne((_to) => UserEntity, (user) => user.cart)
	@JoinColumn({ name: 'userId' })
	user: UserEntity

	@OneToMany((_to) => CartItemEntity, (cartItem) => cartItem.cart)
	cartItems: CartItemEntity[]
}
