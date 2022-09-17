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
    }

    render() {
        return (
            <ListGroup.Item variant={this.state.variant}>
                <Row>
                    <Col>
                        {this.props.username} {this.props.role !== undefined?`(${this.props.role})`:""}
                    </Col>
                    <Col md="auto">
                        {this.props.canTalk && this.state.canWhisper && this.props.time === 'Day' && <Button variant="primary" onClick={() => this.props.handleWhisper(this.props.username)}>🗩</Button>}
                        {this.props.canTalk && this.props.time === 'Day' && this.props.isAlive && <Button variant={this.props.votingFor===this.props.username?"success":"primary"} onClick={() => this.props.handleVote(this.props.username)}>☑</Button>}
                        {this.props.canTalk && this.state.canVisit && <Button variant={this.props.visiting===this.props.username?"success":"primary"} onClick={() => this.props.handleVisit(this.props.username)}>◎</Button>}
                    </Col>
                </Row>
            </ListGroup.Item>
        )
    }

    componentDidUpdate(prevProps, prevState) {
        //Sets the ListGroupItem's colour to represent the player's state
        //if(!this.props.isAlive) this.setState({variant: "danger"});
        if(this.props.isAlive !== prevProps.isAlive) {
            if(this.props.isAlive) this.setState({variant: "primary", canVisit: true, canWhisper: true});
            else this.setState({variant: "danger", canVisit: false, canWhisper: false});
        }
        else if(this.props.isAlive && this.props.isUser !== prevProps.isUser) this.setState({variant: "success", canVisit: true, canWhisper: false});
    }
}

export default PlayerItem;