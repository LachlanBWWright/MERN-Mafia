import React from "react";
import { Card } from "react-bootstrap";

class SettingPage extends React.Component {
  render() {
    return (
      <Card style={{ margin: "2vh", flex: 1 }}>
        <Card.Body>
          <Card.Title className="text-center">Settings</Card.Title>
          <Card.Text>Settings page.</Card.Text>
        </Card.Body>
      </Card>
    );
  }
}

export default SettingPage;
