# Bond-Track
BondTrack is a BLE-based child safety and location tracking system using ESP32, RSSI monitoring, GPS, Wi-Fi, Supabase, and Firebase Cloud Messaging (FCM) to detect disconnections, report location, and notify parents.
# BondTrack — BLE-Based Child Safety and Location Tracking System

## Overview

BondTrack is a smart child safety system designed to help parents detect when their child moves out of Bluetooth communication range. The system uses ESP32 devices and Bluetooth Low Energy (BLE) to monitor connectivity between the parent and child units. Received Signal Strength Indicator (RSSI) measurements help assess Bluetooth signal strength and proximity changes.

When a disconnection is detected, the child device activates its built-in blue LED and repeatedly sounds a buzzer until the BLE connection is restored. The child device also obtains GPS coordinates and attempts to upload location information through Wi-Fi to a cloud backend. Supabase Edge Functions process location events and integrate with Firebase Cloud Messaging (FCM) to deliver push notifications to linked parent phones.

When the parent device comes back within communication range and the BLE connection is restored, both devices stop the ongoing alarm after a short delay and sound two confirmation beeps.

## Key Features

- **BLE connectivity monitoring:** Monitors the connection between the parent and child ESP32 devices.
- **RSSI-based signal monitoring:** Uses received Bluetooth signal strength to assess link quality.
- **Audio and visual alerts:** Activates the built-in blue LED and repeatedly sounds a buzzer when disconnection is detected.
- **Automatic reconnection indication:** Produces two confirmation beeps when the BLE connection is restored.
- **GPS location tracking:** Obtains geographical coordinates using a GPS module.
- **Wi-Fi-based cloud communication:** Uploads location data when Wi-Fi and Internet connectivity are available.
- **Cloud backend integration:** Uses Supabase and Supabase Edge Functions to process location events.
- **Push notifications:** Uses Firebase Cloud Messaging (FCM) to notify linked parent phones.
- **Periodic location updates:** Sends subsequent location updates at three-minute intervals, subject to GPS and network availability.

## Technologies Used

- ESP32 microcontrollers
- Bluetooth Low Energy (BLE)
- Received Signal Strength Indicator (RSSI)
- GPS module
- Wi-Fi
- Supabase
- Supabase Edge Functions
- Firebase Cloud Messaging (FCM)

## Working Principle

1. The parent and child ESP32 devices communicate over BLE.
2. The system monitors BLE connectivity and received signal strength.
3. When a disconnection is detected, the child device turns on its built-in blue LED and repeatedly sounds the buzzer.
4. The child device obtains GPS coordinates and attempts to upload its location through Wi-Fi.
5. Supabase processes the location event, and the notification backend uses FCM to send alerts to linked parent phones.
6. Subsequent location updates are sent every three minutes when the required GPS and network connections are available.
7. When BLE connectivity is restored, both devices stop the ongoing buzzer alarm after a short delay and sound two confirmation beeps.

## Project Objective

The objective of BondTrack is to provide an affordable, practical child safety solution that combines local proximity monitoring, immediate device-level alerts, GPS-based location reporting, and cloud-connected mobile notifications.

## Limitations

- Fresh cloud location updates require usable GPS reception and Wi-Fi Internet connectivity.
- RSSI can fluctuate due to walls, obstacles, interference, and body movement, so it does not provide precise distance measurements.
- GPS accuracy and availability may be reduced indoors or in obstructed environments.
- Bluetooth monitoring is limited by the communication range and behavior of the implemented BLE connection logic.

## Future Enhancements

Potential future improvements include offline location buffering, more robust reconnection filtering, improved battery-life optimization, and additional location-history and safety features in the parent application.
