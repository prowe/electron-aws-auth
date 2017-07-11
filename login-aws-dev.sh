#!/bin/bash

source /dev/stdin <<<"$(\
    GOOGLE_CLIENT_ID='131506248849-73u9trpcni7vvdarbug93sb2r9hnn3fj.apps.googleusercontent.com' \
    IDENTITY_POOL_ID='us-east-1:22c51ffa-1102-4be6-b373-210be1af71e9' \
    npm --silent start)"
