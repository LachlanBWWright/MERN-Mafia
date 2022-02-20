import Crypto from 'crypto';
import RoleHandler from '../roles/roleHandler.js'
import Player from './player.js'

class Room {
    constructor(size, io, roomType) {
        //SocketIo
        this.io = io;

        //Data relating to the players in the room
        this.name = Crypto.randomBytes(8).toString('hex'); //Generates the room's name
        this.size = size; //Capacity of the room
        this.playerCount = 0; //Number of players currently in the room
        this.playerList = []; //List of players in the room, containing this.player objects
            //player.socketId, player.playerUsername, player.role

        //Data relating to the state of the game.
        this.started = false; //Records if the game has started (So it can't be joined)
        this.time = ''; //The time of day (Night, day)
        this.roleList = []; //List of role ES6 classes
        this.factionList = []; //List of factions for the some of the role classes (Handles stuff like mafia talking at night to each other.)
        this.roomType = roomType //The type of the game (Determines the roles used)
        this.sessionLength = 60000 //How long the days/nights initially last for. Decreases over time, with nights at half the length of days
        }

    //Adds a new player to the room, and makes the game start if it is full
    addPlayer(playerSocketId, playerUsername) {
        //Stops the user from being added if there's an existing user with the same username or socketId, or if the room is full
        for(let i = 0; i < this.playerList.length; i++) {
            console.log('Loop')
            if(this.playerList[i].socketId === playerSocketId || this.playerList[i].playerUsername == playerUsername || this.playerList.length == this.size) {
                return;
            }
        }

        this.io.to(this.name).emit('receive-message', (playerUsername + ' has joined the room!'));
        this.playerList.push(/* player */new Player(playerSocketId, playerUsername)); //Adds a player to the array TODO: Rollback this if game is broken
        this.playerCount = Object.keys(this.playerList).length; //Updates the player count
        
        //Starts the game if the room has filled its maximum size
        if(this.playerCount === this.size) {
            //TODO: Purge players that do not have an active connection, and abort. (Made less necessary by disconnect functionality)

            this.started = true;
            this.io.to(this.name).emit('receive-message', 'The room is full! Starting the game!');
            this.io.to(this.name).emit('receive-message', 'Send \"?\" in chat to view help for your role, and how to access its commands, starting with /c!');
            this.io.to(this.name).emit('receive-message', 'Send \"/w playerName message\" at daytime to try and whipser to them. Careful! There\s a 1/10 chance of the town hearing you!');
            this.io.to(this.name).emit('receive-message', 'Send \"/v playerName \" from day 2 to vote for players to be executed.');
            //List all the players in the game.
            let playerAnnounce = 'The list of living players is: ';
            for(let i = 0; i < this.playerList.length - 1; i++) {
                playerAnnounce = playerAnnounce.concat(this.playerList[i].playerUsername + ', ');
            }

            //TODO: Create faction objects.

            playerAnnounce = playerAnnounce.concat('and ' + this.playerList[this.playerList.length - 1].playerUsername + '.')
            this.io.to(this.name).emit('receive-message', playerAnnounce); 

            this.startGame();
        }
    }

    //Handles a player being removed if they've disconnected
    removePlayer(playerSocketId) {
        console.log('Disconnect Test');
        for(let i = 0; i < this.playerList.length; i++) {
            if(this.playerList[i].socketId === playerSocketId) {
                this.io.to(this.name).emit('receive-message', (this.playerList[i].playerUsername + ' has left the room!'))
                this.playerList.splice(i, 1); //This should remove the player from the array
            }
        }
    }

    isInRoom(playerSocketId) {
        //console.log('Test');
        for(let i = 0; i < this.playerList.length; i++) {
            console.log('Test');
            console.log(  this.playerList[i] + ' ' + this.playerList[i].socketId + ' ' + playerSocketId)
            if(this.playerList[i].socketId == playerSocketId)
                return true;
        }
        return false;
    }

    getPlayerByUsername(playerUsername) {
        for(let i = 0; i < this.playerList.length; i++) {
            if(this.playerList[i].playerUsername == playerUsername) {
                console.log('Player found by username ' + this.playerList[i].playerUsername)
                return this.playerList[i];
            }      
        }
        return false;
    }

    //Handles users sending messages to the chat 
    handleSentMessage(playerSocketId, message) {
        try {
            let foundPlayer = this.playerList.find(player => player.socketId === playerSocketId);
            if(this.started) { //If the game has started, handle the message with the role object
                console.log('Handle sent message test');
                if(foundPlayer.isAlive) {
                    //TODO: Add support for role commands
                    if(message.charAt(0) == '?') {  //Starts with a ? - Help Command
                        this.io.to(playerSocketId).emit('receive-message', foundPlayer.role.helpText);
                    }
                    //Starts with a / - Whisper/Role Command
                    else if(message.charAt(0) == '/') {
                        if(message.charAt(1) == 'w' || message.charAt(1) == 'W') { //Handle whispering
                            foundPlayer.role.handlePrivateMessage(message);
                        }
                        else if((message.charAt(1) == 'c' || message.charAt(1) == 'C') && this.time == 'day') { //Handle daytime commands
                            foundPlayer.role.handleDayAction(message);
                        }
                        else if((message.charAt(1) == 'c' || message.charAt(1) == 'C') && this.time == 'night') { //Handle nighttime commands
                            foundPlayer.role.handleNightAction(message);
                        }
                        
                    }
                    //Doesn't start with either - send as a regular message
                    else { //TODO: Use role's messaging function instead
                       //this.io.to(this.name).emit('receive-message', (foundPlayer.playerUsername + ': ' + message)); 
                       foundPlayer.role.handleMessage(message);
                    }
                }
                else {
                    this.io.to(playerSocketId).emit('receive-message', 'You cannot speak, as you are dead.');
                }
            }
            else { //If the game hasn't started, no roles have been assigned, just send the message directly
                this.io.to(this.name).emit('receive-message', (foundPlayer.playerUsername + ': ' + message));
            }
        }
        catch (error) {
            console.log('Something went wrong ' + error)
        }
    }

    async startGame() {
        let roleHandler = new RoleHandler(this.playerCount, 'vanillaGame', this.io);
        this.roleList.push(...roleHandler.assignGame()); //The function returns an array of 'roles' classes, and appends them to the empty rolelist array
        this.factionList.push(...roleHandler.assignFactions())//TODO: Give the user a faction as well

        //TODO: Each faction object is assigned the list of relevant players
        //TODO: Then each faction object goes through the lists, and adds itself to the each members's player class

        //Announces the roles in the game to the chat window
        let roleAnnounce = 'The roles present in this game are: ';
        for(let i = 0; i < this.roleList.length - 1; i++) { //Builds
            roleAnnounce = roleAnnounce.concat(this.roleList[i].name + ', ');
        }
        roleAnnounce = roleAnnounce.concat('and ' + this.roleList[this.roleList.length - 1].name + '.');
        this.io.to(this.name).emit('receive-message', roleAnnounce);
        
        //Shuffles the list of roles so that they can be randomly allocated to users
        let currentIndex = this.roleList.length;
        let randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex)  //Math.floor truncates to make integers (5.99 => 5)
            currentIndex--;
            [this.roleList[currentIndex], this.roleList[randomIndex]] = [this.roleList[randomIndex], this.roleList[currentIndex]];
        }

        //Allocates the shuffled rolelist to users
        for(let i = 0; i < this.playerList.length ; i++) {
            this.playerList[i].role = new this.roleList[i](this, this.playerList[i]); //Assigns the role to the player (this.roleList[i] is an ES6 class)
            this.io.to(this.playerList[i].socketId).emit('receive-message', ('Your role is: ' + this.playerList[i].role.name)) //Sends each player their role
        }

        //Assigns roles to each faction, then factions to each relevant role.
        for(let i = 0; i < this.factionList.length; i++) {
            this.factionList[i].findMembers(this.playerList);
        }

        this.startFirstDaySession(this.sessionLength);
    }

    //Sessions - Each session lasts for a period of time. 
    //After it is over, the room executes the actions decided by the players.
    //Then, it checks the living player's factions to determine if the game is over.

    //The first day session is shorter than normal.
    startFirstDaySession(sessionLength) {
        this.io.to(this.name).emit('receive-message', ('Day 1 has started.'));
        this.time='day';
        setTimeout(() => {
            this.startNightSession(1, sessionLength)
        }, 10000); //Starts the first day quicker 
    }

    startDaySession(dayNumber, sessionLength) {
            console.log('Day');
            //await setTimeout(() => this.startNightSession(dayNumber), sessionLength + 10000); //Days are a minimum of 10 seconds
            //this.startNightSession(dayNumber, sessionLength*0.85); //The game gradually speeds up over time.
            this.io.to(this.name).emit('receive-message', ('Day ' + dayNumber + ' has started.'));
            this.time='day';
            setTimeout(() => {
                try {

                }
                catch(error) { //If something goes wrong in the game logic, just start the next period of time
                    console.log(error);
                }

                if(dayNumber < 25) { //Starts the next session, and ends the game if there's been 25 days.
                    this.startNightSession(dayNumber, sessionLength * 0.85);
                }
                else {
                    //TODO: Game ending code
                    console.log('Game over!');
                }
            }, sessionLength + 10000); //Days are a minimum of 10 seconds long
    }
    //TODO: Night Session
    startNightSession(nightNumber, sessionLength) {
        this.io.to(this.name).emit('receive-message', ('Night ' + nightNumber + ' has started.'));
        this.time='night';
        setTimeout(() => {
            try {

                //TODO: Let Players set who they visit

                //TODO: At the end of the night, go through each player and execute the 'visit'


            }
            catch(error) { //If something goes wrong, just start the next period of time
                console.log(error);
            }

            this.startDaySession(nightNumber + 1, sessionLength);
        }, sessionLength/2 + 10000); //Nights are shorter than days, but also a minimum of 10 secconds.
        
    }
}

export default Room