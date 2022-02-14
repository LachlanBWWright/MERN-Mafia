import Role from './role.js'

class Mafia extends Role {
    constructor(io) {
        super('Mafia', 'MafiaDesc', io)
    }
}

export default Mafia;