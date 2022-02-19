import Role from './role.js'

class Innocent extends Role {
    constructor(room, player) {
        super('Innocent', 'InnoDesc', 'town', 'You are innocent!', room, player, 0);
    }
}

export default Innocent;