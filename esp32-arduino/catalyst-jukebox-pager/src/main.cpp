#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

int scanTime = 8; //In seconds
BLEScan *pBLEScan;

long ID;
String NAME;

class MyAdvertisedDeviceCallbacks : public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice advertisedDevice) {
    Serial.printf("Advertised Device: %s \n", advertisedDevice.toString().c_str());
  }
};

void setup() {
  // Baudrate, defines bits per second possible to transfer bia serial
  Serial.begin(9600);
  Serial.println(""); // Purge the buffer

  ID = random(99999999);
  Serial.println(ID);

  NAME = "catalyst-pager_";
  NAME = NAME + ID;
  Serial.print(NAME);

  pinMode(5, OUTPUT);
  digitalWrite(5, 0);

  BLEDevice::init(NAME);
  pBLEScan = BLEDevice::getScan(); //create new scan
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  pBLEScan->setActiveScan(true); //active scan uses more power, but get results faster
  pBLEScan->setInterval(100);
  pBLEScan->setWindow(99); // less or equal setInterval value
}

void loop() {
  BLEScanResults foundDevices = pBLEScan->start(scanTime, false);
  Serial.print("Devices found: ");
  Serial.println(foundDevices.getCount());
  Serial.println("Scan done!");
  pBLEScan->clearResults(); // delete results fromBLEScan buffer to release memory

  int pinState = digitalRead(5);
  pinState = abs(pinState - 1);
  digitalWrite(5, pinState);
  delay(1000);
}