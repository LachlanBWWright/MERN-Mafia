useEffect(() => {
  socket.on("connect", () => {
    console.log("You connected to the socket with ID " + socket.id);
  });

  socket.on("receiveMessage", (inMsg) => {
    //Scrolls down if the user is close to the bottom, doesn't if they've scrolled up the review the chat history (By more than 1/5th of the window's height)
    let msg = {
      type: 0,
      text: inMsg,
    };

    if (scrollRef.current === null) return;

    if (
      scrollRef.current.scrollHeight -
        scrollRef.current.scrollTop -
        scrollRef.current.clientHeight <=
      scrollRef.current.clientHeight / 5
    ) {
      setMessages((messages) => [...messages, msg]);
      setShowScrollDown(false);
      setScrollNewMessages(0);

      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    } else {
      setMessages((messages) => [...messages, msg]);
      setShowScrollDown(true);
      setScrollNewMessages(scrollNewMessages + 1);
    }
  });

  socket.on("receive-chat-message", (inMsg) => {
    //Scrolls down if the user is close to the bottom, doesn't if they've scrolled up the review the chat history (By more than 1/5th of the window's height)
    let msg = {
      type: 1,
      text: inMsg,
    };

    if (!scrollRef.current) return;

    if (
      scrollRef.current.scrollHeight -
        scrollRef.current.scrollTop -
        scrollRef.current.clientHeight <=
      scrollRef.current.clientHeight / 5
    ) {
      console.log(messages);
      console.log(msg);
      setMessages((messages) => [...messages, msg]);
      setShowScrollDown(false);
      setScrollNewMessages(0);
      //Adds message to message list.
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    } else {
      console.log(messages);
      console.log(msg);
      setMessages((messages) => [...messages, msg]);
      setShowScrollDown(true);
      setScrollNewMessages(scrollNewMessages + 1);
      //Adds message to message list.
    }
  });

  socket.on("receive-whisper-message", (inMsg) => {
    //Scrolls down if the user is close to the bottom, doesn't if they've scrolled up the review the chat history (By more than 1/5th of the window's height)
    let msg = {
      type: 2,
      text: inMsg,
    };

    if (!scrollRef.current) return;

    if (
      scrollRef.current.scrollHeight -
        scrollRef.current.scrollTop -
        scrollRef.current.clientHeight <=
      scrollRef.current.clientHeight / 5
    ) {
      setMessages((messages) => [...messages, msg]);
      setShowScrollDown(false);
      setScrollNewMessages(0);
      //Adds message to message list.
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    } else {
      setMessages((messages) => [...messages, msg]);
      setShowScrollDown(true);
      setScrollNewMessages(scrollNewMessages + 1);
      //Adds message to message list.
    }
  });

  socket.on("receive-player-list", (listJson) => {
    //Receive all players upon joining, and the game starting
    setPlayerList(listJson);
  });

  socket.on("receive-new-player", (playerJson) => {
    //Called when a new player joins the lobby
    setPlayerList([...playerList, playerJson]);
  });

  socket.on("remove-player", (playerJson) => {
    //Called when a player leaves the lobby before the game starts
    console.log("Removing player " + playerJson.name);
    setPlayerList((playerList) => {
      return playerList.filter((player) => player.name !== playerJson.name);
    });
  });

  socket.on("assign-player-role", (playerJson) => {
    //Shows the player their own role, lets the client know that this is who they are playing as

    setPlayerList((playerList) => {
      let tempPlayerList = [...playerList];
      let index = tempPlayerList.findIndex(
        (player) => player.name === playerJson.name,
      );
      tempPlayerList[index].role = playerJson.role;
      tempPlayerList[index].isUser = true;
      setRole(playerJson.role);

      return tempPlayerList;
    });

    setCanVisit([
      playerJson.dayVisitSelf,
      playerJson.dayVisitOthers,
      playerJson.dayVisitFaction,
      playerJson.nightVisitSelf,
      playerJson.nightVisitOthers,
      playerJson.nightVisitFaction,
    ]);
    setCanNightVote(playerJson.nightVote);
  });

  socket.on("update-faction-role", (playerJson) => {
    //Reveals the role of factional allies
    setPlayerList((playerList) => {
      let tempPlayerList = [...playerList];
      let index = tempPlayerList.findIndex(
        (player) => player.name === playerJson.name,
      );
      if (playerJson.role !== undefined)
        tempPlayerList[index].role = playerJson.role;
      return tempPlayerList;
    });
  });

  socket.on("update-player-role", (playerJson) => {
    //Updates player role upon their death
    setPlayerList((playerList) => {
      let tempPlayerList = [...playerList];
      let index = tempPlayerList.findIndex(
        (player) => player.name === playerJson.name,
      );
      if (playerJson.role !== undefined)
        tempPlayerList[index].role = playerJson.role;
      tempPlayerList[index].isAlive = false;
      return tempPlayerList;
    });
  });

  socket.on("update-player-visit", () => {
    //Updates player to indicate that the player is visiting them
    //JSON contains player name
    //Get player by name, update properties, update JSON
  });

  socket.on("update-day-time", (infoJson) => {
    //Gets whether it is day or night, and how long there is left in the session
    setTime(infoJson.time);
    setDayNumber(infoJson.dayNumber);
    setVisiting(null); //Resets who the player is visiting
    setVotingFor(null);
    setWhisperingTo(null);

    let timeLeftLocal = infoJson.timeLeft;
    let countDown = setInterval(() => {
      if (timeLeftLocal > 0) {
        setTimeLeft(timeLeftLocal - 1);
        timeLeftLocal--;
      } else {
        clearInterval(countDown);
      }
    }, 1000);
  });

  socket.on("disable-voting", () => {
    setVotingDisabled(true);
  });

  socket.on("blockMessages", () => {
    setCanTalk(false);
  });

  socket.emit("playerJoinRoom", captchaToken, (callback) => {
    console.log("CALLBACK:" + callback);
    if (typeof callback == "number") {
      if (callback === 1)
        setFailReason("Your socket ID was equal to existing player in room.");
      else if (callback === 2)
        setFailReason(
          "Your selected username was the same as another player in the room.",
        );
      else if (callback === 3) setFailReason("The room was full.");
      setRoom(false);
      setName("");
      setRole("");
    } else {
      setFailReason("");
      setName(callback);
    }
  });

  return () => {
    scrollRef.current?.removeEventListener("scroll", scrollEvent);

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
  };
}, []);
