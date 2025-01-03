import { Router } from "express";
import { UpdateMetadataSchema } from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";

export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
    const parsedData = UpdateMetadataSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Validation error"
        });

        return;

    }

    try {
        await client.user.update({
            where: {
                id: req.userId
            },
            data: {
                avatarId: parsedData.data.avatarId
            }
        });
        res.json({
            msg: "Metadata Updated"
        })

    } catch (e) {
        res.status(403).json({ msg: "errir in /metadata" })

    }

});

userRouter.get("/metadata/bulk", (req, res) => {

})

