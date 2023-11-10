#!/bin/sh

# Prior to executing this step, kindly ensure that AWS credentials are configured and that AWS cli and ec2instanceconnectcli packages are installed.

set -e 

TOOLING_SERVER_ID=$1 # e.g. i-01234566789
DESTINATION_HOST=$2 # e.g. rds-mysql-xxx-xxx
LOCALHOST_PORT=$3 # e.g. 5000

# Check if user has installed mssh
if ! pip list | grep ec2instanceconnectcli &> /dev/null; then
    ## Prompt the user 
    echo "";
    read -p "Do you want to install missing package mssh? [Y/n]: " answer
    ## Set the default value if no answer was given
    answer=${answer:Y}
    ## If the answer matches y or Y, install
    [[ $answer =~ [Yy] ]] && pip install ec2instanceconnectcli
fi

if [[ -z "$TOOLING_SERVER_ID" ]] || [[ -z "$DESTINATION_HOST" ]]; then
    echo "";
    echo "Please add in all arguments required. e.g. ./tunnel-tooling-server.sh i-01234566789 rds-mysql-xxx-xxx";
    exit 1;
fi

if [[ -z "$LOCALHOST_PORT" ]]; then
    LOCALHOST_PORT=8989;
    echo "";
    echo "[ LOCALHOST_PORT argument was not set, default to port 8989 ]";
fi
echo "";

echo "[ Starting SSM session with tooling server ]";

# Allow for 4 second duration to start SSM session in a terminal emulator using AWS cli and output logs to toolinglogs file
xterm -e `aws ssm start-session --target $TOOLING_SERVER_ID --document-name AWS-StartPortForwardingSession  --parameters '{"portNumber":["22"], "localPortNumber":["9999"]}' 2>&1> ./toolinglogs` &> /dev/null &
sleep 4;

# Display logs from start session command
cat ./toolinglogs;

# If session is successfully created, logs will contain "Waiting for connection"
if echo $(tail ./toolinglogs) | grep -q "Waiting for connections" &> /dev/null; then
    
    echo "";
    echo "[ Opening tunnel via tooling server on local port $LOCALHOST_PORT ]"; 
    echo "DESTINATION_HOST=$DESTINATION_HOST"; 
    echo "";

    # Allow for 4 second duration to establish tunnel to destination host in another terminal emulator 
    xterm -e `mssh -N -L $LOCALHOST_PORT:$DESTINATION_HOST:3306 -t $TOOLING_SERVER_ID localhost -p 9999` &
    sleep 4;

    rm ./toolinglogs

    echo "[ Established tunneling, destination host accessible on local port $LOCALHOST_PORT ]";
    echo "";
    echo "[ To terminate SSH session, enter CTRL + C ]";

    wait;

else
    rm ./toolinglogs
    # Output error logs from starting SSM session
    xterm -e script `aws ssm start-session --target $TOOLING_SERVER_ID --document-name AWS-StartPortForwardingSession  --parameters '{"portNumber":["22"], "localPortNumber":["9999"]}'`
fi
