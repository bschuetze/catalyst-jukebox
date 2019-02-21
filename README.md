![Catalyst Jukebox Banner](assets/catalyst.png?raw=true)

# Catalyst Jukebox
A modern jukebox with a focus on social interactions







does it clearly say what your artefact is and why people should care?  
does it include any visual elements? (screenshots, diagrams or videos are great to grab people’s attention)  
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
    * Protoboard or Breadboard etc.
    * Some way to connect everything (wires, solder, jumper cables, hearders etc.)


## Wiring

### ESP32 Wiring Diagram
![ESP32 Wiring Diagram](assets/esp32-circuit.png?raw=true)  
[Circuit Link](https://www.circuit-diagram.org/circuits/c1606980)

### Pi Wiring Diagram
![Raspberry Pi Wiring Diagram](assets/pi-circuit.png?raw=true)  
[Circuit Link](https://www.circuit-diagram.org/circuits/e828d5e3)


# How to Contribute
If you wanna contribute to this project, great! If you want to collaborate or have any questions, please feel free to [get in touch](#contact) and we can work something out, otherwise you can make [make a pull request](https://help.github.com/en/articles/creating-a-pull-request) for me to merge any small changes you'd like to make.

# Other Media
Find my blogposts on the build over at the [China Study Tour](https://cs.anu.edu.au/courses/china-study-tour/news/#brent-schuetze) website  
My [YouTube Channel](https://www.youtube.com/channel/UCcbzaG6yzkxIH_NWM2gUyig)


# Contact
Any enquiries feel free to contact me on: [brent.schuetze@anu.edu.au](mailto:brent.schuetze@anu.edu.au)





does it say how to contact you?  
is there an opportunity for others to contribute—and an explanation for how they might get involved?  