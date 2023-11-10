#!/bin/sh

CLASSPATH=./SLIFTEzClassic.jar:./tfpjce.jar:.
export CLASSPATH
java SLIFTEzClassic $@
