import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import Hello from './components/Hello';

class Home extends Component {
  render = () => (
    <Switch>
      <Route path="/" component={Hello} />
    </Switch>
  );
}

export default Home;
