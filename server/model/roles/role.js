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
        this.defence = this.baseDefence; //The variable 'defence power' the player has each night
        this.damage = 0; //The amount of damage that is received on a single night. If it's above defence, the player dies.

        //Role Action
        this.dayVisiting = null; //The role that the player is visiting (from a rarer day command).
        this.roleblocking = null; //The role that the player is roleblocking. This is separate to this.visiting due to it needing to be handled first.
        this.visiting = null; //The role that the player is visiting
        this.visitors = []; //A list of players visiting
        this.attackers = []; //A list of visitors who attacked the player

        //Role Statuses
        this.roleblocked = false; //If the player is being roleblocked at night
        this.dayTapped = false; //If the player is being daytapped (whispers to and fro are sent to tappers)
        this.nightTapped = false; //If the player is being nighttapped (They are warned, and any chat messages are sent to tappers)
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
            try {
                this.faction.handleNightMessage(message, this.player.playerUsername);
                if(this.nightTapped != false) this.room.io.to(this.nightTapped.player.socketId).emit('receive-message', (this.player.playerUsername + ': ' + message));
            }
            catch(error) {
                console.log(error);
            }
        }
        
    }

    handlePrivateMessage(message, recipient) { //Message string, recipient's class
        try{
            message = message.substring(2).trim(); //Remove the /w, then spaces at the front/back
            let messageRecipientName = message.split(' ')[0].toLowerCase(); //The first words after the /w, which should be the username of the recipient
            
            recipient = this.room.getPlayerByUsername(messageRecipientName);
            console.log(message + ' to: ' + recipient.playerUsername);
            message = message.substring(messageRecipientName.length).trim(); //Removes the name, trying to leave just the message

            if(this.room.time == 'night') {
                this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot whisper at night.');
            }
            else if(recipient !== false && this.room.time == 'day' && recipient.isAlive) {
                if(0.1 > Math.random()) { //10% chance of the whisper being overheard by the town.
                    this.room.io.to(this.player.socketId).emit('receive-message', 'Your whispers were overheard by the town!');
                    this.room.io.to(this.room.name).emit('receive-message', (this.player.playerUsername + ' tried to whisper \"' + message + '\" to ' + messageRecipientName + ', but was overheard by the town!'));
                }
                else {
                    this.room.io.to(recipient.socketId).emit('receive-message', 'Whisper from ' + this.player.playerUsername + ': ' + message);
                    this.room.io.to(this.player.socketId).emit('receive-message', 'Whisper to ' + messageRecipientName + ': ' + message);
                    if(this.dayTapped != false) this.room.io.to(this.dayTapped.player.socketId).emit('receive-message', (this.player.playerUsername + ' whispered \"' + message + '\" to ' + messageRecipientName + '.'));
                    else if(this.recipient.role.dayTapped != false) this.room.io.to(this.dayTapped.player.socketId).emit('receive-message', (this.player.playerUsername + ' whispered \"' + message + '\" to ' + messageRecipientName + '.'));
                } 
            }
            else {
                this.room.io.to(this.player.socketId).emit('receive-message', 'You didn\'t whisper to a valid recipient, or they are dead.');
            }
        }
        catch(error) {
            console.log(error);
        }
    }

    handleDayAction(message) { //Handles the class' daytime action
        this.room.io.to(this.player.socketId).emit('receive-message', 'Your class has no daytime action.');
    }

    cancelDayAction() { //Faction-based classes should override this function
        this.room.io.to(this.player.socketId).emit('receive-message', 'You have cancelled your class\' daytime action.');
        this.dayVisiting = null;
    }

    handleNightAction(message) { //Handles the class' nighttime action
        this.room.io.to(this.player.socketId).emit('receive-message', 'Your class has no nighttime action.');
    }

    cancelNightAction() { //Faction-based classes should override this function
        this.room.io.to(this.player.socketId).emit('receive-message', 'You have cancelled your class\' nighttime action.');
        this.visiting = null;
    }

    dayVisit() { //Visit another player (Day)

    }

    visit() { //Visit another player (Night)
        console.log('This should be overridden by a child class.');
    }

    receiveDayVisit(role) { //Called by another player visiting at night
        //TODO: Consider adding to this
    }

    receiveVisit(role) { //Called by another player visiting at day
        this.visitors.push(role);
    }

    handleDayVisits() { //Called after visit. For roles such as the watchman, who can see who has visited who
    }

    handleVisits() { //Called after visit. For roles such as the watchman, who can see who has visited who
    }

    handleDamage() { //Kills the player if they don't have adequate defence, then resets attack/damage
        if(this.damage > this.defence) { //Kills the player
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have died!');
            this.room.io.to(this.room.name).emit('receive-message', (this.player.playerUsername + ' has died. Their role was ' + this.name.toLowerCase() + '.'));
            this.player.isAlive = false;
            this.damage = 0; //Stops the player from being spammed with death messages after they die.
            this.attackers = [];
        }
        else { //Resets stats
            if(this.damage != 0) {
                this.room.io.to(this.player.socketId).emit('receive-message', 'You were attacked, but you survived!');
            }
            this.defence = this.baseDefence;
            this.damage = 0;
            this.attackers = [];
        }
    }
}

export default Role