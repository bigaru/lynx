import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { Home, CardType } from './components/';

export class App extends Component {
  render = () => (
    <Switch>
      <Route path="/" exact render={(_props) => <Home type={CardType.MESSAGE} />} />
      <Route path="/files" exact render={(_props) => <Home type={CardType.FILE} />} />
    </Switch>
  );
}
