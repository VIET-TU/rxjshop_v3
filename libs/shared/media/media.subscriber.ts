import {
	DataSource,
	EventSubscriber,
	TransactionCommitEvent,
	TransactionRollbackEvent,
} from 'typeorm'
import { MediaEntity } from './entities/media.entity'
import { MediaService } from './services/media.service'
import { EntitySubscriber } from '../bases/base.entity.subscriper'

@EventSubscriber()
export class MediaSubscriber extends EntitySubscriber<MediaEntity> {
	private entity: MediaEntity | undefined

	constructor(
		dataSource: DataSource,
		private readonly mediaService: MediaService
	) {
		super(dataSource)
	}

	/**
	 * Indicates that this subscriber only listen to Post events.
	 */
	listenTo() {
		return MediaEntity
	}

	/**
	 * Called after transaction rollback.
	 */
	async afterTransactionRollback(event: TransactionRollbackEvent) {
		const medias = event.manager['entities'].inserted.filter(
			(entity) => entity.constructor === MediaEntity
		) as MediaEntity[]
		for (const media of medias) {
			// delete image on s3 bucket
			await this.mediaService.deleteFileS3(media.key)
			console.log('rollback >> delete s3 key successfully')
		}
	}

	/**
	 * Called after transaction commit.
	 */
	async afterTransactionCommit(event: TransactionCommitEvent) {
		const medias = event.manager['entities'].removed.filter(
			(entity) => entity.constructor === MediaEntity
		) as MediaEntity[]
		for (const media of medias) {
			// delete image on s3 bucket
			await this.mediaService.deleteFileS3(media.key)
			console.log('commit >> delete s3 key successfully')
		}
	}
}
