## AUTHOR: Brent Schuetze
## PROJECT: Catalyst Jukebox - https://github.com/bschuetze/catalyst-jukebox

import pyudev
#import

context = pyudev.Context()

monitor = pyudev.Monitor.from_netlink(context)

monitor.filter_by('usb')
print (context)
print (monitor)

for device in context.list_devices(subsystem='usb'):
    print (device)
    print ("Vendor: " + str(device.get('ID_VENDOR_ID')))
    print ("Serial: " + str(device.get('ID_SERIAL')))
    print ("Model: " + str(device.get('ID_MODEL')))
    print ("Type: " + str(device.get('ID_TYPE')))
    print ("Path: " + str(device.get('ID_PATH')))