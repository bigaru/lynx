import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { Home } from './components/';
import * as styles from './style.css';

export class App extends Component {
  render = () => (
    <div className={styles.appContainer}>
      <div className={styles.cardContainer}>
        <Switch>
          <Route path="/" exact render={(_props) => <Home />} />
        </Switch>
      </div>
    </div>
  );
}
