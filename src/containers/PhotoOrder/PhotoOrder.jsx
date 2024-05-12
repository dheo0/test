import React, { PureComponent, createRef, useCallback } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import Immutable from "immutable";
import numeral from "numeral";
import classNames from "classnames";
import {
  flow,
  map,
  groupBy,
  mapValues,
  toPairs,
  filter,
  fromPairs,
} from "lodash/fp";
import _ from "lodash";
import memoizeOne from "memoize-one";
import styled from "styled-components";
import GLOSS_ONLY_SIZES from "../../constants/glossOnlySizes";
import MATTE_ONLY_SIZES from "../../constants/matteOnlySizes";

import UIActions from "../../actions/UIActions";
import AppInfoActions from "../../actions/AppInfoActions";
import PhotoOrderActions from "../../actions/PhotoOrderActions";
import AppInfoSelector from "../../selectors/AppInfoSelector";
import LoadingSelector from "../../selectors/LoadingSelector";
import PhotoOrderSelector from "../../selectors/PhotoOrderSelector";
import PhotoEditorSelector from "../../selectors/PhotoEditorSelector";
import PrintSizeType from "../../constants/printSizeTypes";
import {
  PaperTypes,
  TrimmingTypes,
  BorderTypes,
} from "../../constants/printTypes";
import {
  createModal,
  closeModal,
  createMessageModal,
  createOrderConfirmModal,
  createPrintOptionConfirmModal,
} from "../../utils/ModalService";
import {
  getSafeUserId,
  getSafeOrderKey,
  getSafeOrderType,
  getSafePFYoonMode,
  getSafeEzwelMode,
} from "../../utils/commonUtils";
import PrintSize from "../../models/PrintSize";
import PlusProduct from "../../models/PlusProduct";
import PhotoCheckbox from "../../components/PhotoCheckbox";
import Counter, {
  ButtonBase,
  ValueWrapperBase,
} from "../../components/Counter";
import LoaderModal from "../../components/LoaderModal";
import PrintSizePrices from "../../components/PrintSizePrices";
import styles from "./PhotoOrder.module.scss";
import { deviceCheck } from "../../utils/commonUtils";

const OrderTypeClassic = "images/img_pic_classic.jpg";
const OrderTypeGgom = "images/img_pic_adjust.jpg";
const OrderTypeSpeed = "images/img_pic_speed.jpg";

const StyledHelpIcon = styled.div`
  width: 14px;
  height: 14px;
  display: inline-block;
  margin-left: 5px;
  line-height: 1.8;
  background: url("images/ic_info.png") center;

  &:hover {
    background: url("images/ic_info_over.png") center;
  }
`;

const StyledUl = styled.ul`
  /* list-style-image: url('images/ic_dot.png'); */

  list-style: none;
  padding-left: 0;

  li {
    position: relative;
    padding-left: 10px;

    &::before {
      content: "";
      width: 1px;
      height: 1px;
      position: absolute;
      background-image: url("images/ic_dot.png");
      background-size: cover;
      background-position: center;
      left: 0;
      top: 7px;
    }
  }
`;

const StyledMinusButton = styled(ButtonBase)`
  margin: 2px 1px 0 1px;
  background-image: url("images/ic_order_minus.png");

  &:hover {
    background-image: url("images/ic_order_minus_over.png");
  }
`;

const StyledPlusButton = styled(ButtonBase)`
  width: 17px;
  margin: 2px 1px 0 2px;
  background-image: url("images/ic_order_plus.png");

  &:hover {
    background-image: url("images/ic_order_plus_over.png");
  }
`;

const StyledValueWrapper = styled(ValueWrapperBase)`
  margin: 2px 3px 0 3px;
  padding: 0 8px;
`;

//const GLOSS_ONLY_SIZES = ['8x10', '10x13', '10x15', '11x14', 'A4', '12x17']; // 2019.09.30 유광만 주문 허용

class PhotoOrder extends PureComponent {
  static propTypes = {
    isFetchingPlusProducts: PropTypes.bool,
    plusProducts: PropTypes.instanceOf(Immutable.List),
  };

  static defaultProps = {
    isFetchingPlusProducts: false,
    plusProducts: Immutable.List(),
  };

  state = {
    selectedOrderType: getSafeOrderType(),
    selectedPlusProducts: {},
    showPriceHelp: {
      [PrintSizeType.CLASSIC]: false,
      [PrintSizeType.GGOM]: false,
      [PrintSizeType.SPEED]: false,
    },
    showPriceHelpPopup: false,
    goEdit: false,
  };

  orderTypeOptionItems = [
    {
      type: PrintSizeType.CLASSIC,
      image: OrderTypeClassic,
      title: "클래식 사진인화",
      content:
        deviceCheck() === "Web" ? (
          <div>
            {getSafePFYoonMode() ? "팩토리윤" : "포토몬"}의 기본적인 사진인화
            서비스로
            <br />
            최고 등급, 최고 품질의 인화지를 사용하여
            <br />
            사진을 오랫동안 선명하게 보관할 수 있습니다.
          </div>
        ) : (
          <div>
            {getSafePFYoonMode() ? "팩토리윤" : "포토몬"}의 기본적인 사진인화
            서비스로 최고 품질의 인화지를 사용합니다.
          </div>
        ),
    },
    {
      type: PrintSizeType.GGOM,
      image: OrderTypeGgom,
      title: "꼼꼼 사진인화",
      content:
        deviceCheck() === "Web" ? (
          <>
            <div>
              촬영 당시의 실제 컬러값에 가깝게 보정해 드리는 전문가 보정
              서비스입니다.
            </div>
            <StyledUl>
              <li>
                적목(빨간눈), 흔들린 사진, 이미지 편집, 저해상도 이미지는 <br />{" "}
                꼼꼼 사진인화 서비스에서 수정되지 않습니다.
              </li>
              <li>꼼꼼 사진인화는 클래식 사진인화보다 2~3일 더 소요됩니다.</li>
            </StyledUl>
          </>
        ) : (
          <div>
            촬영 당시의 실제 컬러값에 가깝게 보정해 드리는 전문가 보정
            서비스입니다.
          </div>
        ),
    },
    {
      type: PrintSizeType.SPEED,
      image: OrderTypeSpeed,
      title: "스피드 사진인화",
      content: (
        <>
          <div>
            {/*주문 접수부터 인화까지 1시간 내로 완료되는 고속 인화 서비스입니다.*/}
            주문 접수부터 인화까지 3시간 내로 완료되는 고속 인화 서비스입니다.​
          </div>
          {deviceCheck() === "Web" && (
            <StyledUl>
              <li>동일 사이즈 500장 기준 5,000원이 추가됩니다.</li>
              <li>500장 단위로 비용이 추가됩니다.</li>
              <li>사이즈가 다른 경우 사이즈 별로 별도 계산됩니다.</li>
            </StyledUl>
          )}
        </>
      ),
    },
  ];

  printSizePriceRefs = {
    [PrintSizeType.CLASSIC]: createRef(),
    [PrintSizeType.GGOM]: createRef(),
    [PrintSizeType.SPEED]: createRef(),
  };

  componentDidMount() {
    this.props.requestGetPlusProducts();

    if (this.getHasErrorPaper()) this.setState({ goEdit: true }); // 유광 무광 섞이는 case 는 다시 편집화면으로 돌려보낸다.
  }

  getOrderPrices = (
    photos,
    printSizes,
    plusProducts,
    orderTypeOptionItems,
    selectedOrderType,
    selectedPlusProductInfo
  ) => {
    // 주문정보 셋업
    const selectedSizeOptionItem = _.find(orderTypeOptionItems, {
      type: selectedOrderType,
    });
    const selectedPrintSizes = printSizes.get(selectedOrderType);

    const photoPrices = flow(
      map((photo) => photo.$printOption),
      groupBy((printOption) => {
        const printSize = selectedPrintSizes.find(
          (s) => s.size === printOption.size
        );
        return `${
          getSafePFYoonMode() &&
          selectedSizeOptionItem.title === "클래식 사진인화"
            ? "사진인화"
            : selectedSizeOptionItem.title
        } ${printSize.size}`;
      }),
      mapValues((printOptions) => {
        const _size = _.get(printOptions, "[0].size");
        const _sizeBySelectedType = selectedPrintSizes.find(
          (s) => s.size === _size,
          null,
          new PrintSize()
        );
        const count = printOptions.reduce((r, p) => r + p.printQuantity, 0);
        const price = _sizeBySelectedType.currentPrice;
        const totalPrice = price * count;
        return {
          summary: `${numeral(price).format("0,0")}원 x ${numeral(count).format(
            "0,0"
          )}개`,
          price: `${numeral(totalPrice).format("0,0")}원`,
          rawPrice: totalPrice,
          totalCount: count,
        };
      }),
      toPairs,
      map(([name, meta]) => ({ name, ...meta }))
    )(photos.toJS());

    const isSpeed = PrintSizeType.SPEED === selectedOrderType; // 2023.09.25 스피드 주문건은 함께주문하기 동봉상품 제외

    const plusProductPrices = flow(
      filter(
        (plusProduct) =>
          _.has(selectedPlusProductInfo, PlusProduct.getId(plusProduct)) &&
          _.get(selectedPlusProductInfo, PlusProduct.getId(plusProduct)) > 0
      ),
      map((plusProduct) => [
        PlusProduct.getProductName(plusProduct),
        plusProduct,
      ]),
      fromPairs,
      mapValues((plusProduct) => {
        const count = _.get(
          selectedPlusProductInfo,
          PlusProduct.getId(plusProduct)
        );
        const price = plusProduct.price;
        const totalPrice = price * count;
        return {
          summary: `${numeral(price).format("0,0")}원 x ${numeral(count).format(
            "0,0"
          )}개`,
          price: `${numeral(totalPrice).format("0,0")}원`,
          rawPrice: totalPrice,
          totalCount: count,
        };
      }),
      toPairs,
      map(([name, meta]) => ({ name, ...meta }))
    )(plusProducts.toJS());

    if (isSpeed) {
      return [...photoPrices];
    } else {
      return [...photoPrices, ...plusProductPrices];
    }
  };

  memoizeGetOrderPrices = memoizeOne(this.getOrderPrices);

  handleClickSize = (selectedOrderType) => () => {
    this.setState({ selectedOrderType });
  };

  handleChangePlusProductCount = (plusProduct) => (quantity) => {
    this.setState((state) => ({
      selectedPlusProducts: {
        ...state.selectedPlusProducts,
        [plusProduct.getId()]: quantity,
      },
    }));
  };

  static photoToOrderInfo =
    (OrderNo, printSizeInfo, orderableImages, selectedOrderType) => (photo) => {
      const selectedPrintSizes = printSizeInfo.get(selectedOrderType);
      const printOption = photo.getPrintOption();
      const printSize = selectedPrintSizes.find(
        (s) => s.size === printOption.size,
        null,
        new PrintSize()
      );
      const uploadingFile = orderableImages.find(
        (upload) => upload.uuid === photo.uuid
      );
      const uploadMeta = uploadingFile.getImageMeta();

      return {
        printmode: selectedOrderType,
        sOrderNO: OrderNo,
        sSize: printSize.size,
        sCnt: printOption.printQuantity,
        sTrimInfo: printOption.getTrimString(photo, printSize),
        sLightType: printOption.paper === PaperTypes.GLOSS ? 1 : 2,
        sFullType: printOption.trimming === TrimmingTypes.PAPER_FULL ? 1 : 2,
        sBorderType: printOption.border === BorderTypes.NONE ? 1 : 2,
        sReviseType: printOption.autoAdjustment === true ? 1 : 2,
        sDateType: printOption.insertDate === true ? 1 : 2,
        server: uploadMeta.server,
        url_domain: uploadMeta.url_domain,
        url_gcs_domain: uploadMeta.url_gcs_domain, // 2021.07.02 GCP
        url_path: uploadMeta.url_path,
        url_file: uploadMeta.url_file,
        url_ori: uploadMeta.url_ori,
        img_width: uploadMeta.img_width,
        img_height: uploadMeta.img_height,
        datebool: uploadMeta.datebool,
        datekr: photo.getDateString("YYYY-MM-DD HH:mm:ss"),
        angle: printOption.rotate,
        sfilter: printOption.filterAdjusted
          ? `${printOption.filterAdjusted}_1`
          : "",
        createdate: uploadMeta.createdate, // 2021.07.02 GCP
        seq_index: uploadMeta.seq_index, // 2024.01.03 사진업로드 순서위한 순서 값
      };
    };

  handleClickOrderActions = (buttonAction) => () => {
    //const { selectedOrderType } = this.state;

    // if (PrintSizeType.SPEED === selectedOrderType) { // 2022.08.18 스피드건 일시 서비스 중지
    //   closeModal(LoaderModal);
    //   createMessageModal([
    //     '스피드 사진인화는 일시 서비스 중지 상태입니다. ',
    //     '클래식 사진인화 또는 꼼꼼 사진인화를 선택해 주세요.',
    //   ].join('\n'));
    //   return;
    // }

    // 2020.04.22
    let matte_show_msg = this.getMatteOnlySizes(); // 2022.11.28
    if (matte_show_msg) {
      let message =
        MATTE_ONLY_SIZES.toString() +
        " 사이즈는\n모두 무광으로만 인화됩니다.\n"; // 2022.11.28
      closeModal(LoaderModal);
      createMessageModal([message].join("\n"), "", {
        onClose: () => {
          this.handleClickOrderActionsGo(buttonAction)();
          return;
        },
      });
      return;
    }

    this.handleClickOrderActionsGo(buttonAction)();
  };

  handleClickOrderActionsGo = (buttonAction) => () => {
    // 주문하기 셋팅 옵션 리스트 표시
    // 2020.02.03
    let cnt_warn = this.countLowQuality();
    if (cnt_warn > 0) {
      createOrderConfirmModal(
        /*
        [
        `사진의 해상도가 낮아 인화 시 품질이 좋지 않은 주문 {${cnt_warn}}건 발생<BR>`,
        '<font color="red">재 확인 없이 진행한 주문 건에 대하여</font>',
        '<font color="red">*재 제작 또는 환불 불가</font>'],
    */
        // 2021.03.23 품질저하 안내 팝업 수정
        [
          `<font color="black" size="2px">해상도가 낮아 인화품질이 떨어지는 사진이 ${cnt_warn}장 있습니다.</font>`,
          '<font color="black" size="3px"><strong>화질이 떨어져도 인화주문을 하시겠습니까?</strong></font>',
          '<font color="black" size="2px">저해상도이미지로 인한 품질불만족시 재작업 또는 환불사유에</font>',
          '<font color="black" size="2px">해당되지 않습니다.</font>',
        ],
        "",
        {
          onClickConfirm: () => {
            this.handleClickPrintOptionActions(buttonAction)(); // 2020.04.22
          },
          onClickConfirmTwo: () => {
            this.setState({ goEdit: true }); // 재 확인
          },
          onClose: () => {
            return;
          },
        }
      );
    } else {
      this.handleClickPrintOptionActions(buttonAction)(); // 2020.04.22
    }

    // 2020.04.22
    //this.getPrintOrderInfoTable();
  };

  // 2020.02.03
  handleClickOrderActionsExecute = (buttonAction) => () => {
    //console.log("buttonAction : "+buttonAction);

    const {
      photos,
      printSizeInfo,
      orderableImages,
      plusProducts,
      requestGetOrderingServerUrl,
      requestCreateOrder,
      requestAddToCart,
    } = this.props;
    const { selectedOrderType, selectedPlusProducts } = this.state;

    createModal(LoaderModal);

    requestGetOrderingServerUrl().promise.then(
      ({ payload: { OrderNo, addCartUrl, dataSendUrl } }) => {
        const orderInfos = photos
          .map(
            PhotoOrder.photoToOrderInfo(
              OrderNo,
              printSizeInfo,
              orderableImages,
              selectedOrderType
            )
          )
          .toJS();

        //console.log("주문생성", dataSendUrl, orderInfos);

        requestCreateOrder({ dataSendUrl, orderInfos }).promise.then(
          this.handleCreateOrderSucceed({
            buttonAction,
            OrderNo,
            selectedPlusProducts,
            plusProducts,
            selectedOrderType,
            requestAddToCart,
            addCartUrl,
          }),
          this.handleCreateOrderFailed
        );
      },
      this.handleGetOrderingServerUrlFailed
    );
  };

  // 2019.09.30
  // TODO 테스트...
  /* eslint-disable */
  orderPossible = () => {
    const { photos, printSizes } = this.props;

    if (_.includes(GLOSS_ONLY_SIZES, _.get(printSizes, "size"))) {
      console.log("only gloss");
    } else {
      console.log("mix");
    }
  };
  /* eslint-enable */

  // 2020.02.03
  countLowQuality = () => {
    let ret_cnt = 0;
    const { photos, printSizeInfo } = this.props;

    const { selectedOrderType } = this.state;
    const selectedPrintSizes = printSizeInfo.get(selectedOrderType);

    photos.forEach((photo) => {
      const printOption = photo.getPrintOption();
      const printSize = selectedPrintSizes.find(
        (s) => s.size === printOption.size,
        null,
        new PrintSize()
      );

      const shouldSizeWarn = photo.shouldSizeWarn(
        printSize,
        photo.getPrintOption().scale
      );

      if (shouldSizeWarn) ret_cnt++;
    });

    return ret_cnt;
  };

  handleClickPrintOptionActions = (buttonAction) => () => {
    let print_order_option = this.getPrintOrderInfoTable();

    // selectedOrderType - classic, ggom, speed 등
    const { selectedOrderType } = this.state;
    let product_type =
      selectedOrderType === "classic"
        ? getSafePFYoonMode()
          ? "사진인화"
          : "클래식 사진인화"
        : selectedOrderType === "ggom"
        ? "꼼꼼 사진인화"
        : "스피드 사진인화";
    product_type = `<p style="text-align: center; font-weight:bold; font-size: 17px">상품명 : ${product_type}</p>`;
    print_order_option = product_type + print_order_option;

    createPrintOptionConfirmModal(
      [
        "",
        print_order_option,
        `<p style="text-align: center; font-weight:bold">주문하시겠습니까?</p>`,
      ],
      "주문하신 상품정보 입니다.",
      {
        onClickConfirm: () => {
          this.handleClickOrderActionsExecute(buttonAction)(); // 재 확인 없이 주문
        },
        onClickConfirmTwo: () => {
          this.setState({ goEdit: true }); // 재 확인
        },
        onClose: () => {
          return;
        },
      }
    );
  };

  // 2020.10.16 유무광이 섞이는 케이스 - 편집화면으로 다시 돌려보낸다. 유무광 다시 선택 유도
  getHasErrorPaper = () => {
    const { photos } = this.props;

    let is_return = false;
    let diffpaper = [];
    photos.forEach((photo) => {
      let is_exists = diffpaper.some((data) => {
        return photo.getPrintOption().size === data.getPrintOption().size;
      });

      if (!is_exists) diffpaper.push(photo);
    });

    diffpaper.forEach((photo_item) => {
      // 사이즈별 유광 무광 수량파악
      let gloss_count = 0; // PaperTypes.GLOSS
      let matte_count = 0; // PaperTypes.MATTE
      let first_paper = "";

      photos.forEach((photo) => {
        if (photo_item.getPrintOption().size === photo.getPrintOption().size) {
          if (first_paper === "") first_paper = photo.getPrintOption().paper;

          if (photo.getPrintOption().paper === PaperTypes.GLOSS) gloss_count++;
          if (photo.getPrintOption().paper === PaperTypes.MATTE) matte_count++;
        }
      });

      if (gloss_count > 0 && matte_count > 0) {
        //console.log(photo_item.getPrintOption().size, '유/무광 옵션 보정');
        is_return = true;
      }
    });

    if (is_return) {
      closeModal(LoaderModal);
      createMessageModal(
        ["무광, 유광 인화지 옵션을 다시 선택해 주세요!", ""].join("\n")
      );
    }

    return is_return;
  };

  // 2020.04.22
  getPrintOrderInfoTable = () => {
    // this.orderTypeOptionItems - 클래식 사진인화, 꼼꼼 사진인화, 스피드 사진인화 정보 리스트
    // selectedOrderType - classic, ggom, speed 등
    const { photos } = this.props;

    let diffOption = [];

    photos.forEach((photo) => {
      let is_exists = diffOption.some((data) => {
        return (
          photo.getPrintOption().size === data.getPrintOption().size &&
          photo.getPrintOption().border === data.getPrintOption().border &&
          photo.getPrintOption().trimming === data.getPrintOption().trimming &&
          photo.getPrintOption().autoAdjustment ===
            data.getPrintOption().autoAdjustment &&
          photo.getPrintOption().insertDate === data.getPrintOption().insertDate
        );
      });

      if (!is_exists) diffOption.push(photo);
    });

    // No, 크기, 코팅, 테두리, 트리밍, 밝기보정, 날짜입력, 수량, 단가, 합계
    //console.log("--------------- getPrintOrderInfoTable --------------");

    diffOption.forEach((photo) => {
      // 수량 재정의 해보자
      photo.totalPrintCount = 0;
    });

    diffOption.forEach((photo) => {
      photos.forEach((data) => {
        if (
          photo.getPrintOption().size === data.getPrintOption().size &&
          photo.getPrintOption().border === data.getPrintOption().border &&
          photo.getPrintOption().trimming === data.getPrintOption().trimming &&
          photo.getPrintOption().autoAdjustment ===
            data.getPrintOption().autoAdjustment &&
          photo.getPrintOption().insertDate === data.getPrintOption().insertDate
        )
          photo.totalPrintCount += data.getPrintOption().printQuantity;
      });
    });
    const size = [];
    const border = [];
    const paper = [];
    const triming = [];
    const autoAdjustment = [];
    const insertDate = [];
    const count = [];
    const numArr = [];
    let num = 1;
    diffOption.forEach((photo) => {
      size.push(photo.getPrintOption().size);
      paper.push(photo.getPrintOption().paper);
      border.push(photo.getPrintOption().border);
      triming.push(photo.getPrintOption().triming);
      autoAdjustment.push(photo.getPrintOption().autoAdjustment);
      insertDate.push(photo.getPrintOption().insertDate);
      count.push(photo.getPrintOption().printQuantity);
      numArr.push(num++);
    });

    const return_mobile_table = () => {
      const sizeCell = size.map((item, index) => {
        return `<td key=${index}>${item}</td>`;
      });
      const paperCell = paper.map((item, index) => {
        return `<td key=${index} class=${item === "gloss" ? "red" : ""}>${
          item === "gross" ? "유광" : "무광"
        }</td>`;
      });
      const borderCell = border.map((item, index) => {
        return `<td key=${index}>${item === "border" ? "유테" : "무테"}</td>`;
      });
      const trimingCell = triming.map((item, index) => {
        return `<td key=${index}>${
          item === "image_full" ? "이미지풀" : "인화지풀"
        }</td>`;
      });
      const autoAdjustCell = autoAdjustment.map((item, index) => {
        return `<td key=${index} class=${item ? "red" : ""}>${
          item ? "O" : "-"
        }</td>`;
      });
      const dateCell = insertDate.map((item, index) => {
        return `<td key=${index}>${item ? "O" : "-"}</td>`;
      });
      const countCell = count.map((item, index) => {
        return `<td key=${index}>${item}</td>`;
      });

      const numCell = numArr.map((item, index) => {
        return `<td key=${index}>${item}</td>`;
      });

      return `<div class=${
        styles.Mtable
      }><table><tbody><tr><th>NO.</th>${numCell.join(
        ""
      )}</tr><tr><th>크기</th>${sizeCell.join(
        ""
      )}</tr><tr><th>인화지</th>${paperCell.join(
        ""
      )}</tr><tr><th>테두리</th>${borderCell.join(
        ""
      )}</tr><tr><th>인화유형</th>${trimingCell.join(
        ""
      )}</tr><tr><th>밝기보정</th>${autoAdjustCell.join(
        ""
      )}</tr><tr><th>날짜입력</th>${dateCell.join(
        ""
      )}</tr><tr><th>수량</th>${countCell.join("")}</tr></tbody></table></div>`;
    };
    let return_option_str = "";
    return_option_str += `<div style="width:573px; margin: auto;">`;
    return_option_str += `<div style="width:100%; height:200px; overflow:auto; text-align: center;">`;
    //return_option_str += `<table style="border-collapse: separate; border-spacing: 1px; text-align: center; line-height: 1; margin: 20px 10px;" border="0" >`;
    return_option_str += `<table style="text-align: center; line-height: 1; margin-right: 100px ;" border="0" >`;
    return_option_str += `<thead>`;
    return_option_str += `<tr>`;
    return_option_str += `<th scope="cols" style="width: 155px; padding: 10px; font-weight: bold; vertical-align: top; color: #000000; background: #aaaaaa">No.</th>`;
    return_option_str += `<th scope="cols" style="width: 155px; padding: 10px; font-weight: bold; vertical-align: top; color: #000000; background: #aaaaaa">&nbsp;&nbsp;크기&nbsp;&nbsp;</th>`;
    return_option_str += `<th scope="cols" style="width: 155px; padding: 10px; font-weight: bold; vertical-align: top; color: #000000; background: #aaaaaa">&nbsp;인화지&nbsp;</th>`; // 2020.08.03 코팅 -> 인화지로 수정
    return_option_str += `<th scope="cols" style="width: 155px; padding: 10px; font-weight: bold; vertical-align: top; color: #000000; background: #aaaaaa">&nbsp;테두리&nbsp;</th>`;
    return_option_str += `<th scope="cols" style="width: 155px; padding: 10px; font-weight: bold; vertical-align: top; color: #000000; background: #aaaaaa">&nbsp;&nbsp;인화유형&nbsp;&nbsp;</th>`;
    return_option_str += `<th scope="cols" style="width: 155px; padding: 10px; font-weight: bold; vertical-align: top; color: #000000; background: #aaaaaa">&nbsp;&nbsp;밝기보정&nbsp;&nbsp;</th>`;
    return_option_str += `<th scope="cols" style="width: 155px; padding: 10px; font-weight: bold; vertical-align: top; color: #000000; background: #aaaaaa">&nbsp;&nbsp;날짜입력&nbsp;&nbsp;</th>`;
    return_option_str += `<th scope="cols" style="width: 155px; padding: 10px; font-weight: bold; vertical-align: top; color: #000000; background: #aaaaaa">&nbsp;&nbsp;수량&nbsp;&nbsp;</th>`;

    return_option_str += `</tr>`;
    return_option_str += `</thead>`;
    return_option_str += `<tbody>`;

    let idx = 0;
    diffOption.forEach((photo) => {
      idx++;

      return_option_str += `<tr>`;

      return_option_str += `<td style = "width: 155px; padding: 10px; vertical-align: top; border-bottom: 1px solid #ccc; background: #eee;">${idx}</td>`;
      return_option_str += `<td style = "width: 155px; padding: 10px; vertical-align: top; border-bottom: 1px solid #ccc; background: #eee;">${
        photo.getPrintOption().size
      }</td>`;
      return_option_str += `<td style = "width: 155px; padding: 10px; vertical-align: top; border-bottom: 1px solid #ccc; background: #eee;${
        photo.getPrintOption().paper === "gloss" ? "color:red;" : ""
      }">${photo.getPrintOption().paper === "gloss" ? "유광" : "무광"}</td>`;
      return_option_str += `<td style = "width: 155px; padding: 10px; vertical-align: top; border-bottom: 1px solid #ccc; background: #eee;${
        photo.getPrintOption().border === "border" ? "color:red;" : ""
      }">${photo.getPrintOption().border === "border" ? "유테" : "무테"}</td>`;
      return_option_str += `<td style = "width: 155px; padding: 10px; vertical-align: top; border-bottom: 1px solid #ccc; background: #eee;${
        photo.getPrintOption().trimming === "image_full" ? "color:red;" : ""
      }">${
        photo.getPrintOption().trimming === "image_full"
          ? "이미지풀"
          : "인화지풀"
      }</td>`;
      return_option_str += `<td style = "width: 155px; padding: 10px; vertical-align: top; border-bottom: 1px solid #ccc; background: #eee;${
        photo.getPrintOption().autoAdjustment === true ? "color:red;" : ""
      }">${photo.getPrintOption().autoAdjustment === true ? "O" : "-"}</td>`;
      return_option_str += `<td style = "width: 155px; padding: 10px; vertical-align: top; border-bottom: 1px solid #ccc; background: #eee;${
        photo.getPrintOption().insertDate === true ? "color:red;" : ""
      }">${photo.getPrintOption().insertDate === true ? "O" : "-"}</td>`;
      return_option_str += `<td style = "width: 155px; padding: 10px; vertical-align: top; border-bottom: 1px solid #ccc; background: #eee;">${photo.totalPrintCount}</td>`;

      return_option_str += `</tr>`;
    });

    return_option_str += `</tbody>`;
    return_option_str += `</table>`;
    return_option_str += `</div>`;
    return_option_str += `</div>`;

    return deviceCheck() === "Web" ? return_option_str : return_mobile_table();
  };

  getMatteOnlySizes = () => {
    const { photos } = this.props;

    let photo = photos.find((photo) => {
      //return _.includes(GLOSS_ONLY_SIZES, photo.getPrintOption().size);
      return _.includes(MATTE_ONLY_SIZES, photo.getPrintOption().size);
    });

    return photo !== undefined;
  };

  handleGetOrderingServerUrlFailed = ({ payload: { error } }) => {
    closeModal(LoaderModal);
    createMessageModal(["주문서버 URL 가져오기 실패", error].join("\n"));
  };

  handleCreateOrderSucceed =
    ({
      buttonAction,
      selectedOrderType,
      OrderNo,
      selectedPlusProducts,
      plusProducts,
      requestAddToCart,
      addCartUrl,
    }) =>
    () => {
      // Default (photos)
      const cartItems = [
        {
          movemode: buttonAction,
          printmode: selectedOrderType,
          orderno: OrderNo,
          userid: getSafeUserId(),
          orderkey: getSafeOrderKey(),
        },
      ];

      const isSpeed = PrintSizeType.SPEED === selectedOrderType; // 2023.09.25 스피드 주문건은 함께주문하기 동봉상품 제외

      // Additional plus products
      if (!_.isEmpty(selectedPlusProducts)) {
        _.toPairs(selectedPlusProducts).forEach(([plusProductId, quantity]) => {
          //console.log('plusProductId', quantity);
          if (!isSpeed && quantity > 0) {
            // 2020.11.27 수량 0일때에는 미포함, 수량이 셋팅되면 장바구니 연동.
            const plusProduct = plusProducts.find(
              (plusProduct) => plusProduct.getId() === plusProductId
            );
            cartItems.push({
              movemode: "add",
              userid: getSafeUserId(),
              orderkey: getSafeOrderKey(),
              intnum: plusProduct.intnum,
              seq: plusProduct.seq,
              seloption: plusProduct.seloption,
              price: plusProduct.price,
              pkgcnt: quantity,
            });
          }
        });
      }

      //console.log(cartItems);
      //return;
      //장바구니 이동

      //console.log('장바구니 이동 전', OrderNo, cartItems);
      //return;

      //장바구니 이동
      requestAddToCart({ addCartUrl, cartItems }).promise.then(
        this.handleAddToCartSucceed,
        this.handleAddToCartFailed
      );
    };

  handleCreateOrderFailed = ({ payload: { errors } }) => {
    closeModal(LoaderModal);
    createMessageModal(["주문 생성 실패", errors].join("\n"));
  };

  handleAddToCartSucceed = ({ payload: { moveurl } }) => {
    const { exitApp } = this.props;

    closeModal(LoaderModal);
    if (moveurl) {
      exitApp();

      // 바로 location 변경 할 경우 TransitionPrompt 컴포넌트에서 catch 못할 수 있음.
      setTimeout(() => {
        window.location.href = moveurl;
      }, 100);
    }
  };

  handleAddToCartFailed = ({ payload: { errors } }) => {
    closeModal(LoaderModal);
    createMessageModal(["장바구니 넣기 실패", errors].join("\n"));
  };

  handleSummaryMouseEnter = (printSizeType) => () => {
    this.setState((state) => ({
      showPriceHelp: {
        ...state.showPriceHelp,
        [printSizeType]: true,
      },
    }));
  };

  handleSummaryMouseLeave = (printSizeType) => () => {
    this.setState((state) => ({
      showPriceHelp: {
        ...state.showPriceHelp,
        [printSizeType]: false,
      },
    }));
  };

  renderOrderTypeSelectArea() {
    const { selectedOrderType } = this.state;
    const handleSummaryMouseClick = (printSizeType) => {
      this.setState({ showPriceHelpPopup: true });
      if (this.state.showPriceHelpPopup) {
        console.log(printSizeType);
      }
    };
    return (
      <div className={`${styles.OrderTypeSelectArea} ${styles[deviceCheck()]}`}>
        <h1>사진인화 방식을 선택해주세요</h1>

        {this.orderTypeOptionItems.map((option, idx) => {
          const isSelected = selectedOrderType === option.type;
          const is_ok = getSafePFYoonMode() && idx === 2 ? false : true; // 2020.10.20 팩토리윤 - 꼼꼼인화, 스피드인화는 지원 안함
          const title =
            getSafePFYoonMode() && option.title === "클래식 사진인화"
              ? "사진인화"
              : option.title;
          //const color_info_text = getSafePFYoonMode() ? <p style="color:#FF0000">기존 일반사진 주문과 색상차이가 있습니다.</p> : '';
          const color_info_text =
            getSafePFYoonMode() && idx === 0
              ? "기존 일반사진 주문과 색상차이가 있습니다."
              : "";
          return (
            is_ok && (
              <div
                key={`option-item-${option.type}`}
                className={classNames(styles.OrderTypeOption, {
                  [styles.isSelected]: isSelected,
                })}
                onClick={this.handleClickSize(option.type)}
              >
                {deviceCheck() === "Web" && (
                  <div
                    className={styles.PreviewImage}
                    style={{ backgroundImage: `url('${option.image}')` }}
                  >
                    <div className={styles.PreviewImageMask}>
                      <PhotoCheckbox
                        checked={isSelected}
                        className={styles.CheckBox}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.Summary}>
                  <h2 ref={this.printSizePriceRefs[option.type]}>
                    {this.renderPrintSizePrices(option.type)}
                    {title}
                    {deviceCheck() === "Web" ? (
                      <StyledHelpIcon
                        onMouseEnter={this.handleSummaryMouseEnter(option.type)}
                        onMouseLeave={this.handleSummaryMouseLeave(option.type)}
                      />
                    ) : (
                      <StyledHelpIcon
                        onClick={this.handleSummaryMouseEnter(option.type)}
                      />
                    )}
                  </h2>
                  {option.content}
                </div>

                {color_info_text && color_info_text.length > 0 && (
                  <div className={styles.SummaryRed}>{color_info_text}</div>
                )}
              </div>
            )
          );
        })}

        {/*
            <div>
                <h2>※유의사항</h2>
                <li>사진은 크기별로 따로 포장되어 제공됩니다.</li>
                <li>동일한 크기의 사진이 100장 이상이면 50장 단위로 포장되어 제공됩니다.</li>
                <li>포장용 투명 비닐은 별도로 추가 제공되지 않습니다.</li>            
            </div>  
          */}
      </div>
    );
  }

  renderPrintSizePrices(printSizeType) {
    const { printSizeMap } = this.props;
    const { showPriceHelp } = this.state;
    if (
      printSizeType &&
      showPriceHelp[printSizeType] &&
      this.printSizePriceRefs[printSizeType].current
    ) {
      const printSizes = printSizeMap.get(printSizeType);

      return ReactDOM.createPortal(
        <PrintSizePrices
          printSizes={printSizes}
          printSizeType={printSizeType}
          onClose={this.handleSummaryMouseLeave(printSizeType)}
        />,
        this.printSizePriceRefs[printSizeType].current
      );
    }
    return null;
  }

  renderPlusProductArea() {
    if (deviceCheck() === "Mobile") return;
    const { plusProducts } = this.props;

    return (
      <div className={styles.PlusProductArea}>
        <h1>함께 주문해보세요</h1>
        <div>
          <h4>사진인화에 어울리는 상품이 있습니다.</h4>
          <h4>함께 주문해 보시는건 어떨까요?</h4>
        </div>

        <div
          className={
            getSafePFYoonMode()
              ? styles.PFYoonPlusProducts
              : styles.PlusProducts
          }
        >
          {plusProducts.map(this.renderPlusProduct)}
        </div>
      </div>
    );
  }

  renderPlusProduct = (plusProduct) => {
    // 함께 주문하기 상품
    return (
      <div key={plusProduct.getId()} className={styles.Product}>
        <div
          className={styles.Thumbnail}
          style={{ backgroundImage: `url('${plusProduct.url_thumb}')` }}
        />
        <div className={styles.ProductName}>{plusProduct.getProductName()}</div>
        <div className={styles.ProductPrice}>
          {numeral(plusProduct.price).format("0,0")}원
        </div>
        <Counter
          className={styles.Counter}
          backgroundSrc="ic_order_number_bg.png"
          min={0}
          max={999}
          initial={0}
          MinusButton={StyledMinusButton}
          PlusButton={StyledPlusButton}
          ValueWrapper={StyledValueWrapper}
          onChange={this.handleChangePlusProductCount(plusProduct)}
        />
      </div>
    );
  };

  renderOrderInformation() {
    const { photos, printSizeInfo, plusProducts } = this.props;
    const { selectedOrderType, selectedPlusProducts } = this.state;
    const orderTableData = this.memoizeGetOrderPrices(
      photos,
      printSizeInfo,
      plusProducts,
      this.orderTypeOptionItems,
      selectedOrderType,
      selectedPlusProducts
    );

    if (PrintSizeType && PrintSizeType.SPEED === selectedOrderType) {
      // 2020.02.11
      let speed_price = 0;
      orderTableData.forEach((orderData) => {
        let speedSizeCnt = Math.ceil(orderData.totalCount / 500); // 500 장 단위로 5,000 추가, 만약 501 장 이면, 10,000 추가
        //console.log(orderData);
        speed_price += 5000 * speedSizeCnt;
      });

      if (speed_price > 0)
        orderTableData.push({
          name: "[옵션] 스피드 사진인화 수수료",
          summary: "",
          price: numeral(speed_price).format("0,0") + "원",
          rawPrice: speed_price,
        });

      //console.log(orderTableData);
    }

    return (
      <div className={`${styles.OrderInformation} ${styles[deviceCheck()]}`}>
        <h1>주문정보</h1>

        <div className={styles.OrderTable}>
          {orderTableData.map(({ name, summary, price, img }, i) => (
            <div key={`row-${i}`} className={styles.Row}>
              <div className={styles.SpeedInfo}> {name}</div>
              <div>{summary}</div>
              <div>{price}</div>
            </div>
          ))}

          <div className={classNames(styles.Row, styles.TotalPrice)}>
            <div>결제 예상금액</div>
            <div>
              {numeral(
                _.reduce(orderTableData, (ret, row) => ret + row.rawPrice, 0)
              ).format("0,0")}
              <span>원</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderActions() {
    let is_pfyoon = getSafePFYoonMode();
    let is_iswel = getSafeEzwelMode();

    return (
      <div className={`${styles.Actions} ${styles[deviceCheck()]}`}>
        {!(is_pfyoon || is_iswel) && (
          <button
            className="coral"
            /*disabled={this.orderPossible()}*/ onClick={this.handleClickOrderActions(
              "pay"
            )}
          >
            바로 주문하기
          </button>
        )}

        <button
          className="coralLight"
          onClick={this.handleClickOrderActions("cart")}
        >
          장바구니에 추가
        </button>
      </div>
    );
  }

  render() {
    const { isFetchingEssentials, photos } = this.props;
    const { goEdit, selectedOrderType, selectedPlusProducts } = this.state;

    //console.log("goEdit state : "+goEdit, selectedOrderType);
    //console.log(selectedPlusProducts);

    if (goEdit) {
      return <Redirect to="/" />;
    }

    if (isFetchingEssentials) {
      return null;
    }
    if (!photos || photos.isEmpty() || _.isEmpty(getSafeOrderKey() || goEdit)) {
      return <Redirect to="/" />;
    }
    const isSpeed = PrintSizeType.SPEED === selectedOrderType; // 2023.09.25 스피드 주문건은 함께주문하기 동봉상품 제외

    return (
      <div className={styles.PhotoOrder}>
        <div className={`${styles.Content} ${styles[deviceCheck()]}`}>
          <div className={`${styles.ProductOptions}`}>
            {this.renderOrderTypeSelectArea()}
            {!isSpeed && this.renderPlusProductArea()}
          </div>

          {this.renderOrderInformation()}
          {this.renderActions()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  printSizeMap: AppInfoSelector.getPrintSizeMap(state),
  isFetchingEssentials: LoadingSelector.isFetchingEssentials(state),
  printSizeInfo: state.AppInfoReducer.printSizeInfo,
  isFetchingPlusProducts: state.AppInfoReducer.isFetchingPlusProducts,
  plusProducts: state.AppInfoReducer.plusProducts,
  photos: PhotoEditorSelector.getSortedPhotos(state),
  orderableImages: PhotoOrderSelector.getOrderableImages(state),
});

const mapDispatchToProps = (dispatch) => ({
  exitApp: () => dispatch(UIActions.exitApp()),
  requestGetPlusProducts: () =>
    dispatch(AppInfoActions.requestGetPlusProducts()),
  requestGetOrderingServerUrl: () =>
    dispatch(AppInfoActions.requestGetOrderingServerUrl()),
  requestCreateOrder: (args) =>
    dispatch(PhotoOrderActions.requestCreateOrder(args)),
  requestAddToCart: (args) =>
    dispatch(PhotoOrderActions.requestAddToCart(args)),
});

PhotoOrder = connect(mapStateToProps, mapDispatchToProps)(PhotoOrder);

export default PhotoOrder;
