## AUTHOR: Brent Schuetze
## PROJECT: Catalyst Jukebox - https://github.com/bschuetze/catalyst-jukebox

import pyudev
#import

context = pyudev.Context()

monitor = pyudev.Monitor.from_netlink(context)

monitor.filter_by(susbsytem='usb')
print (context)
print (monitor)

for device in context.list_devices():
    print (device)
    