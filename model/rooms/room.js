import Crypto from 'crypto';
import { MongoKerberosError } from 'mongodb';
import RoleHandler from '../roles/roleHandler.js'
import Player from './player.js'
import mongoose from 'mongoose'

const gameSchema = new mongoose.Schema({
    roomName: String,
    players: [{playerName: String}],
    messages: [{message: String}],
    winningFaction: String,
    date: {type: Date, default: Date.now}
});
const Game = mongoose.model('Game', gameSchema);

const names = ["Glen", "Finn", "Alex", "Joey", "Noel", "Jade", "Nico", "Abby", "Liam", "Ivan", "Finn", "Adam", "Ella", "Erin", "Jane", "Lily", "Ruth", "Rhys", "Todd", "Reid"]

class Room {
    constructor(io, databaseServer) {
        this.io = io; //SocketIo
        this.databaseServer = databaseServer;

        //Data relating to the players in the room
        this.name = Crypto.randomBytes(8).toString('hex'); //Generates the room's name
        this.size = 4; //Capacity of the room
        this.playerCount = 0; //Number of players currently in the room
        this.playerList = []; //List of players in the room, containing this.player objects
            
        //Data relating to the state of the game.
        this.started = false; //Records if the game has started (So it can't be joined)
        this.time = ''; //The time of day (Night, day)
        this.roleList = []; //List of role ES6 classes
        this.factionList = []; //List of factions for the some of the role classes (Handles stuff like mafia talking at night to each other.)
        this.sessionLength = this.size * 4000; //How long the days/nights initially last for. Decreases over time, with nights at half the length of days 
        this.gameHasEnded = false;

        this.gameDB = new Game({name: this.name});
    }

    //Adds a new player to the room, and makes the game start if it is full. Returns error code if the user failed to join, or their username
    addPlayer(playerSocket) {
        let playerSocketId = playerSocket.id;
        //Stops the user from being added if there's an existing user with the same username or socketId, or if the room is full
        for(let i = 0; i < this.playerList.length; i++) {
            if(this.playerList[i].socketId === playerSocketId) return 1;
            else if(this.playerList.length >= this.size) return 3;
        }

        //Generates username
        let playerUsername = "";
        let takenNames = [];
        for(let i = 0; i < this.playerList.length; i++) takenNames.push(this.playerList[i].playerUsername);
        for(let i = 0; i < names.length; i++) {
            if(!takenNames.includes(names[i])) {
                playerUsername = names[i];
                break;
            }
        }

        this.emitPlayerList(playerSocketId);

        this.io.to(this.name).emit('receive-message', (playerUsername + ' has joined the room!'));
        playerSocket.data.position = this.playerList.push(new Player(playerSocket, playerSocketId, playerUsername)) - 1; //Adds a player to the array
        this.playerCount = this.playerList.length; //Updates the player count

        let playerObject = {};
        playerObject.name = playerUsername            
        this.io.to(this.name).emit('receive-new-player', playerObject);
        
        //Starts the game if the room has filled its maximum size
        if(this.playerCount === this.size) {
            this.started = true;
            this.io.to(this.name).emit('receive-message', 'The room is full! Starting the game!');
            this.emitPlayerList(this.name);
            this.playerList.forEach(player => this.gameDB.players.push({playerName: player.playerUsername}));
            this.startGame();
        }
        return playerUsername; //Successfully joined
    }

    //Handles a player being removed if they've disconnected
    removePlayer(playerSocketId) {
        for(let i = 0; i < this.playerList.length; i++) {
            if(this.playerList[i].socketId === playerSocketId && !this.gameHasEnded) { //!gameHasEnded stops leaving messages when the clients are booted when the game ends
                if(!this.started) { //Removes the player if the game has not started
                    let playerObject = {};
                    playerObject.name = this.playerList[i].playerUsername;            
                    this.io.to(this.name).emit('remove-player', playerObject);
                    this.io.to(this.name).emit('receive-message', (this.playerList[i].playerUsername + ' has left the room!'))
                    this.playerList.splice(i, 1);
                    for(let x = i; x < this.playerList.length; x++) this.playerList[x].socket.data.position = x; //Updates positions
                    this.playerCount = this.playerList.length;
                }
                else { //Kills the player if the game has started
                    this.io.to(this.name).emit('receive-message', (this.playerList[i].playerUsername + ' has abandoned the game!'))
                    this.playerList[i].role.damage = 999;
                }
            }
        }
    }

    isInRoom(playerSocketId) {
        for(let i = 0; i < this.playerList.length; i++) if(this.playerList[i].socketId == playerSocketId) return true;
        return false;
    }

    getPlayerByUsername(playerUsername) {
        for(let i = 0; i < this.playerList.length; i++) if(this.playerList[i].playerUsername.toLowerCase() == playerUsername) return this.playerList[i];
        return false;
    }

    emitPlayerList(socketId) { //Returns a player list 
        let playersReturned = [];
        for(let i = 0; i < this.playerList.length; i++) {
            let playerReturned = {};
            playerReturned.name = this.playerList[i].playerUsername;
            if(this.started) playerReturned.isAlive = this.playerList[i].isAlive; //isAlive is undefined if the game has not started
            if(this.started && !this.playerList[i].isAlive) this.playerList[i].role.name; //Reveals the role if the player is dead, and the game has started
            playersReturned.push(playerReturned);
        }
        this.io.to(socketId).emit('receive-player-list', playersReturned);
    }

    //Handles users sending messages to the chat 
    handleSentMessage(playerSocket, message, isDay) {
        try {
            if(!isDay && this.time === 'day' || isDay && this.time === 'night') return;

            let foundPlayer = this.playerList[playerSocket.data.position];
            if(this.started) { //If the game has started, handle the message with the role object
                if(foundPlayer.isAlive) {
                    //Starts with a / - Whisper/Role Command
                    if(message.charAt(0) == '/') {
                        if((message.charAt(1) == 'c' || message.charAt(1) == 'C') && this.time == 'day') { //Handle daytime commands
                            if(message.length == 2) foundPlayer.role.cancelDayAction();
                            else foundPlayer.role.handleDayAction(message);
                        }
                        else if((message.charAt(1) == 'c' || message.charAt(1) == 'C') && this.time == 'night') { //Handle nighttime commands
                            if(!foundPlayer.role.roleblocked) {
                                if(message.length == 2)  foundPlayer.role.cancelNightAction();
                                else foundPlayer.role.handleNightAction(message);
                            }
                            else this.io.to(playerSocket.id).emit('receive-message', 'You are roleblocked, and cannot call commands.'); //Generally, the only time when a player is roleblocked before the end of night is when they are jailed
                        }
                    }
                    else foundPlayer.role.handleMessage(message); //Doesn't start with either - send as a regular message
                }
                else this.io.to(playerSocket.id).emit('receive-message', 'You cannot speak, as you are dead.');
            }
            else this.io.to(this.name).emit('receive-chat-message', (foundPlayer.playerUsername + ': ' + message));  //If the game hasn't started, no roles have been assigned, just send the message directly
        }
        catch (error) {
            this.io.to(playerSocket.id).emit('receive-message', 'You cannot speak, as you are dead. Or an error occured.'); console.log(error);//Error is thrown if a player cannot be found
        }
    }

    handleVote(playerSocket, recipient, isDay) {
        try {
            if(!isDay && this.time === 'day' || isDay && this.time === 'night' || this.time === '') return;
            let foundPlayer = this.playerList[playerSocket.data.position];
            let foundRecipient = this.playerList[recipient];

            if(this.time != 'day') {
                this.io.to(playerSocket.id).emit('receive-message', 'You cannot vote at night.');
                return;
            }
            if(foundPlayer === foundRecipient) this.io.to(playerSocket.id).emit('receive-message', 'You cannot vote for yourself.');
            else if(foundRecipient.isAlive && !foundPlayer.hasVoted) {
                foundPlayer.hasVoted = true;
                foundRecipient.votesReceived++;
                if(foundRecipient.votesReceived > 1) this.io.to(this.name).emit('receive-message', (foundPlayer.playerUsername + ' has voted for ' + foundRecipient.playerUsername + ' to be executed! There are ' + foundRecipient.votesReceived + ' votes for ' + foundRecipient.playerUsername + ' to be killed.'));
                else this.io.to(this.name).emit('receive-message', (foundPlayer.playerUsername + ' has voted for ' + foundRecipient.playerUsername + ' to be executed! There is 1 vote for ' + foundRecipient.playerUsername + ' to be killed.'));
            }
            else if(foundPlayer.hasVoted) this.io.to(playerSocket.id).emit('receive-message', 'You cannot change your vote.');
            else this.io.to(playerSocket.id).emit('receive-message', 'Your vote was invalid.');
        }
        catch (error) {
            console.log(error)
        }
    }
    
    handleWhisper(playerSocket, recipient, message, isDay) {
        try {
            if(!isDay && this.time === 'day' || isDay && this.time == 'night' || this.time === '') return;
            let foundPlayer = this.playerList[playerSocket.data.position];
            let foundRecipient = this.playerList[recipient];

            if(this.time === 'night') this.io.to(foundPlayer.socketId).emit('receive-message', 'You cannot whisper at night.');
            else if(this.time === 'day' && foundRecipient.isAlive) {
                if(0.1 > Math.random()) { //10% chance of the whisper being overheard by the town.
                    this.io.to(foundPlayer.socketId).emit('receive-message', 'Your whispers were overheard by the town!');
                    this.io.to(this.name).emit('receive-message', (foundPlayer.playerUsername + ' tried to whisper \"' + message + '\" to ' + foundRecipient.playerUsername + ', but was overheard by the town!'));
                }
                else {
                    this.io.to(foundRecipient.socketId).emit('receive-whisper-message', 'Whisper from ' + foundPlayer.playerUsername + ': ' + message);
                    this.io.to(foundPlayer.socketId).emit('receive-whisper-message', 'Whisper to ' + foundRecipient.playerUsername + ': ' + message);
                    if(foundPlayer.role.dayTapped != false) this.io.to(foundPlayer.role.dayTapped.player.socketId).emit('receive-message', (foundPlayer.playerUsername + ' whispered \"' + message + '\" to ' + foundRecipient.playerUsername + '.'));
                    else if(foundRecipient.role.dayTapped != false) this.io.to(foundPlayer.role.dayTapped.player.socketId).emit('receive-message', (foundPlayer.playerUsername + ' whispered \"' + message + '\" to ' + foundRecipient.playerUsername + '.'));
                } 
            }
            else this.io.to(foundPlayer.socketId).emit('receive-message', 'You didn\'t whisper to a valid recipient, or they are dead.');
        }
        catch (error) {
            console.log(error)
        }
        
    }
    
    handleVisit(playerSocket, recipient, isDay) {
        try {
            if(!isDay && this.time === 'day' || isDay && this.time === 'night' || this.time === '') return;
            let foundPlayer = this.playerList[playerSocket.data.position];
            let foundRecipient = this.playerList[recipient];


        }
        catch (error) {
            console.log(error)
        }
        
    }

    async startGame() {
        let roleHandler = new RoleHandler(this.playerCount, this.io);
        this.roleList.push(...roleHandler.assignGame()); //The function returns an array of 'roles' classes, and appends them to the empty rolelist array
 
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
            this.playerList[i].socket.data.position = i;
            this.playerList[i].role = new this.roleList[i](this, this.playerList[i]); //Assigns the role to the player (this.roleList[i] is an ES6 class)

            let playerReturned = {};
            playerReturned.name = this.playerList[i].playerUsername;
            playerReturned.role = this.playerList[i].role.name;
            playerReturned.dayVisitSelf = this.playerList[i].role.dayVisitSelf;
            playerReturned.dayVisitOthers = this.playerList[i].role.dayVisitOthers;
            playerReturned.dayVisitFaction = this.playerList[i].role.dayVisitFaction;
            playerReturned.nightVisitSelf = this.playerList[i].role.nightVisitSelf;
            playerReturned.nightVisitOthers = this.playerList[i].role.nightVisitOthers;
            playerReturned.nightVisitFaction = this.playerList[i].role.nightVisitFaction; 

            this.io.to(this.playerList[i].socketId).emit('assign-player-role', playerReturned);
        }

        this.factionList.push(...roleHandler.assignFactionsFromPlayerList(this.playerList));
        //Assigns roles to each faction, then factions to each relevant role.
        for(let i = 0; i < this.factionList.length; i++) {
            this.factionList[i].findMembers(this.playerList);
        }

        roleHandler = null;
        this.startFirstDaySession(this.sessionLength);
    }

    //Sessions - Each session lasts for a period of time. 
    //After it is over, the room executes the actions decided by the players.
    //Then, it checks the living player's factions to determine if the game is over.

    //The first day session is shorter than normal.
    startFirstDaySession(sessionLength) {
        this.io.to(this.name).emit('receive-message', ('Day 1 has started.'));
        this.time='day';

        let dateTimeJson = {}
        dateTimeJson.time = 'Day';
        dateTimeJson.dayNumber = 1;
        dateTimeJson.timeLeft = 5;
        this.io.to(this.name).emit('update-day-time', dateTimeJson);

        setTimeout(() => {
            try {
                this.io.to(this.name).emit('receive-message', ('Night 1 has started.'));
                for(let i = 0; i < this.playerList.length; i++) {
                    if(this.playerList[i].isAlive) {
                        this.playerList[i].role.dayVisit();
                    }
                }
            }
            catch (error) {
                console.log(error)
            }

            this.startNightSession(1, sessionLength)
        }, 5000); //Starts the first day quicker 
    }

    startDaySession(dayNumber, sessionLength) {
        this.time='day';

        let dateTimeJson = {}
        dateTimeJson.time = 'Day';
        dateTimeJson.dayNumber = dayNumber;
        dateTimeJson.timeLeft = Math.floor(sessionLength/1000 + 10); //Converts ms to s, adds the 10s minimum
        this.io.to(this.name).emit('update-day-time', dateTimeJson);

        //Announcements to the game
        this.io.to(this.name).emit('receive-message', ('Day ' + dayNumber + ' has started.'));
        let livingPlayerList = [];
        for(let i = 0; i < this.playerList.length; i++) {
            if(this.playerList[i].isAlive) {
                this.playerList[i].hasVoted = false;
                this.playerList[i].votesReceived = 0;
                livingPlayerList.push(this.playerList[i]);
            }
        }
        
        let votesRequired = Math.floor(livingPlayerList.length / 2) + 1; //A majority of the players, for an execution to be carried out.
        this.io.to(this.name).emit('receive-message', ('It takes ' + votesRequired + ' votes for the town to kill a player.'))

        setTimeout(() => {
            try {
                for(let i = 0; i < livingPlayerList.length; i++) { //Eliminates the player if they have a majority of the votes.
                    if(livingPlayerList[i].votesReceived >= votesRequired) {
                        this.io.to(this.name).emit('receive-message', (livingPlayerList[i].playerUsername + ' has been voted out by the town.'));
                        this.io.to(livingPlayerList[i].socketId).emit('receive-message', 'You have been voted out of the town.');
                        this.io.to(livingPlayerList[i].socketId).emit('block-messages');
                        livingPlayerList[i].isAlive = false;
                        this.io.to(this.name).emit('update-player-role', {name: livingPlayerList[i].playerUsername}); //Marks player as dead client-side, does not reveal their role
                    }
                }

                this.io.to(this.name).emit('receive-message', ('Night ' + dayNumber + ' has started.'));

                //Handles day visits
                for(let i = 0; i < this.playerList.length; i++) {
                    if(this.playerList[i].isAlive) {
                        this.playerList[i].role.dayVisit();
                        this.playerList[i].role.dayTapped = false; //Undoes any daytapping by the tapper class
                    }
                }
            }
            catch(error) { //If something goes wrong in the game logic, just start the next period of time
                console.log(error);
            }

            //Checks if the game is over, and ends the room, or starts the next night.
            if(dayNumber < 25) { //Starts the next session, and ends the game if there's been 25 days.
                if(this.findWinningFaction() != false) {
                    this.endGame(this.findWinningFaction());
                }
                else {
                    this.startNightSession(dayNumber, sessionLength * 0.85); //The time each session lasts for decreases over time
                }
            }
            else {
                this.endGame('nobody');
            }

        }, sessionLength + 10000); //Days are a minimum of 10 seconds long
    }

    startNightSession(nightNumber, sessionLength) {
        this.time='night';
        
        let dateTimeJson = {}
        dateTimeJson.time = 'Night';
        dateTimeJson.dayNumber = nightNumber;
        dateTimeJson.timeLeft = Math.floor(sessionLength/2000 + 10); //Converts ms to s (nights are half the sessionLength), and then adds the 10s minimum
        this.io.to(this.name).emit('update-day-time', dateTimeJson);

        setTimeout(() => {
            try {
                this.time='undefined' //Prevents users from changing their visits

                //This handles factional decisions, and lets the factions assign the members "visiting" variable.
                for(let i = 0; i < this.factionList.length; i++) {
                    this.factionList[i].removeMembers();
                    this.factionList[i].handleNightVote();
                }

                //Roleblocking classes go first, and give the victims the roleblocked attribute
                for(let i = 0; i < this.playerList.length; i++) if(this.playerList[i].role.roleblocker) this.playerList[i].role.visit();
                //Marks who has visited who, and handles players whose abilities were disabled by being roleblocked
                for(let i = 0; i < this.playerList.length; i++) {
                    if(this.playerList[i].role.roleblocked && !this.playerList[i].role.roleblocker) { //Cancels vists for players that were roleblocked, and informs them.
                        this.playerList[i].role.visiting = null;
                        this.io.to(this.playerList[i].socketId).emit('receive-message', 'You were roleblocked!');
                        this.playerList[i].role.roleblocked = false;
                    }
                    else if(this.playerList[i].role.visiting != null) this.playerList[i].role.visit();
                }
                //Executes the effects that each visit has
                for(let i = 0; i < this.playerList.length; i++) if(this.playerList[i].isAlive) this.playerList[i].role.handleVisits(); //Handles actions for certain roles whose behaviour depends on who has visited who.
                //Kills players who have been attacked without an adequate defence, resets visits after night logic has been completed
                for(let i = 0; i < this.playerList.length; i++) {
                    if(this.playerList[i].isAlive) {
                        this.playerList[i].role.handleDamage(); //Handles the player being attacked, potentially killing them.
                        this.playerList[i].role.dayVisiting = null; //Resets dayvisiting
                        this.playerList[i].role.visiting = null; //Resets visiting.
                        this.playerList[i].role.roleblocked = false; //Resets roleblocked status
                        this.playerList[i].role.visitors = []; //Resets visitor list.
                        this.playerList[i].role.nightTapped = false; 
                    }
                }
            }
            catch(error) { //If something goes wrong, just start the next period of time
                console.log(error);
            }

            if(this.findWinningFaction() != false) this.endGame(this.findWinningFaction());
            else this.startDaySession(nightNumber + 1, sessionLength);
        }, 15000); //Nights are 15 seconds long.
        
    }

/*     handleVote(message, voterPlayer) { //Handles votes for the daytime execution mechanic
        message = message.substring(2).trim(); //Remove the /v, then spaces at the front/back
        //messageRecipientName is compared to actual names, which are also made lowercase
        let messageRecipientName = message.split(' ')[0].toLowerCase(); //The first words after the /v, which should be the username of the recipient
        let recipient = this.getPlayerByUsername(messageRecipientName);
        message = message.substring(messageRecipientName.length).trim(); //Removes the name, trying to leave just the message
    
        if(voterPlayer === recipient) this.io.to(voterPlayer.socketId).emit('receive-message', 'You cannot vote for yourself.');
        else if(this.time == 'day' && recipient.isAlive && !voterPlayer.hasVoted) {
            voterPlayer.hasVoted = true;
            recipient.votesReceived++;
            if(recipient.votesReceived > 1) this.io.to(this.name).emit('receive-message', (voterPlayer.playerUsername + ' has voted for ' + recipient.playerUsername + ' to be executed! There are ' + recipient.votesReceived + ' votes for ' + recipient.playerUsername + ' to be killed.'));
            else this.io.to(this.name).emit('receive-message', (voterPlayer.playerUsername + ' has voted for ' + recipient.playerUsername + ' to be executed! There is 1 vote for ' + recipient.playerUsername + ' to be killed.'));
        }
        else if(voterPlayer.hasVoted) this.io.to(voterPlayer.socketId).emit('receive-message', 'You cannot change your vote.');
        else this.io.to(voterPlayer.socketId).emit('receive-message', 'Your vote was invalid.');
    } */

    findWinningFaction() {
        let lastFaction = 'neutral'; //Compares the previous (non-neutral) faction with the next.
        for(let i = 0; i < this.playerList.length; i++) {
            if(this.playerList[i].role.group != 'neutral' && this.playerList[i].isAlive) {
                if(lastFaction == 'neutral') lastFaction = this.playerList[i].role.group;
                else if(this.playerList[i].role.group != lastFaction) return false; //Game is NOT over if there are are members of two different factions alive (excluding neutral)
            }
        }
        return lastFaction;
    }

    endGame(winningFactionName) {
        this.gameHasEnded = true;
        if(winningFactionName == 'nobody') this.io.to(this.name).emit('receive-message', 'The game has ended with a draw!');
        else if(winningFactionName == 'neutral') this.io.to(this.name).emit('receive-message', 'The neutral players have won!');
        else this.io.to(this.name).emit('receive-message', ('The ' + winningFactionName + ' has won!'));
        this.io.to(this.name).emit('receive-message', 'Closing the room!');
        this.io.to(this.name).emit('block-messages');
        this.io.in(this.name).disconnectSockets();
        this.gameDB.winningFaction = winningFactionName;
        this.gameDB.save();
    }
}

export default Room;