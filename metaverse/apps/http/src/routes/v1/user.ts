import { Router } from "express";
import { UpdateMetadataSchema } from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";

export const userRouter = Router();


userRouter.post("/metadata", userMiddleware, async (req, res) => {
    const parsedData = UpdateMetadataSchema.safeParse(req.body)
    if (!parsedData.success) {
        console.log("parsed data incorrect")
        res.status(400).json({ message: "Validation failed" })
        return
    }
    try {
        await client.user.update({
            where: {
                id: req.userId
            },
            data: {
                avatarId: parsedData.data.avatarId
            }
        })
        res.json({ message: "Metadata updated" })
    } catch (e) {
        console.log("error")
        res.status(400).json({ message: "Internal server error" })
    }
})


userRouter.get("/metadata/bulk", async (req, res) => {
    const userIdsString = (req.query.ids ?? "[]") as string;
    const userIds = (userIdsString).slice(1, userIdsString?.length - 1).split(",");

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

