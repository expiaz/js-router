(function (exports) {

    exports.Flux = function () {
        this.state = {};
        this.store = [];
        this.lastModif = {};
    }

    exports.Flux.prototype.init = function (initialState) {
        this.state = initialState;
        this.store.push(this.state);
    }

    exports.Flux.prototype.getState = function (prop,value) {
        if(typeof prop == "object") {
            var chosen = false;
            for(var i = 0; i < this.store.length; i++){
                chosen = true;
                for(var p in this.store[i]){
                    if(this.stripSlashes(this.store[i][p]) != prop[p] && this.store[i][p] != prop[p]){
                        chosen = false;
                        break;
                    }
                }
                if(chosen) {
                    return this.store[i];
                }
            }
            return -1;
        }
        else if(typeof prop == "string" && !!value) {
            for (var i = 0; i < this.store.length; i++){
                for (var p in this.store[i]){
                    if (p == prop && ((this.store[i][p] == value) || (this.stripSlashes(this.store[i][p]) == value))){
                        return this.store[i];
                    }
                }
            }
            return -1;
        }
        else {
            return this.state;
        }
    }

    exports.Flux.prototype.stripSlashes = function(str){
        return str.replace(/^\//,'').replace(/\/$/,'');
    }

    exports.Flux.prototype.diff = function (a,b) {
        if(typeof a != "object" || typeof b != "object") return;
        var a_length = Object.keys(a).length,
            b_length = Object.keys(b).length;
        if(a_length == 0 || b_length == 0) return;
        //we want to iterate on the more little
        for(var k_a in a)
            if(typeof a[k_a] == "object") a_length+=Object.keys(a[k_a]).length;
        for(var k_b in b)
            if(typeof b[k_b] == "object") b_length+=Object.keys(b[k_b]).length;
        if(a_length > b_length){
            var c = a;
            a = b;
            b = c;
        }
        for(var k in a){
            if(!(k in b))
                return true;
            //k is in a and b at the same nesting level
            //need to compare values and sub-structures now
            if(typeof a[k] != typeof b[k])
                return true;
            //compare object / arrays
            switch(typeof a[k]){
                case "object":
                    if(a[k].constructor != b[k].constructor)
                        return true;
                    if ((a[k] instanceof Date && b[k] instanceof Date) ||
                        (a[k] instanceof RegExp && b[k] instanceof RegExp) ||
                        (a[k] instanceof String && b[k] instanceof String) ||
                        (a[k] instanceof Number && b[k] instanceof Number)) {
                        if(a[k].toString() != a[k].toString())
                            return true;
                    }
                    if(a[k] instanceof Array && a[k] instanceof Array){
                        if(a[k].length != a[k].length)
                            return true;
                        console.log('passed 5');
                        for(var i = 0; i < a[k].length; i++)
                            this.diff(a[k],b[k]);
                    }
                    //same obj
                    this.diff(a[k],b[k]);
                    break;
                case "function":
                    if(a[k].toString() != b[k].toString())
                        return true;
                    break;
                case "string":
                    if(a[k] != b[k])
                        return true;
                    break;
                case "number":
                    if(a[k] != b[k])
                        return true;
                    break;
                case "undefined":
                    break;
            }
        }
        return false;
    }

    exports.Flux.prototype.setState = function (state) {

        //TODO CHECK FOR OVERWRITE BF STORE IT : IF NOT DON'T STORE IF STATE IS THE SAME DON'T STORE
        if(typeof state != "object" || Array.isArray(state)) return;

        if(this.diff(this.state,state)){
            this.store.push(this.utils.assign_(this.state));
        }

        for(var prop in state) {
            if (typeof state[prop] == "object") {
                if (Array.isArray(state[prop]))
                    this.state[prop] = this.utils.map_(state[prop]);
                else
                    this.state[prop] = this.utils.assign_(state[prop]);
            }
            else
                this.state[prop] = state[prop];
        }
    }

    exports.Flux.prototype.utils = {
        assign_: function (obj) {
            var dup = {};
            for(var k in obj){
                dup[k] = typeof obj[k] == "object" ? Array.isArray(obj[k]) ? this.map_(obj[k]) : this.assign_(obj[k]) : obj[k];
            }
            return dup;
        },
        map_: function (arr) {
            return arr.map(function (e) {
                return typeof e == "object" ? Array.isArray(e) ? this.map_(e) : this.assign_(e) : e
            }, this);
        }
    }

    /*function setState(bf,af) {
        if(typeof af != "object" || Array.isArray(af)) return;
        for(var prop in af)
            bf[prop] = af[prop];
        return af;
    }*/

})(typeof window === undefined ? module.exports : window);