import axios from 'axios';
import { Icon } from 'semantic-ui-react';
import _ from 'lodash'
import React, { Component } from 'react'
import { Search, Grid, Header } from 'semantic-ui-react'
import { Redirect } from 'react-router-dom';

class SearchBar extends Component {
  //retrieve data using ajax call
  //parse names into title format

  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
      clickedName: '',
      isLoading: false, 
      results: [], 
      value: '',
    }
  }

  componentWillMount() {
    this.getAllUsers();
  }

  // componentDidMount() {
  //   this.getAllUsers();
  // }

  getAllUsers() {
    var user = this.state.username;
    axios.get(`/api/search/users`)
    .then((response) => {
      let searchNames = response.data.map(function(user){
        return { 
            "title": user.first_name + ' ' + user.last_name,
            "description": user.username
        }
      });
      this.setState({
        source: searchNames
      });
    })
    .catch((error) => {
      console.error(error);
    }); 
  }

  // resetComponent() {
  //   this.setState({ isLoading: false, results: [], value: '' })
  // }

  handleResultSelect(e, { result }) { 
    //go to profile
    // alert(result.description)
    this.setState({
      redirect: true,
      clickedName: result.description
    })
    // this.setState({ value: result.title }) 
  }

  handleSearchChange(e, { value }) {
    this.setState({ isLoading: true, value })
    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent()
      const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
      const isMatch = result => re.test(result.title)
      this.setState({
        isLoading: false,
        results: _.filter(this.state.source, isMatch),
      })
    }, 500)
  }

  render() {
    const { isLoading, value, results, source, clickedName } = this.state
    const profileUrl = '/' + this.state.clickedName + '/profile/' + this.props.loggedInUser;

    return (
      <div>
        <Grid>
          <div className="search-bar">
            <Search
              loading={isLoading}
              onResultSelect={this.handleResultSelect.bind(this)}
              onSearchChange={this.handleSearchChange.bind(this)}
              results={results}
              value={value}
              className="search-input"
            />
          </div>
        </Grid>
        {this.state.redirect && <Redirect to={profileUrl} />}
      </div>
    );
  }
}


export default SearchBar;






































// class Search extends React.Component {
//   constructor(props) {
//     super(props);
//   }

//   handleSearch(event) {
//     event.preventDefault();
//     let user = this.refs.searchUser.value;
//     let userName = 'Shubhra';
//     if (user) {
//       axios.get(`/${userName}/profile/${user}`)
//       .then((res) => {
//         this.props.getUserProfile(res.data[0].username);

//       })
//       .catch((err) => {
//         console.log('err: ', err);
//       })
//     }
//     this.refs.searchUser.value = '';
//   }

  // filter results with each letter entered
  // handleInputText(event) {
  //   event.preventDefault();
  //   let user = this.refs.searchUser.value;
  //   let userName = 'Shubhra';
  //   axios.get(`/${userName}/search/${user}`)
  //   .then((res) => {
  //   })
  //   .catch((err) => {
  //     console.log('err: ', err);
  //   })
  // }

//   render() {
//     return (
//       <form className="search-bar" onSubmit={this.handleSearch.bind(this)}>
//         <input 
//           className="search-input" 
//           type="text" 
//           placeholder="Search" 
//           ref="searchUser" 
//         />
//         <button className="search-btn">Find</button>

//       </form>
//     )
//   }
// }

// export default Search;