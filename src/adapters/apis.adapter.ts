import type { ExternalApiPort } from "../application/ExternalApiService.js";
import type { APIResponse } from "../domain/APIResponse.js";
import type { Query } from "../domain/Query.js";
import type { RequestLog } from "../domain/RequestLog.js";
import getRandomBackoffJitter from "../utils/fn/getRandomBackoffJitter.js";
import { RequestLogsAdapter } from "./logs.adapter.js";

export class ExternalApiAdapter implements ExternalApiPort {
	private config;
	private requests;
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
				if (!response.ok) {
					this.requests.save(requestLog);
					throw new Error(`Request failed with status code ${response.status}`);
				};
				const apiResponse: any = await response.json();
				result = {
					name: apiResponse.name,
					powers: query.franchise==="pokemon" ? apiResponse.abilities.map((ab: any) => ab.ability?.name) : apiResponse.skills.map((sk: any) => sk.skill),
					evolutions: query.franchise==="pokemon" ? apiResponse.forms.map((ev: any) => ev.name) : apiResponse.nextEvolutions.map((ev: any) => ev.digimon),
					weight: query.franchise==="pokemon" ? apiResponse.weight : undefined
				};
				requestLog.result = result;
				this.requests.save(requestLog);
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