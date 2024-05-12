<%@Language="VBScript" CODEPAGE="65001" %>

<%	
	Response.CharSet="utf-8"
	Session.codepage="65001"
	Response.codepage="65001"
	Response.ContentType="text/html;charset=utf-8"
%> 
<!-- #include virtual="/include/common.asp"-->
<%
	Dim EzBool
	EzBool=false
	typemode = Request("typemode")
	EzBool = Request("EzBool")
	userid = Request("userid")
	
	if userid <> "" then
		Coouserid=userid
	end if
%>
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <link rel="shortcut icon" href="public/logo_32.png" />
    <meta name="google" content="notranslate">    
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"   />
    <meta name="theme-color" content="#000000" />

    <link rel="manifest" href="public/manifest.json" />

    <title>Photomon Print</title>
    
    <script type="text/javascript">
      let AppUserId = '<%=Coouserid %>';
      let AppOrderKey = '<%=Cart_cookie %>';
      let AppOrderType = '<%=typemode %>';
      let AppPFYoonMode = '';
      let EzwelBool = '<%=EzBool%>';
    </script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script src="photomon_photoprint_app.js?<%=replace(date,"-","") %>"></script>
	<%
if typemode="classic" then
	' GTM 아이디 암호화 전송
	if Coouserid <> "" Then
		gtm_cd1 = uEncode_Base64(Coouserid)	
		gtm_cd1 = AESEncrypt(gtm_cd1, "gtmdataLayer")
		
		gtm_cd4= ""
		if instr(CooUserid, "kakao@") > 0 Then
			gtm_cd4 = "K"
		Elseif instr(CooUserid, "naver@") > 0 Then
			gtm_cd4 = "N"
		Elseif instr(CooUserid, "@") <= 0 AND len(CooUserid) > 15 Then		
			gtm_cd4 = "F"		
		Else
			gtm_cd4 = "A"
		End if
%>
<!-- ########################### -->
<!-- new Google Tag Manager  19.12.10 -->
<!-- ########################### -->
<script>
//로그인을 한 경우에만 아래의 코드를 실행.
window.dataLayer = window.dataLayer || [];
dataLayer.push({
"cd1": "<%=gtm_cd1 %>",		 // 고객 회원 번호
"cd2": "-", 					// 연령대 (ex. 10, 20, 30, 40, 50), 정보가 없을 경우 "-"
"cd3": "-", 					// 성별 (ex. 여성: F, 남성: M), 정보가 없을 경우 "-"
"cd4": "<%=gtm_cd4 %>", 		// 회원가입 유형 (ex. 직접 가입: A, 카카오: K, 네이버: N, 페이스북: F)
"cd5": "pc"					 // 기기 카테고리 (ex. pc, mobile, app) - 소문자
});
</script>
<% end if %>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WXN55V');</script>
<!-- End Google Tag Manager -->

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="//www.googletagmanager.com/ns.html?id=GTM-WXN55V" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<%end if%>
  </body>
</html>
