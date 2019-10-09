var vipUrl=baseURL+'/qiweipublicity/companysrv/vip/vip_index.jsp'; //银卡购买链接
var goldVipUrl=baseURL+'/qiweipublicity/companysrv/vip/vip_gold_index.jsp'; //金卡购买链接
var onTrialVipUrl=openURL+'/open/form/add.jsp?id=49dfc058-7afb-4d55-86e9-f431690e4eec&corp_id=&agentCode=form';//申请试用链接

//银卡VIP
function getSilverVipURL(){
	if(isQuDao() && !showQw()){
		return "";
	}
	return vipUrl;
}

/**
 * 判断是不是老用户：2017-08-01前注册的用户
 * @returns {boolean}
 */
function isOldUserVip(){
	var registerTime = wxqyhConfig.orgConfigInfo.createTime;
	if(registerTime && ""!=registerTime){
		var oldDate = new Date(Date.parse("2017-08-01 00:00:00".replace(/-/g, "/")));
		var registerDate = new Date(Date.parse(registerTime.replace(/-/g, "/")));
		if(registerDate<oldDate){
			return true;
		}
		return false;
	}
	return true;
}

/**
 * 金卡接口
 * @type {string}
 */
var interfaceCode = {
    INTERFACE_CODE_NULL : "null",
	INTERFACE_CODE_NONE:"none",
	INTERFACE_CODE_ADDRESSBOOK:"addressbook",
	INTERFACE_CODE_MEET:"meet",
	INTERFACE_CODE_LEARN:"learn",
	INTERFACE_CODE_CHECKOUT:"checkout",
	INTERFACE_CODE_CHECKWORK:"checkwork",
	INTERFACE_CODE_OUTSIDEWORK:"outsidework",
	INTERFACE_CODE_FORM:"form",
	INTERFACE_CODE_PRIME:"prime",
	INTERFACE_CODE_QYDISK:"qydisk",
	INTERFACE_CODE_REIMBURSEMENT:"reimbursement",
	INTERFACE_CODE_SETTING:"setting",
	INTERFACE_CODE_CAR:"car",
	INTERFACE_CODE_DYNAMIC:"dynamic",
	INTERFACE_CODE_TOPIC:"topic",
	INTERFACE_CODE_PRODUCTINFO:"productinfo",
	INTERFACE_CODE_TASK:"task",
	INTERFACE_CODE_SURVEY:"survey",
	INTERFACE_CODE_ACTIVITY:"activity",
	INTERFACE_CODE_EXAMINATION:"examination",
	INTERFACE_CODE_CRM:"crm",
	INTERFACE_CODE_DIARY:"diary",
	INTERFACE_CODE_HR:"hr",
    INTERFACE_CODE_PARTYCONSTRUCTION:"partyconstruction",
    INTERFACE_CODE_ASK:"ask",
    INTERFACE_CODE_MOVEAPPROVE:"moveapprove",
    INTERFACE_CODE_SALE:"sale",
    INTERFACE_CODE_CRMMINI:"crmmini"
};

/**
 * 特殊应用集合
 */
var specialInterface = [
    'partyconstruction',
    'checkout'
]

/**
 * 判断是否拥有VIP权限
 * @param permissionCodes 多个用“,”隔开
 */
function hasVipPermission(permissionCodes){
	if(!permissionCodes || ""==permissionCodes || null==permissionCodes){
		return false;
	}
	var basePermissionList = wxqyhConfig.basePermissionList;
	if(!basePermissionList || basePermissionList.length<=0){
		return false;
	}
	var orgPermissionList = wxqyhConfig.orgPermissionList;
	var hasPms = false;
	var permissionArray = permissionCodes.split(",");
	var permissionCode;
	var baseVipPmsVO;
	for(var i=0;i<permissionArray.length;i++){
		permissionCode=permissionArray[i];
		for(var key in basePermissionList){
			if(key==permissionCode){
				baseVipPmsVO = basePermissionList[key];
				//金卡接口权限
				if("1"==baseVipPmsVO.permissionType){
					if(isVipGold(baseVipPmsVO.permissionCode)){
						return true;
					}
				}
				//根据等级判断
				if(wxqyhConfig.vip_grade >= baseVipPmsVO.grade){
					return true;
				}
				//根据白名单判断VIP权限
				for(var myKey in orgPermissionList){
					if(myKey == key){
						return true;
					}
				}
			}
		}
	}
	return hasPms;
}

/**
 * 是不是VIP，银卡以上都包括
 * @returns {boolean}
 */
function isVipSilver(myInterfaceCode){
    //判断是否是特殊应用
    if(specialInterface.indexOf(myInterfaceCode)!=-1){
        return canAccessInterface(myInterfaceCode);
    }
    if(wxqyhConfig.vip_grade>=1){
        return true;
    }
    myInterfaceCode = getPmsCode(myInterfaceCode);
    return canAccessInterface(myInterfaceCode); //判断是否购买部分金卡应用
}

/**
 * 获取应用的权限code
 */
function getPmsCode(myInterfaceCode) {
    //如果没有传递权限值，获取当前页面的应用作为权限制,如果错误的权限，用金卡套餐的
    if (!myInterfaceCode) {
        myInterfaceCode = agentCode || interfaceCode.INTERFACE_CODE_PRIME;
    }

    //如果权限制为HR的agentCode,需要转换
    //部分agentCode不等于ifCode,需要转换
	var agenCodeObj = {
        "addressBook": interfaceCode.INTERFACE_CODE_ADDRESSBOOK,
        "hrmanagement": interfaceCode.INTERFACE_CODE_HR,
        "learnonline": interfaceCode.INTERFACE_CODE_LEARN,
        "meetingassistant": interfaceCode.INTERFACE_CODE_MEET
	}
    if (agenCodeObj[myInterfaceCode]) {
        myInterfaceCode = agenCodeObj[myInterfaceCode]
    }

    return myInterfaceCode;
}

/**
 * 判断是不是金卡VIP,金卡以上的都包括
 * @param myInterfaceCode,请参照文档中的interfaceCode
 * @returns {boolean}
 */
function isVipGold(myInterfaceCode){
    //判断是否是特殊应用
    if(specialInterface.indexOf(myInterfaceCode)!=-1){
        return canAccessInterface(myInterfaceCode);
    }
    if(wxqyhConfig.vip_grade>=2){
        return true;
    }
    myInterfaceCode = getPmsCode(myInterfaceCode);
    //如果购买了部分模块，
    return canAccessInterface(myInterfaceCode);
}

/**
 * 是否拥有某个金卡特权
 * @param myInterfaceCode
 * @returns {boolean}
 */
function canAccessInterface(myInterfaceCode) {
    if (interfaceCode.INTERFACE_CODE_NULL == myInterfaceCode) {
        myInterfaceCode = interfaceCode.INTERFACE_CODE_SETTING;
    }
    if(myInterfaceCode && ""!=myInterfaceCode){
        if(wxqyhConfig.myInterfaceList && wxqyhConfig.myInterfaceList.length>0){
            for(var i=0;i<wxqyhConfig.myInterfaceList.length;i++){
                if(interfaceCode.INTERFACE_CODE_PRIME == wxqyhConfig.myInterfaceList[i].interfaceCode){
                    return true;
                }
                if(myInterfaceCode == wxqyhConfig.myInterfaceList[i].interfaceCode){
                    return true;
                }
            }
        }
    }
    return false;
}

//是不是渠道
function isQuDao(){
	wxqyhConfig.ready(function(){
		if(wxqyhConfig.orgConfigInfo && wxqyhConfig.orgConfigInfo.isCooperation && "1"==wxqyhConfig.orgConfigInfo.type){
			return true;
		}
		return false;
	});
}

//显示企微信息
function showQw(){
	if(!isQuDao()){
		return true;
	}
	if("0"==wxqyhConfig.orgConfigInfo.isShowQw){
		return false;
	}
	return true;
}

//判断当前用户是不是vip
var isQwVip=function(isCallback,noCallback){
	var actionURL=baseURL+"/portal/vipPortalAction!isQwVip.action";
	var isVip;
	$.ajax({
		url:actionURL,
		type:"post",
		dataType:"json",
		async: false,
		success:function(result){
			if(result.code=="0"){
				if(result.data.isVip){
					isCallback && isCallback.call(isCallback, null, null);
					isVip = true;
				}else{
					noCallback && noCallback.call(noCallback, null, null);
					isVip =  false;
				}
			}else{
				isVip =  false;
			}
		},
		error: function () {
			_alert("提示","网络错误");
		}
	});
	return isVip;
}

//判断当前用户是不是金卡VIP以上
var isQwOverGoldVip=function(isCallback,noCallback){
	var actionURL=baseURL+"/portal/vipPortalAction!isOverGoldVIP.action";
	var isOverGoldVip;
	$.ajax({
		url:actionURL,
		type:"post",
		dataType:"json",
		async: false,
		success:function(result){
			if(result.code=="0"){
				if(result.data.isOverGoldVIP){
					isCallback && isCallback.call(isCallback, null, null);
					isOverGoldVip = true;
				}else{
					noCallback && noCallback.call(noCallback, null, null);
					isOverGoldVip =  false;
				}
			}else{
				isOverGoldVip =  false;
			}
		},
		error: function () {
			_alert("提示","网络错误");
		}
	});
	return isOverGoldVip;
}
//银卡弹框提示
function _alertVip(functionName){
	if(isQuDao()){
		_alert("提示","该功能仅限VIP会员使用");
		return;
	}
	if(!functionName){
		_alert("提示","该功能仅限VIP用户使用");
		return;
	}
	_alert("提示",functionName+"功能仅限VIP用户使用");
}


//获取注册到现在的天数
function getRegistDays(){
	var registerTime = wxqyhConfig.orgConfigInfo.createTime;
	if(registerTime && ""!=registerTime){
		var startTime = new Date(Date.parse(registerTime.replace(/-/g,   "/"))).getTime();
		var endTime = new Date().getTime();
		var dates = Math.abs((startTime - endTime))/(1000*60*60*24);
		return dates;
	}
	return 1000000;
}

/**
 *  外部分享限制条件
 */
function checkOpenShare() {
	if (!wxqyhConfig.is_qiweiyun) {
		return true;
	}
	if (wxqyhConfig.is_in_vip_white_list) {
		return true;
	}
	if (wxqyhConfig.open_share_rule.auhenCheck && !wxqyhConfig.is_authen_org) {
		_alert("提示","你的企业微信未进行认证，不允许发外部分享信息","确定",function(){restoreSubmit();});
		return false;
	}
	if (wxqyhConfig.open_share_rule.vipCheck && !wxqyhConfig.is_pay_vip) {
		_alert("提示","你的企业微信还不是VIP会员，不允许发外部分享信息","确定",function(){restoreSubmit();});
		return false;
	}
	var followUserLimit = wxqyhConfig.open_share_rule.followUser;
	if (wxqyhConfig.follow_user_member < followUserLimit) {
		_alert("提示","你的企业微信关注人数少于" + followUserLimit + "人，不允许发外部分享信息","确定",function(){restoreSubmit();});
		return false;
	}
	var registerDayLimit = wxqyhConfig.open_share_rule.registerDayLimit;
	if(getRegistDays() < registerDayLimit){
		_alert("提示","你的企业微信接入时间不足" + registerDayLimit + "天，不允许发外部分享信息","确定",function(){restoreSubmit();});
		return false;
	}
	return true;
}