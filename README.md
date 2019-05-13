# apoiase-api-nodejs
[![npm version](https://badge.fury.io/js/apoiase-api.svg)](https://badge.fury.io/js/apoiase-api)
[![Build Status](https://travis-ci.org/CrochetLand/apoiase-api-nodejs.svg?branch=master)](https://travis-ci.org/CrochetLand/apoiase-api-nodejs)
[![codecov](https://codecov.io/gh/CrochetLand/apoiase-api-nodejs/branch/master/graph/badge.svg)](https://codecov.io/gh/CrochetLand/apoiase-api-nodejs)

API não oficial do apoia.se

## TL;DR

```javascript
    const apoiase = new Apoiase({verbose: true});
    await apoiase.login(email, password);
    
    // The list of backers
    const backers  = (await apoiase.backers()).backers;
    
    // The backers charges
    const charges = await apoiase.charges();
    
    // The payouts send from Apoia.se to the campaign owner
    const payouts  = await apoiase.payouts();
    
```

## TODO
 
 - JSDocs
 - Api documentation 
 
 
### Licence
MIT
