(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{173:function(n,t,e){"use strict";e.r(t);var o=e(0),s=Object(o.a)({},function(){this.$createElement;this._self._c;return this._m(0)},[function(){var n=this,t=n.$createElement,e=n._self._c||t;return e("div",{staticClass:"content"},[e("h1",{attrs:{id:"nodejs-get-post-请求探索"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#nodejs-get-post-请求探索","aria-hidden":"true"}},[n._v("#")]),n._v(" nodejs-get-post-请求探索")]),n._v(" "),e("h2",{attrs:{id:"koa代码"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#koa代码","aria-hidden":"true"}},[n._v("#")]),n._v(" koa代码")]),n._v(" "),e("pre",[e("code",[n._v("const koa = require('koa');\nconst fs = require('fs');\nconst app = new koa();\n\nconst Router = require('koa-router');\n\nconst cors = require('koa2-cors');\nconst koaBody = require('koa-body'); //解析文件流\napp.use(koaBody({\nmultipart: true,  // 运行多个文件\nstrict: true,  //默认true，不解析GET,HEAD,DELETE请求\nformidable: {\n    maxFileSize: 2 * 1024 * 1024   // 设置上传文件大小最大限制，默认2M\n}\n}));\n\n// const bodyParser = require('koa-bodyparser');  // 不支持 form-data\n// app.use(bodyParser({\n//   extendTypes: {\n//     json: ['application/x-javascript', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/xml'] // 支持的类型\n//   }\n// })); // post 获取参数\n\n// \napp.use(cors({\norigin: function (ctx) {\n    if (ctx.url === '/test') {\n    return \"*\"; // 允许来自所有域名请求\n    }\n    return \"*\"; // 允许来自所有域名请求\n    // return 'http://localhost:8080'; // 这样就能只允许 http://localhost:8080 这个域名的请求了\n},\nexposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],\nmaxAge: 0,\ncredentials: true,\nallowMethods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],\nallowHeaders: ['Content-Type', 'Authorization', 'Accept'],\n}));\n\n// 主路由\nlet home = new Router();\nhome.get('/', async (ctx) => {\nlet url = ctx.url;\nlet request = ctx.request;\nlet req_query = request.query;\nlet req_queryString = request.querystring;\nconst body = {\n    url,\n    req_query,\n    req_queryString,\n};\nctx.body = body;\n});\n\n// 子路由\nlet page = new Router();\n\npage.get('/404', async (ctx) => {\nctx.body = '404.page!';\n})\n.get('/helloworld', async (ctx) => {\n    ctx.body = 'hello world page';\n})\n.get('/init', async (ctx) => {\n    ctx.body = ctx.request.query;\n})\n.post('/post', async (ctx) => {\n    console.log(ctx.request.query); // 获取 url 后面参数\n    const { a, b } = ctx.request.body;\n    const body = {\n    a, b\n    };\n    ctx.body = body;\n})\n.post('/postForm', async (ctx) => {\n    const { a, b } = ctx.request.body;\n    const body = {\n    a, b\n    };\n    ctx.body = body;\n})\n.post('/postText', async (ctx) => { // text/xml\n    const body = `\n    <a href=\"http://www.baidu.com\">百度链接</a>\n    `;\n    ctx.body = body;\n})\n.post('/uploadfile', async (ctx) => { //  上传文件\n    const file = ctx.request.files.file; // 获取上传文件\n    const size = file.size; // 大小\n    const type = file.type; // 类型\n    const name = file.name; // 名字\n    console.log(size, type, name);\n\n    ctx.body = { name };\n});\n\n\n// 装载所有子路由\nlet router = new Router();\nrouter.use('/', home.routes(), home.allowedMethods());\nrouter.use('/test', page.routes(), page.allowedMethods());\n\n// 加载路由中间件\napp.use(router.routes()).use(router.allowedMethods());\n\napp.listen(3000, () => {\nconsole.log('启动成功');\n});\n")])]),n._v(" "),e("h2",{attrs:{id:"axios"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#axios","aria-hidden":"true"}},[n._v("#")]),n._v(" axios")]),n._v(" "),e("pre",[e("code",[n._v("<!DOCTYPE html>\n<html lang=\"en\">\n\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">\n    <title>Document</title>\n    <script src=\"https://unpkg.com/axios/dist/axios.min.js\"><\/script>\n    <style>\n        li{\n            height: 40px;\n            margin-top: 10px;\n            cursor: pointer;\n        }\n    </style>\n</head>\n\n<body>\n\n    <input type=\"file\" name=\"a\" id=\"file\">\n    <button type=\"submit\" onclick=\"sub()\">提交,文件上传形式</button>\n    <ul>\n        <li onclick=\"post_json()\">一般的json形式，最常见</li>\n        <li onclick=\"post_form()\">form表单形式</li>\n        <li onclick=\"post_text()\">text形式-不常用</li>\n        <li onclick=\"get_init()\">get请求</li>\n    </ul>\n    <div id=\"box\">\n        <h3>请求结果</h3>\n\n    </div>\n</body>\n<script>\n    const box = document.querySelector('#box');\n    // axios.defaults.headers.common['Authorization'] = 'zhangxinyong'; // 自定义头信息\n    // 注意 不要写axios.defaults.headers.post 这样无效\n    // axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded'; //  默认的form表单就是这种形式\n    // axios.defaults.headers['Content-Type'] = 'multipart/form-data'; // 对文件分割上传\n    // axios.defaults.headers['Content-Type'] = 'application/json'; // 最常见的方式。\n    // axios.defaults.headers['Content-Type'] = 'text/xml'; // 不常见\n\n    const url = 'http://127.0.0.1:3000/';\n    axios.get(url + '?a=4&b=4').then((res) => {\n        console.log(res.data);\n    });\n    function get_init() {\n        axios.get(url + 'test/init?a=4&b=4').then((res) => {\n            console.log(res.data);\n        });\n    }\n    function post_json() {\n        const config = {\n            headers: {\n                'Content-Type': 'application/json'\n            }\n        };\n        axios.post(url + 'test/post?x=json', { a: 3, b: 4 }, config).then((res) => {\n            console.log(res.data);\n        });\n    }\n    // 一般的form 表单形式\n    function post_form() {\n        const config = {\n            headers: {\n                'Content-Type': 'application/x-www-form-urlencoded'\n            }\n        };\n        const formData = new FormData();\n        formData.append('a', 4444444);\n        formData.append('b', 33333);\n        axios.post(url + 'test/postForm?x=form', formData, config).then((res) => {\n            console.log(res.data);\n        });\n    }\n    // multipart/form-data \n    function sub() {\n        const formData = new FormData();\n        formData.append('file', document.querySelector('#file').files[0]);\n        formData.append('type', 2);\n        const config = {\n            headers: {\n                'Content-Type': 'multipart/form-data'\n            }\n        };\n        axios.post(url + 'test/uploadfile', formData, config).then((res) => {\n            console.log(res.data);\n        });\n    }\n\n    // text 不常用。就不介绍了\n    function post_text() {\n        const config = {\n            headers: {\n                'Content-Type': 'text/xml'\n            }\n        };\n        axios.post(url + 'test/postText?x=text', { a: 3, b: 4 }, config).then((res) => {\n            box.innerHTML += res.data;\n        });\n    }\n\n    // const http = axios.create({\n    //     url: 'test/post?x=uuuuuuuu',\n    //     baseURL: url,\n    //     mthod: 'post',\n    //     params: { a: 33, b: 000 }, // url 拼接的\n    //     data: {\n    //         x: 'cans'\n    //     },\n    //     // headers: {\n    //     //     'Content-Type': 'text/xml'\n    //     // }\n    // });\n    // http.post(url + 'test/post?x=uuuuuuuu', { a: 3, b: 4 }).then((res) => {\n    //     console.log(res.data);\n    // });\n<\/script>\n\n</html>\n")])])])}],!1,null,null,null);t.default=s.exports}}]);