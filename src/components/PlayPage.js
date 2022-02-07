import React from 'react';
import {Card} from 'react-bootstrap';
import {Outlet} from 'react-router-dom'
import Room from './Room'


class PlayPage extends React.Component {    
    render() {
        return (
            <div style={{padding: '2vh', width: '30 rem'}}>
                <Card style={{width: '30 rem', margin: 'auto'}}>
                    <Card.Body>
                        <Card.Title className='text-center'>Play</Card.Title>
                            <Room/>
                    </Card.Body>
                    
                </Card>   
                
                <Outlet/> 
            </div>
        )
    }



    testFunction() {
        console.log('Test!');
    }

}

export default PlayPage;