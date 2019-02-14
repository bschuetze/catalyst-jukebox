## AUTHOR: Brent Schuetze
## PROJECT: Catalyst Jukebox - https://github.com/bschuetze/catalyst-jukebox

## Relevant Docs:
# https://pyudev.readthedocs.io/en/latest/guide.html
# https://pyudev.readthedocs.io/en/latest/api/pyudev.html#pyudev.Device
# https://pipenv.readthedocs.io/en/latest/basics/
# https://stackoverflow.com/questions/25494086/retrieve-usb-information-using-pyudev-with-device-name
# http://docs.python-requests.org/en/master/user/quickstart/
# 

import pyudev
import time
import requests
import socket
import sched
import paho.mqtt.client as mqtt
import RPi.GPIO as GPIO

# get_ip() original code from: 
# https://stackoverflow.com/questions/166506/finding-local-ip-addresses-using-pythons-stdlib
def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        IP = s.getsockname()[0]
    except:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

class Pager:
    def __init__(self, id):
        self.ID = id
        self.inUse = False
        self.connected = False
        self.initialized = False

    def __str__(self):
        return str("PAGER - ID: " + str(self.ID) + ", in-use: " + str(self.inUse) + ", connected: " +
                str(self.connected) + ", initialized: " + str(self.initialized))

    def updateConnection(self, con):
        self.connected = con

    def notInUse(self):
        return (not self.inUse)

    def init(self):
        self.initialized = True

    def checkOut(self):
        self.inUse = True


class User:
    def __init__(self, id, model, port, pid):
        self.userID = id
        self.model = model
        self.port = port
        self.pagerID = pid

    def matches(self, mod, port):
        return (self.model == mod and self.port == port)


GPIO.setmode(GPIO.BCM)
TOPIC_BASE = "catalyst-jukebox"
PAGER_IDS = []
MQTT_PAGERS = {}
CLIENT_ID = "catalyst-jukebox_MAIN"
schedule = sched.scheduler(time.time, time.sleep)
BUZZ_DURATION = 15

def onConnect(client, userdata, flags, rc):
    print("MQTT connected with code: " + mqtt.connack_string(rc))
    client.subscribe(TOPIC_BASE + "/global/init")
    client.subscribe(TOPIC_BASE + "/+/status/#")


def onSubscribe(client, userdata, mid, granted_qos):
    print("Subscribed to a topic")


def onDisconnect(client, userdata, rc):
    print("Disconnection returned result: " + str(rc))


def onMessage(client, userdata, msg):
    msgDec = str(msg.payload.decode("ASCII"))
    print("New Message:")
    # print("  - client: " + str(client))
    print("  - topic: " + msg.topic)
    print("  - message: " + msgDec)
    topicSplit = msg.topic.split("/")
    if (msg.topic == TOPIC_BASE + "/global/init"):
        print("Message from global init topic, parsing")
        # Check if new pager calling in
        if (msgDec not in PAGER_IDS):
            # Create the new pager, and subscribe to that topic
            PAGER_IDS.append(msgDec)
            MQTT_PAGERS[msgDec] = Pager(msgDec)
            print(MQTT_PAGERS[msgDec])
            # Publish setup message
            client.publish((TOPIC_BASE + "/" + msg.payload.decode("ASCII") + "/control"), payload="initialize-pager", qos=1, retain=False)
    if (topicSplit[-2] == "status"):
        if (topicSplit[-1] == "connected"):
            print("Updating Pager " + topicSplit[1] + " connection state to " + msgDec)
            MQTT_PAGERS[topicSplit[1]].updateConnection(msgDec)
            MQTT_PAGERS[topicSplit[1]].init()
        





# def on_connect(client, userdata, flags, rc):
#     print("Connection returned result: " + mqtt.connack_string(rc))
#     client.subscribe(GLOBAL_TOPIC)


# def on_subscribe(client, userdata, mid, granted_qos):
#     print("Subscribed to a topic")


# def on_disconnect(client, userdata, rc):
#     print("Disconnection returned result: " + str(rc))


# def on_message(client, userdata, msg):
#     print(msg.topic+" "+str(msg.payload))

# Port that node is listening on
NODE_PORT = 6474
# Adding a blacklist for usb device models (device.get('ID_MODEL'))))
# Add your USB hub here if using one or any other devices you want to ignore
USB_BLACKLIST = ["USB_2.0_Hub__Safe_"]
# Add pagers to distinguish between them and phones
# Add other names here if they differ
USB_PAGERS = ["FT231X_USB_UART"]
# Pluggable ports start at 1.2
USB_PORT_START = 12
# USERS
USERS = []
# List of connected devices
connectedDevices = {}
# List of all Pagers
pagers = []

# Pyudev vars
context = pyudev.Context()
monitor = pyudev.Monitor.from_netlink(context)


monitor.filter_by('usb')
print (context)
print (monitor)


# MQTT STUFF
client = mqtt.Client(client_id=CLIENT_ID, clean_session=True)
# client = mqtt.Client()
client.on_connect = onConnect
client.on_disconnect = onDisconnect
client.on_subscribe = onSubscribe
client.on_message = onMessage
client.connect(get_ip(), 1883, 60)
client.loop_start()
time.sleep(5)
# print("LOOPING")
# client.loop_forever()

# def 

# Sends JSON data
def server_communication(dest, method, header=None, body=None, respFunc=None, **args):
    h = {}
    b = {}

    if header is not None:
        h = header

    if body is not None:
        b = body

    if method == "GET":
        r = requests.get(dest, headers=h, json=b)
    elif method == "POST":
        r = requests.post(dest, headers=h, json=b)
    elif method == "PUT":
        r = requests.put(dest, headers=h, json=b)
    elif method == "DELETE":
        r = requests.delete(dest, headers=h, json=b)
    elif method == "HEAD":
        r = requests.head(dest, headers=h, json=b)
    elif method == "OPTIONS":
        r = requests.options(dest, headers=h, json=b)
    else:
        print("Method not properly defined: " + method)

    if (respFunc is not None):
        respFunc(r, **args)
    else:
        print("Status: " + str(r.status_code) + " ")
        if (r.headers["Content-Type"] == "application/json"):
            print(r.json())
        else:
            print(r.text)

# act = action, loc = location, mod = model
def send_usb(act, loc, mod, respFunc=None):
    dest = "http://" + get_ip() + ":" + str(NODE_PORT) + "/usbUpdate"
    server_communication(dest, "POST", None, {"model": mod, "location": loc, "action": act}, respFunc, port=loc, model=mod)

def connectDevice(resp, **args):
    # Body return has the form ID:0000
    if (resp.status_code == 200):
        tempSplit = resp.text.split(":")
        tempID = tempSplit[-1]

        # Get a free pager
        for pid in PAGER_IDS:
            if (MQTT_PAGERS[pid].notInUse()):
                print("Checking out pager: " + pid + " for user " + tempID)
                tempPagerID = pid
                checkoutPager(tempPagerID, tempID)
                break

        USERS.append(User(tempID, args["model"], args["port"], tempPagerID))
    else:
        print("Status not 200")
        print(resp)
        print(args)

def checkoutPager(pid, uid):
    MQTT_PAGERS[pid].checkOut()
    client.publish((TOPIC_BASE + "/" + pid +
                    "/checkout"), payload=str(uid), qos=1, retain=False)

def buzzPager(pid, start):
    print("Buzzing " + str(pid) + " " + str(start))
    client.publish((TOPIC_BASE + "/" + pid + "/locate"),
                   payload=str(start), qos=1, retain=False)

def locatePager():
    dest = "http://" + get_ip() + ":" + str(NODE_PORT) + "/currentUID"
    server_communication(dest, "POST", None, None, locatePagerCB)

def locatePagerCB(resp):
    if (resp.status_code == 200):
        tempSplit = resp.text.split(":")
        currentUserID = tempSplit[-1]
        print("Current UID: " + str(currentUserID))
        found = False
        for user in USERS:
            if (user.userID == currentUserID):
                print("Found pager: " + user.pagerID)
                found = True
                buzzPager(user.pagerID, True)
                # schedule.enter(BUZZ_DURATION, 1, buzzPager,
                #                kwargs={"pid": str(user.pagerID), "start": False})
                schedule.enter(BUZZ_DURATION, 1, buzzPager, (str(user.pagerID), False))
                break
        if (not found):
            print("Did not find a user with ID: " + str(currentUserID))
    else:
        print("Status not 200")
        print(resp)


def usb_event(action, device):
    # print(action)
    # print(device.device_path)
    # print(device.get("ID_PATH"))
    # print(device.get("ID_MODEL"))

    if (device.device_path is not None and device.get("ID_MODEL") is not None):
        devicePathFull = device.device_path
        pathSplit = devicePathFull.split("-")

        try:
            usbPort = pathSplit[len(pathSplit) - 1]
            usbPort = usbPort.replace(".", "")

            if ((int(usbPort) >= USB_PORT_START) and (device.get('ID_MODEL') not in USB_BLACKLIST)):
                if (device.get("ID_MODEL") in USB_PAGERS):
                    if (action == "add"):
                        tempPager = Pager(usbPort, device.get("ID_MODEL"))
                        # pagers.append(tempPager)
                        print("Pager " + tempPager.modelID +
                              " connected at usb port " + usbPort)
                    if (action == "remove"):
                        print("Pager " + tempPager.modelID +
                              " removed from usb port " + usbPort)
                else:
                    if (action == "add"):
                        if (usbPort not in connectedDevices):
                            connectedDevices[usbPort] = device.get("ID_MODEL")
                            print("Monitoring " + device.get("ID_MODEL") +
                                " at usb port " + usbPort)
                            # Send info to server
                            send_usb(action, usbPort, device.get("ID_MODEL"), connectDevice)
                        else:
                            print(device.get('ID_MODEL') + " connected at usb port " + usbPort +
                                " but port already contains " + connectedDevices[usbPort])
                            ## NEED TO HANDLE THIS WITH A MANUAL CHECK
                    elif (action == "remove"):
                        if (usbPort in connectedDevices):
                            connectedDevices.pop(usbPort)
                            print("Disconnecting " + device.get('ID_MODEL') +
                                " from usb port " + usbPort)
                            send_usb(action, usbPort, device.get("ID_MODEL"))
                        else:
                            print(device.get('ID_MODEL') + " disconnecting from usb port " + usbPort +
                                " but port is already empty")
                            ## NEED TO HANDLE THIS WITH A MANUAL CHECK

                    else:
                        print("Non add/remove action detected")
                        print("Action: '" + action + "' applied to " +
                            device.get('ID_MODEL') + " from usb port " + usbPort)

                    print("Connected devices: " + str(connectedDevices))

        except Exception as e:
            print("ERROR:")
            print(e)
            # print(pathSplit[len(pathSplit) - 1] +
            #     " is not a number of the form X.Y or X.Y.Z")


    # if (device.get("ID_PATH") is not None):
    #     devicePathFull = device.get("ID_PATH")
    #     pathSplit = devicePathFull.split(":")
    #     # print(pathSplit[len(pathSplit) - 1])
    #     try:
    #         usbPort = pathSplit[len(pathSplit) - 1]
    #         usbPort = usbPort.replace(".", "")

    #         if ((int(usbPort) >= USB_PORT_START) and (device.get('ID_MODEL') not in USB_BLACKLIST)):

    #             if (action == "add"):
    #                 if (usbPort not in connectedDevices):
    #                     connectedDevices[usbPort] = device.get("ID_MODEL")
    #                     print("Monitoring " + device.get('ID_MODEL') +
    #                           " at usb port " + usbPort)
    #                     # Send info to server
    #                     send_usb(action, usbPort, device.get("ID_MODEL"))
    #                 else:
    #                     print(device.get('ID_MODEL') + " connected at usb port " + usbPort +
    #                           " but port already contains " + connectedDevices[usbPort])
    #                     ## NEED TO HANDLE THIS WITH A MANUAL CHECK
    #             elif (action == "remove"):
    #                 if (usbPort in connectedDevices):
    #                     connectedDevices.pop(usbPort)
    #                     print("Disconnecting " + device.get('ID_MODEL') +
    #                           " from usb port " + usbPort)
    #                     send_usb(action, usbPort, device.get("ID_MODEL"))
    #                 else:
    #                     print(device.get('ID_MODEL') + " disconnecting from usb port " + usbPort +
    #                           " but port is already empty")
    #                     ## NEED TO HANDLE THIS WITH A MANUAL CHECK

    #             else:
    #                 print("Non add/remove action detected")
    #                 print("Action: '" + action + "' applied to " +
    #                       device.get('ID_MODEL') + " from usb port " + usbPort)

    #             print("Connected devices: " + str(connectedDevices))

                # if (usbPort in occupiedPorts):
                #     occupiedPorts.remove(usbPort)
                #     connectedDevices.remove({"port": usbPort, "model": device.get("ID_MODEL")})
                #     print("Removed " + device.get('ID_MODEL') + " from usb port " + usbPort)
                # else:
                #     occupiedPorts.append(usbPort)
                #     connectedDevices.append({"port": usbPort, "model": device.get("ID_MODEL")})
                #     print("Monitoring " + device.get('ID_MODEL') + " at usb port " + usbPort)

        # except:
        #     print(pathSplit[len(pathSplit) - 1] +
        #           " is not a number of the form X.Y or X.Y.Z")
    # else:
    #     print("USB device path is None type, " + str(device) + " " + action)

# Button callback
def locateButtonCB(channel):
    if (GPIO.input(16)):
        print("Locate button high")
        # Pin 16 high
        locatePager()
    else:
        # Pin 16 low
        print("Locate button low")

# Button
# Receive:
GPIO.setup(16, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
# Supply:
GPIO.setup(21, GPIO.OUT)
GPIO.output(21, GPIO.HIGH)
# Interrupts:
GPIO.add_event_detect(16, GPIO.BOTH, callback=locateButtonCB, bouncetime=100)


# USB STUFF
usbObserver = pyudev.MonitorObserver(monitor, usb_event)
usbObserver.start()


# devices = bt.discover_devices(lookup_names=True)\

# btpagers = []

# print("Devices found: %s" % len(devices))

# for addr, name in devices:
#     print(name + " at " + addr)
#     if (name == "Pixel XL"):
#         btpagers.append((name, addr))
#         print(btpagers)


print("sleeping 3000s")
time.sleep(3000)

# for device in context.list_devices(subsystem='usb'):
#     print(device)
#     print("Vendor: " + str(device.get('ID_VENDOR_ID')))
#     print("Serial: " + str(device.get('ID_SERIAL')))
#     print("Model: " + str(device.get('ID_MODEL')))
#     print("Type: " + str(device.get('ID_TYPE')))
#     print("Path: " + str(device.get('ID_PATH')))

#     if (device.get("ID_PATH") is not None):
#         devicePathFull = device.get("ID_PATH")
#         pathSplit = devicePathFull.split(":")
#         print(pathSplit[len(pathSplit) - 1])
#         try:
#             usbPort = pathSplit[len(pathSplit) - 1]
#             usbPort = usbPort.replace(".", "")

#             # if (float(pathSplit[len(pathSplit) - 1]) >= 1.2):
#             if ((int(usbPort) >= USB_PORT_START) and (device.get('ID_MODEL') not in USB_BLACKLIST)):
#                 print("Monitoring " + device.get('ID_MODEL') + " at usb port " + pathSplit[len(pathSplit) - 1])
#         except:
#             print(pathSplit[len(pathSplit) - 1] + " is not a number of the form X.Y or X.Y.Z")
#     print("-------------------")
