class Faction {
  constructor(io) {
    this.memberList = [];
    this.io = io;
  }

  initializeMembers() {
    for (let i = 0; i < this.memberList.length; i++) {
      this.memberList[i].role.assignFaction(this);
      for (let x = 0; x < this.memberList.length; x++) {
        this.io
          .to(this.memberList[x].socketId)
          .emit("update-faction-role", {
            name: this.memberList[i].playerUsername,
            role: this.memberList[i].role.name,
          });
      }
    }
  }

  handleNightVote() {
    //Handles factional decisions
    console.log("This should be overridden by child classes.");
  }

  handleNightMessage(message, playerUsername) {
    //Handles night chat
    console.log("handleNightMessage should be overridden by child classes.");
  }

  removeMembers() {
    //Removes members if they have died, or been converted to another faction
    console.log("removeMembers should be overridden by child classes.");
  }
}

export default Faction;
