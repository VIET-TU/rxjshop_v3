import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { ProductEnitty } from './product.entity'
import { BaseEntity } from 'libs/shared/bases'
import { UserEntity } from '../../user/entities/user.entity'

@Entity({ name: 'electronics' })
export class ElectronicEntity extends BaseEntity {
	@Column()
	manufacturer!: string

	@Column()
	model!: string

	@Column()
	color!: string

	@ManyToOne(() => UserEntity)
	@JoinColumn({ name: 'shopId' })
	product_shop: UserEntity
}
