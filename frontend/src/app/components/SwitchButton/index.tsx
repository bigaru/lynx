import React, { Component } from 'react';
import * as styles from './style.css';
import classNames from 'classnames';
import { CardType } from '../index';

interface Props {
  selectedType: CardType;
  givenType: CardType;
  onClick: (givenType: CardType) => () => void;
  children: string;
}

export class SwitchButton extends Component<Props> {
  render = () => {
    const { selectedType, givenType, onClick, children } = this.props;

    return (
      <button
        className={
          selectedType === givenType ? classNames(styles.button, styles.active) : styles.button
        }
        onClick={onClick(givenType)}
        type="button"
      >
        {children}
      </button>
    );
  };
}
