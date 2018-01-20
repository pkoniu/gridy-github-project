#!/bin/bash

PROJECT_ID=$1
SAVE_TO_FILE=$2

gcloud projects get-iam-policy $1 --format json > $2