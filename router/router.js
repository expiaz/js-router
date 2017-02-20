(function(exports){

    exports.Router = function(history){
        this.routes = {
            stack: []
        };
        this.root = window.location.origin;
        this.middlewares = {
            main: {},
            stack: []
        }
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

    exports.Router.prototype.listen = function(){
        var self = this;
        window.onpopstate = function (e) {
            self.navigate(e.state.location);
        };
    }

    exports.Router.prototype.use = function (route,vars,handler) {
        if(arguments.length == 1 && typeof route == "function"){
            this.middlewares.main = {
                name: 'base',
                route: '*',
                vars: [],
                handler: route
            };
            return this;
        }

        if(typeof vars == "function"){
            handler = vars;
            vars = [];
        }

        if(route instanceof RegExp){
            this.middlewares.stack.push({
                name:route.toString(),
                route: route,
                vars:vars,
                handler:handler
            });
        }
        else {
            var _vars = [];
            this.middlewares.stack.push({
                name: route,
                route: new RegExp('^/' + route.replace(/:(\d+|\w+)/g, function (global, match) {
                        _vars.push(match);
                        return "(.[^\/]*)";
                    }) + '$'),
                vars: _vars,
                handler: handler
            });
        }

        this.middlewares.stack = this.middlewares.stack.sort(function (a,b) {
            return (b.route.toString().length - a.route.toString().length) + (b.vars.length - a.vars.length);
        });

        return this;
    }

    exports.Router.prototype.on = function(route,vars,handler){
        if(typeof route == "function" && arguments.length == 1){
            this.routes.stack.push({
                name: 'base',
                route: /\//,
                vars: [],
                handler: route
            });
            return this;
        }


        if(typeof vars == "function"){
            handler = vars;
            vars = [];
        }

        if(route instanceof RegExp){
            this.routes.stack.push({
                name:route.toString(),
                route: route,
                vars:vars,
                handler:handler
            });
        }
        else {
            var _vars = [];
            this.routes.stack.push({
                name: route,
                route: new RegExp('^/' + route.replace(/:(\d+|\w+)/g, function (global, match) {
                        _vars.push(match);
                        return "(.[^\/]*)";
                    }) + '$'),
                vars: _vars,
                handler: handler
            });
        }

        this.routes.stack = this.routes.stack.sort(function (a,b) {
            return (b.route.toString().length - a.route.toString().length) + (b.vars.length - a.vars.length);
        });

        return this;
    };

    exports.Router.prototype.navigate = function(route) {
        this.applyMiddleware(route);
    }

    exports.Router.prototype.applyMiddleware = function (route,index) {
        var path = route || this.getLocation(),
            match;

        if(typeof index != "number"){
            this.middlewares.main.name !== undefined
                ? this.middlewares.main.handler.call({},{url:path}, this.history.last(), function(){ this.applyMiddleware(path,0) }.bind(this))
                : this.applyMiddleware(path,0);
            return;
        }


        for(var i = index; i < this.middlewares.stack.length; i++){
            if (match = path.match(this.middlewares.stack[i].route)) {
                match.shift();
                var args = match.slice(),
                    params = {};
                for (var j = 0; j < args.length; j++)
                    params[this.middlewares.stack[i].vars[j]] = args[j];
                this.middlewares.stack[i].handler.call({}, {route: this.middlewares.stack[i].name, url: match.input, params: params}, this.history.now(), function(){ this.applyMiddleware(path,++i) }.bind(this))
                return;
            }
        }

        this.applyRoute(path);
    }

    exports.Router.prototype.applyRoute = function (route) {

        var path = route || this.getLocation(),
            match;

        for(var i = 0; i < this.routes.stack.length; i++) {
            if (match = path.match(this.routes.stack[i].route)) {
                match.shift();
                var args = match.slice(),
                    params = {};
                for (var j = 0; j < args.length; j++)
                    params[this.routes.stack[i].vars[j]] = args[j];
                this.history.add({
                    route: this.routes.stack[i].name,
                    url: match.input,
                    params: params
                });
                window.history.pushState({location: path}, '', this.root + path + window.location.search + window.location.hash);
                this.emit(this.routes.stack[i].route);
                return;
            }
        }

    }

    exports.Router.prototype.emit = function(route){
        for(var i = 0; i < this.routes.stack.length; i++)
            if(this.routes.stack[i].route == route)
                this.routes.stack[i].handler.call({}, this.history.now(), this.history.last());
    };

    exports.Router.prototype.getLocation = function(){
        return decodeURI(window.location.pathname);
    };

})(typeof window === undefined ? module.exports : window);