import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';

import { OrderOptions, GroupOptions } from '../../constants/photoGridOptions';
import RadioButton from '../RadioButton';
import styles from './GroupedPhotoGridOrderSelect.module.scss';

const StyledControlArrow = styled.div`
  background-image: url('images/ic_b_pulldown.png') !important;

  &:hover {
    background-image: url('images/ic_b_pulldown_over.png') !important;
  }
`;

class GroupedPhotoGridOrderSelect extends Component{
  static propTypes = {
    wrapperClassName: PropTypes.string,
    controlClassName: PropTypes.string,
    selectClassName: PropTypes.string,
    selectedOrder: PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
    }),
    selectedGroup: PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
    }),
    onChangeOption: PropTypes.func,
    onClickAdjust: PropTypes.func,
  };

  static defaultProps = {
    wrapperClassName: null,
    controlClassName: null,
    selectClassName: null,
    selectedOrder: null,
    selectedGroup: null,
    onChangeOption: () => {},
    onClickAdjust: () => {},
  };

  state = {
    showSelect: false,
    selectedOrder: this.props.selectedOrder || OrderOptions.BY_RECENT_UPLOAD,
    selectedGroup: this.props.selectedGroup || GroupOptions.BY_DATE,
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.selectedOrder !== this.props.selectedOrder) {
      this.setState({ selectedOrder: this.props.selectedOrder });
    }
    if (prevProps.selectedGroup !== this.props.selectedGroup) {
      this.setState({ selectedGroup: this.props.selectedGroup });
    }
  }

  handleClickOverlay = () => {
    this.setState({ showSelect: false });
  };

  handleClickControl = () => {
    this.setState(state => ({ showSelect: !state.showSelect }));
  };

  handleClickOptionRadio = (optionType) => (option) => () => {
    const { onChangeOption } = this.props;

    this.setState({
      [optionType]: option,
    }, () => {
      onChangeOption(this.state.selectedOrder, this.state.selectedGroup);
    });
  };

  handleClickAdjustButton = () => {
    const { onClickAdjust } = this.props;

    this.setState({ showSelect: false });
    onClickAdjust(this.state.selectedOrder, this.state.selectedGroup);
  };

  renderOverlay() {
    const { showSelect } = this.state;
    return (
      <div
        className={classNames(styles.Overlay, {
          hidden: !showSelect,
        })}
        onClick={this.handleClickOverlay}
      />
    );
  }

  renderControl() {
    const { controlClassName } = this.props;
    const { showSelect, selectedOrder } = this.state;
    return (
      <div
        className={classNames(styles.Control, controlClassName)}
        data-showing={showSelect}
        onClick={this.handleClickControl}
      >
        <div className={styles.ControlText}>
          { selectedOrder.value }
        </div>

        <StyledControlArrow className={styles.ControlArrow} />
      </div>
    );
  }

  renderOptionItem = (optionType) => (option) => (
    <div
      key={option.key}
      className={styles.Row}
    >
      <RadioButton
        buttonClassName={styles.RadioButton}
        checked={this.state[optionType] === option}
        onClick={this.handleClickOptionRadio(optionType)(option)}
      >
        <span>{ option.value }</span>
      </RadioButton>
    </div>
  );

  renderSelect() {
    const { selectClassName } = this.props;
    const { showSelect } = this.state;

    return (
      <div
        className={classNames(styles.Select, selectClassName, {
          hidden: !showSelect,
        })}
      >
        <div
          className={classNames(styles.OptionsTable)}
        >
          <div className={styles.GroupTitle}>사진 정렬 순서</div>
          <div className={styles.Group}>
            { _.values(OrderOptions).map(this.renderOptionItem('selectedOrder')) }
          </div>
          <div className={styles.GroupTitle}>촬영일 그룹</div>
          <div className={styles.Group}>
            { _.values(GroupOptions).map(this.renderOptionItem('selectedGroup')) }
          </div>
        </div>

        <div className={styles.adjustWrapper}>
          <button onClick={this.handleClickAdjustButton}>
            적용하기
          </button>
        </div>
      </div>
    );
  }

  render() {
    const { wrapperClassName } = this.props;
    return (
      <>
        { this.renderOverlay() }

        <div className={classNames(wrapperClassName)}>
          { this.renderControl() }
          { this.renderSelect() }
        </div>
      </>
    );
  }
}

export default GroupedPhotoGridOrderSelect
