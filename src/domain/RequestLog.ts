export interface RequestLog {
	franchise: "pokemon" | "digimon",
	version: string,
	metadata: string | Record<string, any>,
	timestamp: Date,
	statusCode: number,
	status: "success" | "fail",
	error: string | undefined,
	result?: string | Record<string, any> | undefined
};