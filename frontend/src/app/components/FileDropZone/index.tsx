import React, { Component } from 'react';
import * as styles from './style.css';
import classNames from 'classnames';
import { Card, Button, Intent, Icon } from '@blueprintjs/core';
import ReactDropzone from 'react-dropzone';

interface Props {
  file: File | null;
  onChange: (file: File | null) => void;
}

export class FileDropZone extends Component<Props> {
  private formatByteValue = (bytes: number, unitCounter: number): string => {
    if (bytes > 1024) return this.formatByteValue(bytes / 1024, unitCounter + 1);

    const roundedBytes = bytes.toFixed(2);

    switch (unitCounter) {
      case 0:
        return `${roundedBytes} B`;

      case 1:
        return `${roundedBytes} KB`;

      case 2:
        return `${roundedBytes} MB`;

      case 3:
        return `${roundedBytes} GB`;

      case 4:
        return `${roundedBytes} TB`;

      default:
        return 'such huge file size not expected';
    }
  };

  private dropContainerHover = (isDragActive: boolean) =>
    isDragActive
      ? classNames(styles.fileContainer, styles.dropContainer, styles.dropContainerActive)
      : classNames(styles.fileContainer, styles.dropContainer);

  private dropTextHover = (isDragActive: boolean) =>
    isDragActive ? classNames(styles.dropText, styles.dropTextActive) : styles.dropText;

  private onDrop = (files: File[]) => this.props.onChange(files[0]);

  private renderFileCard = (file: File, onChange: (file: File | null) => void) => (
    <div className={styles.fileContainer}>
      <Card className={styles.fileCard} elevation={2}>
        <Icon icon="document" iconSize={42} intent={Intent.PRIMARY} />
        <div className={styles.fileName}>
          <strong>{file.name}</strong>
          <span>{file.type}</span>
        </div>

        <strong className={styles.fileSize}>{this.formatByteValue(file.size, 0)}</strong>
        <Button minimal onClick={() => onChange(null)}>
          <Icon icon="cross" iconSize={32} />
        </Button>
      </Card>
    </div>
  );

  private renderDropZone = () => (
    <ReactDropzone onDrop={this.onDrop}>
      {({ getRootProps, getInputProps, isDragActive }) => (
        <div {...getRootProps()} className={this.dropContainerHover(isDragActive)}>
          <input {...getInputProps()} />

          <p className={this.dropTextHover(isDragActive)}>
            {isDragActive ? 'Drop the file here' : 'Drag & drop a file'}
          </p>

          {isDragActive ? null : <Button>Choose a file</Button>}
        </div>
      )}
    </ReactDropzone>
  );

  public render = () => {
    const { file, onChange } = this.props;

    return file ? this.renderFileCard(file, onChange) : this.renderDropZone();
  };
}
