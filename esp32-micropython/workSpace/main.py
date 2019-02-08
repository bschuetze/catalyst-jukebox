from machine import Pin
import time

from umqtt.simple import MQTTClient
import network
import random

# Enter network details here
WIFI_SSID = "23412_900"
JUKEBOX_IP = "192.168.0.5"

def connectToWiFi(pwd):
  station.connect(WIFI_SSID, pwd)

led = Pin(5, Pin.OUT)
station = network.WLAN(network.STA_IF)
station.active(True)
# connectToWiFi("password")

loops = 0
while (not station.isconnected() and loops < 10):
  #Give some time to connect to Network and clear out log
  time.sleep(5)
  loops = loops + 1

print("Connected to wifi - " + str(station.isconnected()))

print()
print()
print()
print()
print()
print("------- STARTING -------")

# try:
#   SEED = SEED + time.ticks_us()
# except:
#   SEED = time.ticks_us()
SEED = time.ticks_cpu() * 183
print(SEED)
print("Seed: " + str(SEED))
random.seed(SEED)
# ID = random(10000000, 99999999)
ID = random.getrandbits(30)
print(ID)
defaultName = "catalyst-pager"
NAME = defaultName + "_" + str(ID)
print("Name: " + NAME)

# MQTT
# b"string" and bytes("string", "utf-8") are equivalent
GLOBAL_TOPIC = b"catalyst-jukebox_global"
PRIVATE_TOPIC = bytes(NAME, "utf-8")
client = MQTTClient(NAME, JUKEBOX_IP)
publishedName = False
mqttConnected = False



while True:
  led.value(not led.value())
  if (not mqttConnected and station.isconnected()):
    print(station.ifconfig())
    print("connecting to MQTT Broker")
    mqttConnected = True
    client.connect()
  
  if (not publishedName and station.isconnected()):
    print("Logging name with MQTT server")
    publishedName = True
    client.publish(GLOBAL_TOPIC, bytes(NAME, "utf-8"))
   
  time.sleep(1)








