import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client"; /* '../socket' */
import { Form, Button, ListGroup } from "react-bootstrap";
import PlayerItem from "./PlayerItem";
import { socket } from "../socket/socket";

export default function Room({
  captchaToken,
  setFailReason,
  setName,
  setRoom,
  setRole,
}: {
  captchaToken: string;
  setFailReason: React.Dispatch<React.SetStateAction<string>>;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setRoom: React.Dispatch<React.SetStateAction<boolean>>;
  setRole: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [textMessage, setTextMessage] = useState("");
  const [canTalk, setCanTalk] = useState(true);
  const [time, setTime] = useState("Day");
  const [dayNumber, setDayNumber] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [messages, setMessages] = useState([]);
  const [playerList, setPlayerList] = useState([]);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [scrollNewMessages, setScrollNewMessages] = useState(0);
  const [scrollDownRequest, setScrollDownRequest] = useState(false);
  const [visiting, setVisiting] = useState<number | null>(null);
  const [votingDisabled, setVotingDisabled] = useState(false);
  const [votingFor, setVotingFor] = useState<number | null>(null);
  const [factionNightVote, setFactionNightVote] = useState<number | null>(null);
  const [votingForNight, setVotingForNight] = useState<number | null>(null);
  const [whisperingTo, setWhisperingTo] = useState<number | null>(null);
  const [canVisit, setCanVisit] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [canNightVote, setCanNightVote] = useState(false);

  const scrollRef = useRef<HTMLInputElement>();
  const chatRef = useRef<HTMLInputElement>();

  function changeText(event: string) {
    setTextMessage(event);
    //this.setState({ textMessage: event.target.value });
  }

  function handleVisit(playerIndex: number) {
    if (visiting !== playerIndex) {
      setVisiting(playerIndex); //this.setState({ visiting: playerIndex });
      socket.emit("handleVisit", playerIndex, time === "Day");
    } else {
      setVisiting(null);
      setVisiting(null);
      socket.emit("handleVisit", null, time === "Day");
    }
  }

  function openWhisperMenu(playerIndex: number) {
    if (whisperingTo === playerIndex) {
      setWhisperingTo(null);
      chatRef.current?.focus(); //TODO: Fix focusing
    } else {
      setWhisperingTo(playerIndex);
      chatRef.current?.focus();
    }
  }

  function handleWhisper() {
    if (
      textMessage.length > 0 &&
      textMessage.length <= 150 &&
      whisperingTo !== null
    ) {
      socket.emit("handleWhisper", whisperingTo, textMessage, time === "Day");
    }
    setTextMessage("");
    setWhisperingTo(null);

    if (whisperingTo !== null) openWhisperMenu(whisperingTo);
  }

  function handleVote(playerIndex: number) {
    if (votingFor !== playerIndex) {
      setVotingFor(playerIndex); //this.setState({ votingFor: playerIndex });
      socket.emit("handleVote", playerIndex, time === "Day");
    } else {
      setVotingFor(null);
      socket.emit("handleVote", null, time === "Day");
    }
  }

  function sendMessage() {
    if (textMessage.length > 0 && textMessage.length <= 150) {
      socket.emit("messageSentByUser", textMessage, time === "Day"); //Sends to server
      setTextMessage("");
    }
  }

  function scrollEvent() {
    if (
      scrollRef.current !== undefined &&
      scrollRef.current.scrollHeight -
        scrollRef.current.scrollTop -
        scrollRef.current.clientHeight <=
        scrollRef.current.clientHeight / 5
    ) {
      setShowScrollDown(false);
      setScrollNewMessages(0);
    } else setShowScrollDown(true);
  }

  useEffect(() => {
      scrollRef.current.addEventListener("scroll", scrollEvent);

    socket.on("connect", () => {
      console.log("You connected to the socket with ID " + socket.id);
    });

    socket.on("receiveMessage", (inMsg) => {
      //Scrolls down if the user is close to the bottom, doesn't if they've scrolled up the review the chat history (By more than 1/5th of the window's height)
      let msg = {
        type: 0,
        text: inMsg,
      };

      if (
        this.scrollRef.current.scrollHeight -
          this.scrollRef.current.scrollTop -
          this.scrollRef.current.clientHeight <=
        this.scrollRef.current.clientHeight / 5
      ) {
        this.setState({
          messages: [...this.state.messages, msg],
          showScrollDown: false,
          scrollNewMessages: 0,
        }); //Adds message to message list.
        this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
      } else
        this.setState({
          messages: [...this.state.messages, msg],
          showScrollDown: true,
          scrollNewMessages: this.state.scrollNewMessages + 1,
        }); //Adds message to message list.
    });

    socket.on("receive-chat-message", (inMsg) => {
      //Scrolls down if the user is close to the bottom, doesn't if they've scrolled up the review the chat history (By more than 1/5th of the window's height)
      let msg = {
        type: 1,
        text: inMsg,
      };

      if (
        this.scrollRef.current.scrollHeight -
          this.scrollRef.current.scrollTop -
          this.scrollRef.current.clientHeight <=
        this.scrollRef.current.clientHeight / 5
      ) {
        this.setState({
          messages: [...this.state.messages, msg],
          showScrollDown: false,
          scrollNewMessages: 0,
        }); //Adds message to message list.
        this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
      } else
        this.setState({
          messages: [...this.state.messages, msg],
          showScrollDown: true,
          scrollNewMessages: this.state.scrollNewMessages + 1,
        }); //Adds message to message list.
    });

    socket.on("receive-whisper-message", (inMsg) => {
      //Scrolls down if the user is close to the bottom, doesn't if they've scrolled up the review the chat history (By more than 1/5th of the window's height)
      let msg = {
        type: 2,
        text: inMsg,
      };

      if (
        this.scrollRef.current.scrollHeight -
          this.scrollRef.current.scrollTop -
          this.scrollRef.current.clientHeight <=
        this.scrollRef.current.clientHeight / 5
      ) {
        this.setState({
          messages: [...this.state.messages, msg],
          showScrollDown: false,
          scrollNewMessages: 0,
        }); //Adds message to message list.
        this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
      } else
        this.setState({
          messages: [...this.state.messages, msg],
          showScrollDown: true,
          scrollNewMessages: this.state.scrollNewMessages + 1,
        }); //Adds message to message list.
    });

    socket.on("receive-player-list", (listJson) => {
      //Receive all players upon joining, and the game starting
      this.setState({ playerList: listJson });
    });

    socket.on("receive-new-player", (playerJson) => {
      //Called when a new player joins the lobby
      this.setState({ playerList: [...this.state.playerList, playerJson] });
    });

    socket.on("remove-player", (playerJson) => {
      //Called when a player leaves the lobby before the game starts
      console.log("Removing player " + playerJson.name);
      this.setState({
        playerList: this.state.playerList.filter(
          (player) => player.name !== playerJson.name,
        ),
      });
    });

    socket.on("assign-player-role", (playerJson) => {
      //Shows the player their own role, lets the client know that this is who they are playing as
      let tempPlayerList = [...this.state.playerList];
      let index = tempPlayerList.findIndex(
        (player) => player.name === playerJson.name,
      );
      tempPlayerList[index].role = playerJson.role;
      tempPlayerList[index].isUser = true;
      this.props.setRole(playerJson.role);
      this.setState({
        playerList: tempPlayerList,
        canVisit: [
          playerJson.dayVisitSelf,
          playerJson.dayVisitOthers,
          playerJson.dayVisitFaction,
          playerJson.nightVisitSelf,
          playerJson.nightVisitOthers,
          playerJson.nightVisitFaction,
        ],
        canNightVote: playerJson.nightVote,
      });
    });

    socket.on("update-faction-role", (playerJson) => {
      //Reveals the role of factional allies
      let tempPlayerList = [...this.state.playerList];
      let index = tempPlayerList.findIndex(
        (player) => player.name === playerJson.name,
      );
      if (playerJson.role !== undefined)
        tempPlayerList[index].role = playerJson.role;
      this.setState({ playerList: tempPlayerList });
    });

    socket.on("update-player-role", (playerJson) => {
      //Updates player role upon their death
      let tempPlayerList = [...this.state.playerList];
      let index = tempPlayerList.findIndex(
        (player) => player.name === playerJson.name,
      );
      if (playerJson.role !== undefined)
        tempPlayerList[index].role = playerJson.role;
      tempPlayerList[index].isAlive = false;
      this.setState({ playerList: tempPlayerList });
    });

    socket.on("update-player-visit", (playerJson) => {
      //Updates player to indicate that the player is visiting them
      //JSON contains player name
      //Get player by name, update properties, update JSON
    });

    socket.on("update-day-time", (infoJson) => {
      //Gets whether it is day or night, and how long there is left in the session
      this.setState({
        time: infoJson.time,
        dayNumber: infoJson.dayNumber,
        visiting: null, //Resets who the player is visiting
        votingFor: null,
        whisperingTo: null,
      });
      let timeLeft = infoJson.timeLeft;
      let countDown = setInterval(() => {
        if (timeLeft > 0) {
          this.setState({ timeLeft: timeLeft - 1 });
          timeLeft--;
        } else {
          clearInterval(countDown);
        }
      }, 1000);
    });

    socket.on("disable-voting", () => {
      this.setState({ votingDisabled: true });
    });

    socket.on("blockMessages", () => {
      this.setState({ canTalk: false });
    });

    socket.emit("playerJoinRoom", this.props.captchaToken, (callback) => {
      if (typeof callback == "number") {
        if (callback === 1)
          this.props.setFailReason(
            "Your socket ID was equal to existing player in room.",
          );
        else if (callback === 2)
          this.props.setFailReason(
            "Your selected username was the same as another player in the room.",
          );
        else if (callback === 3) this.props.setFailReason("The room was full.");
        this.props.setRoom(false);
        this.props.setName("");
        this.props.setRole("");
      } else {
        this.props.setFailReason("");
        this.props.setName(callback);
      }
    });

    return () => {
      this.scrollRef.current.removeEventListener("scroll", this.scrollEvent);

      socket.off("receiveMessage");
      socket.off("receive-chat-message");
      socket.off("receive-whisper-message");
      socket.off("blockMessages");
      socket.off("receive-role");
      socket.off("receive-player-list");
      socket.off("receive-new-player");
      socket.off("remove-player");
      socket.off("update-player-role");
      socket.off("update-player-visit");
      socket.off("update-day-time");
      socket.disconnect();
    }
  }, [])



  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.scrollDownRequest) {
      this.setState({ scrollDownRequest: false });
      this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flex: 1,
        columnGap: "2vh",
        overflow: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "75vh",
        }}
      >
        {dayNumber !== 0 ? (
          <p>
            {time} number {dayNumber}. Seconds remaining: {timeLeft}
          </p>
        ) : (
          <p>Players in room: {playerList.length}</p>
        )}
        <ListGroup style={{ flex: 1 }}>
          {playerList &&
            playerList.map((player, index) => (
              <PlayerItem
                key={player.name}
                index={index}
                handleVisit={handleVisit}
                handleVote={handleVote}
                whisperingTo={whisperingTo}
                openWhisperMenu={openWhisperMenu}
                dayNumber={dayNumber}
                votingDisabled={votingDisabled}
                dayVisitLiving={dayVisitLiving}
                dayVisitDead={dayVisitDead}
                nightVisitLiving={nightVisitLiving}
                nightVisitDead={nightVisitDead}
                visiting={visiting}
                votingFor={votingFor}
                canNightVote={canNightVote}
                isUser={player.isUser}
                username={player.name}
                role={player.role}
                isAlive={player.isAlive}
                time={time}
                canTalk={canTalk}
                canVisit={canVisit}
              />
            ))}
        </ListGroup>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "auto",
        }}
      >
        <div
          ref={scrollRef}
          style={{
            /* display: 'flex', flexDirection: 'column',  */ flex: 1,
            minHeight: 0,
            overflow: "auto",
          }}
        >
          {messages &&
            messages.map((msg, index) => {
              //Msg Types - 0: Bold, black,
              if (msg.type === 0)
                return (
                  <p key={index} style={{ fontWeight: "bold" }}>
                    {msg.text}
                  </p>
                );
              //0 - Bold message - Announcement
              else if (msg.type === 1) return <p key={index}>{msg.text}</p>;
              // 1 - Normal Message (No effects)
              else if (msg.type === 2)
                return (
                  <p key={index} style={{ fontStyle: "italic" }}>
                    {msg.text}
                  </p>
                );
              // 2 - Whisper Message (Italics)
              else return <p key={index}>{msg.text}</p>; // Fallback Message (No effects)
            })}
          {showScrollDown && scrollNewMessages !== 0 && (
            <Button
              variant="secondary"
              style={{
                position: "sticky",
                bottom: 0,
                left: "50%",
                right: "50%",
                opacity: 0.3,
                visibility: "visible",
              }}
              onClick={() => setScrollDownRequest(true)}
            >
              {scrollNewMessages === 1
                ? "1 New Message"
                : scrollNewMessages + " New Messages"}
            </Button>
          )}
        </div>

        <Form
          onSubmit={(e) => {
            e.preventDefault();
            if (whisperingTo !== null) handleWhisper();
            else sendMessage();
          }}
        >
          {canTalk ? (
            whisperingTo !== null ? (
              <div style={{ display: "flex", flexDirection: "row" }}>
                <Form.Control
                  ref={chatRef}
                  placeHolder={"Whisper to " + playerList[whisperingTo].name}
                  value={textMessage}
                  onChange={(e) => changeText(e.target.value)}
                  maxLength={150}
                />
                <Button
                  variant="info"
                  onClick={this.handleWhisper}
                  className="btn-block"
                  style={{ flex: 1 }}
                >
                  Whisper
                </Button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "row" }}>
                <Form.Control
                  ref={chatRef}
                  value={textMessage}
                  onChange={(e) => changeText(e.target.value)}
                  maxLength={150}
                />
                <Button
                  variant="danger"
                  onClick={this.sendMessage}
                  className="btn-block"
                  style={{ flex: 1 }}
                >
                  Submit
                </Button>
              </div>
            )
          ) : (
            <Button
              variant="danger"
              onClick={() => {
                setRoom(false);
                setName("");
                setRole("");
                setFailReason("");
              }}
              className="btn-block"
            >
              Disconnect
            </Button>
          )}
        </Form>
      </div>
    </div>
  );
}

class OldRoom extends React.Component {
  constructor(props: any) {
    super(props); //Needed to call React.Components constructor

    this.state = {
      textMessage: "",
      canTalk: true,
      time: "Day",
      dayNumber: 0,
      timeLeft: 0,
      messages: [],
      playerList: [],
      showScrollDown: false,
      scrollNewMessages: 0,
      scrollDownRequest: false,
      visiting: null,
      votingDisabled: false, //Voting is blocked when the town votes out a confesser
      votingFor: null, //Who the player is voting for
      factionNightVote: null, //Mafia night voting
      votingForNight: null, //Mafia night voting
      whisperingTo: null,
      canVisit: [false, false, false, false, false, false], //dayVisitSelf, dayVisitOthers, dayVisitFaction, nightVisitSelf, nightVisitOthers, nightVisitFaction
      canNightVote: false, //If the player is in a faction that can vote at night
    };

    this.changeText = this.changeText.bind(this);
    this.sendMessage = this.sendMessage.bind(this);

    this.handleVisit = this.handleVisit.bind(this);
    this.handleVote = this.handleVote.bind(this);
    this.openWhisperMenu = this.openWhisperMenu.bind(this);
    this.handleWhisper = this.handleWhisper.bind(this);

    this.scrollEvent = this.scrollEvent.bind(this);

    this.scrollRef = React.createRef(); //For scrolling down when new messages arrive
    this.chatRef = React.createRef(); //For focusing in textbox when sending a message

    this.socket = io("/");
  }

  render() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          columnGap: "2vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxHeight: "75vh",
          }}
        >
          {this.state.dayNumber !== 0 ? (
            <p>
              {this.state.time} number {this.state.dayNumber}. Seconds
              remaining: {this.state.timeLeft}
            </p>
          ) : (
            <p>Players in room: {this.state.playerList.length}</p>
          )}
          <ListGroup style={{ flex: 1 }}>
            {this.state.playerList &&
              this.state.playerList.map((player, index) => (
                <PlayerItem
                  key={player.name}
                  index={index}
                  handleVisit={this.handleVisit}
                  handleVote={this.handleVote}
                  whisperingTo={this.state.whisperingTo}
                  openWhisperMenu={this.openWhisperMenu}
                  dayNumber={this.state.dayNumber}
                  votingDisabled={this.state.votingDisabled}
                  dayVisitLiving={this.state.dayVisitLiving}
                  dayVisitDead={this.state.dayVisitDead}
                  nightVisitLiving={this.state.nightVisitLiving}
                  nightVisitDead={this.state.nightVisitDead}
                  visiting={this.state.visiting}
                  votingFor={this.state.votingFor}
                  canNightVote={this.state.canNightVote}
                  isUser={player.isUser}
                  username={player.name}
                  role={player.role}
                  isAlive={player.isAlive}
                  time={this.state.time}
                  canTalk={this.state.canTalk}
                  canVisit={this.state.canVisit}
                />
              ))}
          </ListGroup>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "auto",
          }}
        >
          <div
            ref={this.scrollRef}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
              overflow: "auto",
            }}
          >
            {this.state.messages &&
              this.state.messages.map((msg, index) => {
                //Msg Types - 0: Bold, black,
                if (msg.type === 0)
                  return (
                    <p key={index} style={{ fontWeight: "bold" }}>
                      {msg.text}
                    </p>
                  );
                //0 - Bold message - Announcement
                else if (msg.type === 1) return <p key={index}>{msg.text}</p>;
                // 1 - Normal Message (No effects)
                else if (msg.type === 2)
                  return (
                    <p key={index} style={{ fontStyle: "italic" }}>
                      {msg.text}
                    </p>
                  );
                // 2 - Whisper Message (Italics)
                else return <p key={index}>{msg.text}</p>; // Fallback Message (No effects)
              })}
            {this.state.showScrollDown &&
              this.state.scrollNewMessages !== 0 && (
                <Button
                  variant="secondary"
                  style={{
                    position: "sticky",
                    bottom: 0,
                    left: "50%",
                    right: "50%",
                    opacity: 0.3,
                    visibility: "visible",
                  }}
                  onClick={() => this.setState({ scrollDownRequest: true })}
                >
                  {this.state.scrollNewMessages === 1
                    ? "1 New Message"
                    : this.state.scrollNewMessages + " New Messages"}
                </Button>
              )}
          </div>

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              if (this.state.whisperingTo !== null) this.handleWhisper();
              else this.sendMessage();
            }}
          >
            {this.state.canTalk ? (
              this.state.whisperingTo !== null ? (
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Form.Control
                    ref={this.chatRef}
                    placeHolder={
                      "Whisper to " +
                      this.state.playerList[this.state.whisperingTo].name
                    }
                    value={this.state.textMessage}
                    onChange={this.changeText}
                    maxLength={150}
                  />
                  <Button
                    variant="info"
                    onClick={this.handleWhisper}
                    className="btn-block"
                    style={{ flex: 1 }}
                  >
                    Whisper
                  </Button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Form.Control
                    ref={this.chatRef}
                    value={this.state.textMessage}
                    onChange={this.changeText}
                    maxLength={150}
                  />
                  <Button
                    variant="danger"
                    onClick={this.sendMessage}
                    className="btn-block"
                    style={{ flex: 1 }}
                  >
                    Submit
                  </Button>
                </div>
              )
            ) : (
              <Button
                variant="danger"
                onClick={() => {
                  this.props.setRoom(false);
                  this.props.setName("");
                  this.props.setRole("");
                  this.props.setFailReason("");
                }}
                className="btn-block"
              >
                Disconnect
              </Button>
            )}
          </Form>
        </div>
      </div>
    );
  }

  changeText(event) {
    this.setState({ textMessage: event.target.value });
  }

  handleVisit(playerIndex) {
    if (this.state.visiting !== playerIndex) {
      this.setState({ visiting: playerIndex });
      this.socket.emit("handleVisit", playerIndex, this.state.time === "Day");
    } else {
      this.setState({ visiting: null });
      this.socket.emit("handleVisit", null, this.state.time === "Day");
    }
  }

  openWhisperMenu(playerIndex) {
    if (this.state.whisperingTo === playerIndex) {
      this.setState({ whisperingTo: null });
      this.chatRef.current.focus(); //TODO: Fix focusing
    } else {
      this.setState({ whisperingTo: playerIndex });
      this.chatRef.current.focus();
    }
  }

  handleWhisper() {
    if (
      this.state.textMessage.length > 0 &&
      this.state.textMessage.length <= 150
    ) {
      this.socket.emit(
        "handleWhisper",
        this.state.whisperingTo,
        this.state.textMessage,
        this.state.time === "Day",
      );
    }
    this.setState({
      textMessage: "",
      whisperingTo: null,
    });
    this.openWhisperMenu(this.state.whisperingTo);
  }

  handleVote(playerIndex) {
    if (this.state.votingFor !== playerIndex) {
      this.setState({ votingFor: playerIndex });
      this.socket.emit("handleVote", playerIndex, this.state.time === "Day");
    } else {
      this.setState({ votingFor: null });
      this.socket.emit("handleVote", null, this.state.time === "Day");
    }
  }

  sendMessage() {
    if (
      this.state.textMessage.length > 0 &&
      this.state.textMessage.length <= 150
    ) {
      this.socket.emit(
        "messageSentByUser",
        this.state.textMessage,
        this.state.time === "Day",
      ); //Sends to server
      this.setState({ textMessage: "" }); //Clears the text box
    }
  }

  scrollEvent() {
    if (
      this.scrollRef.current.scrollHeight -
        this.scrollRef.current.scrollTop -
        this.scrollRef.current.clientHeight <=
      this.scrollRef.current.clientHeight / 5
    ) {
      this.setState({ showScrollDown: false, scrollNewMessages: 0 });
    } else this.setState({ showScrollDown: true });
  }

  componentDidMount() {
    this.scrollRef.current.addEventListener("scroll", this.scrollEvent);

    this.socket.on("connect", () => {
      console.log("You connected to the socket with ID " + this.socket.id);
    });

    this.socket.on("receiveMessage", (inMsg) => {
      //Scrolls down if the user is close to the bottom, doesn't if they've scrolled up the review the chat history (By more than 1/5th of the window's height)
      let msg = {
        type: 0,
        text: inMsg,
      };

      if (
        this.scrollRef.current.scrollHeight -
          this.scrollRef.current.scrollTop -
          this.scrollRef.current.clientHeight <=
        this.scrollRef.current.clientHeight / 5
      ) {
        this.setState({
          messages: [...this.state.messages, msg],
          showScrollDown: false,
          scrollNewMessages: 0,
        }); //Adds message to message list.
        this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
      } else
        this.setState({
          messages: [...this.state.messages, msg],
          showScrollDown: true,
          scrollNewMessages: this.state.scrollNewMessages + 1,
        }); //Adds message to message list.
    });

    this.socket.on("receive-chat-message", (inMsg) => {
      //Scrolls down if the user is close to the bottom, doesn't if they've scrolled up the review the chat history (By more than 1/5th of the window's height)
      let msg = {
        type: 1,
        text: inMsg,
      };

      if (
        this.scrollRef.current.scrollHeight -
          this.scrollRef.current.scrollTop -
          this.scrollRef.current.clientHeight <=
        this.scrollRef.current.clientHeight / 5
      ) {
        this.setState({
          messages: [...this.state.messages, msg],
          showScrollDown: false,
          scrollNewMessages: 0,
        }); //Adds message to message list.
        this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
      } else
        this.setState({
          messages: [...this.state.messages, msg],
          showScrollDown: true,
          scrollNewMessages: this.state.scrollNewMessages + 1,
        }); //Adds message to message list.
    });

    this.socket.on("receive-whisper-message", (inMsg) => {
      //Scrolls down if the user is close to the bottom, doesn't if they've scrolled up the review the chat history (By more than 1/5th of the window's height)
      let msg = {
        type: 2,
        text: inMsg,
      };

      if (
        this.scrollRef.current.scrollHeight -
          this.scrollRef.current.scrollTop -
          this.scrollRef.current.clientHeight <=
        this.scrollRef.current.clientHeight / 5
      ) {
        this.setState({
          messages: [...this.state.messages, msg],
          showScrollDown: false,
          scrollNewMessages: 0,
        }); //Adds message to message list.
        this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
      } else
        this.setState({
          messages: [...this.state.messages, msg],
          showScrollDown: true,
          scrollNewMessages: this.state.scrollNewMessages + 1,
        }); //Adds message to message list.
    });

    this.socket.on("receive-player-list", (listJson) => {
      //Receive all players upon joining, and the game starting
      this.setState({ playerList: listJson });
    });

    this.socket.on("receive-new-player", (playerJson) => {
      //Called when a new player joins the lobby
      this.setState({ playerList: [...this.state.playerList, playerJson] });
    });

    this.socket.on("remove-player", (playerJson) => {
      //Called when a player leaves the lobby before the game starts
      console.log("Removing player " + playerJson.name);
      this.setState({
        playerList: this.state.playerList.filter(
          (player) => player.name !== playerJson.name,
        ),
      });
    });

    this.socket.on("assign-player-role", (playerJson) => {
      //Shows the player their own role, lets the client know that this is who they are playing as
      let tempPlayerList = [...this.state.playerList];
      let index = tempPlayerList.findIndex(
        (player) => player.name === playerJson.name,
      );
      tempPlayerList[index].role = playerJson.role;
      tempPlayerList[index].isUser = true;
      this.props.setRole(playerJson.role);
      this.setState({
        playerList: tempPlayerList,
        canVisit: [
          playerJson.dayVisitSelf,
          playerJson.dayVisitOthers,
          playerJson.dayVisitFaction,
          playerJson.nightVisitSelf,
          playerJson.nightVisitOthers,
          playerJson.nightVisitFaction,
        ],
        canNightVote: playerJson.nightVote,
      });
    });

    this.socket.on("update-faction-role", (playerJson) => {
      //Reveals the role of factional allies
      let tempPlayerList = [...this.state.playerList];
      let index = tempPlayerList.findIndex(
        (player) => player.name === playerJson.name,
      );
      if (playerJson.role !== undefined)
        tempPlayerList[index].role = playerJson.role;
      this.setState({ playerList: tempPlayerList });
    });

    this.socket.on("update-player-role", (playerJson) => {
      //Updates player role upon their death
      let tempPlayerList = [...this.state.playerList];
      let index = tempPlayerList.findIndex(
        (player) => player.name === playerJson.name,
      );
      if (playerJson.role !== undefined)
        tempPlayerList[index].role = playerJson.role;
      tempPlayerList[index].isAlive = false;
      this.setState({ playerList: tempPlayerList });
    });

    this.socket.on("update-player-visit", (playerJson) => {
      //Updates player to indicate that the player is visiting them
      //JSON contains player name
      //Get player by name, update properties, update JSON
    });

    this.socket.on("update-day-time", (infoJson) => {
      //Gets whether it is day or night, and how long there is left in the session
      this.setState({
        time: infoJson.time,
        dayNumber: infoJson.dayNumber,
        visiting: null, //Resets who the player is visiting
        votingFor: null,
        whisperingTo: null,
      });
      let timeLeft = infoJson.timeLeft;
      let countDown = setInterval(() => {
        if (timeLeft > 0) {
          this.setState({ timeLeft: timeLeft - 1 });
          timeLeft--;
        } else {
          clearInterval(countDown);
        }
      }, 1000);
    });

    this.socket.on("disable-voting", () => {
      this.setState({ votingDisabled: true });
    });

    this.socket.on("blockMessages", () => {
      this.setState({ canTalk: false });
    });

    this.socket.emit("playerJoinRoom", this.props.captchaToken, (callback) => {
      if (typeof callback == "number") {
        if (callback === 1)
          this.props.setFailReason(
            "Your socket ID was equal to existing player in room.",
          );
        else if (callback === 2)
          this.props.setFailReason(
            "Your selected username was the same as another player in the room.",
          );
        else if (callback === 3) this.props.setFailReason("The room was full.");
        this.props.setRoom(false);
        this.props.setName("");
        this.props.setRole("");
      } else {
        this.props.setFailReason("");
        this.props.setName(callback);
      }
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.scrollDownRequest) {
      this.setState({ scrollDownRequest: false });
      this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
    }
  }

  componentWillUnmount() {
    this.scrollRef.current.removeEventListener("scroll", this.scrollEvent);

    this.socket.off("receiveMessage");
    this.socket.off("receive-chat-message");
    this.socket.off("receive-whisper-message");
    this.socket.off("blockMessages");
    this.socket.off("receive-role");
    this.socket.off("receive-player-list");
    this.socket.off("receive-new-player");
    this.socket.off("remove-player");
    this.socket.off("update-player-role");
    this.socket.off("update-player-visit");
    this.socket.off("update-day-time");
    this.socket.disconnect();
  }
}
