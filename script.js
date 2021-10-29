const fs = require('fs'),
newman = require('newman'),

    results = [];

newman.run({
collection: require('./ZORLU_TOPTAN_postman_collection.json'), 
iterationData: require('./TestData.json'),
folder: 'GET', 
delayRequest: 1000, 
reporters: ['htmlextra'],
reporter:{
  htmlextra: {
  'reporter-htmlextra-export': 'newman/Enerji_OIS_API_Report.html'
  }
}

})
.on('request', function (err, args) {
    if (!err) {
        // here, args.response represents the entire response object
        var rawBody = args.response.stream, // this is a buffer
        rawHeader = args.response.headers,
        
            body = rawBody.toString(); // stringified JSON
            header = rawHeader.toString();

        results.push(JSON.parse(body)); // this is just to aggregate all responses into one object
    }
})
// a second argument is also passed to this handler, if more details are needed.
.on('done', function (err, summary) {
    // write the details to any file of your choice. The format may vary depending on your use case
    fs.appendFileSync('Testreport.json', JSON.stringify(results, null, 4));
});
