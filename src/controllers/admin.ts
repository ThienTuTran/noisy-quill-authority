import type { Request, Response } from "express";

export function flag(_req: Request, res: Response) {
  res.json({ flag: process.env.FLAG });
}
