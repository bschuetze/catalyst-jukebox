#include <Arduino.h>

long ID;

void setup() {
  // Baudrate, defines bits per second possible to transfer bia serial
  Serial.begin(9600);
  Serial.println(""); // Purge the buffer

  ID = random(99999999);
  Serial.println(ID);
  
  pinMode(5, OUTPUT);
  digitalWrite(5, 0);
}

void loop() {
  delay(1000);
  int pinState = digitalRead(5);
  Serial.println(pinState);
  pinState = abs(pinState - 1);
  digitalWrite(5, pinState);
  Serial.println(pinState);
}