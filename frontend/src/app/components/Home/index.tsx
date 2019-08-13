import React, { Component } from 'react';
import * as styles from './style.css';
import { Card, Navbar, NavbarGroup, Button } from '@blueprintjs/core';

export class Home extends Component {
  render() {
    return (
      <div className={styles.cardContainer}>
        <Card className={styles.card}>
          <Navbar>
            <NavbarGroup>
              <Button large minimal icon="document" text="Message" />
              <Button large minimal icon="box" text="Files" />
            </NavbarGroup>
          </Navbar>
        </Card>
      </div>
    );
  }
}
