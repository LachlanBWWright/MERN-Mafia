import { MessageToClient } from "../../../shared/socketTypes/socketTypes";
import { SocketHandler } from "./socketHandler";
import { io } from "../../servers/socket";

export class PartyKitHandler extends SocketHandler {
  sendPlayerMessage(playerSocketId: string, message: MessageToClient): void {
    // io.to(playerSocketId).emit("receive-message", message);
  }

  sendRoomMessage(roomId: string, message: MessageToClient): void {}
}
