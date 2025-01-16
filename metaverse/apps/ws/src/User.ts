import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import { OutgoingMessage } from "./types";
import client from "@repo/db/client";

function getRandomString(length: number) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;

}

export class User {
    public id: string;
    private spaceId?: string;
    private x?: number;
    private y?: number;
    constructor(private ws: WebSocket) {
        this.id = getRandomString(10);

    }

    initHandlers() {
        this.ws.on("message", async (data) => {
            const parsedData = JSON.parse(data.toString());

            switch (parsedData.type) {
                case "join":
                    const spaceId = parsedData.payload.spaceId;

                    const space = await client.space.findFirst({
                        where: {
                            id: spaceId
                        }
                    })

                    if (!space) {
                        this.ws.close();
                        return;
                    };
                    this.spaceId = spaceId;
                    RoomManager.getInstance().addUser(spaceId, this);
                    this.x = Math.floor(Math.random() * space?.width);
                    this.y = Math.floor(Math.random() * space?.height)
                    this.send({
                        type: "space-joined",
                        payload: {
                            spawn: {
                                x: this.x,
                                y: this.y
                            },
                            users: RoomManager.getInstance().rooms.get(spaceId)?.map((u) => ({ id: u.id })) ?? []
                        }
                    })

                case "move":
                    const moveX = parsedData.payload.x;
                    const moveY = parsedData.payload.y;

                    this.x = moveX;
                    this.y = moveY;

                    this.broadcast(({

                    }))

            }
        })

    }

    send(payload: OutgoingMessage) {
        this.ws.send(JSON.stringify(payload))
    }
}