

var builder = require('botbuilder');
var restify = require('restify');
var request = require('request');
const db = require('./data');


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
  // builder.Prompts.choice(session, "How can I help you?","Billing Queries|Water Supply Issue|Sewerage Issue|Moving Home|Difficulty Paying Bills|Meter installation|Other Enquiries", { listStyle: style });
   builder.Prompts.choice(session, "How can I help you?",db.choice1, { listStyle: style });

    },


   function (session, results) {
    


    session.userData.confirmation = results.response.entity;
            if (results.response.entity == 'Water Supply Issue'){
       builder.Prompts.choice(session, "Please Select",db.choice2, { listStyle: style });
        }
	
		else {
			session.send("Wrong Input");
		}
           },
function (session, results) {
    session.userData.confirmation2 = results.response.entity;
        if (results.response.entity == 'Report an issue'){
       builder.Prompts.choice(session, "ok. Please select the type of water issue that you wish to report",db.choice3, { listStyle: style });
        }
	
		else {
			 session.beginDialog('/goodbye')
		}
    },

/////////////////////////////////////////////////////////////


 async function (session, results) {
    session.userData.confirmation3 = results.response.entity;
    console.log("before await");
     await session.beginDialog('/luis');
    console.log("after await");

// if (session.userData.temp.topScoringIntent.intent == 'Leak'){

//     console.log("jgfsdjkgf",session.userData.temp.topScoringIntent.intent);
// }
// else{
//      console.log("not found",session.userData.temp.topScoringIntent.intent);
// }

      console.log(session.userData);
        if (results.response.entity == 'Leak' || session.userData.temp.topScoringIntent.intent == 'Leak'){
       builder.Prompts.choice(session, "Do you wish to report the issue at home or another location”. Please select:",db.choice4, { listStyle: style });
        }
	
		else {
			 session.send("Wrong Input");
		}
    },

    ///////////////////////////////////////////

    function (session, results) {
    session.userData.confirmation4 = results.response.entity;
        if (results.response.entity == 'My Home'){
       builder.Prompts.text(session, "Please Enter the address of your home.");
        }
	
		else {
			 session.send("Wrong Input");
		}
    },


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

/* -------------------------------------
			LUIS
--------------------------------------*/
bot.dialog('/luis', [


    async function(session, results) {

   
                var url;
                url = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/3a315594-f952-4b29-b0e6-151347280293?subscription-key=03acd2b5d9934bccbd68738ac3de48ee&spellCheck=true&bing-spell-check-subscription-key={YOUR_BING_KEY_HERE}&verbose=true&timezoneOffset=0&q="+session.userData.confirmation3;
               await request({
                    url: url,
                    method: 'GET',
                    json: true
                }, function (error, response, body) {
                    if(error){
                        console.log("Error: ", error);
                       
                    }
                    if (response.statusCode === 200) {
                        console.log("response from Luis", response.body)
                        session.userData.temp = {};
                        session.userData.temp = response.body;
                      
                       
                    }
                
                });
 
        
   }
    
]);
