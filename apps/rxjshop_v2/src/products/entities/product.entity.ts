// eslint-disable-next-line @typescript-eslint/no-var-requires
import slugify from 'slugify'
import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToMany,
	ManyToOne,
	OneToMany,
} from 'typeorm'
import { UserEntity } from '../../user/entities/user.entity'
import { BaseEntity } from 'libs/shared/bases'
import { CartItemEntity } from '../../carts/entities/cart-item.entity'

export enum PRODUCT_TYPE_ENUM {
	Electronics = 'Electronics',
	Clothing = 'Clothing',
	Furniture = 'Furniture',
}

@Entity({ name: 'products' })
@Index(['product_name', 'product_description'], { fulltext: true })
export class ProductEnitty extends BaseEntity {
	@Column()
	product_name!: string

	@Column('text', { array: true })
	product_thumbs!: string[]

	@Column()
	product_description!: string

	@Column({ nullable: true })
	product_slug: string

	@BeforeInsert()
	@BeforeUpdate()
	generateSlug() {
		this.product_slug = slugify(this.product_name, { lower: true })
	}

	@Column()
	product_price!: string
	@Column()
	product_quantity!: number
	@Column({
		type: 'enum',
		enum: PRODUCT_TYPE_ENUM,
	})
	product_type!: string

	@ManyToOne(() => UserEntity, (user) => user.products)
	@JoinColumn({ name: 'shopId' })
	product_shop: UserEntity

	@Column({ type: 'float', default: 0 })
	product_ratingsAverage: number

	@BeforeInsert()
	@BeforeUpdate()
	updateRatingsAverage() {
		if (this.product_ratingsAverage)
			this.product_ratingsAverage = Math.round(this.product_ratingsAverage * 10) / 10
	}
	@Column({
		type: 'boolean',
		default: true,
		select: false,
	})
	isPublished: boolean

	@Column({ type: 'json' })
	product_attributes!: object

	@OneToMany((_to) => CartItemEntity, (cartItem) => cartItem.product)
	cartItem: CartItemEntity
}
