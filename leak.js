

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
   session.send("Welcome to Anglian Water!");
   builder.Prompts.choice(session, "How can I help you?","Billing Queries|Water Supply Issue|Sewerage Issue|Moving Home|Difficulty Paying Bills|Meter installation|Other Enquiries", { listStyle: style });

    },

   function (session, results) {
    session.userData.confirmation = results.response.entity;
            if (results.response.entity == 'Water Supply Issue'){
       builder.Prompts.choice(session, "Please Select","Report an issue|Check status of an existing issue ", { listStyle: style });
        }
	
		else {
			session.send("Wrong Input");
		}
           },
function (session, results) {
    session.userData.confirmation2 = results.response.entity;
        if (results.response.entity == 'Report an issue'){
       builder.Prompts.choice(session, "ok. Please select the type of water issue that you wish to report","Leak|Supply issue|Anglian Water work site issue|Apparatus issue (for manhole covers, pipes, meter box, etc.|Water Quality related|Chlorine gas related", { listStyle: style });
        }
	
		else {
			 session.beginDialog('/goodbye')
		}
    },

function (session, results) {
    session.userData.confirmation3 = results.response.entity;
        if (results.response.entity == 'Leak'){
       builder.Prompts.choice(session, "Do you wish to report the issue at home or another location”. Please select:","My Home|Another Location", { listStyle: style });
        }
	
		else {
			 session.send("Wrong Input");
		}
    },

    function (session, results) {
    session.userData.confirmation4 = results.response.entity;
        if (results.response.entity == 'My Home'){
       builder.Prompts.text(session, "Please Enter the address of your home.","My Home|Another Location", { listStyle: style });
        }
	
		else {
			 session.send("Wrong Input");
		}
    },
   /*function(session, results) {
        var url;
        url = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/3a315594-f952-4b29-b0e6-151347280293?subscription-key=03acd2b5d9934bccbd68738ac3de48ee&spellCheck=true&bing-spell-check-subscription-key={YOUR_BING_KEY_HERE}&verbose=true&timezoneOffset=0&q="+results.response;
        request({
            url: url,
            method: 'GET',
            json: true
        }, function (error, response, body) {

            if (!error && response.statusCode === 200) {
                var temp = response.body;
                if(temp.topScoringIntent.intent == 'Public Area') {
                   console.dir(temp.entities[0]);
                    if(temp.entities[0].type.includes('watercourse')) {
                        session.send("Entity exists.");
                    }
                    else {
                        session.send("No entity");
                    }
                }
                //
              
                //
                else {
                    session.send("No intent");
                }
            }
            else {
                session.send("Goodbye");
            }
        });

   }*/

]).set('storage', inMemoryStorage); // Register in-memory storage



/* -------------------------------------
			Goodbye message
--------------------------------------*/
bot.dialog('/goodbye', [
    function(session) {
		session.send("Thank you for contacting me! I'll be here if you need anything in the future. Have a nice day!");
		session.beginDialog('/end');
    }
]);
