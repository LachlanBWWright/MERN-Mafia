import Role from './role.js'

class Framer extends Role {
    constructor(room, player) {
        super('Framer', 'neutral', room, player, 1, false, false, false, false, false, false, false, false);
        this.victoryCondition = false;
        this.target = null; //Target to kill (player object)
        this.room.framer = this;
    }

    initRole() { // Find a random target
        let length = this.room.playerList.length;
        let index = Math.floor(Math.random()*length);
        for(let i = 0; i < length; i++) {
            //console.log((index + i) % length)
            //console.log(this.room.playerList[(index + i) % length])
            if(this.room.playerList[(index + i) % length].role.group === 'town' && this.room.playerList[(index + i) % length].isAlive) {
                this.target = this.room.playerList[(index + i) % length];
                this.room.io.to(this.player.socketId).emit('receive-message', 'Your target is ' + this.target.playerUsername + '. You will win the game if you get them voted out. If your target dies before day 5, they will be replaced.');
                break;
            }
        }
    }

    dayUpdate() { //Updates the target 
        if(this.target.isAlive || this.victoryCondition) return; //Nothing happens if the target isn't dead, or the player's already won.
        let length = this.room.playerList.length;
        let index = Math.floor(Math.random()*length);
        for(let i = 0; i < length; i++) {
            if(this.room.playerList[(index + i) % length].role.group === 'town' && this.room.playerList[(index + i) % length].isAlive) {
                this.target = this.room.playerList[(index + i) % length];
                this.room.io.to(this.player.socketId).emit('receive-message', 'Your new target is ' + this.target.playerUsername + '. You will win the game if you get them voted out. If your target dies before day 5, they will be replaced.');
                break;
            }
        }
    }
}

export default Framer;