import React, { Component } from 'react';
import * as styles from './style.css';
import { Button, Intent, Dialog, Icon, Slider } from '@blueprintjs/core';

interface Props {
  isDialogOpen: boolean;
  toggleDialog: () => void;
}

interface State {
  sliderValue: number;
}

export class ConfirmDialog extends Component<Props, State> {
  readonly state: State = {
    sliderValue: -58
  };

  render = () => {
    const { isDialogOpen, toggleDialog } = this.props;
    const { sliderValue } = this.state;

    return (
      <Dialog
        isOpen={isDialogOpen}
        autoFocus
        enforceFocus
        usePortal
        canOutsideClickClose={false}
        canEscapeKeyClose={false}
        className={styles.dialogContainer}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>Are you human?</h3>
          <Button minimal className={styles.closeButton} onClick={toggleDialog}>
            <Icon icon="cross" iconSize={28} />
          </Button>
        </div>
        <span>Slide the square until it's exactly above the frame.</span>

        <div className={styles.sliderBg}>
          <div style={{ left: sliderValue }} className={styles.sliderCube}></div>
        </div>

        <Slider
          min={-58}
          max={400}
          stepSize={1}
          onChange={(v) => this.setState({ sliderValue: v })}
          value={sliderValue}
          labelRenderer={false}
          showTrackFill={false}
          className={styles.slider}
        />

        {/* TODO onClick onConfirm(silderValue)() */}
        <Button intent={Intent.PRIMARY} className={styles.confirmButton} onClick={toggleDialog}>
          Confirm
        </Button>
      </Dialog>
    );
  };
}
