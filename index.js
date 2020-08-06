var ace = require('brace');

module.exports = {
    render: function (h) {
        var height = this.height ? this.px(this.height) : '100%'
        var width = this.width ? this.px(this.width) : '100%'
        return h('div', {
            attrs: {
                style: "height: " + height + '; width: ' + width,
            }
        })
    },
    props: {
        value: String,
        lang: true,
        theme: String,
        height: true,
        width: true,
        options: Object,
        autoComplete: true,
        customKeywordList: Array
    },
    data: function () {
        return {
            editor: null,
            contentBackup: ""
        }
    },
    methods: {
        px: function (n) {
            if (/^\d*$/.test(n)) {
                return n + "px";
            }
            return n;
        }
    },
    watch: {
        value: function (val) {
            if (this.contentBackup !== val) {
                this.editor.session.setValue(val, 1);
                this.contentBackup = val;
            }
        },
        theme: function (newTheme) {
            this.editor.setTheme('ace/theme/' + newTheme);
        },
        lang: function (newLang) {
            this.editor.getSession().setMode(typeof newLang === 'string' ? ('ace/mode/' + newLang) : newLang);
        },
        options: function (newOption) {
            this.editor.setOptions(newOption);
        },
        height: function () {
            this.$nextTick(function () {
                this.editor.resize()
            })
        },
        width: function () {
            this.$nextTick(function () {
                this.editor.resize()
            })
        }
    },
    beforeDestroy: function () {
        this.editor.destroy();
        this.editor.container.remove();
    },
    mounted: function () {
        var _this = this
        var vm = this;
        var lang = this.lang || 'text';
        var theme = this.theme || 'chrome';
        var autoComplete = this.autoComplete || false


        require('brace/ext/emmet');

        var editor = vm.editor = ace.edit(this.$el);
        editor.$blockScrolling = Infinity;

        this.$emit('init', editor);

        // 去掉编辑器中竖线
        editor.setShowPrintMargin(false);
        editor.getSession().setMode(typeof lang === 'string' ? ('ace/mode/' + lang) : lang);
        editor.setTheme('ace/theme/' + theme);
        if (this.value)
            editor.setValue(this.value, 1);
        this.contentBackup = this.value;

        // 自定义提示
        if (autoComplete) {
            var staticWordCompleter = {
                getCompletions: function(editor, session, pos, prefix, callback) {
                    var customList = _this.customKeywordList
                    callback(null, [...customList.map(function(word){
                        return {
                            caption: word.caption,
                            value: word.value,
                            meta: word.meta
                        };
                    }), ...session.$mode.$highlightRules.$keywordList.map(function(word) {
                    return {
                      caption: word,
                      value: word,
                      meta: '关键字',
                    };
                  })]);
            
                }
            }
            editor.completers = [staticWordCompleter]

            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true,//只能补全
            })
        }
        editor.on('change', function () {
            var content = editor.getValue();
            vm.$emit('input', content);
            vm.contentBackup = content;
        });
        if (vm.options)
            editor.setOptions(vm.options);


    }
}

