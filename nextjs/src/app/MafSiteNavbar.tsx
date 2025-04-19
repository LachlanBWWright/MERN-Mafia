"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Navbar, Nav } from "react-bootstrap";

export function MafSiteNavbar({ children }: { children: React.ReactNode }) {
  const [inGame, setInGame] = useState(false);
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Navbar className="navbar-dark" bg="danger" expand="lg" sticky="top">
        <Nav>
          <Link href="/">
            <Navbar.Brand /* disabled={inGame} */>MERN Mafia</Navbar.Brand>
          </Link>
        </Nav>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link href="/">
              <Nav.Link disabled={inGame}>Play</Nav.Link>
            </Link>
            <Link href="/faq">
              <Nav.Link disabled={inGame}>FAQ</Nav.Link>
            </Link>
            <Link href="/roles">
              <Nav.Link disabled={inGame}>Roles</Nav.Link>
            </Link>
            <Link href="/stats">
              <Nav.Link disabled={inGame}>Stats</Nav.Link>
            </Link>
          </Nav>
        </Navbar.Collapse>

        <Nav>
          <Link href="/settings">
            <Nav.Link disabled={inGame}>Settings</Nav.Link>
          </Link>
          {/* <Nav.Link as={Link} to="/settings" className="justify-content-end" disabled={inGame}>Login Placeholder</Nav.Link> */}
        </Nav>
      </Navbar>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
