var qwyRegister = (function (my) {
  my = {};

  var adminNemeReg = /^.{1,32}$/;
  var adminMobileReg = /^\d{11}$/;
  var corpNameReg = /^[-_()a-zA-Z0-9\u4e00-\u9fa5]{1,30}$/;
  $(".register_inputText").focus(function () {
    $(this).siblings(".js_error_msg").hide();
    $(this).siblings(".register_input_msg").show();
    $(this).parent(".register_column_item_field").removeClass("error");
  })
  $("#admin_name").blur(function () {
    registerItemTest(adminNemeReg, "admin_name");
  })
  $("#admin_mobile").blur(function () {
    registerItemTest(adminMobileReg, "admin_mobile");
  })
  $("#corp_name").blur(function () {
    registerItemTest(corpNameReg, "corp_name");
  })

  //获取模板id
  if(getParam("templateId")){
      $("#templateId").val(getParam("templateId"));
  } else {
      $("#templateId").val("tplc4966f276e487680");
  }

  $("#SourceIp").val(returnCitySN["cip"]);

  //验证注册信息
  function registerTest() {
    var adminNameFlag = registerItemTest(adminNemeReg, "admin_name");
    var adminMobileFlag = registerItemTest(adminMobileReg, "admin_mobile");
    var corpNameFlag = registerItemTest(corpNameReg, "corp_name");
    if (adminNameFlag && adminMobileFlag && corpNameFlag) {
      $("#submitBtn").attr("disabled", "disabled");
      return true;
    } else {
      return false;
    }
  }

  function registerItemTest(reg, el) {
    if (!reg.test($("#" + el).val())) {
      $("#" + el).siblings(".js_error_msg").show();
      $("#" + el).siblings(".register_input_msg").hide();
      $("#" + el).parent(".register_column_item_field").addClass("error");
      return false;
    }
    return true;
  }

  my.registerTest = registerTest;
  return my;
})(qwyRegister || {})
