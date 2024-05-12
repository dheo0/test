<%@Language="VBScript" CODEPAGE="65001" %>

<%	
	Response.CharSet="utf-8"
	Session.codepage="65001"
	Response.codepage="65001"
	Response.ContentType="text/html;charset=utf-8"
%> 
<!-- #include virtual="/include/common.asp"-->
<%
	typemode = Request("typemode")
	userid = Request("userid")
%>
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <link rel="shortcut icon" href="public/logo_32.png" />
    <meta name="google" content="notranslate">  
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <meta name="theme-color" content="#000000" />

    <link rel="manifest" href="public/manifest.json" />

    <title>photo factory yoon</title>
    
    <script type="text/javascript">
      let AppUserId = '<%=userid %>';
      let AppOrderKey = '<%=Cart_cookie %>';
      let AppOrderType = '<%=typemode %>';
      let AppPFYoonMode = 'true';
      let EzwelBool = 'false';
    </script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script src="photomon_photoprint_app.js"></script>
  </body>
</html>
