import Role from './role.js'

class Mafia extends Role {
    constructor(room, player) {
        super('Mafia', 'MafiaDesc', 'You are Mafia!', room, player, 0)
    }
}

export default Mafia;