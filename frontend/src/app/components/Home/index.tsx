import React, { Component } from 'react';
import * as styles from './style.css';
import { Header } from '../index';
import { Card, Button, TextArea, Intent, Dialog, Icon } from '@blueprintjs/core';
import ReactDropzone from 'react-dropzone';
import classNames from 'classnames';

export enum CardType {
  MESSAGE,
  FILE
}

export interface Props {}
interface State {
  type: CardType;
  isDialogOpen: boolean;
  messageText: string;
  file: File | null;
}

export class Home extends Component<Props, State> {
  timer: any = null;

  readonly state: State = {
    type: CardType.MESSAGE,
    isDialogOpen: false,
    messageText: '',
    file: null
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

  private formatByteValue = (bytes: number, unitCounter: number): string => {
    if (bytes > 1024) return this.formatByteValue(bytes / 1024, unitCounter + 1);

    const roundedBytes = bytes.toFixed(2);

    switch (unitCounter) {
      case 1:
        return `${roundedBytes} KB`;

      case 2:
        return `${roundedBytes} MB`;

      case 3:
        return `${roundedBytes} GB`;

      case 4:
        return `${roundedBytes} TB`;

      default:
        return `${roundedBytes} B`;
    }
  };

  private renderFileBody = () => {
    const dropContainerHover = (isDragActive: boolean) =>
      isDragActive
        ? classNames(styles.fileContainer, styles.dropContainer, styles.dropContainerActive)
        : classNames(styles.fileContainer, styles.dropContainer);

    const dropTextHover = (isDragActive: boolean) =>
      isDragActive ? classNames(styles.dropText, styles.dropTextActive) : styles.dropText;

    console.log(this.state.file);
    const { file } = this.state;

    return file ? (
      <div className={styles.fileContainer}>
        <Card className={styles.fileCard} elevation={2}>
          <Icon icon="document" iconSize={42} intent={Intent.PRIMARY} />
          <div className={styles.fileName}>
            <strong>{file.name}</strong>
            <span>{file.type}</span>
          </div>

          <strong className={styles.fileSize}>{this.formatByteValue(file.size, 0)}</strong>
          <Button minimal onClick={() => this.setState({ file: null })}>
            <Icon icon="cross" iconSize={32} />
          </Button>
        </Card>
      </div>
    ) : (
      <ReactDropzone onDrop={(f) => this.setState({ file: f[0] })}>
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div {...getRootProps()} className={dropContainerHover(isDragActive)}>
            <input {...getInputProps()} />
            <p className={dropTextHover(isDragActive)}>
              {isDragActive ? 'Drop the file here' : 'Drag & drop a file'}
            </p>
            {isDragActive ? null : <Button>Choose a file</Button>}
          </div>
        )}
      </ReactDropzone>
    );
  };

  render = () => {
    const { type, isDialogOpen } = this.state;

    return (
      <Card className={styles.card}>
        <Header type={type} onClick={this.setCardType} />

        {type === CardType.MESSAGE ? this.renderMessageBody() : this.renderFileBody()}

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
