// indexOf for IE8
var indexOf;
if (!Array.prototype.indexOf) {
  indexOf = function(array, value) {
    for (var i=0, l=array.length; i<l; i++) {
      if (array[i] === value) return i;
    }
    return -1;
  };
} else {
  indexOf = function(array, value) {
    return array.indexOf(value);
  };
}

var verifyArgumentsLength = function(args, length, funcName) {
  if (args.length != length) {
    throw new Error('Lost.' + funcName + ' needs ' + length + ' argument' + args.length != 1 ? 's' : '' + ' (' + args.length + ' were given)');
  }
};

var Lost = function Lost(namespace, opts) {
  this.namespace = namespace;

  if (typeof opts !== null && typeof opts == 'object' && typeof opts.encode !== undefined && typeof opts.decode !== undefined) {
    if (typeof opts.encode != 'function' || typeof opts.decode != 'function') {
      throw new Error('Lost.create needs encode and decode functions');
    }

    var testValue = JSON.stringify({i:0}),
        encode = opts.encode,
        decode = opts.decode;

    if (decode(encode(testValue)) !== testValue) {
      throw new Error('Lost.create needs decode(encode(value)) to be the identity map');
    }

    this._encode = opts.encode;
    this._decode = opts.decode;
   }
};

Lost.create = function(namespace, opts) {
  var ls = new Lost(namespace, opts);
  ls._initialize();
  return ls;
};

Lost.prototype = {
  _initialize: function() {
    var keysKey = this._namespaced('keys', '-');
    if (this.keys() === null || this.keys() === undefined) {
      this._set(keysKey, []);
    }
  },

  _encode: function(v) {
    return v;
  },

  _decode: function(v) {
    return v;
  },

  _exec: function(command, key, value) {
    var storage = window.localStorage;

    switch (command) {
      case 'set':
        value = this._encode(JSON.stringify(value));
        storage.setItem(key, value);
        break;

      case 'get':
        value = storage.getItem(key);
        if (value === undefined || value === null) return undefined;
        return JSON.parse(this._decode(value));

      case 'del':
        storage.removeItem(key);
        break;
    }

    return;
  },

  _set: function(key, value) {
    this._exec('set', key, value);
  },

  _get: function (key) {
    return this._exec('get', key);
  },

  _namespaced: function(key, sep) {
    return this.globalNamespace + ':' + this.namespace + (sep || ':') + key;
  },

  globalNamespace: 'Lost',

  set: function(key, value) {
    verifyArgumentsLength(arguments, 2, 'set');

    var keys = this.keys();
    if (indexOf(keys, key) < 0) keys.push(key);
    this._set(this._namespaced('keys', '-'), keys);
    this._set(this._namespaced(key), value);
  },

  get: function(key) {
    verifyArgumentsLength(arguments, 1, 'get');
    if (!this.exists(key)) return undefined;

    return this._get(this._namespaced(key));
  },

  del: function(key){
    verifyArgumentsLength(arguments, 1, 'del');
    if (!this.exists(key)) return false;

    var keys = this.keys();
    keys.splice(indexOf(keys, key), 1);
    this._set(this._namespaced('keys', '-'), keys);

    this._exec('del', this._namespaced(key));
    return true;
  },

  keys: function() {
    return this._get(this._namespaced('keys', '-'));
  },

  exists: function(key) {
    verifyArgumentsLength(arguments, 1, 'exists');

    return indexOf(this.keys(), key) > -1;
  },

  size: function() {
    var keys = this.keys(),
        namespaceLength = this._namespaced('').length,
        size = 0;

    // characters used by keys and values
    for (var i=0, l=keys.length; i<l; i++) {
      var key = keys[i];

      size += namespaceLength + key.length;
      size += (window.localStorage.getItem(key) || '').length;
    }

    // characters used by index
    size += namespaceLength + JSON.stringify(keys).length;

    // UTF-16: each character requires two bytes
    return size * 2;
  },

  flush: function() {
    var keys = this.keys(),
        self = this;

    for (var i=0, l=keys.length; i<l; i++) self.del(keys[i]);
  },

  toString: function() {
    return '<Lost:' + this.namespace + ' ~' + this.size() + ' bytes, ' + this.keys().length + ' keys: ' + this.keys().join(', ') + '>';
  }
};

export default Lost;
