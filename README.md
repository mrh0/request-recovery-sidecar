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
RETRIES = 3
```
