import { io } from "../../servers/socket";
import Player from "../rooms/player";

abstract class Faction {
  memberList: Player[] = [];

  initializeMembers() {
    for (let i = 0; i < this.memberList.length; i++) {
      this.memberList[i].role.assignFaction(this);
      for (let x = 0; x < this.memberList.length; x++) {
        io.to(this.memberList[x].socketId).emit("update-faction-role", {
          name: this.memberList[i].playerUsername,
          role: this.memberList[i].role.name,
        });
      }
    }
  }

  abstract sendMessage(message: string): void; //Sends a message to all members of the faction
  abstract handleNightVote(): void; //Handles factional decisions
  abstract handleNightMessage(message: string, playerUsername: string): void; //Handles night chat
  abstract removeMembers(): void; //Removes members if they have died, or been converted to another faction
}

export default Faction;
