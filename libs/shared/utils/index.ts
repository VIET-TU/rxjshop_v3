import { filterDto } from 'apps/rxjshop_v2/src/products/dtos/key-search.dto'
import { UpdateProducttDto } from 'apps/rxjshop_v2/src/products/dtos/update-product.dto'

export const removeUndefinedObject = (obj: UpdateProducttDto) => {
	Object.keys(obj).forEach((key) => {
		if (obj[key] && typeof obj[key] === 'object') removeUndefinedObject(obj[key])
		else if (obj[key] == null) {
			delete obj[key]
		}
	})
	return obj
}

export const converToQueryRedis = (obj: Omit<filterDto, 'limit' | 'page'>): string => {
	const query = Object.keys(obj)
		.reduce((accumulator: string, key: any) => {
			switch (key) {
				case 'keySearch':
					return accumulator + `(@name:(${obj[key]}*)|@description:(${obj[key]}*))` + ' '
				case 'price':
					const priceArray = JSON.parse(obj[key])
					if (Array.isArray(priceArray)) {
						return accumulator + `@price:[${priceArray}]` + ' '
					}
					return accumulator
				case 'size':
					return accumulator + `@size:(${obj[key]})` + ' '
				case 'color':
					return accumulator + `@color:(${obj[key]})` + ' '
				default:
					return accumulator
			}
		}, '')
		.trim()

	console.log('query', query)
	return query
}
