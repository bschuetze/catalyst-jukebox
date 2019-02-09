import machine
from machine import Pin
import time

import utils

from umqtt.simple import MQTTClient
import network
import random

# Enter network details here
WIFI_SSID = "23412_900"
JUKEBOX_IP = "192.168.0.5"
station = network.WLAN(network.STA_IF)
station.active(True)
# connectToWiFi("password")


def connectToWiFi(pwd):
    station.connect(WIFI_SSID, pwd)

def vibrate(on):
    if (on):
        # set the pins to turn on vibration motor
        # start pulse
        print("Turning on vibration")
    else:
        # clear the pins to the vibration motor
        # stop pulse
        print("Turning off vibration")

def pulse(device, cont, interval):
    # if (cont):
    #     device.value(not device.value())
    #     timer.callback(pulse(device, cont, interval))
    # else:
    print("Pulsing")

def onboardLEDPulse(timer):
    ONBOARD_LED.value(not ONBOARD_LED.value())
    


connectToWiFi(utils.WIFI_PWD)

# CATALYST STUFF
IN_USE = False
BUZZING = False
OWNER = ""
CONNECTED = False

def resetPager():
    IN_USE = False
    BUZZING = False
    OWNER = ""
    CONNECTED = False

def assign(user):
    IN_USE = True
    OWNER = user

def deassign():
    IN_USE = False
    OWNER = ""

def detectConnection():
    # Read pins, assign CONNECTED Accordingly
    print("Reading Pins")

def buzz(start):
    if (start):
        BUZZING = True
        # Make buzzer calls
    else:
        BUZZING = False
        # Clear buzzer stuff


def messageReceived(topic, msg):
    print(str(topic) + " " + str(msg))

# Devices
ONBOARD_LED = Pin(5, Pin.OUT)
ONBOARD_LED.value(0)
onboardLEDTimer = machine.Timer(0)

# WiFi
loops = 0
while (not station.isconnected() and loops < 10):
    # Give some time to connect to Network and clear out log
    time.sleep(5)
    loops = loops + 1

print("Connected to wifi - " + str(station.isconnected()))
print()
print()
print()
print()
print()
print("------- STARTING -------")

# Timers
onboardLEDTimer.init(period=1000, mode=machine.Timer.PERIODIC, callback=onboardLEDPulse)

# try:
#   SEED = SEED + time.ticks_us()
# except:
#   SEED = time.ticks_us()

# Init random
SEED = time.ticks_cpu() * 183
print(SEED)
print("Seed: " + str(SEED))
random.seed(SEED)

# Generate ID
ID = random.getrandbits(30)
print(ID)
defaultName = "catalyst-pager"
NAME = defaultName + "_" + str(ID)
print("Name: " + NAME)

# MQTT
# b"string" and bytes("string", "utf-8") are equivalent
TOPIC_BASE = "catalyst-jukebox"
PRIVATE_TOPIC = bytes(str(TOPIC_BASE + "/" + str(ID)), "utf-8")
client = MQTTClient(NAME, JUKEBOX_IP)
publishedName = False
mqttConnected = False

while True:
    # ONBOARD_LED.value(not ONBOARD_LED.value())
    if (not mqttConnected and station.isconnected()):
        print(station.ifconfig())
        print("connecting to MQTT Broker")
        mqttConnected = True
        client.connect()

    if (not publishedName and station.isconnected()):
        print("Logging name with MQTT server")
        publishedName = True
        print(bytes(str(TOPIC_BASE + "/global/init"), "utf-8"))
        print(str(ID))
        client.publish(bytes(str(TOPIC_BASE + "/global/init"), "utf-8"), (str(ID)))
        client.set_callback(messageReceived)
        # client.publish(GLOBAL_TOPIC, bytes(NAME, "utf-8"))

    if (publishedName and station.isconnected()):
        client.check_msg()
    
    time.sleep(5)



