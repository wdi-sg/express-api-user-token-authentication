# Express API User Token Authentication Example

This example shows a way to secure an API on a per user basis - without using passport or JWTs. It works by generating a unique token per user and validating that this token is sent in the http request header for each request the user makes. The client side JavaScript stores this token in the browser Local Storage and uses it to auto login the user on page reload. This is a single page example but the approach works for multi-page sites as well.
