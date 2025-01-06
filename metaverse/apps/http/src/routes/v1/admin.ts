import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import { CreateAvatarSchema, CreateElementSchema, UpdateElementSchema } from "../../types";
import client from "@repo/db/client";

export const adminRouter = Router();

adminRouter.post("/element", adminMiddleware, async (req, res) => {
    const parsedData = CreateElementSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            msg: "Validation failed"
        });
        return;
    };

    const element = await client.element.create({
        data: {
            width: parsedData.data.width,
            height: parsedData.data.height,
            static: parsedData.data.static,
            imageUrl: parsedData.data.imageUrl
        }
    });

    res.json({
        id: element.id
    })



})
adminRouter.put("/element/:elementId", adminMiddleware, async (req, res) => {
    const parsedData = UpdateElementSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({
            msg: "Validation failed"
        });
        return;

    }

    await client.element.update({
        where: {
            id: req.params.elementId
        },
        data: {
            imageUrl: parsedData.data.imageUrl
        }
    });

    res.json({
        msg: "Element updated"
    })

})
adminRouter.post("/avatar", async (req, res) => {
    const parsedData = CreateAvatarSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            msg: "Validation Error"
        })
    };

    const avatar = await client.avatar.create({
        data: {
            name: parsedData.data?.name,
            imageUrl: parsedData.data?.imageUrl
        }
    });

    res.json({
        id: avatar.id
    })

})
adminRouter.get("/map", (req, res) => {

})