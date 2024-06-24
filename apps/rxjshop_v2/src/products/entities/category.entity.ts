import { BaseEntity } from 'libs/shared/bases'
import { Column, Entity, OneToMany } from 'typeorm'
import { ClothingEntity } from './clothing.entity'

@Entity({ name: 'categories' })
export class CategoryEntity extends BaseEntity {
	@Column()
	name: string

	@OneToMany((_to) => ClothingEntity, (clothing) => clothing.size)
	clothing: ClothingEntity
}
