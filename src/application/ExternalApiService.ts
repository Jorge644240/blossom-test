import { type Query } from "../domain/Query.js";
import { type APIResponse } from "../domain/APIResponse.js";

export interface ExternalApiPort {
	fetchData(query: Query): Promise<APIResponse>;
};