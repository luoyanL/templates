/**
 * EasyTemplate
 * 
 * Version 3.0.0
 * 
 * http://easyproject.cn 
 * https://github.com/ushelp
 * 
 * Copyright 2012 Ray [ inthinkcolor@gmail.com ]
 * Released under the MIT license
 * 
 * [Support AMD, CMD, CommonJS, Node.js, Express]
 * 
 */
;(function(){
	
	// �����ϸ�ģʽ
	"use strict";
	
	// �Զ���ֲ� undefined ����
	var undefined;          
	
	/** Node.js global ���. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

	/** `self` �������. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** ȫ�ֶ�����. */
	var root = freeGlobal || freeSelf || Function('return this')();
	
	/** `exports` �������. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

	/** `module` �������. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
	
	// ������������������...
	var _Et = root.Et,
		noMatch = new RegExp(/(.)^/),
		escaper = new RegExp(/\\|'|\r|\n|\t|\u2028|\u2029/g),
		escapes = {
			"'": "'",
			"\\": "\\",
			"\r": "r",
			"\n": "n",
			"	": "t",
			"\u2028": "u2028",
			"\u2029": "u2029"
		},
		entityMap = {
			escape: {
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#x27;"
			},
			unescape: {
				"&amp;": "&",
				"&lt;": "<",
				"&gt;": ">",
				"&quot;": '"',
				"&#x27;": "'"
			}
		},
//		scriptReg=new RegExp("<etj\-script>((.|\r|\n|\r\n|\n\r)*?)</etj\-script>","igm"),
//		scriptReplaceReg=new RegExp("<#script#></#script#>","ig"),
//		styleReg=new RegExp("<etj\-style>((.|\r|\n|\r\n|\n\r)*?)</etj\-style>","igm"),
//		styleReplaceReg=new RegExp("<#style#></#style#>","ig"),
		has = function(obj, key) {
			return hasOwnProperty.call(obj, key);
		}, 
		keys = Object.keys || function(obj) {
			if(obj !== Object(obj)) throw new TypeError("Invalid object");
			var keys = [];
			for(var key in obj)
				if(has(obj, key)) keys.push(key); 
			return keys;
		}, // Regexes containing the keys and values listed immediately above.
		entityRegexes = {
			escape: new RegExp("[" + keys(entityMap.escape).join("") + "]", "g"),
			unescape: new RegExp("(" + keys(entityMap.unescape).join("|") + ")", "g")
		},
		slice = Array.prototype.slice,
		defaults = function(obj) {
			Et.each(slice.call(arguments, 1), function(source) {
				if(source) {
					for(var prop in source) {
						if(obj[prop] === void 0) obj[prop] = source[prop];
					}
				}
			});
			return obj;
		},
		// ��̬���벿��
		REMOVE=new RegExp(/\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g),
		SPLIT= new RegExp(/[^\w$]+/g),
		KEYWORDS= new RegExp(["\\b" + "break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if,in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with,abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto,implements,import,int,interface,long,native,package,private,protected,public,short,static,super,synchronized,throws,transient,volatile,arguments,let,yield,undefined".replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g'),
		NUMBER= new RegExp(/^\d[^,]*|,\d[^,]*/g),
		BOUNDARY= new RegExp(/^,+|,+$/g),
		SPLIT2= new RegExp(/^$|,+/),
		// ���ؾ�̬����ı����б�
		getVars=function(code) {
		    var varArray= code
		    .replace(REMOVE, '')
		    .replace(SPLIT, ',')
		    .replace(KEYWORDS, '')
		    .replace(NUMBER, '')
		    .replace(BOUNDARY, '')
		    .split(SPLIT2);
		    var n = {},r=[];  
			for(var i = 0; i < varArray.length; i++) 
			{
				if (!n[varArray[i]] && varArray[i]!="_p" && varArray[i]!="Et" && varArray[i]!="out") 
				{
					n[varArray[i]] = true; 
					r.push(varArray[i]); 
				}
			}
			var vars = "var ";
			while(r.length) {
				var v = r.shift();
				vars += "" + v + '= data.' + v + ',';
			}
			return vars;
		},
		cacheTmplSettings,
		dotRegExp=new RegExp(/(.)/g);
	
	/*--------------------------------------------------------------------------*/
	
	// Do your work...
	
	// �����ֳ�
	var _Et = root.Et;
	
	// ���Ķ���
	var Et = {
		enableScript: false,
		enableStyle: false,
		// ģ���ǩ���ʽ
		tmplSettings: {
			// �ű����ʽ ��ʼ�������%{ JS script }%
			scriptBegin:"%{",
			scriptEnd:"}%",
			// ������ʽ��ʼ������� {=name}
			outBegin:"{=",
			outEnd:"}",
			// ת��������ʽ��ʼ������� {-name}
			escapeOutBegin:"{-",
			escapeOutEnd:"}"
		},
		/**
		 * ���ַ����е������ַ�ת��Ϊ�ַ�ʵ�壬������
		 * @param {text} string �ַ���
		 * @return {String} ת�����ַ���
		 */
		escape: function(text) {
			if(text == null) return "";
			return("" + text).replace(entityRegexes["escape"], function(match) {
				return entityMap["escape"][match];
			});
		},
		/**
		 * escape�ķ���������������ַ����е��ַ�ʵ��ת��Ϊ�ַ���������
		 * @param {text} string �ַ���
		 * @return {String} ת�����ַ���
		 */
		unescape: function(text) {
			if(text == null) return "";
			return("" + text).replace(entityRegexes["unescape"], function(match) {
				return entityMap["unescape"][match];
			});
		},
		/**
		 * �������ϻ����
		 * @param {Object} obj Ҫ�����ļ��ϻ����
		 * @param {function} iterator ��������������ֵ�����������϶�����������
		 * @param {Object} context ��iterator�󶨵�context��ִ�У���������iteraotr����һЩ����Ԫ��
		 */
		each: function(obj, iterator, context) {
			if(obj == null) return;
			if(Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
				obj.forEach(iterator, context);
			} else if(obj.length === +obj.length) {
				for(var i = 0, length = obj.length; i < length; i++) {
					if(iterator.call(context, obj[i], i, obj) === breaker) return;
				}
			} else {
				var keys = keys(obj);
				for(var i = 0, length = keys.length; i < length; i++) {
					if(iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
				}
			}
		},
		/**
		 * ģ�����������ĺ���
		 * @param {String} tmplText ģ�����
		 * @param {Object} data ģ�����ݣ���ѡ
		 * @param {Et.tmplSettings} settings ���涯̬���Ʋ�������ѡ
		 * @return {String|function} ��� data ��Ϊ�գ��򷵻� String ��Ⱦ��������򣬷���һ�������� function ��Ⱦ����
		 */
		template: function(tmplText, data, settings) {
			// node.js buffer toString
			tmplText+="";
			
			if(settings){
				// ��ʱ����
				settings = defaults({}, settings, Et.tmplSettings);
				settings={
						script: new RegExp(settings.scriptBegin.replace(dotRegExp,"\\$1")+"([\\s\\S]+?)"+settings.scriptEnd.replace(dotRegExp,"\\$1"),"g"),
						out: new RegExp(settings.outBegin.replace(dotRegExp,"\\$1")+"([\\s\\S]+?)"+settings.outEnd.replace(dotRegExp,"\\$1"),"g"),
						escapeOut: new RegExp(settings.escapeOutBegin.replace(dotRegExp,"\\$1")+"([\\s\\S]+?)"+settings.escapeOutEnd.replace(dotRegExp,"\\$1"),"g"),
				};
			}else{
				// ģ���ǩ
				if(
					Et.tmplSettings.scriptBegin!="%{" ||
					Et.tmplSettings.scriptEnd!="}%" ||
					Et.tmplSettings.outBegin!="{=" ||
					Et.tmplSettings.outEnd!="}" ||
					Et.tmplSettings.escapeOutBegin!="{-" ||
					Et.tmplSettings.escapeOutEnd!="}" 
				){
					cacheTmplSettings={
						script: new RegExp(Et.tmplSettings.scriptBegin.replace(dotRegExp,"\\$1")+"([\\s\\S]+?)"+Et.tmplSettings.scriptEnd.replace(dotRegExp,"\\$1"),"g"),
						out: new RegExp(Et.tmplSettings.outBegin.replace(dotRegExp,"\\$1")+"([\\s\\S]+?)"+Et.tmplSettings.outEnd.replace(dotRegExp,"\\$1"),"g"),
						escapeOut: new RegExp(Et.tmplSettings.escapeOutBegin.replace(dotRegExp,"\\$1")+"([\\s\\S]+?)"+Et.tmplSettings.escapeOutEnd.replace(dotRegExp,"\\$1"),"g"),
					};
				}
				settings=cacheTmplSettings;
			}
			
			tmplText = Et.unescape(tmplText);
			var render;
			var matcher = new RegExp([(settings.escapeOut || noMatch).source, (settings.out || noMatch).source, (settings.script || noMatch).source].join("|") + "|$", "g");
			var index = 0;
			var source = "_p+='";
			tmplText.replace(matcher, function(match, escapeOut, out, script, offset) {
				source += tmplText.slice(index, offset).replace(escaper, function(match) {
					return "\\" + escapes[match];
				});
				if(escapeOut) {
					source += "'+\n((_t=(" + escapeOut + "))==null?'':Et.escape(_t))+'";
				}
				if(out) {
					//source += "'+((_t=(" + out+ "))==null?'':_t)+'";
//					source += "'+" + out + "+'";
					source += "'+\n((_t=(" + out+ "))==null?'':_t)+'";
				}
				if(script) {
					source += "';" + script + "\n_p+='";
				}
				index = offset + match.length;
				return match;
			});
			source += "';";
			var vars=getVars(source); 
			// Script support 
			if(this.enableScript){
//				source=source.replace(scriptReg, function($0, $1){
//					return '<script>'+$1.trim()+'<\/script>'
//				})
				source=source.replace("<etj-script>",'<script>').replace("</etj-script>",'<\/script>');
			}
			// Style support, don't warp
			if(this.enableStyle){
//				source=source.replace(styleReg, function($0, $1){
//					return '<style>'+$1.trim()+'</style>';
//				})
				source=source.replace("<etj-style>",'<style>').replace("</etj-style>",'<\/style>');
			}
//			console.info(source);
			source = "'use strict';"+vars+"_t,_p='',out=function(){_p+=Array.prototype.join.call(arguments, '')};" + source + "return _p";
			try {
				render = new Function("data", "Et",  source);
			} catch (e) {
				e.source = "function anonymous(data,Et) {" + source + "}";;
				throw e;
			}
			if(data) {
				try{
					return render(data, Et);
				}catch(e){
					console.error(e);
				}
				
			}
			var template = function(data) {
				try{
					return render(data, Et);
				}catch(e){
					console.error(e);
				}
			};
			return template;
		},
		/**
		 * �ų���ͻ
		 * @return {Et} Et ����
 		 */
		noConflict: function() {
			if(root.Et === Et) {
				root.Et = _Et;
			}
			return Et;
		}
	};


	cacheTmplSettings={
		script: new RegExp(Et.tmplSettings.scriptBegin.replace(dotRegExp,"\\$1")+"([\\s\\S]+?)"+Et.tmplSettings.scriptEnd.replace(dotRegExp,"\\$1"),"g"),
		out: new RegExp(Et.tmplSettings.outBegin.replace(dotRegExp,"\\$1")+"([\\s\\S]+?)"+Et.tmplSettings.outEnd.replace(dotRegExp,"\\$1"),"g"),
		escapeOut: new RegExp(Et.tmplSettings.escapeOutBegin.replace(dotRegExp,"\\$1")+"([\\s\\S]+?)"+Et.tmplSettings.escapeOutEnd.replace(dotRegExp,"\\$1"),"g"),
	}

	/*--------------------------------------------------------------------------*/
	// Export Et
	
	// AMD �� CMD ���ݣ�����ģ��
	if (typeof define == 'function' && (define.amd || define.cmd)) {
		
		// 1. ��������ģ��
		define([], function() {
			return Et;
		});
		
		// 2. ��������ģ��
//		define("Et", [], function() {
//			return Et;
//		});
	}
	// CommonJS ���ݣ�����NodeJS��
	else if(freeModule) {
		// Node.js ����.
		(freeModule.exports = Et).Et = Et;
		// ���� CommonJS ����.
		freeExports.Et = Et;
	} else {
        // ��ģ��Ӧ�ü��ݣ�����ȫ�ֶ���
		root.Et = Et;
   }
}.call(this));