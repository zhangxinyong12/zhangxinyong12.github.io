### document.createElement append() .slider-box{}
原因是ng对css编译后 .slider-box[_ngcontent-c10] 类似这样的
解决办法 ：

	1. 行内样式
	2. 新建个css文件，在angular.json中添加
	3. .slider-box ::ng-deep
### ps  -ef | grep nginx                         查找nginx配置文件
### angular 报错 ExpressionChangedAfterItHasBeenCheckedError https://segmentfault.com/a/1190000013972657
子组件抛出一个事件，而父组件监听这个事件，而这个事件会引起父组件属性值发生改变。同时这些属性值又被父组件作为输入属性绑定传给子组件。这也是非直接父组件属性更新
### 对同一个元素的同一个事件重复进行处理函数的添加，是只生效一次的

