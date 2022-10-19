//This is the base class for a role

class Role {
    // Role name, Group Name, SocketIo Room, Player Class, Base Defence, Is Roleblocker, Day visits, night visits
    constructor(name, group, room, player, baseDefence, roleblocker, dayVisitSelf, dayVisitOthers, dayVisitFaction, nightVisitSelf, nightVisitOthers, nightVisitFaction, nightVote) {
        //Text info
        this.name = name; //Name of the role
        this.group = group; //group for determining group-actions / group night chats / Ending the game

        //Classes
        this.room = room; //io for SocketIo emitting
        this.player = player; //The player object paired to the class

        //Role stats
        this.baseDefence = baseDefence; //The minimum 'defence power' the player has
        this.defence = this.baseDefence; //The variable 'defence power' the player has each night
        this.damage = 0; //The amount of damage that is received on a single night. If it's above defence, the player dies.

        //Who the role can visit, for UI purposes (True/False)
        this.dayVisitSelf = dayVisitSelf;
        this.dayVisitOthers = dayVisitOthers;
        this.dayVisitFaction = dayVisitFaction; //Also false if the role does not have a faction
        this.nightVisitSelf = nightVisitSelf;
        this.nightVisitOthers = nightVisitOthers;
        this.nightVisitFaction = nightVisitFaction; //Also false if the role does not have a faction
        this.nightVote = nightVote;

        //Role Action
        this.dayVisiting = null; //The role that the player is visiting (from a rarer day command).
        this.roleblocking = null; //The role that the player is roleblocking. This is separate to this.visiting due to it needing to be handled first.
        this.visiting = null; //The role that the player is visiting
        this.visitors = []; //A list of players visiting
        this.attackers = []; //A list of visitors who attacked the player

        //Role Statuses
        this.roleblocker = roleblocker; //If the class is a roleblocker class, who executes actions before the rest
        this.roleblocked = false; //If the player is being roleblocked at night
        this.dayTapped = false; //If the player is being daytapped (whispers to and fro are sent to tappers)
        this.nightTapped = false; //If the player is being nighttapped (They are warned, and any chat messages are sent to tappers)
        this.jailed = null; //Null if not jailed, reference to the jailor's class if jailed.
    }

    assignFaction(faction) { //Assigns the player a faction class
        this.faction = faction;
    }

    initRole() { //Initialises a role, overridden by child classes when required.
    }

    dayUpdate() { //Updates a role at the start of each day from day 2, overridden by child classes when required.
    }

    //Handles sending general message
    handleMessage(message) {
        if(this.room.time == 'day') { //Free speaking only at daytime
            this.room.io.to(this.room.name).emit('receive-chat-message', (this.player.playerUsername + ': ' + message));
        }
        else if(this.jailed != null) { //Special logic for jailee-jailor messaging conversation
            this.room.io.to(this.player.socketId).emit('receive-chat-message', (this.player.playerUsername + ': ' + message));
            this.room.io.to(this.jailed.player.socketId).emit('receive-chat-message', (this.player.playerUsername + ': ' + message));
        }
        else if(this.name == 'Jailor' && this.dayVisiting != null) { //Special logic for jailor => jailee messaging
            this.room.io.to(this.player.socketId).emit('receive-chat-message', ('Jailor: ' + message));
            this.room.io.to(this.dayVisiting.player.socketId).emit('receive-chat-message', ('Jailor: ' + message));
        }
        else if (typeof this.faction === 'undefined'){ //If the player isn't in a faction, they can't talk at night
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot speak at night.');
        }
        else { //Calls the function for handling the night chat.
            try {
                this.faction.handleNightMessage(message, this.player.playerUsername);
                if(this.nightTapped != false) this.room.io.to(this.nightTapped.player.socketId).emit('receive-chat-message', (this.player.playerUsername + ': ' + message));
            }
            catch(error) {
                console.log(error);
            }
        }
    }

    handleDayAction(recipient) { //Handles the class' daytime action
        this.room.io.to(this.player.socketId).emit('receive-message', 'Your class has no daytime action.');
    }

    cancelDayAction() { //Faction-based classes should override this function
        this.room.io.to(this.player.socketId).emit('receive-message', 'You have cancelled your class\' daytime action.');
        this.dayVisiting = null;
    }

    handleNightAction(recipient) { //Handles the class' nighttime action
        this.room.io.to(this.player.socketId).emit('receive-message', 'Your class has no nighttime action.');
    }

    handleNightVote(recipient) {
        this.room.io.to(this.player.socketId).emit('receive-message', 'Your class has no nighttime factional voting.');
    }

    cancelNightAction() { //Faction-based classes should override this function
        this.room.io.to(this.player.socketId).emit('receive-message', 'You have cancelled your class\' nighttime action.');
        this.visiting = null;
    }

    receiveVisit(role) { //Called by another player visiting at day
        this.visitors.push(role);
    }

    handleDamage() { //Kills the player if they don't have adequate defence, then resets attack/damage
        if(this.baseDefence > this.defence) this.defence = this.baseDefence;
        if(this.damage > this.defence) { //Kills the player
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have died!');
            this.room.io.to(this.player.socketId).emit('block-messages');
            this.room.io.to(this.room.name).emit('receive-message', (this.player.playerUsername + ' has died. Their role was ' + this.name.toLowerCase() + '.'));
            this.player.isAlive = false;
            this.damage = 0; //Stops the player from being spammed with death messages after they die.
            this.attackers = [];

            let tempPlayer = {};
            tempPlayer.name = this.player.playerUsername;
            tempPlayer.role = this.name;
            this.room.io.to(this.room.name).emit('update-player-role', tempPlayer);
            return true;
        }
         //Resets stats
        if(this.damage != 0) this.room.io.to(this.player.socketId).emit('receive-message', 'You were attacked, but you survived!');
        this.defence = this.baseDefence;
        this.damage = 0;
        this.attackers = [];
        return false;
    }

    //These should be overriden by child classes if applicable
    dayVisit() {} //Visit another player (Day)
    visit() {} //Visit another player (Night)
    receiveDayVisit(role) {} //Called by another player visiting at night
    handleDayVisits() {} //Called after visit. For roles such as the watchman, who can see who has visited who
    handleVisits() {} //Called after visit. For roles such as the watchman, who can see who has visited who
}

export default Role