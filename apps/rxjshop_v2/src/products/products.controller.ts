import {
	Body,
	Controller,
	Get,
	Inject,
	Param,
	Patch,
	Post,
	Query,
	Request,
	Res,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
	forwardRef,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FilesInterceptor } from '@nestjs/platform-express'
import { Roles } from 'libs/shared/utils/decorator/roles.decorator'
import { Role } from 'libs/shared/utils/enums/role.enum'
import { RolesGuard } from 'libs/shared/utils/guards/roles.guard'
import { ResponseInterceptor } from 'libs/shared/utils/reponse.interceptor'
import { CreateProductDto } from './dtos/create-product.dto'
import { filterDto } from './dtos/key-search.dto'
import { UpdateProducttDto } from './dtos/update-product.dto'
import { ProductEnitty } from './entities/product.entity'
import { IProductService } from './product.interface'
import { ProductFactory } from './services/products.service'
import { MessagePattern } from '@nestjs/microservices'
import { ReponseGetProducts } from './dtos/reponse-prodcuts.dto'

@Controller('products')
export class ProductsController {
	constructor(
		@Inject(forwardRef(() => ProductFactory)) private readonly productsService: ProductFactory
	) {}

	@Post()
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@UseInterceptors(FilesInterceptor('product_thumbs'))
	@UseInterceptors(new ResponseInterceptor('Create product  successfully'))
	async createProduct(
		@Request() { user },
		@Body() payload: CreateProductDto,
		@UploadedFiles()
		product_thumbs: File[]
	): Promise<ProductEnitty> {
		let product_attributes = payload.product_attributes
		if (typeof product_attributes === 'string') {
			product_attributes = JSON.parse(product_attributes as unknown as string)
		}

		return this.productsService.createProduct(payload.product_type, {
			...payload,
			product_shop: user,
			product_thumbs,
			product_attributes: product_attributes,
		})
	}

	@Get()
	@UseInterceptors(new ResponseInterceptor('Get all products successfully'))
	@MessagePattern({ cmd: 'get-products' })
	async productFilter(@Query() query: filterDto): Promise<ReponseGetProducts> {
		console.log('page,limit :>> ', query)
		return await this.productsService.productFilter(query)
	}

	@Get(':id')
	@UseInterceptors(new ResponseInterceptor('Get product by id successfully'))
	async getOneProduct(@Param('id') id: string): Promise<ProductEnitty> {
		return this.productsService.getOneProduct(id)
	}

	@Get(':id')
	@UseInterceptors(new ResponseInterceptor('Get product by id successfully'))
	async deleteproduct(@Param('id') id: string): Promise<ProductEnitty> {
		return this.productsService.getOneProduct(id)
	}

	@Patch(':productId')
	// @Roles(Role.Admin, Role.Shop)
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@UseInterceptors(FilesInterceptor('product_thumbs'))
	@UseInterceptors(new ResponseInterceptor('update product  successfully'))
	async updateProduct(
		@Param('productId') productId: string,
		@Request() { user },
		@Body() payload: UpdateProducttDto,
		@UploadedFiles() product_thumbs?: File[]
	): Promise<ProductEnitty> {
		let product_attributes = payload.product_attributes
		if (typeof product_attributes === 'string') {
			product_attributes = JSON.parse(product_attributes as unknown as string)
		}
		return this.productsService.updateProduct(payload.product_type, productId, {
			...payload,
			product_shop: user,
			product_thumbs,
			product_attributes: product_attributes,
		})
	}
}
