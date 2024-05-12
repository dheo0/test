import React, { useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import _ from "lodash";
import { isMobile, iPad } from "../../App";
import styles from "./FileUploadButton.module.scss";

export const AcceptableMIMEs = {
  PNG: "image/x-png",
  JPG: "image/jpeg",
};

const propTypes = {
  className: PropTypes.string,
  multiple: PropTypes.bool,
  accepts: PropTypes.arrayOf(PropTypes.oneOf(_.values(AcceptableMIMEs))),
  onSelectFiles: PropTypes.func,
};

function FileUploadButton({
  className = null,
  multiple = true,
  accepts = [AcceptableMIMEs.PNG, AcceptableMIMEs.JPG],
  children,
  onSelectFiles = _.noop,
}) {
  const acceptStr = useMemo(() => (accepts || []).join(","), [accepts]);

  const handleSelectFiles = useCallback(
    (event) => {
      const files = event.target.files;
      onSelectFiles(files);
      event.target.value = null;
    },
    [onSelectFiles]
  );
  const deviceCheck = () => {
    return isMobile || iPad ? "Mobile" : "web";
  };

  return (
    <label
      className={classNames(
        styles.FileUploadButton,
        className,
        styles[deviceCheck()]
      )}
    >
      {children}
      <input
        id="files"
        type="file"
        accept={acceptStr}
        multiple={multiple ? "multiple" : null}
        onChange={handleSelectFiles}
      />
    </label>
  );
}

FileUploadButton.propTypes = propTypes;

export default FileUploadButton;
