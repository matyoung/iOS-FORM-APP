/// <reference path="../Scripts/knockout-3.1.0.js" />

var page5ViewModel = function () {
    var self = this;
    self.id = ko.observable(localStorage.getItem("Id"));
    self.location = ko.observable(localStorage.getItem("Location"));

    self.storeData = function () {
        // Always store data locally. Then attempt to send all local data to the server.
        // If it succeeds then we can clear the local data, otherwise we'll hang onto it
        // and try again the next time someone tries to submit.
        dataService.createCustomerInfoTable();
        dataService.addCustomerInfoDetails(localStorage.getItem("currentSurvey"));
        dataService.getCustomerInformationFromLocalDB(self.postCustomerInformation);
        
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
       
        $.when(dataService.postCustomerInformation(customerInformation)).done(function (result) {
            dataService.deleteCustomerInfoDetails();
        });
    };
   
    self.storeData();
};

$(document).ready(function () {
    var vm = new page5ViewModel();
    ko.applyBindings(vm);
});