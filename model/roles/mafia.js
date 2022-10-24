import RoleMafia from './roleMafia.js'

class Mafia extends RoleMafia {
    constructor(room, player) {
        super('Mafia', 'mafia', room, player, 0, false, false, false, false, false, false, false, true);
    }
}

export default Mafia;