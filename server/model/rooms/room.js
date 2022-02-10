class Room {
    constructor(size) {
        //this.name = name; //Name of the room
        this.size = size; //Capacity of the room

        this.playerCount = 0;
    }

    roomSize = () => this.playerCount;
}

export default Room