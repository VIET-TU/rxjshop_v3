import { DynamicModule, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientProxyFactory, Transport } from '@nestjs/microservices'
import { RmqService } from './rmq.service'

interface RmqModuleOptions {
	service: string
	queue: string
}

@Module({
	providers: [RmqService],
	exports: [RmqService],
})
export class RmqModule {
	static register({ service, queue }: RmqModuleOptions): DynamicModule {
		const providers = [
			{
				provide: service,
				useFactory: (configService: ConfigService) => {
					const USER = configService.get('RABBITMQ_USER')
					const PASSWORD = configService.get('RABBITMQ_PASS')
					const HOST = configService.get('RABBITMQ_HOST')

					return ClientProxyFactory.create({
						transport: Transport.RMQ,
						options: {
							urls: [`amqp://${USER}:${PASSWORD}@${HOST}`],
							queue,
							queueOptions: {
								durable: true, // queue survives broker restart
							},
						},
					})
				},
				inject: [ConfigService],
			},
		]

		return {
			module: RmqModule,
			providers,
			exports: providers,
		}
	}
}
