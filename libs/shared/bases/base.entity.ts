import { Expose, plainToClass } from 'class-transformer'
import {
	CreateDateColumn,
	PrimaryGeneratedColumn,
	BaseEntity as TypeormBaseEntity,
	UpdateDateColumn,
} from 'typeorm'

export class BaseEntity extends TypeormBaseEntity {
	@PrimaryGeneratedColumn('uuid')
	@Expose()
	id!: string

	@CreateDateColumn({ name: 'created_at' })
	@Expose()
	createdAt!: Date

	@UpdateDateColumn({ name: 'updated_at' })
	@Expose()
	updatedAt!: Date

	static plainToInstance<T>(this: new (...args: any[]) => T, obj: T): T {
		return plainToClass(this, obj, { excludeExtraneousValues: true })
	}
}
