## FLASHING COMMANDS:
# /c/Python3/Scripts/esptool.py.exe --chip esp32 -p COM3 erase_flash
# /c/Python3/Scripts/esptool.py.exe --chip esp32 -p COM3 write_flash -z 0x1000 /x/University/COMPCHST/catalyst-jukebox/esp32-micropython/esp32-20190207-v1.10-54-g43a894fb4.bin
# https://hackernoon.com/get-on-the-good-foot-with-micropython-on-the-esp32-decdd32c4720
# http://www.learningaboutelectronics.com/Articles/Vibration-motor-circuit.php

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

def pulse(start, timer, mode, interval, cb):
    if (start):
        print("Pulsing")
        timer.init(period=interval, mode=mode, callback=cb)
    else:
        print("Stopping pulse")
        timer.deinit()


def onboardLEDPulse(timer):
    ONBOARD_LED.value(not ONBOARD_LED.value())
    
def vibrationPulse(timer):
    VIBR_CONTROL.value(not VIBR_CONTROL.value())
    
def buzzerPulse(timer):
    BUZZ_CONTROL.value(not BUZZ_CONTROL.value())

def alertLEDPulse(timer):
    ledCtrl.alertLEDPulse(timer)

class LED_Control:
    def __init__(self):
        self.ONBOARD_LED_DURATION = 5
        self.ONBOARD_LED_COUNT = 0

    def alertLEDPulse(self, timer):
        self.ONBOARD_LED_COUNT = self.ONBOARD_LED_COUNT + 1
        if (self.ONBOARD_LED_COUNT == self.ONBOARD_LED_DURATION):
            self.ONBOARD_LED_COUNT = 0
            ONBOARD_LED.value(not ONBOARD_LED.value())

        if (pager.IDENTIFYING or pager.BUZZING):
            ALERT_LED1.value(not ALERT_LED1.value())
            ALERT_LED2.value(not ALERT_LED2.value())


def usbHandler(pin):
    pager.detectConnection(USB_PIN.value())
    if (USB_PIN.value() == 0):
        GREEN_LED.value(0)
        RED_LED.value(1)
    elif (USB_PIN.value() == 1):
        GREEN_LED.value(1)
        RED_LED.value(0)


connectToWiFi(utils.WIFI_PWD)

class Pager:
    def __init__(self):
        # CATALYST STUFF
        self.IN_USE = False
        self.BUZZING = False
        self.IDENTIFYING = False
        self.OWNER = ""
        self.CONNECTED = False
        self.MQTT_READY = False

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

    def earlyDisconnect(self):
        print("Assigned phone was disconnected early")
        self.deassign()
        self.buzz("True")

    def detectConnection(self, val):
        # Read pins, assign CONNECTED Accordingly
        print("USB Pin value: " + str(val))
        if (val == 0):
            usbPinValue = False
        else:
            usbPinValue = True

        if (usbPinValue != self.CONNECTED):
            self.CONNECTED = usbPinValue
            if (self.MQTT_READY):
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
        if (start == "True"):
            if (not self.BUZZING):
                print("Buzzing")
                self.BUZZING = True
                # Make buzzer calls
                VIBR_CONTROL.value(1)
                BUZZ_CONTROL.value(1)
                ALERT_LED1.value(1)
                ALERT_LED2.value(1)
                pulse(True, vibrationTimer, machine.Timer.PERIODIC, 500, vibrationPulse)
                pulse(True, buzzerTimer, machine.Timer.PERIODIC, 2, buzzerPulse)
            else:
                print("Already buzzing")
        else:
            if (self.BUZZING):
                print("Ending buzz")
                self.BUZZING = False
                # Clear buzzer stuff
                VIBR_CONTROL.value(0)
                BUZZ_CONTROL.value(0)
                ALERT_LED1.value(0)
                ALERT_LED2.value(0)
                pulse(False, vibrationTimer, machine.Timer.PERIODIC, 500, vibrationPulse)
                pulse(False, buzzerTimer, machine.Timer.PERIODIC, 2, buzzerPulse)
            else:
                print("Already not buzzing")

    def identify(self, start):
        if (start):
            print("Identifying")
            self.IDENTIFYING = True
            ALERT_LED1.value(1)
            ALERT_LED2.value(1)
            # Start detect Connection
        else:
            print("Ending identify")
            self.IDENTIFYING = False
            ALERT_LED1.value(0)
            ALERT_LED2.value(0)

# Devices
pager = Pager()
ledCtrl = LED_Control()

ONBOARD_LED = Pin(5, Pin.OUT)
ONBOARD_LED.value(0)
ALERT_LED1 = Pin(18, Pin.OUT)
ALERT_LED2 = Pin(2, Pin.OUT)
ALERT_LED1.value(0)
ALERT_LED2.value(0)

# onboardLEDTimer = machine.Timer(0)
LEDTimer = machine.Timer(0)
vibrationTimer = machine.Timer(1)
buzzerTimer = machine.Timer(2)

USB_PIN = Pin(13, Pin.IN)

GREEN_LED = Pin(16, Pin.OUT)
GREEN_LED.value(0)
RED_LED = Pin(17, Pin.OUT)
RED_LED.value(0)

VIBR_CONTROL = Pin(4, Pin.OUT)
VIBR_CONTROL.value(0)

BUZZ_CONTROL = Pin(21, Pin.OUT)
VIBR_CONTROL.value(0)

# WiFi
loops = 10 # CHANGE BACK TO 0
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
# pulse(True, onboardLEDTimer, machine.Timer.PERIODIC, 1000, onboardLEDPulse)
# pulse(True, LEDTimer, machine.Timer.PERIODIC, 1000, onboardLEDPulse)
pulse(True, LEDTimer, machine.Timer.PERIODIC, 200, alertLEDPulse)
# pulse(True, vibrationTimer, machine.Timer.PERIODIC, 2000, vibrationPulse)
# pulse(True, buzzerTimer, machine.Timer.PERIODIC, 2, buzzerPulse)

# onboardLEDTimer.init(period=1000, mode=machine.Timer.PERIODIC, callback=onboardLEDPulse)
# vibrationTimer.init(period=2000, mode=machine.Timer.PERIODIC, callback=vibrationPulse)
# buzzerTimer.init(period=2, mode=machine.Timer.PERIODIC, callback=buzzerPulse)

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
    print("Publishing status: " + str(pager.CONNECTED))
    client.publish(bytes(str(TOPIC_BASE + "/" + str(ID) +
                             "/status/connected"), "utf-8"), str(pager.CONNECTED))

def messageReceived(topic, msg):
    decTopic = topic.decode("ASCII")
    decMsg = msg.decode("ASCII")
    print("Topic: " + decTopic + ", Msg: " + decMsg)
    print()
    splitTopic = decTopic.split("/")
    if (splitTopic[-1] == "control"):
      if (decMsg == INIT_MSG):
        pager.resetPager()
        usbHandler(USB_PIN)
        # pager.detectConnection(USB_PIN.value())
        # updateConnection()
    if (splitTopic[-1] == "checkout"):
        pager.assign(decMsg)
    if (splitTopic[-1] == "return"):
        pager.deassign()
    if (splitTopic[-1] == "locate"):
        pager.buzz(decMsg)
    if (splitTopic[-1] == "earlyDisconnect"):
        pager.earlyDisconnect()


# Interrupt handlers
# USB_PIN.irq(trigger=(Pin.IRQ_FALLING | Pin.IRQ_RISING), handler=usbHandler, priority=1, wake=(machine.IDLE | machine.SLEEP), hard=False)
USB_PIN.irq(trigger=(Pin.IRQ_FALLING | Pin.IRQ_RISING), handler=usbHandler)


while True:
    # ONBOARD_LED.value(not ONBOARD_LED.value())
    if (not mqttConnected and station.isconnected()):
        print(station.ifconfig())
        print("connecting to MQTT Broker")
        mqttConnected = True
        client.connect()

    if (not publishedName and station.isconnected()):
        pager.MQTT_READY = True
        print("Logging name with MQTT server")
        publishedName = True
        print(bytes(str(TOPIC_BASE + "/global/init"), "utf-8"))
        print(str(ID))
        client.set_callback(messageReceived)
        # client.subscribe(bytes(str(TOPIC_BASE + "/" + str(ID) + "/control"), "utf-8"))
        # client.subscribe(bytes(str(TOPIC_BASE + "/" + str(ID) + "/checkout"), "utf-8"))
        # client.subscribe(bytes(str(TOPIC_BASE + "/" + str(ID) + "/locate"), "utf-8"))
        client.subscribe(bytes(str(TOPIC_BASE + "/" + str(ID) + "/#"), "utf-8"))
        client.publish(bytes(str(TOPIC_BASE + "/global/init"), "utf-8"), (str(ID)))

    if (publishedName and station.isconnected()):
        client.check_msg()

    # pager.buzz(not pager.BUZZING)
    
    time.sleep(2)










