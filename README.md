# fetch-service
Node.js abstraction for an HTTP agent with connection pool to a particular API

```js
const Service = require( 'fetch-service' );

const someApi = new Service( 'http://some.api.com' );

someApi.request( '/path' ); // returns a Promise of Request
```

For documentation on the Request object, see:
https://developer.mozilla.org/en-US/docs/Web/API/Request
