import Immutable from "immutable";
import _ from "lodash";

import ActionTypes from "../constants/actionTypes";
import {
  GridSize,
  GroupOptions,
  OrderOptions,
} from "../constants/photoGridOptions";
import Photo from "../models/Photo";
import PrintOption from "../models/PrintOption";
import ImageUpload from "../models/ImageUpload";
import SmartboxPhoto from "../models/SmartboxPhoto";

function isImageContainer(x) {
  return (
    SmartboxPhoto.isSmartboxInstance(x) || ImageUpload.isDirectUploadInstance(x)
  );
}

const initialState = {
  gridSize: GridSize.NORMAL,
  gridOrder: OrderOptions.BY_RECENT_UPLOAD,
  gridGroup: GroupOptions.BY_DATE,
  photos: Immutable.Set(),
  printOptions: Immutable.Map(),
  printOptionsBuffer: Immutable.List(),
  printOptionsBufferCursor: 0,
  lastGlobalPrintOption: PrintOption.default(),
  selectedPhotoUUIDs: Immutable.Set(),
  detailEditingPhoto: null,
  detailOptions: Immutable.Map(),
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_EDITOR_GRID_OPTIONS: {
      return {
        ...state,
        gridSize: _.get(action, "payload.gridSize", state.gridSize),
        gridOrder: _.get(action, "payload.gridOrder", state.gridOrder),
        gridGroup: _.get(action, "payload.gridGroup", state.gridGroup),
      };
    }

    case ActionTypes.CREATE_IMAGE_UPLOAD: {
      return {
        ...state,
        gridOrder: OrderOptions.BY_RECENT_UPLOAD,
      };
    }

    case ActionTypes.SELECT_CLONE_PHOTO: {
      return {
        ...state,
        photos: action.payload.photo,
      };
    }

    case ActionTypes.APPEND_PHOTOS_TO_PHOTO_EDITOR: {
      // 2024.02.28 업로드 후 사진을 화면에 추가
      const newPrintOptions = Immutable.Map().asMutable();
      const photos = state.photos.withMutations((set) => {
        _.get(action.payload, "photos", Immutable.Set())
          .map((image) => {
            if (isImageContainer(image)) {
              return image.hasImageMeta() ? image : null;
            }
            return image;
          })
          .map((image) => {
            if (!image) {
              return null;
            }
            if (isImageContainer(image)) {
              const selectedAt = image.selectedAt;
              const uploadedAt = image.uploadedAt;
              const imageMeta = image.getImageMeta();
              const src = imageMeta.getEditUrl();
              const { uuid, img_width, img_height, dateunix, datebool } =
                imageMeta;
              return new Photo({
                uuid,
                src,
                time: Number(dateunix),
                width: Number(img_width),
                height: Number(img_height),
                havingExifTime: JSON.parse(datebool),
                selectedAt,
                uploadedAt,
                $parentType: image.get("$type"),
              });
            }
            if (image instanceof Photo) {
              return image;
            }
            return null;
          })
          .filter(_.identity)
          .forEach((photo) => {
            set.add(photo);
            if (!state.printOptions.has(photo.uuid)) {
              const opts = _.get(action.payload, "defaultOption", {});
              newPrintOptions.set(
                photo.uuid,
                PrintOption.from(state.lastGlobalPrintOption)
                  .update(opts)
                  .UUID(photo.uuid)
              );
            }
          });
      });
      return {
        ...state,
        photos,
        printOptions: state.printOptions.merge(newPrintOptions),
        /* Note: 사진 추가 시 기본 선택된 상태 */
        selectedPhotoUUIDs: state.selectedPhotoUUIDs.withMutations((set) => {
          photos.forEach((photo) => set.add(photo.uuid));
        }),
      };
    }

    case ActionTypes.PURGE_PHOTOS: {
      const selectedPhotoUUIDs = state.selectedPhotoUUIDs.asMutable();
      const photos = state.photos.asMutable();
      _.get(action.payload, "photos", Immutable.Set()).forEach(
        (imageContainer) => {
          const element = photos.find(
            (photo) => photo.uuid === imageContainer.uuid
          );
          if (element) {
            photos.delete(element);
            selectedPhotoUUIDs.remove(element.uuid);
          }
        }
      );
      return {
        ...state,
        photos: photos.asImmutable(),
        selectedPhotoUUIDs: selectedPhotoUUIDs.asImmutable(),
      };
    }

    case ActionTypes.PURGE_SELECTED_PHOTOS: {
      return {
        ...state,
        photos: state.photos.filter(
          (photo) => !state.selectedPhotoUUIDs.includes(photo.uuid)
        ),
        selectedPhotoUUIDs: state.selectedPhotoUUIDs.clear(),
      };
    }

    case ActionTypes.SELECT_ALL_PHOTOS: {
      return {
        ...state,
        selectedPhotoUUIDs: state.selectedPhotoUUIDs.withMutations((set) => {
          state.photos.forEach((photo) => set.add(photo.uuid));
        }),
      };
    }

    case ActionTypes.UNSELECT_ALL_PHOTOS: {
      return {
        ...state,
        selectedPhotoUUIDs: state.selectedPhotoUUIDs.clear(),
      };
    }

    case ActionTypes.SELECT_OR_UNSELECT_PHOTO: {
      return {
        ...state,
        selectedPhotoUUIDs: state.selectedPhotoUUIDs.withMutations((set) => {
          if (set.includes(action.payload.uuid)) {
            set.delete(action.payload.uuid);
          } else {
            set.add(action.payload.uuid);
          }
        }),
      };
    }

    case ActionTypes.SELECT_OR_UNSELECT_ALL_PHOTOS: {
      return {
        ...state,
        selectedPhotoUUIDs: state.selectedPhotoUUIDs.withMutations((set) => {
          state.photos.forEach((photo) => {
            if (set.includes(photo.uuid)) {
              set.delete(photo.uuid);
            } else {
              set.add(photo.uuid);
            }
          });
        }),
      };
    }

    case ActionTypes.ADJUST_DETAIL_EDITS:
    case ActionTypes.SET_PRINT_OPTIONS:
    case ActionTypes.SET_PRINT_OPTIONS_ALL: {
      const photos = (() => {
        if (action.type === ActionTypes.SET_PRINT_OPTIONS_ALL) {
          return state.photos;
        }
        if (Immutable.isList(action.payload.photos)) {
          return action.payload.photos;
        }
        return Immutable.List(action.payload.photos);
      })();
      //console.warn(photos.toJS())
      const affectedPrintOptions = Immutable.Map().withMutations((map) => {
        const reversedBuffer = state.printOptionsBuffer
          .slice(0, state.printOptionsBufferCursor)
          .reverse();
        photos
          .map((photo) =>
            reversedBuffer
              .find(
                (buffer) => buffer.has(photo.uuid),
                null,
                /* or, initial state */ state.printOptions
              )
              .get(photo.uuid)
          )
          .map((printOption) => printOption.update(action.payload.options))
          .forEach((printOption) => map.set(printOption.uuid, printOption));
      });

      const last_options = action.payload.options;
      if (
        last_options.insertDateManual &&
        last_options.insertDateManual === "manual"
      )
        last_options.insertDateManual = "auto"; // 2024.02.08 날짜입력 모드가 직접입력이라면, 기본 자동입력(auto)으로 변경

      //console.log(action.payload.options.insertDateManual, last_options.insertDateManual);

      return {
        ...state,
        detailEditingPhoto: null,
        printOptionsBuffer: state.printOptionsBuffer
          .slice(0, state.printOptionsBufferCursor)
          .set(state.printOptionsBufferCursor, affectedPrintOptions),
        printOptionsBufferCursor: state.printOptionsBufferCursor + 1,
        //lastGlobalPrintOption: state.lastGlobalPrintOption.update(action.payload.options),
        lastGlobalPrintOption: state.lastGlobalPrintOption.update(last_options), // 2024.02.08 마지막 최종 옵션 유지 새로운 사진추가시 옵션 승계
      };
    }

    case ActionTypes.UNDO: {
      return {
        ...state,
        printOptionsBufferCursor: Math.max(
          state.printOptionsBufferCursor - 1,
          0
        ),
      };
    }

    case ActionTypes.REDO: {
      return {
        ...state,
        printOptionsBufferCursor: Math.min(
          state.printOptionsBufferCursor + 1,
          state.printOptionsBuffer.size
        ),
      };
    }

    case ActionTypes.OPEN_DETAIL_EDITOR: {
      return {
        ...state,
        detailEditingPhoto: action.payload.photo,
      };
    }

    case ActionTypes.CLOSE_DETAIL_EDITOR: {
      return {
        ...state,
        detailEditingPhoto: null,
      };
    }

    default:
      return state;
  }
};
