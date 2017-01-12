var ghPages = require('gh-pages');
var path = require('path');

ghPages.publish(path.join(__dirname, 'src'), function(err) {
    if (err) {
        console.error(err);
    } else {
        console.log("Success");
    }
});
