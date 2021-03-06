module.exports = {
    title: '日常记录',
    description: '好的习惯会使人受益终生',
    // base: 'http://47.105.105.165:9999/',
    head: [
        ['script', { async: 'async', src: '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js' }],
        ['script', {}, ` (adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "ca-pub-8620617039148215",
            enable_page_level_ads: true
        });`]
    ],
    themeConfig: {
        displayAllHeaders: true,// 默认值：false
        sidebar: 'auto', // 自动生成侧栏
        nav: [
            { text: '主页', link: '/' },
            { text: '简历', link: 'http://47.105.105.165:9999/' },

            {
                text: '博文',
                items: [
                    { text: 'es6+', link: '/es6+/' },
                    { text: 'linux和nginx', link: '/linux/' },
                    { text: '框架', link: '/ng/' },
                    { text: 'node后端', link: '/nodejs/' },
                ]
            },
            { text: 'Github', link: 'https://www.github.com/zhangxinyong12' },
        ],
        // sidebar: {
        //     '/nodejs/': [
        //         '',
        //         'get-post'
        //     ],
        //     '/es6+/': [
        //         '',
        //         'index'
        //     ],
        //     '/ng/': [
        //         '',
        //         'index'
        //     ],
        //     '/linux/': [
        //         '',
        //         'index'
        //     ]
        // },
        sidebarDepth: 6,
    },
    configureWebpack: {
        resolve: {
            alias: {
                '@img': 'img'
            }
        }
    }
}