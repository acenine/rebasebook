import React from 'react';
import { Route, Switch } from 'react-router-dom';
import App from './index.jsx';
import Feed from './components/Feed.jsx';
import PostList from './components/PostList.jsx';
import Profile from './components/Profile.jsx';
import Header from './components/Header.jsx';
import SignIn from './components/SignIn.jsx';
import axios from 'axios';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      newUsername: '',
      signedIn: '',
      name: '',
      picture_url: '',
      userId: null,
      friendRequests: []
    }
  }
  getProfile(user) {
    axios.get(`/api/${user}`) 
    .then((res) => {
      let userId = res.data[0].id;
      this.setState({
        view: 'profile',
        name: res.data[0].first_name + ' ' + res.data[0].last_name,
        picture_url: res.data[0].picture_url,
        username: res.data[0].username,
        userId: userId
      })

      this.getFriendRequests(userId);
    })
    .catch((err) => {
      console.error('err: ', err);
    })
  }

  getUsername(username) {
    this.setState({
      username: username
    })
  }
  getNewUsername(newUsername) {
    this.setState({
      username: newUsername
    })
  }
  getSignedIn(signedIn) {
    this.setState({
      signedIn: signedIn
    })
  }

  getFriendRequests(userId) {
    let params = {
      userId: userId,
      type: 'requests'
    }

    axios.get('/api/friend_list', {params: params}) 
      .then((results) => {
        this.setState({
          friendRequests: results.data
        });
      })
      .catch((err) => {
        console.error('err: ', err);
      })
  }

  render() {
    return (
      <main>
        <div>
          <Header 
            getProfile={this.getProfile.bind(this)} 
            name={this.state.username} 
            userId={this.state.userId}
            signedIn={this.state.signedIn} 
            getSignedIn={this.getSignedIn.bind(this)}
            friendRequests={this.state.friendRequests}
          />
          <Switch>
            <Route 
              exact path='/'
              component={() => 
                <SignIn 
                  getUsername={this.getUsername.bind(this)}
                  getNewUsername={this.getNewUsername.bind(this)}
                  getProfile={this.getProfile.bind(this)}
                  getSignedIn={this.getSignedIn.bind(this)}
                /> } 
            />
            <Route
              path='/:username/feed' 
              component={(routeProps) => 
                <Feed 
                  {...routeProps}
                  userId={this.state.userId}
                  username={this.state.username} 
                /> }
            />
            <Route 
              path='/login' 
              component={() =>
                <SignIn 
                  getUsername={this.getUsername.bind(this)}
                  getNewUsername={this.getNewUsername.bind(this)}
                  getProfile={this.getProfile.bind(this)}
                  getSignedIn={this.getSignedIn.bind(this)}
                />
              } 
            />
            <Route 
              path='/profile/:friendname'
              component={ (routeProps) =>
                <Profile 
                  {...routeProps}
                  loggedInUserId={this.state.userId}
                  loggedInUsername={this.state.username}
                />
              } 
            />
          </Switch>
        </div>
      </main>
    )
  }
  
}

export default Main;

