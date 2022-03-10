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

        this.handleVoteClick = this.handleVoteClick.bind(this);
        this.handleWhisperClick = this.handleWhisperClick.bind(this);
        this.handleVisitClick = this.handleVisitClick.bind(this);

    }

    render() {
        return (
            <ListGroup.Item variant={this.state.variant}>
                <Row>
                    <Col>
                        {this.props.username} {this.props.role !== undefined?`(${this.props.role})`:""}
                    </Col>
                    <Col md="auto">
                        {this.props.canTalk && this.state.canWhisper && this.props.time === 'Day' && <Button variant="primary" onClick={this.handleWhisperClick}>Whisper</Button>}
                        {this.props.canTalk && this.props.time === 'Day' && this.props.isAlive && <Button variant={this.props.votingFor===this.props.username?"success":"primary"} onClick={this.handleVoteClick}>Vote</Button>}
                        {this.props.canTalk && this.state.canVisit && <Button variant={this.props.visiting===this.props.username?"success":"primary"} onClick={this.handleVisitClick}>Visit</Button>}
                    </Col>
                </Row>
            </ListGroup.Item>
        )
    }

    handleVoteClick() {
        this.props.handleVote(this.props.username);
    }

    handleWhisperClick() {
        this.props.handleWhisper(this.props.username);
    }

    handleVisitClick() {
        this.props.handleVisit(this.props.username);
    }

    componentDidUpdate(prevProps, prevState) {
        //Sets the ListGroupItem's colour to represent the player's state
        //if(!this.props.isAlive) this.setState({variant: "danger"});
        if(this.props.isAlive !== prevProps.isAlive) {
            if(this.props.isAlive)  {
                this.setState({variant: "primary", canVisit: true, canWhisper: true});
            }
            else  {
                this.setState({variant: "danger", canVisit: false, canWhisper: false});
            }
        }
        else if(this.props.isAlive && this.props.isUser !== prevProps.isUser) this.setState({variant: "success", canVisit: true, canWhisper: false});
    }

    componentWillUnmount() {

    }
}

export default PlayerItem;