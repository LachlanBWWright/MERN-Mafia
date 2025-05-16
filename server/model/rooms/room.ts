import Crypto from "crypto";
import { RoleHandler } from "./initRoles/roleHandler.js";
import { Player } from "../player/player.js";
import type { PlayerSocket } from "../../servers/socket.js";
import { io } from "../../servers/socket.js";
import { Confesser } from "../roles/neutral/confesser.js";
import { Faction } from "../factions/abstractFaction.js";
import { BlankRole } from "../roles/blankRole.js";
import { Framer } from "../roles/neutral/framer.js";
import { Peacemaker } from "../roles/neutral/peacemaker.js";
import { names } from "../player/names/namesList.js";

export class Room {
  name: string;
  size: number;
  playerCount = 0;
  playerList: Player[] = [];

  started = false;
  time: "day" | "night" | "" | "undefined" = "";
  roleList: (typeof BlankRole)[] = [];
  factionList: Faction[] = [];
  sessionLength: number;
  gameHasEnded = false;
  endDay = 3;

  //Data for handling unique roles
  framer: Framer | null = null; //Reference to the framer role, initialized by the roles constructor if applicable.
  confesserVotedOut = false; //Confessor role, who wants to get voted out
  peacemaker: Peacemaker | null = null; //Pleacemaker role, who wants to cause a tie by nobody dying for three days

  confesser?: Confesser;

  constructor(size: number) {
    //Data relating to the players in the room
    this.name = Crypto.randomBytes(8).toString("hex"); //Generates the room's "name"
    this.size = size; //Capacity of the room

    //Data relating to the state of the game.
    this.sessionLength = this.size * 4000; //How long the days/nights initially last for. Decreases over time, with nights at half the length of days
  }

  //Adds a new player to the room, and makes the game start if it is full. Returns error code if the user failed to join, or their username
  addPlayer(playerSocket: PlayerSocket) {
    let playerSocketId = playerSocket.id;
    //Stops the user from being added if there's an existing user with the same username or socketId, or if the room is full
    for (const player of this.playerList) {
      if (player.socketId === playerSocketId) return 1;
      else if (this.playerList.length >= this.size) return 3;
    }

    //Generates username
    let playerUsername = "";
    let takenNames = [];
    for (const player of this.playerList)
      takenNames.push(player.playerUsername);
    for (const name of names) {
      if (!takenNames.includes(name)) {
        playerUsername = name;
        break;
      }
    }

    this.emitPlayerList(playerSocketId);

    io.to(this.name).emit(
      "receiveMessage",
      playerUsername + " has joined the room!",
    );
    playerSocket.data.position =
      this.playerList.push(
        new Player(playerSocket, playerSocketId, playerUsername, this),
      ) - 1; //Adds a player to the array
    this.playerCount = this.playerList.length; //Updates the player count
    io.to(this.name).emit("receive-new-player", { name: playerUsername });

    //Starts the game if the room has filled its maximum size
    if (this.playerCount === this.size) {
      this.started = true;
      io.to(this.name).emit(
        "receiveMessage",
        "The room is full! Starting the game!",
      );
      this.emitPlayerList(this.name);
      this.startGame();
    }
    return playerUsername; //Successfully joined
  }

  //Handles a player being removed if they've disconnected
  removePlayer(playerSocketId: string) {
    let i = 0;
    for (const player of this.playerList) {
      if (player.socketId === playerSocketId && !this.gameHasEnded) {
        //!gameHasEnded stops leaving messages when the clients are booted when the game ends
        if (!this.started) {
          //Removes the player if the game has not started
          io.to(this.name).emit("remove-player", {
            name: player.playerUsername,
          });
          io.to(this.name).emit(
            "receiveMessage",
            player.playerUsername + " has left the room!",
          );
          this.playerList.splice(i, 1);
          for (let x = i; x < this.playerList.length; x++) {
            const nextPlayer = this.playerList[x];
            if (!nextPlayer) {
              continue;
            }
            nextPlayer.socket.data.position = x; //Updates positions
          }
          this.playerCount = this.playerList.length;
        } else {
          //Kills the player if the game has started
          io.to(this.name).emit(
            "receiveMessage",
            player.playerUsername + " has abandoned the game!",
          );
          player.role.damage = 999;
        }
      }
      i++;
    }
  }

  isInRoom(playerSocketId: string) {
    for (const player of this.playerList)
      if (player.socketId == playerSocketId) return true;
    return false;
  }

  emitPlayerList(socketId: string) {
    //Returns a player list
    let playersReturned = [];
    for (const player of this.playerList) {
      playersReturned.push({
        name: player.playerUsername,
        isAlive: this.started ? player.isAlive : undefined, //isAlive is undefined if the game has not started
        role: this.started && !player.isAlive ? player.role.name : undefined, //Reveals the role if the player is dead, and the game has started
      });
    }
    io.to(socketId).emit("receive-player-list", playersReturned);
  }

  //Handles users sending messages to the chat
  handleSentMessage(
    playerSocket: PlayerSocket,
    message: string,
    isDay: boolean,
  ) {
    try {
      if (
        (!isDay && this.time === "day") ||
        (isDay && this.time === "night") ||
        playerSocket.data.position === undefined
      )
        return;

      let foundPlayer = this.playerList[playerSocket.data.position];
      if (foundPlayer === undefined) {
        io.to(playerSocket.id).emit(
          "receiveMessage",
          "Player object could not be found.",
        );
        return;
      }
      if (this.started) {
        //If the game has started, handle the message with the role object
        if (foundPlayer.isAlive) foundPlayer.role.handleMessage(message);
        //Doesn't start with either - send as a regular message
        else
          io.to(playerSocket.id).emit(
            "receiveMessage",
            "You cannot speak, as you are dead.",
          );
      } else
        io.to(this.name).emit(
          "receive-chat-message",
          foundPlayer.playerUsername + ": " + message,
        ); //If the game hasn't started, no roles have been assigned, just send the message directly
    } catch (error) {
      io.to(playerSocket.id).emit(
        "receiveMessage",
        "You cannot speak, as you are dead. Or an error occured.",
      );
      console.log(error); //Error is thrown if a player cannot be found
    }
  }

  handleVote(playerSocket: PlayerSocket, recipient: number, isDay: boolean) {
    try {
      if (
        (!isDay && this.time === "day") ||
        (isDay && this.time === "night") ||
        this.time === "" ||
        playerSocket.data.position === undefined
      )
        return; //Cancels on client-server time mismatch, or if the time is invalid
      let foundPlayer = this.playerList[playerSocket.data.position];
      let foundRecipient = this.playerList[recipient];
      if (!foundPlayer || !foundRecipient) {
        io.to(playerSocket.id).emit(
          "receiveMessage",
          "Player object could not be found.",
        );
        return;
      } else if (foundPlayer.hasVoted)
        io.to(playerSocket.id).emit(
          "receiveMessage",
          "You cannot change your vote.",
        );
      else if (foundPlayer === foundRecipient)
        io.to(playerSocket.id).emit(
          "receiveMessage",
          "You cannot vote for yourself.",
        );
      else if (this.time != "day") {
        if (foundPlayer.role.nightVote) {
          foundPlayer.hasVoted = true;
          foundPlayer.role.handleNightVote(foundRecipient);
        } else
          io.to(playerSocket.id).emit(
            "receiveMessage",
            "You cannot vote at night.",
          );
      } else if (this.confesserVotedOut)
        io.to(playerSocket.id).emit(
          "receiveMessage",
          "The town voted out a confessor, disabling voting.",
        );
      else if (foundRecipient.isAlive && !foundPlayer.hasVoted) {
        foundPlayer.hasVoted = true;
        foundRecipient.votesReceived++;
        if (foundRecipient.votesReceived > 1)
          io.to(this.name).emit(
            "receiveMessage",
            foundPlayer.playerUsername +
              " has voted for " +
              foundRecipient.playerUsername +
              " to be executed! There are " +
              foundRecipient.votesReceived +
              " votes for " +
              foundRecipient.playerUsername +
              " to be killed.",
          );
        else
          io.to(this.name).emit(
            "receiveMessage",
            foundPlayer.playerUsername +
              " has voted for " +
              foundRecipient.playerUsername +
              " to be executed! There is 1 vote for " +
              foundRecipient.playerUsername +
              " to be killed.",
          );
      } else
        io.to(playerSocket.id).emit("receiveMessage", "Your vote was invalid.");
    } catch (error) {
      console.log(error);
    }
  }

  handleWhisper(
    playerSocket: PlayerSocket,
    recipient: number,
    message: string,
    isDay: boolean,
  ) {
    try {
      if (
        (!isDay && this.time === "day") ||
        (isDay && this.time == "night") ||
        this.time === "" ||
        playerSocket.data.position === undefined
      )
        return;
      let foundPlayer = this.playerList[playerSocket.data.position];
      let foundRecipient = this.playerList[recipient];

      if (!foundPlayer || !foundRecipient) {
        console.error("Invalid whisper!");
      } else if (this.time === "night")
        io.to(foundPlayer.socketId).emit(
          "receiveMessage",
          "You cannot whisper at night.",
        );
      else if (this.time === "day" && foundRecipient.isAlive) {
        if (0.1 > Math.random()) {
          //10% chance of the whisper being overheard by the town.
          io.to(foundPlayer.socketId).emit(
            "receiveMessage",
            "Your whispers were overheard by the town!",
          );
          io.to(this.name).emit(
            "receiveMessage",
            foundPlayer.playerUsername +
              ' tried to whisper "' +
              message +
              '" to ' +
              foundRecipient.playerUsername +
              ", but was overheard by the town!",
          );
        } else {
          io.to(foundRecipient.socketId).emit(
            "receive-whisper-message",
            "Whisper from " + foundPlayer.playerUsername + ": " + message,
          );
          io.to(foundPlayer.socketId).emit(
            "receive-whisper-message",
            "Whisper to " + foundRecipient.playerUsername + ": " + message,
          );
          if (foundPlayer.role.dayTapped != false)
            io.to(foundPlayer.role.dayTapped.player.socketId).emit(
              "receive-whisper-message",
              foundPlayer.playerUsername +
                ' whispered "' +
                message +
                '" to ' +
                foundRecipient.playerUsername +
                ".",
            );
          else if (foundRecipient.role.dayTapped != false)
            io.to(foundPlayer.role.dayTapped.player.socketId).emit(
              "receive-whisper-message",
              foundPlayer.playerUsername +
                ' whispered "' +
                message +
                '" to ' +
                foundRecipient.playerUsername +
                ".",
            );
        }
      } else
        io.to(foundPlayer.socketId).emit(
          "receiveMessage",
          "You didn't whisper to a valid recipient, or they are dead.",
        );
    } catch (error) {
      console.log(error);
    }
  }

  handleVisit(
    playerSocket: PlayerSocket,
    recipient: number | null,
    isDay: boolean,
  ) {
    try {
      if (
        (!isDay && this.time === "day") ||
        (isDay && this.time === "night") ||
        this.time === "" ||
        playerSocket.data.position === undefined
      )
        return;
      let foundPlayer = this.playerList[playerSocket.data.position];
      let foundRecipient =
        recipient !== null ? this.playerList[recipient] : null;

      if (!foundPlayer) {
        console.error("Invalid visit!");
        return;
      }

      if (this.time === "day") {
        if (foundRecipient !== null)
          foundPlayer.role.handleDayAction(foundRecipient);
        else foundPlayer.role.cancelDayAction();
      } else if (this.time === "night") {
        if (foundPlayer.role.roleblocked)
          io.to(playerSocket.id).emit(
            "receiveMessage",
            "You are roleblocked, and cannot call commands.",
          );
        else {
          if (foundRecipient !== null)
            foundPlayer.role.handleNightAction(foundRecipient);
          else foundPlayer.role.cancelNightAction();
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async startGame() {
    let roleHandler = new RoleHandler(this.playerCount);
    this.roleList.push(...roleHandler.assignGame()); //The function returns an array of 'roles' classes, and appends them to the empty rolelist array

    //Shuffles the list of roles so that they can be randomly allocated to users
    let currentIndex = this.roleList.length;
    let randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex); //Math.floor truncates to make integers (5.99 => 5)
      currentIndex--;

      const randomInst = this.roleList[randomIndex];
      const currentInst = this.roleList[currentIndex];

      if (randomInst === undefined || currentInst === undefined) {
        console.error("Invalid role instance!");
        continue;
      }

      [this.roleList[currentIndex], this.roleList[randomIndex]] = [
        randomInst,
        currentInst,
      ];
    }

    //Allocates the shuffled rolelist to users
    let i = 0;
    for (const player of this.playerList) {
      player.socket.data.position = i;
      const role = this.roleList[i];
      if (role === undefined) {
        console.error("Invalid role instance!");
        continue;
      }
      player.role = new role(this, player); //Assigns the role to the player (this.roleList[i] is an ES6 class)

      let playerReturned = {
        name: player.playerUsername,
        role: player.role.name,
        dayVisitSelf: player.role.dayVisitSelf,
        dayVisitOthers: player.role.dayVisitOthers,
        dayVisitFaction: player.role.dayVisitFaction,
        nightVisitSelf: player.role.nightVisitSelf,
        nightVisitOthers: player.role.nightVisitOthers,
        nightVisitFaction: player.role.nightVisitFaction,
        nightVote: player.role.nightVote,
      };
      io.to(player.socketId).emit("assign-player-role", playerReturned);
      i++;
    }

    this.factionList.push(
      ...roleHandler.assignFactionsFromPlayerList(this.playerList),
    );
    //Assigns roles to each faction, then factions to each relevant role.
    for (const faction of this.factionList) {
      faction.findMembers(this.playerList);
      for (const player of this.playerList) player.role.initRole();

      this.startFirstDaySession(this.sessionLength);
    }
  }

  //Sessions - Each session lasts for a period of time.
  //After it is over, the room executes the actions decided by the players.
  //Then, it checks the living player's factions to determine if the game is over.

  //The first day session is shorter than normal.
  startFirstDaySession(sessionLength: number) {
    this.time = "day";
    io.to(this.name).emit("receiveMessage", "Day 1 has started.");
    io.to(this.name).emit("update-day-time", {
      time: "Day",
      dayNumber: 1,
      timeLeft: 5,
    });
    setTimeout(() => {
      try {
        for (const player of this.playerList)
          if (player.isAlive) player.role.dayVisit();
        io.to(this.name).emit("receiveMessage", "Night 1 has started.");
      } catch (error) {
        console.log(error);
      }
      this.startNightSession(1, sessionLength);
    }, 5000); //Starts the first day quicker
  }

  startDaySession(dayNumber: number, sessionLength: number) {
    this.time = "day";

    if (this.endDay <= dayNumber) {
      io.to(this.name).emit(
        "receiveMessage",
        "Nobody has died in three consecutive days, so the game has ended.",
      );
      if (this.peacemaker !== null) {
        this.peacemaker.victoryCondition = true;
        io.to(this.peacemaker.player.socketId).emit(
          "receiveMessage",
          "You have won the game by causing a tie!",
        );
      }
      this.endGame("nobody");
      return;
    } else if (this.endDay - 1 <= dayNumber) {
      io.to(this.name).emit(
        "receiveMessage",
        "The game will end in a draw if nobody dies today or tonight.",
      );
    }

    let dateTimeJson = {
      time: "Day",
      dayNumber: dayNumber,
      timeLeft: Math.floor(sessionLength / 1000 + 10), //Converts ms to s, adds the 10s minimum
    };
    io.to(this.name).emit("update-day-time", dateTimeJson);

    //Announcements to the game
    io.to(this.name).emit(
      "receiveMessage",
      "Day " + dayNumber + " has started.",
    );
    let livingPlayerList: Player[] = [];
    for (const player of this.playerList) {
      if (player.isAlive) {
        player.role.dayUpdate();
        player.hasVoted = false;
        player.votesReceived = 0;
        livingPlayerList.push(player);
      }
    }

    let votesRequired = Math.floor(livingPlayerList.length / 2) + 1; //A majority of the players, for an execution to be carried out.
    io.to(this.name).emit(
      "receiveMessage",
      "It takes " + votesRequired + " votes for the town to kill a player.",
    );

    setTimeout(() => {
      try {
        if (!this.confesserVotedOut)
          for (const livingPlayer of livingPlayerList) {
            //Eliminates the player if they have a majority of the votes.
            if (livingPlayer.votesReceived >= votesRequired) {
              this.endDay = dayNumber + 3;

              if (livingPlayer.role.name === "Confesser") {
                io.to(this.name).emit(
                  "receiveMessage",
                  livingPlayer.playerUsername +
                    " was a confesser! Voting has been disabled for the remainder of the game.",
                );
                this.confesserVotedOut = true;
                livingPlayer.role.victoryCondition = true;
                io.to(this.name).emit("disable-voting");
              } else
                io.to(this.name).emit(
                  "receiveMessage",
                  livingPlayer.playerUsername +
                    " has been voted out by the town.",
                );

              io.to(livingPlayer.socketId).emit(
                "receiveMessage",
                "You have been voted out of the town.",
              );
              io.to(livingPlayer.socketId).emit("blockMessages");
              livingPlayer.isAlive = false;
              io.to(this.name).emit("update-player-role", {
                name: livingPlayer.playerUsername,
              }); //Marks player as dead client-side, does not reveal their role

              if (this.framer !== null && this.framer.target === livingPlayer) {
                this.framer.victoryCondition = true;
                io.to(this.framer.player.socketId).emit(
                  "receiveMessage",
                  "You have successfully gotten your target voted out!",
                );
              }
            }
          }

        io.to(this.name).emit(
          "receiveMessage",
          "Night " + dayNumber + " has started.",
        );

        //Handles day visits
        for (const player of this.playerList) {
          if (player.isAlive) {
            player.role.dayVisit();
            player.role.dayTapped = false; //Undoes daytapping by the tapper class
            player.hasVoted = false;
          }
        }
      } catch (error) {
        //If something goes wrong in the game logic, just start the next period of time
        console.log(error);
      }

      //Checks if the game is over, and ends the room, or starts the next night.
      if (dayNumber < 25) {
        //Starts the next session, and ends the game if there's been 25 days.
        const winningFaction = this.findWinningFaction();
        if (winningFaction !== null) {
          this.endGame(winningFaction);
        } else {
          this.startNightSession(dayNumber, sessionLength * 0.85); //The time each session lasts for decreases over time
        }
      } else {
        this.endGame("nobody");
      }
    }, sessionLength + 10000); //Days are a minimum of 10 seconds long
  }

  startNightSession(nightNumber: number, sessionLength: number) {
    this.time = "night";
    io.to(this.name).emit("update-day-time", {
      time: "Night",
      dayNumber: nightNumber,
      timeLeft: 15,
    }); //TimeLeft is in seconds

    setTimeout(() => {
      try {
        this.time = "undefined"; //Prevents users from changing their visits

        //This handles factional decisions, and lets the factions assign the members "visiting" variable.
        for (const faction of this.factionList) {
          faction.removeMembers();
          faction.handleNightVote();
        }

        //Roleblocking classes go first, and give the victims the roleblocked attribute
        for (const player of this.playerList)
          if (player.role.roleblocker) player.role.visit();
        //Marks who has visited who, and handles players whose abilities were disabled by being roleblocked
        for (const player of this.playerList) {
          if (player.role.roleblocked && !player.role.roleblocker) {
            //Cancels vists for players that were roleblocked, and informs them.
            player.role.visiting = null;
            io.to(player.socketId).emit(
              "receiveMessage",
              "You were roleblocked!",
            );
            player.role.roleblocked = false;
          } else if (player.role.visiting != null && !player.role.roleBlocker)
            player.role.visit();
        }
        //Executes the effects that each visit has
        for (const player of this.playerList)
          if (player.isAlive) player.role.handleVisits(); //Handles actions for certain roles whose behaviour depends on who has visited who.
        //Kills players who have been attacked without an adequate defence, resets visits after night logic has been completed
        for (const player of this.playerList) {
          if (player.isAlive) {
            if (player.role.handleDamage()) this.endDay = nightNumber + 3; //Handles the player being attacked, potentially killing them.
            player.role.dayVisiting = null; //Resets dayvisiting
            player.role.visiting = null; //Resets visiting.
            player.role.roleblocked = false; //Resets roleblocked status
            player.role.visitors = []; //Resets visitor list.
            player.role.nightTapped = false;
          }
        }
      } catch (error) {
        //If something goes wrong, just start the next period of time
        console.log(error);
      }

      const winningFaction = this.findWinningFaction();
      if (winningFaction !== null) {
        this.endGame(winningFaction);
      } else this.startDaySession(nightNumber + 1, sessionLength);
    }, 15000); //Nights are 15 seconds long.
  }

  findWinningFaction() {
    //Note: Roles considered to be 'neutral' in the roleHandler do NOT necessarily have the 'neutral' group attribute in their role class.
    //Only roles that can win with anyone else are will be of the 'neutral' group.

    let lastFaction = "neutral"; //Compares the previous (non-neutral) faction with the next.
    for (const player of this.playerList) {
      //Roles with the 'neutral' group have a victory condition. TODO: Check to allow them to win
      if (player.role.group != "neutral" && player.isAlive) {
        if (lastFaction == "neutral") lastFaction = player.role.group;
        else if (player.role.group != lastFaction) return null; //Game is NOT over if there are are members of two different factions alive (excluding neutral)
      }
    }
    return lastFaction;
  }

  endGame(winningFactionName: string) {
    this.gameHasEnded = true;
    if (winningFactionName == "nobody")
      io.to(this.name).emit(
        "receiveMessage",
        "The game has ended with a draw!",
      );
    else if (winningFactionName == "neutral")
      io.to(this.name).emit("receiveMessage", "The neutral players have won!");
    else {
      if (winningFactionName.endsWith("s"))
        io.to(this.name).emit(
          "receiveMessage",
          "The " + winningFactionName + " have won!",
        );
      else
        io.to(this.name).emit(
          "receiveMessage",
          "The " + winningFactionName + " has won!",
        );
    }
    io.to(this.name).emit("receiveMessage", "Closing the room!");
    io.to(this.name).emit("blockMessages");
    io.in(this.name).disconnectSockets();
  }
}
function startFirstDaySession(sessionLength: any, number: any) {
  throw new Error("Function not implemented.");
}
