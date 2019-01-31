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


# Port that node is listening on
NODE_PORT = 6474
# Adding a blacklist for usb device models (device.get('ID_MODEL'))))
# Add your USB hub here if using one or any other devices you want to ignore
USB_BLACKLIST = ["USB_2.0_Hub__Safe_"]
# Pluggable ports start at 1.2
USB_PORT_START = 12
# List of connected devices
connectedDevices = {}

# Pyudev vars
context = pyudev.Context()
monitor = pyudev.Monitor.from_netlink(context)


monitor.filter_by('usb')
print (context)
print (monitor)

# def 

def usb_event(action, device):
    if (device.get("ID_PATH") is not None):
        devicePathFull = device.get("ID_PATH")
        pathSplit = devicePathFull.split(":")
        # print(pathSplit[len(pathSplit) - 1])
        try:
            usbPort = pathSplit[len(pathSplit) - 1]
            usbPort = usbPort.replace(".", "")

            if ((int(usbPort) >= USB_PORT_START) and (device.get('ID_MODEL') not in USB_BLACKLIST)):

                if (action == "add"):
                    if (usbPort not in connectedDevices):
                        connectedDevices[usbPort] = device.get("ID_MODEL")
                        print("Monitoring " + device.get('ID_MODEL') + " at usb port " + usbPort)
                        # Send info to server
                        send_usb(action, usbPort, device.device.get("ID_MODEL"))
                    else:
                        print(device.get('ID_MODEL') + " connected at usb port " + usbPort + 
                        " but port already contains " + connectedDevices[usbPort])
                        ## NEED TO HANDLE THIS WITH A MANUAL CHECK
                elif (action == "remove"):
                    if (usbPort in connectedDevices):
                        connectedDevices.pop(usbPort)
                        print("Disconnecting " + device.get('ID_MODEL') + " from usb port " + usbPort)
                        send_usb(action, usbPort, device.device.get("ID_MODEL"))
                    else:
                        print(device.get('ID_MODEL') + " disconnecting from usb port " + usbPort + 
                        " but port is already empty")
                        ## NEED TO HANDLE THIS WITH A MANUAL CHECK

                else:
                    print("Non add/remove action detected")
                    print("Action: '" + action + "' applied to " + device.get('ID_MODEL') + " from usb port " + usbPort)

                print("Connected devices: " + str(connectedDevices))

                # if (usbPort in occupiedPorts):
                #     occupiedPorts.remove(usbPort)
                #     connectedDevices.remove({"port": usbPort, "model": device.get("ID_MODEL")})
                #     print("Removed " + device.get('ID_MODEL') + " from usb port " + usbPort)
                # else:
                #     occupiedPorts.append(usbPort)
                #     connectedDevices.append({"port": usbPort, "model": device.get("ID_MODEL")})
                #     print("Monitoring " + device.get('ID_MODEL') + " at usb port " + usbPort)

        except:
            print(pathSplit[len(pathSplit) - 1] + " is not a number of the form X.Y or X.Y.Z")
    # else:
    #     print("USB device path is None type, " + str(device) + " " + action)

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


usbObserver = pyudev.MonitorObserver(monitor, usb_event)
usbObserver.start()

time.sleep(60)

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
