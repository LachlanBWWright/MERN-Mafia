import Role from './role.js'

class Mafia extends Role {
    constructor(room) {
        super('Mafia', 'MafiaDesc', 'You are Mafia!', room)
    }
}

export default Mafia;