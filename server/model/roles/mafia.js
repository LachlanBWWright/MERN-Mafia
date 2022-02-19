import Role from './role.js'

class Mafia extends Role {
    constructor(room, player) {
        super('Mafia', 'MafiaDesc', 'mafia', 'You are Mafia!', room, player, 0)
    }

    handleNightAction(message) {
        this.room.io.to(this.player.socketId).emit('receive-message', 'Night action test');
    }
}

export default Mafia;