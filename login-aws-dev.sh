#!/bin/bash

set -e

exportVars=$(\
    GOOGLE_CLIENT_ID='623591274072-kvu1ue0tq9oabke17r80itgpbam81i5f.apps.googleusercontent.com' \
    ROLE_ARN='arn:aws:iam::729161019481:role/Observer' \
    npm --silent start)

source /dev/stdin <<<"$exportVars"
