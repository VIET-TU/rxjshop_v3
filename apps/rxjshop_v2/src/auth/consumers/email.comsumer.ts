import { MailerService } from '@nest-modules/mailer'
import { Processor, Process } from '@nestjs/bull'

import { Job } from 'bull'

interface IDataJob {
	name: string
	to: string
}

@Processor('send-email')
export class EmailConsumer {
	constructor(private mailerservice: MailerService) {}
	@Process('register')
	async registerEmail(job: Job<IDataJob>) {
		await this.mailerservice.sendMail({
			to: job.data.to,
			subject: 'Welcome to my website',
			template: './welcome',
			context: {
				name: job.data.name,
			},
		})
		console.log('send success')
	}
}
