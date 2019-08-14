import React, { Component } from 'react';
import * as styles from './style.css';
import { Header } from '../index';
import { Card, Button, TextArea, Intent, Dialog } from '@blueprintjs/core';

export enum CardType {
  MESSAGE,
  FILE
}

export interface Props {}
interface State {
  type: CardType;
  isDialogOpen: boolean;
  messageText: string;
}

export class Home extends Component<Props, State> {
  timer: any = null;

  readonly state: State = {
    type: CardType.MESSAGE,
    isDialogOpen: false,
    messageText: ''
  };

  private debounce = (cb: () => void) => {
    clearTimeout(this.timer);
    this.timer = setTimeout(cb, 1000);
  };

  private setCardType = (selectedType: CardType) => () => this.setState({ type: selectedType });

  render = () => {
    const { type, isDialogOpen } = this.state;

    return (
      <Card className={styles.card}>
        <Header type={type} onClick={this.setCardType} />
        {type === CardType.MESSAGE ? (
          <TextArea
            className={styles.textMessage}
            growVertically={true}
            large={true}
            intent={Intent.PRIMARY}
            onChange={(event) => {
              const val = event.target.value;
              this.debounce(() => this.setState({ messageText: val }));
            }}
          />
        ) : null}

        <Button
          intent={Intent.PRIMARY}
          className={styles.mainButton}
          onClick={() => this.setState({ isDialogOpen: true })}
        >
          Send
        </Button>

        <Dialog
          isOpen={isDialogOpen}
          autoFocus
          enforceFocus
          usePortal
          canOutsideClickClose={false}
          canEscapeKeyClose={false}
        >
          Pickachuuu
        </Dialog>
      </Card>
    );
  };
}
