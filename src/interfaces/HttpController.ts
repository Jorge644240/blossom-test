import { Router, type Request, type Response } from "express";
import type { Params } from "../domain/Params.js";
import { type ExternalApiPort } from "../application/ExternalApiService.js";

export function createHttpController(apiAdapter: ExternalApiPort) {
	const router = Router();
	router.get("/:franchise/:version", async (req: Request<Params>, res: Response) => {
		try {
			let metadata = {}, config = {};
			try {
				metadata = req.query.metadata ? JSON.parse(req.query.metadata as string) : {};
				config = req.query.config ? JSON.parse(req.query.config as string) : {};
			} catch (err) {
				return res.status(400).json({
					error: "Missing or invalid JSON values"
				});
			};
			const result = await apiAdapter.fetchData({
				franchise: req.params.franchise,
				version: req.params.version,
				metadata,
				config
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