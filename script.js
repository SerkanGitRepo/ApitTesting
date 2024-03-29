const fs = require('fs'),
newman = require('newman');

var JiraClient = require('jira-connector');

var _timestamp='', 
_projectname="", 
_servicename="", 
_responsetime="", 
_responseschema="",
_logtype="", 
_message="",
_assertion,
_assertionname,
_testCaseIndex=0,

    results = [];

newman.run({
collection: require('./service/TestPostmanOEPSASCollection.json'), 
iterationData: require('./service/TestDataOESPAS.json'),
folder: 'POST', 
delayRequest: 1000, 
reporters: ['htmlextra'],
reporter:{
  htmlextra: {
    export: 'newman/Enerji_OIS_API_Report.html'
  }
}

})
.on('test', function (err, data) {
	
	var _dateofLog;
	var _assertionLength = this._events.assertion[_testCaseIndex].context.summary.run.executions[_testCaseIndex].assertions.length;
	
    if (!err) {
	for (let i = 0; i < _assertionLength; i++) {
	  _dateofLog = new Date();
	_assertion = this._events.assertion[_testCaseIndex].context.summary.run.executions[_testCaseIndex].assertions[i];
	
	_timestamp= JSON.stringify(_dateofLog);
	_projectname=JSON.stringify('Enerji Online İşlemler');
	_servicename=JSON.stringify(data.item.name);
	_assertionname=JSON.stringify(_assertion.assertion);
	_responsetime=this.summary.run.executions[_testCaseIndex].response.responseTime;
//	_responseschema=JSON.stringify('nok');
	if (_assertion.error){
		if (_assertionname=='\"Response time is less than 300ms\"' && _responsetime>300){
			_logtype=JSON.stringify('WARN');
		}else{
			_logtype=JSON.stringify('ERROR');
			createJiraTask(_servicename,_assertionname,_assertion.error.message)
		}
		_message=JSON.stringify(_assertion.error.message);
	} else{
		_logtype=JSON.stringify('INFO');
		_message=JSON.stringify('OK');
	}
		//writeToLog(_timestamp,_projectname,_servicename,_responsetime,_responseschema,_logtype,_assertionname,_message);
		writeToLog(_timestamp,_projectname,_servicename,_responsetime,_logtype,_assertionname,_message);
	}
	_testCaseIndex=_testCaseIndex+1;
}
});


function writeToLog(_timestamp,_projectname,_servicename,_responsetime,_logtype,_assertionname,_message){
	
	const newLogObject={
		timestamp:_timestamp,
		projectname:_projectname,
		servicename:_servicename,
		responsetime:_responsetime,
//		responseschema:_responseschema,
		logtype:_logtype,
		assertionname:_assertionname,
		message:_message
	};
	const jsonString=JSON.stringify(newLogObject);
	
	fs.appendFile('service_test.log',jsonString +'\n', function(err, result) {
     if(err) console.log('error', err);
   });
}

function createJiraTask(_srvcnm,_assertname,_errmsg){
	var jira = new JiraClient({
  	protocol: 'https',
  	host: 'btrota.zorlu.com',
	basic_auth:{
  	username: 'serkanaks',
  	password: 'Zorlu.4178'
	},
  	strictSSL: true
});


var myDate = new Date("2021/10/30");

jira.issue.createIssue({
	fields:{
		project:{
			key:"OSP"
			},
		summary:_srvcnm +' - ' + _assertname,
		description:_errmsg,
		issuetype:{
				name:"Bug - Hata",
			},
		duedate:myDate
	},
	function(error,issue){
		console.log("error",error);
		console.log("issue",issue);
	}
	
});

}
