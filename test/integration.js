var createWith = function (e,d) {
  return function() {
    return Lost.create('encoding-test', {
      encode: e,
      decode: d
    });
  };
};
var identity = function(v) { return v; },
    constant = function(c) { return function(v) { return c; }; },
    encode   = function(v) { return encodeURI(v); },
    decode   = function(v) { return decodeURI(v); };

describe('Lost', function() {
  var ls;

  beforeEach(function () {
    for (var key in localStorage) localStorage.removeItem(key);
    ls = Lost.create('test');
  });

  describe('#toString', function () {
    it('returns string', function () {
      ls.set('example1', 'value');
      ls.set('example2', 'value');

      var match = ls.toString().match(/<Lost:[A-Za-z]+ ~[0-9]+ bytes, 2 keys: example1, example2>/);
      expect(match).not.toBe(null);
    });
  });

  describe('encode and decode', function() {
    it('accepts encode and decode option', function() {
      expect(createWith(identity, identity)).not.toThrow();
    });

    it('throws error if decode(encode()) is not the identity map', function() {
      expect(createWith(identity, constant(1))).toThrow();
    });

    it('throws error if encode or decode is not a function', function() {
      expect(createWith(identity, 'invalid')).toThrow();
      expect(createWith('invalid', identity)).toThrow();
    });

    it('encodes and decodes key values', function() {
      var newLs = createWith(encode, decode)();
      newLs.set('example', '/');
      ls.set('example', '/');

      expect(newLs.get('example')).toEqual('/');
      expect(newLs.size()).not.toEqual(ls.size());
    });
  });

  describe('#size', function() {
    it('returns valid size', function() {
      var emptySize = ls.size(),
          sizes = [];

      for (var i=0; i<2 ; i++) {
        ls.set(i,i);
        sizes.push(ls.size() - emptySize);
      }

      expect(sizes[0]*2).toEqual(sizes[1]);
      expect(emptySize).toBeGreaterThan(0);
    });
  });

  describe('#exists', function() {
    it('returns true if key exists', function() {
      ls.set('example', 1);
      expect(ls.exists('example')).toBe(true);
    });

    it('throws error with no key present', function() {
      expect(function() { ls.exists(); }).toThrow();
    });
  });

  describe('#flush', function() {
    it('deletes all keys', function() {
      var addedKeys = [];
      for (var i=0; i<=3 ; i++) {
        addedKeys.push('example'+i);
        ls.set('example'+i, i);
      }
      expect(ls.keys()).toEqual(addedKeys);

      ls.flush();
      for (i=0; i<=3 ; i++) {
        expect(ls.get('example'+i)).toEqual(undefined);
      }
    });
  });

  describe('#del', function() {
    it('deletes a key', function() {
      ls.set('example', 'test');

      expect(ls.get('example')).not.toBe(undefined);
      expect(ls.del('example')).toBe(true);

      expect(ls.keys()).toEqual([]);
      expect(ls.get('example')).toBe(undefined);
    });

    it('returns false if key does not exist', function() {
      expect(ls.del('example')).toBe(false);
    });

    it('throws error with no key present', function() {
      expect(function() { ls.del(); }).toThrow();
    });
  });

  describe('#set', function() {
    it('saves a new key', function() {
      ls.set('example', 1);

      expect(ls.keys()).toEqual(['example']);
    });

    it('overwrites an existing key', function() {
      ls.set('example', 1);
      ls.set('example', 2);

      expect(ls.get('example')).toEqual(2);
    });

    it('throws error with no key or value present', function() {
      expect(function() { ls.set(); }).toThrow();
      expect(function() { ls.set('example'); }).toThrow();
    });
  });

  describe('#get', function() {
    it('returns undefined if a key is not defined', function() {
      expect(ls.get('test')).toBe(undefined);
    });

    it('returns a previously set keys', function() {
      var value = [1,2,3];
      ls.set('example', value);

      expect(ls.get('example')).toEqual(value);
    });

    it('returns keys for different namespaces', function() {
      var newLs = Lost.create('other');
      newLs.flush();

      ls.set('example', 1);
      newLs.set('example', 2);

      expect(ls.get('example')).toEqual(1);
      expect(newLs.get('example')).toEqual(2);
    });

    it('throws error with no key present', function() {
      expect(function() { ls.get(); }).toThrow();
    });

  });
});
