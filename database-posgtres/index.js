const { Client } = require('pg');
require('dotenv').config();

console.log('Initializing client');
let databaseUrl =  process.env.DATABASE_URL;
const client = new Client({
  connectionString: databaseUrl
});
console.log('Database URL at: ', databaseUrl);

// For pure SQL, refer to database as 'client'

client.connect();

// To use KNEX, refer to database as 'db'
const pg = require('knex') ({
  client: 'pg',
  connection: databaseUrl,
  pool: { min: 0, max: 7 }
});

// KNEX HELPER FUNCTIONS FOR BUILDING MODULAR 

let includesUserInFriendship = function(queryBuilder, userId) {
  queryBuilder.where(function() {
    this.where('users_friendships.user_id_from', userId).orWhere('users_friendships.user_id_to', userId)
  });
};

let includesUserInChat = function(queryBuilder, userId) {
  queryBuilder.where(function() {
    this.where('chats.user_1', userId).orWhere('chats.user_2', userId)
  });
}

module.exports = {
  getAllUsers: (callback) => {
    client.query('SELECT * FROM users;', (err, res) => {
      if (err) callback(err, null);
      callback(null, res.rows);
    });
  },
  updateProfilePageInfo: (username, change, callback) => {
    var edit = {};
    edit[change[0]] = change[1];
    edit = JSON.stringify(edit);
    var query = `UPDATE user_profiles set user_data = user_data::jsonb || '${edit}' where user_id = (SELECT id FROM users WHERE username = '${username}')`;
    client.query(query, (err, res) => {
      if (err) {
        callback(err, null);
      } else {  
        if (change[0] === 'profile_picture') {
          client.query(`UPDATE users set picture_url = '${change[1]}' WHERE username = '${username}'`, (err, res) => {
            if (err) {
              console.log('error updating profile pic in users table', err);
              callback(err, null);
            } else {  
            }
          })
        }
        callback(null, res.rows);
      }  
    });
  },
  createPost: (username, text, callback) => {
    let queryStr =
      `INSERT INTO posts (post_text, user_id)
      VALUES ('${text}', (SELECT id FROM users WHERE username = '${username}'))`;
    client.query(queryStr, (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res.rows);
      }
    });
  },
  likePost: (author, text, username, callback) => {
    let queryStr = 
    `INSERT INTO user_posts_liked (user_id, post_id) 
    VALUES ((SELECT id FROM users WHERE username = '${username}'),
    (SELECT posts.id FROM posts INNER JOIN users ON users.id = 
      posts.user_id AND posts.post_text = 
      '${text}' AND posts.user_id = 
      (SELECT id FROM users WHERE username = '${author}')))`;

    client.query(queryStr, (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res.rows);
      }
    })
  },
  unlikePost: (author, text, username, callback) => {
    let queryStr = 
    `DELETE FROM user_posts_liked WHERE user_id = 
    (SELECT id FROM users WHERE username = '${username}')
    AND post_id = (SELECT posts.id FROM posts INNER JOIN users ON users.id = 
      posts.user_id AND posts.post_text = 
      '${text}' AND posts.user_id = 
      (SELECT id FROM users WHERE username = '${author}'))`;

    client.query(queryStr, (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res.rows);
      }
    })
  },
  getLikeAmount: (text, callback) => {

    let queryStr =
    `SELECT user_id FROM user_posts_liked WHERE post_id = 
    (SELECT id FROM posts WHERE post_text = '${text}')`;
    client.query(queryStr, (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res.rows);
      }
    });
  },
  getPersonalLikeAmount: (username, text, callback) => {

    let queryStr =
    `SELECT count(user_id) FROM user_posts_liked INNER JOIN 
    users ON users.id = user_posts_liked.user_id AND 
    user_posts_liked.user_id = (SELECT id FROM users WHERE username = '${username}') 
    WHERE post_id = (SELECT id FROM posts WHERE posts.post_text = '${text}');
    `
    client.query(queryStr, (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res.rows);
      }
    });
  },
  getLikers: (text, callback) => {
    let queryStr =
    `SELECT users.first_name, users.last_name FROM users INNER JOIN 
    user_posts_liked ON users.id = user_posts_liked.user_id INNER JOIN 
    posts ON posts.id = user_posts_liked.post_id AND posts.post_text = '${text}'`;
    client.query(queryStr, (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res.rows);
      }
    })
  },
  searchSomeone: (name, callback) => {
    const queryStr = `SELECT * FROM users WHERE username LIKE '%${name}%';`; // selects all names that begin with searched query
    client.query(queryStr, (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res.rows);
      }
    });
  },
  getAllPosts: (callback) => {
    let queryStr = 'SELECT posts.*, users.id, users.first_name, users.last_name, users.username FROM posts INNER JOIN users ON users.id = posts.user_id ORDER BY id DESC';
    client.query(queryStr, (err, res) => {
      if (err) {
        console.log(err.message);
        callback(err, null);
      } else {
        callback(null, res.rows);
      }
    });
  },
  //find select username
  getUser: (username, callback) => {
    client.query(`SELECT * FROM users WHERE username='${username}';`, (err, res) => {
      if (err) {
        console.log('Error in getUser', err)
        callback(err, null);
      } else {  
        callback(null, res.rows);
      }  
    });
  },
  //retrieves all users
  getAllUsers: (callback) => {
    client.query(`SELECT * FROM users;`, (err, res) => {
      if (err) {
        console.log(err.message)
        callback(err, null);
      } else {  
        callback(null, res.rows);
      }  
    });
  },

  getUsername: (firstname, lastname, callback) => {
    client.query(`SELECT username FROM users WHERE first_name='${firstname}' AND last_name='${lastname}'`, (err, res) => {
      if (err) {
        console.log(err.message)
        callback(err, null);
      } else {  
        callback(null, res.rows);
      } 
    })
  },
  getPostAuthor: (text, callback) => {
    let queryStr = 
    `SELECT username FROM users INNER JOIN posts ON users.id = posts.user_id
    AND posts.post_text = '${text}'`;
    client.query(queryStr, (err, res) => {
      if (err) {
        console.log(err.message);
        callback(err, null);
      } else {
        callback(null, res.rows);
      }
    })
  },
  //add user to db
  addUser: (userData, callback) => {
    client.query(`INSERT INTO users (username, first_name, last_name, picture_url) VALUES ('${userData.username}', '${userData.firstName}', '${userData.lastName}', '${userData.pictureUrl}');`, (err, res) => {
      if (err) {
        callback(err.detail, null);
      } else {  
        callback(null, res.rows);
      }
    });
  },   
  addNewUserProfileInfo: (username, callback) => {
    var defaultProfile = {};
    defaultProfile.profile_picture = '/images/profile_default.jpg'
    defaultProfile = JSON.stringify(defaultProfile);
    client.query(`INSERT INTO user_profiles (user_id, user_data) VALUES ((SELECT id FROM users WHERE username='${username}'), '${defaultProfile}')`, (err, res) => {
      if (err) {
        console.log(err.message);
        callback(err, null);
      } else {  
        callback(null, res.rows);
      }
    });
  },     
  getUserPosts: (username, callback) => {
    // var queryStr = `SELECT posts.*, users.* FROM posts INNER JOIN users ON posts.user_id = users.id WHERE users.id = (SELECT users.id FROM users WHERE users.username = ${username})`;
    // var queryStr = `SELECT posts.*, users.first_name, users.last_name FROM posts INNER JOIN users ON users.id = posts.user_id ORDER BY id DESC`;
    var query = {
      text: 'SELECT posts.*, users.* FROM posts INNER JOIN users ON posts.user_id = users.id WHERE users.id = (SELECT users.id FROM users WHERE users.username = $1) ORDER BY posts.id DESC',
      values: [username]
    };
    client.query(query, (err, res) => {
      if (err) {
        console.log(err.message);
        callback(err, null);
      } else {
        callback(null, res.rows);
      }
    });
  },
  //add 2 rows to user_friends table
  addFriend: (username1, username2, callback) => {
    let queryStr = `INSERT INTO user_friends (username, friend_id)
      VALUES ('${username1}', (SELECT id FROM users WHERE username='${username2}')),
      ('${username2}', (SELECT id FROM users WHERE username='${username1}'));`
    client.query(queryStr, (err, res) => {
      if (err) {
        console.log(err.message)
        callback(err, null);
      } else {  
        callback(null, res.rows);
      }  
    });
  },
  getFriendsList: (username, callback) => {
    let queryStr = `SELECT users.* FROM users INNER JOIN user_friends ON (user_friends.friend_id = users.id) WHERE user_friends.username = '${username}';`
    client.query(queryStr, (err, res) => {
      if (err) {
        console.log(err.message)
        callback(err, null);
      } else {  
        callback(null, res.rows);
      }  
    });
  },
  findPostsByFriends: (username, callback) => {
    let queryStr =
    `SELECT posts.*, users.username, users.id, users.first_name, users.last_name FROM posts INNER JOIN 
    users ON users.id = posts.user_id INNER JOIN user_friends ON 
    (user_friends.friend_id = posts.user_id) AND user_friends.username = 
    '${username}' ORDER BY posts.id DESC`;
    client.query(queryStr, (err, res) => {
      if (err) {
        console.log(err.message)
        callback(err, null);
      } else {  
        callback(null, res.rows);
      }  
    });
  },
  findPostsByNonFriends: (username, callback) => {
    let queryStr = 
    `SELECT posts.*, users.username, users.id, users.first_name, users.last_name FROM posts 
    INNER JOIN users ON posts.user_id = users.id AND users.id IN (SELECT users.id FROM users WHERE users.id NOT IN (SELECT user_friends.friend_id 
      FROM user_friends WHERE user_friends.username = 
      '${username}')) ORDER BY posts.id DESC`;
    client.query(queryStr, (err, res) => {
      if (err) {
        console.log('Error', err)
        callback(err, null);
      } else {
        callback(null, res.rows);
      }  
    });
  },
  removeFriend: (username, friendToRemove, callback) => {
    var queryOne = `DELETE FROM user_friends where username = '${username}' AND friend_id = (SELECT id FROM users WHERE username = '${friendToRemove}')`;
    var queryTwo = `DELETE FROM user_friends where username = '${friendToRemove}' AND friend_id = (SELECT id FROM users WHERE username = '${username}')`;
    client.query(queryOne, (err, res) => {
      if (err) {
        console.log('Error', err)
        callback(err, null);
      } else {
        client.query(queryTwo, (err, res) => {
          if (err) {
            console.log('Error', err)
            callback(err, null);
          } else {
            callback(null, res.rows);
          }  
        });
      }  
    });
  },
  getProfilePageInfo: (username, callback) => {
    var query = `SELECT * from user_profiles WHERE user_id = (SELECT id FROM users WHERE username = '${username}')`;
    client.query(query, (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res.rows);
      }  
    });
  },

  getFriendship: (userId, friendId) => {
    return pg('users_friendships')
      .modify(includesUserInFriendship, userId)
      .modify(includesUserInFriendship, friendId)
      .then((results) => {
        let friendshipStatus;
        if (!results || results.length === 0) {
          // No relationship initiated
          friendshipStatus = null;
        } else if (results[0].state === 'friend') {
          friendshipStatus = 'friends';
        } else if (results.length === 1 && results[0].state === 'request') {
          // If only one friendship entry, friendship is pending
          if (results[0].user_id_from === userId ) {
            // The logged in user created the pending request
            friendshipStatus = 'response pending';
          } else if (results[0].user_id_to === userId) {
            // The logged in user needs to accept or decline the request
            friendshipStatus = 'response needed';
          }
        } else if (results.length === 2) {
          // If there are two entries and no friendship, friendship
          // should be in a declined state
          if (results[0].user_id_from === userId && results[0].state === 'request') {
            // If the logged in user was the requester, always show them pending 
            friendshipStatus = `response pending`;
          } else if (results[0].user_id_from === userId && results[0].state === 'ignored')
            // If the logged in user was the decliner, show them the decline
            friendshipStatus = `friendship request ignored`;
        }
        return friendshipStatus;
      })
  },

  addFriendship: (userId, friendId) => {
    let newConnection = {
      user_id_from: userId,
      user_id_to: friendId,
    };

    return module.exports.getFriendship(userId, friendId)
      .then((results) => {
        if (results === 'friends' || results === 'response pending') {
          // If userId has already friended friendId, make no database changes
          return;
        } else if (results === 'response needed' || results === 'friendship request ignored') {
          // If userId is responding to a pending request, or changing a previous decline,
          // change the existing query to 'friend' and add new entry 
          newConnection.state = 'friend';
          let insertQueryInfo = {
            usersFriendshipsId: undefined
          };
          
          // change existing to friended and add new entry
          return pg.transaction((trx) => {
            pg.insert(newConnection)
              .into('users_friendships')
              .transacting(trx)
              .then((results) => {
                return pg.where('user_id_to', userId)
                  .where('user_id_from', friendId)
                  .limit(1)
                  .update({'state': 'friend'})
                  .into('users_friendships')
              })
              .then(trx.commit)
              // add notification to requestor
              .then(() => {
                return pg.select('id')
                .from('users_friendships')
                .where('user_id_to', userId)
                .andWhere('user_id_from', friendId)
              })
              .then((rows) => {
                insertQueryInfo.usersFriendshipsId = rows[0].id;
                return pg.insert({'user_id': friendId})
                .into('notifications')
                .returning('id')
              })
              .then(notificationsId => {
                return pg.insert({
                  'notifications_id': notificationsId[0],
                  'friendships_id': insertQueryInfo.usersFriendshipsId
                })
                .into('notifications_friendships')
              })
              // mark notification to the requestee as 'seen'
              .then(() => {
                return pg.column(
                  {notificationsId: 'notifications.id'}
                )
                .select()
                .from('users_friendships')
                .innerJoin('notifications_friendships', 'users_friendships.id', 'notifications_friendships.friendships_id')
                .innerJoin('notifications', 'notifications.id', 'notifications_friendships.notifications_id')
                // these must be reversed because this is a friendship request in the reverse direction
                .where('users_friendships.user_id_from', friendId)
                .andWhere('users_friendships.user_id_to', userId)
              })
              .then(rows => {
                return pg('notifications')
                .update('seen', 'true')
                .where('id', rows[0].notificationsId)
              })

              // TODO: Implement socket.io sending to requestor (userId) updating notificaitons
              // TODO: Implement socket.io sending to requestee (friendId) decrementing badge counter
              .catch(trx.rollback);
          })
        } else if (results === null) {
          // If no existing relationship, just add a new entry from user to friend

          newConnection.state = 'request';
          let notificationsId = undefined;
          let userFriendshipsId = undefined;
          return pg.insert(newConnection)
            .into('users_friendships')
            .returning('id')
            // add notification to recipient
            .then((ufId) => {
              userFriendshipsId = ufId[0];
              return pg.table('notifications')
              .returning('id')
              .insert({'user_id': friendId})
            })
            .then(notificationsId => {
              return pg.insert({
                'notifications_id': notificationsId[0],
                'friendships_id': userFriendshipsId
              })
              .into('notifications_friendships');
            })
          

            // TODO: Implement socket.io sending to friend requested (friendId) updating notificaitons

        }
      });
  },

  removeFriendship: (userId, friendId) => {
    return module.exports.getFriendship(userId, friendId)
      .then((results) => {
        if (results === null || results === 'response needed' || results === 'friendship request ignored') {
          // If there is no relationship, or the user has not added the friend,
          // do nothing.
          return;
        } else if (results === 'response pending') {
          let deleteInfo = {};
          // delete friend request from notifications_friendships
          return pg.select('id')
            .from('users_friendships')
            .where('user_id_from', userId)
            .andWhere('user_id_to', friendId)
          .then(friendshipsId => {
            deleteInfo.friendshipsId = friendshipsId[0].id;
            return pg.select('notifications_id', 'seen')
              .from('notifications_friendships')
              .innerJoin('notifications', 'notifications.id', 'notifications_friendships.notifications_id')
              .where('friendships_id', deleteInfo.friendshipsId)
          })
          .then(notifications => {
            deleteInfo.notificationsId = notifications[0].notifications_id;
            deleteInfo.seen = notifications[0].seen;
            // only delete if not seen
            if(!deleteInfo.seen) {
              return pg('notifications_friendships')
                .where('friendships_id', deleteInfo.friendshipsId)
                .limit(1)
                .del();
            }
          })
          // delete friend request from notifications
          .then(() => {
            // only delete if not seen
            if(!deleteInfo.seen) {
              return pg('notifications')
                .where('id', deleteInfo.notificationsId)
                .limit(1)
                .del()
            }
          })
          // TODO: Implement socket.io updating requestee's notifications so that their counter will drop.
          .then(() => {
          // If userId is undoing their friend request
          // delete that friend request
            return pg('users_friendships')
              .where('user_id_from', userId)
              .where('user_id_to', friendId)
              .where('state', 'request')
              .limit(1)
              .del();
          })

        } else if (results === 'friends') {

          // For existing friendships, delete the users friendship
          // And change the friend's friend entry to a request
          return pg.transaction((trx) => {
            pg('users_friendships')
              .where('user_id_from', friendId)
              .where('user_id_to', userId)
              .where('state', 'friend')
              .limit(1)
              .update({'state': 'request'})
              .transacting(trx)
              .then((results) => {
                return pg.where('user_id_to', friendId)
                  .where('user_id_from', userId)
                  .limit(1)
                  .into('users_friendships')
                  .del();
              })
              .then(trx.commit)
              .catch(trx.rollback);
          })
        }
      });
  },

  returnFriendships: (userId, state) => {
    if (state === 'request') {
      return pg('users_friendships')
        .select('users_friendships.state', 'users.id', 'users.username', 'users.first_name', 'users.last_name', 'users.picture_url')
        .innerJoin('users', 'users.id', 'users_friendships.user_id_from')
        .where({'user_id_to': userId})
        .where({'state': 'request'})
    } else {
      return pg('users_friendships')
        .select('users_friendships.state', 'users.id', 'users.username', 'users.first_name', 'users.last_name', 'users.picture_url')
        .innerJoin('users', 'users.id', 'users_friendships.user_id_to')
        .where({'user_id_from': userId})
        .where({'state': 'friend'});
    }
  }, 

  addUserChatSession: (user1, user2) => {
    var newChat = {
      user_1: user1,
      user_2: user2
    };

    return pg('chats')
      .modify(includesUserInChat, user1)
      .modify(includesUserInChat, user2)
      .then((results) => {
        
        //check for existing user chat session
        if (results.length) {
          return results[0].id
        }

        return pg('chats')
          .insert(newChat)
          .returning('id')   
      });
  },

  
  addChatMessage: (chatId, message) => {
    let newMessage = {
      chat_id: chatId,
      text: message.text,
      authord_id: message.from
    }

    return pg('messages')
      .insert(message)
      .returning('id')
      .catch(err => console.log(err.message));
  },

  getUserChatSessions: (userId) => {
    return pg('chats')
      .select('*')  
      .where({'user_1': userId})
      .orWhere({'user_2': userId})
  },

  getChatMessages: (chatId) => {
    return pg('messages')
      .where({'chatId': chatId})
      .limit(50);
  }
}
