var dataService = function () {
    var localdb = openDatabase("Emg3", "1.0", "Emg3 Database that should sync when connection is active", "200000"),
        //webServiceUrl = "http://localhost/API/",
        webServiceUrl = "http://0396f87.netsolhost.com/API/",
        postCustomerInformation = function (surveys) {
            return $.ajax({
                url: webServiceUrl + 'CustomerInformation/PostCustomerInformation',
                type: "POST",
                data: ko.toJSON(surveys),
                datatype: "json",
                processData: false,
                contentType: "application/json; charset=utf-8"
            });
        },
        getEvents = function () {
            return $.get(webServiceUrl + 'Event/GetEvents');
        },
        createEventsTable = function () {
            localdb.transaction(function (t) {
                var sql = "CREATE TABLE IF NOT EXISTS Event (ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, Details TEXT, CreatedDate DATETIME)";

                t.executeSql(sql, [], null, null);
            });
        },
        createCustomerInfoTable = function () {
            localdb.transaction(function (t) {
                var sql = "CREATE TABLE IF NOT EXISTS CustomerInformation (ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, Details TEXT, CreatedDate DATETIME)";

                t.executeSql(sql, [], null, null);
            });
        },
        addEventDetails = function (eventData) {
            localdb.transaction(function (t) {               
                var sql = "INSERT INTO Event (Details, CreatedDate) VALUES (?, ?)";
                 t.executeSql(sql, [eventData, Date.now()], null, null);
             });
        },
        addCustomerInfoDetails = function (eventData) {
            localdb.transaction(function (t) {
                var sql = "INSERT INTO CustomerInformation (Details, CreatedDate) VALUES (?, ?)";
                t.executeSql(sql, [eventData, Date.now()], null, null);
            });
        },
        deleteCustomerInfoDetails = function (eventData) {
            localdb.transaction(function (t) {
                var sql = "DELETE FROM CustomerInformation";
                t.executeSql(sql, null, null, null);
            });
        },
        refreshEventDetails = function (eventData) {
            localdb.transaction(function (t) {
                var sql = "DELETE FROM Event";
                
                t.executeSql(sql, [], dataService.addEventDetails(eventData), null);
            });
        },
        getEventsFromLocalDB = function (callback) {
            localdb.transaction(function (t) {
                var sql = "SELECT * FROM Event";

                t.executeSql(sql, [], callback, null);
            });
        },
        getCustomerInformationFromLocalDB = function (callback) {
            localdb.transaction(function (t) {
                var sql = "SELECT * FROM CustomerInformation";

                t.executeSql(sql, [], callback, null);
            });
        }

    return {
        postCustomerInformation: postCustomerInformation,
        getEvents: getEvents,
        createEventsTable: createEventsTable,
        refreshEventDetails: refreshEventDetails,
        addEventDetails: addEventDetails,
        getEventsFromLocalDB: getEventsFromLocalDB,
        createCustomerInfoTable: createCustomerInfoTable,
        addCustomerInfoDetails: addCustomerInfoDetails,
        deleteCustomerInfoDetails: deleteCustomerInfoDetails,
        getCustomerInformationFromLocalDB: getCustomerInformationFromLocalDB
    };
}();