import type { ExternalApiPort } from "../application/ExternalApiService.js";
import type { APIResponse } from "../domain/APIResponse.js";
import type { Query } from "../domain/Query.js";
import type { RequestLog } from "../domain/RequestLog.js";
import getRandomBackoffJitter from "../utils/fn/getRandomBackoffJitter.js";
import { RequestLogsAdapter } from "./logs.adapter.js";

export class ExternalApiAdapter implements ExternalApiPort {
	private config;
	public requests;
	constructor(maxRetries: number = 3) {
		this.config = {
			maxRetries
		};
		this.requests = new RequestLogsAdapter();
	}
	async fetchData(query: Query): Promise<APIResponse> {
		let result: APIResponse | boolean = false, attempt = 0, delayMs = 1000;
		while (!result && attempt<this.config.maxRetries) {
			try {
				attempt++;
				const response = await fetch(`${query.config.baseUrl}/${query.franchise}/${query.franchise==="pokemon" ? query.metadata.name : query.metadata.id}`.replace(/\/\//g, "\/"), {
					headers: {
						...query.config.headers,
						"Authorization": query.config.apiKey
					}
				});
				const requestLog: RequestLog = {
					franchise: query.franchise,
					version: query.version,
					metadata: query.metadata,
					timestamp: new Date(),
					statusCode: response.status,
					status: response.ok ? "success" : "fail",
					error: response.ok ? undefined : `Request failed with status code ${response.status}`
				};
				if (!response.ok) throw new Error(`Request failed with status code ${response.status}`);
				const apiResponse: any = await response.json();
				requestLog.result = apiResponse;
				result = {
					name: apiResponse.name,
					powers: query.franchise==="pokemon" ? apiResponse.abilities : apiResponse.skills,
					evolutions: query.franchise==="pokemon" ? apiResponse.forms : apiResponse.nextEvolutions,
					weight: query.franchise==="pokemon" ? apiResponse.weight : undefined
				};
			} catch (err: any) {
				if (attempt < this.config.maxRetries) {
					await new Promise(resolve => setTimeout(resolve, delayMs+getRandomBackoffJitter()));
					delayMs += delayMs;
				};
			};
		};
		if (!result) throw new Error(`API call failed. Maximum retries (${this.config.maxRetries}) reached.`);
		return result;
	}
};