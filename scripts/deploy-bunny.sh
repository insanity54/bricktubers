#!/bin/bash

source .env

echo "Check if the required environment variables exist"
missing_variables=()

if [[ -z "$BUNNY_FTP_USERNAME" ]]; then
    missing_variables+=("BUNNY_FTP_USERNAME")
fi

if [[ -z "$BUNNY_FTP_PASSWORD" ]]; then
    missing_variables+=("BUNNY_FTP_PASSWORD")
fi

if [[ -z "$BUNNY_FTP_HOSTNAME" ]]; then
    missing_variables+=("BUNNY_FTP_HOSTNAME")
fi

if [[ -z "$BUNNY_ZONE_ID" ]]; then
    missing_variables+=("BUNNY_ZONE_ID")
fi

if [[ -z "$BUNNY_API_ACCESS_KEY" ]]; then
    missing_variables+=("BUNNY_API_ACCESS_KEY")
fi

if [[ ${#missing_variables[@]} -gt 0 ]]; then
    echo "Error: One or more required environment variables are missing:"
    for variable in "${missing_variables[@]}"; do
        echo "- $variable"
    done
    exit 1
fi


echo "Proceed with the FTP connection and synchronization"
lftp -u "$BUNNY_FTP_USERNAME,$BUNNY_FTP_PASSWORD" "$BUNNY_FTP_HOSTNAME" << EOF
set ftp:sync-mode false
set ftp:use-mdtm off
mirror --reverse --parallel=10 --continue ./_site/ /
exit
EOF





echo "purge CDN cache so users see new updates"
curl --request POST \
     --url "https://api.bunny.net/pullzone/${BUNNY_ZONE_ID}/purgeCache" \
     --header 'content-type: application/json' \
     --header "AccessKey: ${BUNNY_API_ACCESS_KEY}"