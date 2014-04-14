/// <reference path="../Scripts/knockout-3.1.0.js" />

function Group(label, children) {
    this.label = ko.observable(label);
    this.children = ko.observableArray(children);
}

function Option(label, property) {
    this.label = ko.observable(label);
    this.someOtherProperty = ko.observable(property);
}

var launchViewModel = function () {
    var self = this;

    self.rawEventData = null;
    self.events = ko.observableArray();  
    self.selectedOption = ko.observable();
    self.selectedEvent = ko.computed(function () {
        var selected = this.selectedOption();       
        return selected ? selected.someOtherProperty() : 'unknown';
    }, this);
    self.hasLocalRecords = ko.observable(false);

    self.getEvents = function () {        
        $.when(dataService.getEvents()).done(function (events) {            
           
            if (events.length > 0) {                
                // Populate the local database with event information
                dataService.createEventsTable();                
                dataService.refreshEventDetails(JSON.stringify(events));

                self.loadEvents(events);
            }
        }).fail(function () {
            dataService.getEventsFromLocalDB(self.loadEvents);
        });
    };

    self.loadEvents = function (events, rs) {
        // If rs isn't null, that means we're pulling out our event information from the local database.
        // Reydrate the events array that was stored in the local database the last time we successfully 
        // fetched it from the server.
        if (rs != null) {
            events = JSON.parse(rs.rows.item(0).Details);
        }

        self.rawEventData = events;

        var options = [];
        var unspecifiedOption = [];

        for (var i = 0; i < events.length; i++) {
            var option = new Option(events[i].Name, events[i].EventId);
            if (events[i].Name != "UNSPECIFIED") {
                options.push(option);
            } else {
                unspecifiedOption.push(option);
            }
        }

        self.events([
            new Group("Upstate Ford Event ID ----------", options),
            new Group("New or Unkown ID ----------", unspecifiedOption)
        ]);

        self.selectedOption(self.events()[0].children()[0]);
    };

    self.storeData = function () {        
        var survey = new Survey();
     
        survey.eventId = self.selectedEvent();

        var eventDetails = ko.utils.arrayFirst(self.rawEventData, function (event) {            
            return event.EventId === survey.eventId;
        });
             
        localStorage.setItem("Id", eventDetails.CampaignNumber);
        localStorage.setItem("Location", eventDetails.Name);
        localStorage.setItem("currentSurvey", JSON.stringify(survey));
           
        return true;
    };

    self.postCustomerInformation = function (t, rs) {       
        // Get all the surveys out of the local database
        var customerInformation = [];
        if (rs == null) {
            return;
        }
              
        self.hasLocalRecords(rs.rows.length > 0);

        for (var i = 0; i < rs.rows.length; i++) {
            var survey = JSON.parse(rs.rows.item(i).Details);
            customerInformation.push(survey);
        }

        if (customerInformation.length > 0) {
            $.when(dataService.postCustomerInformation(customerInformation)).done(function (result) {
                dataService.deleteCustomerInfoDetails();
                self.hasLocalRecords(false);
            });
        }
    };

    self.checkLocalRecords = function () {
        dataService.createCustomerInfoTable();
        dataService.getCustomerInformationFromLocalDB(self.checkLocalRecordsComplete);
    };

    self.checkLocalRecordsComplete = function (t, rs) {
        self.hasLocalRecords(rs.rows.length > 0);
    };

    self.updateServer = function () {        
        dataService.getCustomerInformationFromLocalDB(self.postCustomerInformation);
    };

    self.getEvents();
    self.checkLocalRecords();
};

$(document).ready(function () {
    var vm = new launchViewModel();
    ko.applyBindings(vm);
    //dataService.deleteCustomerInfoDetails();
});