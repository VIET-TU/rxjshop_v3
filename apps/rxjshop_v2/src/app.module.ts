import { HandlebarsAdapter, MailerModule } from '@nest-modules/mailer'
import { BullModule } from '@nestjs/bull'
import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import { join } from 'path'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { MediaModule } from 'libs/shared/media/media.module'
import { ProductsModule } from './products/products.module'
import { RedisModule } from 'libs/shared/redis/redis.module'
import { UserModule } from './user/user.module'
import { HttpExceptionFilter } from 'libs/shared/utils/filters/http-exception.filter'
import { RateLimitMiddleware } from 'libs/shared/utils/middlewares/rateLimit.middleware'
import { CartsModule } from './carts/carts.module'
import { UserEntity } from './user/entities/user.entity'
import { CartEntity } from './carts/entities/cart.entity'
import { KeyTokenEntity } from './auth/entities/keyToken.entity'
import { ProductEnitty } from './products/entities/product.entity'
import { ElectronicEntity } from './products/entities/electronic.entity'
import { ClothingEntity } from './products/entities/clothing.entity'
import { CartItemEntity } from './carts/entities/cart-item.entity'
import { MediaEntity } from 'libs/shared/media/entities/media.entity'
import { ColorEntity } from './products/entities/color.entity'
import { SizeEntity } from './products/entities/size.entity'
import { CategoryEntity } from './products/entities/category.entity'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (config: ConfigService) => ({
				transport: {
					host: config.get('MAIL_HOST'),
					secure: false,
					auth: {
						user: config.get('MAIL_USER'),
						pass: config.get('MAIL_PASSWORD'),
					},
				},
				defaults: {
					from: `"No Reply" <${config.get('MAIL_FROM')}>`,
				},
				template: {
					dir: join(__dirname, '/templates/email/'),
					adapter: new HandlebarsAdapter(),
					options: {
						strict: true,
					},
				},
			}),
			inject: [ConfigService],
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get<string>('DATABASE_HOST'),
				port: parseInt(configService.get<string>('DATABASE_PORT')),
				username: configService.get<string>('DATABASE_USER'),
				password: configService.get<string>('DATABASE_PASSWORD'),
				database: configService.get<string>('DATABASE_NAME'),
				entities: [
					CartEntity,
					UserEntity,
					KeyTokenEntity,
					ProductEnitty,
					ElectronicEntity,
					ClothingEntity,
					CartItemEntity,
					MediaEntity,
					ColorEntity,
					SizeEntity,
					CategoryEntity,
				],
				synchronize: true,
				logging: true,
			}),
			inject: [ConfigService],
		}),
		BullModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				redis: {
					host: configService.get<string>('REDIS_HOST'),
					port: configService.get<number>('REDIS_PORT'),
					username: configService.get<string>('REDIS_USERNAME'),
					password: configService.get<string>('REDIS_PASSWORD'),
				},
			}),
			inject: [ConfigService],
		}),

		// CacheModule.registerAsync({
		// 	isGlobal: true,
		// 	useFactory: async () => ({
		// 		store: new RedisStore({
		// 			client: redisClientFactory,
		// 		}) as unknown as CacheStore,
		// 	}),
		// }),
		RedisModule,
		UserModule,
		AuthModule,
		ProductsModule,
		MediaModule,
		CartsModule,
		MediaModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
	],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(RateLimitMiddleware).forRoutes('*')
	}
}
