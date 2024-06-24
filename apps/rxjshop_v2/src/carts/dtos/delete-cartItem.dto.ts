import { IsOptional } from 'class-validator'
import { BaseDto } from 'libs/shared/bases'

export class DeleteCartItem extends BaseDto {
	@IsOptional()
	productId: string
}
