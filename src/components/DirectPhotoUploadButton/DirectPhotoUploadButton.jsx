import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import UUID from "uuid";
import _ from "lodash";

import AppInfoSelector from "../../selectors/AppInfoSelector";
import PhotoDirectUploadActions from "../../actions/PhotoDirectUploadActions";
import FileUploadButton, { AcceptableMIMEs } from "../FileUploadButton";

function DirectPhotoUploadButton({
  className,
  children,
  onSelectFiles = _.noop,
}) {
  const dispatch = useDispatch();
  const uploadingServerUrl = useSelector(AppInfoSelector.getUploadingServerUrl);

  const handleSelectFiles = useCallback(
    (files) => {
      onSelectFiles(files);
      const uuid = UUID.v4();
      dispatch(
        PhotoDirectUploadActions.requestBulkUploadImageFiles(
          { uploadingServerUrl, files },
          { uuid }
        )
      );
    },
    [dispatch, onSelectFiles]
  );

  return (
    <FileUploadButton
      className={className}
      accepts={[AcceptableMIMEs.JPG, AcceptableMIMEs.PNG]}
      onSelectFiles={handleSelectFiles}
    >
      {children}
    </FileUploadButton>
  );
}

export default DirectPhotoUploadButton;
