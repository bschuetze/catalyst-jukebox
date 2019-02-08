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
import bluetooth as bt
import paho.mqtt.client as mqtt

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
    def __init__(self, port, id):
        self.port = port
        self.modelID = id
        self.inUse = False
        self.connected = True


GLOBAL_TOPIC = "catalyst-jukebox_global"
PAGER_TOPICS = []
CLIENT_ID = "catalyst-jukebox_MAIN"


def onConnect(client, userdata, flags, rc):
    print("MQTT connected with code: " + rc)
    client.subscribe(GLOBAL_TOPIC)


def onDisconnect(client, userdata, rc):
    print("ERROR CONNECTING")
    print(rc)


def onMessage(client, userdata, msg):
    print("New Message:")
    print("  - client: " + client)
    print("  - topic: " + msg.topic)
    print("  - message: " + str(msg.payload))

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

# def 

# Sends JSON data
def server_communication(dest, method, header=None, body=None, respFunc=None):
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
        respFunc(r)
    else:
        print(r)

# act = action, loc = location, mod = model
def send_usb(act, loc, mod, respFunc=None):
    dest = "http://" + get_ip() + ":" + str(NODE_PORT) + "/usbUpdate"
    server_communication(dest, "POST", None, {"model": mod, "location": loc, "action": act}, respFunc)


def usb_event(action, device):
    print(action)
    print(device.device_path)
    print(device.get("ID_PATH"))
    print(device.get("ID_MODEL"))

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
                        pagers.append(tempPager)
                        print("Pager " + tempPager.modelID +
                                " connected at usb port " + tempPager.port)
                else:
                    if (action == "add"):
                        if (usbPort not in connectedDevices):
                            connectedDevices[usbPort] = device.get("ID_MODEL")
                            print("Monitoring " + device.get("ID_MODEL") +
                                " at usb port " + usbPort)
                            # Send info to server
                            send_usb(action, usbPort, device.get("ID_MODEL"))
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

        except:
            print(pathSplit[len(pathSplit) - 1] +
                " is not a number of the form X.Y or X.Y.Z")


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

# MQTT STUFF
# client = mqtt.Client(client_id=CLIENT_ID, clean_session=True, userdata=None, protocol=mqtt.MQTTv31)
client = mqtt.Client()
client.on_connect = onConnect
client.on_disconnect = onDisconnect
client.on_message = onMessage
client.connect("localhost", 1883, 60)
# client.loop_start()
client.loop_forever()


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


print("sleeping 120s")
time.sleep(120)

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
