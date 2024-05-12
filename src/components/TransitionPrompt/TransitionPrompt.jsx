import React from 'react';
import { useSelector } from 'react-redux'
import { useBeforeunload } from 'react-beforeunload';

import UISelector from '../../selectors/UISelector'

function TransitionPrompt() {
  const isExitingApp = useSelector(UISelector.isExitingApp);

  useBeforeunload(() => {
    if (isExitingApp) { return true }
    return "페이지를 나가시겠습니까?"
  });

  return (
    <div id="prompt-dummy" />
  );
}

export default TransitionPrompt
