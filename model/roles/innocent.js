import Role from './role.js'

class Innocent extends Role {
    constructor(room, player) {
        super('Innocent', 'town', room, player, 0, false);
    }
}

export default Innocent;