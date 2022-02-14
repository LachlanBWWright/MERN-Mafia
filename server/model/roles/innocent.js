import Role from './role.js'

class Innocent extends Role {
    constructor(io) {
        super('Innocent', 'InnoDesc', io);
    }
}

export default Innocent;