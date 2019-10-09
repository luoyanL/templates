(function() {
  var $, Calendar, DAYS, DateRangePicker, MONTHS, TEMPLATE;

  $ = jQuery;

  var sTime ,eTime, sDate, eDate, sWeek, eWeek; // 查询的开始时间，结束时间。导出文件命名开始和结束时间 开始周和结束周
  var timeText; // 选择后显示界面的text
  var select;
  var sValue, eValue;
  var type;  // 规则类型

  DAYS = ['日', '一', '二', '三', '四', '五', '六'];
  
  MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  TEMPLATE = "<div class=\"drp-popup qwjs-drp-popup\">\n   <div class=\"drp-calendars\">\n    <div class=\"drp-calendar drp-calendar-start\">\n      <div class=\"drp-month-picker\">\n        <div class=\"drp-arrow\"><</div>\n        <div class=\"drp-month-title\"></div>\n        <div class=\"drp-arrow drp-arrow-right\">></div>\n      </div>\n      <ul class=\"drp-day-headers\"></ul>\n      <ul class=\"drp-days\"></ul>\n      </div>\n    <div class=\"drp-calendar-separator\"></div>\n    <div class=\"drp-calendar drp-calendar-end\">\n      <div class=\"drp-month-picker\">\n        <div class=\"drp-arrow\"><</div>\n        <div class=\"drp-month-title\"></div>\n        <div class=\"drp-arrow drp-arrow-right\">></div>\n      </div>\n      <ul class=\"drp-day-headers\"></ul>\n      <ul class=\"drp-days\"></ul>\n       </div>\n  </div>\n  <div class=\"drp-tip\"></div>\n <div class=\"drp-popup-btn\">\n <input type=\"button\" value=\"确定\" class=\"btn orangeBtn twoBtn  mr10\" id=\"applyBtn\">\n  </div></div> ";

  DateRangePicker = (function() {
    function DateRangePicker($select) {
	      this.$select = $select;
          select = this.$select;
	      this.$dateRangePicker = $(TEMPLATE);
	      /*this.$select.attr('tabindex', '-1').before(this.$dateRangePicker);*/
	      this.$select.attr('tabindex', '-1');
	      $('body').append(this.$dateRangePicker)
          this.$dateRangePicker.css({
              'left':$select.offset().left-$select.width(),
              'top':$select.offset().top+$select.outerHeight()+2
          })
	      this.isHidden = true;
	      this.customOptionIndex = this.$select[0].length - 1;
	      this.initBindings();
	      this.setRange(this.$select.val());
    }

    DateRangePicker.prototype.initBindings = function() {
      var self;
      self = this;
      this.$select.on('focus mousedown', function(e) {
        var $select;
        $select = this;
        setTimeout(function() {
          return $select.blur();
        }, 0);
        return false;
      });
      this.$dateRangePicker.click(function(evt) {
        return evt.stopPropagation();
      });
      $('body').on('click',function(evt) {
        if (evt.target === self.$select[0] && self.isHidden) {
        	$(self)[0].$dateRangePicker.css({
        		'left':$(evt.target).offset().left-$(self.$select).width(),
        		'top':$(evt.target).offset().top+$(self.$select).outerHeight()+2
        	})
          self.show();
            if(dateStart&&dateEnd) {
                initTime(new Date(dateStart), new Date(dateEnd));
                initDateText();
            }
        } else if (!self.isHidden) {
          return self.hide();
        }
      });
      return this.$dateRangePicker.find('#applyBtn').click(function(evt){
          if(!sTime && !eTime) {
            initTime(new Date(), new Date());
          }
          if(type != ruleObj.rate) {
              initTime(sValue, eValue);
          }
          initDateText();
          self.showCustomDate();
          if (!self.isHidden) {
              return self.hide();
          }
      })

      this.$select.children().each(function() {
        return self.$dateRangePicker.find('.drp-timeline-presets').append($("<li class='" + ((this.selected && 'drp-selected') || '') + "'>" + ($(this).text()) + "<div class='drp-button'></div></li>"));
      });
      return this.$dateRangePicker.find('.drp-timeline-presets li').click(function(evt) {
        var presetIndex;
        $(this).addClass('drp-selected').siblings().removeClass('drp-selected');
        presetIndex = $(this).index();
        self.$select[0].selectedIndex = presetIndex;
        self.setRange(self.$select.val());
        if (presetIndex === self.customOptionIndex) {
          return self.showCustomDate();
        }
      });
    };
    function initDateText() {
        $('.qwjs-tab_stat').removeClass('active');
        $('.qwjs-datetime').addClass('dateactive');
        type = ruleObj.rate;
        startTime = sTime;
        endTime = eTime;
        startWeek = sWeek;
        endWeek = eWeek;
        startDateV = sDate;
        endDateV = eDate;
        select.val(timeText);
        var obj = $('.qwjs-datetime');
        var len = obj.val().length;
        var width = parseInt(len)*9;
        if(width<135) width=135;
        obj.css('width', width+'px');
        getStatList(1);
        _redraw('diaryStatList');
        _redraw('pageId');
        loadPageList();
        if(ruleObj.rate == 0) {
            $('.qwjs-leave').show();
        } else {
            $('.qwjs-leave').hide();
        }
    }
    DateRangePicker.prototype.hide = function() {
      this.isHidden = true;
      return this.$dateRangePicker.hide();
    };

    DateRangePicker.prototype.show = function() {
      this.isHidden = false;
      return this.$dateRangePicker.show();
    };

    DateRangePicker.prototype.showCustomDate = function() {
      this.$dateRangePicker.find('.drp-timeline-presets li:last-child').addClass('drp-selected').siblings().removeClass('drp-selected');
      initTime(this.startDate(), this.endDate());
      select = this.$select;
    };
    function initTime(startDate, endDate) {
        sValue = dateStart = startDate;
        eValue = dateEnd = endDate;
        if(ruleObj.rate == 0) {
            sTime = startDate.Format('yyyy-MM-dd');
            eTime = endDate.Format('yyyy-MM-dd');
            var sy = startDate.Format('yyyy');
            var ey = endDate.Format('yyyy');
            if(sy==ey&&sy==new Date().getFullYear()){ //选择的年份都是今年的
                text = startDate.Format('MM.dd') + '~' + endDate.Format('MM.dd');
            }else{
                text = startDate.Format('yyyy.MM.dd') + '~' + endDate.Format('yyyy.MM.dd');
            }
        } else if(ruleObj.rate == 1){
            var sy = startDate.Format('yyyy');
            var sm = startDate.Format('MM');
            var sd = startDate.Format('dd');
            var ey = endDate.Format('yyyy');
            var em = endDate.Format('MM');
            var ed = endDate.Format('dd');
            var sw = getWeekNumber(sy, sm , sd);
            var ew = getWeekNumber(ey, em , ed);
            // 计算所选日期的所在周开始和结束日期
            var dateS1 = dateFromWeek(sy,sw,0);
            var dateE1 = dateFromWeek(ey,ew,6);
            var sW1 = getWeekNumber(new Date(dateS1).Format('yyyy'), new Date(dateS1).Format('MM') ,new Date(dateS1).Format('dd')); // 开始日期所在周
            var eW1 = getWeekNumber(new Date(dateE1).Format('yyyy'), new Date(dateE1).Format('MM') ,new Date(dateE1).Format('dd')); // 结束日期所在周
            var yC = new Date(dateE1).Format('yyyy') - new Date(dateS1).Format('yyyy'); // 开始时间的年份和结束时间年份的差
            if(new Date(dateS1).Format('yyyy')!=new Date(dateE1).Format('yyyy')) { // 所选日期不在同一年
                var lastWeek = getWeekNumber(new Date(dateE1).Format('yyyy')-yC, '12', '31'); // 所选结束日期所在年的上一年的周数
                var lastDate = parseInt(new Date(dateE1).Format('yyyy'))-yC + '-12-31'; // 上一年最后一天
                if(sw==lastWeek&&new Date(lastDate).getDay()!=6){  // 开始时间所在周属于上一年最后一周和今年第一周，列为今年第一周
                    sy = parseInt(sy)+1;
                    sW1 = '01';
                    sw = 1;
                }else {
                    sW1 = sw;
                }
                if(ew==lastWeek&&new Date(lastDate).getDay()!=6){
                    ey = parseInt(ey)+1;
                    eW1 = '01';
                    ew = 1;
                }else {
                    eW1 = ew;
                }
            }
            sW1 = sW1.toString().length == 1 ? '0'+ sW1 : sW1;
            eW1 = eW1.toString().length == 1 ? '0'+ eW1 : eW1;
            sTime = sy + '|'+ sw;
            eTime = ey + '|'+ ew;
            // 导出命名
            sWeek = sW1;
            eWeek = eW1;
            sDate = new Date(dateS1).Format('yyyy.MM.dd');
            eDate = new Date(dateE1).Format('yyyy.MM.dd');
            var timeRange = '';
            if(new Date(dateS1).getFullYear()==new Date(dateE1).getFullYear()&&new Date(dateS1).getFullYear()==new Date().getFullYear()){
                timeRange = new Date(dateS1).Format('MM.dd') + '~'+ new Date(dateE1).Format('MM.dd');
            }else {
                timeRange = new Date(dateS1).Format('yyyy.MM.dd') + '~'+ new Date(dateE1).Format('yyyy.MM.dd');
            }
            text = sTime == eTime ? '第'+ sW1 + '周('+ timeRange + ')':
                '第'+ sW1 + '周-'+ '第'+ eW1 + '周('+ timeRange + ')';
        } else {
            sTime = startDate.Format('yyyy|M');
            eTime = endDate.Format('yyyy|M');
            // 导出文件命名
            sDate = startDate.Format('yyyy.MM');
            eDate = endDate.Format('yyyy.MM');
            text = sDate + '~' +  eDate;
        }
        timeText = text;
    }

    DateRangePicker.prototype.formatDate = function(d) {
    	var OMonth=d.getMonth()+1;
    	var ODate=d.getDate();
    	if(OMonth>0&&OMonth<=9){
    		OMonth= '0'+OMonth;
    	}
    	if(ODate>0&&ODate<=9){
    		ODate= '0'+ODate;
    	}
      return "" + (d.getFullYear().toString()) + "-" + (OMonth) + "-" + (ODate);
    };

    DateRangePicker.prototype.setRange = function(daysAgo) {
      var endDate, startDate;
     /* if (isNaN(daysAgo)) {
        return false;
      }*/
      if(daysAgo){
	      startDate = new Date($.trim(daysAgo.split('至')[0]));
	      endDate =  new Date($.trim(daysAgo.split('至')[1]));
	      daysAgo='';
	  }else{
	      endDate = new Date();
	      startDate = new Date();
	  };
      daysAgo -= 1;
      /*endDate = new Date();
      startDate = new Date();
      startDate.setDate(endDate.getDate());*/
      this.startCalendar = new Calendar(this, this.$dateRangePicker.find('.drp-calendar:first-child'), startDate, true);
      this.endCalendar = new Calendar(this, this.$dateRangePicker.find('.drp-calendar:last-child'), endDate, false);
      return this.draw();
    };

    DateRangePicker.prototype.endDate = function() {
      return this.endCalendar.date;
    };

    DateRangePicker.prototype.startDate = function() {
      return this.startCalendar.date;
    };

    DateRangePicker.prototype.draw = function() {
      this.startCalendar.draw();
      return this.endCalendar.draw();
    };

    return DateRangePicker;

  })();

  Calendar = (function() {
    function Calendar(dateRangePicker, $calendar, date, isStartCalendar) {
      var self;
      this.dateRangePicker = dateRangePicker;
      this.$calendar = $calendar;
      this.date = date;
      this.isStartCalendar = isStartCalendar;
      self = this;
      this.date.setHours(0, 0, 0, 0);
      this._visibleMonth = this.month();
      this._visibleYear = this.year();
      this.$title = this.$calendar.find('.drp-month-title');
      this.$dayHeaders = this.$calendar.find('.drp-day-headers');
      this.$days = this.$calendar.find('.drp-days');
      this.$dateDisplay = this.$calendar.find('.drp-calendar-date');
      $calendar.find('.drp-arrow').click(function(evt) {
        if ($(this).hasClass('drp-arrow-right')) {
          self.showNextMonth();
        } else {
          self.showPreviousMonth();
        }
        return false;
      });
    }

    Calendar.prototype.showPreviousMonth = function() {
      if (this._visibleMonth === 1) {
        this._visibleMonth = 12;
        this._visibleYear -= 1;
      } else {
        this._visibleMonth -= 1;
      }
      return this.draw();
    };

    Calendar.prototype.showNextMonth = function() {
      if (this._visibleMonth === 12) {
        this._visibleMonth = 1;
        this._visibleYear += 1;
      } else {
        this._visibleMonth += 1;
      }
      return this.draw();
    };

    Calendar.prototype.setDay = function(day) {
      this.setDate(this.visibleYear(), this.visibleMonth(), day);
      return this.dateRangePicker.showCustomDate();
    };

    Calendar.prototype.setDate = function(year, month, day) {
      this.date = new Date(year, month - 1, day);
      return this.dateRangePicker.draw();
    };

    Calendar.prototype.draw = function() {
      var day, _i, _len;
      this.$dayHeaders.empty();
      this.$title.text("" + (this.nameOfMonth(this.visibleMonth())) + " " + (this.visibleYear()));
      for (_i = 0, _len = DAYS.length; _i < _len; _i++) {
        day = DAYS[_i];
        this.$dayHeaders.append($("<li>" + (day) + "</li>"));
      }
      this.drawDateDisplay();
      return this.drawDays();
    };

    Calendar.prototype.dateIsSelected = function(date) {
      return date.getTime() === this.date.getTime();
    };

    Calendar.prototype.dateIsInRange = function(date) {
      return date >= this.dateRangePicker.startDate() && date <= this.dateRangePicker.endDate();
    };

    Calendar.prototype.dayClass = function(day, firstDayOfMonth, lastDayOfMonth) {
      var classes, date;
      date = new Date(this.visibleYear(), this.visibleMonth() - 1, day);
      classes = '';
      if (this.dateIsSelected(date)) {
        classes = 'drp-day-selected';
      } else if (this.dateIsInRange(date)) {
        classes = 'drp-day-in-range';
        if (date.getTime() === this.dateRangePicker.endDate().getTime()) {
          classes += ' drp-day-last-in-range';
        }
      } else if (this.isStartCalendar) {
        if (date > this.dateRangePicker.endDate()) {
          classes += ' drp-day-disabled';
        }
      } else if (date < this.dateRangePicker.startDate()) {
        classes += ' drp-day-disabled';
      }
      if ((day + firstDayOfMonth - 1) % 7 === 0 || day === lastDayOfMonth) {
        classes += ' drp-day-last-in-row';
      }
      return classes;
    };

    Calendar.prototype.drawDays = function() {
      var firstDayOfMonth, i, lastDayOfMonth, self, _i, _j, _ref;
      self = this;
      this.$days.empty();
      firstDayOfMonth = this.firstDayOfMonth(this.visibleMonth(), this.visibleYear());
      lastDayOfMonth = this.daysInMonth(this.visibleMonth(), this.visibleYear());
      for (i = _i = 1, _ref = firstDayOfMonth - 1; _i <= _ref; i = _i += 1) {
        this.$days.append($("<li class='drp-day drp-day-empty'></li>"));
      }
      for (i = _j = 1; _j <= lastDayOfMonth; i = _j += 1) {
        this.$days.append($("<li class='drp-day " + (this.dayClass(i, firstDayOfMonth, lastDayOfMonth)) + "'>" + i + "</li>"));
      }
      return this.$calendar.find('.drp-day').click(function(evt) {
        var day;
        if ($(this).hasClass('drp-day-disabled')) {
          return false;
        }
        day = parseInt($(this).text(), 10);
        if (isNaN(day)) {
          return false;
        }
        return self.setDay(day);
      });
    };

    Calendar.prototype.drawDateDisplay = function() {
      return this.$dateDisplay.text([this.month(), this.day(), this.year()].join('/'));
    };

    Calendar.prototype.month = function() {
      return this.date.getMonth() + 1;
    };

    Calendar.prototype.day = function() {
      return this.date.getDate();
    };

    Calendar.prototype.dayOfWeek = function() {
      return this.date.getDay() + 1;
    };

    Calendar.prototype.year = function() {
      return this.date.getFullYear();
    };

    Calendar.prototype.visibleMonth = function() {
      return this._visibleMonth;
    };

    Calendar.prototype.visibleYear = function() {
      return this._visibleYear;
    };

    Calendar.prototype.nameOfMonth = function(month) {
      return MONTHS[month - 1];
    };

    Calendar.prototype.firstDayOfMonth = function(month, year) {
      return new Date(year, month - 1, 1).getDay() + 1;
    };

    Calendar.prototype.daysInMonth = function(month, year) {
      month || (month = this.visibleMonth());
      year || (year = this.visibleYear());
      return new Date(year, month, 0).getDate();
    };

    return Calendar;

  })();

  $.fn.dateRangePicker = function() {
    return new DateRangePicker(this);
  };



}).call(this);
