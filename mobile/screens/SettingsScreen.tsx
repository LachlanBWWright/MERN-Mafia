import React from "react";
import { View, Text } from "react-native";


export default function SettingsScreen() {
    return (
        <View style={{alignSelf: "stretch", marginTop: "auto", flex: 1, padding: 20 }}>
            <Text style={{justifyContent: 'flex-start', alignSelf: "center"}}>Settings</Text>
        </View>
    )
}