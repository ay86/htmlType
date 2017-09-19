/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description htmlType reset type for HTML content.
 * @Since 2017/9/19
 */

function HtmlType(aTag) {
	// 保留的非纯文本内容标签
	this.specialTag = aTag || [
		'img',
		'video'
	];
}

HtmlType.prototype = {
	clear       : function (sHTML) {
		var sClearHTML = sHTML;

		sClearHTML = sClearHTML.replace(/\t+</g, '<');
		// Step 1 过滤掉不需要的属性
		sClearHTML = sClearHTML.replace(/<.*?>/g, function (sTag) {
			return sTag.replace(/ ([\w\-]+)=("|').*?\2/g, function (sMatch, $1) {
				var sReplace = '';
				switch ($1) {
					// 此此是需要保留的属性
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
		// 最多进行500次过滤，防止死循环 or 处理的标签太多程序卡死
		var nSafeLimit = 500;
		var sExp = '<(\\w*)>\\s*<\\/\\1>';
		while ((new RegExp(sExp)).test(sClearHTML) && nSafeLimit > 0) {
			sClearHTML = sClearHTML.replace((new RegExp(sExp, 'g')), '');
			nSafeLimit--;
		}

		return sClearHTML;
	},
	typeSpecial : function (sHTML) {
		var exTag = new RegExp('<(' + this.specialTag.join('|') + ')( |).*?>.*</\\1>|<img .*?>', 'g');
		var aMatchTag = sHTML.match(exTag);
		// console.log(exTag, aMatchTag);
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
							// 内联元素
							aSpecial.push({
								key  : this.text(aMatchTag[i]),
								value: aMatchTag[i]
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
	type        : function (sHTML) {
		this.data = sHTML;
		var sFormatHTML = this.clear(this.data),
		    sFormatText = this.text(this.data);
		var aHTMLData = sFormatHTML.split('\n'),
		    aTextData = sFormatText.split('\n');
		var aOutput = [];
		for (var i = 0; i < aHTMLData.length; i++) {
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
				// if (_result instanceof Array) {
				// 	aOutput = aOutput.concat(_result);
				// }
				// else if (typeof _result === 'object') {
				// 	for (var v in _result) {
				// 		if (_result.hasOwnProperty(v)) {
				// 			aTextData[i] = aTextData[i].replace(v, _result[v]);
				// 		}
				// 	}
				// }
			}
			aOutput.push(aTextData[i].length ? '<p>' + aTextData[i] + '</p>' : '');
		}

		this.output = aOutput.join('\n');

		return this.output;
	}
};

module.exports = HtmlType;