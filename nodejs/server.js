var express = require('express'),
    app = express.createServer(),
    io = require('socket.io').listen(app);
    
app.get("/", function(req,res){
    res.redirect("/index.html");
});

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/../impact'));
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }))
});
app.listen(5678);

io.sockets.on('connection', function(socket){
    socket.emit('news', {hello:'world'});
});