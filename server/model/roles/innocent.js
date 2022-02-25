import Role from './role.js'

class Innocent extends Role {
    constructor(room, player) {
        super('Innocent', 'You are innocent. Find the mafia, and vote them out.', 'town', 'You are innocent!', room, player, 0);
    }
}

export default Innocent;