# Server-side Development with NodeJS, Express and MongoDB 4

### Coursera: https://www.coursera.org/learn/server-side-nodejs

This repo is a part of self-learning at Coursera. I learned the basics of Express generator.

# Self-Signed

```bash
openssl genrsa 1024 > private.key
openssl req -new -key private.key -out cert.csr
openssl x509 -req -in cert.csr -signkey private.key -out cert.pem
```
