import { Router } from "express";
import { CreateSpaceSchmea } from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";

export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req, res) => {
    const parsedData = CreateSpaceSchmea.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            msg: "Validation failed"
        });
        return;
    }

    if (!parsedData.data.mapId) {

        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: parseInt(parsedData.data.dimensions.split("x")[0]),
                height: parseInt(parsedData.data.dimensions.split("x")[1]),
                createrId: req.userId!
            }

        });
        res.json({ spaceId: space.id });
    }

    const map = await client.map.findUnique({
        where: {
            id: parsedData.data.mapId
        },
        select: {
            mapElements: true,
            width: true,
            height: true
        }
    });

    if (!map) {
        res.status(400).json({ msg: "Map not found!" });
        return;
    }

    let space = await client.$transaction(async () => {
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: map.width,
                height: map.height,
                createrId: req.userId!
            }
        })

        await client.spaceElements.createMany({
            data: map.mapElements.map(e => ({
                spaceId: space.id,
                elementId: e.elementId,
                x: e.x!,
                y: e.y!
            }))
        })

        return space;
    })
    res.json({ spaceId: space.id })



})
spaceRouter.delete("/:spaceId", userMiddleware, async (req, res) => {
    const space = await client.space.findUnique({
        where: {
            id: req.params.spaceId
        },
        select: {
            createrId: true
        }
    });

    if (!space) {
        res.status(400).json({ msg: "Space not found" });
        return;
    }

    if (space.createrId != req.userId) {
        res.status(403).json({
            msg: "Unauthorized"
        });
        return;
    }

    await client.space.delete({
        where: {
            id: req.params.spaceId
        }
    });

    res.json({ msg: "Space deleted" })

})
spaceRouter.get("/all", userMiddleware, async (req, res) => {
    const spaces = await client.space.findMany({
        where: {
            createrId: req.userId
        }
    });

    res.json({
        spaces: spaces.map(s => ({
            id: s.id,
            name: s.name,
            thumbnail: s.thumbnail,
            dimensions: `${s.width}x${s.height}`

        }))
    })

})

spaceRouter.post("/element", (req, res) => {

})
spaceRouter.delete("/element", (req, res) => {

})
spaceRouter.get("/:spaceId", (req, res) => {

})
