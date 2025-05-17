import React from "react";
import { Card, CardBody, CardTitle, CardText } from "react-bootstrap";
import { roles } from "../info/roles";

export default function RolesPage() {
  return (
    <Card style={{ margin: "2vh", flex: 1, overflow: "auto" }}>
      <CardBody>
        <CardTitle className="text-center">Roles</CardTitle>
        {[...roles.entries()].map((item) => (
          <>
            <CardText style={{ fontWeight: "bold" }}>{item[0]}</CardText>
            <CardText>{item[1]}</CardText>
          </>
        ))}
      </CardBody>
    </Card>
  );
}
