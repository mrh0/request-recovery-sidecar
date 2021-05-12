# request-recovery-sidecar
 
# Dev install
Run: ```npm install```

# Start
Run ```npm start```

# Configure
Create a .env file in the root of the project, then enter the following configurations and modify them to your liking
```
NAME = test
PORT = 8080
CONTROL_PORT = 5001
REDIS_PORT = 6379
TARGET = http://localhost:5000
MAX_RETRIES = 3
RECOVER_BATCH = 20
DEBUG = false
```
```
NAME : name of the Redis entry
PORT : Proxy port (ingoing trafic)
CONTROL_PORT : Command the sidecar (/recover)
REDIS_PORT : Redis port
TARGET : URL to target service (proxy trafic target)
MAX_RETRIES : Number of retries before message stored in Redis is discarded
RECOVER_BATCH : Number of requests processed at once during a recovery
DEBUG : Enable extra debugging
```
