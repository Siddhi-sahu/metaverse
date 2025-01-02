import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { SignupSchema } from "../../types";
import client from "@repo/db/client";

export const router = Router();

router.post("/signup", async (req, res) => {
    const parsedData = SignupSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Validation failed" })
        return;
    }
    try {
        await client.user.create({
            data: {
                username: parsedData.data.username,
                password: parsedData.data.password,
                role: parsedData.data.type === "admin" ? "Admin" : "User"
            }
        })

    } catch (e) {

    }
    //db entery
    res.json({
        msg: "Signup"
    })
});

router.post("/signin", (req, res) => {
    res.json({
        msg: "Signin"
    })
})

router.get("/elements", (req, res) => {

})

router.get("/avatars", (req, res) => {

})

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter)