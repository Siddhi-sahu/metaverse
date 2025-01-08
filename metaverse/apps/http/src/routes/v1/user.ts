import { Router } from "express";
import { UpdateMetadataSchema } from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";

export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
    console.log("req.userId:", req.userId);
    const parsedData = UpdateMetadataSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log("parsed data incorrect")
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
        res.status(400).json({ msg: "errir in /metadata" })

    }

});

userRouter.get("/metadata/bulk", async (req, res) => {
    const userIdsString = (req.query.ids ?? "[]") as string;
    const userIds = (userIdsString).slice(1, userIdsString?.length - 2).split(",");

    const metadata = await client.user.findMany({
        where: {
            id: {
                in: userIds
            }
        },
        select: {
            avatar: true,
            id: true
        }
    });
    res.json({
        avatars: metadata.map(m => ({
            userId: m.id,
            avatarId: m.avatar?.imageUrl
        }))
    })

})

