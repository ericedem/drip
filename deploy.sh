#!/bin/bash
ln -sf $PWD/nginx/drip.conf /etc/nginx/conf.d/drip.conf;

service nginx restart;