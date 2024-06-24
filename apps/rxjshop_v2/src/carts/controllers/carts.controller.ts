import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Request,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import { AddCartDto } from '../dtos/add-cart.dto'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from 'libs/shared/utils/guards/roles.guard'
import { ResponseInterceptor } from 'libs/shared/utils/reponse.interceptor'
import { CartsService } from '../services/carts.service'
import { UserEntity } from '../../user/entities/user.entity'

@Controller('carts')
export class CartsController {
	constructor(private readonly cartService: CartsService) {}

	// @Get(':id')
	// @UseInterceptors(new ResponseInterceptor('Add to cart successfully'))
	// async addToCart(@Param('id') productId: string, @Request() req) {
	// 	return await this.cartService.addToCart(
	// 		{ id: '840e5e3f-5f0b-4d09-b205-e580702892cf' } as UserEntity,
	// 		productId,
	// 		{ quantity: 2 }
	// 	)
	// }

	@Get('items')
	@UseGuards(AuthGuard('jwt'))
	@UseInterceptors(new ResponseInterceptor('Get item in cart successfully'))
	async getCartItem(@Request() req) {
		return await this.cartService.getCartItems(req.user as UserEntity)
	}

	@Get('count')
	@UseGuards(AuthGuard('jwt'))
	@UseInterceptors(new ResponseInterceptor('Get count in cart successfully'))
	async getCartProductCount(@Request() req) {
		console.log('debug')
		return this.cartService.getCartProductCount(req.user)
	}

	@Delete(':id')
	@UseGuards(AuthGuard('jwt'))
	@UseInterceptors(new ResponseInterceptor('Delete item in cart successfully'))
	async deleteCartItem(@Param('id') productId: string, @Request() req) {
		return await this.cartService.deleteCartItem(req, productId)
	}

	@Delete()
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@UseInterceptors(new ResponseInterceptor('Delete item in cart successfully'))
	async emptyCart(@Request() req) {
		return this.cartService.emptyCart
	}
}
