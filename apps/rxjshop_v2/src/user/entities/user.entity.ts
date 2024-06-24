import { Exclude, Expose, Transform } from 'class-transformer'

import {
	AfterLoad,
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	OneToOne,
} from 'typeorm'
import { KeyTokenEntity } from '../../auth/entities/keyToken.entity'
import { BaseEntity } from 'libs/shared/bases'
import { hashX } from 'libs/shared/utils/helpers'
import { Role } from 'libs/shared/utils/enums/role.enum'
import { ProductEnitty } from '../../products/entities/product.entity'
import { CartEntity } from '../../carts/entities/cart.entity'
import { MessageEntity } from 'apps/chat/src/entities/message.entity'

export enum StatusUser {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
	@Column()
	firstName!: string

	@Column()
	lastName!: string

	@Expose()
	@Transform(({ obj }) => obj.firstName + ' ' + obj.lastName)
	fullName: string

	@Column({ unique: true })
	@Expose()
	email!: string

	@Column()
	@Exclude({ toPlainOnly: true })
	password!: string

	@Exclude({ toPlainOnly: true })
	public previousPassword: string

	@AfterLoad()
	public loadPreviousPassword(): void {
		this.previousPassword = this.password
	}

	@BeforeInsert()
	@BeforeUpdate()
	async setPassword() {
		if (this.previousPassword !== this.password && this.password) {
			this.password = await hashX(this.password)
		} else {
			this.password = await hashX(this.password)
		}
	}

	@Column({
		type: 'enum',
		enum: StatusUser,
		default: StatusUser.ACTIVE,
	})
	@Exclude()
	status: StatusUser

	@Column({
		type: 'enum',
		enum: Role,
		default: Role.User,
	})
	@Exclude()
	roles: Role

	@Column({ nullable: true })
	@Expose()
	phone: string

	@Column({ nullable: true })
	@Expose()
	address: string

	@Column({ nullable: true })
	@Expose()
	avatar: string

	@OneToOne((_to) => KeyTokenEntity, (keyToken) => keyToken.user)
	keyToken: KeyTokenEntity

	@OneToMany((_to) => ProductEnitty, (product) => product.product_shop)
	products: ProductEnitty[]

	@OneToMany((to) => CartEntity, (cart) => cart.user)
	cart: CartEntity

	// @OneToMany(() => MessageEntity, (messageEntity) => messageEntity.user)
	// messages: MessageEntity[]
}
