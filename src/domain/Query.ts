export interface Query {
	franchise: "pokemon" | "digimon",
	version: string,
	metadata: Record<string, any>,
	config: Record<string, any>
};