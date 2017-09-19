/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description 测试
 * @Since 2017/9/19
 */

var HT = require('../index');
var sample = require('./sample');
var htmlContent = sample.text;
var hType = new HT(['img', 'video', 'iframe']);
console.time('use time');
var typeContent = hType.type(htmlContent);
console.log(typeContent);
console.log('==========================================================================');
console.timeEnd('use time');
