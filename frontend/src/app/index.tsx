import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { Home } from './components/';

export class App extends Component {
  render = () => (
    <Switch>
      <Route path="/" component={Home} />
    </Switch>
  );
}
