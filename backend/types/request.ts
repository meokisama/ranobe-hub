import type { Request } from "express";

// Express Request with a typed body. The shape is guaranteed at runtime by the
// express-validator middleware on each route, so handlers can read req.body as this type.
export type TypedRequest<Body> = Request<Record<string, string>, unknown, Body>;
