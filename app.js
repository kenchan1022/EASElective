var http = require('http'); 
var request = require('sync-request');
var url = require('url');
var mysql = require('mysql');
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
const TelegramBot = require('node-telegram-bot-api');
const token="444905975:AAFYC9G81LZp1dZhX8vv8UVpaiSV3rw1PIc";
const bot = new TelegramBot(token, {polling: true});
var user={};
var routine={};
//creates a new client
/*
var mysqlcon = mysql.createConnection({
	host: "sl-aus-syd-1-portal.3.dblayer.com",
	user: "admin",
	password: "SleepyPecky1",
	port: "18110",
	database: "test"
});
*/
//make connection

var mysqlcon = mysql.createConnection({ //For the demo
    host: 'sl-aus-syd-1-portal.1.dblayer.com',
    user: 'admin',
    password: 'test123',
    port: '18451',
    database: 'demo'
});

mysqlcon.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
});

// Set up Conversation service wrapper.
var conversation = new ConversationV1({
	username: '30cee938-87b8-4aaf-88dc-93ee4863c221', // replace with username from service key
	password: 'Hf0IXKzB4s8n', // replace with password from service key
	path: { workspace_id: 'd1005edb-2830-4100-aeb4-ab7f078c5a47' }, // replace with workspace ID
	version_date: '2017-11-08'
});

function sleep(ms) {
	console.log("sleep, 500");
  	return new Promise(resolve => setTimeout(resolve, ms));
}

function controller(msg){
  	console.log("************** controller **************");
  	var uid=msg.from.id;
  	var chatId = msg.chat.id; 
  	console.log(msg);
  	checkUserExist(uid);
  	if(msg.text.charAt(0)=="/"){
    	switch(msg.text){
      		case "/start":
        		bot.sendMessage(chatId, "Hi, "+msg.from.first_name+", what can i do for u?");
        		break;
    	}
  	}else{
    	conversation.message({input:{text:msg.text},}, function(err, response){
	      	if(err){
	        	console.error(err);
	        	return;
	      	} 
	      	var intent="";
	      	rephraseIntent(response);
	      	if(response.intents.length>0){
	        	intent=response.intents[0].intent;
	      	}   	
	      	if(user[uid].intent[intent]==null){
	        	console.log("intent "+intent+" null");
	        	user[uid].intent[intent]=1;
	      	}else{
	        	console.log("intent "+intent+" not null");
	        	user[uid].intent[intent]++;
	      	}
	      	user[uid].lastUpdate=Date.now()/1000;
	      	console.log(user[uid]);
	      	user[uid].outputBuffer=[];
	      	user[uid].leave=false;
	      	while(user[uid].leave==false){
	      		console.log("************** MAIN LOOP **************");
	      		if(user[uid].currentRoutine==null){
	      			console.log("currentRoutine=null");
	      			if(intent!=""){
	      				console.log("intent="+intent);
	      				if(routine[intent]==null){
	      					a=bot.sendMessage(chatId, "I dont know what 7 u say!!!");
	      					user[uid].outputBuffer.push(a);
	      					user[uid].leave=true;
	      				}else{	
	      					routine[intent](msg, response);
	      				}
	      			}else{
	      				console.log("intent=null");
	      				a=bot.sendMessage(chatId, "I dont know what 7 u say!!!");
	      				user[uid].outputBuffer.push(a);
	      				user[uid].leave=true;
	      			}
	      		}else{
	      			console.log("currentRoutine="+user[uid].currentRoutine);
	      			routine[user[uid].currentRoutine](msg, response);
	      		}
	        
	  	  	}
	  	  	console.log("************** END MAIN LOOP **************");
	  	  	user[uid].lastIntent=intent;
	  	  	console.log("outputBuffer: "+user[uid].outputBuffer);
	  	  	generator(chatId, uid);
	  	  	console.log("************** LEAVE Controller **************");
    	});
  	}
}

function generator(chatId, uid){
	console.log("************** generator **************");
	if(user[uid].outputBuffer.length<=0){
		return;
	}else{
		output=user[uid].outputBuffer.shift();
		console.log(output);
		if(output.type=="text"){
			bot.sendMessage(chatId, output.text).then(function(sended){generator(chatId, uid);});
		}else if(output.type=="MC"){
			bot.sendMessage(chatId, output.text, output.options).then(function(sended){generator(chatId,uid);});
		}
	}
}

/*function generator2(chatId, uid){
	console.log("************** generator **************");
	while(user[uid].outputBuffer.length>0){
		output=user[uid].outputBuffer.shift();
		console.log(output);
		if(output.type=="text"){
			bot.sendMessage(chatId, output.text);
		}else if(output.type=="MC"){
			bot.sendMessage(chatId, output.text, output.options).then(function(sended){});
		}
		sleep(500);
	}
}*/

function pushOutputToBuffer(uid, type, text, options){
	if(type=="text"){
		user[uid].outputBuffer.push({type:type, text:text});
	}else if(type=="MC"){
		user[uid].outputBuffer.push({type:type, text:text, options:options});
	}
}

routine.Greeting = function(msg, response){
	console.log("************** routineGreeting **************");
	var uid=msg.from.id;
	var chatId = msg.chat.id;
	user[uid].currentRoutine="Greeting";
	var intent="";
	if(response.intents.length>0){
  		intent=response.intents[0].intent;
  		console.log("intent="+intent);
	}
	if(msg.text=="Test mc"){
		console.log("************** test mc **************");
		var options = {
  			reply_markup: {
    			keyboard: [
      				[{ text: 'Yes', callback_data: 'yes' },
      				{ text: 'No', callback_data: 'no' },
      				{ text: 'Not sure', callback_data: 'not sure' }]
    			],
    			one_time_keyboard:true
  			}
		};
		pushOutputToBuffer(uid, 'MC', "Some text giving three inline buttons", options)
		user[uid].currentRoutine="testMC";
		user[uid].leave=true;
		console.log(user[uid]);
	}else if(intent=="courseInfo"){
		console.log("going to controller and routine courseInfo");
		user[uid].currentRoutine="courseInfo";
	}else{
		if(user[uid].step==null){
  			user[uid].step=1;
		}	
		//step 1 hi
		if(user[uid].step==1){
	 		console.log("************** routineGreeting step 1 **************");
		    if (user[uid].intent[intent]>2 && user[uid].lastIntent == intent && (Date.now()/1000)-user[uid].lastUpdate<21600){ 
		    	//go to step 2
		      	console.log("TOO MANY HI");
		      	user[uid].step=2;
		      	user[uid].phase=0;
		    }else{
		    	var reList=["Hi", "Hello", "What can I do for you?"];
		      	var num=parseInt((Math.random()*1000)%3);
		      	console.log(reList[num] +" "+ num);
				pushOutputToBuffer(uid, 'text', reList[num]);
		      	user[uid].leave=true;
		    }
		}else if(user[uid].step==2){
	  		//step 2 invite user play game
	    	console.log("************** routineGreeting step 2 **************");
	    	if(user[uid].phase==0){
	    		console.log("************** routineGreeting step 2 phase 0 **************");
	    		pushOutputToBuffer(uid, 'text', "U said 'hi' too many times.");
	      		pushOutputToBuffer(uid, 'text', "Shall we play a game?");
	      		user[uid].phase=1;
	      		user[uid].leave=true;
			}else if(user[uid].phase==1){
				console.log("************** routineGreeting step 2 phase 1 **************");
	        	if(intent=="True"){
	          		//go to step 3
	          		user[uid].step=3;
	          		user[uid].phase=0;
	          		user[uid].game=Math.floor(Math.random()*100);
	        	}else if(intent=="False"){
	        		//go to stpe 4
	        		user[uid].step=4;
	        	}else{
	          		console.log("bullshit");
	          		pushOutputToBuffer(uid, 'text', "Please make up ur mind first.");
	          		pushOutputToBuffer(uid, 'text', "Do u really want to play?");
	          		user[uid].phase=1;
	          		user[uid].leave=true;
	        	}
	    	}
	      
		}else if(user[uid].step==3){
	  		//step 3 game
	  		console.log("************** routineGreeting step 3 **************");
	  		if(user[uid].phase==0){
	  			console.log("************** routineGreeting step 3 phase 0 **************");
	  			pushOutputToBuffer(uid, 'text', "Guess a number(0-100)");
	  			user[uid].phase=1;
	  			user[uid].leave=true;
	  		}else if(user[uid].phase==1){
	  			console.log("************** routineGreeting step 3 phase 1 **************");
	  		
				guess=parseInt(msg.text);
				if(Number.isInteger(guess)){
					if(guess==user[uid].game){
						console.log("Bingo");
						pushOutputToBuffer(uid, 'text', "Bingo!!!! Hv a nice day");
						user[uid].step=4;
					}else if(guess<user[uid].game){
						console.log("Small");
						pushOutputToBuffer(uid, 'text', "Too small. Try again :)");
						user[uid].phase=0;
					}else if(guess>user[uid].game){
						console.log("Big");
						pushOutputToBuffer(uid, 'text', "Too big. Try again :)");
						user[uid].phase=0;
					}
				}else{
					//handle non-integer input.
					pushOutputToBuffer(uid, 'text', "Please enter an INTEGER(0-100)!!!!!!!");
					user[uid].phase=0;
				}
	  		
	  		}

		}else if(user[uid].step==4){
	  		//step 4 bye
	  		user[uid].step=null;
	  		user[uid].currentRoutine="goodbye";
		}
	}
	
  
}
routine.testMC=function(msg, response){
	console.log("************** routineTestMC **************");
	var uid=msg.from.id;
  	var chatId = msg.chat.id;
  	if(user[uid].step==null){
  		user[uid].step=1;
	}
	if(user[uid].step==1){
		pushOutputToBuffer(uid, 'text', msg.text);
	}
	user[uid].currentRoutine="goodbye";

}

routine.goodbye=function (msg, response){
  	console.log("************** routineBye **************");
  	var uid=msg.from.id;
  	var chatId = msg.chat.id;
  	var reList=["Bye", "See ya", "See you again"];
  	var num=parseInt((Math.random()*1000)%3);
  	console.log(reList[num] +" "+ num);
  	pushOutputToBuffer(uid, 'text', reList[num]);
  	user[uid].currentRoutine=null;
  	user[uid].leave=true;
}



routine.courseInfo = function(msg, response){
	console.log("***************** CourseInfo *****************");
	var uid = msg.from.id;
	var chatId = msg.chat.id;
	user[uid].currentRoutine="courseInfo";
	if(response.entities.length>0&&response.entities[0].value!=null&&user[uid].currentCourse==null){
		user[uid].currentCourse=response.entities[0].value;
		user[uid].step=2;
	}else if(user[uid].step == null){
		user[uid].step=1;
	}
	var intent="";
	if(response.intents.length>0){
  		intent=response.intents[0].intent;
	}
	if(user[uid].phase == null){
		user[uid].phase = 0;
	}
	if(user[uid].step == 1){  //Which course info should be provide
		if(user[uid].phase == 0){
			console.log("***************** CourseInfo Step1 phase 0*****************");	
			pushOutputToBuffer(uid, 'text', 'Which course are you intested in?');
	    	user[uid].phase = 1;
	    	user[uid].leave = true;
		}else if(user[uid].phase == 1){
			console.log("***************** CourseInfo Step1 phase 1*****************");
			console.log(response);
			if (response.entities.length>0&&response.entities[0].entity == 'Course'){
      			user[uid].currentCourse = response.entities[0].value;
      			user[uid].step = 2;
				user[uid].phase = 0;
      		}else if (intent=='False'){
      			user[uid].step = 6;
			}else{
				pushOutputToBuffer(uid, "text", 'Sorry, I don\'t know what you mean. Please enter the course code.');
				user[uid].phase = 0;
			}
    	}
	}else if(user[uid].step==2){ //Which Content should be provide
		console.log("***************** CourseInfo Step2 phase 0 *****************");
		if(user[uid].phase == 0){
			var options = {
	  			reply_markup: JSON.stringify({
	    			keyboard: [
	      				[{text: 'Courses content', callback_data: 'Courses content'}],
	      				[{text: 'Students\' opinions', callback_data: 'Students\' opinions'}],
	      				[{text: 'Other', callback_data: 'Other'}],
	      				[{text: 'No, thx', callback_data: 'No'}]
	    			],
	    			one_time_keyboard:true
	  			})
			};
			pushOutputToBuffer(uid, "MC", 'What do you want to know about ' + user[uid].currentCourse + '?', options)
			user[uid].phase = 1;
	    	user[uid].leave = true;	
	    	return;
		}else if(user[uid].phase == 1){
			console.log("***************** CourseInfo Step2 phase 1 *****************");			
			switch(msg.text)
			{
			case 'Courses content':
//				bot.sendMessage(chatId,'Courses content');
				user[uid].step = 3;
				user[uid].phase = 0;		
				//setTimeout(function(){ console.log("time out, 500"); }, 500);
				break;
			case 'Students\' opinions':
//				bot.sendMessage(chatId,'Students\' opinions');
				user[uid].step = 3;
				user[uid].phase = 1;
				//setTimeout(function(){ console.log("time out, 500"); }, 500);
				break;
			case 'Other':
//				bot.sendMessage(chatId,'Other');
				user[uid].step = 4;
				user[uid].phase = 0;
				//setTimeout(function(){ console.log("time out, 500"); }, 500);
				break;
			case 'No':
//				bot.sendMessage(chatId,'No');
				user[uid].step = 5;
				user[uid].phase = 0;
				//setTimeout(function(){ console.log("time out, 500"); }, 500);
				break;
			default:
				pushOutputToBuffer(uid, 'text', 'Sorry, I don\'t know what you mean.');
				user[uid].phase = 0;
				//setTimeout(function(){ console.log("time out, 500"); }, 500);				
			}
		}
	}else if(user[uid].step==3){
		console.log("***************** CourseInfo Step3 *****************");
		if(user[uid].phase == 0){
			console.log("***************** CourseInfo Step3 phase 0 *****************");
			var options = {
	  			reply_markup: JSON.stringify({
	    			keyboard: [
	      				[{text: 'Workload', callback_data: 'Workload'}],
	      				[{text: 'Teaching staff', callback_data: 'Teaching staff'}],
	      				[{text: 'Description', callback_data: 'Description'}],
	      				[{text: 'Pass rate', callback_data: 'Pass rate'}]
	    			],
	    			one_time_keyboard:true
	  			})
			};
			pushOutputToBuffer(uid, 'MC', 'What do you want to know about?', options);
			user[uid].phase = 2;
			user[uid].leave = true;	
		}else if (user[uid].phase == 1){
			console.log("***************** CourseInfo Step3 phase 1 *****************");
			var options = {
	  			reply_markup: JSON.stringify({
	    			keyboard: [
	      				[{text: 'Comment about the Courses', callback_data: 'CourseComment'}],
	      				[{text: 'Comment about the Teacher', callback_data: 'TeacherComment'}],
//	      				[{text: '3) Comment about the Material', callback_data: 'MaterialComment'}],
	    			],
	    			one_time_keyboard:true
	  			})
			};
			pushOutputToBuffer(uid, 'MC', 'What do you want to know about?', options)
			user[uid].phase = 2;
			user[uid].leave = true;	
		}else if (user[uid].phase == 2){
			console.log("***************** CourseInfo Step3 phase 2 *****************");
			switch(msg.text)
			{
			case 'Workload':

				/*CourseTables("Course", "Workload", user[uid].currentCourse,function(err,data){
				    if (err){
				        console.log("ERROR : ",err);   
				    }else {
				        //console.log("result from db is : ", data.Workload);
				        pushOutputToBuffer(uid, 'text', "The workload of " + user[uid].currentCourse + "\n" + data.Workload);
				    }
				});
//				bot.sendMessage(chatId,'Workload');
				user[uid].step = 2;
				user[uid].phase = 0;
				//setTimeout(function(){ console.log("time out, 500"); }, 500);		
				*/
				var res = request('GET', 'http://localhost:8099/workload');
				console.log("Workload: "+res.getBody());
				response=JSON.parse(res.getBody());
				pushOutputToBuffer(uid, 'text', "The workload of " + user[uid].currentCourse + "\n" + response.workload);
				user[uid].step = 2;
				user[uid].phase = 0;
				break;
			case 'Teaching staff':
//				bot.sendMessage(chatId,'Teaching staff');	
				/*CourseTeacherTables("CourseFeature", "Name", user[uid].currentCourse,function(err,data){
				    if (err){
				        console.error("ERROR : ",err);   
				    }else {
				        //console.log("result from db is : ", data.Description);
				        pushOutputToBuffer(uid, 'text', "The teaching staff of " + user[uid].currentCourse + " are: \n"+ data[0].Name + "\n"+ data[1].Name);			        
				    }
				});*/

				var url='http://localhost:8099/teacherStaff'
				http.get(url, function(response){
					console.log("http");
					console.log("The teaching staff of " + user[uid].currentCourse + " are: \n"+ response.lecturer + "\n"+ response.tutor);
					pushOutputToBuffer(uid, 'text', "The teaching staff of " + user[uid].currentCourse + " are: \n"+ response.lecturer + "\n"+ response.tutor);
				});
				user[uid].step = 2;
				user[uid].phase = 0;
				sleep(10000);
				//setTimeout(function(){ console.log("time out, 500"); }, 500);			
				break;
			case 'Description':
				CourseTables("Course", "Description", user[uid].currentCourse,function(err,data){
				    if (err){
				        console.log("ERROR : ",err);   
				    }else {
				        //console.log("result from db is : ", data.Description);
				        pushOutputToBuffer(uid, 'text', "The Description of " + user[uid].currentCourse + "\n" + data.Description);	        
				    }
				});
//				bot.sendMessage(chatId,'Description');	
				user[uid].step = 2;
				user[uid].phase = 0;
				//setTimeout(function(){ console.log("time out, 500"); }, 500);			
				break;
			case 'Pass rate':
				CourseTables("Course", "PassRate", user[uid].currentCourse,function(err,data){
				    if (err){
				        console.log("ERROR : ",err);   
				    }else {
				    	pushOutputToBuffer(uid, 'text', "The pass rate of "+ user[uid].currentCourse+ " = " + data.PassRate);					        
				    }
				});
//				bot.sendMessage(chatId,'Pass rate');	
				user[uid].step = 2;
				user[uid].phase = 0;
				//setTimeout(function(){ console.log("time out, 500"); }, 500);			
				break;
			case 'CourseComment':
//				bot.sendMessage(chatId,'Comment Course');
				CourseCommentTables("CourseComment", "*", user[uid].currentCourse ,function(err,data){
                    if (err){
                        console.log("ERROR : ",err);   
                    }else {
                        var positiveCount=0;
                        for (var i = 0; i < data.length; i++) {
                            console.log(data[i].Statement);
                            if (data[i].Statement == 'positive'){
                                positiveCount++;
                        	}
                        }
                        pushOutputToBuffer(uid, 'text', "The CourseComment of " + user[uid].currentCourse + "\n" + "There are " + positiveCount + "/" + data.length + " positive comment");
                    }
                });
				user[uid].step = 2;
				user[uid].phase = 0;	
				//setTimeout(function(){ console.log("time out, 500"); }, 500);			
				break;
			case 'TeacherComment':
//				bot.sendMessage(chatId,'Comment Teacher');
				CourseTeacherTables("CourseFeature", "*", user[uid].currentCourse,function(err,data){
				    if (err){
				        console.log("ERROR : ",err);   
				    }else {
				        //console.log("result from db is : ", data.Description);
				        var teacher0 = data[0];
				        var teacher1 = data[1];	
						CFCommentTables("CFComment", "*", user[uid].currentCourse,teacher0.FeatureID ,function(err,data){
		                    if (err){
		                        console.log("ERROR : ",err);   
		                    }else {
		                        var positiveCount=0;
		                        for (var i = 0; i < data.length; i++) {
		                            console.log(data[i].Statement);
		                            if (data[i].Statement == 'positive'){
		                                positiveCount++;
		                        	}
		                        }
		                        pushOutputToBuffer(uid, 'text', "the Comment of " + teacher0.Name + "\n" + "There are " + positiveCount + "/" + data.length + " positive comment");
		                    }
		                });
					CFCommentTables("CFComment", "*", user[uid].currentCourse,teacher1.FeatureID ,function(err,data){
		                    if (err){
		                        console.log("ERROR : ",err);   
		                    }else {
		                        var positiveCount=0;
		                        for (var i = 0; i < data.length; i++) {
		                            console.log(data[i].Statement);
		                            if (data[i].Statement == 'positive'){
		                                positiveCount++;
		                        	}
		                        }
		                        pushOutputToBuffer(uid, 'text', "the Comment of " + teacher1.Name + "\n" + "There are " + positiveCount + "/" + data.length + " positive comment")
		                    }
		                });                  
				    }
				});
				user[uid].step = 2;
				user[uid].phase = 0;
				//setTimeout(function(){ console.log("time out, 500"); }, 500);						
				break;
/*
			case 'MaterialComment':
				bot.sendMessage(chatId,'Comment Material');	
				user[uid].step = 2;
				user[uid].phase = 0;
				//setTimeout(function(){ console.log("time out, 500"); }, 500);			
				break;
*/
			default:
				user[uid].step = 4;
				user[uid].phase = 1;	
				user[uid].leave = false;
				//setTimeout(function(){ console.log("time out, 500"); }, 500);
			}
		}
	}else if(user[uid].step==4){
		console.log("***************** CourseInfo Step4 *****************");
		if(user[uid].phase == 0){
			console.log("***************** CourseInfo Step4 phase 0 *****************");
			pushOutputToBuffer(uid, 'text', 'What do you want to know?');
			user[uid].leave = true;
			user[uid].phase = 1;
		}else if (user[uid].phase == 1){
			console.log("***************** CourseInfo Step4 phase 1 *****************");
			console.log(msg.text);			
			//if database can find
			FindFeature("CourseFeature", "Name", user[uid].currentCourse, msg.text ,function(err,data){
				if (err){
				    console.log("ERROR : ",err);   
				}else{
					if (data.length==0){
						pushOutputToBuffer(uid, 'text', "Sorry, we can\'t find those data");
					}else{
						pushOutputToBuffer(uid, 'text', "Related data of [" + msg.text + "] & ["+ user[uid].currentCourse +"]: \n");
						var outputString="";
						for (var i = 0; i < data.length; i++) {
		           			outputString += data[i].Name + "\n";
		            	}
		            	pushOutputToBuffer(uid, 'text', outputString);
			        }     
				}
			});
			user[uid].step = 2;
			user[uid].phase = 0;
			user[uid].leave=false;
			//setTimeout(function(){ console.log("time out, 500"); }, 500);
		}
	}else if(user[uid].step==5){
		console.log("***************** CourseInfo Step5 *****************");
		if(user[uid].phase == 0){
			console.log("***************** CourseInfo Step5 phase 0 *****************");
			pushOutputToBuffer(uid, 'text', 'Do you want to choose ' + user[uid].currentCourse  + ' as one of your elective courses?');
			user[uid].phase = 1;
			user[uid].leave = true;
		}else if (user[uid].phase == 1){
			console.log("***************** CourseInfo Step5 phase 1 *****************");
			if (intent == "True"){
				user[uid].selectedCourse=user[uid].currentCourse;
				user[uid].step = 6;
				user[uid].phase = 0;
			}else if (intent == "False"){
				user[uid].unselectedCourse=user[uid].currentCourse;
				user[uid].step = 6;
				user[uid].phase = 0;
			}else{
				pushOutputToBuffer(uid, 'text', 'It seem you cannot make the decision yet');
				user[uid].step = 6;
				user[uid].phase = 0;
			}
			user[uid].currentCourse=null;
		}

	}else if(user[uid].step==6){
		console.log("***************** CourseInfo Step6 *****************");
		if(user[uid].phase == 0){		
			console.log("***************** CourseInfo Step6 phase 0 *****************");
			pushOutputToBuffer(uid, 'text', 'Do you want to know the information of other course?')
			user[uid].phase = 1;
			user[uid].leave = true;
		}else if (user[uid].phase == 1){
			console.log("***************** CourseInfo Step6 phase 1 *****************");
			console.log(user[uid]);
			console.log("***************** intent *****************");			
			console.log(intent);				
			if (intent == "False"){ 
				user[uid].step=null;
				user[uid].currentRoutine="goodbye";
			}else if (intent == "True"){
	      		user[uid].step = 1;
				user[uid].phase = 0; 
			}else{
				pushOutputToBuffer(uid, 'text', 'I don\'t know what you mean. If you want any information, request again!');
				user[uid].step=null;
				user[uid].currentRoutine="goodbye";
				user[uid].leave = true;				
			}
		}
	};
}

function checkUserExist(id){
  	console.log("************** checkUserExist **************");
  	if(user[id]==null){
    	user[id]={};
    	user[id].intent={};
    	console.log("user obj created");
  	}else{
    	console.log("user obj exists");
  	}
  	console.log("BACK TO controller");
}

function rephraseIntent(response){
	if(response.entities.length>0 && response.entities[0].entity=="Course"){
		response.intents[0]={intent:"courseInfo"};
		console.log(response);
	}

}

bot.onText(/\/start/, (msg) => {
  	console.log("************** bot.onText Start **************");
  	controller(msg);
});

bot.on('message', (msg) => {
  	console.log("************** bot.on **************");
  	if(msg.text.charAt(0)!='/'){
    	console.log("going to controller");
    	controller(msg); 
  	}
});

bot.on('callback_query', (msg) => {
	console.log("************** bot.on callback_query **************");
	msg.message.text=msg.data;
	msg.message.from=msg.from;
	msg=msg.message;
	controller(msg);
});

function scan(){
  	console.log("SERVER SCAN");
}

var requestloop=setInterval(function(){
  	scan();
}, 600000);


//---------------------------------------------- Database function--------------------------------------------------

function CourseTables(sqlTable, sqlCol,sqlCondition, callback){   
        var sqlCommend = "SELECT " + sqlCol + " FROM " + sqlTable + " WHERE CourseCode = '" + sqlCondition +"'";
        console.log(sqlCommend);
        mysqlcon.query(sqlCommend, function(err, result){
        console.log('Database Connected!');  
        if (err)
            callback(err,null);
        else{
            console.log(result[0]); 
            console.log('Database Disconnected!');                     
            callback(null,result[0]);
        }
    })
}

function CourseCommentTables(sqlTable, sqlCol,sqlCondition, callback){   
        var sqlCommend = "SELECT " + sqlCol + " FROM " + sqlTable + " WHERE CourseCode = '" + sqlCondition +"'";
        console.log(sqlCommend);
        mysqlcon.query(sqlCommend, function(err, result){
        if (err)
            callback(err,null);
        else{          
            console.log(result);
            callback(null,result);
        }
    })
}

function CourseTeacherTables(sqlTable, sqlCol, sqlCondition, callback){   
        var sqlCommend = "SELECT f." + sqlCol + 
        " FROM " + sqlTable + 
        " cf INNER JOIN Feature f ON f.FeatureID = cf.FeatureID WHERE cf.CourseCode = '" + sqlCondition + 
        " 'AND f.Type = 'Lecturer' OR f.Type = 'Tutor';"
        ;
        console.log(sqlCommend);
        mysqlcon.query(sqlCommend, function(err, result){
        if (err)
            callback(err,null);
        else{          
            console.log(result);
            callback(null,result);
        }
    })
}

function CFCommentTables(sqlTable, sqlCol, sqlCondition1, sqlCondition2, callback){   
        var sqlCommend = "SELECT " + sqlCol + " FROM " + sqlTable + " WHERE Course_FeatureCourseCode = '" + sqlCondition1 +"' AND Course_FeatureFeatureID = '"+ sqlCondition2 + "'";
        console.log(sqlCommend);
        mysqlcon.query(sqlCommend, function(err, result){
        if (err)
            callback(err,null);
        else{          
            callback(null,result);
        }
    })
}

function FindFeature(sqlTable, sqlCol, sqlCondition1, sqlCondition2, callback){   
        var sqlCommend = "SELECT f." + sqlCol + 
        " FROM " + sqlTable + 
        " cf INNER JOIN Feature f ON f.FeatureID = cf.FeatureID WHERE cf.CourseCode = '" + sqlCondition1 + 
        " 'AND f.Type= '"+ sqlCondition2 + "' ;"
        ;
        console.log(sqlCommend);
        mysqlcon.query(sqlCommend, function(err, result){
        if (err)
            callback(err,null);
        else{          
            console.log(result);
            callback(null,result);
        }
    })
}


