![Catalyst Jukebox Banner](assets/catalyst.png?raw=true)


# Contents
* [Project Introduction](#catalyst-jukebox)
* [Setup](#setup)
* [Contributing](#how-to-contribute)
* [Contact](#contact)
* [Other Media](#other-media)
* [License](#license)

---

# Catalyst Jukebox
#### *A modern jukebox with a focus on social interactions*
## What is it?

## Why should I care?






does it have links to other important documentation?  


# Setup

## Hardware
![Raspberry Pi 3 B](assets/raspberry-pi-3-b.jpg?raw=true)  
![ESP32 Thing](assets/esp32-thing.jpg?raw=true)  

Here is a list of hardware I have used for this project:
* [Raspberry Pi 3 Model B](https://www.raspberrypi.org/products/raspberry-pi-3-model-b/) for the server and Spotify audio device
* [5 inch touch screen](https://www.ebay.com.au/itm/5-Inch-LCD-Touch-Screen-HDMI-Display-800-480-Raspberry-Pi-3-2-eParcel-Sydney/152408334219?ssPageName=STRK%3AMEBIDX%3AIT&_trksid=p2057872.m2749.l2649) for the Raspberry Pi to display QR codes and other information, you can also choose to forgo the screen if you'd like  
*Note: any screen is probably fine, however this is a generic model and as such I don't have a better link, so this is the exact one I used*
* [Sparkfun ESP32 Thing](https://www.sparkfun.com/products/13907) as the location device *(also referred to as the 'restaurant pager/buzzer')*  
*Note: any ESP32 is probably fine, however this one has LiPo charging and power already implemented which is nice*
* Components
    * Resistors (Ω)
        * 1K (x1)
        * 220 (x4, more if you want more LEDS)
        * ~3K3 (x1)
        * ~2K (x1)
    * Diode (x1, IN4002 or similar)
    * Capacitor (x1, 0.1 µF)
    * Transistor (x1, 2N2222 or similar)
    * LEDS (x4, I used Red, Green, 2 Blue)
    * 3V Vibration Motor (x1)
    * Buzzer (x1)
    * Momentary Button (x1, I used an illuminated model)
    * LiPo Battery (x1)
    * Protoboard or Breadboard etc.
    * Some way to connect everything (wires, solder, jumper cables, hearders etc.)

## Configuring Raspberry Pi
### Set up the Pi
1. Download the [Raspbian Desktop](https://www.raspberrypi.org/downloads/raspbian/) image from the [Raspberry Pi Website](https://www.raspberrypi.org/)

2. Flash the image to an SD card (windows method follows)
    * Download and install [etcher](https://www.balena.io/etcher/)
    * Flash the raspbian image to a microsd card (preferrably 8GB+) using etcher  
    ![etcher](assets/etcher.png)

3. Boot the Raspberry Pi
    * update software
    * enable ssh, set hostname, enable networking, locale etc.  

## Configuring Restaurant Pager (ESP32)
### Flashing Software
*Note:* If you're using Windows then you may need drivers for the ESP32, if you're using the 'Thing' like I am then you'll need [FTDI Drivers](https://www.ftdichip.com/Drivers/VCP.htm), other boards may need [something else](https://www.silabs.com/products/interface/usb-bridges/classic-usb-bridges/device.cp2102).  

1. If you don't have it already, install [Python 3](https://realpython.com/installing-python/)

2. Install the [ESPTool](https://github.com/espressif/esptool) with pip using `pip install esptool`

3. Download the [ESP32 micropython firmware](http://micropython.org/download#esp32)

4. Download the uPyCraft IDE
    * [Windows](https://randomnerdtutorials.com/install-upycraft-ide-windows-pc-instructions/)
    * [Mac](https://randomnerdtutorials.com/install-upycraft-ide-mac-os-x-instructions/)
    * [Linux](https://randomnerdtutorials.com/install-upycraft-ide-linux-ubuntu-instructions/)

5. Plug the ESP32 into your computer and find its location (the upycraft links will have some information on this, for me it is COM3 on Windows)

Note: Step 6 and 7 can be done from uPyCraft, however mine only worked intermittently whereas the normal methods worked every time, you can try that method if you want to [here](#flashing-with-upycraft).

6. Erase the existing flash with:  
`esptool.py.exe --chip esp32 -p COM3(YOUR PORT) erase_flash`  
*Note: windows uses esptool.py.exe, it will be different on Linux and Mac*

7. Write the new micropython firmware you just downloaded to the board with:  
`esptool.py.exe --chip esp32 -p COM3(YOUR PORT) write_flash -z 0x1000 /path/to/firmware.bin`

#### Flashing with uPyCraft
1. Select BurnFirmware  
![Burn Firmware Option](assets/burn-firmware.png?raw=true)

2. Enter the following settings in the popup (your port will differ as well as firmware name)  
![Updating Firmware](assets/update-firmware.png?raw=true)

3. Wait for the burn to complete  
![Burning Progress](assets/burn-progress.png?raw=true)

### Uploading Program

1. Open the uPyCraft IDE

2. Ensure that the board is set to ESP32  
![Board Setting](assets/upycraft-board.png?raw=true)

3. Under serial, select the same port as you found your board to be on before  
![Serial Setting](assets/upycraft-serial.png?raw=true)

4. If all is well, you should see a terminal at the bottom with >>>  
![uPyCraft IDE](assets/upycraft-home.png?raw=true)

5. Enter your wifi password in the utils.py file  
![utils.py](assets/utils-py.png?raw=true)

6. Save that file and drag and drop it onto the 'device' on the left, once you have done that it should upload to the board  
![utils download](assets/utils-download.png?raw=true)

7. Next we open the main.py file and update the WIFI_SSID to the name of your network and update the JUKEBOX_IP to the local IP of the julebox we [found earlier] TODODODODODODODO  
![IP](assets/main-ip.png?raw=true)

8. Upload that file using the 'play' button on the right  
![Upload Main](assets/upycraft-play.png?raw=true)  
![Upload Main](assets/main-upload.png?raw=true)

## Wiring
Note: when wiring up the boards, *especially* if soldering, please ensure that all power sources are disconnected

### ESP32 Wiring Diagram
![ESP32 Wiring Diagram](assets/esp32-circuit.png?raw=true)  
[Circuit Link](https://www.circuit-diagram.org/circuits/c1606980)

### Pi Wiring Diagram
![Raspberry Pi Wiring Diagram](assets/pi-circuit.png?raw=true)  
[Circuit Link](https://www.circuit-diagram.org/circuits/e828d5e3)


# How to Contribute
If you wanna contribute to this project, great! If you want to collaborate or have any questions, please feel free to [get in touch](#contact) and we can work something out, otherwise you can make [make a pull request](https://help.github.com/en/articles/creating-a-pull-request) for me to merge any small changes you'd like to make.


# Contact
Any enquiries feel free to contact me on: [brent.schuetze@anu.edu.au](mailto:brent.schuetze@anu.edu.au)


# Other Media
Find my blogposts on the build over at the [China Study Tour](https://cs.anu.edu.au/courses/china-study-tour/news/#brent-schuetze) website  
My [YouTube Channel](https://www.youtube.com/channel/UCcbzaG6yzkxIH_NWM2gUyig)


# License
This software is released uner the [MIT License](LICENSE.md)

Used Libraries and other sources:  
* [Spotify Developer Terms of Service](https://developer.spotify.com/terms/)
* p5.js was created by [Lauren McCarthy](http://lauren-mccarthy.com/) and is developed by a community of collaborators, with support from the [Processing Foundation](http://processing.org/foundation/) and [NYU ITP](http://itp.nyu.edu/itp/)
* [Node.js license](https://raw.githubusercontent.com/nodejs/node/master/LICENSE)
* [NPM Terms of use](https://www.npmjs.com/policies/terms)
* [Python paho MQTT](https://pypi.org/project/paho-mqtt/), "License: OSI Approved"




does it say how to contact you?  
is there an opportunity for others to contribute—and an explanation for how they might get involved?  