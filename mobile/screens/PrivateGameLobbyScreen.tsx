import React from "react";
import { View, Text } from "react-native";

export default function PrivateGameLobbyScreen() {
  return (
    <View
      style={{ alignSelf: "stretch", marginTop: "auto", flex: 1, padding: 20 }}
    >
      <Text style={{ justifyContent: "flex-start", alignSelf: "center" }}>
        Welcome To MERN Mafia!
      </Text>
      <Text style={{ justifyContent: "flex-start", alignSelf: "center" }}>
        A list of games should go right about here!
      </Text>
    </View>
  );
}
