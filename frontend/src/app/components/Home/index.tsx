import React, { Component } from 'react';
import * as styles from './style.css';
import { Header, FileDropZone } from '../index';
import { Card, Button, TextArea, Intent, Dialog, Icon, Slider } from '@blueprintjs/core';

export enum CardType {
  MESSAGE,
  FILE
}

interface Props {}

interface State {
  type: CardType;
  isDialogOpen: boolean;
  messageText: string;
  file: File | null;
  sliderValue: number;
}

export class Home extends Component<Props, State> {
  private timer: any = null;

  readonly state: State = {
    type: CardType.MESSAGE,
    isDialogOpen: false,
    messageText: '',
    file: null,
    sliderValue: 0
  };

  private debounce = (cb: () => void) => {
    clearTimeout(this.timer);
    this.timer = setTimeout(cb, 1000);
  };

  private setCardType = (selectedType: CardType) => () => this.setState({ type: selectedType });

  private renderMessageBody = () => (
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
  );

  private toggleDialog = () => this.setState({ isDialogOpen: !this.state.isDialogOpen });

  render = () => {
    const { type, isDialogOpen, file, sliderValue } = this.state;
    console.log(sliderValue);

    return (
      <Card className={styles.card}>
        <Header type={type} onClick={this.setCardType} />

        {type === CardType.MESSAGE ? (
          this.renderMessageBody()
        ) : (
          <FileDropZone file={file} onChange={(file) => this.setState({ file })} />
        )}

        <Button intent={Intent.PRIMARY} className={styles.mainButton} onClick={this.toggleDialog}>
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
          <div className={styles.dialogContainer}>
            <div className={styles.header}>
              <h3 className={styles.title}>Are you human?</h3>
              <Button minimal className={styles.closeButton} onClick={this.toggleDialog}>
                <Icon icon="cross" iconSize={28} />
              </Button>
            </div>
            <span>Slide the square until it's exactly above the frame.</span>

            <div className={styles.sliderBg}>
              <div style={{ left: sliderValue }} className={styles.sliderCube}></div>
            </div>

            <Slider
              min={-8}
              max={400}
              stepSize={1}
              onChange={(v) => this.setState({ sliderValue: v })}
              value={sliderValue}
              labelRenderer={false}
              className={styles.slider}
            />
          </div>
        </Dialog>
      </Card>
    );
  };
}
