import React, {useEffect, useState} from 'react';
import {Card} from 'react-bootstrap';
import {Outlet, useOutletContext} from 'react-router-dom';
import Room from './Room';
import RoomList from './RoomList';
import {GoogleReCaptcha} from 'react-google-recaptcha-v3'

function PlayPage() {
    const [playerName, setPlayerName] = useState('');
    const [playerRoom, setPlayerRoom] = useState('');
    const [playerRole, setPlayerRole] = useState('');
    const [failReason, setFailReason] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const setInGame = useOutletContext();

    useEffect(() => {
            setInGame(playerRole !== '');
    })

    if(playerRoom !== '') { /* Shows the room if a name and room has been selected */
        return (
            <div style={{padding: '2vh', width: '30 rem'}}>
                <Card>
                    <Card.Body>
                        <Card.Text>Your Name is {playerName}. Your role is {playerRole}.</Card.Text>
                        <Room captchaToken={captchaToken} playerName={playerName} playerRoom={playerRoom} setFailReason={setFailReason} 
                            setName={setPlayerName} setRoom={setPlayerRoom} setRole={setPlayerRole}
                        /> 
                    </Card.Body>
                </Card>
            </div>  
        )
    }
    else {
        return (
            <div style={{padding: '2vh', width: '30 rem'}}>
                <Card style={{width: '30 rem', margin: 'auto'}}>
                    <Card.Body>
                        <Card.Title className='text-center'>Play</Card.Title>
                            {failReason !== '' && <Card.Text>{failReason}</Card.Text>}
                            {playerName === '' || (<Card.Text>Your Name is: {playerName}</Card.Text>)}
                            <GoogleReCaptcha onVerify={setCaptchaToken} />
                            <RoomList setRoom={setPlayerRoom} setName={setPlayerName}/>                              
                    </Card.Body>  
                </Card>   
                <Outlet/> 
            </div>
        )
    }
}

export default PlayPage;