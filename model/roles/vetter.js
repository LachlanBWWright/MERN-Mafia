import Role from './role.js'

//This class judges the alignment of the selected target (usually!)
class Vetter extends Role {
    constructor(room, player) {
        super('Vetter', 'town', room, player, 0, false, false, false, false, true, false, false);
        this.researchSlots = 3;
    }
    
    handleNightAction(recipient) { //Vote on who should be attacked
        if(this.researchSlots == 0) this.room.io.to(this.player.socketId).emit('receive-message', 'You have no research sessions left!');
        else if(this.visiting == null) {
            this.visiting = this;
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have decided to stay home and research into people\'s history.');
        }
        else {
            this.visiting = null;
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have decided not to research into people\'s history.');
        }
    }

    visit() { //Selects two random people to visit
        try {
            //Gets two different players at random
            this.visiting.receiveVisit(this);
            this.researchSlots--
            let randomPlayerOne = Math.floor(Math.random() * this.room.playerList.length);
            let randomPlayerTwo = randomPlayerOne;
            while(randomPlayerTwo == randomPlayerOne && this.room.playerList.length > 1) randomPlayerTwo = Math.floor(Math.random() * this.room.playerList.length);

            if(Math.random() > 0.5) {
                this.room.io.to(this.player.socketId).emit('receive-message', 'You researched into ' + this.room.playerList[randomPlayerOne].playerUsername + ' and ' + this.room.playerList[randomPlayerTwo].playerUsername + ', finding that at least one of them is a ' + this.room.playerList[randomPlayerOne].role.name + '.');
            }
            else {
                this.room.io.to(this.player.socketId).emit('receive-message', 'You researched into ' + this.room.playerList[randomPlayerOne].playerUsername + ' and ' + this.room.playerList[randomPlayerTwo].playerUsername + ', finding that at least one of them is a ' + this.room.playerList[randomPlayerTwo].role.name + '.');
            }
            this.room.io.to(this.player.socketId).emit('receive-message', `You have ${this.researchSlots} research sessions left.`);
        }
        catch (error) {
            console.log(error);
        }
    }
}

export default Vetter;