import { PlayerSocket } from "../../servers/socket.js";
import Role from "../roles/role.js";
import RoleChild from "../roles/roleChild.js";

class Player {
  socket: PlayerSocket;
  socketId: string;
  playerUsername: string;
  role: any;
  isAlive: boolean;
  hasVoted: boolean;
  votesReceived: number;

  constructor(socket: PlayerSocket, socketId: string, playerUsername: string) {
    this.socket = socket;
    this.socketId = socketId;
    this.playerUsername = playerUsername;
    this.role; //The player's role class
    this.isAlive = true;
    this.hasVoted = false;
    this.votesReceived = 0;
  }
}

export default Player;
