export interface CreateOptions {
	ON?: 'HASH' | 'JSON'
	PREFIX?: string | Array<string>
	FILTER?: string
	LANGUAGE?: RedisSearchLanguages
	LANGUAGE_FIELD?: PropertyName
	SCORE?: number
	SCORE_FIELD?: PropertyName
	MAXTEXTFIELDS?: true
	TEMPORARY?: number
	NOOFFSETS?: true
	NOHL?: true
	NOFIELDS?: true
	NOFREQS?: true
	SKIPINITIALSCAN?: true
	STOPWORDS?: string | Array<string>
}

export declare enum RedisSearchLanguages {
	ARABIC = 'Arabic',
	BASQUE = 'Basque',
	CATALANA = 'Catalan',
	DANISH = 'Danish',
	DUTCH = 'Dutch',
	ENGLISH = 'English',
	FINNISH = 'Finnish',
	FRENCH = 'French',
	GERMAN = 'German',
	GREEK = 'Greek',
	HUNGARIAN = 'Hungarian',
	INDONESAIN = 'Indonesian',
	IRISH = 'Irish',
	ITALIAN = 'Italian',
	LITHUANIAN = 'Lithuanian',
	NEPALI = 'Nepali',
	NORWEIGAN = 'Norwegian',
	PORTUGUESE = 'Portuguese',
	ROMANIAN = 'Romanian',
	RUSSIAN = 'Russian',
	SPANISH = 'Spanish',
	SWEDISH = 'Swedish',
	TAMIL = 'Tamil',
	TURKISH = 'Turkish',
	CHINESE = 'Chinese',
}

export type PropertyName = `${'@' | '$.'}${string}`
