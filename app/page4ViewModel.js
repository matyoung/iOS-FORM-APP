/// <reference path="../Scripts/knockout-3.1.0.js" />

var page4ViewModel = function () {
    var self = this;
    self.id = ko.observable(localStorage.getItem("Id"));
    self.location = ko.observable(localStorage.getItem("Location"));
    self.acquire = ko.observable();
    self.opinion = ko.observable();
    self.purchase = ko.observable();

    self.storeData = function () {
        var survey = new Survey();

        survey = JSON.parse(localStorage.getItem("currentSurvey"));

        survey.whenAquire = (self.acquire() != null ? self.acquire() : "");
        survey.opinion = (self.opinion() != null ? self.opinion() : "");
        survey.thoughts = (self.purchase() != null ? self.purchase() : ""); 

        localStorage.setItem("currentSurvey", JSON.stringify(survey));

        return true;
    };

    self.postCustomerInformation = function (t, rs) {
        // Get all the surveys out of the local database
        var customerInformation = [];
        if (rs == null) {
            return;
        }
        for (var i = 0; i < rs.rows.length; i++) {
            var survey = JSON.parse(rs.rows.item(i).Details);
            customerInformation.push(survey);
        }

        if (customerInformation.length > 0) {
            $.when(dataService.postCustomerInformation(customerInformation)).done(function (result) {
                dataService.deleteCustomerInfoDetails();
            });
        }
    };

    self.updateServer = function () {
        dataService.createCustomerInfoTable();
        dataService.getCustomerInformationFromLocalDB(self.postCustomerInformation);
    };

    // When the app launches see if there's any surveys cached locally. Send them up to the server if some exist.
    // Do this every 30 seconds just incase we can't connect to the server. If we can connect and the cache has 
    // been cleared out there's no harm in looking at the local db every half minute.
    setTimeout(function () { self.updateServer() }, 30000, null);
};

$(document).ready(function () {
    var vm = new page4ViewModel();
    ko.applyBindings(vm);
});