import Role from './role.js'

class Innocent extends Role {
    constructor(room) {
        super('Innocent', 'InnoDesc', 'You are innocent!', room);
    }
}

export default Innocent;