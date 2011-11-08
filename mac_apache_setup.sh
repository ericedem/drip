#!/bin/bash
# generic setup script for mac, expecting docroot to be
# in /Library/WebServer/Documents/
# WARNING! This will override what is there! it should be junk
# but be careful!
ln -s $PWD/docroot/* /Library/WebServer/Documents/
