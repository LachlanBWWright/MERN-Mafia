import Faction from "./faction.js";

class LawmanFaction extends Faction {
  constructor(io) {
    super(io);

    this.room;
  }

  findMembers(playerList) {
    //Go through a list of members, add them to the this.memberList
    for (let i = 0; i < playerList.length; i++) {
      if (playerList[i].role.name == "Lawman") {
        this.memberList.push(playerList[i]);
      }
    }

    if (this.memberList.length > 0) this.room = this.memberList[0].role.room;

    this.initializeMembers(); //Then adds this faction to each relevant member's object
  }

  handleNightVote() {
    //Called at the end of the night. Forces a random visit for insane members.
    for (let i = 0; i < this.memberList.length; i++) {
      if (this.memberList[i].role.isInsane) {
        //Selects a random person to visit
        for (let f = 0; f < 100; f++) {
          //Uses this instead of a while loop just in case some error occurs
          try {
            let randomVictim =
              this.room.playerList[
                Math.floor(Math.random() * this.room.playerList.length)
              ];
            if (randomVictim.isAlive) {
              console.log(randomVictim.role.name);
              this.memberList[i].role.visiting = randomVictim.role;
              f = 1000;
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
  }

  handleNightMessage(message, playerUsername) {
    //Tells the player that they cannot speak at night.
    for (let i = 0; i < this.memberList.length; i++) {
      if (this.memberList[i].playerUsername == playerUsername) {
        this.io
          .to(this.memberList[i].socketId)
          .emit("receive-message", "You cannot speak at night.");
      }
    }
  }

  sendMessage(message) {
    for (let i = 0; i < this.memberList.length; i++) {
      this.io.to(this.memberList[i].socketId).emit("receive-message", message);
    }
  }

  removeMembers() {
    for (let i = 0; i < this.memberList.length; i++) {
      if (
        !this.memberList[i].isAlive ||
        this.memberList[i].role.name != "Lawman"
      ) {
        this.memberList.splice(i, 1);
        i--;
      }
    }
  }
}

export default LawmanFaction;
