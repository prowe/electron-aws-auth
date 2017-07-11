#!/bin/bash

source /dev/stdin <<<"$(\
    GOOGLE_CLIENT_ID='623591274072-kvu1ue0tq9oabke17r80itgpbam81i5f.apps.googleusercontent.com' \
    IDENTITY_POOL_ID='us-east-1:a37629b5-3b97-4570-8f77-cd4d6b8b8072' \
    npm --silent start)"
