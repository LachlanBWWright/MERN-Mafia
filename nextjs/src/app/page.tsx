"use client";

import React, { useEffect, useState } from "react";
import { Card, Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import { Room } from "./play/Room";
import { roles } from "~/app/info/roles";

import ReCAPTCHA from "react-google-recaptcha";

export default function PlayPage() {
  const [playerName, setPlayerName] = useState("");
  const [playerRoom, setPlayerRoom] = useState(false);
  const [playerRole, setPlayerRole] = useState("");
  const [failReason, setFailReason] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaEntered, setCaptchaEntered] = useState(false);
  const [inGame, setInGame] = useState(false);

  useEffect(() => {
    setInGame(playerRole !== "");
  }, [playerRole, setInGame]);

  if (playerRoom) {
    /* Shows the room if a name and room has been selected */
    return (
      <Card
        style={{ margin: "2vh", display: "flex", flex: 1, overflow: "hidden" }}
      >
        <Card.Body
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Card.Text>
            Your Name is {playerName}.
            {playerRole !== "" ? " Your role is " + playerRole + "." : ""}{" "}
            {playerRole !== "" && (
              <OverlayTrigger
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => (
                  <Tooltip id="button-tooltip" {...props}>
                    {roles.get(playerRole)}
                  </Tooltip>
                )}
              >
                <Button size="sm" variant="danger">
                  ?
                </Button>
              </OverlayTrigger>
            )}
          </Card.Text>
          <Room
            captchaToken={captchaToken}
            setFailReason={setFailReason}
            setName={setPlayerName}
            setRoom={setPlayerRoom}
            setRole={setPlayerRole}
          />
        </Card.Body>
      </Card>
    );
  } else {
    return (
      <Card className="text-center" style={{ margin: "2vh", flex: 1 }}>
        <Card.Body style={{ display: "flex", flexDirection: "column" }}>
          <Card.Title className="text-center">Play</Card.Title>
          {failReason !== "" && <Card.Text>{failReason}</Card.Text>}
          <Card.Text>
            This game was created by Lachlan Wright, you can view my GitHub
            profile <a href="http://www.github.com/LachlanBWWright">here,</a> or
            the repository for this game{" "}
            <a href="https://github.com/LachlanBWWright/MERN-Mafia">here.</a>
          </Card.Text>
          <Card.Text>
            This is an online game similar to the &apos;mafia&apos; party game.
            Most players are members of the town, while a few are mafia.
          </Card.Text>
          <div style={{ flex: 1 }}></div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignContent: "center",
            }}
          >
            <div style={{ flex: 1 }}></div>

            <div style={{ flex: 1 }}></div>
          </div>
          <Button
            variant="danger"
            size="lg"
            style={{ width: "100%" }}
            onClick={() => {
              setPlayerRoom(true);
            }}
          >
            Join A Match!
          </Button>
        </Card.Body>
      </Card>
    );
  }
}
