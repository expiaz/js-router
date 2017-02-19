(function(exports){

    exports.Router = function(history){
        this.routes = [];
        this.root = window.location.origin;
        this.middlewares = [];
        this.mainMiddleware = -1;
        this.history = history;
    };

    exports.Router.prototype.bind = function (history) {
        this.history = history;
    }

    exports.Router.prototype.init = function () {
        var self = this;
        Array.prototype.slice.call(document.getElementsByTagName('a')).forEach(function (link) {
            link.addEventListener('click',function (e) {
                e.preventDefault();
                self.navigate(link.pathname);
            });
        });
        this.listen();
        this.navigate(decodeURI(window.location.pathname));
    }

    exports.Router.prototype.on = function(route,vars,handler){
        if(typeof vars == "function"){
            handler = vars;
            vars = [];
        }

        if(route instanceof RegExp){
            this.routes.push({
                name:route.toString(),
                route: route,
                vars:vars,
                handler:handler
            });
        }
        else {
            var _vars = [];
            this.routes.push({
                name: route,
                route: new RegExp(route.replace(/:(\d+|\w+)/g, function (global, match) {
                    _vars.push(match);
                    return "(.*)";
                })),
                vars: _vars,
                handler: handler
            });
        }

        this.routes = this.routes.sort(function (a,b) {
            return (b.route.toString().length - a.route.toString().length) + (b.vars.length - a.vars.length);
        });

        return this;
    };

    exports.Router.prototype.use = function (route,vars,handler) {
        if(arguments.length == 1 && typeof arguments[0] == "function"){
            this.mainMiddleware = arguments[0];
            return this;
        }

        if(typeof vars == "function"){
            handler = vars;
            vars = [];
        }

        if(route instanceof RegExp){
            this.middlewares.push({
                name:route.toString(),
                route: route,
                vars:vars,
                handler:handler
            });
        }
        else {
            var _vars = [];
            this.middlewares.push({
                name: route,
                route: new RegExp(route.replace(/:(\d+|\w+)/g, function (global, match) {
                    _vars.push(match);
                    return "(.*)";
                })),
                vars: _vars,
                handler: handler
            });
        }

        this.middlewares = this.middlewares.sort(function (a,b) {
            return (b.route.toString().length - a.route.toString().length) + (b.vars.length - a.vars.length);
        });

        return this;
    }

    exports.Router.prototype.emit = function(route){
        for(var i = 0; i < this.routes.length; i++)
            if(this.routes[i].route == route)
                this.routes[i].handler.call({}, this.history.now(), this.history.last());
    };



    exports.Router.prototype.applyMiddleware = function (path) {
        if(this.mainMiddleware == -1)
            this.navigate(path);
        else
            this.mainMiddleware.call({},{url: path},this.history.now(),function(){ this.navigate(path,-1) }.bind(this))
    }

    exports.Router.prototype.navigate = function(route,index) {
        var path = route || this.getLocation(),
            match;

        if(index === undefined)
            return this.applyMiddleware(path);

        for(var i = 0; i < this.middlewares.length; i++) {
            if(index == i) continue;
            if (match = path.match(this.middlewares[i].route)) {
                match.shift();
                var args = match.slice(),
                    params = {};
                for (var j = 0; j < args.length; j++)
                    params[this.middlewares[i].vars[j]] = args[j];
                return this.middlewares[i].handler.call({}, {route: this.middlewares[i].name, url: match.input, params: params}, this.history.now(), function(){ this.navigate(path,i) }.bind(this))
            }
        }

        return this.move(path);
    }


    exports.Router.prototype.move = function (route) {

        var path = route || this.getLocation(),
            match;

        for(var i = 0; i < this.routes.length; i++) {
            if (match = path.match(this.routes[i].route)) {
                match.shift();
                var args = match.slice(),
                    params = {};
                for (var j = 0; j < args.length; j++)
                    params[this.routes[i].vars[j]] = args[j];
                this.history.add({
                    route: this.routes[i].name,
                    url: match.input,
                    params: params
                });
                window.history.pushState({location: path}, '', this.root + path + window.location.search + window.location.hash);
                this.emit(this.routes[i].route);
                return;
            }
        }
        return;
    }

    exports.Router.prototype.getLocation = function(){
        return decodeURI(window.location.pathname);
    };

    exports.Router.prototype.listen = function(){
        var self = this;
        window.onpopstate = function (e) {
            self.navigate(e.state.location);
        };
    }

})(typeof window === undefined ? module.exports : window);