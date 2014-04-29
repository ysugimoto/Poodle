(function(module) {
    
    var http = require('http');
    
    module.http = _http;
    
    function _http(options, callback) {
        var lazy = new module.Lazy();
        
        callback && lazy.success(callback);
        
        http.get(options, function(response) {
            var body = "";
            
            if ( response.statusCode != 200 ) {
                lazy.signal.failed(response);
                return;
            }
            response.setEncoding('utf8');
            response.on('data', function(chunk) {
                body += chunk;
            });
            response.on('end', function() {
                lazy.signal.success(body);
            });
        });
        
        return lazy.promise();
    }
    
})(typeof Module !== 'undefined' ? Module : this);

