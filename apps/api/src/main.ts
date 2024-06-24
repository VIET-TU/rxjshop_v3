import { NestFactory } from '@nestjs/core'
import { ApiModule } from './api.module'
import { ConfigService } from '@nestjs/config'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { RmqService } from 'libs/shared/rmq/rmq.service'

async function bootstrap() {
	const app = await NestFactory.create(ApiModule)
	const confiservice = app.get(ConfigService)
	const QUEUE = confiservice.get('RABBITMQ_AUTH_QUEUE')
	const rmqService = app.get(RmqService)
	app.connectMicroservice<MicroserviceOptions>(rmqService.getRmqOptions(QUEUE))
	app.startAllMicroservices()
}
bootstrap()
