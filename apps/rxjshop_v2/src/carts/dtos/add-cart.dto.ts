import { IsInt, IsOptional, Min } from 'class-validator'
import { BaseDto } from 'libs/shared/bases'

export class AddCartDto extends BaseDto {
	@IsInt()
	@Min(1, { message: 'Quantity should be greater than 0' })
	quantity?: number

	@IsOptional()
	incrementBy?: number
}
