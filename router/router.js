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
        this.parseTags();
        this.listen();
        this.navigate(decodeURI(window.location.pathname));
    }

    exports.Router.prototype.parseTags = function () {
        var self = this;
        Array.prototype.slice.call(document.getElementsByTagName('a')).forEach(function (link) {
            if(!(link.className.match(/handle/))){
                link.className = link.className.length ? link.className + ' handle' : 'handle'
                link.addEventListener('click',function (e) {
                    e.preventDefault();
                    console.log('link cliked')
                    self.navigate(link.pathname);
                });
            }
        });
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
        if(typeof route == "function"){
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
        console.log('navigate');
        this.applyMiddleware(route);
    }

    exports.Router.prototype.applyMiddleware = function (route,index) {

        console.log('applyMiddleware')

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

        console.log('applyRoute')

        var path = route || this.getLocation(),
            match;

        for(var i = 0; i < this.routes.stack.length; i++) {
            if (match = path.match(this.routes.stack[i].route)) {
                match.shift();
                var args = match.slice(),
                    params = {};
                for (var j = 0; j < args.length; j++)
                    params[this.routes.stack[i].vars[j]] = args[j];
                if(this.history.now().url != match.input){
                    this.history.add({
                        route: this.routes.stack[i].name,
                        url: match.input,
                        params: params
                    });
                    window.history.pushState({location: path}, '', this.root + path + window.location.search + window.location.hash);
                }
                else{
                    window.history.replaceState({location: path}, '', this.root + path + window.location.search + window.location.hash);
                }
                this.emit(this.routes.stack[i].route);
                return;
            }
        }

    }

    exports.Router.prototype.emit = function(route){
        console.log('emit')
        for(var i = 0; i < this.routes.stack.length; i++)
            if(this.routes.stack[i].route == route)
                this.routes.stack[i].handler.call({}, this.history.now(), this.history.last());
    };

    exports.Router.prototype.getLocation = function(){
        return decodeURI(window.location.pathname);
    };

})(typeof window === undefined ? module.exports : window);