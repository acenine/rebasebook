import _ from 'lodash'
import React from 'react'
import { Search, Grid } from 'semantic-ui-react'
import http from 'axios';

class ChatFriendSearch extends React.Component {
  
  constructor(props) {
    super(props);

    this.handleResultSelect = this.handleResultSelect.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);

    this.state = {
      isLoading: false,
      result: [],
      value: ''
    };
  }

  componentWillMount() {
    this.resetComponent()
  }

  componentDidMount() {
    this.getAllUsers();
  }

  getAllUsers() {
    //var user = this.state.username;
    http.get(`/api/search/users`)
      .then((response) => {
        let searchNames = response.data.map(function (user) {
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
        console.log(error);
      });
  }

  resetComponent() {
    this.setState({ 
      isLoading: false, 
      results: [], 
      value: '' 
    })
  };

  handleResultSelect(e, { result }) {
    this.setState({ 
      value: result.description 
    });

    this.props.onSelect({
      name: result.title,
      username: result.description
    });
  };

  handleSearchChange(e, { value }) {

    this.setState({ 
      isLoading: true, 
      value 
    });

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

    //still waiting for user data from server
    if (!this.state.source) {
      return null;
    }

    const { isLoading, value, results } = this.state

    return (
      <div className='chatFriendSearch'>
        <Search
          loading={isLoading}
          onResultSelect={this.handleResultSelect}
          onSearchChange={this.handleSearchChange}
          results={results}
          value={value}
        />
      </div>
    )
  }
}

export default ChatFriendSearch;