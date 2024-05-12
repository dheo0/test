import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import classNames from "classnames";
import { iPad, isMobile } from "../../App";
import styles from "./Modal.module.scss";
import styled from "styled-components";

//const ImgWarning = 'images/img_warning.png';
//const ImgCheckConfirmUnChecked = 'images/checkbox_state_off.png';
//const ImgCheckConfirmChecked = 'images/checkbox_state_on.png';
const StyledCloseButton = styled.button`
  background-image: url("images/ic_popup_close.svg");
  position: absolute;
  right: 10px;
  top: 10px;
  width: 24px;
  height: 24px;
  border: 0;
`;
class Modal extends React.PureComponent {
  static propTypes = {
    withBackdrop: PropTypes.bool,
    title: PropTypes.string,
    message: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    _closeHandler: PropTypes.func,
    /* Primary Button */
    isConfirmModal: PropTypes.bool,
    isOrderConfirmModal: PropTypes.bool,
    isPaperFullConfirmModal: PropTypes.bool,
    disabledConfirm: PropTypes.bool,
    onClickConfirm: PropTypes.func,
    onClickConfirmTwo: PropTypes.func,
  };

  static defaultProps = {
    withBackdrop: true,
    title: null,
    message: null,
    _closeHandler: _.noop,
    /* Primary Button */
    isConfirmModal: false,
    isOrderConfirmModal: false,
    isPaperFullConfirmModal: false,
    disabledConfirm: false,
    onClickConfirm: _.noop,
    onClickConfirmTwo: _.noop,
  };

  state = {
    isCheckedConfirm: false,
  };

  handleClickClose = () => {
    const { _closeHandler } = this.props;
    _closeHandler && _closeHandler();
  };

  handleClickConfirm = () => {
    const { _closeHandler, onClickConfirm } = this.props;
    onClickConfirm && onClickConfirm();
    _closeHandler && _closeHandler();
  };

  handleClickConfirmTwo = () => {
    const { _closeHandler, onClickConfirmTwo } = this.props;
    onClickConfirmTwo && onClickConfirmTwo();
    _closeHandler && _closeHandler();
  };

  handleClickConfirmCheck = () => {
    this.setState({ isCheckedConfirm: !this.state.isCheckedConfirm });

    //console.log(this.state.isCheckedConfirm);
  };

  renderBackdrop() {
    const { withBackdrop } = this.props;

    return (
      withBackdrop && (
        <div className={styles.BackDrop} onClick={this.handleClickClose} />
      )
    );
  }

  mobileCancelButton() {
    return (
      this.isMobile() && <StyledCloseButton onClick={this.handleClickClose} />
    );
  }

  isMobile() {
    return isMobile || iPad ? "Mobile" : "Web";
  }

  render() {
    const {
      title,
      message,
      isConfirmModal,
      isOrderConfirmModal,
      isPaperFullConfirmModal,
      disabledConfirm,
    } = this.props;
    const { isCheckedConfirm } = this.state;
    return (
      <>
        {this.renderBackdrop()}

        <div
          className={classNames(`${styles.Modal} ${styles[this.isMobile()]}`)}
        >
          {this.mobileCancelButton()}
          {title && <div className={styles.Title}>{title}</div>}
          {(() => {
            if (_.isString(message)) {
              return (
                <div
                  className={classNames(styles.Message, {
                    [styles.hasTitle]: !_.isEmpty(title),
                  })}
                  dangerouslySetInnerHTML={{
                    __html: message.replace(/\n/g, "<br />"),
                  }}
                />
              );
            }
            if (_.isFunction(message)) {
              const Content = message;
              return <Content />;
            }
            return (
              <div
                className={classNames(styles.Message, {
                  [styles.hasTitle]: !_.isEmpty(title),
                })}
              >
                {message}
              </div>
            );
          })()}

          {/*
          // 2021.03.23 품질저하 안내 팝업 수정으로 인해 checkbox 역할 img hidden
          <div className={styles.ConfirmIcon}>
            {
              (() => {
                if (isOrderConfirmModal) {
                  return (
                    <>
                      <img src={isCheckedConfirm ? ImgCheckConfirmChecked : ImgCheckConfirmUnChecked} onClick={this.handleClickConfirmCheck} />
                    </>
                  )
                }
              })()
            }
          </div> */}

          <div className={styles.Action}>
            {(() => {
              if (isConfirmModal) {
                return (
                  <>
                    {!this.isMobile() ? (
                      <>
                        <button
                          className="dark"
                          disabled={disabledConfirm}
                          onClick={this.handleClickConfirm}
                        >
                          확인
                        </button>
                        <button onClick={this.handleClickClose}>취소</button>
                      </>
                    ) : (
                      <>
                        <button onClick={this.handleClickClose}>취소</button>
                        <button
                          className="dark"
                          disabled={disabledConfirm}
                          onClick={this.handleClickConfirm}
                        >
                          확인
                        </button>
                      </>
                    )}
                  </>
                );
              } else if (isOrderConfirmModal) {
                /*                 return (
                  <>
                    <button className={isCheckedConfirm ? "coral" : ""} disabled={!isCheckedConfirm} onClick={this.handleClickConfirm}>
                      재 확인 없이 주문
                    </button>

                    <button className="orange" onClick={this.handleClickConfirmTwo}>
                      재 확인
                    </button>
                  </>
                ); */
                return (
                  // 2021.03.23 품질저하 안내 팝업 수정
                  <>
                    <button
                      className="orange"
                      disabled={isCheckedConfirm}
                      onClick={this.handleClickConfirm}
                    >
                      주문하기
                    </button>

                    <button onClick={this.handleClickConfirmTwo}>
                      취소하기
                    </button>
                  </>
                );
              } else if (isPaperFullConfirmModal) {
                return (
                  <>
                    <button
                      className="dark"
                      disabled={disabledConfirm}
                      onClick={this.handleClickConfirm}
                    >
                      확인했습니다.
                    </button>

                    <button onClick={this.handleClickClose}>
                      다시보러가기
                    </button>
                  </>
                );
              }
              return (
                <button
                  className="dark"
                  disabled={disabledConfirm}
                  onClick={this.handleClickClose}
                >
                  확인
                </button>
              );
            })()}
          </div>
        </div>
      </>
    );
  }
}

export default Modal;
