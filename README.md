# Command line AWS federated login

This project allows the use of AWS federated login to still obtain AWS access key / secrets for use in command line application and client code.

## Requirements

- [npm](https://www.npmjs.com)
- Unix-ish OS (tested on mac)

## Setup
1. Fork this repo into the location of your choice
1. Run ```npm install```

## Usage
 Run the following command from a bash prompt to open a window, log you in and place the *AWS_ACCESS_KEY_ID*, *AWS_SECRET_ACCESS_KEY* and *AWS_SESSION_TOKEN* values into your current shell

 ```bash
 source login-aws-dev.sh
 ```

 Replace with the shell script for the AWS account you wish to login to.