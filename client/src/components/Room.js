import React from 'react';
import io from 'socket.io-client'/* '../socket' */
import {Form, Button, ListGroup} from 'react-bootstrap';
import PlayerItem from './PlayerItem.js'

class Room extends React.Component {
    constructor(props) {
        super(props); //Needed to call React.Components constructor

        this.state = {
            textMessage: '',
            canTalk: true,
            time: 'Day',
            dayNumber: 0,
            timeLeft: 0,
            messages: [],
            playerList: [],
            visiting: null,
            votingFor: null,
            whisperingTo: null,
            canVisit: [false, false, false, false, false, false] //dayVisitSelf, dayVisitOthers, dayVisitFaction, nightVisitSelf, nightVisitOthers, nightVisitFaction
        };

        this.changeText = this.changeText.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        
        this.handleVisit = this.handleVisit.bind(this);
        this.handleVote = this.handleVote.bind(this);
        this.openWhisperMenu = this.openWhisperMenu.bind(this);
        this.handleWhisper = this.handleWhisper.bind(this);

        this.scrollRef = React.createRef(); //For scrolling down when new messages arrive
        this.chatRef = React.createRef(); //For focusing in textbox when sendding a message

        this.socket = io('/');
    }

    render() {
        return (
            <div style={{display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden'}}>
                <div style={{display: 'flex', flexDirection: 'row', flex: 1, columnGap: '2vh', overflow: 'auto'}}>
                    <div style={{display: 'flex', flexDirection: 'column', maxHeight: '75vh'}}>
                        {this.state.dayNumber !== 0?<p>{this.state.time} number {this.state.dayNumber}. Seconds remaining: {this.state.timeLeft}</p>:<p>Players in room: {this.state.playerList.length}</p>}
                        <ListGroup style={{flex: 1}}>
                            {this.state.playerList && this.state.playerList.map((player, index) => 
                                <PlayerItem 
                                    key={player.name} index={index} handleVisit={this.handleVisit} handleVote={this.handleVote} whisperingTo={this.state.whisperingTo} openWhisperMenu={this.openWhisperMenu} dayNumber={this.state.dayNumber}
                                    dayVisitLiving={this.state.dayVisitLiving} dayVisitDead={this.state.dayVisitDead} nightVisitLiving={this.state.nightVisitLiving} nightVisitDead={this.state.nightVisitDead}  
                                    visiting={this.state.visiting} votingFor={this.state.votingFor} isUser={player.isUser} username={player.name} role={player.role} isAlive={player.isAlive} time={this.state.time} canTalk={this.state.canTalk} canVisit={this.state.canVisit}
                                /> 
                            )}
                        </ListGroup>
                    </div>
                
                    <div ref={this.scrollRef} style={{/* display: 'flex', flexDirection: 'column',  */flex: 1, minHeight: 0, overflow: 'auto'}}>
                        {this.state.messages && this.state.messages.map((msg, index) => { //Msg Types - 0: Bold, black,
                            if(msg.type === 0) return (<p key={index} style={{fontWeight: 'bold'}}>{msg.text}</p>); //0 - Bold message - Announcement  
                            else if(msg.type === 1) return (<p key={index}>{msg.text}</p>) // 1 - Normal Message (No effects)     
                            else if(msg.type === 2) return (<p key={index} style={{fontStyle: 'italic'}}>{msg.text}</p>) // 2 - Whisper Message (Italics)     
                            else return (<p key={index}>{msg.text}</p>) // Fallback Message (No effects)     
                        })}
                    </div>
                </div>       

                <Form onSubmit={e => {
                    e.preventDefault();
                    if(this.state.whisperingTo !== null) this.handleWhisper();
                    else this.sendMessage();
                }}>
                        {this.state.canTalk ?
                            this.state.whisperingTo !== null ? 
                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                    <Form.Control ref={this.chatRef} placeHolder={'Whisper to ' + this.state.playerList[this.state.whisperingTo].name} value={this.state.textMessage} onChange={this.changeText} maxLength={150} />
                                    <Button variant='info' onClick={this.handleWhisper} className="btn-block" style={{flex: 1}}>Whisper</Button> 
                                </div>
                            :
                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                    <Form.Control  ref={this.chatRef} value={this.state.textMessage} onChange={this.changeText} maxLength={150} />
                                    <Button variant='danger' onClick={this.sendMessage} className="btn-block" style={{flex: 1}}>Submit</Button> 
                                </div>
                        : 
                            <Button variant='danger' onClick={() => {this.props.setRoom(false); this.props.setName(''); this.props.setRole(''); this.props.setFailReason('')}} className="btn-block">Disconnect</Button> 
                        }
                </Form>
           </div>
        )

    }

    changeText(event) {
        this.setState({textMessage: event.target.value})  
    }

    handleVisit(playerIndex) {
        if(this.state.visiting !== playerIndex) {
            this.setState({visiting: playerIndex});
            this.socket.emit('handleVisit', playerIndex, this.state.time === 'Day');
        }
        else {
            this.setState({visiting: null});
            this.socket.emit('handleVisit', null, this.state.time === 'Day');
        }
    }
    
    
    openWhisperMenu(playerIndex) {
        if(this.state.whisperingTo === playerIndex) {
            this.setState({whisperingTo: null});
            this.chatRef.current.focus(); //TODO: Fix focusing
        } 
        else {
            this.setState({whisperingTo: playerIndex});
            this.chatRef.current.focus();
        }
    }
    
    handleWhisper() {
        if(this.state.textMessage.length > 0 && this.state.textMessage.length <= 150) {
            this.socket.emit('handleWhisper', this.state.whisperingTo, this.state.textMessage, this.state.time === 'Day');
        }
        this.setState({
            textMessage: '',
            whisperingTo: null
        })
        this.openWhisperMenu(this.state.whisperingTo);
    }

    handleVote(playerIndex) {
        if(this.state.votingFor !== playerIndex) {
            this.setState({votingFor: playerIndex});
            this.socket.emit('handleVote', playerIndex, this.state.time === 'Day');
        }
        else {
            this.setState({votingFor: null});
            this.socket.emit('handleVote', null, this.state.time === 'Day');
        }
    }

    sendMessage() {
        if(this.state.textMessage.length > 0 && this.state.textMessage.length <= 150) {
            this.socket.emit('messageSentByUser', this.state.textMessage, this.state.time === 'Day'); //Sends to server
            this.setState({textMessage: ''}) //Clears the text box
        }
    }

    componentDidMount() {
        this.socket.on('connect', () => {
            console.log('You connected to the socket with ID ' + this.socket.id);
        })
        
        this.socket.on('receive-message', (inMsg) => {
            //Scrolls down if the user is close to the bottom, doesn't if they've scrolled up the review the chat history (By more than 1/5th of the window's height)
            let msg = {
                type: 0,
                text: inMsg
            }

            if(this.scrollRef.current.scrollHeight - this.scrollRef.current.scrollTop - this.scrollRef.current.clientHeight <= this.scrollRef.current.clientHeight/5) {
                this.setState({messages: [...this.state.messages, msg]}); //Adds message to message list.
                this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
            }
            else this.setState({messages: [...this.state.messages, msg]}); //Adds message to message list.
        })

        this.socket.on('receive-chat-message', (inMsg) => {
            //Scrolls down if the user is close to the bottom, doesn't if they've scrolled up the review the chat history (By more than 1/5th of the window's height)
            let msg = {
                type: 1,
                text: inMsg
            }

            if(this.scrollRef.current.scrollHeight - this.scrollRef.current.scrollTop - this.scrollRef.current.clientHeight <= this.scrollRef.current.clientHeight/5) {
                this.setState({messages: [...this.state.messages, msg]}); //Adds message to message list.
                this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
            }
            else this.setState({messages: [...this.state.messages, msg]}); //Adds message to message list.
        })

        this.socket.on('receive-whisper-message', (inMsg) => {
            //Scrolls down if the user is close to the bottom, doesn't if they've scrolled up the review the chat history (By more than 1/5th of the window's height)
            let msg = {
                type: 2,
                text: inMsg
            }

            if(this.scrollRef.current.scrollHeight - this.scrollRef.current.scrollTop - this.scrollRef.current.clientHeight <= this.scrollRef.current.clientHeight/5) {
                this.setState({messages: [...this.state.messages, msg]}); //Adds message to message list.
                this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
            }
            else this.setState({messages: [...this.state.messages, msg]}); //Adds message to message list.
        })

        this.socket.on('receive-player-list', (listJson) => { //Receive all players upon joining, and the game starting
            this.setState({playerList: listJson});
        });

        this.socket.on('receive-new-player', (playerJson) => { //Called when a new player joins the lobby
            this.setState({ playerList: [...this.state.playerList, playerJson]})
        })

        this.socket.on('remove-player', (playerJson) => { //Called when a player leaves the lobby before the game starts
            console.log('Removing player ' + playerJson.name);
            this.setState({ playerList: this.state.playerList.filter(player => player.name !== playerJson.name)});
        })

        this.socket.on('assign-player-role', (playerJson) => { //Shows the player their own role, lets the client know that this is who they are playing as 
            let tempPlayerList = [...this.state.playerList];
            let index = tempPlayerList.findIndex(player => player.name === playerJson.name);
            tempPlayerList[index].role = playerJson.role;
            tempPlayerList[index].isUser = true;
            this.props.setRole(playerJson.role);
            this.setState({
                playerList: tempPlayerList,
                canVisit: [playerJson.dayVisitSelf, playerJson.dayVisitOthers, playerJson.dayVisitFaction, playerJson.nightVisitSelf, playerJson.nightVisitOthers, playerJson.nightVisitFaction]
            });
        })

        this.socket.on('update-faction-role', (playerJson) => { //Reveals the role of factional allies
            let tempPlayerList = [...this.state.playerList];
            let index = tempPlayerList.findIndex(player => player.name === playerJson.name);
            if(playerJson.role !== undefined) tempPlayerList[index].role = playerJson.role;
            this.setState({playerList: tempPlayerList});
        })

        this.socket.on('update-player-role', (playerJson) => { //Updates player role upon their death
            let tempPlayerList = [...this.state.playerList];
            let index = tempPlayerList.findIndex(player => player.name === playerJson.name);
            if(playerJson.role !== undefined) tempPlayerList[index].role = playerJson.role;
            tempPlayerList[index].isAlive = false;
            this.setState({playerList: tempPlayerList});
        })

        this.socket.on('update-player-visit', (playerJson) => { //Updates player to indicate that the player is visiting them
            //JSON contains player name
            //Get player by name, update properties, update JSON

        })

        this.socket.on('update-day-time', (infoJson) => { //Gets whether it is day or night, and how long there is left in the session
            this.setState({
                time: infoJson.time,
                dayNumber: infoJson.dayNumber,
                visiting: null, //Resets who the player is visiting
                votingFor: null,
                whisperingTo: null
            });
            let timeLeft = infoJson.timeLeft;
            let countDown = setInterval(() => {
                if(timeLeft > 0) {
                    this.setState({timeLeft: timeLeft - 1});
                    timeLeft--;
                }
                else {
                    clearInterval(countDown);
                }
            }, 1000)
        })


        this.socket.on('block-messages', () => {
            this.setState({canTalk: false});
        })

        this.socket.emit('playerJoinRoom', this.props.captchaToken, callback => {
            if(typeof callback == 'number') {
                if(callback === 1) this.props.setFailReason('Your socket ID was equal to existing player in room.');
                else if(callback === 2) this.props.setFailReason('Your selected username was the same as another player in the room.');
                else if(callback === 3) this.props.setFailReason('The room was full.');
                this.props.setRoom(false);
                this.props.setName('');
                this.props.setRole('');
            }
            else {
                this.props.setFailReason('');
                this.props.setName(callback);
            }
        });

    }

    componentWillUnmount() {
        this.socket.off('receive-message');
        this.socket.off('receive-chat-message');
        this.socket.off('receive-whisper-message');
        this.socket.off('block-messages');
        this.socket.off('receive-role');
        this.socket.off('receive-player-list');
        this.socket.off('receive-new-player');
        this.socket.off('remove-player');
        this.socket.off('update-player-role');
        this.socket.off('update-player-visit');
        this.socket.disconnect();
    }
}

export default Room;
