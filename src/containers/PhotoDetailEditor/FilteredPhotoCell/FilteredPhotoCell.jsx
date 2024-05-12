import React, { Component } from "react";
import PropTypes from "prop-types";

import { Filter } from "../../../utils/imageFilters";
import Photo from "../../../models/Photo";
import styles from "./FilteredPhotoCell.module.scss";
import { deviceCheck } from "../../../utils/commonUtils";

const THUMBNAIL_SIZE = 62;
const THUMBNAIL_MOBILE_WIDTH = 44;
const THUMBNAIL_MOBILE_HEIGHT = 30;

class FilteredPhotoCell extends Component {
  static propTypes = {
    photo: PropTypes.instanceOf(Photo),
    filter: PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
    }).isRequired,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    photo: new Photo(),
    onClick: () => {},
  };

  state = { dataURL: null };

  componentDidMount() {
    const { photo, filter } = this.props;

    setTimeout(() => {
      Filter(
        { photo, filter, width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE },
        (dataURL) => {
          this.setState({ dataURL });
        }
      );
    }, 0);
  }

  handleClickCanvas = () => {
    const { filter, onClick } = this.props;
    onClick(filter, this.state.dataURL);
  };

  render() {
    const { filter } = this.props;
    const { dataURL } = this.state;

    const style = {
      width: deviceCheck() === "Web" ? THUMBNAIL_SIZE : THUMBNAIL_MOBILE_WIDTH,
      height:
        deviceCheck() === "Web" ? THUMBNAIL_SIZE : THUMBNAIL_MOBILE_HEIGHT,
      backgroundImage: `url('${dataURL}')`,
    };

    return (
      <div className={styles.Wrapper} onClick={this.handleClickCanvas}>
        <div className={styles.FilteredPhotoCell} style={style} />
        <div className={styles.FilterTitle}>{filter.value}</div>
      </div>
    );
  }
}

export default FilteredPhotoCell;
