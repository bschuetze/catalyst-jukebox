import paho.mqtt.client as mqtt

GLOBAL_TOPIC = "catalyst-jukebox_global"
PAGER_TOPICS = []
CLIENT_ID = "catalyst-jukebox_MAIN"


def on_connect(client, userdata, flags, rc):
    print("Connection returned result: " + mqtt.connack_string(rc))
    client.subscribe(GLOBAL_TOPIC)

def on_subscribe(client, userdata, mid, granted_qos):
    print("Test")

def on_disconnect(client, userdata, rc):
    print("Disconnection returned result: " + str(rc))

def on_message(client, userdata, msg):
    print(msg.topic+" "+str(msg.payload))


client = mqtt.Client(client_id=CLIENT_ID)
client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.on_subscribe = on_subscribe
client.on_message = on_message

client.connect("192.168.0.5", 1883, 60)

# Blocking call that processes network traffic, dispatches callbacks and
# handles reconnecting.
# Other loop*() functions are available that give a threaded interface and a
# manual interface.
client.loop_forever()

count = 0
while True:
    count = count + 1
