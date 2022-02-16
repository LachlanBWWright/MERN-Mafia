import Role from './role.js'

class Innocent extends Role {
    constructor(room) {
        super('Innocent', 'InnoDesc', room);
    }
}

export default Innocent;