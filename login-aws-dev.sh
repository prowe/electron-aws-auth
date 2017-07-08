#!/bin/bash

source /dev/stdin <<<"$(\
    GOOGLE_CLIENT_ID='623591274072-kvu1ue0tq9oabke17r80itgpbam81i5f.apps.googleusercontent.com' \
    IDENTITY_POOL_ID='us-east-1:76f0e395-cfda-4c92-93ba-47dac3101ac6' \
    npm --silent start)"
