import React from 'react';
import $ from 'jquery';
import {Input, Button, Card, Image, Form, Field, Icon} from 'semantic-ui-react';
import { Link, Redirect } from 'react-router-dom';

class NewUser extends React.Component {
  constructor(props) {
    super(props);

    // Username input field for Sign up is
    // seeded from login field.

    this.state = {
      username: this.props.username,
      firstName: undefined,
      lastName: undefined,
      pictureUrl: '/images/profile_default.jpg',
      redirect: false,
      invalidInput: false,
      duplicateUsername: false
    }
  }

  handleInputChange(event) {
    const value = event.target.value;
    const name = event.target.name;

    // When a user types into any field field
    // update the field and reset all duplicate username
    // and invalid input errors (probably not best behavior ....)

    this.setState({
      [name]: value, 
      duplicateUsername: false,
      invalidInput: false
    });
  }

  handleSubmit() {
    // If required fields are missing, throw error
    if (!this.state.username || !this.state.firstName || !this.state.lastName) {
      this.setState({
        invalidInput: true
      });

    // Post to the signup endpoint
    } else {

      $.post(`/api/${this.state.username}`, this.state, () => {
        // After successfull signup log user in
        // Instead, consider just returning user data at this point

        this.props.logUserIn(this.state.username);

        // On successful account creation, redirect away from signup page
        this.setState({
          redirect: true
        })

      })
      .fail((err) => {
        // on failure, if error was duplicate username, show that error
        if (err.responseJSON.includes('Key (username)=') && err.responseJSON.includes('already exists.')) {
          this.setState({
            duplicateUsername: true
          });
        }
      });
    }
  }
  
  render() {
    
    if (this.state.redirect) {
      let newUserFeedPath = '/' + this.state.username + '/feed';
      return <Redirect push to={newUserFeedPath} />;
    }

    return (
      <div className="newUser">
        {this.props.usernameError && <h3><font color="red"><Icon name="warning circle"/>Username '{this.props.username}' doesn't match any account.</font></h3>}
        
        <h4 id="new-account-title">Create a New Account</h4>
        <Card className="new-user-card">
          <Image className="ui tiny images" src="/images/profile_default.jpg"/>
          <Form 
            className="input-form"
            onSubmit={this.handleSubmit.bind(this)}>
          
            {this.state.invalidInput && <h5 className="undefined-user-error"><Icon name="warning circle"/>All fields are required. Please enter your info and try again.</h5>}
            
            {this.state.duplicateUsername && <h5 className="undefined-user-error"><Icon name="warning circle"/>Username is already in the system. Please log in above or choose a different username.</h5>}
            
            <Input 
              className="newUserInput" 
              name="username" 
              type="text" 
              onChange={this.handleInputChange.bind(this)} 
              placeholder="Username"/>
            <Input 
              className="newUserInput"
              name="firstName"
              type="text"
              onChange={this.handleInputChange.bind(this)} 
              placeholder="First name"/>
            <Input 
              className="newUserInput"
              name="lastName"
              type="text"
              onChange={this.handleInputChange.bind(this)}
              placeholder="Last name"/>
            <div id="terms">By clicking Create Account, you agree to our Terms and that you have read our Data Policy, including our Cookie Use.</div>
            <Input 
              className="login-button"
              id="create-account"
              type="submit"
              value="Create Account"
            />
          </Form>
        </Card>
      </div>
    );
  }
}

export default NewUser;

