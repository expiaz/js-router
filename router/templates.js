var templates = {
    menu:
    '<nav>' +
    '<ul>' +
    '<%for {{items}} as {{item}}%>' +
    '<%if {{a}} %> a <%endif%>' +
    '<li><a href="{{item.link}}">{{item.title}}</a></li>' +
    '<%endfor%>' +
    '</ul>' +
    '</nav>',
    accueil:
        '<h1>{{message}}</h1>',
    product:
    '<div>' +
    '<h3>{{name}}</h3>' +
    '<h4>{{type}}</h4>' +
    '<span>{{prix}}</span>' +
    '</div>',
    category:
    '<div>' +
    '<h2>{{category}}</h2>' +
    '<%for {{items}} as {{item}}%>' +
    '<div>' +
    '<a href="/products/{{item.id}}">{{item.name}} : {{item.prix}}</a>' +
    '</div>' +
    '<%endfor%>' +
    '</div>',
}
