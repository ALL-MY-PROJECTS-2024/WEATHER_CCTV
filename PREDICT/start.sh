#!/bin/bash
python3 ondayback.py
python3 gen_video.py &
python3 server.py &