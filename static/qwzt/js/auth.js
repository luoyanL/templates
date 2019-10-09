/**
 * OAuth2的token认证模式,客户端JS
 *
 * 场景：如果需要控制某静态页面，必须先登陆才能访问。那么就在该静态页面的头部引入该文件。
 *
 */

// Oauth2 统一授权中心的项目地址
var oauthServerUrl = "http://" + window.location.host + "/wxqyh";

// Step:1 配置参数
var oauthConfig = {
    // 授权申请地址(个人用户:isPortal=true 管理员用户授权地址：isPortal=false )
    "userAuthorizationUri": oauthServerUrl + "/oauth2/authorize.do",
    // 解析access_token的地址
    "userInfoUri": oauthServerUrl + "/oauth2/user.do",
    // 检查access_token的有效性
    "checkTokenAccessUri": oauthServerUrl + "/oauth2/checkToken.do",
    // 获取令牌的地址
    "accessTokenUri": oauthServerUrl + "/oauth2/token.do",
    // 客户端ID
    "clientId": "dqsf-webapp",
    // 客户端密钥
    "clientSecret": "63b73b64918e4424ad85acea1b6cbec4",
    // 资源拥有者的身份认证类型
    //  0 管理员账号密码认证; 1 个人用户账号密码认证
    //  2 管理员二维码认证;   3 个人用户二维码认证
    //  4 个人用户微信移动端认证
    "authType": 4,
};
var setCookies = function (name, value, expiresIn) {
    var exp = new Date();
    exp.setTime(exp.getTime() + expiresIn);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
};
var getCookies = function (name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg)) {
        return unescape(arr[2]);
    }
    return null;
};

// Step:2 如果存在hash参数，就尝试解析得到access_token
if (window.location.hash != "") {
    var oauthParams = {};
    var queryString = location.hash.substring(1), regex = /([^&=]+)=([^&]*)/g, m;
    while (m = regex.exec(queryString)) {
        oauthParams[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    if (oauthParams['access_token'] != null) {
        setCookies('Authorization', oauthParams['access_token'], oauthParams['expiresIn']);
    }
}
// Step:3 如果没认证,就请求授权中心进行认证
if (getCookies('Authorization') == null) {
    window.location.replace(oauthConfig.userAuthorizationUri + "?authType=" + oauthConfig.authType + "&responseType=token&redirectUri=" + document.URL + "&clientId=" + oauthConfig.clientId + "&clientSecret=" + oauthConfig.clientSecret);
}
