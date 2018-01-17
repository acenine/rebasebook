import React from 'react';
import $ from 'jquery';
import {Input, Button, Card, Icon} from 'semantic-ui-react';
import NewUser from './NewUser.jsx'
import { Redirect, Link } from 'react-router-dom';

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      newUsername: '',
      newUser: false,
      getNewUser: false,
      redirect: false,
      profileShows: false,
      headerShows: false,
      undefinedUsername: false,
      usernameError: false,
      userId: null
    };
  }

  handleUsernameInput (e) { 
    this.setState({
      username: e.target.value,
      usernameError: false
    });
  }

  handleSubmit(e) {
    this.setState({
      newUser: true
    })
  }
  
  handleLogIn(e) {
    e.preventDefault();
    if (!this.state.username) {
      this.setState({
        undefinedUsername: true
      });
    } else {
      $.get(`/api/${this.state.username}`, (data) => {
        if (data.length) {
          this.setState({
            username: data[0].username,
            newUser: false,
            redirect: true
          });
          this.props.getUsername(this.state.username);
          this.props.getSignedIn(true);
          this.props.getProfile(this.state.username);
        } else {
          this.setState({
            newUser: true,
            getNewUser: true,
            redirect: false,
            usernameError: true
          });
        }
      })
    }  
  }

  handleSignUp(e) {
    e.preventDefault();
    this.setState({
      newUser: true
    });
  }

  getUsername() {
    this.props.getUsername(this.state.username);
  }

  render() {
    let feedPath = '/' + this.state.username + '/feed';
    if (this.state.redirect) {
      return <Redirect push to={feedPath} />;
    }
    return(
      <div className="signIn-page">
        <div className="left-column">
          <h1 className="signInLogoLabel">Welcome to</h1>
          <img className="signInLogo" src='/images/rebasebookblue.png' />
          <h3 className="signInTag">The social media for <span className="programmersLabel">&#60;programmers&#62;</span>.</h3>
        </div>
        <div className="right-column">
          <h3 id="sign-in"> Sign In </h3>
          <form onSubmit={this.handleSubmit.bind(this)}>
          <Card className="signIn-card">
            <h5 className="signInLabel bottom aligned content">Username</h5>
            {this.state.undefinedUsername ? <h5 className="undefined-user-error"><Icon name="warning circle"/>Please enter your username.</h5> : null}
            <Input className="username-input" type="text" onChange={this.handleUsernameInput.bind(this)}/>
            <Link onClick={this.handleLogIn.bind(this)} to={feedPath}><Button className="login-button" id="login"> Log In </Button></Link>
            <div id="create-account-text">Don't have an account yet?</div>
            <div><Button className="login-button" id="create-new-account" onClick={this.handleSignUp.bind(this)}>Sign Up</Button></div>
          </Card>
          {this.state.newUser ? <NewUser usernameError={this.state.usernameError} newUsername={this.state.newUsername} getNewUsername={this.props.getNewUsername} username={this.state.username} getSignedIn={this.props.getSignedIn}/> : null }
          </form>
        </div>
      </div>  
    )
  }
}

export default SignIn;