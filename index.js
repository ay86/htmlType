/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description HTMLType reset type for HTML content.
 * @Since 2017/9/19
 */

function HTMLType(aTag) {
	// 保留的非纯文本内容标签
	this.specialTag = aTag || [
		'br',
		'img',
		'video'
	];
}

HTMLType.prototype = {
	clear       : function (sHTML) {
		var sClearHTML = sHTML;

		sClearHTML = sClearHTML.replace(/\t+</g, '<');
		// Step 1 过滤掉不需要的属性
		sClearHTML = sClearHTML.replace(/<.*?>/g, function (sTag) {
			return sTag.replace(/ ([\w\-]+)=("|').*?\2/g, function (sMatch, $1) {
				var sReplace = '';
				switch ($1) {
					// 此处是需要保留的属性
					case 'type':
					case 'href':
					case 'src':
					case 'rel':
					case 'data-src':
						sReplace = sMatch;
						break;
				}
				return sReplace;
			});
		});
		// Step 2 过滤掉冗余的标签
		// e.g. <div><div><strong></strong></div><p><span></span></p></div>
		// 最多进行500次过滤，防止死循环 or 处理的标签太多造成性能消耗过重
		var nSafeLimit = 500;
		var sExp = '<(\\w*)>\\s*<\\/\\1>';
		console.time('Loop');
		while ((new RegExp(sExp)).test(sClearHTML) && nSafeLimit > 0) {
			sClearHTML = sClearHTML.replace((new RegExp(sExp, 'g')), '');
			nSafeLimit--;
		}
		console.timeEnd('Loop');

		return sClearHTML;
	},
	typeSpecial : function (sHTML) {
		var reTag = new RegExp('<(' + this.specialTag.join('|') + ')( |).*?>.*?</\\1>|<img .*?>', 'g');
		var aMatchTag = sHTML.match(reTag);
		var aSpecial = [];
		if (aMatchTag) {
			for (var i = 0; i < aMatchTag.length; i++) {
				var _tag = aMatchTag[i].match(/<(\w+)( |).*?>/);
				if (_tag) {
					switch (_tag[1]) {
						case 'img':
						case 'video':
						case 'iframe':
						case 'ul':
						case 'ol':
						case 'dl':
						case 'table':
						case 'blockquote':
						case 'canvas':
						case 'svg':
						case 'hr':
						case 'h1':
						case 'h2':
						case 'h3':
						case 'h4':
						case 'h5':
						case 'h6':
							// 块元素，单独提取做为一行
							aSpecial.push(aMatchTag[i]);
							break;
						case 'pre':
						case 'code':
						case 'strong':
						case 'b':
						case 'em':
						case 'del':
						case 'a':
							// 内联元素，跟在原文里
							aSpecial.push({
								key  : this.text(aMatchTag[i]),
								value: this.getSubNode(aMatchTag[i])
							});
							break;
					}
				}
			}
		}
		return aSpecial;
	},
	checkSpecial: function (sHTML) {
		return new RegExp('<(' + this.specialTag.join('|') + ')', 'g').test(sHTML);
	},
	text        : function (sHTML) {
		// 对 <br> 标签进行特殊处理，假如它存在于要保留的标签数组里面
		if (this.specialTag.indexOf('br') > -1) {
			return sHTML.replace(/(?:<br>)+/g, '【br】').replace(/<.*?>/g, '').replace(/【br】/g, '<br>');
		}
		else {
			return sHTML.replace(/<.*?>/g, '');
		}
	},
	getSubNode  : function (sHTML) {
		// 取出内部节点，对可能存在的标签节点进行过再处理
		var _pre = '',
		    _sub = '',
		    _end = '';
		var _match = sHTML.match(/^<(.*?)>(.*)<\/(.*?)>$/);
		if (_match) {
			_pre = '<' + _match[1] + '>';
			_sub = _match[2];
			_end = '</' + _match[3] + '>';
		}
		if (/<.*>/g.test(_sub)) {
			return _pre + this.handler(_sub).replace(/<(\/)?TYPE-TAG>/g, '') + _end;
		}
		else {
			return sHTML;
		}
	},
	handler     : function (sHTML) {
		// 分别取出过滤掉多余标签的内容和纯文本的内容
		var sFormatHTML = this.clear(sHTML),
		    sFormatText = this.text(sHTML);
		// 将两份内容以原始换行为分割
		var aHTMLData = sFormatHTML.split('\n'),
		    aTextData = sFormatText.split('\n');
		var aOutput = [];
		/*
			对内容的每一行进行匹配处理，并输出新的内容行
		*/
		for (var i = 0; i < aHTMLData.length; i++) {
			// 清除单行文本里的多余空格或制表符号等
			aTextData[i] = aTextData[i].replace(/\s/g, '');
			// 处理存在特殊标签的行内容
			if (this.checkSpecial(aHTMLData[i])) {
				// 返回保留的特殊标签内容
				var _result = this.typeSpecial(aHTMLData[i]);
				for (var j = 0; j < _result.length; j++) {
					// 内联元素返回的是一个对象，通过替换直接插入在文本内容里
					if (typeof _result[j] === 'object') {
						aTextData[i] = aTextData[i].replace(_result[j].key, _result[j].value);
					}
					// 块元素直接从原文里提取出来放置在原文字内容前面独立一行
					else {
						aOutput.push(_result[j]);
					}
				}
			}
			// 添加带有特殊标签格式的文字内容
			aOutput.push(aTextData[i].length ? '<TYPE-TAG>' + aTextData[i] + '</TYPE-TAG>' : '');
		}
		return aOutput.join('\n').replace(/\n+/g, '\n');
	},
	type        : function (sHTML) {
		console.time('HType');
		this.data = sHTML;
		this.output = this.handler(this.data).replace(/<(\/)?TYPE-TAG>/g, '<$1p>');
		console.timeEnd('HType');
		return this.output;
	}
};

module.exports = HTMLType;