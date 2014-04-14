/// <reference path="../Scripts/knockout-3.1.0.js" />
/// <reference path="survey.js" />

var page3ViewModel = function () {
    var self = this;
    self.id = ko.observable(localStorage.getItem("Id"));
    self.location = ko.observable(localStorage.getItem("Location"));
    self.is18YrsOrOlder = ko.observable(false);
    self.optInEmail = ko.observable(false);
    self.vehicleInterests = [];

    self.hasReadPrivacy = ko.observable();

    self.selectVehicle = function (id) {        
        if ($("#" + id).is(":checked")) {
            if (self.vehicleInterests.length < 3) {
                self.vehicleInterests.push(
                    { "FulfillmentCode": $("#" + id).val(), "CustomerInformationId": 0 }
                );
            } else {
                alert("You may select up to three vehicles");
                return false;
            }
        } else {
            var index = -1;
            for (var i = 0; i < self.vehicleInterests.length; i++) {
                if (self.vehicleInterests[i].FulfillmentCode == $("#" + id).val()) {
                    index = i;
                    break;
                }
            }
            
            self.vehicleInterests.splice(index, 1);
        }

        return true;
    };

    self.storeData = function () {
        if (!self.hasReadPrivacy()) {
            alert("Please read the privacy statement");
            return false;
        }

        var survey = new Survey();

        survey = JSON.parse(localStorage.getItem("currentSurvey"));

        survey.is18YrsOrOlder = self.is18YrsOrOlder();
        survey.optInEmail = self.optInEmail();
        survey.vehicleInterests = self.vehicleInterests;

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
    var vm = new page3ViewModel();
    ko.applyBindings(vm);
});