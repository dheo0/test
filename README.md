## Node 버전 맞춰야 합니다.

v14.17.0

## 로컬에서 실행

`npm run start`

## 작업할 내용

현재 pc와 mobile 적응형으로 제작중이며
메인화면에서 사진추가히기 > 스마트박스 이용하기 > 스마트박스 이용하기 버튼을 누르면
업로드된 사진들을 확인할 수 있으며 이 부분을 인피니티 스크롤로 바꾸는 작업이 필요합니다.

## 관련파일

화면은 SmartboxUploader.jsx 고
SmartboxSaga.js 파일 getPhotosSaga 에서 처리합니다.

api 명세서는 없습니다...
getPhotosSaga 에서 보시면 payload offset 이 1로 설정되어있는데
1번째 게시물 부터 limit 50개 까지 가져와서 화면에 출력해주는 형태입니다.
그래서 다음페이지를 불러올러면 offset 값이 51, 101, 151... 이런형태로 offset 값이 변경되어
불러와지면 되는 형태입니다.