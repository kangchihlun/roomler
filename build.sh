set -ex
# SET THE FOLLOWING VARIABLES
USERNAME=gjovanov
IMAGE=roomler
docker build --network=host --add-host registry.npmjs.org:104.16.26.35 -t $USERNAME/$IMAGE:latest .
