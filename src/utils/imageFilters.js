import _ from 'lodash';

const __filters = {
  ORIGINAL: {
    key: 'original',
    value: '원본',
  },
  CLEAR: {
    key: 'clear',
    value: '선명함',
  },
  SEPIA: {
    key: 'sepia',
    value: '세피아',
  },
  BLUE: {
    key: 'blue',
    value: '블루'
  },
  GREEN: {
    key: 'green',
    value: '그린',
  },
  BW: {
    key: 'bw',
    value: '흑백',
  },
};

export const Filters = _.values(__filters);

const FilterImpls = {};

const RGB_ADJ_THRESHOLD = 235;

export function Filter({ photo, filter, width, height }, cb = () => {}) {
  // 가상의 캔버스 생성
  const canvas = document.createElement("canvas");
  const context = canvas.getContext('2d');

  const img = new Image();
  img.crossOrigin = 'Anonymous';

  img.onload = function() {
    // 사진의 축소된 썸네일 생성
    const [thumbWidth, thumbHeight] = (() => {
      const photoRatio = photo.getRatio();
      const _width = _.isNil(width) ? photo.getLongestSide() : width;
      const _height = _.isNil(height) ? photo.getLongestSide() : height;
      if (photo.isPortrait()) {
        return [
          Math.min(_width * photoRatio, +photo.width),
          Math.min(_height, +photo.height),
        ];
      }
      return [
        Math.min(_width, +photo.width),
        Math.min(_height * photoRatio, +photo.height),
      ];
    })();

    // 가상의 캔버스에 영역을 잡아주고, 그려줌
    context.canvas.width = thumbWidth;
    context.canvas.height = thumbHeight;
    context.drawImage(img, 0, 0, thumbWidth, thumbHeight);

    // 원하는 크기만큼 줄인 뒤에 데이터(bytes[])를 가져옴
    const pixels = FilterImpls.getPixels(img, thumbWidth, thumbHeight);
    // 요청한 필터명(filter)의 필터가 존재하면 해당 필터를 실행하고, 없다면 아무 작업도 하지 않음
    const imgPixels = (FilterImpls[filter.key] || ((v) => v))(pixels);

    context.putImageData(imgPixels, 0, 0, 0, 0, photo.width, photo.height);

    cb(context.canvas.toDataURL());
  };

  img.src = photo.src;
}

// 이미지를 원하는 사이즈만큼 줄인 뒤(resize) 데이터(bytes[])를 가져옴
FilterImpls.getPixels = function(img, resultWidth, resultHeight) {
  const canvas = document.createElement('canvas');
  canvas.width = resultWidth;
  canvas.height = resultHeight;
  const context = canvas.getContext('2d');
  context.drawImage(img, 0, 0, resultWidth, resultHeight);
  return context.getImageData(0,0, canvas.width, canvas.height);
};

// 밝기를 조절하는 함수
// 각 픽셀의 r, g, b 값에 delta(adjustment)만큼 더하여 밝게 만듦
FilterImpls.brightness = function(pixels, adjustment = 0) {
  if (adjustment !== 0) {
    const d = pixels.data;
    for (let i=0; i<d.length; i+=4) {
      d[i] = _.clamp(d[i] + adjustment, 0, 255);
      d[i + 1] = _.clamp(d[i + 1] + adjustment, 0, 255);
      d[i + 2] = _.clamp(d[i + 2] + adjustment, 0, 255);
    }
  }
  return pixels;
};

// 대비를 조절하는 함수
// 각 픽셀의 r, g, b 값에 delta(adjustment)만큼 곱하여 색상의 차이가 더 도드라지게 만듦
FilterImpls.contrast = function(pixels, adjustment = 1.0) {
  if (adjustment !== 0) {
    const d = pixels.data;
    for (let i=0; i<d.length; i+=4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];

      d[i] = _.clamp((((((r / 255.0) - 0.5) * adjustment) + 0.5) * 255.0), 0, 255);
      d[i + 1] = _.clamp((((((g / 255.0) - 0.5) * adjustment) + 0.5) * 255.0), 0, 255);
      d[i + 2] = _.clamp((((((b / 255.0) - 0.5) * adjustment) + 0.5) * 255.0), 0, 255);
    }
  }
  return pixels;
};

// 색상필터를 적용하는 함수
// 색상필터는 각 픽셀의 r, g, b 값 중 어느 것의 밝기나 대비를 높이거나 줄일지를 설정함
// overallBrightnessAdjustment: r, g, b 모든 채널의 전반적인 밝기
// colorAdjustmentR: r 값의 밝기 delta
// colorAdjustmentG: g 값의 밝기 delta
// colorAdjustmentB: b 값의 밝기 delta
// brightnessAdjustmentR: r 값의 대비 delta
// brightnessAdjustmentG: g 값의 대비 delta
// brightnessAdjustmentB: b 값의 대비 delta
// clamp(x, m, M) 함수는 x 값이 m보다 같거나 크고 M보다 같거나 작도록 해줌
FilterImpls.colorTint = function(
  pixels,
  options = {
    overallBrightnessAdjustment: 0,
    colorAdjustmentR: 1.0,
    colorAdjustmentG: 1.0,
    colorAdjustmentB: 1.0,
    brightnessAdjustmentR: 0,
    brightnessAdjustmentG: 0,
    brightnessAdjustmentB: 0,
  },
  threshold = RGB_ADJ_THRESHOLD,
  weightR = 1,
  weightG = 1,
  weightB = 1,
) {
  pixels = FilterImpls.brightness(pixels, options.overallBrightnessAdjustment);
  const d = pixels.data;

  const weightVR = _.clamp(weightR * 0.5, 0, 0.5);
  const weightVG = _.clamp(weightG * 0.5, 0, 0.5);
  const weightVB = _.clamp(weightB * 0.5, 0, 0.5);

  for (let i=0; i<d.length; i+=4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];

    d[i] = _.clamp(((((r / 255.0) - weightVR) * options.colorAdjustmentR) + weightVR) * 255.0, 0, 255);
    if (r < threshold) {
      d[i] = _.clamp(d[i] + options.brightnessAdjustmentR, 0, 255);
    }
    d[i + 1] = _.clamp(((((g / 255.0) - weightVG) * options.colorAdjustmentG) + weightVG) * 255.0, 0, 255);
    if (g < threshold) {
      d[i + 1] = _.clamp(d[i + 1] + options.brightnessAdjustmentG, 0, 255);
    }
    d[i + 2] = _.clamp(((((b / 255.0) - weightVB) * options.colorAdjustmentB) + weightVB) * 255.0, 0, 255);
    if (b < threshold) {
      d[i + 2] = _.clamp(d[i + 2] + options.brightnessAdjustmentB, 0, 255);
    }
  }
  return pixels;
};

// 대비를 1.5배 증폭시키는 필터
FilterImpls[__filters.CLEAR.key] = function(pixels) {
  return FilterImpls.contrast(pixels, 1.5);
};

// 세피아 효과
// r  값 및 g 값을 특히 더 조정 함
FilterImpls[__filters.SEPIA.key] = function(pixels) {
  // const adjustment = 2;
  // const adjustmentSub = 1.2;
  //
  // pixels = FilterImpls.brightness(pixels, -18);
  // const d = pixels.data;
  // for (let i=0; i<d.length; i+=4) {
  //   const r = d[i];
  //   const g = d[i + 1];
  //   const b = d[i + 2];
  //
  //   d[i] = _.clamp((r * 0.393) + (g * 0.769) + (b * 0.189), 0, 255);
  //   d[i] = _.clamp((((((d[i] / 255.0) - 0.5) * adjustment) + 0.5) * 255.0), 0, 255);
  //   d[i + 1] = _.clamp((r * 0.349) + (g * 0.686) + (b * 0.168), 0, 255);
  //   d[i + 1] = _.clamp((((((d[i + 1] / 255.0) - 0.5) * adjustmentSub) + 0.5) * 255.0), 0, 255);
  //   d[i + 2] = _.clamp((r * 0.272) + (g * 0.534) + (b * 0.131), 0, 255);
  // }
  // return pixels;
  return FilterImpls.colorTint(FilterImpls.contrast(pixels, 0.76), {
    overallBrightnessAdjustment: 10,
    colorAdjustmentR: 1.4,
    colorAdjustmentG: 1.1,
    colorAdjustmentB: 1.0,
    brightnessAdjustmentR: 5,
    brightnessAdjustmentG: 0,
    brightnessAdjustmentB: -10,
  }, 250, 0.5, 2.0, 2.0);
};

// 파란 느낌을 내는 필터
// 상기의 색상필터를 활용함
FilterImpls[__filters.BLUE.key] = function(pixels) {
  return FilterImpls.colorTint(FilterImpls.contrast(pixels, 0.7), {
    overallBrightnessAdjustment: 0,
    colorAdjustmentR: 1.05,
    colorAdjustmentG: 1.2,
    colorAdjustmentB: 1.7,
    brightnessAdjustmentR: -2,
    brightnessAdjustmentG: -10,
    brightnessAdjustmentB: 0,
  }, 250, 2.0, 1.7, 0.25);
};

// 초록 느낌을 내는 필터
// 상기의 색상필터를 활용함
FilterImpls[__filters.GREEN.key] = function(pixels) {
  return FilterImpls.colorTint(FilterImpls.contrast(pixels, 0.7), {
    overallBrightnessAdjustment: 0,
    colorAdjustmentR: 0.45,
    colorAdjustmentG: 1.25,
    colorAdjustmentB: 1.15,
    brightnessAdjustmentR: 0,
    brightnessAdjustmentG: 9,
    brightnessAdjustmentB: 10,
  }, 250, 3.0, 0.7, 0.2);
};

// 흑백필터
// 각 픽셀의 r, g, b 값을 각 값의 평균으로 만듦.
FilterImpls[__filters.BW.key] = function(pixels) {
  const d = pixels.data;
  for (let i=0; i<d.length; i+=4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    d[i] = d[i+1] = d[i+2] = v
  }
  return pixels;
};
