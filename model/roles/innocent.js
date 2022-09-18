import Role from './role.js'

class Innocent extends Role {
    constructor(room, player) {
        super('Innocent', 'town', room, player, 0, false, false, false, false, false, false, false);
    }
}

export default Innocent;