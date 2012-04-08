#!/bin/bash
#Install script for ubuntu. Probably want to get a better repo to check
# than this chris-lea whats his face.
sudo apt-get -y install python-software-properties
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get -y install nodejs