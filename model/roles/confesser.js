import Role from './role.js'

class Confesser extends Role {
    constructor(room, player) {
        super('Confesser', 'neutral', room, player, 1, false, false, false, false, false, false, false, false);
        this.victoryCondition = false;
        this.room.confesser = this;
    }
}

export default Confesser;