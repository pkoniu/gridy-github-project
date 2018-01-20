#!/bin/bash

PROJECT_ID=$1
IAM_FILE=$2

gcloud projects set-iam-policy $1 $2