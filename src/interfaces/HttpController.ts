import { Router, type Request, type Response } from "express";
import type { Params } from "../domain/Params.js";
import { ExternalApiAdapter } from "../adapters/apis.adapter.js";

export function createHttpController() {
	const router = Router();
	const apiAdapter = new ExternalApiAdapter(3);
	router.get("/:franchise/:version", async (req: Request<Params>, res: Response) => {
		try {
			const result = await apiAdapter.fetchData({
				franchise: req.params.franchise,
				version: req.params.version,
				metadata: JSON.parse(req.query.metadata as string),
				config: JSON.parse(req.query.config as string)
			});
			return res.status(200).json(result);
		} catch (err: any) {
			return res.status(500).json({
				error: err.message
			});
		};
	});
	return router;
};