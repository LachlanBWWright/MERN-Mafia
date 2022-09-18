import React from 'react';
import {ListGroup, Row, Col, Button} from 'react-bootstrap';

class PlayerItem extends React.Component {
    constructor(props) {
        super(props)
        this.state = ({
            variant: "",
            canWhisper: false,
            canVisit: false
        });

        //this.props.canVisit - //dayVisitSelf, dayVisitOthers, dayVisitFaction, nightVisitSelf, nightVisitOthers, nightVisitFaction
    }

    render() {
        return (
            <ListGroup.Item variant={this.state.variant}>
                <Row>
                    <Col>
                        {this.props.username} {this.props.role !== undefined?`(${this.props.role})`:""}
                    </Col>
                    <Col md="auto">
                        {this.canWhisper() && <Button variant="primary" onClick={() => this.props.handleWhisper(this.props.username)}>🗩</Button>}
                        {this.canVote() && <Button variant={this.props.votingFor===this.props.username?"success":"primary"} onClick={() => this.props.handleVote(this.props.username)}>☑</Button>}
                        {this.canVisit() && <Button variant={this.props.visiting===this.props.username?"success":"primary"} onClick={() => this.props.handleVisit(this.props.username)}>◎</Button>}
                    </Col>
                </Row>
            </ListGroup.Item>
        )
    }

    canVisit() { //For now, if the player's role is known, they are interpreted as a member of the same faction
        if(!this.props.canTalk || !this.state.canVisit) return false;
        if(this.props.time === 'Day') {
            if(this.props.canVisit[0] && this.props.isAlive && this.props.isUser) return true;
            else if(this.props.canVisit[1] && this.props.isAlive && this.props.role === undefined && !this.props.isUser) return true;
            else if(this.props.canVisit[2] && this.props.isAlive && this.props.role !== undefined && !this.props.isUser) return true;
        }
        else if(this.props.time === 'Night') {
            if(this.props.canVisit[3] && this.props.isAlive && this.props.isUser) return true;
            else if(this.props.canVisit[4] && this.props.isAlive && this.props.role === undefined && !this.props.isUser) return true;
            else if(this.props.canVisit[5] && this.props.isAlive && this.props.role !== undefined && !this.props.isUser) return true;
        }
        return false;
    }

    canVote() {
        if(this.props.canTalk && this.props.time === 'Day' && this.props.dayNumber !== 1 && this.props.isAlive && !this.props.isUser) return true;
        return false;
    }

    canWhisper() {
        return this.props.canTalk && this.state.canWhisper && this.props.time === 'Day' && this.props.dayNumber !== 1;
    }

    componentDidUpdate(prevProps, prevState) {
        if(this.props.isAlive !== prevProps.isAlive) {
            if(this.props.isAlive) this.setState({
                variant: "primary", 
                canVisit: true, 
                canWhisper: true});
            else this.setState({
                variant: "danger", 
                canVisit: false, 
                canWhisper: false
            });
        }
        else if(this.props.isAlive && this.props.isUser !== prevProps.isUser) this.setState({
            variant: "success", 
            canVisit: true, 
            canWhisper: false
        });
    }
}

export default PlayerItem;