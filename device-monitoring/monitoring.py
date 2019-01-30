## AUTHOR: Brent Schuetze
## PROJECT: Catalyst Jukebox - https://github.com/bschuetze/catalyst-jukebox

import pyudev
import time

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
                    else:
                        print(device.get('ID_MODEL') + " connected at usb port " + usbPort + 
                        " but port already contains " + connectedDevices[usbPort])
                        ## NEED TO HANDLE THIS WITH A MANUAL CHECK
                elif (action == "remove"):
                    if (usbPort in connectedDevices):
                        connectedDevices.pop(usbPort)
                        print("Disconnecting " + device.get('ID_MODEL') + " from usb port " + usbPort)
                    else:
                        print(device.get('ID_MODEL') + " disconnecting from usb port " + usbPort + 
                        " but port is already empty")
                        ## NEED TO HANDLE THIS WITH A MANUAL CHECK

                else:
                    print("Non add/remove action detected")
                    print("Action: '" + action + "' applied to " + device.get('ID_MODEL') + " from usb port " + usbPort)

                print(connectedDevices)    

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