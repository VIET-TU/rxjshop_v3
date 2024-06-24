import { BaseEntity } from 'libs/shared/bases'
import { Column, Entity, OneToMany } from 'typeorm'
import { ClothingEntity } from './clothing.entity'

@Entity({ name: 'colors' })
export class ColorEntity extends BaseEntity {
	@Column()
	name: string

	@Column()
	value: string

	@OneToMany((_to) => ClothingEntity, (clothing) => clothing.size)
	clothing: ClothingEntity
}
