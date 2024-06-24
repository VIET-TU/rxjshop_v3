import { Expose, plainToClass } from 'class-transformer'
import { IsNumberString, IsOptional } from 'class-validator'

export class BaseDto {
	@Expose()
	id?: string

	@Expose()
	createdAt?: Date

	@Expose()
	updatedAt?: Date

	static plainToInstance<T>(this: new (...args: any[]) => T, obj: T): T {
		return plainToClass(this, obj, { excludeExtraneousValues: true })
	}
}

export class PaginationDto {
	@IsOptional()
	@IsNumberString()
	limit?: string

	@IsOptional()
	@IsNumberString()
	page?: string
}
