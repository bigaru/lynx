import React, { Component } from 'react';
import * as styles from './style.css';
import { Card, Navbar, NavbarGroup, AnchorButton } from '@blueprintjs/core';

export enum CardType {
  MESSAGE,
  FILE
}

export interface Props {
  type: CardType;
}

export class Home extends Component<Props> {
  render = () => {
    const { type } = this.props;
    return (
      <div className={styles.cardContainer}>
        <Card className={styles.card}>
          <Navbar>
            <NavbarGroup>
              <AnchorButton
                large
                minimal
                icon="document"
                text="Message"
                href="/"
                active={type === CardType.MESSAGE}
              />
              <AnchorButton
                large
                minimal
                icon="box"
                text="Files"
                href="/files"
                active={type === CardType.FILE}
              />
            </NavbarGroup>
          </Navbar>
        </Card>
      </div>
    );
  };
}
