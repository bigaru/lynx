import React, { Component } from 'react';
import * as styles from './style.css';
import { Header } from '../index';
import { Card, Button, TextArea, Intent } from '@blueprintjs/core';

export enum CardType {
  MESSAGE,
  FILE
}

export interface Props {}
interface State {
  type: CardType;
}

export class Home extends Component<Props, State> {
  readonly state: State = { type: CardType.MESSAGE };

  private setCardType = (selectedType: CardType) => () => this.setState({ type: selectedType });

  render = () => {
    const { type } = this.state;
    return (
      <Card className={styles.card}>
        <Header type={type} onClick={this.setCardType} />
        {type === CardType.MESSAGE ? (
          <TextArea
            className={styles.textMessage}
            growVertically={true}
            large={true}
            intent={Intent.PRIMARY}
            onChange={(event) => console.log(event.target.value)}
          />
        ) : null}

        <Button large intent={Intent.PRIMARY}>
          Send
        </Button>
      </Card>
    );
  };
}
