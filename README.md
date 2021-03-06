# request-recovery-sidecar
 
# Dev install
Install the dependencies by running: ```npm install```

# Start
Run ```npm start [port] [target]```
The two start arguments port and target are optional and if provided will replace the field PORT and TARGET in the .env file. The start command will run the nodejs application.

# Test
Run ```npm test``` will execute 6 mocha tests which test typical senarios with one or more failed or successful requests and recovery.

# Configure
Create a .env file in the root of the project, then enter the following configurations and modify them to your liking
```
NAME = test
PORT = 8080
CONTROL_PORT = 5001
REDIS_PORT = 6379
TARGET = http://localhost:5000
TEST_PORT = 5000
MAX_RETRIES = 3
RECOVER_BATCH = 20
DEBUG = false
```
```
NAME : name of the Redis entry
PORT : Proxy port (incoming trafic)
CONTROL_PORT : Command the sidecar (/recover)
REDIS_PORT : Redis port
TARGET : URL to target service (proxy trafic target)
TEST_PORT : Should be the port of the target service
MAX_RETRIES : Number of retries before message stored in Redis is discarded
RECOVER_BATCH : Number of requests processed at once during a recovery
DEBUG : Enable extra debugging
```

# Public Interface

All incomming traffic on port PORT will be redirected to the TARGET service.

To begin the recovery process make a HTTP GET request to route ```/recover``` on port CONTROL_PORT. The request will responde with a json object in the form of: 
```
{
 accepted: <boolean>,
 len: <number>
}
```
Where the field accepted will be true if the request was valid, and the field len being the number of requests which will be recovered / stored in the Redis message queue.
The response will not wait for the recovery process to finish and as such the above responce will not indicate if the recovery process has finished.

# Docker & Kubernetes

The file kube/sidecar.yaml is a template for deploying the service as a sidecar, the fields <name/sidecar-service>, <name/service>, <image/service>, <image/sidecar> should be replaced with the appropriate names of services and names of images which are relevant to your specific deployment.
The command ```kubectl apply -f kube``` can be used to apply the configuration to a Kubernetes cluster.
