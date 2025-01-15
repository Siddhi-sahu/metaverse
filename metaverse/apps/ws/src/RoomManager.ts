import { WebSocket } from "ws";

export class User {

    constructor(private ws: WebSocket) {

    }

    initHandlers() {
        this.ws.on("message", (data) => {
            const parsedData = JSON.parse(data.toString());

            switch (parsedData.type) {
                case "join":
            }
        })

    }
}