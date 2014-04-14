ko.bindingHandlers.option = {
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        ko.selectExtensions.writeValue(element, value);
    }
};