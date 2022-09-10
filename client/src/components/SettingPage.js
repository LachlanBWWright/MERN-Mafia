import React from 'react';
import {Card} from 'react-bootstrap';

class SettingPage extends React.Component {    
    render() {
        return (
            <div style={{padding: '2vh'}}>
                <Card style={{margin: 'auto'}}>
                    <Card.Body>
                        <Card.Title className='text-center'>Settings</Card.Title>
                        <Card.Text>
                            Settings page.
                        </Card.Text>  
                    </Card.Body>
                </Card>   
            </div>
        )
    }
}

export default SettingPage;