import { ProductEnitty } from '../entities/product.entity'

export interface ReponseGetProducts {
	products: ProductEnitty[]
	totalPage: number
	currentPage: number
	count: number
}
