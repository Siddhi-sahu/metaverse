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
            mapElements: true
        }
    });

    if (!map) {
        res.status(400).json({ msg: "Map not found!" });
        return;
    }

    await client.$transaction(async () => {
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: parseInt(parsedData.data.dimensions.split("x")[0]),
                height: parseInt(parsedData.data.dimensions.split("x")[1]),
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
    })



})
spaceRouter.delete("/:spaceId", (req, res) => {

})
spaceRouter.get("/all", (req, res) => {

})

spaceRouter.post("/element", (req, res) => {

})
spaceRouter.delete("/element", (req, res) => {

})
spaceRouter.get("/:spaceId", (req, res) => {

})
