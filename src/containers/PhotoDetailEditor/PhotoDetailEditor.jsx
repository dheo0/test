import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";

import PhotoEditorActions from "../../actions/PhotoEditorActions";
import AppInfoSelector from "../../selectors/AppInfoSelector";
import { TrimmingTypes } from "../../constants/printTypes";
import { Filter, Filters } from "../../utils/imageFilters";
import Photo from "../../models/Photo";
import Slider from "../../components/Slider";
import PhotoCropper from "../../components/Cropper";
import FilteredPhotoCell from "./FilteredPhotoCell";
import styles from "./PhotoDetailEditor.module.scss";
import { deviceCheck } from "../../utils/commonUtils";

const ZoomInIcon = "images/ic_pic_zoomin.png";
const ZoomOutIcon = "images/ic_pic_zoomout.png";

class PhotoDetailEditor extends PureComponent {
  static propTypes = {
    photo: PropTypes.instanceOf(Photo),
    adjustDetailEdits: PropTypes.func,
  };

  static defaultProps = {
    photo: new Photo(),
  };

  constructor(props) {
    super(props);
    this.state = {
      filterAdjusted: null,
      filterAdjustedSrc: null,
      rotate: 0,
      scale: 1,
    };
    this.cropperRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Hidden
    if (prevProps.photo && !this.props.photo) {
      this.setState({
        filterAdjusted: null,
        filterAdjustedSrc: null,
      });
    }

    // Shown
    if (!prevProps.photo && this.props.photo) {
      const { filterAdjusted, filterAdjustedSrc, rotate, scale } =
        this.props.photo.getPrintOption();
      this.setState({ filterAdjusted, filterAdjustedSrc, rotate, scale });
    }
  }

  handleChangeSlider = (value) => {
    this.cropperRef.current.scale(value);
  };

  handleChangeSliderEnd = () => {
    this.cropperRef.current.confirmChanges();
  };

  handleClickFilter = (filter) => {
    const { photo } = this.props;

    Filter({ photo, filter, width: 600, height: 600 }, (dataURL) => {
      this.setState({ filterAdjusted: filter.key, filterAdjustedSrc: dataURL });
    });
  };

  handleClickAdjust = () => {
    const { photo } = this.props;
    const { filterAdjusted, filterAdjustedSrc } = this.state;

    const data = this.cropperRef.current.getData();

    this.props.adjustDetailEdits({
      photos: [photo],
      options: {
        ...data,
        filterAdjusted,
        filterAdjustedSrc,
      },
    });
  };

  handleClickRotateButton() {
    const { photo, adjustDetailEdits } = this.props;
    const printOption = photo.getPrintOption().doRotate();
    adjustDetailEdits({
      photos: [photo],
      options: {
        ...printOption.toJS(),
      },
    });
  }

  renderControls() {
    const { photo } = this.props;
    const printOption = photo.getPrintOption();

    return (
      <div className={`${styles.Controls} ${styles[deviceCheck()]}`}>
        <div className={styles.Gap} />
        <div
          className={classNames(styles.ZoomSliderWrapper, {
            hidden: printOption.trimming === TrimmingTypes.IMAGE_FULL,
          })}
        >
          <button type="button" onClick={() => this.handleClickRotateButton()}>
            rotate
          </button>
          <img alt="icon" className={styles.Icon} src={ZoomOutIcon} />

          <Slider
            className={styles.Slider}
            value={printOption.scale}
            min={1.0}
            max={2.0}
            precision={1}
            onChange={this.handleChangeSlider}
            onChangeEnd={this.handleChangeSliderEnd}
          />

          <img alt="icon" className={styles.Icon} src={ZoomInIcon} />
        </div>
      </div>
    );
  }

  renderFilters() {
    const { photo } = this.props;

    return (
      <div className={styles.Filters}>
        {Filters.map((filter) => (
          <FilteredPhotoCell
            key={`${photo.uuid}-${filter.key}`}
            photo={photo}
            filter={filter}
            onClick={this.handleClickFilter}
          />
        ))}
      </div>
    );
  }

  render() {
    const { photo, printSizes } = this.props;
    const { filterAdjustedSrc } = this.state;

    if (photo) {
      const printOption = photo.getPrintOption();
      const printSize = printSizes.find((s) => s.size === printOption.size);

      const imageSrc = (() => {
        if (filterAdjustedSrc) {
          return filterAdjustedSrc;
        }
        if (printOption.filterAdjusted) {
          return printOption.filterAdjustedSrc;
        }
        return photo.src;
      })();

      return (
        <div className={styles.PhotoDetailEditor}>
          <div className={styles.Overlay} onClick={this.handleClickAdjust} />

          <div className={`${styles.CropperWrapper} ${styles[deviceCheck()]}`}>
            {this.renderControls()}

            <PhotoCropper
              ref={this.cropperRef}
              className={styles.CropperPadding}
              photo={photo}
              printSize={printSize}
              imageSrc={imageSrc}
            />

            {this.renderFilters()}

            <div className={styles.Actions}>
              <button className={"orange"} onClick={this.handleClickAdjust}>
                적용하기
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }
}

PhotoDetailEditor = connect(
  (state) => ({
    photo: state.PhotoEditorReducer.detailEditingPhoto,
    printSizes: AppInfoSelector.getPrintSizes(state),
  }),
  {
    adjustDetailEdits: PhotoEditorActions.adjustDetailEdits,
    closeDetailEditor: PhotoEditorActions.closeDetailEditor,
  }
)(PhotoDetailEditor);

export default PhotoDetailEditor;
