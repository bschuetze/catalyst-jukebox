#include <Arduino.h>
#include "SimpleBLE.h"

#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
#error Bluetooth is not enabled! Please run `make menuconfig` to and enable it
#endif

SimpleBLE ble;
long ID;
String NAME;

void setup() {
  // Baudrate, defines bits per second possible to transfer bia serial
  Serial.begin(9600);
  Serial.println(""); // Purge the buffer

  ID = random(99999999);
  Serial.println(ID);

  NAME = "catalyst-pager_";
  NAME = NAME + ID;
  Serial.print(NAME);
  ble.begin(NAME);

  pinMode(5, OUTPUT);
  digitalWrite(5, 0);
}

void loop() {
  delay(1000);
  int pinState = digitalRead(5);
  pinState = abs(pinState - 1);
  digitalWrite(5, pinState);
}