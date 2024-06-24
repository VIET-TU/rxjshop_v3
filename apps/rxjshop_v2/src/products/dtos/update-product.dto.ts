import { PartialType } from '@nestjs/mapped-types'
import { IsOptional } from 'class-validator'
import { CreateProductDto } from './create-product.dto'

export class UpdateProducttDto extends PartialType(CreateProductDto) {
	// media key
	@IsOptional()
	product_thumbs_remove?: string[] = []
}
