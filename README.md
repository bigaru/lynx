# Project Lynx

## PGP Basics

* Export

```
// ascii
gpg2 -a -o pub.asc --export 475583C6FE72901F8BB1BDA466D195A823A1636F

// binary
gpg2 -o pub.pgp --export 475583C6FE72901F8BB1BDA466D195A823A1636F
```

* Encrypt file
```
gpg2 -o message.txt.gpg -e -r 475583C6FE72901F8BB1BDA466D195A823A1636F message.txt 
```

* Decrypt file
```
gpg2 -o plain.txt -d message.txt.gpg 
```