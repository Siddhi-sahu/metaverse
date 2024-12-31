import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { SignupSchema } from "../../types";

export const router = Router();

router.post("/signup", (req, res) => {
    const parsedData = SignupSchema.safeParse(req.body);
    if (!parsedData.success) {
        return
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