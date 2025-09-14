import type { RequestLogPort } from "../application/RequestLogService.js";
import type { RequestLog } from "../domain/RequestLog.js";

export class RequestLogsAdapter implements RequestLogPort {
	private logs: RequestLog[] = [];
	save(log: RequestLog): void {
		this.logs.push(log);
	}
	findAll(): RequestLog[] {
		return [ ...this.logs ];
	}
};