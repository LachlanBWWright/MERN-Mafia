import Role from './role.js'

class Mafia extends Role {
    constructor(room) {
        super('Mafia', 'MafiaDesc', room)
    }
}

export default Mafia;