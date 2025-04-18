import { io } from "../../servers/socket.js";
import { Faction } from "./abstractFaction.js";
import { Player } from "../player/player.js";
import { Role } from "../roles/abstractRole.js";

export class MafiaFaction extends Faction {
  attackList: Player[] = [];

  findMembers(playerList: Player[]) {
    //Go through a list of members, add them to the this.memberList
    for (let i = 0; i < playerList.length; i++) {
      if (playerList[i].role.group == "mafia") {
        this.memberList.push(playerList[i]);
      }
    }

    this.initializeMembers(); //Then adds this faction to each relevant member's object
  }

  handleNightVote() {
    for (let i = 0; i < this.memberList.length; i++) {
      if (this.memberList[i].role.attackVote != null)
        this.attackList.push(this.memberList[i].role.attackVote); //Adds the vote to attack to the list
      this.memberList[i].role.attackVote = null;
    }
    if (this.attackList.length != 0) {
      let victim =
        this.attackList[Math.floor(Math.random() * this.attackList.length)]; //Selects a random item in the list, and uses that.
      let attacker =
        this.memberList[Math.floor(Math.random() * this.memberList.length)]
          .role;
      attacker.visiting = victim;
      attacker.isAttacking = true;

      //this.memberList[Math.floor(Math.random() * this.memberList.length)].role.visiting = victim; //Selects a random mafia member to make the attack
      //TODO: Replace above line
    }
    this.attackList = [];
  }

  handleNightMessage(message: string, playerUsername: string) {
    //Mafia only chat
    let nightMessage = playerUsername + ": " + message;

    //Sends the message to every member of the faction.
    for (let i = 0; i < this.memberList.length; i++) {
      io.to(this.memberList[i].socketId).emit(
        "receive-chat-message",
        nightMessage,
      );
    }
  }

  sendMessage(message: string) {
    for (let i = 0; i < this.memberList.length; i++) {
      io.to(this.memberList[i].socketId).emit("receiveMessage", message);
    }
  }

  //For overriding a class' visiting behaviour
  visit(role: Role) {
    if (role.visiting != null) {
      role.visiting.receiveVisit(role);
      if (role.visiting.damage == 0) role.visiting.damage = 1; //Attacks the victim
      role.visiting.attackers.push(role);
    }
  }

  removeMembers() {
    for (let i = 0; i < this.memberList.length; i++) {
      if (
        !this.memberList[i].isAlive ||
        this.memberList[i].role.group != "mafia"
      ) {
        this.memberList.splice(i, 1);
        i--;
      }
    }
  }
}
