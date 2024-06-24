import { Transform, TransformFnParams } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsNumber, IsString, Matches, MinLength } from 'class-validator'
import { PRODUCT_TYPE_ENUM } from '../entities/product.entity'
import { UserEntity } from '../../user/entities/user.entity'

export class CreateProductDto {
	@IsNotEmpty()
	@IsString()
	@Transform(({ value }: TransformFnParams) => value?.trim().replace(/\s+/g, ' '))
	@MinLength(5)
	product_name!: string

	product_thumbs?: File[] | string[]

	@IsNotEmpty()
	@Transform(({ value }: TransformFnParams) => value?.trim().replace(/\s+/g, ' '))
	@MinLength(5)
	product_description!: string

	@IsNotEmpty()
	product_price!: string

	@IsNotEmpty()
	product_quantity: number

	@IsNotEmpty()
	@IsEnum(PRODUCT_TYPE_ENUM)
	product_type!: string

	@IsNotEmpty()
	product_attributes: object

	product_shop?: UserEntity
}
