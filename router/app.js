function display(content){
    $('#main').html(content);
}

var blob = new Router(new Historik()),
    store = new Flux(),
    template = new Chino();

var main =
        "<div><%if {{product}}%>" +
        "<h3>{{name}}</h3>" +
        "<h4>{{type}}</h4>" +
        "<span>{{price}}</span>" +
        "<%endif%>" +
        "<%if {{!product}}%>" +
        "<span>no product finded for current research</span>" +
        "<%endif%>" +
        "</div>"
    ;

template
    .register(main,"main");

blob
    .use(function (now,old,next) {
        console.log('main middleware');
        console.log(arguments);
        next();
    })
    .use('product/:id',function (now,old,next) {
        console.log('middleware : product/:id');
        console.log(arguments);
        next();
    })
    .use('product/:action/:id',function (now,old,next) {
        console.log('middleware : product/:action/:id');
        console.log(arguments);
        next();
    })
    .on(function (now,old) {
        console.log('route : /');
        console.log(arguments);
        store.setState({location:now.url});
        display(template.render("main",{}));
    })
    .on('product/:id', function (now,old) {
        console.log('route : product/:id');
        console.log(arguments);
        store.setState({location:now.url});
        $.post("http://localhost/router/a.php",now.params)
            .done(function (data) {
                display(template.render("main",JSON.parse(data)));
                store.setState(JSON.parse(data));
            });
    })
    .on('product/:action/:id', function (now,old) {
        console.log('route : product/:action/:id');
        console.log(arguments);
        store.setState({location:now.url});
    })
    .init();