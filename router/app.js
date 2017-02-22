function display(container,content){
    container.innerHTML = content;
}

var blob = new Router(new Historik()),
    store = new Flux(),
    templateEngine = new Chino();

templateEngine
    .register(templates.accueil,"main")
    .register(templates.menu,"menu")
    .register(templates.category,"category")
    .register(templates.product,"product");

$('#menu').html(templateEngine.render("menu",{
    items:[
        {
            title:'accueil',
            link:'/'
        },
        {
            title:'products',
            link:'/products'
        }
    ]
}));

blob
    .use(function (now,old,next) {
        console.log('main middleware');
        console.log(arguments);
        next();
    })
    .on(function (now,old) {
        store.setState({location:now.url});
        console.log('/');
        $('#main').html(templateEngine.render("accueil",{}));
        blob.parseTags();
    })
    .on('products', function (now,old) {
        store.setState({location:now.url});
        console.log('/products');
        $.post("http://localhost/router/a.php",{category:'products'})
            .done(function (data) {
                console.log(data);
                $('#main').html(templateEngine.render("category",JSON.parse(data)));
                blob.parseTags();
            });
    })
    .on('products/:id', function (now,old) {
        console.log('/products/:id');
        store.setState({location:now.url});
        $.post("http://localhost/router/a.php",{category:'products',id:now.params.id})
            .done(function (data) {
                console.log(data);
                $('#main').html(templateEngine.render("product",JSON.parse(data)));
                blob.parseTags();
            });
    })
    .init();