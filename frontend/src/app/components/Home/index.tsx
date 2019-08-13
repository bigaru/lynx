import React, { Component } from 'react';
import * as styles from './style.css';
import { Card, Navbar, NavbarGroup, Button, TextArea, Intent } from '@blueprintjs/core';

enum CardType {
  MESSAGE,
  FILE
}

export interface Props {}
interface State {
  type: CardType;
}

export class Home extends Component<Props, State> {
  readonly state: State = { type: CardType.MESSAGE };

  render = () => {
    const { type } = this.state;
    return (
      <div className={styles.appContainer}>
        <div className={styles.cardContainer}>
          <Card className={styles.card}>
            <Navbar>
              <NavbarGroup>
                <Button
                  large
                  minimal
                  icon="document"
                  text="Message"
                  onClick={() => this.setState({ type: CardType.MESSAGE })}
                  active={type === CardType.MESSAGE}
                />
                <Button
                  large
                  minimal
                  icon="box"
                  text="Files"
                  onClick={() => this.setState({ type: CardType.FILE })}
                  active={type === CardType.FILE}
                />
              </NavbarGroup>
            </Navbar>

            {type === CardType.MESSAGE ? (
              <TextArea
                className={styles.textMessage}
                growVertically={true}
                large={true}
                intent={Intent.PRIMARY}
                onChange={(event) => console.log(event.target.value)}
              />
            ) : null}
          </Card>
        </div>
      </div>
    );
  };
}
