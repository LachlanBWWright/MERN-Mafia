
/* 
{
    name: "placeholder",
    info: "placeholder",
},


//Keep in alphabetical order
*/
const roles = new Map ([
    [
        "Bodyguard",
        "You can choose a person to protect every night. You will protect them, and kill everybody who visited them. Excluding yourself. At night, use /c playerName to choose who to protect.",
    ], 
    [
        "Doctor",
        "You can choose a person to heal every night, protecting them from attacks. At night, use /c playerName to choose who to heal.",
    ], 
    [
        "Fortifier",
        "Once per game, you can choose to fortify someone's house. They will survive most attacks, and if you're alive, you can kill the attackers. If you regret your decision, you can try to take their defences down, but a brawl will ensue, killing one of you at random. At night, use /c playerName to choose whose house to fprtofu. Type /c playerName again to try and remove their defences.",
    ], 
    [
        "Innocent",
        "You are innocent. Find the mafia, and vote them out.",
    ], 
    [
        "Investigator",
        "You can visit a player each night to check make three guesses as to their role. Each guess has a 30% chance of being correct, otherwise it will be the role of a random player. At night, use /c playerName to choose who to inspect.",
    ], 
    [
        "Jailor",
        "At day, you can choose to jail a player, blocking their abilities. You can then interrogate them, and choose to execute them. At day and night, use /c playerName to choose who to jail.",
    ], 
    [
        "Judge",
        "You can visit a player each night to check for their factional alignment. However, there is a 30% chance that you'll be told the alignment of a random player instead. At night, use /c playerName to choose who to inspect.",
    ], 
    [
        "Lawman",
        "You can choose a person to shoot every night. If you shoot a town member, you will go insane, and shoot a living player at random every night - including yourself! At night, use /c playerName to choose who to shoot.",
    ], 
    [
        "Mafia",
        "You are a member of the mafia. Vote for who you want your group to kill at night. Use /c playerName to choose who to vote for.",
    ], 
    [
        "Nimby",
        "Development in your neighbour's backyard was bad enough, but now your own property is under threat! Three times per game, you can go on alert and murder any visitors, defending yourself! At night, use /c yourName to go on alert.",
    ], 
    [
        "Roleblocker",
        "Every night, are are able to select a person, and stop them from performing their action. If they're not a member of the town, you have a 50% chance of success. At night, use /c playerName to choose who to roleblock.",
    ], 
    [
        "Sacrificer",
        "You can choose a person to protect every night. You will protect them, but will sacrifice yourself if they were attacked. The protected player will witness the names and roles of everybody who attacked them. At night, use /c playerName to choose who to protect.",
    ], 
    [
        "Tapper",
        "At night, you can select a player to overhear their whispers the following day. At day, you can do the same to overhear any messages they send, but they will be warned. At day and night, use /c playerName to choose who to tap.",
    ], 
    [
        "Tracker",
        "Choose a player to track, and see who they visit. At night, use /c playerName to choose who to track.",
    ], 
    [
        "Vetter",
        "You can research into people's history. Three times a game, you can visit yourself to stay home and research into two random players, dead or alive. Then, you will uncover a role that at least one of them has. At night, use /c yourName to stay home and research.",
    ], 
    [
        "Watchman",
        "Choose a player to watch, and see who visits them. If only one person visits, you may struggle to determine who the visitor was, but your vision will improve over time. At night, use /c playerName to choose who to watch.",
    ], 
])

export default roles;