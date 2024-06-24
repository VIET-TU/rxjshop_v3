import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { UserEntity } from '../../user/entities/user.entity'
import { BaseEntity } from 'libs/shared/bases'
import { SizeEntity } from './size.entity'
import { ColorEntity } from './color.entity'
import { CategoryEntity } from './category.entity'

@Entity({ name: 'clothing' })
export class ClothingEntity extends BaseEntity {
	@ManyToOne(() => SizeEntity, (size) => size.clothing)
	@JoinColumn({ name: 'size' })
	size: SizeEntity

	@ManyToOne(() => ColorEntity, (color) => color.clothing)
	@JoinColumn({ name: 'color' })
	color: ColorEntity

	@ManyToOne(() => CategoryEntity, (category) => category.clothing)
	@JoinColumn({ name: 'category' })
	category: CategoryEntity

	@ManyToOne(() => UserEntity)
	@JoinColumn({ name: 'shopId' })
	product_shop: UserEntity
}
