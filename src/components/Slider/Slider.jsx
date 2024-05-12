import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import memoize from 'memoize-one';
import styled from 'styled-components';

import styles from './Slider.module.scss';

const StyledHandle = styled.div`
  background-image: url('images/ic_contro_circle.png') !important;

  &:hover {
    background-image: url('images/ic_contro_circle_over.png') !important;
  }
`;

class Slider extends Component {
  static propTypes = {
    className: PropTypes.string,
    handleSize: PropTypes.number,
    value: PropTypes.number,
    onChange: PropTypes.func,
    onChangeEnd: PropTypes.func,
  };

  static defaultProps = {
    className: null,
    handleSize: 15,
    value: 5,
    min: 0,
    max: 10,
    precision: 0,
    onChange: () => {},
    onChangeEnd: () => {},
  };

  state = {
    internalValue: this.props.value,
    isDragging: false,
  };

  wrapperRef = createRef();

  handleContainerRef = createRef();

  getNormalizedValue =
    memoize((value, min = this.props.min, max = this.props.max, precision = this.props.precision) =>
      _.round((_.clamp(value, min, max) - min) / (max - min), precision));

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.value !== this.props.value) {
      this.setState({ internalValue: this.props.value });
    }
  }

  handleMove = (event) => {
    const { isDragging } = this.state;
    if (isDragging && this.wrapperRef.current) {
      const { min, max, precision } = this.props;
      const trackLeft = this.wrapperRef.current.getBoundingClientRect().left;
      const trackWidth = this.wrapperRef.current.getBoundingClientRect().width;
      const portion = (event.clientX - trackLeft) / trackWidth;
      const newValue = _.clamp(_.round(min + ((max - min) * portion), precision), min, max);
      this.setState({ internalValue: newValue }, () => {
        this.props.onChange(newValue);
      });
    }
  };

  handleBegin = () => {
    this.setState({ isDragging: true });
    window.document.addEventListener('mousemove', this.handleMove);
    window.document.addEventListener('mouseup', this.handleEnd);
  };

  handleEnd = () => {
    this.setState({ isDragging: false }, () => {
      this.props.onChangeEnd();
    });
    window.document.removeEventListener('mousemove', this.handleMove);
    window.document.removeEventListener('mouseup', this.handleEnd);
  };

  handleClickWrapper = (event) => {
    const { min, max, precision } = this.props;
    if (this.wrapperRef.current) {
      const trackLeft = this.wrapperRef.current.getBoundingClientRect().left;
      const trackWidth = this.wrapperRef.current.getBoundingClientRect().width;
      const portion = (event.clientX - trackLeft) / trackWidth;
      const newValue = _.clamp(_.round(min + ((max - min) * portion), precision), min, max);
      this.setState({ internalValue: newValue }, () => {
        this.props.onChange(newValue);
      });
    }
  };

  render() {
    const { className, handleSize } = this.props;
    const { internalValue } = this.state;

    return (
      <div
        ref={this.wrapperRef}
        className={classNames(styles.Slider, className)}
        onClick={this.handleClickWrapper}
      >
        <div className={styles.Track} />

        <div
          className={styles.Tracker}
          style={{
            right: `${100 - (this.getNormalizedValue(internalValue) * 100)}%`,
          }}
        />

        <div
          ref={this.handleContainerRef}
          className={styles.HandleContainer}
          style={{
            width: `calc(100% - ${handleSize}px)`,
            left: handleSize / 2,
          }}
        >
          <StyledHandle
            className={styles.Handle}
            style={{
              width: handleSize,
              height: handleSize,
              left: `${this.getNormalizedValue(internalValue) * 100}%`,
            }}
            role="button"
            tabIndex={0}
            onMouseDown={this.handleBegin}
            onMouseUp={this.handleEnd}
          />
        </div>
      </div>
    );
  }
}

export default Slider
