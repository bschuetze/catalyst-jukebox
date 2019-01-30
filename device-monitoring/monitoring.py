## AUTHOR: Brent Schuetze
## PROJECT: Catalyst Jukebox - https://github.com/bschuetze/catalyst-jukebox

import pyudev
#import


context = pyudev.Context()
monitor = Monitor.from_netlink()
monitor.filter_by(susbsytem='usb')
print (context)
print (monitor)