#!/bin/bash

PROJECT_NAME=$1
DESCRIPTION=$2
INSTANCE_NAME=${PROJECT_NAME}-instance
CLUSTER_NAME=${PROJECT_NAME}-cluster
CLUSTER_ZONE=europe-west1-c
INSTANCE_TYPE=DEVELOPMENT
STORAGE_TYPE=HDD

gcloud projects create $PROJECT_NAME
gcloud beta bigtable instances create $INSTANCE_NAME --cluster=$CLUSTER_NAME --cluster-zone=$CLUSTER_ZONE --instance-type=$INSTANCE_TYPE --description=$DESCRIPTION --cluster-storage-type=$STORAGE_TYPE --project=$PROJECT_NAME

echo project = $1 > ~/.cbtrc
echo instance = $INSTANCE_NAME > ~/.cbtrc