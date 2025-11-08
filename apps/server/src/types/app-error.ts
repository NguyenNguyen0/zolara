export class AppError extends Error {
	status: number;
	code?: string;
	type?: string;
	title?: string;
	extras?: Record<string, unknown>;

	constructor(
		message: string,
		status = 500,
		code?: string,
		extras?: Record<string, unknown>,
	) {
		super(message);
		this.status = status;
		this.code = code;
		this.extras = extras;
		this.name = 'AppError';
	}
}

