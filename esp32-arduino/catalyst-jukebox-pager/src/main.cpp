#include <Arduino.h>

void setup() {
  // Baudrate, defines bits per second possible to transfer bia serial
  Serial.begin(9600);
  pinMode(5, OUTPUT);
}

void loop() {
  delay(1000);
  int pinState = digitalRead(5);
  Serial.println(pinState);
  pinState = abs(pinState - 1);
  digitalWrite(5, pinState);
  Serial.println(pinState);
}