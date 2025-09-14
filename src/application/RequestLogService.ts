import type { RequestLog } from "../domain/RequestLog.js";

export interface RequestLogPort {
	save(result: RequestLog): void,
	findAll(): RequestLog[]
};