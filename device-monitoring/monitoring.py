## AUTHOR: Brent Schuetze
## PROJECT: Catalyst Jukebox - https://github.com/bschuetze/catalyst-jukebox

import pyudev
#import

# Adding a blacklist for usb device models (device.get('ID_MODEL'))))
# Add your USB hub here if using one or any other devices you want to ignore
USB_BLACKLIST = ["USB_2.0_Hub__Safe_"]

context = pyudev.Context()

monitor = pyudev.Monitor.from_netlink(context)

monitor.filter_by('usb')
print (context)
print (monitor)

def usb_event(action, device):
    devicePathFull = device.get("ID_PATH")
    pathSplit = devicePathFull.split(":")
    print(pathSplit[len(pathSplit) - 1])
    try:
        usbPort = pathSplit[len(pathSplit) - 1]
        usbPort = usbPort.replace(".", "")

        if ((int(usbPort) >= 12) and (device.get('ID_MODEL') not in USB_BLACKLIST)):
            print("Monitoring " + device.get('ID_MODEL') + " at usb port " + pathSplit[len(pathSplit) - 1])
    except:
        print(pathSplit[len(pathSplit) - 1] + " is not a number of the form X.Y or X.Y.Z")


usbObs = pyudev.MonitorObserver(monitor, usb_event)
usbObs.start()


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
#             if ((int(usbPort) >= 12) and (device.get('ID_MODEL') not in USB_BLACKLIST)):
#                 print("Monitoring " + device.get('ID_MODEL') + " at usb port " + pathSplit[len(pathSplit) - 1])
#         except:
#             print(pathSplit[len(pathSplit) - 1] + " is not a number of the form X.Y or X.Y.Z")
#     print("-------------------")