const route = require('express').Router();
const db = require('../database-posgtres/index.js');


const api = {

  user: {
    getProfile: function (req, res) {
      db.searchSomeone(req.params.user, (err, data) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).json(data);
        }
      });
    },

    getProfilePage: function(req, res) {
      var username = req.params.username;
      console.log('Username request received: ', username)
      db.getProfilePageInfo(username, (err, data) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).json(data);
        }
      });
    },

    getLiked: function (req, res) {
      db.getPersonalLikeAmount(req.params.username, req.query.text, (err, data) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).json(data);
        }
      })
    },

    getLikers: function (req, res) {

      db.getLikers(req.query.text, (err, data) => {
        if (err) {
          res.status(404).send(err);
        } else {
          res.status(200).json(data);
        }
      })
    },

    getUser: function(req, res) {
      var username = req.params.username;
      if (username !== 'favicon.ico') {
        db.getUser(username, (err, data) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).json(data);
          }
        })
      }
    },

    getUsername: function(req, res) {
      db.getUsername(req.params.firstname, req.params.lastname, (err, data) => {
        if (err) {
          res.status(404).send(err);
        } else {
          res.status(200).json(data);
        }
      })
    },

    createUser: function(req, res) {
      var username = req.params.username;
      if (username !== 'favicon.ico') {
        var newUserData = {
          username: req.body.username,
          pictureUrl: req.body.pictureUrl,
          firstName: req.body.firstName,
          lastName: req.body.lastName
        }
        db.addUser(newUserData, (err, data) => {
          if (err) {
            res.status(500).json(err);
          } else {
            db.addNewUserProfileInfo(newUserData.username, (err, data) => {
              if (err) {
                res.status(404).send(err);
              } else {
                res.status(200).json(data);
              }
            });
          }
        })
      }
    },

    addFriend: function(req, res) {
      var username = req.params.username;
      var friendToAdd = req.params.friendToAdd;
      db.addFriend(username, friendToAdd, (err, data) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).json(data);
        }
      });
    },

    getFriendsList: function(req, res) {
      var username = req.params.username;
      var otherUsername = req.params.otherUsername;
      db.getFriendsList(otherUsername, (err, data) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).json(data);
        }
      });
    },

    removeFriend: function(req, res) {
      var username = req.params.username;
      var friendToRemove = req.params.friendToRemove;
      db.removeFriend(username, friendToRemove, (err, data) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).json(data);
        }
      });
    },

    updateProfile: function(req, res) {
      var username = req.params.username;
      var changes = req.body;
      db.updateProfilePageInfo(username, changes, (err, data) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).json(data);
        }
      });
    },

    addFriendship: function(req, res) {
      // This endpoint creates a new friendship from userId to friendId. It will complete
      // the friendship if a pending relationship is in place

      let userId = parseInt(req.body.userId);
      let friendId = parseInt(req.body.friendId);

      db.addFriendship(userId, friendId)
        .then((results) => {
          console.log(results);
          res.sendStatus(200);
        })
        .catch((err) => {
          res.status(500).json('unexpected server errror');
        });
    },

    getFriendship: function(req, res) {
       // This endpoint returns the status of an existing friendship request between two users.
      // It always describes from the point of view of the logged in user (userId). 
      // Return options: 
      // * "friends"
      // * "null"
      // * "response needed"  -- logged-in user needs to respond to friend request
      // * "response pending" -- logged-in user is waiting for friend to respond
      // * friendship request ignored -- logged-in user has ignored/declined friendship 

      let userId = parseInt(req.query.userId);
      let friendId = parseInt(req.query.friendId);

      if (userId === friendId || !userId || !friendId) {
        res.status(400).json('bad request');
      }

      db.getFriendship(userId, friendId)
        .then((results) => {

          let friendshipStatus = results;

          if (friendshipStatus === undefined) {
            // This should not occur. Send server error and capture edge cases.
            res.status(500).json('unexpected server errror');
          } else {
            res.status(200).json({'friendship_status': friendshipStatus});
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json('unexpected server errror');
        });   
    },

    getAllFriends: function(req, res) {
      // This endpoint returns the list of friendships for a user.
      // It accepts options 'friends' (default)  or 'requests'
      // Friends returns confirmed bi-drectional friends.
      // Requests returns the un-answered (non-ignored) requests the userId can respond to.

      let userId = parseInt(req.query.userId);
      let type = req.query.type === 'requests' ? 'request' : 'friend';
      if (!userId) {
        res.status(400).json('bad request');
      }

      db.returnFriendships(userId, type)
        .then((results) => {
          res.status(200).json(results);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json('unexpected server errror');
        })
    }
  },

  users: {

    getUsers: function (req, res) {
      db.getAllUsers((err, data) => {
        if (err) {
          console.error(err.message);
          res.status(400).send('Unable to retrieve all Users');
        } else {
          res.status(200).json(data);
        }
      });
    }
  },

  post: {
    createPost: function(req, res) {
      db.createPost(req.params.username, req.body.text, (err, data) => {
        if (err) {
          console.log(err.message);
          res.send(400).send('Unable to create Post');
        } else {
          res.status(200).json(data);
        }
      })
    },

    getAuthor: function(req, res) {
      db.getPostAuthor(req.query.text, (err, data) => {
        if (err) {
          res.status(400).send('Unable to retrieve author of Post');
        } else {
          res.status(200).json(data);
        }
      })
    },

    unlikePost: function (req, res) {

      db.unlikePost(req.params.author, req.query.text, req.query.username, (err, data) => {
        if (err) {
          console.log(err.message);
          res.send(400).send('Unable to unlike post');
        } else {
          res.status(200).json(data);
        }
      })
    },

    likePost: function(req, res) {

      db.likePost(req.params.author, req.body.text, req.body.username, (err, data) => {
        if (err) {
          console.log(err.message);
          res.send(400).send('Unable to like Post');
        } else {
          res.status(200).json(data);
        }
      })
    },

    getNumLikes: function (req, res) {
      db.getLikeAmount(req.query.text, (err, data) => {
        if (err) {
          console.log(err.message);
          res.status(400).send('Unable to retrieve number of likes');
        } else {
          res.status(200).json(data);
        }
      })
    },
  },

  posts: {

    getPosts: function (req, res) {
      db.getAllPosts((err, data) => {
        if (err) {
          console.log(err.message);
          res.send(400).send('Unable to retrieve all Posts');
        } else {
          res.status(200).json(data);
        }
      })
    },
      
    getUserPosts: function(req, res) {
      db.getUserPosts(req.params.certainUser, (error, data) => {
        if (error) {
          console.log(error.message);
          res.status(400).send(`Error retrieving ${req.params.certainUser}'s posts`);
        } else {
          res.status(200).json(data);
        }
      });
    },

    getFriendsPosts: function (req, res) {
      db.findPostsByFriends(req.params.username, (err, data) => {
        if (err) {
          console.log(err.message);
          res.status(400).send(`Unable to retrieve Posts by ${req.params.username}`);
        } else {
          res.status(200).json(data);
        }
      })
    },

    getNonFriendsPosts: function (req, res) {

      db.findPostsByNonFriends(req.params.username, (err, data) => {
        if (err) {
          console.log(err.message);
          res.status(400).send('Unable to retrieve Posts by Non Friends');
        } else {
          res.status(200).json(data);
        }
      })
    }
  }
};


//USERS
route.get('/search/users', api.users.getUsers); //get all users
route.post('/friendship', api.user.addFriendship); // CG: ginger's new friendship endpoint
route.get('/friendship', api.user.getFriendship); // CG: This endpoint returns the status of an existing friendship request between two users.
route.get('/friend_list', api.user.getAllFriends);

//USER
route.post('/friendship', api.user.addFriendship); // CG: ginger's new friendship endpoint
route.get('/friendship', api.user.getFriendship); // CG: This endpoint returns the status of an existing friendship request between two users.
route.get('/friend_list', api.user.getAllFriends);

route.get('/likers', api.user.getLikers); // get all likers of a particular user
route.get('/:username/profilePage', api.user.getProfilePage); // get profilePage info for user
route.get('/:username/friendsList/:otherUsername', api.user.getFriendsList); // get a friends friend list
route.get('/:firstname/:lastname', api.user.getUsername); //gets the username of a user by first name, last name
route.get('/:username/likes', api.user.getLiked); //get liked users of user
route.get('/:username/profile/:user', api.user.getProfile); //get profile of a specific user
route.get('/:username', api.user.getUser); //gets a user


route.post('/:username/addFriend/:friendToAdd', api.user.addFriend); //add friend to user
route.post('/:username/removeFriend/:friendToRemove', api.user.removeFriend); //remove friend from user's friends list
route.post('/:username', api.user.createUser); //creates a new user
route.patch('/:username/updateProfile', api.user.updateProfile); //update current user's profile


//POST
route.get('/likes', api.post.getNumLikes); // get number of likes
route.post('/likes/:author', api.post.likePost); //like a post
route.get('/:username/post/author', api.post.getAuthor); // gets the auther of a post
route.post('/:username/posts', api.post.createPost); // create new post
route.delete('/likes/:author', api.post.unlikePost); //unlike a post

//POSTS
route.get('/:username/posts/friends', api.posts.getFriendsPosts); //get posts of all friends
route.get('/:username/posts/nonFriends', api.posts.getNonFriendsPosts); //get posts of non friends
route.get('/:username/posts', api.posts.getPosts); //get posts for the user
route.get('/:username/posts/:certainUser', api.posts.getUserPosts); // get posts for a specified user


module.exports = route;