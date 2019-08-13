import React, { Component } from 'react';
import * as styles from './style.css';
import { CardType } from '../index';
import { SwitchButton } from '../index';

interface Props {
  type: CardType;
  onClick: (type: CardType) => () => void;
}

export class Header extends Component<Props> {
  render = () => {
    const { type, onClick } = this.props;

    return (
      <div>
        <span className={styles.heading}>Share</span>
        <div className={styles.switch}>
          <SwitchButton selectedType={type} givenType={CardType.MESSAGE} onClick={onClick}>
            Message
          </SwitchButton>
          <SwitchButton selectedType={type} givenType={CardType.FILE} onClick={onClick}>
            File
          </SwitchButton>
        </div>
        <span className={styles.heading}>privately</span>
      </div>
    );
  };
}
