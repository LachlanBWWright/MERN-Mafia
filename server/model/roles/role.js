//This is the base class for a role

class Role {
    constructor(name, description, group, helpText, room, player, baseDefence) {
        //Text info
        this.name = name; //Name of the role
        this.description = description; //Description of the role
        this.group = group; //group for determining group-actions / group night chats / Ending the game
        this.helpText = helpText; //Role info that is sent when the player sends a help command

        //Classes
        this.room = room; //io for SocketIo emitting
        this.player = player; //The player object paired to the class

        //Role stats
        this.baseDefence = baseDefence; //The minimum 'defence power' the player hase
        this.defence; //The variable 'defence power' the player has each night
        this.damage; //The amount of damage that is received on a single night. If it's above defence, the player dies.

    }

    assignFaction(faction) { //Assigns the player a faction class
        this.faction = faction;
    }

    //Handles sending general message
    handleMessage(message) {
        if(this.room.time == 'day') { //Free speaking only at daytime
            this.room.io.to(this.room.name).emit('receive-message', (this.player.playerUsername + ': ' + message));
        }
        else if (typeof this.faction === 'undefined'){ //If the player isn't in a faction, they can't talk at night
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot speak at night.');
        }
        else { //Calls the function for handling the night chat.
            this.faction.handleNightMessage(message, this.player.playerUsername);
        }
        
    }

    handlePrivateMessage(message, recipient) { //Message string, recipient's class
        message = message.substring(2).trim(); //Remove the /w, then spaces at the front/back
        let messageRecipientName = message.split(' ')[0] //The first words after the /w, which should be the username of the recipient
        
        recipient = this.room.getPlayerByUsername(messageRecipientName);
        console.log(message + ' to: ' + recipient.playerUsername);
        message = message.substring(messageRecipientName.length).trim(); //Removes the name, trying to leave just the message

        if(this.room.time == 'night') {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot whisper at night.');
        }
        else if(recipient !== false) {
            if(0.1 > Math.random()) { //10% chance of the whisper being overheard by the town.
                this.room.io.to(this.player.socketId).emit('receive-message', 'Your whispers were overheard by the town!');
                this.room.io.to(this.room.name).emit('receive-message', (this.player.playerUsername + ' tried to whisper \"' + message + '\" to ' + messageRecipientName + '.'));
            }
            else {
                this.room.io.to(recipient.socketId).emit('receive-message', 'Whisper from ' + this.player.playerUsername + ': ' + message);
                this.room.io.to(this.player.socketId).emit('receive-message', 'Whisper to ' + messageRecipientName + ': ' + message);
            } 
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You didn\'t whisper to a valid recipient.');
        }
    }

    handleDayAction(message) { //Handles the class' daytime action
        this.room.io.to(this.player.socketId).emit('receive-message', 'Your class has no daytime action');
    }

    handleNightAction(message) { //Handles the class' nighttime action
        this.room.io.to(this.player.socketId).emit('receive-message', 'Your class has no nighttime action');
    }
}

export default Role