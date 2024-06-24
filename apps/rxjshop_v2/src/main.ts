import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import * as cookieParser from 'cookie-parser'
import helmet from 'helmet'
import * as compression from 'compression'
import * as morgan from 'morgan'
import validationOptions from 'libs/shared/utils/validation-options'
import { HEADER } from './auth/enums/header.enum'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	console.log(__dirname)
	app.enableCors({
		credentials: true,
		origin: 'http://localhost:3000',
	})
	app.use(morgan('dev'))
	app.use(cookieParser())
	app.use(helmet())
	app.use(compression())
	app.useGlobalPipes(new ValidationPipe(validationOptions))

	await app.listen(4000)
}
bootstrap()
