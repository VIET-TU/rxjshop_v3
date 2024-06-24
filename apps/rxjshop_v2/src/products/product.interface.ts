import { UpdateProducttDto } from './dtos/update-product.dto'
import { ProductEnitty } from './entities/product.entity'
import { SearchParam } from './dtos/key-search.dto'
import { CreatePostDto } from '../post/dto/create-post.dto'

export interface IProductService {
	createProduct(type: string, payload: CreatePostDto): Promise<ProductEnitty>
	updateProduct(type: string, productId: string, payload: UpdateProducttDto): Promise<ProductEnitty>
	productFilter(keySearch: SearchParam): Promise<ProductEnitty[]>
	getOneProduct(id: string): Promise<ProductEnitty>
}
