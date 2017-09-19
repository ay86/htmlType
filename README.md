# htmlType
htmlType 是一个针对网页内容进行优雅自排版的工具。通常从一个网站上获取到的内容包含了各种各样的信息，但是对于阅读来说，仅仅只需要图文信息而已。使用本工具可以将一切不必要的数据过滤掉，只保留文字以及你所设置保留的对应标签。输出一个非常简洁的内容，用于你的自排版。

## Install
```npm
npm install html-type --save-dev
```

## Usage

```js
var HT = require('./index');
var hType = new HT(['img', 'video']);
hType.type('<div>...</div>');
// see it.
```

## Author
&copy; AngusYoung

Email: <angusyoung@mrxcool.com>