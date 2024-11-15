import { PlayerSocket } from "../../servers/socket.js";
import { BlankRole } from "../roles/blankRole.js";
import { Room } from "../rooms/room.js";

export class Player {
  socket: PlayerSocket;
  socketId: string;
  playerUsername: string;
  role: any;
  isAlive: boolean;
  hasVoted: boolean;
  votesReceived: number;

  constructor(
    socket: PlayerSocket,
    socketId: string,
    playerUsername: string,
    room: Room,
  ) {
    this.socket = socket;
    this.socketId = socketId;
    this.playerUsername = playerUsername;
    this.role;
    this.isAlive = true;
    this.hasVoted = false;
    this.votesReceived = 0;
  }
}
