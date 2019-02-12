## FLASHING COMMANDS:
# /c/Python3/Scripts/esptool.py.exe --chip esp32 -p COM3 erase_flash
# /c/Python3/Scripts/esptool.py.exe --chip esp32 -p COM3 write_flash -z 0x1000 /x/University/COMPCHST/catalyst-jukebox/esp32-micropython/esp32-20190207-v1.10-54-g43a894fb4.bin
# https://hackernoon.com/get-on-the-good-foot-with-micropython-on-the-esp32-decdd32c4720

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

class Pager:
    def __init__(self):
        # CATALYST STUFF
        self.IN_USE = False
        self.BUZZING = False
        self.IDENTIFYING = False
        self.OWNER = ""
        self.CONNECTED = False

    def resetPager(self):
        print("Resetting pager")
        self.IN_USE = False
        self.BUZZING = False
        self.OWNER = ""
        self.CONNECTED = False

    def assign(self, user):
        print("Assigning to user: " + str(user))
        self.IN_USE = True
        self.OWNER = user
        self.identify(True)

    def deassign(self):
        print("Deassigning pager from " + str(self.OWNER))
        self.IN_USE = False
        self.OWNER = ""

    def detectConnection(self):
        # Read pins, assign CONNECTED Accordingly
        print("Reading Pins")
        usbPinValue = False
        if (usbPinValue != self.CONNECTED):
            self.CONNECTED = usbPinValue
            updateConnection()
            if (self.CONNECTED):
                print("Connected")
            else:
                print("Disconnected")
                if (self.IDENTIFYING):
                    self.identify(False)
                if (self.BUZZING):
                    self.buzz(False)
    
    def buzz(self, start):
        if (start):
            print("Buzzing")
            self.BUZZING = True
            # Make buzzer calls
        else:
            print("Ending buzz")
            self.BUZZING = False
            # Clear buzzer stuff

    def identify(self, start):
        if (start):
            print("Identifying")
            self.IDENTIFYING = True
            # Light LEDS
            # Start detect Connection
        else:
            print("Ending identify")
            self.IDENTIFYING = False
            # Kill LEDS

# Devices
pager = Pager()

ONBOARD_LED = Pin(5, Pin.OUT)
ONBOARD_LED.value(0)
onboardLEDTimer = machine.Timer(0)

USB_PIN = Pin(13, Pin.IN)
GREEN_LED = Pin(16, Pin.OUT)
GREEN_LED.value(0)
WHITE_LED = Pin(17, Pin.OUT)
WHITE_LED.value(0)

# WiFi
loops = 10
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
INIT_MSG = "initialize-pager"
TOPIC_BASE = "catalyst-jukebox"
PRIVATE_TOPIC = bytes(str(TOPIC_BASE + "/" + str(ID)), "utf-8")
client = MQTTClient(NAME, JUKEBOX_IP)
publishedName = False
mqttConnected = False

def updateConnection():
    client.publish(bytes(str(TOPIC_BASE + "/" + str(ID) +
                             "/status/connected"), "utf-8"), str(pager.CONNECTED))

def messageReceived(topic, msg):
    decTopic = topic.decode("ASCII")
    decMsg = msg.decode("ASCII")
    print("Topic: " + decTopic + ", Msg: " + decMsg)
    splitTopic = decTopic.split("/")
    if (splitTopic[-1] == "control"):
      if (decMsg == INIT_MSG):
        pager.resetPager()
        pager.detectConnection()
        updateConnection()
    if (splitTopic[-1] == "checkout"):
        pager.assign(decMsg)

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
        client.subscribe(bytes(str(TOPIC_BASE + "/" + str(ID) + "/control"), "utf-8"))
        client.subscribe(bytes(str(TOPIC_BASE + "/" + str(ID) + "/checkout"), "utf-8"))

    if (publishedName and station.isconnected()):
        client.check_msg()
    
    if (USB_PIN.value() == 0):
      GREEN_LED.value(0)
      WHITE_LED.value(1)
    elif (USB_PIN.value() == 1):
      GREEN_LED.value(1)
      WHITE_LED.value(0)
      
    
    time.sleep(5)




