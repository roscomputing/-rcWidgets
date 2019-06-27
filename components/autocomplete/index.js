require('../../shared/dev-dependencies');
require('./index.less');
require('./index.theme.less');
require('./index.theme.dark.less');

const shared = require('../../shared/index');
const componentsShared = require('../../shared/components');
const template = require('./index.html');

const autocompleteFactory = function(config) {
    let el = shared.anyWidgetInitialActions(config);

    if (!el) {
        return null;
    }

    shared.initTemplates(el, template, '#rc-autocomplete-template', false, [{
        templateName: 'rc-autocomplete-item-template',
    }, {
        templateName: 'rc-autocomplete-button-item-template'
    }]);

    let selectedSlug;

    let vm = {
        // Buttons
        onButtonClick: function(e) {
            selectedSlug =  e.data.slug;
            componentsShared.performClose(el);
        },
        buttons: config.buttons ? config.buttons : [],

        // Values
        values: config.values ? config.values : [],
        valuesExists: function() {
            return !!this.get('values').length;
        },


        found: config.found ? config.found : [],
        foundBackup: config.found ? config.found : [],
        searchStr: '',
        searchStrTimeout: null,
        searchStrChange: function() {
            this.searchStrTimeout && clearTimeout(this.searchStrTimeout);
            this.searchStrTimeout = setTimeout(() => {
                this.getPossibleValues();
            }, 300);
        },
        onGetPossibleValuesSuccess(ids, result) {
            if (config.onAjaxSuccess) {
                result = config.onAjaxSuccess(result);
            }

            if (result && result.length) {
                this.set('foundBackup', result);
                this.set('found', result.filter((item) => ids.indexOf(item.Id) === -1));

                // Тут из невыделенного убирается выделенное
                this.set('found', this.get('found').filter((item) => {
                    let retVal = true;
                    $.each(this.values, (k, v) => {
                        if (v.Id === item.Id) {
                            retVal = false;
                        }
                    });
                    return retVal;
                }));
            } else {
                this.set('foundBackup', []);
                this.set('found', []);
            }
        },
        onGetPossibleValuesError(error) {
            error && error['responseJSON'] && shared.log(error['responseJSON']);
        },
        getPossibleValues: function() {
            let ids = this.get('values').map(item => item.Id);

            if (config.url && (!this.found.length || !config.clientSearch)) {
                let searchStr = this.get('searchStr');
                let url = config.url;

                if (config.getAjaxData) {
                    let data = config.getAjaxData({
                        skip: this.dataParams ? this.dataParams.take : 0,
                        take: this.dataParams ? this.dataParams.take : 40,
                        searchStr: searchStr.trim(),
                    });
                    this.onGetPossibleValuesSuccess(ids, data);
                } else {
                    $.ajax({
                        data: { searchStr: searchStr },
                        method: config.method || 'GET',
                        url: url,
                        success: this.onGetPossibleValuesSuccess.bind(this, ids),
                        error: this.onGetPossibleValuesError
                    });
                }
            } else {
                let trimmedAndLowered = (v) => v.toLowerCase().trim();
                let searchString = trimmedAndLowered(this.get('searchStr'));
                let found = this.get('foundBackup').filter((item) => ids.indexOf(item.Id) === -1 && trimmedAndLowered(item.Text).indexOf(searchString) !== -1);
                this.set('found', found);
            }
        },

        // Click
        selectValue: function(e) {
            let isOld = $(e.target).closest('li').parent().hasClass('values');

            if (isOld) {
                this.found.unshift(e.data);
                this.set('values', $.grep(this.get('values'), (item) => {
                    return item.Id !== e.data.Id;
                }));
                return false;
            }

            this.values.unshift(e.data);

            if (config.maxValuesCount && (this.values.length > config.maxValuesCount)) {
                this.found.unshift(this.values.pop());
            }

            // тут из невыделенного убирается выделенное
            this.set('found', this.get('found').filter((item) => {
                return this.values.indexOf(item) < 0;
            }));

            if (config.maxValuesCount && (this.values.length === config.maxValuesCount)) {
                componentsShared.performClose(el);
            }
        },
        onClose() {
            if (!shared.isNullOrUndefined(selectedSlug)) {
                config.callback([], selectedSlug);
                selectedSlug = null;
            } else {
                config.callback(this.get('values'));
            }
        },
        init: function() {
            this.getPossibleValues();
            componentsShared.onCloseSetup(config, el, this.onClose.bind(this));
        },
        show: function() {
            if (config.pos) {
                shared.findWidgetPos(el.find('> .w-popup'), config.pos);
            }

            el.find('> .w-popup').addClass('showing');
            el.find('input').focus();
            shared.setMainOverflow(true);
        },
        destroy: function() {
            kendo.unbind(el.find('> .w-popup'));
            el.find('> .w-popup').off('mouseup');
            el.off();
            el.remove();
            shared.setMainOverflow();
        }
    };

    return shared.bindViewModel(el, vm);
};

module.exports = function(config, callback) {
    let autocomplete;

    let data = {
        selector: config.selector,
        log: config.log,
        pos: {
            x: config.pageX || 0,
            y: config.pageY || 0,
        },
        values: config.values,
        found: config.found,
        method: config.method,
        getAjaxData: config.getAjaxData,
        onAjaxSuccess: config.onAjaxSuccess,
        maxValuesCount: config.maxValuesCount,
        clientSearch: config.clientSearch,
        callback: function(values) {
            callback(values);

            autocomplete.destroy();
        }
    };

    if (config.url) {
        data.url = config.url;
    }

    autocomplete = autocompleteFactory(data);
    autocomplete.show();

    return autocomplete;
};