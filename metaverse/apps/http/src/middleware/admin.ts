import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];
    const token = header?.split(" ")[1];
    if (!token) {
        res.status(403).json({
            msg: "UnAuthorized"
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_PASSWORD) as { role: string, userId: string };
        if (decoded.role !== "Admin") {
            res.status(403).json({ msg: "Unauthorized" })
            return;
        }
        req.userId = decoded.userId;
        next();

    } catch (e) {
        res.status(401).json({
            msg: "Unauthorized"
        });
        return
    }

}