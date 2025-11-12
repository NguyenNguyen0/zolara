// Helper function to create standardized error responses
export const createErrorResponse = (
	res: any,
	statusCode: number,
	error: string,
	message: string,
	example: string | null = null,
) => {
	const errorObj: any = { error, message };
	if (example) errorObj.example = example;
	return res.status(statusCode).json(errorObj);
};

// Helper function to get topics count with validation
export const getValidatedTopicsCount = (queryCount: string | number | undefined): number => {
	return Math.min(Math.max(parseInt(String(queryCount)) || 3, 1), 5);
};

export const getValidatedTopic = (topic: string | undefined): string => {
	return topic ?? 'tin tức, drama';
};
