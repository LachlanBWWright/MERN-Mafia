import { SocketHandler } from "./socketHandler";
import { MessageToClient } from "../../../shared/socketTypes/socketTypes";

export class PartyKitHandler extends SocketHandler {
  private partyKit: any; // Replace with actual type if available

  constructor(partyKit: any) {
    super();
    this.partyKit = partyKit;
  }

  sendPlayerMessage(playerSocketId: string, message: MessageToClient): void {
    this.partyKit.sendMessage(playerSocketId, message);
  }

  sendRoomMessage(roomId: string, message: MessageToClient): void {
    this.partyKit.sendMessageToRoom(roomId, message);
  }
}
