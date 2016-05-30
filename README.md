# Lost.js [![Build Status](https://travis-ci.org/nelsond/lost.js.svg?branch=master)](https://travis-ci.org/nelsond/lost.js)

Lost is a simple `localStorage` wrapper (minified: 2.5 kB, gzip:  1.6 kB) with namespace and encoding/decoding features.

## Installation

You can install this package using bower:

```shell
$ bower install lost
```

In case you prefer not to use bower, you can download a [release](http:///github.com/nelsond/lost.js/releases).

## Usage

### Example

```javascript
// create a new namespaced Lost storage object
var storage = Lost.create("my-storage");

// set your first key
storage.set("count", 1);
storage.get("count"); // => 1

// you can also store objects since Lost uses JSON.stringify and JSON.parse
storage.set("person", {
  name: "Albert Einstein",
  isAlive: false
});
storage.get("person"); // => { name: "Albert Einstein", isAlive: false }

storage.keys() // => ["count", "person"]

// delete a previously set key
storage.del("person"); // => true
storage.get("person") // => undefined

// del(key) returns false if you try to delete a non-existing key
storage.del("person"); // => false

storage.toString();
// => <Lost:my-storage ~163 bytes, 2 keys: count, person>
```

### Namespaces

Namespaces allow you to make sure there are no collisions between different storages or other libraries accessing localStorage.

```javascript
var storageA = Lost.create("storage-a"),
    storageB = Lost.create("storage-b");

storageA.set("name", "Albert");
storageB.set("name", "Niels");

storageA.get("name"); // => "Albert"
storageB.get("name"); // => "Niels"
```

All keys are prefixed with the global namespace `Lost`. You can change it using `Lost.globalNamespace`:

```javascript
Lost.globaleNamespace = "Other";
var storage = Lost.create("storage");
storage.set("count", 1);

Object.keys(localStorage);
// => ["Other:storage-keys", "Other:storage:count"]
```

### Advanced options

You can use the encode and decode option when creating a new `Lost` storage for encryption or compression. This example assumes you have installed [sjcl](https://github.com/bitwiseshiftleft/sjcl/tree/version-0.8) and [lz-string](https://github.com/pieroxy/lz-string).

```javascript
// compression using lz-string
var compressedStorage = Lost.create("compressed-storage", {
  encode: function(v) {
    return LZString.compress(v);
  },
  decode: function(v) {
    return LZString.decompress(v);
  }
});

compressedStorage.set("compression-test", "a very long string...");
compressedStorage.get("compression-test"); // => "a very long string..."

// encryption using the Stanford Javascript Crypto Library
var pw = "SaePh9iey0IeTeibahquuiyae8ahv6Ob";
var encryptedStorage = Lost.create("encrypted-storage", {
  encode: function(v) {
    return sjcl.encrypt(pw, v);
  },
  decode: function(v) {
    return sjcl.decrypt(pw, v);
  }
});

encryptedStorage.set("encryption-test", "secret value");
encryptedStorage.get("encryption-test"); // => "secret value"
```

## Browser Support

Lost is tested and works with:

* IE 8+
* Chrome 31+
* Firefox 29+
* Safari 5+

There is no polyfill for browser without localStorage. Please make sure you manually check for localStorage support in case you would like to support browsers like IE 7:

```javascript
var localStorageSupport = false;
try {
  localStorage.setItem("your-test-key-name","test");
  localStorage.removeItem("your-test-key");
  localStorageSupport = true;
} catch(e) {
  // Ensures Lost.js works as expected
  // although the storage does not persist.
  var temporaryStorage = {};
  window.localStorage = {
    setItem: function(key) {
      temporaryStorage[key] = value;
    },
    getItem: function() {
      return temporaryStorage[key];
    },
    removeItem: function() {
      delete temporaryStorage[key];
    }
  }
}

var storage = Lost.create("my-storage");
// ...
```

(partly adapeted from [modernizr](http://modernizr.com/))
