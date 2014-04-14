/// <reference path="../Scripts/knockout-3.1.0.js" />
/// <reference path="survey.js" />

function Group(label, children) {
    this.label = ko.observable(label);
    this.children = ko.observableArray(children);
}

function Option(label, property) {
    this.label = ko.observable(label);
    this.someOtherProperty = ko.observable(property);
}

var page2ViewModel = function () {
    var self = this;
    self.id = ko.observable(localStorage.getItem("Id"));
    self.location = ko.observable(localStorage.getItem("Location"));
    self.firstName = ko.observable();
    self.lastName = ko.observable();
    self.streetAddress = ko.observable();
    self.city = ko.observable();
    self.selectedOption = ko.observable();
    self.phone1 = ko.observable();
    self.phone2 = ko.observable();
    self.phone3 = ko.observable();

    self.state = ko.computed(function () {
        var selected = this.selectedOption();
        return selected ? selected.someOtherProperty() : 'unknown';
    }, this);
    self.zipCode = ko.observable();
    self.phone = ko.computed(function () {
        return (self.phone1() != null ? self.phone1() : "") +
            (self.phone2() != null ? self.phone2() : "") + 
            (self.phone3() != null ? self.phone3() : "");
    }, this);
    self.emailAddress = ko.observable();
    self.emailAddressConfirm = ko.observable();

    self.groups = ko.observableArray([
                new Group("New England ---", [
                    new Option("MA", "MA"),
                    new Option("ME", "ME"),
                    new Option("NH", "NH"),
                    new Option("RI", "RI"),
                    new Option("CT", "CT"),
                    new Option("VT", "VT"),
                    new Option("NY", "NY")
                ]),
                new Group("USA ----------", [
                    new Option("AL", "AL"),
                    new Option("AK", "AK"),
                    new Option("AZ", "AZ"),
                    new Option("AR", "AR"),
                    new Option("CA", "CA"),
                    new Option("CO", "CO"),                        
                    new Option("DE", "DE"),
                    new Option("FL", "FL"),
                    new Option("GA", "GA"),
                    new Option("HI", "HI"),
                    new Option("ID", "ID"),
                    new Option("IL", "IL"),
                    new Option("IN", "IN"),
                    new Option("IA", "IA"),
                    new Option("KS", "KS"),
                    new Option("KY", "KY"),
                    new Option("LA", "LA"),                     
                    new Option("MD", "MD"),                       
                    new Option("MI", "MI"),
                    new Option("MN", "MN"),
                    new Option("MS", "MS"),
                    new Option("MO", "MO"),
                    new Option("MT", "MT"),                   
                    new Option("NV", "NV"),                     
                    new Option("NJ", "NJ"),
                    new Option("NM", "NM"),                    
                    new Option("NC", "NC"),
                    new Option("ND", "ND"),
                    new Option("OH", "OH"),
                    new Option("OK", "OK"),
                    new Option("OR", "OR"),
                    new Option("PA", "PA"),                   
                    new Option("SC", "SC"),
                    new Option("SD", "SD"),
                    new Option("TN", "TN"),
                    new Option("TX", "TX"),
                    new Option("UT", "UT"),  
                    new Option("VT", "VT"),
                    new Option("VA", "VA"),
                    new Option("WA", "WA"),
                    new Option("WV", "WV"),
                    new Option("WI", "WI")
                ]),
                new Group("Canada ----------", [
                    new Option("AB", "AB"),
                    new Option("BC", "BC"),
                    new Option("MB", "MB"),
                    new Option("NB", "NB"),
                    new Option("NL", "NL"),
                    new Option("NS", "NS"),      
                    new Option("NT", "NT"),
                    new Option("NU", "NU"),
                    new Option("ON", "ON"),
                    new Option("PE", "PE"),
                    new Option("QC", "QC"),
                    new Option("SK", "SK"),
                    new Option("YT", "YT")
                ])
    ]);

    self.storeData = function () {       
        if (self.valdidateForm()) {           
            var survey = new Survey();
            survey = JSON.parse(localStorage.getItem("currentSurvey"));

            survey.firstName = self.firstName();
            survey.lastName = self.lastName();
            survey.streetAddress = self.streetAddress();
            survey.city = self.city();
            survey.state = self.state();
            survey.zipCode = self.zipCode();
            survey.phone = self.phone();
            survey.emailAddress = self.emailAddress();

            localStorage.setItem("currentSurvey", JSON.stringify(survey));
            return true;
        } else {
            return false;
        }
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

    self.valdidateForm = function () {
        var errors = "";
        debugger;
        $('.validate-error').removeClass(function (i, j) {
            return j.match(/validate-error/g).join(" ");
        });

        if (!self.firstName()) {
            errors += "First name is required.\n";
            $("#firstName").addClass("validate-error");
        }
        if (!self.lastName()) {
            errors += "Last name is required.\n";
            $("#lastName").addClass("validate-error");
        }
        if (!self.streetAddress()) {
            errors += "Address is required.\n";
            $("#streetAddress").addClass("validate-error");
        }
        if (!self.city()) {
            errors += "City name is required.\n";
            $("#city").addClass("validate-error");
        }
        if (!self.zipCode()) {
            errors += "Zip code is required.\n";
            $("#zipCode").addClass("validate-error");
        }
       
        if (self.phone() == "") {
            errors += "Phone is required.\n";
            $("#phone1").addClass("validate-error");
            $("#phone2").addClass("validate-error");
            $("#phone3").addClass("validate-error");
        }

        if (!self.emailAddress()) {
            errors += "Email Address is required.\n";
            $("#emailAddress").addClass("validate-error");
        }
        
        if (!self.emailAddressConfirm()) {
            errors += "Confirmation Email Address is required.\n";
            $("#emailAddressConfirm").addClass("validate-error");
        }

        if ((self.emailAddress() != null && self.emailAddressConfirm() != null) && self.emailAddress() != self.emailAddressConfirm()) {
            errors += "Confirmation email must be equal to email.\n";
            $("#emailAddress").addClass("validate-error");
            $("#emailAddressConfirm").addClass("validate-error");
        }

        if (self.zipCode()) {
            var regPostalCode = new RegExp("^\\d{5}(-\\d{4})?$");
            if (regPostalCode.test(self.zipCode()) == false) {
                errors += "Zip code is invalid.\n";
                $("#zipCode").addClass("validate-error");
            }
        }
       
        if (self.phone() != "") {
            if (!self.isValidPhoneNumber(self.phone())) {
                errors += "Phone number is invalid.\n";
                $("#phone1").addClass("validate-error");
                $("#phone2").addClass("validate-error");
                $("#phone3").addClass("validate-error");
            }
        }

        if (errors == "") {
            return true;
        } else {
            alert(errors);
            return false;
        }
    };

    self.isValidPhoneNumber = function (value) {
        if (!value) return false;
        var count = value.replace(/[^0-9]/g, "").length;

        return count == 10;
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
    var vm = new page2ViewModel();
    ko.applyBindings(vm);
});