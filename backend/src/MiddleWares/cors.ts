import { Request, Response, NextFunction } from "express";

export function cors(_: Request, res: Response, next: NextFunction) {
  res
    .header('Access-Control-Allow-Origin', '*')
    .header('Access-Control-Allow-Methods', '*')
    .header('Access-Control-Allow-Headers', '*');
  next();
}