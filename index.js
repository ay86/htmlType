/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description HTMLType reset type for HTML content.
 * @Since 2017/9/19
 */

function HTMLType(aTag) {
	// 保留的非纯文本内容标签
	this.specialTag = aTag || [
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
		while ((new RegExp(sExp)).test(sClearHTML) && nSafeLimit > 0) {
			sClearHTML = sClearHTML.replace((new RegExp(sExp, 'g')), '');
			nSafeLimit--;
		}

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
						case 'h1':
						case 'h2':
						case 'h3':
						case 'h4':
						case 'h5':
						case 'h6':
							aSpecial.push(aMatchTag[i]);
							break;
						case 'pre':
						case 'code':
						case 'strong':
						case 'b':
						case 'em':
						case 'del':
						case 'a':
							// 内联元素
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
		return sHTML.replace(/<.*?>/g, '');
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
		var sFormatHTML = this.clear(sHTML),
		    sFormatText = this.text(sHTML);
		var aHTMLData = sFormatHTML.split('\n'),
		    aTextData = sFormatText.split('\n');
		var aOutput = [];
		for (var i = 0; i < aHTMLData.length; i++) {
			aTextData[i] = aTextData[i].replace(/\s/g, '');
			if (this.checkSpecial(aHTMLData[i])) {
				var _result = this.typeSpecial(aHTMLData[i]);
				for (var j = 0; j < _result.length; j++) {
					if (typeof _result[j] === 'object') {
						aTextData[i] = aTextData[i].replace(_result[j].key, _result[j].value);
					}
					else {
						aOutput.push(_result[j]);
					}
				}
			}
			aOutput.push(aTextData[i].length ? '<TYPE-TAG>' + aTextData[i] + '</TYPE-TAG>' : '');
		}
		return aOutput.join('\n').replace(/\n+/g, '\n');
	},
	type        : function (sHTML) {
		this.data = sHTML;
		this.output = this.handler(this.data).replace(/<(\/)?TYPE-TAG>/g, '<$1p>');
		return this.output;
	}
};

module.exports = HTMLType;