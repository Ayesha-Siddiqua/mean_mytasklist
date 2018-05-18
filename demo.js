
var builder = require('botbuilder');
var restify = require('restify');
var request = require('request');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot and listen to messages
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());


var inMemoryStorage = new builder.MemoryBotStorage();
var style = builder.ListStyle['button'];

var bot = new builder.UniversalBot(connector, [
        function (session) {
            //Syntax for faceting results by 'Era'
            var queryString = searchQueryStringBuilder('facet=Era');
            performSearchQuery(queryString, function (err, result) {
                if (err) {
                    console.log("Error when faceting by era:" + err);
                } else if (result && result['@search.facets'] && result['@search.facets'].Era) {
                    eras = result['@search.facets'].Era;
                    var eraNames = [];
                    //Pushes the name of each era into an array
                    eras.forEach(function (era, i) {
                        eraNames.push(era['value'] + " (" + era.count + ")");
                    })    
                    //Prompts the user to select the era he/she is interested in
                    builder.Prompts.choice(session, "Which era of music are you interested in?", eraNames);
                } else {
                    session.endDialog("I couldn't find any genres to show you");
                }
            })
        },
        function (session, results) {
            //Chooses just the era name - parsing out the count
            var era = results.response.entity.split(' ')[0];;

            //Syntax for filtering results by 'era'. Note the $ in front of filter (OData syntax)
            var queryString = searchQueryStringBuilder('$filter=Era eq ' + '\'' + era + '\'');

            performSearchQuery(queryString, function (err, result) {
                if (err) {
                    console.log("Error when filtering by genre: " + err);
                } else if (result && result['value'] && result['value'][0]) {
                    //If we have results send them to the showResults dialog (acts like a decoupled view)
                    session.replaceDialog('/showResults', { result });
                } else {
                    session.endDialog("I couldn't find any musicians in that era :0");
                }
            })
        }
    ]);


